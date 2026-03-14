const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
      },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
      },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, categoryId, unitOfMeasure, reorderLevel } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId,
        unitOfMeasure,
        reorderLevel,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, categoryId, unitOfMeasure, reorderLevel } = req.body;
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        sku,
        categoryId,
        unitOfMeasure,
        reorderLevel,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const getLowStockProducts = async (req, res, next) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stocks: {
          some: {
            quantity: {
              lte: prisma.product.fields.reorderLevel,
            },
          },
        },
      },
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
      },
    });
    res.json(lowStockProducts);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  getLowStockProducts,
};
