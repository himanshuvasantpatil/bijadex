import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types/auth';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  KeyRound, 
  Mail, 
  Store, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Lock,
  Search,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Info,
  ShieldCheck,
  Check,
  Minus
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, stores } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showPinMap, setShowPinMap] = useState<Record<string, boolean>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showFormPin, setShowFormPin] = useState(false);
  const [role, setRole] = useState<UserRole>('cashier');
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || 'store-1');
  const [isActive, setIsActive] = useState(true);

  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  // Open modal for Creating
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPin('');
    setShowFormPin(false);
    setRole('cashier');
    setSelectedStoreId(stores[0]?.id || 'store-1');
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPin(u.pin);
    setShowFormPin(false);
    setRole(u.role);
    setSelectedStoreId(u.storeIds[0] || stores[0]?.id || 'store-1');
    setIsActive(u.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;

    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, {
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@bijasa.com`,
        pin: pin.trim(),
        role: editingUser.role === 'owner' ? 'owner' : role, // Prevent demoting sole owner
        storeIds: [selectedStoreId],
        isActive
      });
    } else {
      // Add new user
      addUser({
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@bijasa.com`,
        pin: pin.trim(),
        role,
        storeIds: [selectedStoreId],
        isActive
      });
    }

    setIsModalOpen(false);
  };

  const togglePinVisibility = (userId: string) => {
    setShowPinMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const toggleUserActiveStatus = (u: UserProfile) => {
    if (u.role === 'owner') return; // Cannot deactivate owner
    updateUser(u.id, { isActive: !u.isActive });
  };

  // Filtered staff list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Top Bar Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Staff & Identity Access Management (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage cashier shift credentials, store locations, role permissions, and active status
          </p>
        </div>

        {isOwnerOrAdmin ? (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        ) : (
          <span className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-lg font-medium">
            Owner/Admin privilege required to modify staff credentials
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Toolbar: Search & Role Filter */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff members by name or email address..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs pl-9 pr-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="owner">Owners ({users.filter(u => u.role === 'owner').length})</option>
                <option value="admin">Administrators ({users.filter(u => u.role === 'admin').length})</option>
                <option value="manager">Store Managers ({users.filter(u => u.role === 'manager').length})</option>
                <option value="cashier">POS Cashiers ({users.filter(u => u.role === 'cashier').length})</option>
              </select>
            </div>
          </div>

          {/* Staff Credentials Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Staff Profile</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Authorized Location</th>
                    <th className="py-3.5 px-4 font-mono">Shift Security PIN</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200 font-sans">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                        No staff members found matching search query
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const storeObj = stores.find(s => s.id === u.storeIds[0]) || stores[0];
                      const isSelf = currentUser?.id === u.id;
                      const canManageThisUser = isOwnerOrAdmin && (currentUser?.role === 'owner' || u.role !== 'owner');
                      const isPinVisible = !!showPinMap[u.id];

                      return (
                        <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                          {/* Staff Profile */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-mono">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              u.role === 'owner' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' :
                              u.role === 'admin' ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60' :
                              u.role === 'manager' ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60' :
                              'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-4 font-medium text-slate-300">
                            {storeObj ? (
                              <div className="flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{storeObj.name}</span>
                                <span className="text-[10px] font-mono text-slate-500">[{storeObj.code}]</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">All Locations</span>
                            )}
                          </td>

                          {/* Shift PIN with Reveal Toggle */}
                          <td className="py-3 px-4 font-mono">
                            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                              <span className="text-emerald-400 font-bold tracking-widest text-xs">
                                {isPinVisible ? u.pin : '••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePinVisibility(u.id)}
                                className="p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title={isPinVisible ? 'Hide PIN' : 'Reveal Security PIN'}
                              >
                                {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Account Status */}
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => toggleUserActiveStatus(u)}
                              disabled={!canManageThisUser || u.role === 'owner'}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                                u.isActive !== false
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50 hover:bg-emerald-950'
                                  : 'bg-rose-950/60 text-rose-400 border-rose-800/50 hover:bg-rose-950'
                              } ${(!canManageThisUser || u.role === 'owner') ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                              title={u.role === 'owner' ? 'Owner account cannot be suspended' : 'Click to toggle access status'}
                            >
                              {u.isActive !== false ? (
                                <>
                                  <UserCheck className="w-3 h-3 text-emerald-400" />
                                  <span>Active Access</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3 h-3 text-rose-400" />
                                  <span>Suspended</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              {canManageThisUser || isSelf ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(u)}
                                  className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title={`Edit credentials for ${u.name}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              ) : null}

                              {/* Delete Button */}
                              {canManageThisUser && u.role !== 'owner' && !isSelf ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Permanently revoke staff access and delete profile for ${u.name}?`)) {
                                      deleteUser(u.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Revoke / Delete Staff Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono px-1">Protected</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RBAC Role Permission Reference Matrix */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Access Control (RBAC) Permission Reference</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {/* Owner */}
              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 uppercase font-mono text-[11px]">Owner</span>
                  <span className="text-[10px] text-slate-400">Super Admin</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Full POS & Cash Register</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Staff CRUD & PIN Management</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Settings & Currency Config</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Audit Logs & Data Backups</li>
                </ul>
              </div>

              {/* Admin */}
              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 uppercase font-mono text-[11px]">Administrator</span>
                  <span className="text-[10px] text-slate-400">Full Access</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Full POS & Billing</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Staff Credentials Management</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Inventory & Stock Transfers</li>
                  <li className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Factory Reset Restricted</li>
                </ul>
              </div>

              {/* Manager */}
              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-300 uppercase font-mono text-[11px]">Store Manager</span>
                  <span className="text-[10px] text-slate-400">Branch Operations</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> POS Billing & Register Shifts</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Stock Audit & Adjustments</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Purchase Orders & Suppliers</li>
                  <li className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-slate-500 shrink-0" /> No Staff Creation / Revocation</li>
                </ul>
              </div>

              {/* Cashier */}
              <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase font-mono text-[11px]">POS Cashier</span>
                  <span className="text-[10px] text-slate-400">Checkout Shift</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Fast Barcode Checkout</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Cash Drawer Open & Close</li>
                  <li className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-slate-500 shrink-0" /> No Catalog Editing</li>
                  <li className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-slate-500 shrink-0" /> No Settings / Staff Access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {editingUser ? (
                  <>
                    <Edit className="w-4 h-4 text-emerald-400" />
                    <span>Edit Staff Member Credentials</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Add New Staff / Cashier Profile</span>
                  </>
                )}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. David Miller"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="david.miller@bijasa.com"
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Access Role</label>
                  <select
                    value={role}
                    disabled={editingUser?.role === 'owner'}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg outline-none focus:border-emerald-500 capitalize disabled:opacity-60"
                  >
                    {editingUser?.role === 'owner' ? (
                      <option value="owner">Owner (Super Admin)</option>
                    ) : (
                      <>
                        <option value="cashier">POS Cashier</option>
                        <option value="manager">Store Manager</option>
                        <option value="admin">Administrator</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Assigned Store Branch</label>
                  <select
                    value={selectedStoreId}
                    onChange={e => setSelectedStoreId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  >
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  POS Security PIN (4-6 Digits) *
                </label>
                <div className="relative">
                  <input
                    type={showFormPin ? 'text' : 'password'}
                    maxLength={6}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 5678"
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-bold px-3 py-2 pr-9 rounded-lg font-mono tracking-widest outline-none focus:border-emerald-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPin(prev => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showFormPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Staff will use this PIN to authenticate on the shift lock screen.</p>
              </div>

              {/* Active / Suspended toggle in modal */}
              {editingUser && editingUser.role !== 'owner' && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Account Access Status</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                    <span className={`font-mono text-xs font-bold ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition-colors cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
