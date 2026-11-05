import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog, AuditCategory, AuditSeverity } from '../../types/audit';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Clock, 
  User, 
  Tag, 
  Activity, 
  Lock, 
  Receipt, 
  Boxes, 
  Users, 
  Settings, 
  Database,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Building2,
  Calendar
} from 'lucide-react';

export const AuditLogsViewer: React.FC = () => {
  const { auditLogs, clearAuditLogs, users, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7days'>('all');

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search query filter
      const matchesSearch = 
        !searchQuery ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.terminalId && log.terminalId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.storeName && log.storeName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;

      // Staff User filter
      const matchesUser = selectedUser === 'all' || log.userId === selectedUser || log.userName === selectedUser;

      // Severity filter
      const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

      // Time range filter
      let matchesTime = true;
      if (timeRange === 'today') {
        const logDate = new Date(log.timestamp).toDateString();
        const todayDate = new Date().toDateString();
        matchesTime = logDate === todayDate;
      } else if (timeRange === '7days') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        matchesTime = new Date(log.timestamp).getTime() >= sevenDaysAgo;
      }

      return matchesSearch && matchesCategory && matchesUser && matchesSeverity && matchesTime;
    });
  }, [auditLogs, searchQuery, selectedCategory, selectedUser, selectedSeverity, timeRange]);

  // Statistics summaries
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const todayCount = auditLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
    const warningCount = auditLogs.filter(l => l.severity === 'warning' || l.severity === 'critical').length;
    const authEvents = auditLogs.filter(l => l.category === 'auth').length;

    return { total, todayCount, warningCount, authEvents };
  }, [auditLogs]);

  // Export audit logs as CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['ID', 'Timestamp', 'Staff Name', 'Role', 'Category', 'Action', 'Severity', 'Store Location', 'Terminal ID', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      `"${l.userName}"`,
      l.userRole,
      l.category,
      l.action,
      l.severity,
      `"${l.storeName || 'Main Store'}"`,
      l.terminalId || 'POS-01',
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bijadex_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: AuditCategory) => {
    switch (category) {
      case 'auth':
        return <Lock className="w-3.5 h-3.5 text-amber-400" />;
      case 'sales':
        return <Receipt className="w-3.5 h-3.5 text-emerald-400" />;
      case 'inventory':
        return <Boxes className="w-3.5 h-3.5 text-sky-400" />;
      case 'staff':
        return <Users className="w-3.5 h-3.5 text-purple-400" />;
      case 'settings':
        return <Settings className="w-3.5 h-3.5 text-indigo-400" />;
      case 'system':
        return <Database className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
            <Info className="w-3 h-3 text-emerald-400" />
            INFO
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">OWNER</span>;
      case 'admin':
        return <span className="text-[10px] font-mono font-semibold text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">ADMIN</span>;
      case 'manager':
        return <span className="text-[10px] font-mono font-semibold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">MANAGER</span>;
      default:
        return <span className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">CASHIER</span>;
    }
  };

  const formatRelativeTime = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return `${Math.floor(diffSecs / 86400)}d ago`;
    } catch {
      return timestampStr;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Total Logged Events</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white tracking-tight">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {stats.todayCount} recorded today
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Security & PIN Auth</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 tracking-tight">
            {stats.authEvents}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Shift logins & locks
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Warnings & Overrides</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tracking-tight">
            {stats.warningCount}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Refunds & deletions
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Staff Authorized</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 tracking-tight">
            {users.length} Active
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {users.filter(u => u.role === 'owner' || u.role === 'admin').length} Admins / {users.filter(u => u.role === 'cashier').length} Cashiers
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        {/* Row 1: Search & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter audit logs by staff name, action, POS terminal, or keywords..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs pl-9 pr-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Download CSV audit report for enterprise compliance"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all audit logs? This action is irreversible.')) {
                    clearAuditLogs();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/40 transition-colors cursor-pointer"
                title="Purge audit logs history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3 text-xs">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'auth', label: 'Auth & Shift' },
            { id: 'sales', label: 'Sales & POS' },
            { id: 'inventory', label: 'Stock & Inventory' },
            { id: 'staff', label: 'Staff & IAM' },
            { id: 'settings', label: 'Settings' },
            { id: 'system', label: 'System & Sync' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Row 3: Dropdown Selectors */}
        <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Staff Member
            </label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500"
            >
              <option value="all">All Staff Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Severity Level
            </label>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="info">INFO Only</option>
              <option value="warning">WARNING Only</option>
              <option value="critical">CRITICAL Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Timeframe
            </label>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-500"
            >
              <option value="all">All Recorded History</option>
              <option value="today">Today Only</option>
              <option value="7days">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Time & Date</th>
                <th className="py-3 px-4">Staff Conducted</th>
                <th className="py-3 px-4">Action & Category</th>
                <th className="py-3 px-4">Terminal & Store</th>
                <th className="py-3 px-4">Details & Event Payload</th>
                <th className="py-3 px-4 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-400">No audit logs matching search filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing filters or performing actions in the app</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors group">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-200 font-bold text-xs font-mono">
                        {formatRelativeTime(log.timestamp)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>

                    {/* Staff Member */}
                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                          {log.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span>{log.userName}</span>
                            {getRoleBadge(log.userRole)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action & Category */}
                    <td className="py-3 px-4 whitespace-nowrap font-sans">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-900 border border-slate-800">
                          {getCategoryIcon(log.category)}
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {log.action}
                          </span>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                            {log.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Terminal & Store */}
                    <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                      <div className="text-slate-300 font-medium font-sans">
                        {log.storeName || 'Main Store'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {log.terminalId || 'POS-TERM-01'}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 max-w-md font-sans text-xs text-slate-300 leading-normal">
                      {log.details}
                    </td>

                    {/* Severity Badge */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Showing <strong className="text-white">{filteredLogs.length}</strong> of <strong className="text-white">{auditLogs.length}</strong> total audit entries
          </span>
          <span className="text-[11px] text-slate-500">
            Bijadex Enterprise IAM Activity Monitor v1.0
          </span>
        </div>
      </div>
    </div>
  );
};
