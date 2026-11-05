import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  HardDrive,
  Download,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import { SyncQueueItem } from '../../types/sync';

export const SyncCenterModal: React.FC = () => {
  const {
    isSyncCenterOpen,
    setIsSyncCenterOpen,
    isOnline,
    isSimulatedOffline,
    toggleSimulateOffline,
    isSyncing,
    syncPendingNow,
    syncQueue,
    clearSyncedQueue,
    lastSyncedAt,
    storageStats
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'synced'>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  if (!isSyncCenterOpen) return null;

  const pendingItems = syncQueue.filter(i => i.status === 'pending' || i.status === 'failed');
  const syncedItems = syncQueue.filter(i => i.status === 'synced');

  const displayedItems = syncQueue.filter(item => {
    if (filter === 'pending') return item.status === 'pending' || item.status === 'failed';
    if (filter === 'synced') return item.status === 'synced';
    return true;
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleExportLog = () => {
    const blob = new Blob([JSON.stringify(syncQueue, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bijadex-sync-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>IndexedDB Local-First Engine & Sync Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  v1.0 LocalDB
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                All inventory edits, stock movements & sales are stored locally in IndexedDB first
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSyncCenterOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connectivity & Offline Simulation Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
            {/* Live Connection Status */}
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  !isOnline
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                    : isSyncing
                    ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                }`}
              >
                {!isOnline ? (
                  <WifiOff className="w-4 h-4" />
                ) : isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {!isOnline ? 'Offline Mode Active' : isSyncing ? 'Synchronizing Queue...' : 'Online & Connected'}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      !isOnline
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isSyncing
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {!isOnline ? 'LOCAL-FIRST' : isSyncing ? 'SYNC IN PROGRESS' : 'CLOUD READY'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {!isOnline
                    ? 'You can continue selling, adjusting stock, and creating products. Changes will queue.'
                    : `Last synchronized: ${lastSyncedAt ? formatDateTime(lastSyncedAt) : 'Ready for auto-sync'}`}
                </div>
              </div>
            </div>

            {/* Offline Simulation Switcher */}
            <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
              <span className="text-xs text-slate-300 font-medium">Simulate Disconnection:</span>
              <button
                type="button"
                onClick={toggleSimulateOffline}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSimulatedOffline ? 'bg-amber-500' : 'bg-slate-700'
                }`}
                title="Toggle simulated offline mode to test offline operations"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isSimulatedOffline ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                {isSimulatedOffline ? 'OFFLINE' : 'ONLINE'}
              </span>
            </div>
          </div>

          {/* Storage & Record Counters */}
          <div className="grid grid-cols-4 gap-2.5 text-center">
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Cached Products</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{storageStats.productCount} items</div>
            </div>
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Local Invoices</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{storageStats.invoiceCount} receipts</div>
            </div>
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Queue Pending</div>
              <div className={`text-sm font-bold font-mono mt-0.5 ${pendingItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pendingItems.length} mutations
              </div>
            </div>
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">IndexedDB Used</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{formatBytes(storageStats.usedBytes || 184320)}</div>
            </div>
          </div>
        </div>

        {/* Sync Queue Filter Controls */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({syncQueue.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'pending'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Pending</span>
              {pendingItems.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500 text-slate-950 font-bold font-mono">
                  {pendingItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('synced')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filter === 'synced' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Synced ({syncedItems.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {syncedItems.length > 0 && (
              <button
                onClick={clearSyncedQueue}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Remove synced items from history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Synced</span>
              </button>
            )}

            <button
              onClick={handleExportLog}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Export complete queue log as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        {/* Sync Queue Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                {filter === 'pending'
                  ? 'All local inventory updates are synchronized!'
                  : 'No sync history records recorded yet.'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Any modifications made while offline are automatically saved to IndexedDB and synchronized once connectivity resumes.
              </p>
            </div>
          ) : (
            displayedItems.map(item => {
              const isExpanded = expandedItemId === item.id;
              const isPending = item.status === 'pending';
              const isSynced = item.status === 'synced';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isPending
                      ? 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                          item.action.startsWith('UPDATE_STOCK')
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                            : item.action.startsWith('ADD_PRODUCT')
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : item.action.startsWith('CREATE_INVOICE')
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.action}
                      </span>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {item.description}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatDateTime(item.timestamp)}</span>
                          {item.syncedAt && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400">Synced {formatDateTime(item.syncedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded flex items-center gap-1 ${
                          isPending
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                            : item.status === 'syncing'
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                        }`}
                      >
                        {isPending ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Queued Offline</span>
                          </>
                        ) : item.status === 'syncing' ? (
                          <>
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-400" />
                            <span>Syncing</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Synced</span>
                          </>
                        )}
                      </span>

                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="View payload"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded JSON payload */}
                  {isExpanded && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400 mb-1">
                        Payload data stored in IndexedDB:
                      </div>
                      <pre className="p-2.5 bg-slate-950 rounded text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-40 border border-slate-850">
                        {JSON.stringify(item.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-emerald-400 font-bold">Local-First Principle:</span>
            <span>Zero latency · Zero data loss</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSyncCenterOpen(false)}
              className="px-4 py-1.5 text-slate-400 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={syncPendingNow}
              disabled={isSyncing || !isOnline || pendingItems.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer ${
                isSyncing || !isOnline || pendingItems.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={
                !isOnline
                  ? 'Cannot sync while in offline mode'
                  : pendingItems.length === 0
                  ? 'No pending offline updates to sync'
                  : 'Force synchronization of all queued items'
              }
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync Now (${pendingItems.length})`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
