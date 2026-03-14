const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllDeliveries = async (req, res, next) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        location: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(deliveries);
  } catch (error) {
    next(error);
  }
};

const createDelivery = async (req, res, next) => {
  const { locationId, customerName, lines } = req.body;
  const createdById = req.user.userId;

  try {
    const lastDelivery = await prisma.delivery.findFirst({
      orderBy: { id: 'desc' },
    });
    const newId = lastDelivery ? lastDelivery.id + 1 : 1;
    const reference = `DEL-${String(newId).padStart(3, '0')}`;

    const newDelivery = await prisma.delivery.create({
      data: {
        reference,
        locationId,
        customerName,
        createdById,
        status: 'DRAFT',
        lines: {
          create: lines.map(line => ({
            productId: line.productId,
            orderedQty: line.orderedQty,
          })),
        },
      },
      include: {
        lines: true,
      },
    });
    res.status(201).json(newDelivery);
  } catch (error) {
    next(error);
  }
};

const validateDelivery = async (req, res, next) => {
  const { id } = req.params;
  const { lines } = req.body; // Expects deliveredQty
  const userId = req.user.userId;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(id) },
      include: { lines: true },
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const transactionOperations = await Promise.all(lines.map(async (line) => {
      const deliveryLine = delivery.lines.find(l => l.id === line.id);
      if (!deliveryLine) throw new Error(`Delivery line ${line.id} not found.`);
      
      const stock = await prisma.stock.findUnique({
        where: { productId_locationId: { productId: deliveryLine.productId, locationId: delivery.locationId } },
      });

      if (!stock || stock.quantity < line.deliveredQty) {
        throw new Error(`Not enough stock for product ${deliveryLine.productId}`);
      }

      const stockUpdate = prisma.stock.update({
        where: { productId_locationId: { productId: deliveryLine.productId, locationId: delivery.locationId } },
        data: { quantity: { decrement: line.deliveredQty } },
      });

      const ledgerEntry = prisma.stockLedger.create({
        data: {
          productId: deliveryLine.productId,
          locationId: delivery.locationId,
          movementType: 'delivery',
          reference: delivery.reference,
          quantityChange: -line.deliveredQty,
          quantityAfter: stock.quantity - line.deliveredQty,
          createdById: userId,
        },
      });

      const deliveryLineUpdate = prisma.deliveryLine.update({
          where: { id: line.id },
          data: { deliveredQty: line.deliveredQty }
      });

      return [stockUpdate, ledgerEntry, deliveryLineUpdate];
    }));

    const updateDeliveryStatus = prisma.delivery.update({
      where: { id: parseInt(id) },
      data: { status: 'DONE', validatedAt: new Date() },
    });

    await prisma.$transaction([...transactionOperations.flat(), updateDeliveryStatus]);

    res.json({ message: 'Delivery validated successfully' });
  } catch (error) {
    next(error);
  }
};

const cancelDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.delivery.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELED' },
    });
    res.json({ message: 'Delivery canceled' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDeliveries,
  createDelivery,
  validateDelivery,
  cancelDelivery,
};
