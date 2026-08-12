import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, User, Phone, Mail, FileText, Search, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function DriverCrud() {
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [firms, setFirms] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        firm_id: '',
        name: '',
        phone: '',
        email: '',
        license_number: '',
        license_expiry: '',
        address: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDrivers();
        fetchFirms();
    }, []);

    const fetchFirms = async () => {
        try {
            const res = await axios.get('/api/firms');
            setFirms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/drivers');
            setDrivers(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleOpenModal = (driver = null) => {
        if (driver) {
            setFormData(driver);
        } else {
            setFormData({
                id: '',
                firm_id: '',
                name: '',
                phone: '',
                email: '',
                license_number: '',
                license_expiry: '',
                address: '',
                status: 'active'
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axios.put(`/api/drivers/${formData.id}`, formData);
            } else {
                await axios.post('/api/drivers', formData);
            }
            fetchDrivers();
            handleCloseModal();
        } catch (err) {
            alert('Error saving driver. Please check inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this driver?')) {
            try {
                await axios.delete(`/api/drivers/${id}`);
                fetchDrivers();
            } catch (err) {
                alert('Error deleting driver. It may be allocated to active bookings.');
            }
        }
    };

    const filteredDrivers = drivers.filter(d => 
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.phone.includes(search) ||
        (d.license_number && d.license_number.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Drivers Management</h2>
                    <p className="text-slate-500 text-sm">Add driver profiles, manage licensing info, track status, and contact details.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Add New Driver
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by driver name, phone, or license number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {/* Drivers Table */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading drivers...</div>
            ) : filteredDrivers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No drivers found. Add some drivers to get started.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Driver Details</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">License Information</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredDrivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 text-slate-600 p-2 rounded-lg">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{driver.name}</div>
                                                    <div className="text-xs text-slate-400">
                                                        Driver ID: #{driver.id} {driver.firm && `• Firm: ${driver.firm.name}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm space-y-0.5">
                                            <div className="flex items-center gap-1.5 text-slate-700">
                                                <Phone size={13} className="text-slate-400" />
                                                <span>{driver.phone}</span>
                                            </div>
                                            {driver.email && (
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Mail size={13} className="text-slate-400" />
                                                    <span>{driver.email}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm space-y-1">
                                            <div className="font-mono text-xs font-medium text-slate-700">
                                                {driver.license_number || 'N/A'}
                                            </div>
                                            {driver.license_expiry && (
                                                <div className="text-xs text-slate-400">
                                                    Expiry: {new Date(driver.license_expiry).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                driver.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}>
                                                {driver.status === 'active' ? (
                                                    <CheckCircle size={12} />
                                                ) : (
                                                    <AlertCircle size={12} />
                                                )}
                                                {driver.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(driver)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(driver.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Driver Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Driver Details' : 'Register New Driver'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Associated Firm</label>
                                    <select
                                        name="firm_id"
                                        value={formData.firm_id || ''}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    >
                                        <option value="">-- Select Firm (Optional) --</option>
                                        {firms.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Driver Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Ramesh Kumar"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number *</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. +91 9988776655"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="e.g. ramesh@driver.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">License Number</label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={formData.license_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g. DL-142020xxxxxx"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">License Expiry Date</label>
                                    <input
                                        type="date"
                                        name="license_expiry"
                                        value={formData.license_expiry}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Home Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Enter current home address..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Active Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                >
                                    <option value="active">Active (Available for booking allocation)</option>
                                    <option value="inactive">Inactive (On leave / blocklisted)</option>
                                </select>
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
                                >
                                    Save Driver
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
