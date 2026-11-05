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
import { SyncCenterModal } from './components/sync/SyncCenterModal';
import { LoginLockScreen } from './components/auth/LoginLockScreen';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { StoreManager } from './components/stores/StoreManager';
import { StaffManager } from './components/staff/StaffManager';
import { StockTransferManager } from './components/transfers/StockTransferManager';
import { PurchaseOrderManager } from './components/purchases/PurchaseOrderManager';
import { RegisterShiftManager } from './components/shifts/RegisterShiftManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { RBACAccessDenied } from './components/auth/RBACAccessDenied';
import { MobileNavBar } from './components/mobile/MobileNavBar';
import { MobileHandheldView } from './components/mobile/MobileHandheldView';
import { hasTabAccess } from './utils/rbac';
import { useHardwareScanner } from './utils/barcode';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DesktopAppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    handleBarcodeScan, 
    scanFeedback,
    currentUser,
    openScanner,
    isShortcutsOpen,
    setIsShortcutsOpen
  } = useApp();

  // Global F1 - F5 and ? Hotkeys Engine for 10/10 Speed
  useEffect(() => {
    const handleGlobalHotkeys = (e: KeyboardEvent) => {
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);

      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('reports');
      } else if (e.key === 'F4') {
        e.preventDefault();
        openScanner('pos');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('invoices');
      } else if (e.key === '?' && !isInputActive) {
        e.preventDefault();
        setIsShortcutsOpen(!isShortcutsOpen);
      }
    };

    window.addEventListener('keydown', handleGlobalHotkeys);
    return () => window.removeEventListener('keydown', handleGlobalHotkeys);
  }, [setActiveTab, openScanner, isShortcutsOpen, setIsShortcutsOpen]);

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
      {/* Mobile Top Navigation Header (< 768px) */}
      <div className="md:hidden">
        <MobileNavBar />
      </div>

      {/* Desktop App Header (>= 768px) */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Desktop Sidebar (>= 768px) */}
        <div className="hidden md:flex shrink-0">
          <DesktopSidebar />
        </div>

        {/* Viewport Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {!hasTabAccess(currentUser?.role, activeTab) ? (
            <RBACAccessDenied tab={activeTab} />
          ) : (
            <>
              {activeTab === 'pos' && <POSStation />}
              {activeTab === 'inventory' && <InventoryManager />}
              {activeTab === 'handheld' && <MobileHandheldView />}
              {activeTab === 'reports' && <FinancialReports />}
              {activeTab === 'invoices' && <InvoiceHistory />}
              {activeTab === 'transfers' && <StockTransferManager />}
              {activeTab === 'purchases' && <PurchaseOrderManager />}
              {activeTab === 'shifts' && <RegisterShiftManager />}
              {activeTab === 'expenses' && <ExpenseManager />}
              {activeTab === 'customers' && <CustomerManager />}
              {activeTab === 'stores' && <StoreManager />}
              {activeTab === 'staff' && <StaffManager />}
              {activeTab === 'labels' && <BarcodeLabelsModal />}
              {activeTab === 'settings' && <SettingsManager />}
            </>
          )}
        </main>
      </div>

      {/* Modals & Wizards */}
      <LoginLockScreen />
      <OnboardingWizard />
      <ScannerModal />
      <InvoicePrintModal />
      <ShortcutsModal />
      <SyncCenterModal />

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
