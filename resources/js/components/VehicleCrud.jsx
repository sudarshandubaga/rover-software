import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Car, Settings, Search, X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

export default function VehicleCrud() {
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        vehicle_number: '',
        model: '',
        brand: '',
        type: 'SUV',
        capacity: '',
        status: 'active',
        rc_expiry: '',
        insurance_expiry: '',
        puc_expiry: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/vehicles');
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setFormData(vehicle);
        } else {
            setFormData({
                id: '',
                vehicle_number: '',
                model: '',
                brand: '',
                type: 'SUV',
                capacity: '7',
                status: 'active',
                rc_expiry: '',
                insurance_expiry: '',
                puc_expiry: ''
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
                await axios.put(`/api/vehicles/${formData.id}`, formData);
            } else {
                await axios.post('/api/vehicles', formData);
            }
            fetchVehicles();
            handleCloseModal();
        } catch (err) {
            alert('Error saving vehicle details. Vehicle number must be unique.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await axios.delete(`/api/vehicles/${id}`);
                fetchVehicles();
            } catch (err) {
                alert('Error deleting vehicle. It may be associated with bookings.');
            }
        }
    };

    const filteredVehicles = vehicles.filter(v => 
        v.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        (v.brand && v.brand.toLowerCase().includes(search.toLowerCase())) ||
        v.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Fleet Inventory (Vehicles)</h2>
                    <p className="text-slate-500 text-sm">Add cars, buses, track registration (RC), insurance timelines, capacity, and active status.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Add New Vehicle
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by license plate, brand, model, type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {/* Vehicle Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading fleet database...</div>
            ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No vehicles registered yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 text-slate-700 p-2.5 rounded-lg">
                                            <Car size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 leading-tight">
                                                {vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : vehicle.model}
                                            </h3>
                                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block">
                                                    {vehicle.vehicle_number}
                                                </span>
                                                {vehicle.branch && (
                                                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                                        {vehicle.branch.code}
                                                    </span>
                                                )}
                                                {vehicle.user && (
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        by {vehicle.user.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleOpenModal(vehicle)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(vehicle.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Vehicle Type</span>
                                        <span className="font-semibold text-slate-700">{vehicle.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Capacity</span>
                                        <span className="font-semibold text-slate-700">{vehicle.capacity ? `${vehicle.capacity} Seater` : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">RC Expiry:</span>
                                        <span className="font-medium text-slate-700">{vehicle.rc_expiry || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Insurance Expiry:</span>
                                        <span className="font-medium text-slate-700">{vehicle.insurance_expiry || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">PUC Expiry:</span>
                                        <span className="font-medium text-slate-700">{vehicle.puc_expiry || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Availability</span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        vehicle.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-700' 
                                            : vehicle.status === 'maintenance' 
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {vehicle.status === 'active' ? (
                                            <>
                                                <CheckCircle size={11} /> Available
                                            </>
                                        ) : vehicle.status === 'maintenance' ? (
                                            <>
                                                <AlertTriangle size={11} /> Maintenance
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={11} /> Inactive
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Vehicle Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Vehicle Details' : 'Register New Fleet Vehicle'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Plate Number *</label>
                                    <input
                                        type="text"
                                        name="vehicle_number"
                                        value={formData.vehicle_number}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. DL-1CA-1234"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Type *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    >
                                        <option value="SUV">SUV (Innova, Ertiga etc)</option>
                                        <option value="Sedan">Sedan (Dzire, Etios etc)</option>
                                        <option value="Hatchback">Hatchback (WagonR, Swift etc)</option>
                                        <option value="Bus">Luxury Coach / Bus / Traveller</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Brand / Make</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Toyota"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Model Name *</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Innova Crysta"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Capacity (Seater)</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 7"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">RC Expiry Date</label>
                                    <input
                                        type="date"
                                        name="rc_expiry"
                                        value={formData.rc_expiry}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Insurance Expiry Date</label>
                                    <input
                                        type="date"
                                        name="insurance_expiry"
                                        value={formData.insurance_expiry}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">PUC Expiry Date</label>
                                    <input
                                        type="date"
                                        name="puc_expiry"
                                        value={formData.puc_expiry}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                >
                                    <option value="active">Active & Available</option>
                                    <option value="maintenance">Under Maintenance</option>
                                    <option value="inactive">Inactive / Retired</option>
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
                                    Save Vehicle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
