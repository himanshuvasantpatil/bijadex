import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GLOBAL_CURRENCIES } from '../../utils/format';
import { CurrencyConfig, Organization } from '../../types';
import { AuditLogsViewer } from './AuditLogsViewer';
import { 
  Settings, 
  Building2, 
  Globe, 
  Receipt, 
  Award, 
  Database, 
  RotateCcw, 
  Check, 
  Upload,
  CheckCircle2,
  Mail,
  ExternalLink,
  ShieldCheck,
  Activity,
  Sliders
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { 
    organization, 
    updateOrganization, 
    exportDatabase, 
    importDatabase, 
    resetToDemoData,
    setIsOnboardingOpen,
    auditLogs,
    currentUser
  } = useApp();

  const canEditSettings = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const canResetFactory = currentUser?.role === 'owner';

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'audit'>('general');

  const [name, setName] = useState(organization.name);
  const [businessType, setBusinessType] = useState(organization.businessType);
  const [country, setCountry] = useState(organization.country);
  const [currencyCode, setCurrencyCode] = useState(organization.currency?.code || 'USD');
  const [taxId, setTaxId] = useState(organization.taxId);
  const [taxName, setTaxName] = useState(organization.taxName || 'Sales Tax');
  const [defaultTaxRate, setDefaultTaxRate] = useState(organization.defaultTaxRate);
  const [phone, setPhone] = useState(organization.phone);
  const [email, setEmail] = useState(organization.email);
  const [address, setAddress] = useState(organization.address);
  const [invoicePrefix, setInvoicePrefix] = useState(organization.invoicePrefix);
  const [receiptHeader, setReceiptHeader] = useState(organization.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(organization.receiptFooter);
  const [loyaltyPointsRate, setLoyaltyPointsRate] = useState(organization.loyaltyPointsRate || 0.1);
  const [loyaltyRedemptionRate, setLoyaltyRedemptionRate] = useState(organization.loyaltyRedemptionRate || 0.5);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;

    const cur = GLOBAL_CURRENCIES.find(c => c.code === currencyCode) || GLOBAL_CURRENCIES[0];

    updateOrganization({
      name,
      businessType,
      country,
      currency: cur,
      taxId,
      taxName,
      defaultTaxRate,
      phone,
      email,
      address,
      invoicePrefix,
      receiptHeader,
      receiptFooter,
      loyaltyPointsRate,
      loyaltyRedemptionRate
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabase(content);
        if (ok) {
          alert('Database backup restored successfully!');
        } else {
          alert('Invalid backup JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Organization Settings & System Audit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage enterprise profile, currency defaults, and review full staff activity audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Re-run Setup Wizard
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="px-6 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'general'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Organization & Global Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Logs & Staff Activity</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-full font-semibold">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSubTab === 'audit' ? (
          <div className="max-w-6xl mx-auto">
            <AuditLogsViewer />
          </div>
        ) : (
          <div className="flex justify-center">
            <form onSubmit={handleSave} className="max-w-3xl w-full space-y-6">
              {/* Section 1: Business Identity & Currency */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Business Profile & Currency</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={e => setBusinessType(e.target.value as Organization['businessType'])}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                    >
                      <option value="Retail Store">Retail Store</option>
                      <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                      <option value="Supermarket / Grocery">Supermarket / Grocery</option>
                      <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                      <option value="Hardware & Industrial">Hardware & Industrial</option>
                      <option value="Pharmacy & Health">Pharmacy & Health</option>
                      <option value="Apparel & Fashion">Apparel & Fashion</option>
                      <option value="General Merchandise">General Merchandise</option>
                    </select>
                  </div>
                </div>

                {/* Currency Selector Grid */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Operating Currency (Instant live conversion across POS, reports, and receipts)</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {GLOBAL_CURRENCIES.map(c => {
                      const isSel = currencyCode === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCurrencyCode(c.code)}
                          className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-slate-800 border-emerald-500 text-white font-bold shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-xs font-mono">{c.code}</div>
                          <div className="text-[11px] text-emerald-400 font-bold">{c.symbol.trim()}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tax ID / VAT / GSTIN</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={e => setTaxId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Business Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (800) 555-0199"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Business Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hello@bijasa.com"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Corporate HQ / Physical Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="100 Technology Plaza, San Francisco, CA"
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Section 2: Billing & Receipt Configuration */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Billing, Tax & Receipt Rules</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Prefix</label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={e => setInvoicePrefix(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tax Nomenclature</label>
                    <input
                      type="text"
                      value={taxName}
                      onChange={e => setTaxName(e.target.value)}
                      placeholder="Sales Tax, GST, VAT"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Default Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={defaultTaxRate}
                      onChange={e => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Receipt Footer / Return Policy</label>
                  <textarea
                    rows={2}
                    value={receiptFooter}
                    onChange={e => setReceiptFooter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Section 3: Customer Loyalty Program */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Customer Loyalty Rewards Program</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Points Earned per Currency Unit Spent</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={loyaltyPointsRate}
                      onChange={e => setLoyaltyPointsRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">e.g. 0.1 = 1 reward point per $10 spent</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Discount Value per Redeemed Point</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={loyaltyRedemptionRate}
                      onChange={e => setLoyaltyRedemptionRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">e.g. 0.50 = 100 points yields $50.00 off bill</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Data Management & Backup */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Database Portability & Backups</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={exportDatabase}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Download Database Backup (JSON)</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore Database from File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>

                  {canResetFactory && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset all catalog and store data back to clean factory demo settings?')) {
                          resetToDemoData();
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/40 transition-colors ml-auto cursor-pointer"
                      title="Store Owner privilege: Reset database to clean factory state"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Factory Demo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Section 5: Bijasa Platform & Enterprise Support */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Platform Developer & Technical Support</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Official Website
                    </div>
                    <div className="text-white font-medium">
                      Developed & Maintained by <strong className="text-emerald-400">Bijasa</strong>
                    </div>
                    <div className="pt-1">
                      <a
                        href="https://bijasa.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono underline underline-offset-2 transition-colors cursor-pointer"
                        title="Open bijasa.com in new tab"
                      >
                        <span>https://bijasa.com</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Access software updates, enterprise deployment guides, and cloud sync services.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Direct Support & Business Inquiries
                    </div>
                    <div className="text-white font-medium">
                      Dedicated Enterprise Support Desk
                    </div>
                    <div className="pt-1">
                      <a
                        href="mailto:hello@bijasa.com"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono underline underline-offset-2 transition-colors cursor-pointer"
                        title="Send email to hello@bijasa.com"
                      >
                        <span>hello@bijasa.com</span>
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Contact our engineering team for custom hardware integrations, tax adaptations, or multi-location setup.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Action */}
              <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settings saved and applied successfully!</span>
                  </span>
                ) : (
                  <div />
                )}

                {canEditSettings ? (
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg transition-colors cursor-pointer"
                  >
                    Save Organization Settings
                  </button>
                ) : (
                  <span className="text-xs text-amber-400 font-mono bg-amber-950/60 border border-amber-800/40 px-3.5 py-2 rounded-lg font-medium">
                    Read-Only Mode (Owner or Admin required to modify settings)
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
