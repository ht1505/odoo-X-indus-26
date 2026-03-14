const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, supplierController.getAllSuppliers);

module.exports = router;
