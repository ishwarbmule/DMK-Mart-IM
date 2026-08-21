import { PlasticProductItem } from '../types/erp';

export const INITIAL_PLASTICS_CATALOG: PlasticProductItem[] = [
  // 1. CHAIRS & STOOLS
  {
    id: 'p-01',
    sku: 'DMK-CHR-ROYAL',
    name: 'DMK Royal High-Back Arm Chair (Heavy Duty)',
    category: 'Chairs & Stools',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '94018000',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 2600,
    colorOptions: ['Teak Brown', 'Marble White', 'Midnight Black', 'Cobalt Blue'],
    stockQuantity: 450,
    damagedStock: 8,
    lowStockThreshold: 100,
    manufacturerName: 'Nilkamal Plastics Ltd',
    purchaseBaseCost: 310.00,
    companyId: 'comp-01',
    isPopular: true,
    pricing: {
      tier1_distributor: 380.00,
      tier2_wholesale: 420.00,
      tier3_semi_wholesale: 460.00,
      tier4_retailer: 510.00,
      tier5_mrp: 650.00
    }
  },
  {
    id: 'p-02',
    sku: 'DMK-CHR-ELEGANCE',
    name: 'DMK Elegance Medium-Back Plastic Chair',
    category: 'Chairs & Stools',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '94018000',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 2100,
    colorOptions: ['Rattan Beige', 'Forest Green', 'Chocolate Brown'],
    stockQuantity: 28, // Low Stock Trigger for demo
    damagedStock: 4,
    lowStockThreshold: 50,
    manufacturerName: 'Nilkamal Plastics Ltd',
    purchaseBaseCost: 235.00,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 290.00,
      tier2_wholesale: 320.00,
      tier3_semi_wholesale: 350.00,
      tier4_retailer: 390.00,
      tier5_mrp: 499.00
    }
  },
  {
    id: 'p-03',
    sku: 'DMK-STL-BATH20',
    name: 'DMK Premium Anti-Skid Bathroom Stool (Large)',
    category: 'Chairs & Stools',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 850,
    colorOptions: ['Pearl White', 'Ocean Blue', 'Ruby Red', 'Sunset Orange'],
    stockQuantity: 1200,
    damagedStock: 12,
    lowStockThreshold: 200,
    manufacturerName: 'Supreme Industries',
    purchaseBaseCost: 68.00,
    companyId: 'comp-01',
    isPopular: true,
    pricing: {
      tier1_distributor: 85.00,
      tier2_wholesale: 95.00,
      tier3_semi_wholesale: 105.00,
      tier4_retailer: 120.00,
      tier5_mrp: 160.00
    }
  },

  // 2. BUCKETS & BASINS
  {
    id: 'p-04',
    sku: 'DMK-BKT-20L-HD',
    name: 'DMK Heavy-Duty Plastic Bucket with Metal Handle (20 Litres)',
    category: 'Buckets & Basins',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 920,
    colorOptions: ['Translucent Blue', 'Opaque Red', 'Emerald Green', 'Silver Grey'],
    stockQuantity: 840,
    damagedStock: 6,
    lowStockThreshold: 150,
    manufacturerName: 'DMK In-House Plastics',
    purchaseBaseCost: 88.00,
    companyId: 'comp-01',
    isPopular: true,
    pricing: {
      tier1_distributor: 110.00,
      tier2_wholesale: 125.00,
      tier3_semi_wholesale: 140.00,
      tier4_retailer: 160.00,
      tier5_mrp: 220.00
    }
  },
  {
    id: 'p-05',
    sku: 'DMK-BKT-25L-TRAN',
    name: 'DMK Floral Print Transparent Bucket (25 Litres)',
    category: 'Buckets & Basins',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 1150,
    colorOptions: ['Frosted Rose', 'Frosted Aquamarine', 'Clear Amber'],
    stockQuantity: 15, // Low Stock Trigger for demo
    damagedStock: 2,
    lowStockThreshold: 40,
    manufacturerName: 'DMK In-House Plastics',
    purchaseBaseCost: 115.00,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 145.00,
      tier2_wholesale: 165.00,
      tier3_semi_wholesale: 185.00,
      tier4_retailer: 210.00,
      tier5_mrp: 280.00
    }
  },
  {
    id: 'p-06',
    sku: 'DMK-BSN-18INCH',
    name: 'DMK Deep Multipurpose Ribbed Basin (18 Inch)',
    category: 'Buckets & Basins',
    material: 'High-Density Polyethylene (HDPE)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 640,
    colorOptions: ['Steel Grey', 'Brick Red', 'Royal Blue'],
    stockQuantity: 950,
    damagedStock: 3,
    lowStockThreshold: 100,
    manufacturerName: 'Supreme Industries',
    purchaseBaseCost: 58.00,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 72.00,
      tier2_wholesale: 82.00,
      tier3_semi_wholesale: 92.00,
      tier4_retailer: 105.00,
      tier5_mrp: 140.00
    }
  },

  // 3. KITCHEN STORAGE & JARS
  {
    id: 'p-07',
    sku: 'DMK-JAR-6PC-SET',
    name: 'DMK Airtight Modular Kitchen Container Set (6 Pcs / 1.2L)',
    category: 'Kitchen Storage & Jars',
    material: 'Food Grade Plastic',
    hsnCode: '39241010',
    gstRate: 12,
    unitOfMeasure: 'Set',
    weightGrams: 780,
    colorOptions: ['Clear with Teal Lid', 'Clear with Grey Lid', 'Clear with Coral Lid'],
    stockQuantity: 320,
    damagedStock: 5,
    lowStockThreshold: 60,
    manufacturerName: 'Cello Polymer Solutions',
    purchaseBaseCost: 175.00,
    companyId: 'comp-01',
    isPopular: true,
    pricing: {
      tier1_distributor: 220.00,
      tier2_wholesale: 250.00,
      tier3_semi_wholesale: 280.00,
      tier4_retailer: 320.00,
      tier5_mrp: 425.00
    }
  },
  {
    id: 'p-08',
    sku: 'DMK-DRUM-50L-STG',
    name: 'DMK Heavy Grain Storage Drum with Threaded Lid (50 Litres)',
    category: 'Kitchen Storage & Jars',
    material: 'Food Grade Plastic',
    hsnCode: '39233090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 2800,
    colorOptions: ['Natural White', 'Milky Cream'],
    stockQuantity: 180,
    damagedStock: 1,
    lowStockThreshold: 40,
    manufacturerName: 'DMK In-House Plastics',
    purchaseBaseCost: 380.00,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 480.00,
      tier2_wholesale: 540.00,
      tier3_semi_wholesale: 600.00,
      tier4_retailer: 680.00,
      tier5_mrp: 890.00
    }
  },

  // 4. CRATES & INDUSTRIAL
  {
    id: 'p-09',
    sku: 'DMK-CRT-IND-JUMBO',
    name: 'DMK Heavy-Duty Perforated Vegetable & Milk Crate (600x400x325mm)',
    category: 'Crates & Industrial',
    material: 'High-Density Polyethylene (HDPE)',
    hsnCode: '39231090',
    gstRate: 18,
    unitOfMeasure: 'Crate (24 Pcs)',
    weightGrams: 2400,
    colorOptions: ['Industrial Red', 'Industrial Blue', 'Industrial Green'],
    stockQuantity: 1400,
    damagedStock: 18,
    lowStockThreshold: 250,
    manufacturerName: 'Supreme Industries',
    purchaseBaseCost: 310.00,
    companyId: 'comp-01',
    isPopular: true,
    pricing: {
      tier1_distributor: 390.00,
      tier2_wholesale: 430.00,
      tier3_semi_wholesale: 475.00,
      tier4_retailer: 530.00,
      tier5_mrp: 680.00
    }
  },
  {
    id: 'p-10',
    sku: 'DMK-PAL-IND-4WAY',
    name: 'DMK 4-Way Entry Heavy Industrial Plastic Pallet (1200x1000mm)',
    category: 'Crates & Industrial',
    material: 'High-Density Polyethylene (HDPE)',
    hsnCode: '39239090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 14500,
    colorOptions: ['Pitch Black', 'Dark Grey'],
    stockQuantity: 8, // Critical Low Stock for demo
    damagedStock: 0,
    lowStockThreshold: 25,
    manufacturerName: 'Supreme Industries',
    purchaseBaseCost: 1950.00,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 2450.00,
      tier2_wholesale: 2700.00,
      tier3_semi_wholesale: 2950.00,
      tier4_retailer: 3250.00,
      tier5_mrp: 4200.00
    }
  },

  // 5. CLEANING & DUSTBINS
  {
    id: 'p-11',
    sku: 'DMK-BIN-PEDAL-30L',
    name: 'DMK Stainless Foot Pedal Dustbin (30 Litres)',
    category: 'Cleaning & Dustbins',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 1400,
    colorOptions: ['Charcoal Grey', 'Ivory Beige', 'Matte Black'],
    stockQuantity: 410,
    damagedStock: 3,
    lowStockThreshold: 80,
    manufacturerName: 'Nilkamal Plastics Ltd',
    purchaseBaseCost: 210.00,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 265.00,
      tier2_wholesale: 295.00,
      tier3_semi_wholesale: 330.00,
      tier4_retailer: 375.00,
      tier5_mrp: 490.00
    }
  },

  // 6. BATH & MUGS
  {
    id: 'p-12',
    sku: 'DMK-MUG-1.5L-BOX',
    name: 'DMK Deluxe Printed Bathroom Bath Mug 1.5L (Box of 12 Pcs)',
    category: 'Bath & Mugs',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Box (12 Pcs)',
    weightGrams: 1200,
    colorOptions: ['Assorted Floral Prints', 'Solid Pastels'],
    stockQuantity: 650,
    damagedStock: 9,
    lowStockThreshold: 100,
    manufacturerName: 'Cello Polymer Solutions',
    purchaseBaseCost: 190.00,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 240.00,
      tier2_wholesale: 270.00,
      tier3_semi_wholesale: 300.00,
      tier4_retailer: 340.00,
      tier5_mrp: 450.00
    }
  }
];
