import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { BarcodeDisplay } from '../../utils/barcode';
import { ProductFormModal } from './ProductFormModal';
import { StockAdjustModal } from './StockAdjustModal';
import { 
  Plus, 
  Search, 
  Download, 
  Edit3, 
  Trash2, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  Scan,
  Barcode as BarcodeIcon,
  ShoppingCart
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { products, deleteProduct, addToCart, openScanner, stores, activeStoreId, getProductStock } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  // Quick Barcode Preview Popup State
  const [previewBarcode, setPreviewBarcode] = useState<Product | null>(null);

  // Valuation computations
  const totalCostValuation = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q);

    let stockToCheck = p.stock;
    if (locationFilter !== 'all') {
      stockToCheck = getProductStock(p.id, locationFilter);
    }

    let matchesStatus = true;
    if (stockStatusFilter === 'low') matchesStatus = stockToCheck > 0 && stockToCheck <= p.minStockAlert;
    else if (stockStatusFilter === 'out') matchesStatus = stockToCheck === 0;
    else if (stockStatusFilter === 'healthy') matchesStatus = stockToCheck > p.minStockAlert;

    return matchesCat && matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['SKU', 'Barcode', 'Product Name', 'Category', 'Stock', 'Unit', 'Cost Price', 'Selling Price', 'Margin %', 'Supplier', 'Location'];
    const rows = products.map(p => {
      const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : '0';
      return [
        `"${p.sku}"`,
        `"${p.barcode}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.stock,
        p.unit,
        p.costPrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        `${margin}%`,
        `"${p.supplier}"`,
        `"${p.location}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Top Metric Cards Strip */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {/* Total Valuation */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Total Inventory Assets (Cost)
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
            {formatCurrency(totalCostValuation)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Retail Value: <span className="text-emerald-400 font-semibold">{formatCurrency(totalRetailValuation)}</span>
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Catalog SKUs & Quantity
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
            {products.length} <span className="text-xs font-normal text-slate-400">SKUs</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Total on Hand: <span className="text-slate-200 font-semibold">{totalUnits} units</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setStockStatusFilter(stockStatusFilter === 'low' ? 'all' : 'low')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            lowStockCount > 0
              ? 'bg-amber-950/20 border-amber-800/50 hover:bg-amber-950/40'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="text-[10px] uppercase font-semibold text-amber-300 tracking-wider flex items-center justify-between">
            <span>Low Stock Reorders</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 tabular-nums mt-1">
            {lowStockCount} <span className="text-xs font-normal text-amber-400/80">items</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stockStatusFilter === 'low' ? 'Filtering active (Click to reset)' : 'Below minimum threshold'}
          </div>
        </div>

        {/* Out of Stock Alert */}
        <div
          onClick={() => setStockStatusFilter(stockStatusFilter === 'out' ? 'all' : 'out')}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            outOfStockCount > 0
              ? 'bg-rose-950/20 border-rose-800/50 hover:bg-rose-950/40'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="text-[10px] uppercase font-semibold text-rose-300 tracking-wider flex items-center justify-between">
            <span>Stockouts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums mt-1">
            {outOfStockCount} <span className="text-xs font-normal text-rose-300/80">items</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stockStatusFilter === 'out' ? 'Filtering active (Click to reset)' : 'Immediate restock required'}
          </div>
        </div>
      </div>

      {/* Toolbar / Action Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, SKU, barcode, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 pl-8 rounded-lg outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500 font-medium"
            title="Filter Inventory by Store Branch"
          >
            <option value="all">All Stores (Consolidated)</option>
            {stores.map(st => (
              <option key={st.id} value={st.id}>{st.name} [{st.code}]</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openScanner('inventory')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title="Scan item barcode to locate in table"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scan to Find</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-3 font-semibold">SKU / Barcode</th>
              <th className="py-2.5 px-3 font-semibold">Product Name & Category</th>
              <th className="py-2.5 px-3 font-semibold text-center">Stock Level</th>
              <th className="py-2.5 px-3 font-semibold text-right">Cost</th>
              <th className="py-2.5 px-3 font-semibold text-right">Selling Price</th>
              <th className="py-2.5 px-3 font-semibold text-right">Margin %</th>
              <th className="py-2.5 px-3 font-semibold">Location</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredProducts.map(p => {
              const isOut = p.stock === 0;
              const isLow = p.stock > 0 && p.stock <= p.minStockAlert;
              const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100 : 0;

              return (
                <tr key={p.id} className="hover:bg-slate-850/60 transition-colors group">
                  {/* SKU & Barcode */}
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-semibold text-slate-200">{p.sku}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] text-slate-400">{p.barcode}</span>
                      <button
                        onClick={() => setPreviewBarcode(p)}
                        className="text-slate-500 hover:text-emerald-400 p-0.5"
                        title="View & Print Vector Barcode"
                      >
                        <BarcodeIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Name & Category */}
                  <td className="py-2.5 px-3 max-w-[260px]">
                    <div className="font-medium text-slate-100 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{p.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Supplier: {p.supplier}</span>
                    </div>
                  </td>

                  {/* Stock Level */}
                  <td className="py-2.5 px-3 text-center">
                    {(() => {
                      const displayStock = locationFilter === 'all' ? p.stock : getProductStock(p.id, locationFilter);
                      const isItemOut = displayStock === 0;
                      const isItemLow = displayStock > 0 && displayStock <= p.minStockAlert;

                      return (
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded ${
                              isItemOut
                                ? 'text-rose-400 bg-rose-950/50 border border-rose-800/60'
                                : isItemLow
                                ? 'text-amber-300 bg-amber-950/50 border border-amber-800/60'
                                : 'text-emerald-300 bg-emerald-950/40 border border-emerald-800/40'
                            }`}
                          >
                            {displayStock} {p.unit}
                          </span>
                          {locationFilter !== 'all' ? (
                            <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                              (Total: {p.stock})
                            </span>
                          ) : (
                            isItemLow && (
                              <span className="text-[9px] text-amber-400 font-mono mt-0.5">
                                Min alert: {p.minStockAlert}
                              </span>
                            )
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Cost */}
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {formatCurrency(p.costPrice)}
                  </td>

                  {/* Selling Price */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(p.sellingPrice)}
                  </td>

                  {/* Margin % */}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <span className={margin >= 40 ? 'text-emerald-400 font-semibold' : margin >= 20 ? 'text-slate-200' : 'text-amber-400'}>
                      {margin.toFixed(1)}%
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono truncate max-w-[120px]">
                    {p.location || 'Warehouse Floor'}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setProductToAdjust(p);
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded transition-colors"
                        title="Adjust Stock (In/Out/Audit)"
                      >
                        Adjust
                      </button>

                      <button
                        onClick={() => addToCart(p, 1)}
                        className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                        title="Add to Billing Cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setProductToEdit(p);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        title="Edit Product Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete product "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-300">No items match your filter criteria</p>
            <p className="text-[11px] text-slate-500 mt-1">Clear filters or register a new product</p>
          </div>
        )}
      </div>

      {/* Barcode Quick Preview Modal */}
      {previewBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl flex flex-col items-center">
            <h3 className="text-xs font-bold text-white mb-1">{previewBarcode.name}</h3>
            <p className="text-[11px] text-slate-400 font-mono mb-4">SKU: {previewBarcode.sku}</p>

            <div className="p-4 bg-white rounded-lg border border-slate-300 w-full flex justify-center">
              <BarcodeDisplay
                value={previewBarcode.barcode}
                height={50}
                showText={true}
                barColor="#000000"
              />
            </div>

            <div className="mt-4 flex gap-2 w-full">
              <button
                onClick={() => setPreviewBarcode(null)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        productToEdit={productToEdit}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        product={productToAdjust}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setProductToAdjust(null);
        }}
      />
    </div>
  );
};
