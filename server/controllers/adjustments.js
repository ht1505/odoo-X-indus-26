const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAdjustments = async (req, res, next) => {
  try {
    const adjustments = await prisma.adjustment.findMany({
      include: {
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(adjustments);
  } catch (error) {
    next(error);
  }
};

const createAdjustment = async (req, res, next) => {
  const { locationId, reason, lines } = req.body;
  const createdById = req.user.userId;

  try {
    const lastAdjustment = await prisma.adjustment.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastAdjustment ? lastAdjustment.id + 1 : 1;
    const reference = `ADJ-${String(newId).padStart(3, '0')}`;

    const newAdjustment = await prisma.adjustment.create({
      data: {
        reference,
        locationId,
        reason,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: line.productId,
            recordedQty: line.recordedQty,
            actualQty: line.actualQty,
          })),
        },
      },
      include: {
        lines: true,
      },
    });
    res.status(201).json(newAdjustment);
  } catch (error) {
    next(error);
  }
};

const validateAdjustment = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const adjustment = await prisma.adjustment.findUnique({
      where: { id: parseInt(id) },
      include: { lines: true },
    });

    if (!adjustment) {
      return res.status(404).json({ message: 'Adjustment not found' });
    }

    const transactionOperations = await Promise.all(adjustment.lines.map(async (line) => {
      const stockUpdate = prisma.stock.upsert({
        where: { productId_locationId: { productId: line.productId, locationId: adjustment.locationId } },
        update: { quantity: line.actualQty },
        create: {
          productId: line.productId,
          locationId: adjustment.locationId,
          quantity: line.actualQty,
        },
      });

      const quantityChange = line.actualQty - line.recordedQty;
      const ledgerEntry = prisma.stockLedger.create({
        data: {
          productId: line.productId,
          locationId: adjustment.locationId,
          movementType: 'adjustment',
          reference: adjustment.reference,
          quantityChange: quantityChange,
          quantityAfter: line.actualQty,
          createdById: userId,
        },
      });

      return [stockUpdate, ledgerEntry];
    }));

    const updateAdjustmentStatus = prisma.adjustment.update({
      where: { id: parseInt(id) },
      data: { status: 'DONE', validatedAt: new Date() },
    });

    await prisma.$transaction([...transactionOperations.flat(), updateAdjustmentStatus]);

    res.json({ message: 'Adjustment validated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdjustments,
  createAdjustment,
  validateAdjustment,
};
