import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlasticProductItem, PricingTiers } from '../../types/erp';
import { exportToCSV, exportToExcel, ExportOptions } from '../../utils/exportUtils';

interface BulkProductUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedProducts: PlasticProductItem[]) => void;
}

// 6 Verified Demo Plastic Products for Sample Sheet & 1-Click Load
const SAMPLE_DEMO_PRODUCTS: PlasticProductItem[] = [
  {
    id: 'demo-01',
    sku: 'DMK-CHR-004',
    name: 'DMK Grand Ergonomic High-Back Chair',
    category: 'Chairs & Stools',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39269099',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 2850,
    colorOptions: ['Marble Granite White', 'Royal Blue', 'Terracotta Red'],
    stockQuantity: 150,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 420,
      tier2_wholesale: 460,
      tier3_semi_wholesale: 510,
      tier4_retailer: 580,
      tier5_mrp: 750
    }
  },
  {
    id: 'demo-02',
    sku: 'DMK-BCK-005',
    name: 'DMK 25L Super Heavy Utility Bucket with Steel Handle',
    category: 'Buckets & Basins',
    material: 'High-Density Polyethylene (HDPE)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 920,
    colorOptions: ['Opaque Blue', 'Opaque Red', 'Emerald Green'],
    stockQuantity: 300,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 195,
      tier2_wholesale: 220,
      tier3_semi_wholesale: 250,
      tier4_retailer: 290,
      tier5_mrp: 380
    }
  },
  {
    id: 'demo-03',
    sku: 'DMK-JAR-008',
    name: 'DMK 4-Piece Air-Tight Kitchen Grain Container Set (5kg)',
    category: 'Kitchen Storage & Jars',
    material: 'Food Grade Plastic',
    hsnCode: '39241010',
    gstRate: 18,
    unitOfMeasure: 'Set',
    weightGrams: 1100,
    colorOptions: ['Crystal Clear / Orange Lid'],
    stockQuantity: 200,
    companyId: 'comp-02',
    pricing: {
      tier1_distributor: 310,
      tier2_wholesale: 350,
      tier3_semi_wholesale: 395,
      tier4_retailer: 460,
      tier5_mrp: 599
    }
  },
  {
    id: 'demo-04',
    sku: 'DMK-CRT-004',
    name: 'DMK Industrial Reinforced Heavy Pallet Crate 600x400x320mm',
    category: 'Crates & Industrial',
    material: 'High-Density Polyethylene (HDPE)',
    hsnCode: '39231090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 2400,
    colorOptions: ['Industrial Grey', 'Navy Blue'],
    stockQuantity: 80,
    companyId: 'comp-03',
    pricing: {
      tier1_distributor: 650,
      tier2_wholesale: 720,
      tier3_semi_wholesale: 800,
      tier4_retailer: 920,
      tier5_mrp: 1200
    }
  },
  {
    id: 'demo-05',
    sku: 'DMK-DST-003',
    name: 'DMK 60L Pedal Operated Sanitation Dustbin',
    category: 'Cleaning & Dustbins',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Pcs',
    weightGrams: 3100,
    colorOptions: ['Green (Biodegradable)', 'Blue (Recyclable)', 'Yellow (Clinical)'],
    stockQuantity: 120,
    companyId: 'comp-01',
    pricing: {
      tier1_distributor: 580,
      tier2_wholesale: 640,
      tier3_semi_wholesale: 720,
      tier4_retailer: 840,
      tier5_mrp: 1099
    }
  },
  {
    id: 'demo-06',
    sku: 'DMK-BTH-003',
    name: 'DMK Supreme 1.5L Frost Mug & Soap Tray Combo',
    category: 'Bath & Mugs',
    material: 'Virgin Polypropylene (PP)',
    hsnCode: '39249090',
    gstRate: 18,
    unitOfMeasure: 'Set',
    weightGrams: 280,
    colorOptions: ['Pastel Pink', 'Pastel Mint', 'Sky Blue'],
    stockQuantity: 450,
    companyId: 'comp-02',
    pricing: {
      tier1_distributor: 45,
      tier2_wholesale: 52,
      tier3_semi_wholesale: 60,
      tier4_retailer: 75,
      tier5_mrp: 99
    }
  }
];

export const BulkProductUploadModal: React.FC<BulkProductUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [parsedProducts, setParsedProducts] = useState<PlasticProductItem[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Sample Template (.csv)
  const handleDownloadSampleCSV = () => {
    const sampleOptions: ExportOptions<PlasticProductItem> = {
      filename: 'DMK_Sample_Plastics_Upload_Template.csv',
      title: 'DMK Mart Official Bulk Product Upload Sheet (Sample Template)',
      companyName: 'DMK Mart Multi-Company Manufacturing Platform',
      subtitle: 'Fill in product details and pricing tiers, then upload via Bulk Product Uploader',
      columns: [
        { header: 'SKU Code', key: 'sku' },
        { header: 'Product Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Base Material', key: 'material' },
        { header: 'HSN Code', key: 'hsnCode' },
        { header: 'GST %', key: 'gstRate' },
        { header: 'UOM', key: 'unitOfMeasure' },
        { header: 'Weight (g)', key: 'weightGrams' },
        { header: 'Opening Stock', key: 'stockQuantity' },
        { header: 'Tier 1 Super Dist (INR)', key: 'pricing', format: (_, r) => r.pricing.tier1_distributor },
        { header: 'Tier 2 Wholesale (INR)', key: 'pricing', format: (_, r) => r.pricing.tier2_wholesale },
        { header: 'Tier 3 Semi-Wholesale (INR)', key: 'pricing', format: (_, r) => r.pricing.tier3_semi_wholesale },
        { header: 'Tier 4 Retail Shop (INR)', key: 'pricing', format: (_, r) => r.pricing.tier4_retailer },
        { header: 'Tier 5 Direct MRP (INR)', key: 'pricing', format: (_, r) => r.pricing.tier5_mrp }
      ],
      data: SAMPLE_DEMO_PRODUCTS
    };
    exportToCSV(sampleOptions);
  };

  // Download Sample Template (.xls / Excel)
  const handleDownloadSampleExcel = () => {
    const sampleOptions: ExportOptions<PlasticProductItem> = {
      filename: 'DMK_Sample_Plastics_Upload_Template.xls',
      title: 'DMK Mart Bulk Product Upload Template (Microsoft Excel)',
      companyName: 'DMK Mart Multi-Company Manufacturing Platform',
      subtitle: 'Guidelines: Do not alter header names. Enter 5 pricing tiers in Indian Rupees (INR)',
      columns: [
        { header: 'SKU Code', key: 'sku', width: 14 },
        { header: 'Product Name', key: 'name', width: 36 },
        { header: 'Category', key: 'category', width: 22 },
        { header: 'Base Material', key: 'material', width: 24 },
        { header: 'HSN Code', key: 'hsnCode', width: 12 },
        { header: 'GST %', key: 'gstRate', width: 8, align: 'right' },
        { header: 'UOM', key: 'unitOfMeasure', width: 8, align: 'center' },
        { header: 'Weight (g)', key: 'weightGrams', width: 12, align: 'right' },
        { header: 'Opening Stock', key: 'stockQuantity', width: 14, align: 'right' },
        { header: 'Tier 1 Super Dist (INR)', key: 'pricing', format: (_, r) => r.pricing.tier1_distributor, width: 16, align: 'right' },
        { header: 'Tier 2 Wholesale (INR)', key: 'pricing', format: (_, r) => r.pricing.tier2_wholesale, width: 16, align: 'right' },
        { header: 'Tier 3 Semi-Wholesale (INR)', key: 'pricing', format: (_, r) => r.pricing.tier3_semi_wholesale, width: 18, align: 'right' },
        { header: 'Tier 4 Retail Shop (INR)', key: 'pricing', format: (_, r) => r.pricing.tier4_retailer, width: 16, align: 'right' },
        { header: 'Tier 5 Direct MRP (INR)', key: 'pricing', format: (_, r) => r.pricing.tier5_mrp, width: 18, align: 'right' }
      ],
      data: SAMPLE_DEMO_PRODUCTS
    };
    exportToExcel(sampleOptions);
  };

  // 1-Click Load Demo Preset
  const handleLoadDemoPreset = () => {
    setFileName('Demo_Sample_Plastics_Sheet.csv (6 Pre-Configured Products)');
    setParsedProducts(SAMPLE_DEMO_PRODUCTS);
    setErrorMessage(null);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#10B981', '#00E5FF']
    });
  };

  // Parse CSV Raw String
  const parseCSVContent = (content: string) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Split lines cleanly handling \r\n or \n
      const rawLines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

      // Filter out any metadata header lines before column headers
      // Find the line that has 'sku' or 'product' or 'name'
      let headerIdx = -1;
      for (let i = 0; i < Math.min(rawLines.length, 10); i++) {
        const lower = rawLines[i].toLowerCase();
        if (lower.includes('sku') || (lower.includes('product') && lower.includes('name')) || lower.includes('category')) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) {
        throw new Error('Unable to detect table column headers. Please use the official sample template.');
      }

      // Helper to parse a single CSV line with quoted values
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headerCols = parseCSVLine(rawLines[headerIdx]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      const getIndex = (keywords: string[]): number => {
        return headerCols.findIndex(col => keywords.some(k => col.includes(k)));
      };

      const skuIdx = getIndex(['sku', 'itemcode', 'code']);
      const nameIdx = getIndex(['name', 'productname', 'description', 'itemname']);
      const catIdx = getIndex(['category', 'group', 'type']);
      const matIdx = getIndex(['material', 'polymer', 'resin']);
      const hsnIdx = getIndex(['hsn', 'hsncode', 'sac']);
      const gstIdx = getIndex(['gst', 'tax', 'rate', 'vat']);
      const uomIdx = getIndex(['uom', 'unit', 'measure']);
      const weightIdx = getIndex(['weight', 'grams', 'wt']);
      const stockIdx = getIndex(['stock', 'qty', 'quantity', 'inventory']);
      const t1Idx = getIndex(['tier1', 'superdist', 'distributor', 'baseprice']);
      const t2Idx = getIndex(['tier2', 'wholesale', 'bulk']);
      const t3Idx = getIndex(['tier3', 'semiwholesale', 'subdealer']);
      const t4Idx = getIndex(['tier4', 'retail', 'shop']);
      const t5Idx = getIndex(['tier5', 'mrp', 'direct', 'counter']);

      const items: PlasticProductItem[] = [];

      for (let i = headerIdx + 1; i < rawLines.length; i++) {
        const cols = parseCSVLine(rawLines[i]);
        if (cols.length < 2) continue;

        // Skip metadata / summary footer rows
        const firstCol = (cols[0] || '').toLowerCase();
        if (firstCol.includes('summary') || firstCol.includes('total') || firstCol.includes('confidential')) {
          continue;
        }

        const nameVal = nameIdx !== -1 ? cols[nameIdx] : (cols[1] || `Plastic Product ${i}`);
        if (!nameVal || nameVal.trim().length === 0) continue;

        const skuVal = skuIdx !== -1 && cols[skuIdx] ? cols[skuIdx] : `DMK-GEN-${Math.floor(1000 + Math.random() * 9000)}`;

        // Map Category
        let catVal: any = 'Chairs & Stools';
        const rawCat = catIdx !== -1 ? cols[catIdx].toLowerCase() : '';
        if (rawCat.includes('bucket') || rawCat.includes('basin') || rawCat.includes('tub')) {
          catVal = 'Buckets & Basins';
        } else if (rawCat.includes('kitchen') || rawCat.includes('jar') || rawCat.includes('container') || rawCat.includes('storage')) {
          catVal = 'Kitchen Storage & Jars';
        } else if (rawCat.includes('crate') || rawCat.includes('pallet') || rawCat.includes('industrial')) {
          catVal = 'Crates & Industrial';
        } else if (rawCat.includes('bin') || rawCat.includes('dustbin') || rawCat.includes('clean')) {
          catVal = 'Cleaning & Dustbins';
        } else if (rawCat.includes('bath') || rawCat.includes('mug')) {
          catVal = 'Bath & Mugs';
        }

        // Map Material
        let matVal: any = 'Virgin Polypropylene (PP)';
        const rawMat = matIdx !== -1 ? cols[matIdx].toLowerCase() : '';
        if (rawMat.includes('hdpe') || rawMat.includes('density')) {
          matVal = 'High-Density Polyethylene (HDPE)';
        } else if (rawMat.includes('food') || rawMat.includes('grade') || rawMat.includes('pet')) {
          matVal = 'Food Grade Plastic';
        }

        const hsnVal = hsnIdx !== -1 && cols[hsnIdx] ? cols[hsnIdx] : '39249090';
        const gstVal = gstIdx !== -1 ? parseFloat(cols[gstIdx].replace(/[^0-9.]/g, '')) || 18 : 18;
        const uomVal: any = uomIdx !== -1 && cols[uomIdx] ? cols[uomIdx] : 'Pcs';
        const weightVal = weightIdx !== -1 ? parseFloat(cols[weightIdx].replace(/[^0-9.]/g, '')) || 500 : 500;
        const stockVal = stockIdx !== -1 ? parseInt(cols[stockIdx].replace(/[^0-9]/g, ''), 10) || 50 : 50;

        // Parse 5 Pricing Tiers with safe fallback ratios
        const baseT1 = t1Idx !== -1 ? parseFloat(cols[t1Idx].replace(/[^0-9.]/g, '')) || 150 : 150;
        const baseT2 = t2Idx !== -1 ? parseFloat(cols[t2Idx].replace(/[^0-9.]/g, '')) || Math.round(baseT1 * 1.12) : Math.round(baseT1 * 1.12);
        const baseT3 = t3Idx !== -1 ? parseFloat(cols[t3Idx].replace(/[^0-9.]/g, '')) || Math.round(baseT1 * 1.25) : Math.round(baseT1 * 1.25);
        const baseT4 = t4Idx !== -1 ? parseFloat(cols[t4Idx].replace(/[^0-9.]/g, '')) || Math.round(baseT1 * 1.40) : Math.round(baseT1 * 1.40);
        const baseT5 = t5Idx !== -1 ? parseFloat(cols[t5Idx].replace(/[^0-9.]/g, '')) || Math.round(baseT1 * 1.75) : Math.round(baseT1 * 1.75);

        const pricing: PricingTiers = {
          tier1_distributor: baseT1,
          tier2_wholesale: baseT2,
          tier3_semi_wholesale: baseT3,
          tier4_retailer: baseT4,
          tier5_mrp: baseT5
        };

        items.push({
          id: `bulk-${Date.now()}-${i}`,
          sku: skuVal,
          name: nameVal,
          category: catVal,
          material: matVal,
          hsnCode: hsnVal,
          gstRate: gstVal,
          unitOfMeasure: uomVal,
          weightGrams: weightVal,
          colorOptions: ['Assorted Colours'],
          stockQuantity: stockVal,
          companyId: 'comp-01',
          pricing
        });
      }

      if (items.length === 0) {
        throw new Error('No valid product rows were found in the uploaded file.');
      }

      setParsedProducts(items);
      setIsProcessing(false);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to parse file. Please verify format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseCSVContent(text);
    };

    reader.onerror = () => {
      setErrorMessage('Error reading uploaded file.');
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseCSVContent(text);
    };

    reader.readAsText(file);
  };

  const handleRemoveParsedRow = (id: string) => {
    setParsedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleCommitImport = () => {
    if (parsedProducts.length === 0) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#FF6B00', '#10B981', '#FFFFFF', '#00E5FF']
    });

    onImportSuccess(parsedProducts);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--accent-orange-border)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95)',
          padding: '24px',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}
            >
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#FFF' }}>
                Bulk Product Master Upload (CSV / Excel)
              </h3>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Import 10 to 500+ plastic catalog items with full 5-tier price matrix in one click
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action / Template Download Bar */}
        <div 
          style={{
            background: 'var(--bg-tertiary)',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>
              Need the exact template format?
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Download our sample spreadsheet with predefined headers and 5-tier pricing
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownloadSampleExcel}
              className="btn-secondary"
              style={{ color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.4)', height: '38px', padding: '0 14px', fontSize: '12.5px' }}
            >
              <FileSpreadsheet size={15} />
              <span>Download Excel (.xls) Template</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSampleCSV}
              className="btn-secondary"
              style={{ color: '#00E5FF', borderColor: 'rgba(0, 229, 255, 0.4)', height: '38px', padding: '0 14px', fontSize: '12.5px' }}
            >
              <FileText size={15} />
              <span>Download CSV (.csv) Template</span>
            </button>

            <button
              type="button"
              onClick={handleLoadDemoPreset}
              className="btn-primary"
              style={{ height: '38px', padding: '0 16px', fontSize: '12.5px' }}
            >
              <Sparkles size={15} />
              <span>Load 6 Demo Products Preset</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-orange)' : 'var(--border-medium)'}`,
            backgroundColor: dragActive ? 'rgba(255, 107, 0, 0.08)' : 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xls, .xlsx, .txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 107, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-orange)'
            }}
          >
            <Upload size={24} />
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
              {fileName ? fileName : 'Drag & drop your CSV or Excel file here, or click to browse'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Supports .csv, .xls, .xlsx files with standard headers (SKU, Name, Category, Material, 5 Pricing Tiers)
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div 
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedProducts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={16} color="#10B981" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                  Parsed Products Preview ({parsedProducts.length} Items Validated)
                </span>
              </div>
              <span className="status-pill status-pill-success" style={{ fontSize: '10px' }}>
                ALL 5 TIERS RECOGNIZED
              </span>
            </div>

            <div 
              className="enterprise-table-container"
              style={{ maxHeight: '240px', overflowY: 'auto' }}
            >
              <table className="enterprise-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th style={{ minWidth: '180px' }}>Product Description</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Stock</th>
                    <th style={{ textAlign: 'right' }}>Tier 1 (₹)</th>
                    <th style={{ textAlign: 'right' }}>Tier 2 (₹)</th>
                    <th style={{ textAlign: 'right' }}>Tier 3 (₹)</th>
                    <th style={{ textAlign: 'right' }}>Tier 4 (₹)</th>
                    <th style={{ textAlign: 'right' }}>Tier 5 (₹)</th>
                    <th style={{ textAlign: 'center', width: '48px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {parsedProducts.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono" style={{ color: 'var(--accent-orange-bright)', fontWeight: 700 }}>
                        {item.sku}
                      </td>
                      <td style={{ fontWeight: 600, color: '#FFF' }}>{item.name}</td>
                      <td>
                        <span className="status-pill status-pill-cyan">
                          {item.category}
                        </span>
                      </td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>{item.stockQuantity}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>₹{item.pricing.tier1_distributor}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>₹{item.pricing.tier2_wholesale}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>₹{item.pricing.tier3_semi_wholesale}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>₹{item.pricing.tier4_retailer}</td>
                      <td className="font-mono" style={{ textAlign: 'right', color: '#10B981', fontWeight: 800 }}>
                        ₹{item.pricing.tier5_mrp}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveParsedRow(item.id)}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '9px 16px', fontSize: '12.5px' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCommitImport}
            disabled={parsedProducts.length === 0}
            className="btn-primary"
            style={{
              padding: '9px 20px',
              fontSize: '13px',
              opacity: parsedProducts.length > 0 ? 1 : 0.5,
              cursor: parsedProducts.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            <CheckCircle2 size={16} />
            <span>
              {parsedProducts.length > 0 
                ? `Import ${parsedProducts.length} Valid Products into Catalog` 
                : 'Upload or Select a File to Import'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
