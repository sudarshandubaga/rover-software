import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, User, Phone, Mail, Building, Landmark, Search, X } from 'lucide-react';

export default function ClientCrud() {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        company_name: '',
        gst_number: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/clients');
            setClients(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleOpenModal = (client = null) => {
        if (client) {
            setFormData(client);
        } else {
            setFormData({
                id: '',
                name: '',
                phone: '',
                email: '',
                address: '',
                company_name: '',
                gst_number: '',
                department: ''
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
                await axios.put(`/api/clients/${formData.id}`, formData);
            } else {
                await axios.post('/api/clients', formData);
            }
            fetchClients();
            handleCloseModal();
        } catch (err) {
            alert('Error saving client. Please check inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await axios.delete(`/api/clients/${id}`);
                fetchClients();
            } catch (err) {
                alert('Error deleting client. It may be linked to active bookings.');
            }
        }
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.company_name && c.company_name.toLowerCase().includes(search.toLowerCase())) ||
        (c.department && c.department.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Clients & Corporates</h2>
                    <p className="text-slate-500 text-sm">Manage passenger profiles, corporate accounts, tax configurations, and corporate departments.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Add New Client
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by client name, company, department, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {/* Clients Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No clients found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight">{client.name}</h3>
                                            <span className="text-slate-400 text-xs">Client ID: #{client.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleOpenModal(client)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(client.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400" />
                                        <span>{client.phone}</span>
                                    </div>
                                    {client.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="truncate">{client.email}</span>
                                        </div>
                                    )}
                                    {client.address && (
                                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                            {client.address}
                                        </p>
                                    )}
                                </div>

                                {(client.company_name || client.department || client.gst_number) && (
                                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                                            <Building size={13} />
                                            <span>Corporate Info</span>
                                        </div>
                                        {client.company_name && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Company:</span>
                                                <span className="font-semibold text-slate-700">{client.company_name}</span>
                                            </div>
                                        )}
                                        {client.department && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Dept:</span>
                                                <span className="font-semibold text-indigo-600">{client.department}</span>
                                            </div>
                                        )}
                                        {client.gst_number && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">GSTIN:</span>
                                                <span className="font-mono text-slate-700 font-medium">{client.gst_number}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Client Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Client Details' : 'Add New Client'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Adani Enterprises (Attn: Karan)"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
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
                                        placeholder="e.g. accounts@clientcompany.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Billing Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Enter full corporate or individual billing address..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none resize-none"
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-4">
                                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Building size={16} /> Corporate Account Settings (Optional)
                                </h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Company Name</label>
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Adani Enterprises Ltd."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department Name</label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Finance / HR Ops / IT"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">GST Number</label>
                                    <input
                                        type="text"
                                        name="gst_number"
                                        value={formData.gst_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 06AAAAA4444A1ZA"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono"
                                    />
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
                                    Save Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
