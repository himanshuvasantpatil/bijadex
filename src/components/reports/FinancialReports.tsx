import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent, formatDate } from '../../utils/format';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download, 
  Printer, 
  Calendar,
  PieChart, 
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

type TimeRange = 'today' | '7days' | '30days' | 'this_month' | 'this_year' | 'all';

export const FinancialReports: React.FC = () => {
  const { invoices, expenses, products, stores } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'pnl' | 'taxes' | 'inventory_valuation'>('overview');

  // Filter invoices & expenses by selected time range and store
  const { filteredInvoices, filteredExpenses, periodLabel } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let label = 'Last 30 Days';

    if (timeRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      label = 'Today';
    } else if (timeRange === '7days') {
      startDate = new Date(now.getTime() - 7 * 86400000);
      label = 'Last 7 Days';
    } else if (timeRange === '30days') {
      startDate = new Date(now.getTime() - 30 * 86400000);
      label = 'Last 30 Days';
    } else if (timeRange === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      label = 'This Month';
    } else if (timeRange === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      label = 'Year to Date (2026)';
    } else {
      startDate = new Date(0);
      label = 'All Time History';
    }

    const validInvoices = invoices.filter(inv => {
      if (inv.status === 'refunded' || inv.status === 'void') return false;
      const invDate = new Date(inv.date);
      const matchesTime = invDate >= startDate;
      const matchesStore = storeFilter === 'all' || inv.storeId === storeFilter;
      return matchesTime && matchesStore;
    });

    const validExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const matchesTime = expDate >= startDate;
      const matchesStore = storeFilter === 'all' || exp.storeId === storeFilter;
      return matchesTime && matchesStore;
    });

    return { filteredInvoices: validInvoices, filteredExpenses: validExpenses, periodLabel: label };
  }, [invoices, expenses, timeRange, storeFilter]);

  // Financial Metrics Computation
  const metrics = useMemo(() => {
    const grossSales = filteredInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalDiscounts = filteredInvoices.reduce((sum, inv) => sum + inv.discountAmount, 0);
    const netRevenue = grossSales - totalDiscounts;
    const taxesCollected = filteredInvoices.reduce((sum, inv) => sum + inv.taxTotal, 0);
    const grandTotal = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    // Cost of Goods Sold (COGS)
    let cogs = 0;
    const categoryRevenueMap: { [cat: string]: number } = {};
    const productSalesMap: { [pId: string]: { name: string; sku: string; units: number; revenue: number; cogs: number } } = {};

    for (const inv of filteredInvoices) {
      for (const item of inv.items) {
        const itemCost = (item.product.costPrice || 0) * item.quantity;
        cogs += itemCost;

        // Category breakdown
        const cat = item.product.category || 'General';
        categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + item.total;

        // Product sales map
        if (!productSalesMap[item.product.id]) {
          productSalesMap[item.product.id] = {
            name: item.product.name,
            sku: item.product.sku,
            units: 0,
            revenue: 0,
            cogs: 0
          };
        }
        productSalesMap[item.product.id].units += item.quantity;
        productSalesMap[item.product.id].revenue += item.total;
        productSalesMap[item.product.id].cogs += itemCost;
      }
    }

    const grossProfit = netRevenue - cogs;
    const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    // Operating expenses
    const operatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - operatingExpenses;
    const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    // AOV
    const transactionCount = filteredInvoices.length;
    const aov = transactionCount > 0 ? grandTotal / transactionCount : 0;

    // Top Selling Products Array
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Group expenses by category
    const expenseCategoryMap: { [cat: string]: number } = {};
    for (const exp of filteredExpenses) {
      expenseCategoryMap[exp.category] = (expenseCategoryMap[exp.category] || 0) + exp.amount;
    }

    return {
      grossSales,
      totalDiscounts,
      netRevenue,
      cogs,
      grossProfit,
      grossMargin,
      operatingExpenses,
      netProfit,
      netMargin,
      taxesCollected,
      grandTotal,
      transactionCount,
      aov,
      categoryRevenueMap,
      expenseCategoryMap,
      topProducts
    };
  }, [filteredInvoices, filteredExpenses]);

  // Inventory asset valuation (current static state)
  const inventoryValuation = useMemo(() => {
    const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
    const totalRetail = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
    const potentialProfit = totalRetail - totalCost;
    const potentialMargin = totalRetail > 0 ? (potentialProfit / totalRetail) * 100 : 0;

    return { totalCost, totalRetail, potentialProfit, potentialMargin };
  }, [products]);

  // Daily revenue series for SVG Sparkline / Bar Chart (last 14 days)
  const chartData = useMemo(() => {
    const days = 14;
    const result: { dateStr: string; label: string; revenue: number; profit: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dString = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      const dayInvoices = invoices.filter(
        inv => inv.date.startsWith(dString) && inv.status === 'completed'
      );

      const dayRevenue = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
      const dayCogs = dayInvoices.reduce((sum, inv) => {
        return sum + inv.items.reduce((iSum, item) => iSum + (item.product.costPrice || 0) * item.quantity, 0);
      }, 0);

      result.push({
        dateStr: dString,
        label: dayLabel,
        revenue: dayRevenue,
        profit: Math.max(0, dayRevenue - dayCogs)
      });
    }
    return result;
  }, [invoices]);

  const maxChartValue = Math.max(...chartData.map(d => d.revenue), 100);

  // Export report to CSV
  const handleExportCSV = () => {
    const lines = [
      `BIJADEX ERP - FINANCIAL REPORT`,
      `Reporting Period: ${periodLabel}`,
      `Generated At: ${new Date().toISOString()}`,
      ``,
      `FINANCIAL SUMMARY,Amount ($)`,
      `Gross Sales,${metrics.grossSales.toFixed(2)}`,
      `Discounts Given,${metrics.totalDiscounts.toFixed(2)}`,
      `Net Sales Revenue,${metrics.netRevenue.toFixed(2)}`,
      `Cost of Goods Sold (COGS),${metrics.cogs.toFixed(2)}`,
      `Gross Profit,${metrics.grossProfit.toFixed(2)}`,
      `Gross Margin,${metrics.grossMargin.toFixed(1)}%`,
      `Total Operating Expenses,${metrics.operatingExpenses.toFixed(2)}`,
      `Net Operating Income (EBITDA),${metrics.netProfit.toFixed(2)}`,
      `Net Profit Margin,${metrics.netMargin.toFixed(1)}%`,
      `Taxes Collected,${metrics.taxesCollected.toFixed(2)}`,
      `Total Transactions,${metrics.transactionCount}`,
      `Average Order Value (AOV),${metrics.aov.toFixed(2)}`,
      ``,
      `EXPENSES BREAKDOWN BY CATEGORY,Amount ($)`,
      ...Object.entries(metrics.expenseCategoryMap).map(([cat, amt]) => `"${cat}",${amt.toFixed(2)}`),
      ``,
      `TOP PRODUCTS BY REVENUE,SKU,Units Sold,Revenue ($),COGS ($),Gross Margin ($)`,
      ...metrics.topProducts.map(p => `"${p.name}","${p.sku}",${p.units},${p.revenue.toFixed(2)},${p.cogs.toFixed(2)},${(p.revenue - p.cogs).toFixed(2)}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Top Header Controls Strip */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Automated Financial Reports & Accounting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ledger aggregation · Sales revenue, COGS, operating margins & tax liabilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-Store Location Selector */}
          <select
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500 font-medium"
            title="Consolidated or Store-by-Store Financial Reporting"
          >
            <option value="all">All Stores (Consolidated)</option>
            {stores.map(st => (
              <option key={st.id} value={st.id}>{st.name} [{st.code}]</option>
            ))}
          </select>

          {/* Timeframe Segmented Control */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7D' },
              { id: '30days', label: '30D' },
              { id: 'this_month', label: 'This Month' },
              { id: 'this_year', label: 'YTD' },
              { id: 'all', label: 'All' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as TimeRange)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  timeRange === t.id
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report View Tabs */}
      <div className="px-5 border-b border-slate-800 bg-slate-900 flex gap-6 text-xs font-medium">
        {[
          { id: 'overview', label: 'Executive Financial Overview' },
          { id: 'pnl', label: 'Profit & Loss Statement (P&L)' },
          { id: 'taxes', label: 'Tax & Sales Liabilities' },
          { id: 'inventory_valuation', label: 'Inventory Capital & Valuation' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Report Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Top 4 Primary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Gross Revenue */}
              <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Net Sales Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
                  {formatCurrency(metrics.netRevenue)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                  <span>Gross: {formatCurrency(metrics.grossSales)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{metrics.transactionCount} sales</span>
                </div>
              </div>

              {/* Gross Profit & Margin */}
              <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Gross Profit</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
                  {formatCurrency(metrics.grossProfit)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Gross Margin: <strong className="text-white">{metrics.grossMargin.toFixed(1)}%</strong> (COGS: {formatCurrency(metrics.cogs)})
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Operating Expenses</span>
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums mt-1">
                  {formatCurrency(metrics.operatingExpenses)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {Object.keys(metrics.expenseCategoryMap).length} active ledger categories
                </div>
              </div>

              {/* Net Profit (EBITDA) */}
              <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Net Operating Income</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                </div>
                <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                  metrics.netProfit >= 0 ? 'text-white' : 'text-rose-400'
                }`}>
                  {formatCurrency(metrics.netProfit)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Net Margin: <strong className={metrics.netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{metrics.netMargin.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Daily Revenue & Profit Trend Visual (SVG Responsive Chart) */}
            <div className="p-5 bg-slate-950/70 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    14-Day Revenue & Profit Distribution
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Daily sales volume and computed product gross profit margins
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                    <span className="text-slate-300">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-cyan-600 rounded-sm" />
                    <span className="text-slate-300">Gross Profit</span>
                  </div>
                </div>
              </div>

              {/* Responsive Bar Chart Canvas */}
              <div className="h-44 w-full flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
                {chartData.map((d, idx) => {
                  const revHeight = maxChartValue > 0 ? (d.revenue / maxChartValue) * 100 : 0;
                  const profitHeight = maxChartValue > 0 ? (d.profit / maxChartValue) * 100 : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] font-mono text-white px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                        <div>{d.label}</div>
                        <div>Rev: {formatCurrency(d.revenue)}</div>
                        <div className="text-cyan-400">Profit: {formatCurrency(d.profit)}</div>
                      </div>

                      {/* Bar columns */}
                      <div className="w-full flex items-end justify-center gap-1 max-w-[28px] h-full">
                        {/* Revenue Bar */}
                        <div
                          style={{ height: `${Math.max(4, revHeight)}%` }}
                          className="w-1/2 bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all"
                        />
                        {/* Profit Bar */}
                        <div
                          style={{ height: `${Math.max(4, profitHeight)}%` }}
                          className="w-1/2 bg-cyan-600 hover:bg-cyan-500 rounded-t-sm transition-all"
                        />
                      </div>

                      {/* Day Label */}
                      <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                        {d.label.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split Section: Category Breakdown + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center justify-between">
                  <span>Revenue by Product Category</span>
                  <PieChart className="w-4 h-4 text-slate-400" />
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics.categoryRevenueMap).map(([cat, rev]) => {
                    const percent = metrics.netRevenue > 0 ? (rev / metrics.netRevenue) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-300">{cat}</span>
                          <span className="font-mono text-white tabular-nums">
                            {formatCurrency(rev)} <span className="text-slate-500">({percent.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(metrics.categoryRevenueMap).length === 0 && (
                    <div className="text-center text-xs text-slate-500 py-6">
                      No sales recorded in this period
                    </div>
                  )}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                  Top Margin Contributors
                </h3>
                <div className="space-y-2.5">
                  {metrics.topProducts.map((p, idx) => {
                    const margin = p.revenue > 0 ? ((p.revenue - p.cogs) / p.revenue) * 100 : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-semibold text-slate-200 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            SKU: {p.sku} · {p.units} units sold
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-bold text-white tabular-nums">
                            {formatCurrency(p.revenue)}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400 tabular-nums">
                            +{margin.toFixed(1)}% margin
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* P&L STATEMENT TAB */}
        {activeTab === 'pnl' && (
          <div className="bg-slate-950/70 rounded-lg border border-slate-800 p-6 space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white tracking-tight">
                Income Statement (Profit & Loss Ledger)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Period: {periodLabel} · Accounting Basis: Accrual / POS Checkout
              </p>
            </div>

            {/* Income Statement Table */}
            <div className="space-y-4 text-xs font-mono">
              {/* Section 1: Revenue */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  1. Operating Revenue
                </div>
                <div className="divide-y divide-slate-900 py-1">
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span className="pl-4">Gross Merchandise Sales</span>
                    <span className="tabular-nums">{formatCurrency(metrics.grossSales)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-400">
                    <span className="pl-4">Less: Promotional Discounts & Markdowns</span>
                    <span className="tabular-nums text-rose-400">-{formatCurrency(metrics.totalDiscounts)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-white bg-slate-900/60 px-2 rounded">
                    <span>Net Sales Revenue</span>
                    <span className="tabular-nums text-emerald-400">{formatCurrency(metrics.netRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: COGS */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  2. Cost of Goods Sold (COGS)
                </div>
                <div className="divide-y divide-slate-900 py-1">
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span className="pl-4">Direct Product Acquisition Costs</span>
                    <span className="tabular-nums text-rose-400">({formatCurrency(metrics.cogs)})</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-white bg-slate-900/60 px-2 rounded">
                    <span>Gross Profit</span>
                    <span className="tabular-nums text-emerald-400">{formatCurrency(metrics.grossProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Operating Expenses */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  3. Operating Expenses (OPEX)
                </div>
                <div className="divide-y divide-slate-900 py-1">
                  {Object.entries(metrics.expenseCategoryMap).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between py-1.5 text-slate-400">
                      <span className="pl-4">{cat}</span>
                      <span className="tabular-nums">{formatCurrency(amt)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold text-white bg-slate-900/60 px-2 rounded">
                    <span>Total Operating Expenses</span>
                    <span className="tabular-nums text-amber-300">({formatCurrency(metrics.operatingExpenses)})</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Net Operating Profit */}
              <div className="p-4 bg-slate-900 border-2 border-slate-700 rounded-lg">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-white">NET OPERATING INCOME (EBITDA)</span>
                  <span className={`text-base font-bold tabular-nums ${
                    metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatCurrency(metrics.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1 pt-1 border-t border-slate-800">
                  <span>Net Margin Ratio:</span>
                  <span className="font-semibold text-white">{metrics.netMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAX LIABILITIES TAB */}
        {activeTab === 'taxes' && (
          <div className="bg-slate-950/70 rounded-lg border border-slate-800 p-6 space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Sales Tax Ledger & Government Filing Summary</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated tax accrued across invoice transactions for period: {periodLabel}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Taxable Sales</div>
                <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
                  {formatCurrency(metrics.netRevenue)}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Sales Tax Collected</div>
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
                  {formatCurrency(metrics.taxesCollected)}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Gross Tax-Inclusive Revenue</div>
                <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
                  {formatCurrency(metrics.grandTotal)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Tax Accounting Certification
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All point-of-sale invoices are recorded with individual line-item tax calculation (standard sales tax rates: 5%, 8%, 10%). Tax accrued is segregated from net operating revenue to satisfy state and national audit requirements.
              </p>
            </div>
          </div>
        )}

        {/* INVENTORY VALUATION TAB */}
        {activeTab === 'inventory_valuation' && (
          <div className="bg-slate-950/70 rounded-lg border border-slate-800 p-6 space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>Inventory Asset Valuation & Capital Health</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current warehouse & retail asset breakdown evaluated at acquisition cost vs retail list price
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Inventory at Cost</div>
                <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
                  {formatCurrency(inventoryValuation.totalCost)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">Acquisition capital invested</div>
              </div>

              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Retail Liquidation Value</div>
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
                  {formatCurrency(inventoryValuation.totalRetail)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">Projected revenue when sold</div>
              </div>

              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Unrealized Gross Profit</div>
                <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums mt-1">
                  {formatCurrency(inventoryValuation.potentialProfit)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Avg Catalog Margin: {inventoryValuation.potentialMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
