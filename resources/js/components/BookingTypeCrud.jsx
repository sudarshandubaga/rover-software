import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Tag, DollarSign, Search, X, Check } from 'lucide-react';

export default function BookingTypeCrud() {
    const [bookingTypes, setBookingTypes] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        min_km_per_day: '80',
        night_charge: '250',
        rate_per_km: '12',
        base_price: '1500'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBookingTypes();
    }, []);

    const fetchBookingTypes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/booking-types');
            setBookingTypes(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleOpenModal = (type = null) => {
        if (type) {
            setFormData(type);
        } else {
            setFormData({
                id: '',
                name: '',
                min_km_per_day: '80',
                night_charge: '250',
                rate_per_km: '12',
                base_price: '1500'
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
                await axios.put(`/api/booking-types/${formData.id}`, formData);
            } else {
                await axios.post('/api/booking-types', formData);
            }
            fetchBookingTypes();
            handleCloseModal();
        } catch (err) {
            alert('Error saving booking type. Please check inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking type?')) {
            try {
                await axios.delete(`/api/booking-types/${id}`);
                fetchBookingTypes();
            } catch (err) {
                alert('Error deleting booking type. It may be linked to bookings.');
            }
        }
    };

    const filteredTypes = bookingTypes.filter(bt => 
        bt.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Booking Types & Billing Rules</h2>
                    <p className="text-slate-500 text-sm">Configure minimum daily travel distance, base pricing per category, and night-shift driver charges.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Add New Booking Type
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by category name (Local, Outstation, Wedding)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {/* Booking Type Cards */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading billing rates...</div>
            ) : filteredTypes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No booking types configured.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTypes.map((type) => (
                        <div key={type.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-50 text-indigo-700 p-2.5 rounded-lg">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{type.name}</h3>
                                            <span className="text-slate-400 text-xs">Rate ID: #{type.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleOpenModal(type)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(type.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm border-t border-slate-100 pt-4">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Base Price:</span>
                                        <span className="font-bold text-slate-800">₹{Number(type.base_price).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Min KM / Day:</span>
                                        <span className="font-semibold text-slate-700">{type.min_km_per_day} KM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Rate Per KM:</span>
                                        <span className="font-semibold text-slate-700">₹{Number(type.rate_per_km).toFixed(2)} / KM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Night Driver Charge:</span>
                                        <span className="font-semibold text-rose-600">₹{Number(type.night_charge).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Booking Type Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Billing Rates' : 'Add New Booking Type'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Booking Type Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Local / Outstation / Wedding"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Base Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="base_price"
                                        value={formData.base_price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        placeholder="e.g. 1500"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Min KM per Day *</label>
                                    <input
                                        type="number"
                                        name="min_km_per_day"
                                        value={formData.min_km_per_day}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        placeholder="e.g. 80"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Rate per KM (₹) *</label>
                                    <input
                                        type="number"
                                        name="rate_per_km"
                                        value={formData.rate_per_km}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        placeholder="e.g. 12"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Night Charge (₹) *</label>
                                    <input
                                        type="number"
                                        name="night_charge"
                                        value={formData.night_charge}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        placeholder="e.g. 250"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
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
                                    Save Billing Rate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
