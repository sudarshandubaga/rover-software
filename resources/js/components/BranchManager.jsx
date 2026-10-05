import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Building2, Plus, Edit2, Trash2, Search, Users, MapPin,
    Phone, Mail, CheckCircle, AlertCircle, RefreshCw, X,
    Calendar, Compass, FileText, ArrowUpRight
} from 'lucide-react';

export default function BranchManager({ currentUser, onSelectBranch }) {
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        status: 'active'
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const [bRes, uRes] = await Promise.all([
                axios.get('/api/branches'),
                currentUser?.role === 'super_admin' ? axios.get('/api/users') : Promise.resolve({ data: [] })
            ]);
            setBranches(bRes.data);
            setUsers(uRes.data);
        } catch (err) {
            console.error('Error fetching branches', err);
        }
        setLoading(false);
    };

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setSelectedBranchId(null);
        setFormError('');
        setFormData({
            name: '',
            code: '',
            city: '',
            address: '',
            phone: '',
            email: '',
            status: 'active'
        });
        setModalOpen(true);
    };

    const handleOpenEditModal = (b) => {
        setIsEditing(true);
        setSelectedBranchId(b.id);
        setFormError('');
        setFormData({
            name: b.name,
            code: b.code,
            city: b.city || '',
            address: b.address || '',
            phone: b.phone || '',
            email: b.email || '',
            status: b.status || 'active'
        });
        setModalOpen(true);
    };

    const handleSaveBranch = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            if (isEditing) {
                const res = await axios.put(`/api/branches/${selectedBranchId}`, formData);
                setBranches(branches.map(b => (b.id === selectedBranchId ? res.data : b)));
            } else {
                const res = await axios.post('/api/branches', formData);
                setBranches([...branches, res.data]);
            }
            setModalOpen(false);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Error saving branch details.');
        }
        setFormLoading(false);
    };

    const handleDeleteBranch = async (b) => {
        if (!window.confirm(`Are you sure you want to delete branch "${b.name}" (${b.code})?`)) {
            return;
        }

        try {
            await axios.delete(`/api/branches/${b.id}`);
            setBranches(branches.filter(item => item.id !== b.id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete branch.');
        }
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        (b.city && b.city.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Building2 size={24} />
                    </span>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-wide">
                            Company Branches
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Manage multiple branches across Rajasthan, assign branch managers, and track operational hubs
                        </p>
                    </div>
                </div>

                {currentUser?.role === 'super_admin' && (
                    <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                        <Plus size={16} />
                        Create New Branch
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search branch by name, code, or city..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    />
                </div>

                <button
                    onClick={fetchBranches}
                    title="Reload Branches"
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Branch Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBranches.map(b => {
                    const branchManagers = users.filter(u => u.branch_id === b.id && u.role === 'manager');

                    return (
                        <div
                            key={b.id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                        >
                            <div>
                                {/* Branch Top Banner */}
                                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                                {b.code}
                                            </span>
                                            {b.status === 'active' ? (
                                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-extrabold text-slate-800 text-base">
                                            {b.name}
                                        </h3>
                                        {b.city && (
                                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                                <MapPin size={13} className="text-slate-400 shrink-0" />
                                                {b.city}, Rajasthan
                                            </div>
                                        )}
                                    </div>

                                    {currentUser?.role === 'super_admin' && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleOpenEditModal(b)}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Branch"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBranch(b)}
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Delete Branch"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Details / Contact */}
                                <div className="p-5 space-y-3 text-xs text-slate-600">
                                    {b.address && (
                                        <div className="flex items-start gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">{b.address}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                        {b.phone && (
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Phone size={13} className="text-slate-400" />
                                                <span>{b.phone}</span>
                                            </div>
                                        )}
                                        {b.email && (
                                            <div className="flex items-center gap-1.5 text-slate-600 truncate">
                                                <Mail size={13} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{b.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assigned Managers Section */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                                            Assigned Branch Managers:
                                        </span>

                                        {branchManagers.length === 0 ? (
                                            <span className="text-slate-400 italic text-[11px] block">
                                                No manager currently assigned to this branch.
                                            </span>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {branchManagers.map(m => (
                                                    <div
                                                        key={m.id}
                                                        className="flex items-center justify-between bg-slate-50 rounded-lg p-2 border border-slate-100"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                                {m.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-slate-800 block text-[11px]">
                                                                    {m.name}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-mono">
                                                                    @{m.username}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
                                                            Manager
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Branch Stats Footer */}
                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-medium">
                                    <span className="font-bold text-slate-800">{b.users_count ?? 0}</span> Team Staff
                                </span>
                                <span className="text-slate-500 font-medium">
                                    <span className="font-bold text-slate-800">{b.bookings_count ?? 0}</span> Bookings Logged
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CREATE / EDIT BRANCH MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-fadeIn">
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <Building2 size={18} className="text-indigo-400" />
                                    {isEditing ? `Edit Branch: ${formData.name}` : 'Create New Company Branch'}
                                </h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    Set location code, city, contact info, and active status
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBranch} className="p-6 space-y-4">
                            {formError && (
                                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Branch Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Udaipur Heritage Branch"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Branch Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                                            })
                                        }
                                        placeholder="e.g. UDR-01"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-mono font-bold text-indigo-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="e.g. Udaipur"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Physical Address
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="e.g. Lake Palace Road, Udaipur, Rajasthan"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Office Contact Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 98290 54321"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Branch Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="udaipur@roverrajasthan.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all shadow-md shadow-indigo-600/20"
                                >
                                    {formLoading ? 'Saving...' : isEditing ? 'Update Branch' : 'Create Branch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
