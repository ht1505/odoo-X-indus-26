const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
    getAllSuppliers,
};
