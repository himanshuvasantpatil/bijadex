/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DesktopHeader } from './components/DesktopHeader';
import { DesktopSidebar } from './components/DesktopSidebar';
import { POSStation } from './components/pos/POSStation';
import { InventoryManager } from './components/inventory/InventoryManager';
import { FinancialReports } from './components/reports/FinancialReports';
import { InvoiceHistory } from './components/invoices/InvoiceHistory';
import { ExpenseManager } from './components/expenses/ExpenseManager';
import { CustomerManager } from './components/customers/CustomerManager';
import { BarcodeLabelsModal } from './components/BarcodeLabelsModal';
import { ScannerModal } from './components/ScannerModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { StoreManager } from './components/stores/StoreManager';
import { StockTransferManager } from './components/transfers/StockTransferManager';
import { PurchaseOrderManager } from './components/purchases/PurchaseOrderManager';
import { RegisterShiftManager } from './components/shifts/RegisterShiftManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { useHardwareScanner } from './utils/barcode';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DesktopAppContent: React.FC = () => {
  const { 
    activeTab, 
    handleBarcodeScan, 
    scanFeedback 
  } = useApp();

  // Listen for hardware USB / Bluetooth handheld barcode scanner guns globally
  useHardwareScanner((scannedCode) => {
    handleBarcodeScan(scannedCode);
  }, true);

  // Auto-dismiss scan feedback toast
  const [visibleToast, setVisibleToast] = useState<typeof scanFeedback | null>(null);

  useEffect(() => {
    if (scanFeedback) {
      setVisibleToast(scanFeedback);
      const timer = setTimeout(() => {
        setVisibleToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [scanFeedback]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Desktop App Titlebar & Navigation */}
      <DesktopHeader />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Desktop Sidebar */}
        <DesktopSidebar />

        {/* Viewport Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'pos' && <POSStation />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'reports' && <FinancialReports />}
          {activeTab === 'invoices' && <InvoiceHistory />}
          {activeTab === 'transfers' && <StockTransferManager />}
          {activeTab === 'purchases' && <PurchaseOrderManager />}
          {activeTab === 'shifts' && <RegisterShiftManager />}
          {activeTab === 'expenses' && <ExpenseManager />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'stores' && <StoreManager />}
          {activeTab === 'labels' && <BarcodeLabelsModal />}
          {activeTab === 'settings' && <SettingsManager />}
        </main>
      </div>

      {/* Modals & Wizards */}
      <OnboardingWizard />
      <ScannerModal />
      <InvoicePrintModal />
      <ShortcutsModal />

      {/* Floating Barcode Scan Feedback Toast */}
      {visibleToast && (
        <div className="fixed top-14 right-5 z-50 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
            visibleToast.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/80 text-emerald-100 shadow-emerald-950/50'
              : 'bg-slate-900/95 border-amber-500/80 text-amber-100 shadow-amber-950/50'
          }`}>
            {visibleToast.type === 'success' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                <span>{visibleToast.message}</span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {visibleToast.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {visibleToast.type === 'success' ? 'Hardware Scanner verified · Action executed' : 'Not found in active inventory catalog'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DesktopAppContent />
    </AppProvider>
  );
}
