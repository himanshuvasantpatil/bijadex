import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { BarcodeDisplay } from '../utils/barcode';
import { formatCurrency, formatDateTime } from '../utils/format';
import { 
  X, 
  Printer, 
  FileText, 
  Receipt as ReceiptIcon, 
  Check, 
  Copy 
} from 'lucide-react';

export const InvoicePrintModal: React.FC = () => {
  const { selectedInvoiceForPrint, setSelectedInvoiceForPrint, organization } = useApp();
  const [printFormat, setPrintFormat] = useState<'thermal' | 'tax_invoice'>('thermal');
  const [copied, setCopied] = useState(false);

  if (!selectedInvoiceForPrint) return null;
  const inv: Invoice = selectedInvoiceForPrint;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `
${organization.name.toUpperCase()} - INVOICE ${inv.invoiceNumber}
Date: ${formatDateTime(inv.date)}
Store: ${inv.storeName || 'Primary Store'}
Customer: ${inv.customer ? inv.customer.name : 'Walk-in'}
Items:
${inv.items.map(item => ` - ${item.product.name} x${item.quantity} = ${formatCurrency(item.total)}`).join('\n')}
Subtotal: ${formatCurrency(inv.subtotal)}
Discount: -${formatCurrency(inv.discountAmount)}
Tax: ${formatCurrency(inv.taxTotal)}
GRAND TOTAL: ${formatCurrency(inv.grandTotal)}
Payment Method: ${inv.paymentMethod.toUpperCase()}
Status: ${inv.status.toUpperCase()}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Receipt & Invoice Viewer: {inv.invoiceNumber}
            </h2>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setPrintFormat('thermal')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                printFormat === 'thermal'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              80mm Thermal
            </button>
            <button
              onClick={() => setPrintFormat('tax_invoice')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                printFormat === 'tax_invoice'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A4 Tax Invoice
            </button>
          </div>

          <button
            onClick={() => setSelectedInvoiceForPrint(null)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Document Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          {/* Printable Container */}
          <div
            id="printable-document"
            className={`bg-white text-slate-900 shadow-xl transition-all ${
              printFormat === 'thermal'
                ? 'w-[320px] p-5 font-mono text-[11px] leading-tight border border-slate-200'
                : 'w-[560px] p-8 text-xs font-sans border border-slate-200'
            }`}
          >
            {/* THERMAL 80mm RECEIPT LAYOUT */}
            {printFormat === 'thermal' ? (
              <div className="space-y-3">
                <div className="text-center pb-2 border-b border-dashed border-slate-400">
                  <div className="font-bold text-base tracking-wider uppercase">
                    {organization.receiptHeader || organization.name.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-slate-600 font-semibold">{inv.storeName || organization.name}</div>
                  <div className="text-[10px] text-slate-600">
                    Tel: {organization.phone} · {organization.taxName || 'Tax ID'}: {organization.taxId}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Cashier: {inv.cashier}</div>
                </div>

                <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                  <div className="flex justify-between">
                    <span>INVOICE:</span>
                    <span className="font-bold">{inv.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{formatDateTime(inv.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CUSTOMER:</span>
                    <span className="truncate max-w-[150px]">{inv.customer?.name || 'Walk-in Guest'}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-b border-dashed border-slate-400 pb-2">
                  <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-300">
                    <span className="w-1/2">ITEM</span>
                    <span className="w-1/6 text-right">QTY</span>
                    <span className="w-1/3 text-right">TOTAL</span>
                  </div>
                  <div className="space-y-1.5 pt-1.5">
                    {inv.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex justify-between">
                          <span className="w-1/2 truncate font-medium">{item.product.name}</span>
                          <span className="w-1/6 text-right tabular-nums">{item.quantity}</span>
                          <span className="w-1/3 text-right tabular-nums font-semibold">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 pl-1">
                          @{formatCurrency(item.unitPrice)} {item.taxRate > 0 ? `· ${item.taxRate}% tax` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="tabular-nums">{formatCurrency(inv.subtotal)}</span>
                  </div>
                  {inv.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({inv.discountValue}%):</span>
                      <span className="tabular-nums">-{formatCurrency(inv.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Tax:</span>
                    <span className="tabular-nums">{formatCurrency(inv.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-b border-slate-900 py-1 mt-1">
                    <span>TOTAL:</span>
                    <span className="tabular-nums">{formatCurrency(inv.grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Detail */}
                <div className="text-[10px] space-y-0.5 pt-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="uppercase font-semibold">{inv.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Tendered:</span>
                    <span className="tabular-nums">{formatCurrency(inv.amountTendered)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change Returned:</span>
                    <span className="tabular-nums font-bold">{formatCurrency(inv.changeDue)}</span>
                  </div>
                </div>

                {/* Barcode & Footer */}
                <div className="pt-3 text-center space-y-2 border-t border-dashed border-slate-400">
                  <BarcodeDisplay
                    value={inv.invoiceNumber}
                    height={36}
                    showText={false}
                    barColor="#0f172a"
                    className="mx-auto"
                  />
                  <div className="text-[9px] text-slate-500 font-mono">
                    Scan invoice barcode for returns or inquiry
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {organization.receiptFooter}
                  </div>
                  <div className="text-[10px] font-semibold pt-1">*** THANK YOU FOR YOUR BUSINESS ***</div>
                </div>
              </div>
            ) : (
              /* A4 CORPORATE TAX INVOICE LAYOUT */
              <div className="space-y-6">
                <div className="flex justify-between items-start pb-4 border-b border-slate-300">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">{organization.name.toUpperCase()}</h1>
                    <p className="text-slate-600 font-semibold text-[11px]">{inv.storeName || organization.name}</p>
                    <p className="text-slate-500 text-[11px]">{organization.address || 'Corporate Headquarters'}</p>
                    <p className="text-slate-500 text-[11px]">Tel: {organization.phone} · {organization.taxName || 'Tax ID'}: {organization.taxId}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                      TAX INVOICE
                    </span>
                    <div className="mt-2 text-sm font-bold font-mono text-slate-900">
                      {inv.invoiceNumber}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Date: {formatDateTime(inv.date)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      Billed To:
                    </div>
                    <div className="font-bold text-slate-900">{inv.customer?.name || 'Walk-in Retail Customer'}</div>
                    {inv.customer?.taxId && (
                      <div className="text-slate-600 font-mono text-[11px] mt-0.5">Tax ID: {inv.customer.taxId}</div>
                    )}
                    {inv.customer?.address && (
                      <div className="text-slate-600 text-[11px] mt-0.5">{inv.customer.address}</div>
                    )}
                    {inv.customer?.phone && (
                      <div className="text-slate-600 text-[11px] mt-0.5">Phone: {inv.customer.phone}</div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      Payment Details:
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Method:</span>
                      <span className="font-semibold uppercase">{inv.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-semibold text-emerald-700 uppercase">{inv.status}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Processed By:</span>
                      <span className="text-slate-800">{inv.cashier}</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-700 text-[10px] uppercase">
                      <th className="py-2">SKU</th>
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Tax Rate</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {inv.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-mono text-[11px] text-slate-600">{item.product.sku}</td>
                        <td className="py-2 font-medium text-slate-900">{item.product.name}</td>
                        <td className="py-2 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 text-center font-mono tabular-nums">{item.quantity}</td>
                        <td className="py-2 text-right font-mono tabular-nums">{item.taxRate}%</td>
                        <td className="py-2 text-right font-mono tabular-nums font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Calculation Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono tabular-nums">{formatCurrency(inv.subtotal)}</span>
                    </div>
                    {inv.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount ({inv.discountValue}%):</span>
                        <span className="font-mono tabular-nums">-{formatCurrency(inv.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Tax Total:</span>
                      <span className="font-mono tabular-nums">{formatCurrency(inv.taxTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-slate-900 border-t-2 border-slate-900 pt-1 mt-1">
                      <span>Total Amount:</span>
                      <span className="font-mono tabular-nums">{formatCurrency(inv.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                  <div>
                    <p>Terms: Goods once sold can be returned within 14 days with original receipt.</p>
                    <p>Computer generated tax invoice. No signature required.</p>
                  </div>
                  <BarcodeDisplay
                    value={inv.invoiceNumber}
                    height={32}
                    showText={true}
                    barColor="#0f172a"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="px-4 py-1.5 text-slate-400 hover:text-white text-xs font-medium rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print {printFormat === 'thermal' ? 'Receipt' : 'Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
