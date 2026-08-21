import React, { useState, useMemo, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RotateCcw, 
  Building2, 
  FileText, 
  IndianRupee, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  ShieldCheck, 
  Printer, 
  X, 
  Package, 
  Layers, 
  Calendar, 
  UserCheck, 
  Sparkles,
  ChevronDown,
  Edit3,
  XCircle,
  Trash2,
  AlertCircle,
  ShoppingCart,
  Receipt,
  Archive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useERPData } from '../../context/ERPContext';
import { 
  VendorParty, 
  VendorType, 
  PurchaseOrder, 
  PurchaseOrderItem, 
  PurchaseReturn, 
  PurchaseReturnItem,
  PlasticProductItem 
} from '../../types/erp';
import { formatDate, formatFullDate, getTodayISODate } from '../../utils/dateUtils';
import { ExportDropdown } from '../common/ExportDropdown';

interface PurchaseManagementModuleProps {
  initialSubSection?: 'purchase_orders' | 'purchase_returns' | 'vendor_payments' | 'vendors_directory';
}

export const PurchaseManagementModule: React.FC<PurchaseManagementModuleProps> = ({ 
  initialSubSection = 'purchase_orders' 
}) => {
  const { 
    vendors, 
    products, 
    purchaseOrders, 
    purchaseReturns, 
    vendorLedgers,
    createVendor, 
    archiveVendor,
    reactivateVendor,
    createPurchaseOrder, 
    updatePurchaseOrder,
    cancelPurchaseOrder,
    confirmPurchaseOrderReceipt, 
    createPurchaseReturn,
    recordVendorPayment 
  } = useERPData();

  const [activeTab, setActiveTab] = useState<'purchase_orders' | 'vendors_directory' | 'purchase_returns' | 'vendor_ledger'>(
    initialSubSection === 'vendor_payments' ? 'vendor_ledger' : (initialSubSection as any)
  );

  const [vendorSubTab, setVendorSubTab] = useState<'ACTIVE_SUPPLIERS' | 'ARCHIVED_SUPPLIERS'>('ACTIVE_SUPPLIERS');

  useEffect(() => {
    if (initialSubSection) {
      if (initialSubSection === 'vendor_payments') {
        setActiveTab('vendor_ledger');
      } else {
        setActiveTab(initialSubSection as any);
      }
    }
  }, [initialSubSection]);

  const [poFilter, setPoFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED_RECEIVED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Vendor for ledger view
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || 'vnd-01');
  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  // Modals
  const [showEditPoModal, setShowEditPoModal] = useState(false);
  const [showCancelPoModal, setShowCancelPoModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showPurchaseReturnModal, setShowPurchaseReturnModal] = useState(false);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [showArchiveVendorModal, setShowArchiveVendorModal] = useState(false);
  const [vendorToArchive, setVendorToArchive] = useState<VendorParty | null>(null);
  const [archiveVendorReason, setArchiveVendorReason] = useState('Supplier discontinued product lines / operational pause');

  // Fast Procurement Terminal (Similar to Sales Billing Terminal)
  const [termVendorId, setTermVendorId] = useState<string>(vendors[0]?.id || 'vnd-01');
  const [termOrderDate, setTermOrderDate] = useState(getTodayISODate());
  const [termNotes, setTermNotes] = useState('Procurement of raw plastic inventory from authorized supplier');
  const [termProductSearch, setTermProductSearch] = useState('');
  const [termLines, setTermLines] = useState<Array<{
    productId: string;
    productSku: string;
    productName: string;
    hsnCode: string;
    quantity: number;
    unitCost: number;
    gstRate: number;
  }>>([
    {
      productId: products[0]?.id || 'p-01',
      productSku: products[0]?.sku || 'DMK-CHR-ROYAL',
      productName: products[0]?.name || 'DMK Royal High-Back Arm Chair',
      hsnCode: products[0]?.hsnCode || '94018000',
      quantity: 50,
      unitCost: products[0]?.purchaseBaseCost || 310.00,
      gstRate: products[0]?.gstRate || 18
    }
  ]);

  // New Vendor Form
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorBrand, setNewVendorBrand] = useState('');
  const [newVendorType, setNewVendorType] = useState<VendorType>('MANUFACTURER');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorCity, setNewVendorCity] = useState('');
  const [newVendorStateCode, setNewVendorStateCode] = useState('27');
  const [newVendorGstin, setNewVendorGstin] = useState('');
  const [newVendorOpeningBal, setNewVendorOpeningBal] = useState(0);
  const [newVendorTerms, setNewVendorTerms] = useState(30);

  // Edit PO Form State
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);
  const [editPoVendorId, setEditPoVendorId] = useState<string>('');
  const [editPoOrderDate, setEditPoOrderDate] = useState<string>('');
  const [editPoNotes, setEditPoNotes] = useState<string>('');
  const [editPoLines, setEditPoLines] = useState<Array<{
    productId: string;
    productSku: string;
    productName: string;
    hsnCode: string;
    quantity: number;
    unitCost: number;
    gstRate: number;
  }>>([]);

  // Cancel PO State
  const [cancellingPo, setCancellingPo] = useState<PurchaseOrder | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Order specifications changed / re-evaluated by procurement team');

  // Purchase Return Form
  const [returnVendorId, setReturnVendorId] = useState<string>(vendors[0]?.id || 'vnd-01');
  const [returnNotes, setReturnNotes] = useState('Damaged products returned to supplier for credit adjustment');
  const [returnLines, setReturnLines] = useState<Array<{
    productId: string;
    productSku: string;
    productName: string;
    damagedQuantity: number;
    unitCost: number;
    gstRate: number;
    reason: string;
  }>>([
    {
      productId: products[0]?.id || 'p-01',
      productSku: products[0]?.sku || 'DMK-CHR-ROYAL',
      productName: products[0]?.name || 'DMK Royal High-Back Arm Chair',
      damagedQuantity: Math.min(2, products[0]?.damagedStock || 2),
      unitCost: products[0]?.purchaseBaseCost || 310.00,
      gstRate: products[0]?.gstRate || 18,
      reason: 'Moulding armrest crack'
    }
  ]);

  // Payment Disbursement Form
  const [disburseVendorId, setDisburseVendorId] = useState<string>(vendors[0]?.id || 'vnd-01');
  const [disburseAmount, setDisburseAmount] = useState<number>(50000);
  const [disburseMode, setDisburseMode] = useState<'NEFT_RTGS' | 'UPI' | 'CHEQUE'>('NEFT_RTGS');
  const [disburseRef, setDisburseRef] = useState<string>(`UTR-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [disburseDate, setDisburseDate] = useState<string>(getTodayISODate());
  const [disburseNotes, setDisburseNotes] = useState<string>('Payment settlement against pending raw procurement invoices');

  // Filtered Products for Procurement Terminal based on Vendor Type
  const termSelectedVendor = vendors.find(v => v.id === termVendorId) || vendors[0];
  const availableProductsForTerm = useMemo(() => {
    if (!termSelectedVendor) return products;
    if (termSelectedVendor.partyType === 'MANUFACTURER' && termSelectedVendor.brandName) {
      const brandFiltered = products.filter(p => 
        p.manufacturerName?.toLowerCase().includes(termSelectedVendor.brandName!.toLowerCase()) ||
        termSelectedVendor.name.toLowerCase().includes(p.manufacturerName?.toLowerCase() || '')
      );
      return brandFiltered.length > 0 ? brandFiltered : products;
    }
    return products;
  }, [termSelectedVendor, products]);

  // Typeahead search results for terminal
  const searchResultsForTerm = useMemo(() => {
    if (!termProductSearch.trim()) return [];
    const q = termProductSearch.toLowerCase();
    return availableProductsForTerm.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.hsnCode.includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [availableProductsForTerm, termProductSearch]);

  // Filtered Products for Edit PO
  const editPoSelectedVendor = vendors.find(v => v.id === editPoVendorId) || vendors[0];
  const editAvailableProductsForPO = useMemo(() => {
    if (!editPoSelectedVendor) return products;
    if (editPoSelectedVendor.partyType === 'MANUFACTURER' && editPoSelectedVendor.brandName) {
      const brandFiltered = products.filter(p => 
        p.manufacturerName?.toLowerCase().includes(editPoSelectedVendor.brandName!.toLowerCase()) ||
        editPoSelectedVendor.name.toLowerCase().includes(p.manufacturerName?.toLowerCase() || '')
      );
      return brandFiltered.length > 0 ? brandFiltered : products;
    }
    return products;
  }, [editPoSelectedVendor, products]);

  // Filtered POs
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchFilter = poFilter === 'ALL' || po.status === poFilter;
      const matchQuery = !searchQuery || 
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchQuery;
    });
  }, [purchaseOrders, poFilter, searchQuery]);

  // Filtered Active & Archived Vendors
  const activeVendors = useMemo(() => vendors.filter(v => v.status !== 'INACTIVE'), [vendors]);
  const archivedVendors = useMemo(() => vendors.filter(v => v.status === 'INACTIVE'), [vendors]);

  const filteredActiveVendors = useMemo(() => {
    return activeVendors.filter(v => {
      const q = searchQuery.toLowerCase();
      return !q || 
        v.name.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        (v.brandName && v.brandName.toLowerCase().includes(q));
    });
  }, [activeVendors, searchQuery]);

  const filteredArchivedVendors = useMemo(() => {
    return archivedVendors.filter(v => {
      const q = searchQuery.toLowerCase();
      return !q || 
        v.name.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        (v.archiveReason && v.archiveReason.toLowerCase().includes(q));
    });
  }, [archivedVendors, searchQuery]);

  const handleOpenArchiveVendor = (vendor: VendorParty) => {
    setVendorToArchive(vendor);
    setArchiveVendorReason('Supplier discontinued product lines / operational pause');
    setShowArchiveVendorModal(true);
  };

  const handleConfirmArchiveVendor = () => {
    if (!vendorToArchive) return;
    archiveVendor(vendorToArchive.id, archiveVendorReason);
    setShowArchiveVendorModal(false);
    setVendorToArchive(null);
    confetti({ particleCount: 25, spread: 40 });
  };

  const handleReactivateVendor = (vendorId: string) => {
    reactivateVendor(vendorId);
    setSelectedVendorId(vendorId);
    setVendorSubTab('ACTIVE_SUPPLIERS');
    confetti({ particleCount: 40, spread: 60 });
  };

  // Totals calculations for Terminal PO
  const termCalculations = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;

    termLines.forEach(l => {
      const taxable = l.quantity * l.unitCost;
      const gst = taxable * (l.gstRate / 100);
      subtotal += taxable;
      totalGst += gst;
    });

    const isIntraState = termSelectedVendor?.stateCode === '27' || termSelectedVendor?.stateCode === '33';
    const cgst = isIntraState ? totalGst / 2 : 0;
    const sgst = isIntraState ? totalGst / 2 : 0;
    const igst = !isIntraState ? totalGst : 0;
    const grandTotal = subtotal + totalGst;

    return { subtotal, cgst, sgst, igst, totalGst, grandTotal };
  }, [termLines, termSelectedVendor]);

  // Totals calculations for Edit PO
  const editPoCalculations = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;

    editPoLines.forEach(l => {
      const taxable = l.quantity * l.unitCost;
      const gst = taxable * (l.gstRate / 100);
      subtotal += taxable;
      totalGst += gst;
    });

    const isIntraState = editPoSelectedVendor?.stateCode === '27' || editPoSelectedVendor?.stateCode === '33';
    const cgst = isIntraState ? totalGst / 2 : 0;
    const sgst = isIntraState ? totalGst / 2 : 0;
    const igst = !isIntraState ? totalGst : 0;
    const grandTotal = subtotal + totalGst;

    return { subtotal, cgst, sgst, igst, totalGst, grandTotal };
  }, [editPoLines, editPoSelectedVendor]);

  // Add Product to Terminal Cart
  const handleAddProductToTerm = (prod: PlasticProductItem) => {
    setTermLines(prev => {
      const existing = prev.find(l => l.productId === prod.id);
      if (existing) {
        return prev.map(l => l.productId === prod.id ? { ...l, quantity: l.quantity + 10 } : l);
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productSku: prod.sku,
          productName: prod.name,
          hsnCode: prod.hsnCode,
          quantity: 20,
          unitCost: prod.purchaseBaseCost,
          gstRate: prod.gstRate
        }
      ];
    });
    setTermProductSearch('');
  };

  // Handle PO Creation from Terminal
  const handleSaveTerminalPO = (confirmImmediately: boolean = false) => {
    if (!termSelectedVendor || termLines.length === 0) return;

    const poId = `po-${Date.now()}`;
    const newPO: PurchaseOrder = {
      id: poId,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: termSelectedVendor.id,
      vendorName: termSelectedVendor.name,
      vendorType: termSelectedVendor.partyType,
      orderDate: termOrderDate,
      status: 'PENDING',
      subtotalTaxable: termCalculations.subtotal,
      totalCGST: termCalculations.cgst,
      totalSGST: termCalculations.sgst,
      totalIGST: termCalculations.igst,
      grandTotal: termCalculations.grandTotal,
      notes: termNotes,
      lineItems: termLines.map((line, idx) => {
        const taxable = line.quantity * line.unitCost;
        const gst = taxable * (line.gstRate / 100);
        return {
          id: `poi-${Date.now()}-${idx}`,
          productId: line.productId,
          productSku: line.productSku,
          productName: line.productName,
          hsnCode: line.hsnCode,
          quantity: line.quantity,
          unitCost: line.unitCost,
          taxableAmount: taxable,
          gstRate: line.gstRate,
          cgstAmount: termCalculations.cgst > 0 ? gst / 2 : 0,
          sgstAmount: termCalculations.sgst > 0 ? gst / 2 : 0,
          igstAmount: termCalculations.igst > 0 ? gst : 0,
          totalAmount: taxable + gst
        };
      })
    };

    createPurchaseOrder(newPO);

    if (confirmImmediately) {
      confirmPurchaseOrderReceipt(poId, 'Bay-3 Warehouse Supervisor');
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } else {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }
  };

  // Open Edit PO Modal
  const handleOpenEditPO = (po: PurchaseOrder) => {
    setEditingPo(po);
    setEditPoVendorId(po.vendorId);
    setEditPoOrderDate(po.orderDate);
    setEditPoNotes(po.notes || '');
    setEditPoLines(po.lineItems.map(l => ({
      productId: l.productId,
      productSku: l.productSku,
      productName: l.productName,
      hsnCode: l.hsnCode,
      quantity: l.quantity,
      unitCost: l.unitCost,
      gstRate: l.gstRate
    })));
    setShowEditPoModal(true);
  };

  // Save Edited PO
  const handleSaveEditedPO = (e: React.FormEvent, confirmInwardImmediately: boolean = false) => {
    e.preventDefault();
    if (!editingPo || !editPoSelectedVendor || editPoLines.length === 0) return;

    const updatedLineItems: PurchaseOrderItem[] = editPoLines.map((line, idx) => {
      const taxable = line.quantity * line.unitCost;
      const gst = taxable * (line.gstRate / 100);
      return {
        id: `poi-edit-${Date.now()}-${idx}`,
        productId: line.productId,
        productSku: line.productSku,
        productName: line.productName,
        hsnCode: line.hsnCode,
        quantity: line.quantity,
        unitCost: line.unitCost,
        taxableAmount: taxable,
        gstRate: line.gstRate,
        cgstAmount: editPoCalculations.cgst > 0 ? gst / 2 : 0,
        sgstAmount: editPoCalculations.sgst > 0 ? gst / 2 : 0,
        igstAmount: editPoCalculations.igst > 0 ? gst : 0,
        totalAmount: taxable + gst
      };
    });

    updatePurchaseOrder(editingPo.id, {
      vendorId: editPoSelectedVendor.id,
      vendorName: editPoSelectedVendor.name,
      vendorType: editPoSelectedVendor.partyType,
      orderDate: editPoOrderDate,
      notes: editPoNotes,
      lineItems: updatedLineItems,
      subtotalTaxable: editPoCalculations.subtotal,
      totalCGST: editPoCalculations.cgst,
      totalSGST: editPoCalculations.sgst,
      totalIGST: editPoCalculations.igst,
      grandTotal: editPoCalculations.grandTotal
    });

    setShowEditPoModal(false);

    if (confirmInwardImmediately) {
      confirmPurchaseOrderReceipt(editingPo.id, 'Bay-3 Warehouse Supervisor');
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } else {
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  // Open Cancel PO Modal
  const handleOpenCancelPO = (po: PurchaseOrder) => {
    setCancellingPo(po);
    setCancelReason('Order specifications changed / re-evaluated by procurement team');
    setShowCancelPoModal(true);
  };

  // Confirm Cancel PO
  const handleConfirmCancelPO = () => {
    if (!cancellingPo) return;
    cancelPurchaseOrder(cancellingPo.id, cancelReason);
    setShowCancelPoModal(false);
    setCancellingPo(null);
  };

  // Handle Goods Receipt Confirmation
  const handleConfirmReceipt = (po: PurchaseOrder) => {
    confirmPurchaseOrderReceipt(po.id, 'Bay-3 Warehouse Supervisor');
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
  };

  // Handle New Vendor
  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;

    const created: VendorParty = {
      id: `vnd-${Date.now()}`,
      vendorCode: `VND-${newVendorName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newVendorName,
      brandName: newVendorType === 'MANUFACTURER' ? (newVendorBrand || newVendorName) : undefined,
      partyType: newVendorType,
      phone: newVendorPhone,
      email: newVendorEmail,
      city: newVendorCity || 'Industrial Hub',
      stateCode: newVendorStateCode,
      gstin: newVendorGstin,
      openingBalance: newVendorOpeningBal,
      closingBalance: newVendorOpeningBal,
      balanceType: 'Cr',
      creditTermsDays: newVendorTerms,
      status: 'ACTIVE'
    };

    createVendor(created);
    setShowAddVendorModal(false);
    setNewVendorName('');
    setNewVendorBrand('');
    setNewVendorPhone('');
    setNewVendorEmail('');
    setNewVendorCity('');
    setNewVendorGstin('');
    confetti({ particleCount: 30, spread: 50 });
  };

  // Handle Purchase Return Submit
  const handleSavePurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === returnVendorId) || vendors[0];
    if (!vendor || returnLines.length === 0) return;

    let totalTaxable = 0;
    let totalAmt = 0;

    const lineItems: PurchaseReturnItem[] = returnLines.map((rl, idx) => {
      const taxable = rl.damagedQuantity * rl.unitCost;
      const total = taxable * (1 + rl.gstRate / 100);
      totalTaxable += taxable;
      totalAmt += total;
      return {
        id: `pri-${Date.now()}-${idx}`,
        productId: rl.productId,
        productSku: rl.productSku,
        productName: rl.productName,
        damagedQuantity: rl.damagedQuantity,
        unitCost: rl.unitCost,
        taxableAmount: taxable,
        gstRate: rl.gstRate,
        totalAmount: total,
        reasonForReturn: rl.reason
      };
    });

    const prPayload: PurchaseReturn = {
      id: `pr-${Date.now()}`,
      debitNoteNumber: `DN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      returnDate: getTodayISODate(),
      lineItems,
      grandTotal: totalAmt,
      status: 'POSTED',
      notes: returnNotes
    };

    createPurchaseReturn(prPayload);
    setShowPurchaseReturnModal(false);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  // Handle Vendor Disbursement
  const handleSaveDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseVendorId || disburseAmount <= 0) return;
    recordVendorPayment(disburseVendorId, disburseAmount, disburseMode, disburseRef, disburseDate, disburseNotes);
    setShowDisbursementModal(false);
    confetti({ particleCount: 40, spread: 60 });
  };

  // Active vendor ledger records
  const activeLedgerRows = vendorLedgers[selectedVendor.id] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div 
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 107, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-orange)'
              }}
            >
              <Truck size={20} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Purchase & Sourcing Management
            </h1>
            <span 
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              PROCUREMENT ◄► INWARD WAREHOUSE
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Procure raw plastic items from Manufacturers & Distributors, edit or cancel pending orders, confirm inward arrival, track closing balances, and process purchase returns on damaged goods.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('purchase_returns')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: activeTab === 'purchase_returns' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
            Purchased Returns
          </button>

          <button
            onClick={() => setActiveTab('vendor_ledger')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: activeTab === 'vendor_ledger' ? 'rgba(2, 132, 199, 0.3)' : 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              color: '#38BDF8',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <IndianRupee size={16} />
            Vendor Payments
          </button>

          <button
            onClick={() => setShowAddVendorModal(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            + New Supplier
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Total Accounts Payable (Closing Balances) */}
        <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Total Supplier Payables
            </span>
            <Building2 size={16} color="var(--accent-orange)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>
            ₹{vendors.reduce((s, v) => s + v.closingBalance, 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Across {vendors.length} active Manufacturers & Distributors
          </div>
        </div>

        {/* Pending Inward POs */}
        <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Pending Inward POs
            </span>
            <Clock size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
            {purchaseOrders.filter(p => p.status === 'PENDING').length} Orders
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Can be re-edited, cancelled, or confirmed on arrival
          </div>
        </div>

        {/* Confirmed PO Inward Value */}
        <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Confirmed Stock Inward
            </span>
            <CheckCircle2 size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
            ₹{purchaseOrders.filter(p => p.status === 'CONFIRMED_RECEIVED').reduce((s, p) => s + p.grandTotal, 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Fully added to sellable inventory
          </div>
        </div>

        {/* Purchase Returns / Debit Notes */}
        <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Purchase Returns (Debit Notes)
            </span>
            <RotateCcw size={16} color="#EF4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
            ₹{purchaseReturns.reduce((s, pr) => s + pr.grandTotal, 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Damaged stock recovered from suppliers
          </div>
        </div>

      </div>

      {/* Navigation Subsections Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          padding: '12px 18px',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('purchase_orders')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'purchase_orders' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'purchase_orders' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={15} />
            Purchase Orders ({purchaseOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('purchase_returns')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'purchase_returns' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'purchase_returns' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={15} />
            Purchased Returns ({purchaseReturns.length})
          </button>

          <button
            onClick={() => setActiveTab('vendor_ledger')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'vendor_ledger' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'vendor_ledger' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IndianRupee size={15} />
            Vendor Payments & Ledgers
          </button>

          <button
            onClick={() => setActiveTab('vendors_directory')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'vendors_directory' ? 'var(--accent-orange)' : 'transparent',
              color: activeTab === 'vendors_directory' ? '#FFF' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={15} />
            Suppliers Directory ({vendors.length})
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search PO, Vendor, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '12px'
              }}
            />
          </div>

          {activeTab === 'purchase_orders' && (
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '6px' }}>
              {(['ALL', 'PENDING', 'CONFIRMED_RECEIVED', 'CANCELLED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setPoFilter(status)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: poFilter === status ? 'var(--accent-orange)' : 'transparent',
                    color: poFilter === status ? '#FFF' : 'var(--text-secondary)'
                  }}
                >
                  {status === 'ALL' ? 'All POs' : status === 'PENDING' ? '⏳ Pending' : status === 'CONFIRMED_RECEIVED' ? '✅ Confirmed' : '🚫 Cancelled'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SUBSECTION 1: PURCHASE ORDERS (FAST PROCUREMENT TERMINAL & HISTORY)  */}
      {/* ==================================================================== */}
      {activeTab === 'purchase_orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* FAST PROCUREMENT TERMINAL (Similar to Sales Billing Terminal UI) */}
          <div className="responsive-billing-grid">
            
            {/* Left Column: Supplier Selector, Product Typeahead Search & Procurement Cart */}
            <div className="billing-left-col">
              
              {/* Supplier Selector Card */}
              <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={16} color="var(--accent-orange)" />
                    Select Supplier / Vendor *
                  </label>
                  <span 
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: termSelectedVendor.partyType === 'MANUFACTURER' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: termSelectedVendor.partyType === 'MANUFACTURER' ? '#38BDF8' : '#10B981'
                    }}
                  >
                    {termSelectedVendor.partyType === 'MANUFACTURER' ? '🏭 DIRECT MANUFACTURER' : '🌐 MULTI-BRAND DISTRIBUTOR'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <select
                    value={termVendorId}
                    onChange={(e) => setTermVendorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.partyType} - {v.city}) — Payable: ₹{v.closingBalance.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={termOrderDate}
                    onChange={(e) => setTermOrderDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Type-Ahead Product Search */}
              <div style={{ background: 'var(--bg-secondary)', padding: '18px 20px', borderRadius: '10px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={16} color="var(--accent-orange)" />
                    Quick Type-Ahead Product Search
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    Type product SKU (e.g. DMK-CHR-ROYAL) or name
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search raw plastic product SKU, category, or name to add to procurement order..."
                    value={termProductSearch}
                    onChange={(e) => setTermProductSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />

                  {searchResultsForTerm.length > 0 && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                        marginTop: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      {searchResultsForTerm.map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => handleAddProductToTerm(prod)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{prod.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{prod.sku}</span> | HSN: {prod.hsnCode} | Brand: {prod.manufacturerName || 'DMK Plastics'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                              Base Cost: ₹{prod.purchaseBaseCost.toFixed(2)}
                            </div>
                            <span style={{ fontSize: '10.5px', color: 'var(--accent-orange)', fontWeight: 700 }}>+ Click to Add</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Procurement Cart Table */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Procurement Items in Order ({termLines.length})
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    Adjust order quantities and purchase base costs
                  </span>
                </div>

                <div className="cart-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                        <th style={{ width: '32%', minWidth: '240px', padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Product</th>
                        <th style={{ width: '16%', minWidth: '110px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>Quantity</th>
                        <th style={{ width: '16%', minWidth: '100px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Unit Cost (₹)</th>
                        <th style={{ width: '14%', minWidth: '95px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Taxable</th>
                        <th style={{ width: '16%', minWidth: '105px', padding: '10px 10px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Total</th>
                        <th style={{ width: '36px', minWidth: '36px', padding: '10px 6px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {termLines.map((line, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                          
                          {/* Product Info (3-Tier Clean Formatting) */}
                          <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                            {/* Line 1 & 2: Product Name */}
                            <div 
                              title={line.productName}
                              style={{ 
                                fontWeight: 700, 
                                color: 'var(--text-primary)', 
                                fontSize: '13px', 
                                lineHeight: 1.35,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                                marginBottom: '3px'
                              }}
                            >
                              {line.productName}
                            </div>

                            {/* Line 3: SKU | HSN on ONE single line */}
                            <div 
                              style={{ 
                                fontSize: '11px', 
                                color: 'var(--text-tertiary)', 
                                whiteSpace: 'nowrap', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px'
                              }}
                            >
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>{line.productSku}</span>
                              <span style={{ color: 'var(--border-medium)', fontWeight: 300 }}>|</span>
                              <span>HSN: {line.hsnCode}</span>
                            </div>
                          </td>

                          {/* Quantity Stepper */}
                          <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const q = Math.max(1, line.quantity - 1);
                                  setTermLines(prev => prev.map((pl, i) => i === idx ? { ...pl, quantity: q } : pl));
                                }}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  background: 'var(--bg-secondary)',
                                  border: 'none',
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontSize: '13px'
                                }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => {
                                  const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                                  setTermLines(prev => prev.map((pl, i) => i === idx ? { ...pl, quantity: q } : pl));
                                }}
                                style={{
                                  width: '42px',
                                  height: '24px',
                                  padding: '0 2px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textAlign: 'center',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const q = line.quantity + 1;
                                  setTermLines(prev => prev.map((pl, i) => i === idx ? { ...pl, quantity: q } : pl));
                                }}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  background: 'var(--bg-secondary)',
                                  border: 'none',
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontSize: '13px'
                                }}
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Unit Cost */}
                          <td style={{ padding: '10px', textAlign: 'right', verticalAlign: 'middle' }}>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={line.unitCost}
                              onChange={(e) => {
                                const cost = parseFloat(e.target.value) || 0;
                                setTermLines(prev => prev.map((pl, i) => i === idx ? { ...pl, unitCost: cost } : pl));
                              }}
                              style={{
                                width: '80px',
                                padding: '4px 6px',
                                borderRadius: '4px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-medium)',
                                color: '#38BDF8',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                textAlign: 'right',
                                fontFamily: 'var(--font-mono)'
                              }}
                            />
                          </td>

                          {/* Taxable */}
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right', verticalAlign: 'middle' }}>
                            ₹{(line.quantity * line.unitCost).toFixed(2)}
                          </td>

                          {/* Total */}
                          <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: '#10B981', textAlign: 'right', verticalAlign: 'middle' }}>
                            ₹{(line.quantity * line.unitCost * (1 + line.gstRate / 100)).toFixed(2)}
                          </td>

                          {/* Delete */}
                          <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (termLines.length > 1) {
                                  setTermLines(prev => prev.filter((_, i) => i !== idx));
                                }
                              }}
                              disabled={termLines.length <= 1}
                              title={termLines.length <= 1 ? "At least one item required" : "Remove item"}
                              style={{
                                background: termLines.length <= 1 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${termLines.length <= 1 ? 'transparent' : 'rgba(239, 68, 68, 0.25)'}`,
                                borderRadius: '5px',
                                color: termLines.length <= 1 ? 'var(--text-disabled)' : '#EF4444',
                                cursor: termLines.length <= 1 ? 'not-allowed' : 'pointer',
                                padding: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Order Overview & Actions */}
            <div className="billing-right-col">
              
              <div 
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Order Overview</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--accent-orange)' }}>
                    PO-DRAFT
                  </span>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Supplier: <strong style={{ color: '#FFF' }}>{termSelectedVendor?.name}</strong></div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Current Payable Bal: <strong style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>₹{termSelectedVendor?.closingBalance.toLocaleString('en-IN')} (Cr)</strong></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Taxable Subtotal</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{termCalculations.subtotal.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)' }}>
                    <span>CGST + SGST (18%)</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>₹{termCalculations.totalGst.toFixed(2)}</span>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>Grand Total</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                      ₹{termCalculations.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleSaveTerminalPO(false)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '7px',
                      background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 107, 0, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={16} /> Issue Purchase Order (Pending)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveTerminalPO(true)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '7px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={16} /> Save & Confirm Inward Arrival
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* PURCHASE ORDERS REGISTER TABLE */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Purchase Orders Register ({filteredPurchaseOrders.length})
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Pending orders can be <strong>re-edited</strong>, <strong>cancelled</strong>, or <strong>confirmed on arrival</strong>.
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PO Number</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Supplier / Vendor</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Items & Quantity</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Taxable Amt</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Grand Total</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchaseOrders.map(po => {
                    const isPending = po.status === 'PENDING';
                    const isCancelled = po.status === 'CANCELLED';
                    const isConfirmed = po.status === 'CONFIRMED_RECEIVED';

                    return (
                      <tr key={po.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', opacity: isCancelled ? 0.7 : 1 }}>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                          {po.poNumber}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {formatDate(po.orderDate)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{po.vendorName}</div>
                          <span 
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: po.vendorType === 'MANUFACTURER' ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: po.vendorType === 'MANUFACTURER' ? '#38BDF8' : '#10B981'
                            }}
                          >
                            {po.vendorType}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {po.lineItems.reduce((s, i) => s + i.quantity, 0)} Units
                          </span>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {po.lineItems[0]?.productName} {po.lineItems.length > 1 ? `+${po.lineItems.length - 1} more` : ''}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ₹{po.subtotalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: isCancelled ? '#EF4444' : '#10B981' }}>
                          ₹{po.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {isPending ? (
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#F59E0B',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                              }}
                            >
                              <Clock size={12} />
                              PENDING INWARD
                            </span>
                          ) : isConfirmed ? (
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10B981',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <CheckCircle2 size={12} />
                              CONFIRMED IN WAREHOUSE
                            </span>
                          ) : (
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#EF4444',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              <XCircle size={12} />
                              CANCELLED
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {isPending ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              
                              {/* Re-edit Order Button */}
                              <button
                                onClick={() => handleOpenEditPO(po)}
                                title="Re-edit Order Items & Quantities"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 107, 0, 0.12)',
                                  border: '1px solid rgba(255, 107, 0, 0.3)',
                                  color: 'var(--accent-orange)',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Edit3 size={13} />
                                Edit
                              </button>

                              {/* Cancel Order Button */}
                              <button
                                onClick={() => handleOpenCancelPO(po)}
                                title="Cancel this Pending Purchase Order"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(239, 68, 68, 0.12)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#EF4444',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <XCircle size={13} />
                                Cancel
                              </button>

                              {/* Confirm Inward Button */}
                              <button
                                onClick={() => handleConfirmReceipt(po)}
                                title="Confirm Inward Arrival into Warehouse Stock"
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                  border: 'none',
                                  color: '#FFF',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                              >
                                <CheckCircle2 size={14} />
                                Confirm Inward
                              </button>

                            </div>
                          ) : isConfirmed ? (
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              Received: {formatDate(po.receivedDate || po.orderDate)}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#EF4444', fontStyle: 'italic' }}>
                              Order Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* SUBSECTION 2: PURCHASED RETURNS (DAMAGED STOCK TO SUPPLIERS)         */}
      {/* ==================================================================== */}
      {activeTab === 'purchase_returns' && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Supplier Purchase Returns & Debit Notes Register ({purchaseReturns.length})
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Debit Notes issued to suppliers for damaged or defective stock. Deducts directly from vendor closing balance and decrements Damaged Stock.
              </span>
            </div>
            <button
              onClick={() => setShowPurchaseReturnModal(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#EF4444',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={14} /> + New Purchase Return
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Debit Note #</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Return Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Supplier Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Damaged Products</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Returned Qty</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Debit Note Value</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseReturns.map(pr => (
                  <tr key={pr.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#EF4444', fontSize: '13px' }}>
                      {pr.debitNoteNumber}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {formatDate(pr.returnDate)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {pr.vendorName}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {pr.lineItems[0]?.productName} {pr.lineItems.length > 1 ? `+${pr.lineItems.length - 1} more` : ''}
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Reason: {pr.lineItems[0]?.reasonForReturn}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {pr.lineItems.reduce((s, i) => s + i.damagedQuantity, 0)} Units
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: '#EF4444' }}>
                      -₹{pr.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span 
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        POSTED & DEDUCTED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUBSECTION 3: VENDOR PAYMENTS & LEDGER SETTLEMENTS                   */}
      {/* ==================================================================== */}
      {activeTab === 'vendor_ledger' && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Select Supplier Account Statement
              </span>
              <div style={{ marginTop: '4px' }}>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 700,
                    minWidth: '280px'
                  }}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.partyType} - {v.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setDisburseVendorId(selectedVendor.id);
                  setShowDisbursementModal(true);
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <IndianRupee size={15} /> Disburse Payment
              </button>

              <div style={{ textAlign: 'right', background: 'rgba(255, 107, 0, 0.1)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255, 107, 0, 0.3)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Live Closing Balance (Payable)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedVendor.closingBalance.toLocaleString('en-IN')} (Cr)
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Voucher Ref</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Particulars</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Debit (Paid/Returned)</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Credit (Purchased)</th>
                  <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {activeLedgerRows.map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(row.date)}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.voucherNumber}</td>
                    <td style={{ padding: '12px' }}>
                      <span 
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: row.voucherType === 'PURCHASE' ? 'rgba(255, 107, 0, 0.15)' : row.voucherType === 'DEBIT_NOTE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: row.voucherType === 'PURCHASE' ? 'var(--accent-orange)' : row.voucherType === 'DEBIT_NOTE' ? '#EF4444' : '#10B981'
                        }}
                      >
                        {row.voucherType}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-primary)' }}>{row.particulars}</td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: row.debitAmount > 0 ? '#10B981' : 'var(--text-tertiary)' }}>
                      {row.debitAmount > 0 ? `₹${row.debitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: row.creditAmount > 0 ? 'var(--accent-orange)' : 'var(--text-tertiary)' }}>
                      {row.creditAmount > 0 ? `₹${row.creditAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                      ₹{row.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({row.balanceType})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* SUBSECTION 4: SUPPLIERS & VENDORS MASTER DIRECTORY (ACTIVE & ARCHIVE)*/}
      {/* ==================================================================== */}
      {activeTab === 'vendors_directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Supplier Directory Sub-tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setVendorSubTab('ACTIVE_SUPPLIERS')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  background: vendorSubTab === 'ACTIVE_SUPPLIERS' ? 'var(--accent-orange)' : 'transparent',
                  color: vendorSubTab === 'ACTIVE_SUPPLIERS' ? '#FFF' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Building2 size={14} />
                Active Suppliers ({activeVendors.length})
              </button>

              <button
                onClick={() => setVendorSubTab('ARCHIVED_SUPPLIERS')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  background: vendorSubTab === 'ARCHIVED_SUPPLIERS' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                  color: vendorSubTab === 'ARCHIVED_SUPPLIERS' ? '#EF4444' : 'var(--text-secondary)',
                  border: `1px solid ${vendorSubTab === 'ARCHIVED_SUPPLIERS' ? 'rgba(239, 68, 68, 0.4)' : 'transparent'}`,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Archive size={14} />
                Archived Suppliers ({archivedVendors.length})
              </button>
            </div>

            <button
              onClick={() => setShowAddVendorModal(true)}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                border: 'none',
                color: '#FFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={14} /> + Register New Supplier
            </button>
          </div>

          {/* ACTIVE SUPPLIERS GRID */}
          {vendorSubTab === 'ACTIVE_SUPPLIERS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
              {filteredActiveVendors.map(vendor => {
                const isMfg = vendor.partyType === 'MANUFACTURER';
                return (
                  <div 
                    key={vendor.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span 
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isMfg ? 'rgba(2, 132, 199, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isMfg ? '#38BDF8' : '#10B981',
                            border: `1px solid ${isMfg ? 'rgba(2, 132, 199, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                          }}
                        >
                          {isMfg ? '🏭 MANUFACTURER (DIRECT BRAND)' : '🌐 DISTRIBUTOR (MULTI-BRAND)'}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                          {vendor.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          Code: {vendor.vendorCode} • {vendor.city} ({vendor.stateCode})
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Closing Balance</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>
                          ₹{vendor.closingBalance.toLocaleString('en-IN')} (Cr)
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📱 Phone: <strong>{vendor.phone}</strong></div>
                      <div>🏛️ GSTIN: {vendor.gstin || 'Unregistered / In-House'}</div>
                      <div>⏳ Payment Terms: <strong>{vendor.creditTermsDays} Days</strong></div>
                      {isMfg && vendor.brandName && (
                        <div style={{ color: '#38BDF8', fontWeight: 600 }}>🏷️ Brand Scope: {vendor.brandName}</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', alignItems: 'center' }}>
                      <button
                        onClick={() => {
                          setTermVendorId(vendor.id);
                          setActiveTab('purchase_orders');
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          background: 'var(--accent-orange)',
                          border: 'none',
                          color: '#FFF',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Place Order
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVendorId(vendor.id);
                          setActiveTab('vendor_ledger');
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        View Ledger
                      </button>

                      <button
                        onClick={() => handleOpenArchiveVendor(vendor)}
                        title="Remove / Deactivate this Supplier"
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#EF4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ARCHIVED SUPPLIERS TABLE */}
          {vendorSubTab === 'ARCHIVED_SUPPLIERS' && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Archive size={16} /> Archived Sourcing Suppliers ({filteredArchivedVendors.length})
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Deactivated suppliers with 100% lifetime historical Purchase Orders, goods inward receipts, and double-entry ledgers preserved.
                </span>
              </div>

              {filteredArchivedVendors.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  No suppliers in archive. All suppliers are active.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                        <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Supplier Name</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type & City</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Archived On</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Archival Reason</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Historical POs</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Preserved Payable</th>
                        <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArchivedVendors.map(vendor => {
                        const pos = purchaseOrders.filter(p => p.vendorId === vendor.id);
                        const totalSpend = pos.reduce((s, p) => s + p.grandTotal, 0);

                        return (
                          <tr key={vendor.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(239, 68, 68, 0.03)' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>
                                {vendor.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Code: {vendor.vendorCode}</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <div>{vendor.partyType}</div>
                              <div style={{ color: 'var(--text-tertiary)' }}>{vendor.city} ({vendor.stateCode})</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                              {formatDate(vendor.archivedAt || getTodayISODate())}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: '#EF4444' }}>
                              {vendor.archiveReason || 'Deactivated by user'}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pos.length} Orders</span>
                              <div style={{ fontSize: '11px', color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                                Total Spend: ₹{totalSpend.toLocaleString('en-IN')}
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--accent-orange)' }}>
                              ₹{vendor.closingBalance.toLocaleString('en-IN')} (Cr)
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => {
                                    setSelectedVendorId(vendor.id);
                                    setActiveTab('vendor_ledger');
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-medium)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  View Ledger
                                </button>

                                <button
                                  onClick={() => handleReactivateVendor(vendor.id)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    border: 'none',
                                    color: '#FFF',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <RotateCcw size={13} /> Reactivate Supplier
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: RE-EDIT PENDING PURCHASE ORDER                                */}
      {/* ==================================================================== */}
      {showEditPoModal && editingPo && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '860px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span 
                    style={{
                      background: 'rgba(255, 107, 0, 0.15)',
                      color: 'var(--accent-orange)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    RE-EDIT ORDER
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Modify Purchase Order: {editingPo.poNumber}
                  </h3>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Update quantities, add/remove items, or adjust unit procurement prices while order is Pending.
                </span>
              </div>
              <button 
                onClick={() => setShowEditPoModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => handleSaveEditedPO(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Top Row: Vendor Selector & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Supplier / Vendor
                  </label>
                  <select
                    value={editPoVendorId}
                    onChange={(e) => setEditPoVendorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.partyType} - {v.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    PO Date
                  </label>
                  <input
                    type="date"
                    value={editPoOrderDate}
                    onChange={(e) => setEditPoOrderDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Edit Line Items Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={15} color="var(--accent-orange)" />
                    Products to Procure ({editPoLines.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const firstAvail = editAvailableProductsForPO[0] || products[0];
                      setEditPoLines(prev => [
                        ...prev,
                        {
                          productId: firstAvail.id,
                          productSku: firstAvail.sku,
                          productName: firstAvail.name,
                          hsnCode: firstAvail.hsnCode,
                          quantity: 20,
                          unitCost: firstAvail.purchaseBaseCost,
                          gstRate: firstAvail.gstRate
                        }
                      ]);
                    }}
                    style={{
                      background: 'rgba(255, 107, 0, 0.15)',
                      border: '1px solid rgba(255, 107, 0, 0.35)',
                      color: 'var(--accent-orange)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Plus size={15} /> + Add Product
                  </button>
                </div>

                <div style={{ overflowX: 'auto', width: '100%', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)' }}>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', width: '42%' }}>Product to Procure</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', width: '16%', textAlign: 'center' }}>Quantity</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', width: '18%' }}>Unit Cost (₹)</th>
                        <th style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', width: '18%', textAlign: 'right' }}>Total (Incl GST)</th>
                        <th style={{ padding: '10px 8px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', width: '6%', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editPoLines.map((line, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                          {/* Product Select */}
                          <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                            <select
                              value={line.productId}
                              onChange={(e) => {
                                const p = products.find(prod => prod.id === e.target.value);
                                if (p) {
                                  setEditPoLines(prev => prev.map((pl, i) => i === idx ? {
                                    ...pl,
                                    productId: p.id,
                                    productSku: p.sku,
                                    productName: p.name,
                                    hsnCode: p.hsnCode,
                                    unitCost: p.purchaseBaseCost,
                                    gstRate: p.gstRate
                                  } : pl));
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-medium)',
                                color: 'var(--text-primary)',
                                fontSize: '12.5px',
                                fontWeight: 600
                              }}
                            >
                              {editAvailableProductsForPO.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku}) — Base Cost: ₹{p.purchaseBaseCost}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Quantity Stepper */}
                          <td style={{ padding: '10px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const newQty = Math.max(1, line.quantity - 1);
                                  setEditPoLines(prev => prev.map((pl, i) => i === idx ? { ...pl, quantity: newQty } : pl));
                                }}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  background: 'var(--bg-secondary)',
                                  border: 'none',
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontSize: '13px'
                                }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => {
                                  const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                                  setEditPoLines(prev => prev.map((pl, i) => i === idx ? { ...pl, quantity: qty } : pl));
                                }}
                                style={{
                                  width: '46px',
                                  height: '24px',
                                  padding: '0 2px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textAlign: 'center',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newQty = line.quantity + 1;
                                  setEditPoLines(prev => prev.map((pl, i) => i === idx ? { ...pl, quantity: newQty } : pl));
                                }}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  background: 'var(--bg-secondary)',
                                  border: 'none',
                                  color: 'var(--text-primary)',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                  fontSize: '13px'
                                }}
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Unit Cost */}
                          <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <span style={{ position: 'absolute', left: '8px', fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>₹</span>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={line.unitCost}
                                onChange={(e) => {
                                  const cost = parseFloat(e.target.value) || 0;
                                  setEditPoLines(prev => prev.map((pl, i) => i === idx ? { ...pl, unitCost: cost } : pl));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '7px 8px 7px 22px',
                                  borderRadius: '6px',
                                  background: 'var(--bg-tertiary)',
                                  border: '1px solid var(--border-medium)',
                                  color: 'var(--text-primary)',
                                  fontSize: '12.5px',
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-mono)'
                                }}
                              />
                            </div>
                          </td>

                          {/* Line Total */}
                          <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'middle' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: '#10B981' }}>
                              ₹{(line.quantity * line.unitCost * (1 + line.gstRate / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                              ({line.gstRate}% GST)
                            </div>
                          </td>

                          {/* Delete Row */}
                          <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (editPoLines.length > 1) {
                                  setEditPoLines(prev => prev.filter((_, i) => i !== idx));
                                }
                              }}
                              disabled={editPoLines.length <= 1}
                              title={editPoLines.length <= 1 ? "At least one product required" : "Remove this item"}
                              style={{
                                background: editPoLines.length <= 1 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(239, 68, 68, 0.12)',
                                border: `1px solid ${editPoLines.length <= 1 ? 'transparent' : 'rgba(239, 68, 68, 0.3)'}`,
                                borderRadius: '6px',
                                color: editPoLines.length <= 1 ? 'var(--text-disabled)' : '#EF4444',
                                cursor: editPoLines.length <= 1 ? 'not-allowed' : 'pointer',
                                padding: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations Footer Summary */}
              <div 
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '10px'
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>Taxable Subtotal: <strong>₹{editPoCalculations.subtotal.toFixed(2)}</strong></div>
                  <div>GST ({editPoSelectedVendor?.stateCode === '27' ? 'CGST+SGST' : 'IGST'}): <strong>₹{editPoCalculations.totalGst.toFixed(2)}</strong></div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Updated Total Amount</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    ₹{editPoCalculations.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  PO Instructions / Notes
                </label>
                <input
                  type="text"
                  placeholder="Notes..."
                  value={editPoNotes}
                  onChange={(e) => setEditPoNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowEditPoModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Discard Edits
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSaveEditedPO(e, true)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={16} /> Save & Confirm Inward Arrival
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF851B 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 107, 0, 0.35)'
                  }}
                >
                  Save Changes (Keep Pending)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CANCEL PENDING PURCHASE ORDER                                 */}
      {/* ==================================================================== */}
      {showCancelPoModal && cancellingPo && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444'
                  }}
                >
                  <XCircle size={18} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Cancel Purchase Order
                </h3>
              </div>
              <button 
                onClick={() => setShowCancelPoModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to cancel Purchase Order <strong style={{ color: 'var(--text-primary)' }}>{cancellingPo.poNumber}</strong> for <strong style={{ color: 'var(--text-primary)' }}>{cancellingPo.vendorName}</strong> (Total: ₹{cancellingPo.grandTotal.toLocaleString('en-IN')})?
              </p>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                ℹ️ Cancelling this order will mark its status as <strong style={{ color: '#EF4444' }}>CANCELLED</strong>. No stock will be added to inventory and no financial liabilities will be credited.
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Reason for Cancellation *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}
                >
                  <option value="Order specifications changed / re-evaluated by procurement team">Order specifications changed / re-evaluated</option>
                  <option value="Supplier unable to deliver within required lead time">Supplier unable to deliver within lead time</option>
                  <option value="Pricing / quotation renegotiation required">Pricing / quotation renegotiation required</option>
                  <option value="Duplicate order created inadvertently">Duplicate order created inadvertently</option>
                  <option value="Customer order cancelled (B2B linked procurement)">Customer order cancelled</option>
                </select>

                <input
                  type="text"
                  placeholder="Or type custom reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelPoModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Keep Order Active
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancelPO}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                  }}
                >
                  Yes, Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD NEW SUPPLIER / VENDOR                                     */}
      {/* ==================================================================== */}
      {showAddVendorModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '560px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Register New Supplier (Manufacturer / Distributor)
              </h3>
              <button onClick={() => setShowAddVendorModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Supplier Type *
                  </label>
                  <select
                    value={newVendorType}
                    onChange={(e: any) => setNewVendorType(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="MANUFACTURER">Manufacturer (Brand Scoped)</option>
                    <option value="DISTRIBUTOR">Distributor (Multi-Brand Hub)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Firm / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cello World Ltd"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {newVendorType === 'MANUFACTURER' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Manufactured Brand Name (For catalog product filtering)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cello, Nilkamal, Supreme"
                    value={newVendorBrand}
                    onChange={(e) => setNewVendorBrand(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Daman"
                    value={newVendorCity}
                    onChange={(e) => setNewVendorCity(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="27AAAC..."
                    value={newVendorGstin}
                    onChange={(e) => setNewVendorGstin(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Opening Balance (Cr ₹)
                  </label>
                  <input
                    type="number"
                    value={newVendorOpeningBal}
                    onChange={(e) => setNewVendorOpeningBal(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'var(--accent-orange)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PURCHASE RETURN (DAMAGED / DEFECTIVE GOODS)                   */}
      {/* ==================================================================== */}
      {showPurchaseReturnModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '680px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={18} /> Issue Supplier Purchase Return (Debit Note)
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Returns damaged stock to supplier, decreases Damaged Stock pool & debits supplier payable.
                </span>
              </div>
              <button onClick={() => setShowPurchaseReturnModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePurchaseReturn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Return to Supplier *
                </label>
                <select
                  value={returnVendorId}
                  onChange={(e) => setReturnVendorId(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} — Current Payable Bal: ₹{v.closingBalance.toLocaleString('en-IN')} (Cr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Damaged Items to Return
                </label>
                {returnLines.map((line, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 2fr',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--bg-tertiary)',
                      padding: '10px',
                      borderRadius: '6px',
                      marginBottom: '6px'
                    }}
                  >
                    <select
                      value={line.productId}
                      onChange={(e) => {
                        const p = products.find(prod => prod.id === e.target.value);
                        if (p) {
                          setReturnLines(prev => prev.map((pl, i) => i === idx ? {
                            ...pl,
                            productId: p.id,
                            productSku: p.sku,
                            productName: p.name,
                            unitCost: p.purchaseBaseCost,
                            gstRate: p.gstRate,
                            damagedQuantity: Math.min(2, p.damagedStock || 1)
                          } : pl));
                        }
                      }}
                      style={{ padding: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '12px' }}
                    >
                      {products.filter(p => p.damagedStock > 0).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Damaged Pool: {p.damagedStock} Pcs)
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={line.damagedQuantity}
                      onChange={(e) => {
                        const q = parseInt(e.target.value, 10) || 1;
                        setReturnLines(prev => prev.map((pl, i) => i === idx ? { ...pl, damagedQuantity: q } : pl));
                      }}
                      style={{ padding: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '12px' }}
                    />

                    <input
                      type="number"
                      placeholder="Unit Cost"
                      value={line.unitCost}
                      onChange={(e) => {
                        const c = parseFloat(e.target.value) || 0;
                        setReturnLines(prev => prev.map((pl, i) => i === idx ? { ...pl, unitCost: c } : pl));
                      }}
                      style={{ padding: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '12px' }}
                    />

                    <input
                      type="text"
                      placeholder="Damage Reason"
                      value={line.reason}
                      onChange={(e) => {
                        const r = e.target.value;
                        setReturnLines(prev => prev.map((pl, i) => i === idx ? { ...pl, reason: r } : pl));
                      }}
                      style={{ padding: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '12px' }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Debit Note Narration / Notes
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPurchaseReturnModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Post Debit Note & Deduct Damaged Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: DISBURSE VENDOR PAYMENT                                       */}
      {/* ==================================================================== */}
      {showDisbursementModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '520px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={18} /> Record Supplier Payment Disbursement
              </h3>
              <button onClick={() => setShowDisbursementModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDisbursement} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Pay to Supplier *
                </label>
                <select
                  value={disburseVendorId}
                  onChange={(e) => setDisburseVendorId(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} — Payable Balance: ₹{v.closingBalance.toLocaleString('en-IN')} (Cr)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Payment Amount ₹ *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={disburseAmount}
                    onChange={(e) => setDisburseAmount(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={disburseMode}
                    onChange={(e: any) => setDisburseMode(e.target.value)}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="NEFT_RTGS">Bank NEFT / RTGS</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="CHEQUE">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Reference / UTR #
                  </label>
                  <input
                    type="text"
                    value={disburseRef}
                    onChange={(e) => setDisburseRef(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Disbursement Date
                  </label>
                  <input
                    type="date"
                    value={disburseDate}
                    onChange={(e) => setDisburseDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDisbursementModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', border: 'none', color: '#FFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Disburse & Debit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CONFIRM ARCHIVE / REMOVE SUPPLIER ACCOUNT                     */}
      {/* ==================================================================== */}
      {showArchiveVendorModal && vendorToArchive && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '520px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EF4444'
                  }}
                >
                  <Archive size={18} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Deactivate Sourcing Supplier
                </h3>
              </div>
              <button 
                onClick={() => setShowArchiveVendorModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to remove supplier <strong style={{ color: 'var(--text-primary)' }}>{vendorToArchive.name}</strong> ({vendorToArchive.partyType}) from active procurement?
              </p>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                🔒 <strong>Historical Data Guaranteed</strong>: All past Purchase Orders, warehouse goods inward records, debit notes, and payment ledgers for this supplier will remain completely preserved in the <strong>Archived Suppliers</strong> section. You can reactivate this supplier anytime!
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Reason for Deactivation *
                </label>
                <select
                  value={archiveVendorReason}
                  onChange={(e) => setArchiveVendorReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}
                >
                  <option value="Supplier discontinued product lines / operational pause">Supplier discontinued product lines / operational pause</option>
                  <option value="Switched to alternative regional distributor">Switched to alternative distributor</option>
                  <option value="Credit terms / pricing dispute">Credit terms / pricing renegotiation dispute</option>
                  <option value="Merged with parent manufacturing entity">Merged with parent entity</option>
                  <option value="Temporary pause in raw plastic procurement">Temporary pause in procurement</option>
                </select>

                <input
                  type="text"
                  placeholder="Or type custom reason..."
                  value={archiveVendorReason}
                  onChange={(e) => setArchiveVendorReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowArchiveVendorModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Keep Supplier Active
                </button>

                <button
                  type="button"
                  onClick={handleConfirmArchiveVendor}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                  }}
                >
                  Yes, Move to Archived
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
