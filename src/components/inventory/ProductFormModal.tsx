import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BarcodeDisplay } from '../../utils/barcode';
import { X, Sparkles, Barcode as BarcodeIcon } from 'lucide-react';

interface ProductFormModalProps {
  productToEdit?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productToEdit,
  isOpen,
  onClose
}) => {
  const { addProduct, updateProduct, products } = useApp();

  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'Electronics',
    costPrice: 0,
    sellingPrice: 0,
    taxRate: 10,
    stock: 10,
    minStockAlert: 5,
    unit: 'pcs' as Product['unit'],
    supplier: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.sku,
        barcode: productToEdit.barcode,
        name: productToEdit.name,
        category: productToEdit.category,
        costPrice: productToEdit.costPrice,
        sellingPrice: productToEdit.sellingPrice,
        taxRate: productToEdit.taxRate,
        stock: productToEdit.stock,
        minStockAlert: productToEdit.minStockAlert,
        unit: productToEdit.unit,
        supplier: productToEdit.supplier,
        location: productToEdit.location,
        description: productToEdit.description || ''
      });
    } else {
      // Default new product with auto-generated barcode
      const randomSuffix = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      setFormData({
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: randomSuffix,
        name: '',
        category: 'Electronics',
        costPrice: 15.00,
        sellingPrice: 29.99,
        taxRate: 10,
        stock: 20,
        minStockAlert: 5,
        unit: 'pcs',
        supplier: 'Apex Distribution',
        location: 'Aisle 1, Shelf A',
        description: ''
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleGenerateBarcode = () => {
    // Generate valid 12-digit standard UPC format
    const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setFormData(prev => ({ ...prev, barcode: randomCode }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.barcode.trim()) {
      alert('Please fill in Product Name, SKU, and Barcode.');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, formData);
    } else {
      addProduct(formData);
    }
    onClose();
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <BarcodeIcon className="w-4 h-4 text-emerald-400" />
            <span>{productToEdit ? 'Edit Product Item' : 'Register New Inventory Product'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Barcode & SKU Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stock Keeping Unit (SKU) *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. LOG-MXM3S"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Barcode (UPC / EAN / Code 128) *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.barcode}
                onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 097855175235"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Barcode Vector Preview */}
          {formData.barcode && (
            <div className="p-3 bg-white rounded-lg flex flex-col items-center justify-center border border-slate-300">
              <BarcodeDisplay
                value={formData.barcode}
                height={34}
                showText={true}
                barColor="#0f172a"
              />
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                Live vector preview: Ready for thermal scanner recognition
              </span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Logitech MX Master 3S Wireless Mouse"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
              />
              <datalist id="category-suggestions">
                {categories.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stocking Unit
              </label>
              <select
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value as Product['unit'] })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="liter">Liter</option>
                <option value="meter">Meter</option>
              </select>
            </div>
          </div>

          {/* Financials: Cost, Selling Price, Tax Rate */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded font-mono tabular-nums outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Selling Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded font-mono tabular-nums outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.taxRate}
                onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded font-mono tabular-nums outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Stock & Reorder Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Initial / Current Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono tabular-nums outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Low Stock Warning Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStockAlert}
                onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono tabular-nums outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Supplier & Warehouse Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Primary Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g. Apex Tech Distribution"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Aisle / Shelf Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Aisle 2, Bin 14"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              {productToEdit ? 'Save Changes' : 'Register Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
