import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Building2, UserRound, KeyRound, LogOut, X, Loader2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const EMPTY_FIRM = {
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    gst_number: '',
    pan_number: '',
    bank_name: '',
    bank_account_no: '',
    bank_ifsc: ''
};

export default function ProfileMenu({ user, onLogout, onUserChange }) {
    const [open, setOpen] = useState(false);
    const [modal, setModal] = useState(null); // 'firm' | 'profile' | 'password'
    const [saving, setSaving] = useState(false);

    // Firm setting
    const [firmForm, setFirmForm] = useState({ ...EMPTY_FIRM });
    const [firmMsg, setFirmMsg] = useState(null);

    // Profile
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [profileMsg, setProfileMsg] = useState(null);

    // Password
    const [passForm, setPassForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [passMsg, setPassMsg] = useState(null);

    // SMS settings
    const [smsForm, setSmsForm] = useState({
        url: 'https://smsweb.smsleases.com/app/smsapi/index.php?key=569AA885995E9C&campaign=0&routeid=9&type=text&contacts=[MobileNo]&senderid=ROVRAJ&msg=[Message]&template_id=[TemplateID]'
    });
    const [smsMsg, setSmsMsg] = useState(null);

    const initials = (user?.name || 'U')
        .split(' ')
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // ==========================================
    // FIRM SETTING
    // Load the primary company/firm used on documents
    // ==========================================
    const openFirmModal = async () => {
        setModal('firm');
        setFirmMsg(null);
        try {
            const res = await axios.get('/api/firms');
            const primary = res.data[0] || {};
            setFirmForm({ ...EMPTY_FIRM, ...primary });
        } catch (err) {
            console.error(err);
        }
    };

    const saveFirm = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFirmMsg(null);
        try {
            if (firmForm.id) {
                await axios.put(`/api/firms/${firmForm.id}`, firmForm);
            } else {
                await axios.post('/api/firms', firmForm);
            }
            setFirmMsg({ type: 'success', text: 'Firm settings saved successfully.' });
        } catch (err) {
            setFirmMsg({ type: 'error', text: 'Error saving firm settings.' });
        }
        setSaving(false);
    };

    // ==========================================
    // EDIT PROFILE
    // ==========================================
    const openProfileModal = () => {
        setProfileForm({ name: user?.name || '', email: user?.email || '' });
        setProfileMsg(null);
        setModal('profile');
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setProfileMsg(null);
        try {
            const res = await axios.put('/api/profile', profileForm);
            if (onUserChange) onUserChange(res.data);
            setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Error saving profile.' });
        }
        setSaving(false);
    };

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================
    const openPasswordModal = () => {
        setPassForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        setPassMsg(null);
        setModal('password');
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (passForm.new_password !== passForm.new_password_confirmation) {
            setPassMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setSaving(true);
        setPassMsg(null);
        try {
            const res = await axios.put('/api/profile/password', passForm);
            setPassMsg({ type: 'success', text: res.data.message || 'Password updated successfully.' });
            setPassForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            setPassMsg({ type: 'error', text: err.response?.data?.message || 'Error changing password.' });
        }
        setSaving(false);
    };

    // ==========================================
    // SMS SETTINGS
    // ==========================================
    const openSmsModal = async () => {
        setSmsMsg(null);
        setModal('sms');
        try {
            const res = await axios.get('/api/settings/sms');
            setSmsForm({
                url: res.data.url || ''
            });
        } catch (err) {
            console.error(err);
        }
    };

    const saveSms = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSmsMsg(null);
        try {
            const res = await axios.put('/api/settings/sms', smsForm);
            setSmsForm({
                url: res.data.url || ''
            });
            setSmsMsg({ type: 'success', text: 'SMS settings saved successfully.' });
        } catch (err) {
            setSmsMsg({ type: 'error', text: err.response?.data?.message || 'Error saving SMS settings.' });
        }
        setSaving(false);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            setOpen(false);
            onLogout();
        }
    };

    const ModalShell = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    const FormMsg = ({ msg }) => msg && (
        <div className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg ${msg.type === 'success' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-rose-600 bg-rose-50 border border-rose-100'}`}>
            {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {msg.text}
        </div>
    );

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none";

    return (
        <>
            {/* Avatar trigger */}
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    title={user?.name || 'Profile'}
                >
                    <span className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                        {initials}
                    </span>
                    <ChevronDown size={15} className="text-slate-400" />
                </button>

                {open && (
                    <>
                        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 overflow-hidden">
                            <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
                                <div className="text-sm font-bold text-slate-800 truncate">{user?.name}</div>
                                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                    {user?.role === 'super_admin' ? (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                                            Super Admin
                                        </span>
                                    ) : (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                                            Manager
                                        </span>
                                    )}
                                    {user?.branch && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                                            {user.branch.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="py-1">
                                <button
                                    onClick={() => { setOpen(false); openFirmModal(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                >
                                    <Building2 size={16} className="text-slate-400" /> Firm Setting
                                </button>
                                <button
                                    onClick={() => { setOpen(false); openProfileModal(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                >
                                    <UserRound size={16} className="text-slate-400" /> Edit Profile
                                </button>
                                <button
                                    onClick={() => { setOpen(false); openPasswordModal(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                >
                                    <KeyRound size={16} className="text-slate-400" /> Change Password
                                </button>
                                <button
                                    onClick={() => { setOpen(false); openSmsModal(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                >
                                    <MessageSquare size={16} className="text-slate-400" /> SMS Settings
                                </button>
                                <div className="my-1 border-t border-slate-100"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>


            {/* Firm Setting Modal */}
            {modal === 'firm' && (
                <ModalShell title="Firm Setting" onClose={() => setModal(null)}>
                    <form onSubmit={saveFirm} className="p-6 overflow-y-auto space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Firm / Company Name *</label>
                            <input
                                type="text" required value={firmForm.name}
                                onChange={(e) => setFirmForm({ ...firmForm, name: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Address</label>
                            <textarea
                                rows="2" value={firmForm.address}
                                onChange={(e) => setFirmForm({ ...firmForm, address: e.target.value })}
                                className={inputCls + " resize-none"}
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone</label>
                                <input type="text" value={firmForm.phone}
                                    onChange={(e) => setFirmForm({ ...firmForm, phone: e.target.value })}
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
                                <input type="email" value={firmForm.email}
                                    onChange={(e) => setFirmForm({ ...firmForm, email: e.target.value })}
                                    className={inputCls} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">GST Number</label>
                                <input type="text" value={firmForm.gst_number}
                                    onChange={(e) => setFirmForm({ ...firmForm, gst_number: e.target.value })}
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">PAN Number</label>
                                <input type="text" value={firmForm.pan_number}
                                    onChange={(e) => setFirmForm({ ...firmForm, pan_number: e.target.value })}
                                    className={inputCls} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Bank Name</label>
                                <input type="text" value={firmForm.bank_name}
                                    onChange={(e) => setFirmForm({ ...firmForm, bank_name: e.target.value })}
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Account No.</label>
                                <input type="text" value={firmForm.bank_account_no}
                                    onChange={(e) => setFirmForm({ ...firmForm, bank_account_no: e.target.value })}
                                    className={inputCls} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Bank IFSC</label>
                            <input type="text" value={firmForm.bank_ifsc}
                                onChange={(e) => setFirmForm({ ...firmForm, bank_ifsc: e.target.value })}
                                className={inputCls} />
                        </div>

                        {firmMsg && <FormMsg msg={firmMsg} />}

                        <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setModal(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Save Firm Settings
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}


            {/* Edit Profile Modal */}
            {modal === 'profile' && (
                <ModalShell title="Edit Profile" onClose={() => setModal(null)}>
                    <form onSubmit={saveProfile} className="p-6 overflow-y-auto space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
                            <input
                                type="text" required value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address *</label>
                            <input
                                type="email" required value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                className={inputCls}
                            />
                        </div>

                        {profileMsg && <FormMsg msg={profileMsg} />}

                        <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setModal(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Save Profile
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* Change Password Modal */}
            {modal === 'password' && (
                <ModalShell title="Change Password" onClose={() => setModal(null)}>
                    <form onSubmit={savePassword} className="p-6 overflow-y-auto space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Current Password *</label>
                            <input
                                type="password" required value={passForm.current_password}
                                onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Password *</label>
                            <input
                                type="password" required minLength="8" value={passForm.new_password}
                                onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
                                className={inputCls}
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password *</label>
                            <input
                                type="password" required value={passForm.new_password_confirmation}
                                onChange={(e) => setPassForm({ ...passForm, new_password_confirmation: e.target.value })}
                                className={inputCls}
                            />
                        </div>

                        {passMsg && <FormMsg msg={passMsg} />}

                        <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setModal(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Update Password
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* SMS Settings Modal */}
            {modal === 'sms' && (
                <ModalShell title="SMS Settings" onClose={() => setModal(null)}>
                    <form onSubmit={saveSms} className="p-6 overflow-y-auto space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">URL with Params *</label>
                            <input
                                type="text" value={smsForm.url} required
                                onChange={(e) => setSmsForm({ ...smsForm, url: e.target.value })}
                                placeholder="https://smsweb.smsleases.com/app/smsapi/index.php?key=569AA885995E9C&campaign=0&routeid=9&type=text&contacts=[MobileNo]&senderid=ROVRAJ&msg=[Message]&template_id=[TemplateID]"
                                className={inputCls + " font-mono"}
                            />
                            <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                                Enter the full gateway URL with its params. Use placeholders for the mobile number,{" "}
                                message text, and template:{" "}
                                <span className="font-mono text-indigo-600">[MobileNo]</span>,{" "}
                                <span className="font-mono text-indigo-600">[Message]</span>,{" "}
                                <span className="font-mono text-indigo-600">[TemplateID]</span>.
                            </p>
                        </div>

                        {smsMsg && <FormMsg msg={smsMsg} />}

                        <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setModal(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
                                {saving && <Loader2 size={14} className="animate-spin" />} Save SMS Settings
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}


        </>
    );
}

