import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Building, Phone, Mail, FileText, Landmark, Search, X } from 'lucide-react';

export default function FirmCrud() {
    const [firms, setFirms] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
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
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFirms();
    }, []);

    const fetchFirms = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/firms');
            setFirms(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleOpenModal = (firm = null) => {
        if (firm) {
            setFormData(firm);
        } else {
            setFormData({
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
                await axios.put(`/api/firms/${formData.id}`, formData);
            } else {
                await axios.post('/api/firms', formData);
            }
            fetchFirms();
            handleCloseModal();
        } catch (err) {
            alert('Error saving firm. Please check inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this firm?')) {
            try {
                await axios.delete(`/api/firms/${id}`);
                fetchFirms();
            } catch (err) {
                alert('Error deleting firm. It might be linked to existing bookings.');
            }
        }
    };

    const filteredFirms = firms.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        (f.email && f.email.toLowerCase().includes(search.toLowerCase())) ||
        (f.gst_number && f.gst_number.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Firms Directory</h2>
                    <p className="text-slate-500 text-sm">Manage travel agencies, branches, tax registration, and billing bank details.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Add New Firm
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by firm name, email, or GSTIN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {/* Firms Cards/List */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading firms data...</div>
            ) : filteredFirms.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No firms found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFirms.map((firm) => (
                        <div key={firm.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
                                            <Building size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{firm.name}</h3>
                                            <span className="text-slate-400 text-xs">Firm ID: {firm.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleOpenModal(firm)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(firm.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-4">
                                    {firm.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={15} className="text-slate-400" />
                                            <span>{firm.phone}</span>
                                        </div>
                                    )}
                                    {firm.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail size={15} className="text-slate-400" />
                                            <span>{firm.email}</span>
                                        </div>
                                    )}
                                    {firm.address && (
                                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                            {firm.address}
                                        </p>
                                    )}
                                </div>

                                {(firm.gst_number || firm.pan_number) && (
                                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs text-slate-600">
                                        {firm.gst_number && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">GSTIN:</span>
                                                <span className="font-mono font-medium text-slate-700">{firm.gst_number}</span>
                                            </div>
                                        )}
                                        {firm.pan_number && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">PAN:</span>
                                                <span className="font-mono font-medium text-slate-700">{firm.pan_number}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(firm.bank_name || firm.bank_account_no) && (
                                    <div className="border-t border-dashed border-slate-200 pt-3 space-y-1 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1">
                                            <Landmark size={13} />
                                            <span>Settlement Bank Details</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>Bank:</span>
                                            <span className="font-medium">{firm.bank_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>A/C No:</span>
                                            <span className="font-mono">{firm.bank_account_no || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>IFSC:</span>
                                            <span className="font-mono">{firm.bank_ifsc || 'N/A'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Firm Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Firm Details' : 'Add New Firm'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Firm Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Swift Travels Pvt. Ltd."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="e.g. +91 9876543210"
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
                                        placeholder="e.g. billing@company.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Branch/Head Office address details..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">GST Number</label>
                                    <input
                                        type="text"
                                        name="gst_number"
                                        value={formData.gst_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 07AAAAA1111A1Z1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">PAN Number</label>
                                    <input
                                        type="text"
                                        name="pan_number"
                                        value={formData.pan_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g. ABCDE1234F"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Landmark size={16} /> Settlement Bank Account Settings
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Bank Name</label>
                                            <input
                                                type="text"
                                                name="bank_name"
                                                value={formData.bank_name}
                                                onChange={handleInputChange}
                                                placeholder="e.g. HDFC Bank"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Account Number</label>
                                            <input
                                                type="text"
                                                name="bank_account_no"
                                                value={formData.bank_account_no}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 50100200300"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono"
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">IFSC Code</label>
                                            <input
                                                type="text"
                                                name="bank_ifsc"
                                                value={formData.bank_ifsc}
                                                onChange={handleInputChange}
                                                placeholder="e.g. HDFC0000001"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
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
                                    Save Firm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
