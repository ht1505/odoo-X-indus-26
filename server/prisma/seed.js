const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Warehouses
  const mainWarehouse = await prisma.warehouse.create({
    data: { name: 'Main Warehouse', address: 'Plot 1, Industrial Area, Ahmedabad' }
  });
  const secondaryWarehouse = await prisma.warehouse.create({
    data: { name: 'Secondary Warehouse', address: 'Plot 2, Storage Zone, Ahmedabad' }
  });
  const coldWarehouse = await prisma.warehouse.create({
    data: { name: 'Cold Storage Warehouse', address: 'Plot 3, Refrigeration Zone, Ahmedabad' }
  });

  // Locations
  const rackA = await prisma.location.create({ data: { name: 'Rack A', warehouseId: mainWarehouse.id } });
  const rackB = await prisma.location.create({ data: { name: 'Rack B', warehouseId: mainWarehouse.id } });
  const productionFloor = await prisma.location.create({ data: { name: 'Production Floor', warehouseId: mainWarehouse.id } });
  const dispatch = await prisma.location.create({ data: { name: 'Dispatch Area', warehouseId: mainWarehouse.id } });
  const rackC = await prisma.location.create({ data: { name: 'Rack C', warehouseId: secondaryWarehouse.id } });
  const rackD = await prisma.location.create({ data: { name: 'Rack D', warehouseId: secondaryWarehouse.id } });
  const coldRoom1 = await prisma.location.create({ data: { name: 'Cold Room 1', warehouseId: coldWarehouse.id } });

  // Categories
  const rawMat = await prisma.category.create({ data: { name: 'Raw Materials' } });
  const finGoods = await prisma.category.create({ data: { name: 'Finished Goods' } });
  const packaging = await prisma.category.create({ data: { name: 'Packaging' } });
  const spareParts = await prisma.category.create({ data: { name: 'Spare Parts' } });
  const electronics = await prisma.category.create({ data: { name: 'Electronics' } });
  const chemicals = await prisma.category.create({ data: { name: 'Chemicals' } });

  // Suppliers
  const s1 = await prisma.supplier.create({ data: { name: 'Steel Suppliers Co', contact: '9876543210' } });
  const s2 = await prisma.supplier.create({ data: { name: 'Packaging World', contact: '9123456789' } });
  const s3 = await prisma.supplier.create({ data: { name: 'Parts Direct', contact: '9988776655' } });
  const s4 = await prisma.supplier.create({ data: { name: 'ElectroTech India', contact: '9876001234' } });
  const s5 = await prisma.supplier.create({ data: { name: 'ChemSource Ltd', contact: '9900112233' } });
  const s6 = await prisma.supplier.create({ data: { name: 'Global Raw Materials', contact: '9812345678' } });

  // Products (20 products)
  const p1  = await prisma.product.create({ data: { name: 'Steel Rods',         sku: 'STL-001', categoryId: rawMat.id,    unit: 'kg',    reorderLevel: 20  } });
  const p2  = await prisma.product.create({ data: { name: 'Steel Sheets',        sku: 'STL-002', categoryId: rawMat.id,    unit: 'kg',    reorderLevel: 15  } });
  const p3  = await prisma.product.create({ data: { name: 'Aluminum Bars',       sku: 'ALU-001', categoryId: rawMat.id,    unit: 'kg',    reorderLevel: 25  } });
  const p4  = await prisma.product.create({ data: { name: 'Copper Wire',         sku: 'COP-001', categoryId: rawMat.id,    unit: 'kg',    reorderLevel: 10  } });
  const p5  = await prisma.product.create({ data: { name: 'Finished Chairs',     sku: 'FIN-001', categoryId: finGoods.id,  unit: 'units', reorderLevel: 5   } });
  const p6  = await prisma.product.create({ data: { name: 'Finished Tables',     sku: 'FIN-002', categoryId: finGoods.id,  unit: 'units', reorderLevel: 3   } });
  const p7  = await prisma.product.create({ data: { name: 'Steel Cabinet',       sku: 'FIN-003', categoryId: finGoods.id,  unit: 'units', reorderLevel: 5   } });
  const p8  = await prisma.product.create({ data: { name: 'Cardboard Box',       sku: 'PKG-001', categoryId: packaging.id, unit: 'units', reorderLevel: 50  } });
  const p9  = await prisma.product.create({ data: { name: 'Bubble Wrap Roll',    sku: 'PKG-002', categoryId: packaging.id, unit: 'units', reorderLevel: 30  } });
  const p10 = await prisma.product.create({ data: { name: 'Packing Tape',        sku: 'PKG-003', categoryId: packaging.id, unit: 'units', reorderLevel: 40  } });
  const p11 = await prisma.product.create({ data: { name: 'Bolt Set',            sku: 'SPR-001', categoryId: spareParts.id,unit: 'units', reorderLevel: 30  } });
  const p12 = await prisma.product.create({ data: { name: 'Motor Part X',        sku: 'SPR-002', categoryId: spareParts.id,unit: 'units', reorderLevel: 10  } });
  const p13 = await prisma.product.create({ data: { name: 'Bearing 6205',        sku: 'SPR-003', categoryId: spareParts.id,unit: 'units', reorderLevel: 20  } });
  const p14 = await prisma.product.create({ data: { name: 'Circuit Board A',     sku: 'ELC-001', categoryId: electronics.id,unit: 'units', reorderLevel: 15 } });
  const p15 = await prisma.product.create({ data: { name: 'Sensor Module',       sku: 'ELC-002', categoryId: electronics.id,unit: 'units', reorderLevel: 10 } });
  const p16 = await prisma.product.create({ data: { name: 'Power Supply 12V',    sku: 'ELC-003', categoryId: electronics.id,unit: 'units', reorderLevel: 8  } });
  const p17 = await prisma.product.create({ data: { name: 'Industrial Solvent',  sku: 'CHM-001', categoryId: chemicals.id, unit: 'liters', reorderLevel: 20 } });
  const p18 = await prisma.product.create({ data: { name: 'Lubricant Oil',       sku: 'CHM-002', categoryId: chemicals.id, unit: 'liters', reorderLevel: 15 } });
  const p19 = await prisma.product.create({ data: { name: 'Welding Rod',         sku: 'STL-003', categoryId: rawMat.id,    unit: 'units', reorderLevel: 50  } });
  const p20 = await prisma.product.create({ data: { name: 'Paint (Grey)',         sku: 'CHM-003', categoryId: chemicals.id, unit: 'liters', reorderLevel: 10 } });

  // Stock
  const stockData = [
    { productId: p1.id,  locationId: rackA.id,         quantity: 100 },
    { productId: p2.id,  locationId: rackA.id,         quantity: 80  },
    { productId: p3.id,  locationId: rackA.id,         quantity: 60  },
    { productId: p4.id,  locationId: rackB.id,         quantity: 8   }, // low stock
    { productId: p5.id,  locationId: productionFloor.id, quantity: 25 },
    { productId: p6.id,  locationId: productionFloor.id, quantity: 2  }, // low stock
    { productId: p7.id,  locationId: dispatch.id,      quantity: 10  },
    { productId: p8.id,  locationId: rackC.id,         quantity: 200 },
    { productId: p9.id,  locationId: rackC.id,         quantity: 25  }, // low stock
    { productId: p10.id, locationId: rackC.id,         quantity: 35  }, // low stock
    { productId: p11.id, locationId: rackB.id,         quantity: 150 },
    { productId: p12.id, locationId: rackB.id,         quantity: 40  },
    { productId: p13.id, locationId: rackD.id,         quantity: 5   }, // low stock
    { productId: p14.id, locationId: rackD.id,         quantity: 0   }, // out of stock
    { productId: p15.id, locationId: rackD.id,         quantity: 12  },
    { productId: p16.id, locationId: rackD.id,         quantity: 0   }, // out of stock
    { productId: p17.id, locationId: coldRoom1.id,     quantity: 45  },
    { productId: p18.id, locationId: coldRoom1.id,     quantity: 30  },
    { productId: p19.id, locationId: rackA.id,         quantity: 120 },
    { productId: p20.id, locationId: coldRoom1.id,     quantity: 8   }, // low stock
  ];

  for (const stock of stockData) {
    await prisma.stock.create({ data: stock });
  }

  // Create a dummy user for operations
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@coreinventory.com', passwordHash: hashedPassword, role: 'STAFF' }
  });

  // Receipts (5 receipts)
  const rec1 = await prisma.receipt.create({
    data: {
      reference: 'REC-001', supplierId: s1.id, locationId: rackA.id,
      status: 'DONE', createdById: adminUser.id, validatedAt: new Date(),
      lines: { create: [
        { productId: p1.id, expectedQty: 100, receivedQty: 100 },
        { productId: p2.id, expectedQty: 80,  receivedQty: 80  },
      ]}
    }
  });
  await prisma.receipt.create({
    data: {
      reference: 'REC-002', supplierId: s4.id, locationId: rackD.id,
      status: 'DRAFT', createdById: adminUser.id,
      lines: { create: [
        { productId: p14.id, expectedQty: 20, receivedQty: null },
        { productId: p15.id, expectedQty: 15, receivedQty: null },
      ]}
    }
  });
  await prisma.receipt.create({
    data: {
      reference: 'REC-003', supplierId: s2.id, locationId: rackC.id,
      status: 'READY', createdById: adminUser.id,
      lines: { create: [
        { productId: p8.id, expectedQty: 100, receivedQty: null },
        { productId: p9.id, expectedQty: 50,  receivedQty: null },
      ]}
    }
  });
  await prisma.receipt.create({
    data: {
      reference: 'REC-004', supplierId: s6.id, locationId: rackA.id,
      status: 'WAITING', createdById: adminUser.id,
      lines: { create: [
        { productId: p3.id, expectedQty: 50, receivedQty: null },
        { productId: p4.id, expectedQty: 30, receivedQty: null },
      ]}
    }
  });
  await prisma.receipt.create({
    data: {
      reference: 'REC-005', supplierId: s5.id, locationId: coldRoom1.id,
      status: 'DONE', createdById: adminUser.id, validatedAt: new Date(),
      lines: { create: [
        { productId: p17.id, expectedQty: 45, receivedQty: 45 },
        { productId: p18.id, expectedQty: 30, receivedQty: 30 },
      ]}
    }
  });

  // Deliveries (5 deliveries)
  await prisma.delivery.create({
    data: {
      reference: 'DEL-001', locationId: dispatch.id, customerName: 'Tata Steel Ltd',
      status: 'DONE', createdById: adminUser.id, validatedAt: new Date(),
      lines: { create: [
        { productId: p5.id, orderedQty: 10, deliveredQty: 10 },
      ]}
    }
  });
  await prisma.delivery.create({
    data: {
      reference: 'DEL-002', locationId: dispatch.id, customerName: 'Reliance Industries',
      status: 'READY', createdById: adminUser.id,
      lines: { create: [
        { productId: p6.id, orderedQty: 5, deliveredQty: null },
        { productId: p7.id, orderedQty: 3, deliveredQty: null },
      ]}
    }
  });
  await prisma.delivery.create({
    data: {
      reference: 'DEL-003', locationId: rackA.id, customerName: 'Mahindra & Mahindra',
      status: 'DRAFT', createdById: adminUser.id,
      lines: { create: [
        { productId: p1.id, orderedQty: 20, deliveredQty: null },
      ]}
    }
  });
  await prisma.delivery.create({
    data: {
      reference: 'DEL-004', locationId: rackD.id, customerName: 'Infosys Ltd',
      status: 'WAITING', createdById: adminUser.id,
      lines: { create: [
        { productId: p15.id, orderedQty: 5, deliveredQty: null },
      ]}
    }
  });
  await prisma.delivery.create({
    data: {
      reference: 'DEL-005', locationId: rackC.id, customerName: 'Flipkart Logistics',
      status: 'DONE', createdById: adminUser.id, validatedAt: new Date(),
      lines: { create: [
        { productId: p8.id, orderedQty: 50, deliveredQty: 50 },
        { productId: p10.id, orderedQty: 20, deliveredQty: 20 },
      ]}
    }
  });

  // Transfers (3 transfers)
  await prisma.transfer.create({
    data: {
      reference: 'TRF-001', fromLocationId: rackA.id, toLocationId: productionFloor.id,
      status: 'DONE', createdById: adminUser.id, validatedAt: new Date(),
      lines: { create: [
        { productId: p1.id, quantity: 20 },
      ]}
    }
  });
  await prisma.transfer.create({
    data: {
      reference: 'TRF-002', fromLocationId: rackC.id, toLocationId: rackD.id,
      status: 'DRAFT', createdById: adminUser.id,
      lines: { create: [
        { productId: p8.id, quantity: 30 },
      ]}
    }
  });
  await prisma.transfer.create({
    data: {
      reference: 'TRF-003', fromLocationId: rackB.id, toLocationId: dispatch.id,
      status: 'READY', createdById: adminUser.id,
      lines: { create: [
        { productId: p11.id, quantity: 50 },
      ]}
    }
  });

  // Adjustments (2 adjustments)
  await prisma.adjustment.create({
    data: {
      reference: 'ADJ-001', locationId: rackA.id, reason: 'Physical count mismatch',
      status: 'DONE', createdById: adminUser.id, validatedAt: new Date(),
      lines: { create: [
        { productId: p2.id, recordedQty: 85, actualQty: 80 },
      ]}
    }
  });
  await prisma.adjustment.create({
    data: {
      reference: 'ADJ-002', locationId: rackD.id, reason: 'Damaged items removed',
      status: 'DRAFT', createdById: adminUser.id,
      lines: { create: [
        { productId: p13.id, recordedQty: 8, actualQty: 5 },
      ]}
    }
  });

  // Stock Ledger entries
  const ledgerEntries = [
    { productId: p1.id,  locationId: rackA.id,  movementType: 'receipt',   reference: 'REC-001', quantityChange: 100, quantityAfter: 100, createdById: adminUser.id },
    { productId: p2.id,  locationId: rackA.id,  movementType: 'receipt',   reference: 'REC-001', quantityChange: 80,  quantityAfter: 80,  createdById: adminUser.id },
    { productId: p17.id, locationId: coldRoom1.id, movementType: 'receipt', reference: 'REC-005', quantityChange: 45, quantityAfter: 45,  createdById: adminUser.id },
    { productId: p18.id, locationId: coldRoom1.id, movementType: 'receipt', reference: 'REC-005', quantityChange: 30, quantityAfter: 30,  createdById: adminUser.id },
    { productId: p5.id,  locationId: dispatch.id, movementType: 'delivery', reference: 'DEL-001', quantityChange: -10, quantityAfter: 25, createdById: adminUser.id },
    { productId: p1.id,  locationId: rackA.id,  movementType: 'transfer_out', reference: 'TRF-001', quantityChange: -20, quantityAfter: 80, createdById: adminUser.id },
    { productId: p1.id,  locationId: productionFloor.id, movementType: 'transfer_in', reference: 'TRF-001', quantityChange: 20, quantityAfter: 20, createdById: adminUser.id },
    { productId: p2.id,  locationId: rackA.id,  movementType: 'adjustment', reference: 'ADJ-001', quantityChange: -5, quantityAfter: 80, createdById: adminUser.id },
  ];

  for (const entry of ledgerEntries) {
    await prisma.stockLedger.create({ data: entry });
  }

  console.log('✅ Seed data inserted successfully!');
  console.log('📦 20 products, 3 warehouses, 7 locations, 6 suppliers');
  console.log('📋 5 receipts, 5 deliveries, 3 transfers, 2 adjustments');
  console.log('📊 8 stock ledger entries');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });