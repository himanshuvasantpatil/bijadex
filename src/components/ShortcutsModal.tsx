import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Keyboard, 
  Command, 
  ShoppingCart, 
  Boxes, 
  BarChart3, 
  Scan, 
  Receipt, 
  Zap, 
  CornerDownLeft, 
  Lock, 
  HelpCircle,
  Play,
  CheckCircle2
} from 'lucide-react';

interface ShortcutItem {
  key: string;
  label: string;
  category: 'checkout' | 'nav' | 'hardware' | 'security';
  action?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const ShortcutsModal: React.FC = () => {
  const { 
    isShortcutsOpen, 
    setIsShortcutsOpen, 
    setActiveTab, 
    openScanner 
  } = useApp();

  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  // Live Key Detector for Power Users
  useEffect(() => {
    if (!isShortcutsOpen) return;

    const detectKey = (e: KeyboardEvent) => {
      setLastKeyPressed(e.key.length === 1 ? e.key.toUpperCase() : e.key);
      const timer = setTimeout(() => setLastKeyPressed(null), 1500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('keydown', detectKey);
    return () => window.removeEventListener('keydown', detectKey);
  }, [isShortcutsOpen]);

  if (!isShortcutsOpen) return null;

  const shortcuts: ShortcutItem[] = [
    // POS Checkout & Billing
    { 
      key: 'F9', 
      label: 'Complete Sale & Print Receipt', 
      category: 'checkout',
      icon: Receipt,
      action: () => { setActiveTab('pos'); setIsShortcutsOpen(false); }
    },
    { 
      key: 'F8', 
      label: 'Fill Exact Cash Amount Tendered', 
      category: 'checkout',
      icon: Zap,
      action: () => { setActiveTab('pos'); setIsShortcutsOpen(false); }
    },
    { 
      key: '/', 
      label: 'Focus Product Search Bar Instantly', 
      category: 'checkout',
      icon: Command,
      action: () => { setActiveTab('pos'); setIsShortcutsOpen(false); }
    },
    { 
      key: 'ESC', 
      label: 'Clear Search Query / Reset Input', 
      category: 'checkout',
      icon: Command,
      action: () => { setActiveTab('pos'); setIsShortcutsOpen(false); }
    },
    { 
      key: 'ENTER', 
      label: 'Submit Barcode / Confirm Cash Input', 
      category: 'checkout',
      icon: CornerDownLeft,
      action: () => { setActiveTab('pos'); setIsShortcutsOpen(false); }
    },

    // Navigation & Views
    { 
      key: 'F1', 
      label: 'Switch to Billing & POS Terminal', 
      category: 'nav',
      icon: ShoppingCart,
      action: () => { setActiveTab('pos'); setIsShortcutsOpen(false); }
    },
    { 
      key: 'F2', 
      label: 'Switch to Inventory & Stock Control', 
      category: 'nav',
      icon: Boxes,
      action: () => { setActiveTab('inventory'); setIsShortcutsOpen(false); }
    },
    { 
      key: 'F3', 
      label: 'Switch to Financial Reports & Accounting', 
      category: 'nav',
      icon: BarChart3,
      action: () => { setActiveTab('reports'); setIsShortcutsOpen(false); }
    },
    { 
      key: 'F5', 
      label: 'Switch to Sales Receipts & Invoices', 
      category: 'nav',
      icon: Receipt,
      action: () => { setActiveTab('invoices'); setIsShortcutsOpen(false); }
    },

    // Hardware & Scanner
    { 
      key: 'F4', 
      label: 'Toggle Camera Barcode Scanner Viewfinder', 
      category: 'hardware',
      icon: Scan,
      action: () => { openScanner('pos'); setIsShortcutsOpen(false); }
    },
    { 
      key: 'USB Gun', 
      label: 'Handheld Laser Scanner (Auto-detects everywhere)', 
      category: 'hardware',
      icon: Scan
    },

    // Workstation & Security
    { 
      key: '?', 
      label: 'Toggle Power User Cheat Sheet Dashboard', 
      category: 'security',
      icon: HelpCircle,
      action: () => { setIsShortcutsOpen(false); }
    }
  ];

  const checkoutShortcuts = shortcuts.filter(s => s.category === 'checkout');
  const navShortcuts = shortcuts.filter(s => s.category === 'nav');
  const hardwareShortcuts = shortcuts.filter(s => s.category === 'hardware');
  const securityShortcuts = shortcuts.filter(s => s.category === 'security');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Power User Keyboard Cheat Sheet Dashboard</span>
                <span className="text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded">
                  10/10 SPEED
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Operate the entire Bijadex POS terminal hands-free with 0 mouse clicks
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close Cheat Sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Key Detector Bar */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span>Physical Keyboard Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>

          {lastKeyPressed ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded animate-in fade-in">
              <span>Last Key Pressed:</span>
              <kbd className="px-1.5 py-0.2 bg-slate-900 text-white rounded font-mono border border-slate-700">
                [{lastKeyPressed}]
              </kbd>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">
              Press any key on physical keyboard to test
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: POS Checkout & Speed Billing */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-800">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>POS Checkout & Fast Billing Hotkeys</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {checkoutShortcuts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={s.action}
                  className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 rounded-xl text-left transition-colors group cursor-pointer"
                  title="Click to execute shortcut action"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {s.icon && <s.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />}
                    <span className="text-xs text-slate-200 group-hover:text-white font-medium truncate">{s.label}</span>
                  </div>
                  <kbd className="px-2 py-1 bg-slate-900 group-hover:bg-emerald-950 text-emerald-400 font-mono text-[11px] font-bold rounded border border-slate-700 group-hover:border-emerald-700 shrink-0 shadow-sm">
                    {s.key}
                  </kbd>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Navigation & Views */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-800">
              <ShoppingCart className="w-4 h-4 text-sky-400" />
              <span>Workspace Navigation Views</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {navShortcuts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={s.action}
                  className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/60 rounded-xl text-left transition-colors group cursor-pointer"
                  title="Click to execute shortcut action"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {s.icon && <s.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 shrink-0" />}
                    <span className="text-xs text-slate-200 group-hover:text-white font-medium truncate">{s.label}</span>
                  </div>
                  <kbd className="px-2 py-1 bg-slate-900 group-hover:bg-sky-950 text-sky-300 font-mono text-[11px] font-bold rounded border border-slate-700 group-hover:border-sky-700 shrink-0 shadow-sm">
                    {s.key}
                  </kbd>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Hardware & Security */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-800">
                <Scan className="w-4 h-4 text-purple-400" />
                <span>Barcode Scanner Guns</span>
              </div>
              <div className="space-y-2 pt-1">
                {hardwareShortcuts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={s.action}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/60 rounded-xl text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {s.icon && <s.icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      <span className="text-xs text-slate-200 font-medium truncate">{s.label}</span>
                    </div>
                    <kbd className="px-2 py-1 bg-slate-900 text-purple-300 font-mono text-[10px] font-bold rounded border border-slate-700 shrink-0">
                      {s.key}
                    </kbd>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-800">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Cheat Sheet Controls</span>
              </div>
              <div className="space-y-2 pt-1">
                {securityShortcuts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={s.action}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 rounded-xl text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {s.icon && <s.icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      <span className="text-xs text-slate-200 font-medium truncate">{s.label}</span>
                    </div>
                    <kbd className="px-2 py-1 bg-slate-900 text-amber-300 font-mono text-[10px] font-bold rounded border border-slate-700 shrink-0">
                      {s.key}
                    </kbd>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Bijasa Platform:</span>
            <a
              href="https://bijasa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-emerald-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
              title="Official Website"
            >
              bijasa.com
            </a>
            <span className="text-slate-600">·</span>
            <a
              href="mailto:hello@bijasa.com"
              className="font-mono text-slate-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
              title="Support Email"
            >
              hello@bijasa.com
            </a>
          </div>

          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
          >
            Start Power Billing
          </button>
        </div>
      </div>
    </div>
  );
};
