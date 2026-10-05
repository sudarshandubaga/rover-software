import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, Plus, Edit2, Key, Trash2, Search, Building2, ShieldCheck,
    UserCheck, UserX, Check, Copy, Eye, EyeOff, RefreshCw, X, AlertCircle,
    CheckCircle, Phone, Mail, Sparkles, Filter
} from 'lucide-react';

export default function UserManager({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('all');

    // Create / Edit Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'manager',
        branch_id: '',
        phone: '',
        status: 'active'
    });

    const [showPassword, setShowPassword] = useState(false);

    // Reset Password Modal
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccessMsg, setResetSuccessMsg] = useState('');

    // Newly Created Credentials Notification Banner
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, branchesRes] = await Promise.all([
                axios.get('/api/users'),
                axios.get('/api/branches')
            ]);
            setUsers(usersRes.data);
            setBranches(branchesRes.data);
        } catch (err) {
            console.error('Error fetching users and branches', err);
        }
        setLoading(false);
    };

    const generateRandomPassword = () => {
        const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    };

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setSelectedUserId(null);
        setFormError('');
        setShowPassword(true);
        const autoPass = generateRandomPassword();
        setFormData({
            name: '',
            username: '',
            email: '',
            password: autoPass,
            role: 'manager',
            branch_id: branches.length > 0 ? branches[0].id : '',
            phone: '',
            status: 'active'
        });
        setModalOpen(true);
    };

    const handleOpenEditModal = (u) => {
        setIsEditing(true);
        setSelectedUserId(u.id);
        setFormError('');
        setShowPassword(false);
        setFormData({
            name: u.name,
            username: u.username || '',
            email: u.email,
            password: '', // leave empty to keep existing password
            role: u.role || 'manager',
            branch_id: u.branch_id || '',
            phone: u.phone || '',
            status: u.status || 'active'
        });
        setModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            if (isEditing) {
                const res = await axios.put(`/api/users/${selectedUserId}`, formData);
                setUsers(users.map(u => (u.id === selectedUserId ? res.data : u)));
                setModalOpen(false);
            } else {
                const res = await axios.post('/api/users', formData);
                setUsers([res.data, ...users]);
                setModalOpen(false);

                // Save credentials to show quick copy banner
                setCreatedCredentials({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    branch: branches.find(b => b.id == formData.branch_id)?.name || 'Unassigned'
                });
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Error saving user details.');
        }
        setFormLoading(false);
    };

    const handleOpenResetModal = (u) => {
        setTargetUser(u);
        setNewPassword(generateRandomPassword());
        setResetSuccessMsg('');
        setResetModalOpen(true);
    };

    const handleExecuteResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        setResetLoading(true);
        try {
            await axios.put(`/api/users/${targetUser.id}/password`, {
                new_password: newPassword
            });
            setResetSuccessMsg(`Password updated successfully for ${targetUser.name}!`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reset password.');
        }
        setResetLoading(false);
    };

    const handleDeleteUser = async (u) => {
        if (currentUser && currentUser.id === u.id) {
            alert('You cannot delete your own logged-in account.');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete user "${u.name}" (${u.username})?`)) {
            return;
        }

        try {
            await axios.delete(`/api/users/${u.id}`);
            setUsers(users.filter(item => item.id !== u.id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // Filtered list
    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.branch?.name && u.branch.name.toLowerCase().includes(search.toLowerCase()));

        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesBranch = branchFilter === 'all' || (u.branch_id && String(u.branch_id) === String(branchFilter));

        return matchesSearch && matchesRole && matchesBranch;
    });

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <ShieldCheck size={22} />
                        </span>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-wide">
                                Manager &amp; User Accounts
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Create usernames &amp; passwords for branch managers, assign branches, and manage roles
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                    <Plus size={16} />
                    Add New Manager / User
                </button>
            </div>

            {/* Newly Created Credentials Announcement Banner */}
            {createdCredentials && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl p-5 shadow-sm relative animate-fadeIn">
                    <button
                        onClick={() => setCreatedCredentials(null)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-start gap-3.5">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5">
                            <CheckCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-extrabold text-sm text-emerald-900">
                                Manager Account Created Successfully!
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Please copy and securely share these credentials with the branch manager:
                            </p>

                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-white/80 backdrop-blur rounded-xl p-3 border border-emerald-100 text-xs">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Name</span>
                                    <span className="font-semibold text-slate-800">{createdCredentials.name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Username</span>
                                    <span className="font-mono font-bold text-indigo-600">{createdCredentials.username}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Password</span>
                                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        {createdCredentials.password}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Branch</span>
                                    <span className="font-semibold text-slate-700">{createdCredentials.branch}</span>
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        `Rover Rajasthan Portal Credentials:\nUsername: ${createdCredentials.username}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nBranch: ${createdCredentials.branch}`
                                    )
                                }
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-200/60 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                                {copied ? 'Copied to Clipboard!' : 'Copy Credentials to Clipboard'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search manager, username, email..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Filter size={14} /> Filter:
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="manager">Managers Only</option>
                        <option value="super_admin">Super Admins Only</option>
                    </select>

                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 outline-none"
                    >
                        <option value="all">All Branches</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.name} ({b.code})
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={fetchData}
                        title="Reload"
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="py-3.5 px-4">User / Manager</th>
                                <th className="py-3.5 px-4">Username &amp; Contact</th>
                                <th className="py-3.5 px-4">Role</th>
                                <th className="py-3.5 px-4">Assigned Branch</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-center">Activity Stats</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <RefreshCw size={22} className="animate-spin mx-auto mb-2 text-indigo-500" />
                                        Loading users database...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <Users size={28} className="mx-auto mb-2 text-slate-300" />
                                        No users or managers found matching the search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const isCurrent = currentUser?.id === u.id;
                                    const isSuperAdmin = u.role === 'super_admin';

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                                                            isSuperAdmin
                                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                                        }`}
                                                    >
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                            {u.name}
                                                            {isCurrent && (
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded border border-slate-200">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-slate-400 font-mono">
                                                            ID #{u.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 space-y-1">
                                                <div className="font-mono font-bold text-indigo-600 flex items-center gap-1">
                                                    <span>@{u.username || 'no-username'}</span>
                                                </div>
                                                <div className="text-slate-500 text-[11px] flex items-center gap-1">
                                                    <Mail size={12} className="text-slate-400 shrink-0" />
                                                    {u.email}
                                                </div>
                                                {u.phone && (
                                                    <div className="text-slate-500 text-[11px] flex items-center gap-1">
                                                        <Phone size={12} className="text-slate-400 shrink-0" />
                                                        {u.phone}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {isSuperAdmin ? (
                                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2.5 py-1 rounded-lg text-[10px] tracking-wide uppercase">
                                                        <ShieldCheck size={13} />
                                                        Super Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2.5 py-1 rounded-lg text-[10px] tracking-wide uppercase">
                                                        <UserCheck size={13} />
                                                        Manager
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {u.branch ? (
                                                    <div className="space-y-0.5">
                                                        <div className="font-bold text-slate-800 flex items-center gap-1">
                                                            <Building2 size={13} className="text-slate-400 shrink-0" />
                                                            {u.branch.name}
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                            {u.branch.code}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">
                                                        {isSuperAdmin ? 'All Branches (Global)' : 'Unassigned'}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {u.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="inline-flex items-center gap-2 bg-slate-50 rounded-lg p-1.5 border border-slate-100 text-[11px]">
                                                    <div title="Bookings created">
                                                        <span className="text-slate-400 text-[9px] uppercase block">Bookings</span>
                                                        <span className="font-bold text-slate-700">{u.bookings_count ?? 0}</span>
                                                    </div>
                                                    <span className="text-slate-200">|</span>
                                                    <div title="Leads created">
                                                        <span className="text-slate-400 text-[9px] uppercase block">Leads</span>
                                                        <span className="font-bold text-slate-700">{u.leads_count ?? 0}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenResetModal(u)}
                                                        title="Reset Password"
                                                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors cursor-pointer"
                                                    >
                                                        <Key size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditModal(u)}
                                                        title="Edit User"
                                                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u)}
                                                        disabled={isCurrent}
                                                        title={isCurrent ? 'Cannot delete self' : 'Delete User'}
                                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 disabled:opacity-30 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
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

            {/* CREATE / EDIT USER MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-fadeIn">
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-indigo-400" />
                                    {isEditing ? `Edit User: ${formData.name}` : 'Create New Manager / User'}
                                </h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    {isEditing
                                        ? 'Update user role, branch assignment, or login credentials'
                                        : 'Set username, initial password, role, and branch assignment'}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                            {formError && (
                                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Ramesh Sharma"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Username (for Login) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                                            })
                                        }
                                        placeholder="e.g. manager_jaipur"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-mono font-bold text-indigo-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="manager@roverrajasthan.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 98290 00000"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-medium"
                                    />
                                </div>
                            </div>

                            {/* Password input with Generator */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        {isEditing ? 'New Password (Leave blank to keep current)' : 'Password *'}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const p = generateRandomPassword();
                                            setFormData({ ...formData, password: p });
                                            setShowPassword(true);
                                        }}
                                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        <Sparkles size={12} /> Auto-Generate
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required={!isEditing}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={isEditing ? '•••••••• (unaltered)' : 'Enter password'}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs focus:bg-white focus:border-indigo-600 outline-none font-mono font-semibold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Role *
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Assigned Branch
                                    </label>
                                    <select
                                        value={formData.branch_id}
                                        onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                                    >
                                        <option value="">None / Global</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} ({b.code})
                                            </option>
                                        ))}
                                    </select>
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
                                    {formLoading ? 'Saving...' : isEditing ? 'Update User' : 'Create Manager Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RESET PASSWORD MODAL */}
            {resetModalOpen && targetUser && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-fadeIn">
                        <div className="bg-amber-500 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Key size={20} />
                                <h3 className="font-bold text-sm">Reset Password</h3>
                            </div>
                            <button
                                onClick={() => setResetModalOpen(false)}
                                className="text-amber-100 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs text-slate-600">
                                    Set a new password for <span className="font-bold text-slate-800">{targetUser.name}</span> (Username: <code className="text-indigo-600">{targetUser.username}</code>):
                                </p>
                            </div>

                            {resetSuccessMsg ? (
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                                        <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                                        <span>{resetSuccessMsg}</span>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                            New Active Password:
                                        </span>
                                        <div className="flex items-center justify-between">
                                            <code className="font-bold text-sm text-indigo-700 font-mono">
                                                {newPassword}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(newPassword)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                            >
                                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setResetModalOpen(false)}
                                        className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-slate-600 uppercase">
                                                New Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setNewPassword(generateRandomPassword())}
                                                className="text-[11px] text-indigo-600 font-bold flex items-center gap-1"
                                            >
                                                <Sparkles size={12} /> Auto-Generate
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-700 outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setResetModalOpen(false)}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            disabled={resetLoading}
                                            onClick={handleExecuteResetPassword}
                                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-60 transition-all shadow-md shadow-amber-600/20"
                                        >
                                            {resetLoading ? 'Updating...' : 'Set & Update Password'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
