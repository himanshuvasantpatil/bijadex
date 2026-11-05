import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Keyboard, Command } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useApp();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'F1', desc: 'Switch to Billing & Point of Sale (POS) Station' },
    { key: 'F2', desc: 'Switch to Inventory Management & Stock Control' },
    { key: 'F3', desc: 'Switch to Automated Financial Reports & P&L' },
    { key: 'F4', desc: 'Toggle Real-Time Camera Barcode Scanner Viewfinder' },
    { key: 'F5', desc: 'Switch to Sales Receipts & Transaction History' },
    { key: '?', desc: 'Toggle this Keyboard Shortcuts Cheatsheet' },
    { key: 'Enter', desc: 'Submit Barcode in POS / Execute Laser Scan' },
    { key: 'Esc', desc: 'Close any active modal or return to main terminal' },
    { key: 'USB Gun', desc: 'Hardware scanner triggers automatically on any screen' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Desktop Workstation Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/50 transition-colors text-xs"
            >
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-emerald-300 font-mono text-[11px] font-bold shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="font-medium text-slate-300">Bijasa Support:</span>
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
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
