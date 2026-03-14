const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllReceipts = async (req, res, next) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        supplier: true,
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(receipts);
  } catch (error) {
    next(error);
  }
};

const createReceipt = async (req, res, next) => {
  const { supplierId, locationId, lines } = req.body;
  const createdById = req.user.userId;

  try {
    // Generate reference
    const lastReceipt = await prisma.receipt.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastReceipt ? lastReceipt.id + 1 : 1;
    const reference = `REC-${String(newId).padStart(3, '0')}`;

    const newReceipt = await prisma.receipt.create({
      data: {
        reference,
        supplierId,
        locationId,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: line.productId,
            expectedQty: line.expectedQty,
          })),
        },
      },
      include: {
        lines: true,
      },
    });
    res.status(201).json(newReceipt);
  } catch (error) {
    next(error);
  }
};

const validateReceipt = async (req, res, next) => {
  const { id } = req.params;
  const { lines } = req.body; // Assuming receivedQtys are sent in the body
  const userId = req.user.userId;

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(id) },
      include: { lines: true },
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const stockUpdates = lines.map(line => {
        const receiptLine = receipt.lines.find(l => l.id === line.id);
        return prisma.stock.upsert({
            where: { productId_locationId: { productId: receiptLine.productId, locationId: receipt.locationId } },
            update: { quantity: { increment: line.receivedQty } },
            create: {
                productId: receiptLine.productId,
                locationId: receipt.locationId,
                quantity: line.receivedQty,
            },
        });
    });

    const ledgerEntries = lines.map(async (line) => {
        const receiptLine = receipt.lines.find(l => l.id === line.id);
        const stock = await prisma.stock.findUnique({where: { productId_locationId: { productId: receiptLine.productId, locationId: receipt.locationId } }});
        return prisma.stockLedger.create({
            data: {
                productId: receiptLine.productId,
                locationId: receipt.locationId,
                movementType: 'receipt',
                reference: receipt.reference,
                quantityChange: line.receivedQty,
                quantityAfter: stock.quantity + line.receivedQty,
                createdById: userId,
            },
        });
    });
    
    const updateReceiptStatus = prisma.receipt.update({
      where: { id: parseInt(id) },
      data: { status: 'DONE', validatedAt: new Date() },
    });

    const updateReceiptLines = lines.map(line => {
        return prisma.receiptLine.update({
            where: {id: line.id},
            data: {receivedQty: line.receivedQty}
        })
    })


    await prisma.$transaction([...stockUpdates, ...updateReceiptLines, updateReceiptStatus, ...(await Promise.all(ledgerEntries))]);

    res.json({ message: 'Receipt validated successfully' });
  } catch (error) {
    next(error);
  }
};

const cancelReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.receipt.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELED' },
    });
    res.json({ message: 'Receipt canceled' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReceipts,
  createReceipt,
  validateReceipt,
  cancelReceipt,
};
