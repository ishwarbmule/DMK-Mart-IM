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
    companyId: 'comp-01',
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
    stockQuantity: 620,
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
    companyId: 'comp-02',
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
    companyId: 'comp-02',
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
    colorOptions: ['Transparent Pink', 'Transparent Blue', 'Transparent Purple'],
    stockQuantity: 530,
    companyId: 'comp-02',
    pricing: {
      tier1_distributor: 145.00,
      tier2_wholesale: 165.00,
      tier3_semi_wholesale: 185.00,
      tier4_retailer: 210.00,
      tier5_mrp: 290.00
    }
  },
  {
    id: 'p-06',
    sku: 'DMK-BSN-22IN',
    name: 'DMK Deep Round Plastic Washing Basin (22 Inches)',
    category: 'Buckets & Basins',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 750,
    colorOptions: ['Sky Blue', 'Crimson Red', 'Bright Yellow'],
    stockQuantity: 920,
    companyId: 'comp-02',
    pricing: {
      tier1_distributor: 78.00,
      tier2_wholesale: 88.00,
      tier3_semi_wholesale: 98.00,
      tier4_retailer: 115.00,
      tier5_mrp: 155.00
    }
  },

  // 3. KITCHEN STORAGE & JARS
  {
    id: 'p-07',
    sku: 'DMK-JAR-SET6',
    name: 'DMK Airtight Modular Kitchen Container Set (6 Pieces - 1L each)',
    category: 'Kitchen Storage & Jars',
    material: 'Food Grade Plastic',
    hsnCode: '39241010',
    gstRate: 12,
    unitOfMeasure: 'Set',
    weightGrams: 680,
    colorOptions: ['Clear Body / Black Lid', 'Clear Body / Orange Lid', 'Clear Body / Blue Lid'],
    stockQuantity: 340,
    companyId: 'comp-02',
    pricing: {
      tier1_distributor: 190.00,
      tier2_wholesale: 220.00,
      tier3_semi_wholesale: 250.00,
      tier4_retailer: 285.00,
      tier5_mrp: 399.00
    }
  },
  {
    id: 'p-08',
    sku: 'DMK-DISP-15KG',
    name: 'DMK Smart Grain & Rice Dispenser Container (15kg Capacity)',
    category: 'Kitchen Storage & Jars',
    material: 'Food Grade Plastic',
    hsnCode: '39241010',
    gstRate: 12,
    unitOfMeasure: 'Pcs',
    weightGrams: 1400,
    colorOptions: ['Nordic Grey', 'Mint Green', 'Ivory White'],
    stockQuantity: 180,
    companyId: 'comp-02',
    pricing: {
      tier1_distributor: 390.00,
      tier2_wholesale: 440.00,
      tier3_semi_wholesale: 490.00,
      tier4_retailer: 560.00,
      tier5_mrp: 750.00
    }
  },

  // 4. CRATES & INDUSTRIAL
  {
    id: 'p-09',
    sku: 'DMK-CRT-JUMBO-MESH',
    name: 'DMK Heavy-Duty Perforated Vegetable & Fruit Crate (Jumbo)',
    category: 'Crates & Industrial',
    material: 'High-Density Polyethylene (HDPE)',
    hsnCode: '39231090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 2100,
    colorOptions: ['Signal Red', 'Bright Blue', 'Industrial Green'],
    stockQuantity: 1500,
    companyId: 'comp-03',
    pricing: {
      tier1_distributor: 260.00,
      tier2_wholesale: 290.00,
      tier3_semi_wholesale: 320.00,
      tier4_retailer: 360.00,
      tier5_mrp: 450.00
    }
  },
  {
    id: 'p-10',
    sku: 'DMK-CRT-SOLID-MILK',
    name: 'DMK Fully Closed Dairy & Bottle Crating Box (12 Pouch)',
    category: 'Crates & Industrial',
    material: 'High-Density Polyethylene (HDPE)',
    hsnCode: '39231090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 1850,
    colorOptions: ['Dairy Blue', 'Golden Yellow'],
    stockQuantity: 950,
    companyId: 'comp-03',
    pricing: {
      tier1_distributor: 210.00,
      tier2_wholesale: 235.00,
      tier3_semi_wholesale: 260.00,
      tier4_retailer: 295.00,
      tier5_mrp: 380.00
    }
  },

  // 5. CLEANING & DUSTBINS
  {
    id: 'p-11',
    sku: 'DMK-BIN-PEDAL-30L',
    name: 'DMK Foot-Pedal Operated Waste Bin (30 Litres)',
    category: 'Cleaning & Dustbins',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 1600,
    colorOptions: ['Hospital Blue', 'Biohazard Yellow', 'Dark Grey'],
    stockQuantity: 280,
    companyId: 'comp-03',
    pricing: {
      tier1_distributor: 310.00,
      tier2_wholesale: 350.00,
      tier3_semi_wholesale: 390.00,
      tier4_retailer: 440.00,
      tier5_mrp: 599.00
    }
  },

  // 6. BATH & MUGS
  {
    id: 'p-12',
    sku: 'DMK-MUG-1L-PRINT',
    name: 'DMK Crystal Transparent Bath Mug (1 Litre - Pack of 12)',
    category: 'Bath & Mugs',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Box (12 Pcs)',
    weightGrams: 1200,
    colorOptions: ['Assorted Colours'],
    stockQuantity: 600,
    companyId: 'comp-02',
    pricing: {
      tier1_distributor: 180.00, // For 12 pcs box
      tier2_wholesale: 204.00,
      tier3_semi_wholesale: 228.00,
      tier4_retailer: 252.00,
      tier5_mrp: 360.00
    }
  }
];
