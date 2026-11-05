import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GLOBAL_CURRENCIES } from '../../utils/format';
import { CurrencyConfig, Organization, Store } from '../../types';
import { BijadexLogo } from '../brand/BijadexLogo';
import { 
  Building2, 
  Store as StoreIcon, 
  Receipt, 
  CheckCircle2, 
  Globe, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { 
    isOnboardingOpen, 
    setIsOnboardingOpen, 
    organization, 
    stores, 
    completeOnboarding 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [name, setName] = useState(organization.name || '');
  const [businessType, setBusinessType] = useState<Organization['businessType']>(organization.businessType || 'Retail Store');
  const [country, setCountry] = useState(organization.country || 'United States');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(organization.currency?.code || 'USD');
  const [taxId, setTaxId] = useState(organization.taxId || '');
  const [taxName, setTaxName] = useState(organization.taxName || 'Sales Tax');
  const [defaultTaxRate, setDefaultTaxRate] = useState(organization.defaultTaxRate || 10);
  const [phone, setPhone] = useState(organization.phone || '');
  const [email, setEmail] = useState(organization.email || 'hello@bijasa.com');
  const [address, setAddress] = useState(organization.address || '');

  // Primary store state
  const primaryStore = stores[0];
  const [storeName, setStoreName] = useState(primaryStore?.name || 'Main Retail Store');
  const [storeCode, setStoreCode] = useState(primaryStore?.code || 'MAIN-01');
  const [storeAddress, setStoreAddress] = useState(primaryStore?.address || '');
  const [storeManager, setStoreManager] = useState(primaryStore?.manager || 'Store Manager');
  const [storeType, setStoreType] = useState<Store['type']>(primaryStore?.type || 'retail');

  // Receipt & Billing
  const [invoicePrefix, setInvoicePrefix] = useState(organization.invoicePrefix || 'BJX-2026-');
  const [receiptHeader, setReceiptHeader] = useState(organization.receiptHeader || 'BIJADEX RETAIL & SUPPLY');
  const [receiptFooter, setReceiptFooter] = useState(organization.receiptFooter || 'Thank you for shopping with us! Returns accepted within 14 days.');

  if (!isOnboardingOpen) return null;

  const currentCurrency = GLOBAL_CURRENCIES.find(c => c.code === selectedCurrencyCode) || GLOBAL_CURRENCIES[0];

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding(
      {
        name,
        businessType,
        country,
        currency: currentCurrency,
        taxId,
        taxName,
        defaultTaxRate,
        phone,
        email,
        address,
        invoicePrefix,
        receiptHeader,
        receiptFooter
      },
      {
        name: storeName,
        code: storeCode,
        address: storeAddress,
        manager: storeManager,
        type: storeType
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Banner */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BijadexLogo size="md" showByline={true} />
            <div className="pl-3 border-l border-slate-800">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Business & Organization Setup
                <span className="text-[11px] font-mono font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Step {step} of 3
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Configure company profile, global currency, and billing rules
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Dismiss Setup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs text-center font-medium bg-slate-950/40">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              step === 1 ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Organization & Currency</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              step === 2 ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-slate-400'
            }`}
          >
            <StoreIcon className="w-3.5 h-3.5" />
            <span>2. Store Location</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              step === 3 ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-slate-400'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>3. Billing & Tax Defaults</span>
          </button>
        </div>

        {/* Step Form Body */}
        <form onSubmit={handleFinish} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* STEP 1: ORGANIZATION & GLOBAL CURRENCY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Apex Industrial Solutions Ltd."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Industry / Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value as Organization['businessType'])}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
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

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Country / Regional Operating Base
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="e.g. United States, Germany, India, UAE"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Currency Selector with Live Preview */}
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Global Operating Currency</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    Preview: {currentCurrency.symbol}1,250{currentCurrency.decimals > 0 ? `${currentCurrency.decimalSep}50` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {GLOBAL_CURRENCIES.map(curr => {
                    const isSelected = selectedCurrencyCode === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => setSelectedCurrencyCode(curr.code)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold font-mono">{curr.code} ({curr.symbol.trim()})</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{curr.name}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tax ID & Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tax Registration ID / VAT / GSTIN
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    placeholder="e.g. US-EIN-94-3829104 or GSTIN-27AAB"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Business Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +1 (800) 555-0199"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Business Email & HQ Address
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hello@bijasa.com"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="100 Technology Plaza, San Francisco, CA"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PRIMARY STORE / LOCATION */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
                You can create unlimited additional branch stores, logistics warehouses, and express outlets anytime under the <strong className="text-white">Store Locations</strong> module.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Store / Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="e.g. Downtown Flagship Store"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Store Code / POS Terminal Identifier
                  </label>
                  <input
                    type="text"
                    value={storeCode}
                    onChange={e => setStoreCode(e.target.value)}
                    placeholder="e.g. DT-01, NYC-HQ"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Location Type
                  </label>
                  <select
                    value={storeType}
                    onChange={e => setStoreType(e.target.value as Store['type'])}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  >
                    <option value="retail">Retail Storefront</option>
                    <option value="warehouse">Central Logistics Warehouse</option>
                    <option value="outlet">Express Airport / Transit Outlet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Store Manager / Cashier In-Charge
                </label>
                <input
                  type="text"
                  value={storeManager}
                  onChange={e => setStoreManager(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Physical Store Address
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={e => setStoreAddress(e.target.value)}
                  placeholder="e.g. 100 Main Street, Suite 100"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: BILLING & RECEIPT POLICY */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Invoice Numbering Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={e => setInvoicePrefix(e.target.value)}
                    placeholder="e.g. INV-2026-, ORD-"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Default Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={defaultTaxRate}
                    onChange={e => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tax Nomenclature (e.g. Sales Tax, VAT, GST, HST)
                </label>
                <input
                  type="text"
                  value={taxName}
                  onChange={e => setTaxName(e.target.value)}
                  placeholder="e.g. Sales Tax, GST, VAT"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Receipt Header Title
                </label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={e => setReceiptHeader(e.target.value)}
                  placeholder="e.g. BIJADEX RETAIL & SUPPLY"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Receipt Footer & Return Policy
                </label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={e => setReceiptFooter(e.target.value)}
                  placeholder="Terms, return conditions, customer support line..."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => (prev - 1) as 1 | 2)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>Platform:</span>
                <a
                  href="https://bijasa.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  title="Visit bijasa.com"
                >
                  bijasa.com
                </a>
                <span>·</span>
                <a
                  href="mailto:hello@bijasa.com"
                  className="text-slate-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  title="Contact hello@bijasa.com"
                >
                  hello@bijasa.com
                </a>
              </div>
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => (prev + 1) as 2 | 3)}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Launch Business Workstation</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
