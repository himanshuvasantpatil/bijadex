import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types/auth';
import { BijadexLogo } from '../brand/BijadexLogo';
import { ShieldCheck, Lock, User, KeyRound, LogOut, CheckCircle2, AlertCircle, Check } from 'lucide-react';

export const LoginLockScreen: React.FC = () => {
  const { currentUser, loginWithPin, logoutUser, users, organization } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserProfile>(users[0] || null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (currentUser) return null; // Already logged in

  const handleNumClick = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) return;

    const success = loginWithPin(selectedUser.id, pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 select-none">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-6">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2 pb-2 border-b border-slate-800">
          <BijadexLogo size="lg" showByline={true} />
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Identity & Access Management (IAM) · {organization.name}
          </p>
        </div>

        {/* User Selector Dropdown / Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Active Cashier / Staff Profile
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {users.map(u => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setPin('');
                    setError(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400 text-xs uppercase border border-slate-700">
                      {u.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{u.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize font-mono">
                        Role: <span className="text-emerald-300 font-semibold">{u.role}</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* PIN Entry Pad */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enter Security PIN for {selectedUser?.name}</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Default Demo PIN: 123456</span>
            </div>

            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={e => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError(false);
                }}
                placeholder="••••••"
                className={`w-full bg-slate-950 border text-center text-lg tracking-widest font-mono py-2.5 rounded-xl outline-none transition-colors ${
                  error ? 'border-rose-500 text-rose-300 bg-rose-950/20' : 'border-slate-700 text-white focus:border-emerald-500'
                }`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 font-medium text-center mt-1.5 animate-in fade-in">
                Incorrect security PIN. Please try again.
              </p>
            )}
          </div>

          {/* Numeric Keypad for POS touch terminals */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') handleClear();
                  else if (key === '⌫') setPin(prev => prev.slice(0, -1));
                  else handleNumClick(key);
                }}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-mono font-bold rounded-xl transition-colors cursor-pointer active:scale-95"
              >
                {key}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!pin}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              !pin
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
            }`}
          >
            Authenticate & Unlock Workstation
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-500 font-mono">
          Bijadex RBAC Security · Role permissions enforced across all modules
        </div>
      </div>
    </div>
  );
};
