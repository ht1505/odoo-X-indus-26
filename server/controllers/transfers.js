const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllTransfers = async (req, res, next) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromLocation: true,
        toLocation: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(transfers);
  } catch (error) {
    next(error);
  }
};

const createTransfer = async (req, res, next) => {
  const { fromLocationId, toLocationId, lines } = req.body;
  const createdById = req.user.userId;

  try {
    const lastTransfer = await prisma.transfer.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastTransfer ? lastTransfer.id + 1 : 1;
    const reference = `TRF-${String(newId).padStart(3, '0')}`;

    const newTransfer = await prisma.transfer.create({
      data: {
        reference,
        fromLocationId,
        toLocationId,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        },
      },
      include: {
        lines: true,
      },
    });
    res.status(201).json(newTransfer);
  } catch (error) {
    next(error);
  }
};

const validateTransfer = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: parseInt(id) },
      include: { lines: true },
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    const transactionOperations = await Promise.all(transfer.lines.map(async (line) => {
      const fromStock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: line.productId, locationId: transfer.fromLocationId } },
      });

      if (!fromStock || fromStock.quantity < line.quantity) {
        throw new Error(`Not enough stock for product ${line.productId} at source location.`);
      }
      
      const toStock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: line.productId, locationId: transfer.toLocationId } },
      });

      const fromStockUpdate = prisma.stock.update({
        where: { productId_locationId: { productId: line.productId, locationId: transfer.fromLocationId } },
        data: { quantity: { decrement: line.quantity } },
      });

      const toStockUpdate = prisma.stock.upsert({
        where: { productId_locationId: { productId: line.productId, locationId: transfer.toLocationId } },
        update: { quantity: { increment: line.quantity } },
        create: {
          productId: line.productId,
          locationId: transfer.toLocationId,
          quantity: line.quantity,
        },
      });

      const fromLedger = prisma.stockLedger.create({
        data: {
          productId: line.productId,
          locationId: transfer.fromLocationId,
          movementType: 'transfer_out',
          reference: transfer.reference,
          quantityChange: -line.quantity,
          quantityAfter: fromStock.quantity - line.quantity,
          createdById: userId,
        },
      });

      const toLedger = prisma.stockLedger.create({
        data: {
          productId: line.productId,
          locationId: transfer.toLocationId,
          movementType: 'transfer_in',
          reference: transfer.reference,
          quantityChange: line.quantity,
          quantityAfter: (toStock ? toStock.quantity : 0) + line.quantity,
          createdById: userId,
        },
      });

      return [fromStockUpdate, toStockUpdate, fromLedger, toLedger];
    }));

    const updateTransferStatus = prisma.transfer.update({
      where: { id: parseInt(id) },
      data: { status: 'DONE', validatedAt: new Date() },
    });

    await prisma.$transaction([...transactionOperations.flat(), updateTransferStatus]);

    res.json({ message: 'Transfer validated successfully' });
  } catch (error) {
    next(error);
  }
};

const cancelTransfer = async (req, res, next) => {
    try {
      const { id } = req.params;
      await prisma.transfer.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELED' },
      });
      res.json({ message: 'Transfer canceled' });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  getAllTransfers,
  createTransfer,
  validateTransfer,
  cancelTransfer,
};
