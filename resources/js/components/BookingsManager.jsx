import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, Edit2, Trash2, Search, X, User, Car, Calendar, MapPin, 
    Printer, IndianRupee, FileText, CheckCircle, Clock, AlertTriangle, 
    ChevronRight, ArrowRight, ShieldCheck, Map, UserCheck, PlusCircle
} from 'lucide-react';

export default function BookingsManager({ prefillLead = null, onConsumePrefill = null }) {
    const [bookings, setBookings] = useState([]);
    const [clients, setClients] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [bookingTypes, setBookingTypes] = useState([]);
    const [firms, setFirms] = useState([]);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Modals
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [allocateModalOpen, setAllocateModalOpen] = useState(false);
    const [invoiceViewOpen, setInvoiceViewOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    // Active records
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Booking form
    const [bookingForm, setBookingForm] = useState({
        id: '',
        client_id: '',
        booking_type_id: '',
        firm_id: '',
        from_place: '',
        to_place: '',
        from_date_time: '',
        to_date_time: '',
        start_km: '',
        end_km: '',
        toll_charge: 0,
        parking_charges: [], // array of {location, amount}
        border_taxes: [], // array of {state_name, amount}
        driver_allowance: false,
        remarks: '',
        department: '',
        status: 'Pending',
        
        // Client creation on the fly
        create_new_client: false,
        new_client_name: '',
        new_client_phone: '',
        new_client_email: '',
        new_client_address: '',
        new_client_company: '',
        new_client_gst: '',
        new_client_department: '',
    });

    // Allocation form
    const [allocForm, setAllocForm] = useState({
        driver_id: '',
        vehicle_id: '',
        status: 'Active'
    });

    // Receipt form
    const [receiptForm, setReceiptForm] = useState({
        booking_id: '',
        receipt_number: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        payment_mode: 'UPI',
        transaction_id: '',
        remarks: ''
    });

    // Input helpers for multiple items
    const [tempParking, setTempParking] = useState({ location: '', amount: '' });
    const [tempBorder, setTempBorder] = useState({ state_name: '', amount: '' });

    useEffect(() => {
        fetchBookings();
        fetchClients();
        fetchDrivers();
        fetchVehicles();
        fetchBookingTypes();
        fetchFirms();
    }, []);

    // Open the booking modal with a client pre-filled from the handed-off lead
    useEffect(() => {
        if (prefillLead) {
            setBookingForm(prev => ({
                ...prev,
                create_new_client: true,
                new_client_name: prefillLead.client_name || '',
                new_client_phone: prefillLead.phone || '',
                new_client_email: prefillLead.email || '',
                remarks: prefillLead.requirements
                    ? `Lead requirements: ${prefillLead.requirements}`
                    : prev.remarks,
            }));
            setBookingModalOpen(true);
            if (onConsumePrefill) onConsumePrefill();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefillLead]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/bookings');
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchClients = async () => {
        const res = await axios.get('/api/clients');
        setClients(res.data);
    };

    const fetchDrivers = async () => {
        const res = await axios.get('/api/drivers');
        setDrivers(res.data);
    };

    const fetchVehicles = async () => {
        const res = await axios.get('/api/vehicles');
        setVehicles(res.data);
    };

    const fetchBookingTypes = async () => {
        const res = await axios.get('/api/booking-types');
        setBookingTypes(res.data);
    };

    const fetchFirms = async () => {
        const res = await axios.get('/api/firms');
        setFirms(res.data);
    };

    // ==========================================
    // BOOKING FORM MANAGEMENT
    // ==========================================
    const handleOpenBookingModal = (booking = null) => {
        if (booking) {
            setBookingForm({
                id: booking.id,
                client_id: booking.client_id,
                booking_type_id: booking.booking_type_id || '',
                firm_id: booking.firm_id || '',
                from_place: booking.from_place,
                to_place: booking.to_place,
                from_date_time: booking.from_date_time ? booking.from_date_time.slice(0, 16) : '',
                to_date_time: booking.to_date_time ? booking.to_date_time.slice(0, 16) : '',
                start_km: booking.start_km || '',
                end_km: booking.end_km || '',
                toll_charge: booking.toll_charge || 0,
                parking_charges: booking.parking_charges || [],
                border_taxes: booking.border_taxes || [],
                driver_allowance: booking.driver_allowance || false,
                remarks: booking.remarks || '',
                department: booking.department || '',
                status: booking.status,
                create_new_client: false
            });
        } else {
            setBookingForm({
                id: '',
                client_id: '',
                booking_type_id: bookingTypes[0]?.id || '',
                firm_id: firms[0]?.id || '',
                from_place: '',
                to_place: '',
                from_date_time: new Date().toISOString().slice(0, 16),
                to_date_time: new Date(Date.now() + 24*3600*1000).toISOString().slice(0, 16),
                start_km: '',
                end_km: '',
                toll_charge: 0,
                parking_charges: [],
                border_taxes: [],
                driver_allowance: false,
                remarks: '',
                department: '',
                status: 'Pending',
                create_new_client: false,
                new_client_name: '',
                new_client_phone: '',
                new_client_email: '',
                new_client_address: '',
                new_client_company: '',
                new_client_gst: '',
                new_client_department: '',
            });
        }
        setBookingModalOpen(true);
    };

    const handleAddParking = () => {
        if (!tempParking.location || !tempParking.amount) return;
        setBookingForm(prev => ({
            ...prev,
            parking_charges: [...prev.parking_charges, { location: tempParking.location, amount: Number(tempParking.amount) }]
        }));
        setTempParking({ location: '', amount: '' });
    };

    const handleRemoveParking = (idx) => {
        setBookingForm(prev => ({
            ...prev,
            parking_charges: prev.parking_charges.filter((_, i) => i !== idx)
        }));
    };

    const handleAddBorder = () => {
        if (!tempBorder.state_name || !tempBorder.amount) return;
        setBookingForm(prev => ({
            ...prev,
            border_taxes: [...prev.border_taxes, { state_name: tempBorder.state_name, amount: Number(tempBorder.amount) }]
        }));
        setTempBorder({ state_name: '', amount: '' });
    };

    const handleRemoveBorder = (idx) => {
        setBookingForm(prev => ({
            ...prev,
            border_taxes: prev.border_taxes.filter((_, i) => i !== idx)
        }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            if (bookingForm.id) {
                await axios.put(`/api/bookings/${bookingForm.id}`, bookingForm);
            } else {
                await axios.post('/api/bookings', bookingForm);
            }
            fetchBookings();
            fetchClients(); // refresh client list in case a new client was created
            setBookingModalOpen(false);
        } catch (err) {
            alert('Error saving booking. Make sure client is selected.');
        }
    };

    const handleBookingDelete = async (id) => {
        if (window.confirm('Delete this booking permanently? All receipts will be deleted.')) {
            try {
                await axios.delete(`/api/bookings/${id}`);
                fetchBookings();
            } catch (err) {
                alert('Error deleting booking.');
            }
        }
    };

    // ==========================================
    // DRIVER & VEHICLE ALLOCATION
    // ==========================================
    const handleOpenAllocateModal = (booking) => {
        setSelectedBooking(booking);
        setAllocForm({
            driver_id: booking.driver_id || '',
            vehicle_id: booking.vehicle_id || '',
            status: booking.status === 'Pending' ? 'Active' : booking.status
        });
        setAllocateModalOpen(true);
    };

    const handleAllocateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/bookings/${selectedBooking.id}/allocate`, allocForm);
            fetchBookings();
            setAllocateModalOpen(false);
        } catch (err) {
            alert('Error allocating fleet assets.');
        }
    };

    // ==========================================
    // RECEIPT / PAYMENT LOGS
    // ==========================================
    const handleOpenReceiptModal = (booking) => {
        setSelectedBooking(booking);
        setReceiptForm({
            booking_id: booking.id,
            receipt_number: 'RCPT-' + Date.now().toString().slice(-6),
            date: new Date().toISOString().split('T')[0],
            amount: '',
            payment_mode: 'UPI',
            transaction_id: '',
            remarks: ''
        });
        setReceiptModalOpen(true);
    };

    const handleReceiptSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/receipts', receiptForm);
            fetchBookings();
            setReceiptModalOpen(false);
            if (invoiceViewOpen && selectedBooking) {
                // Update selected booking references
                const refreshed = bookings.find(b => b.id === selectedBooking.id);
                if (refreshed) setSelectedBooking(refreshed);
            }
        } catch (err) {
            alert('Error logging payment. Receipt number must be unique.');
        }
    };

    const handleDeleteReceipt = async (receiptId) => {
        if (window.confirm('Delete this payment receipt?')) {
            try {
                await axios.delete(`/api/receipts/${receiptId}`);
                fetchBookings();
                if (invoiceViewOpen && selectedBooking) {
                    const refreshed = bookings.find(b => b.id === selectedBooking.id);
                    if (refreshed) setSelectedBooking(refreshed);
                }
            } catch (err) {
                alert('Error deleting receipt.');
            }
        }
    };

    // ==========================================
    // INVOICE CALCULATOR
    // ==========================================
    const calculateBilling = (booking) => {
        if (!booking) return null;
        
        const bType = booking.booking_type || {};
        const ratePerKm = Number(bType.rate_per_km || 0);
        const minKmPerDay = Number(bType.min_km_per_day || 0);
        const nightCharge = Number(bType.night_charge || 0);
        const basePrice = Number(bType.base_price || 0);

        // Days calculation
        const start = new Date(booking.from_date_time);
        const end = new Date(booking.to_date_time);
        const diffHrs = Math.max(1, (end - start) / (1000 * 60 * 60));
        const days = Math.max(1, Math.ceil(diffHrs / 24));

        // Travel Distance
        const startKm = Number(booking.start_km || 0);
        const endKm = Number(booking.end_km || 0);
        const distance = Math.max(0, endKm - startKm);

        // Billing
        const basePackageCost = basePrice * days;
        const packageKm = minKmPerDay * days;
        const extraKm = Math.max(0, distance - packageKm);
        const extraKmCost = extraKm * ratePerKm;

        const driverAllow = booking.driver_allowance ? (nightCharge * days) : 0;
        
        const toll = Number(booking.toll_charge || 0);
        
        const parking = (booking.parking_charges || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const border = (booking.border_taxes || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const subtotal = basePackageCost + extraKmCost + driverAllow + toll + parking + border;
        const cgst = subtotal * 0.025; // 2.5%
        const sgst = subtotal * 0.025; // 2.5%
        const grandTotal = subtotal + cgst + sgst;

        const paid = (booking.receipts || []).reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const balance = grandTotal - paid;

        return {
            days,
            distance,
            basePackageCost,
            packageKm,
            extraKm,
            extraKmCost,
            driverAllow,
            toll,
            parking,
            border,
            subtotal,
            cgst,
            sgst,
            grandTotal,
            paid,
            balance
        };
    };

    // Filter
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.client.name.toLowerCase().includes(search.toLowerCase()) || 
            b.from_place.toLowerCase().includes(search.toLowerCase()) ||
            b.to_place.toLowerCase().includes(search.toLowerCase()) ||
            (b.invoice_number && b.invoice_number.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Booking Desk</h2>
                    <p className="text-slate-500 text-sm">Issue bookings, allocate vehicles, log client payments, and instantly compile invoices.</p>
                </div>
                <button
                    onClick={() => handleOpenBookingModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> New Booking Receipt
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex-1">
                    <Search className="text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by passenger name, route from/to, invoice..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full text-slate-700 text-xs"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg outline-none text-slate-600"
                    >
                        <option value="All">All Bookings</option>
                        <option value="Pending">Pending Allocations</option>
                        <option value="Active">Active Journeys</option>
                        <option value="Completed">Completed / Billed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Booking grid */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No bookings found matching filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map((b) => {
                        const bill = calculateBilling(b);
                        return (
                            <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono">
                                                {b.booking_type?.name || 'Local'} Duty
                                            </span>
                                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{b.client?.name}</h4>
                                            {b.department && <p className="text-[10px] text-slate-400">Dept: {b.department}</p>}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                            b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                                            b.status === 'Active' ? 'bg-indigo-50 text-indigo-700' :
                                            b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                                            'bg-amber-50 text-amber-700'
                                        }`}>
                                            {b.status}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                            <MapPin size={13} className="text-indigo-500" />
                                            <span className="truncate">{b.from_place}</span>
                                            <ArrowRight size={12} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{b.to_place}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                                            <Calendar size={12} />
                                            <span>
                                                {new Date(b.from_date_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fleet assignments */}
                                    <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Car size={13} className="text-slate-400" />
                                            <span className="truncate">{b.vehicle?.vehicle_number || 'No Vehicle'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <UserCheck size={13} className="text-slate-400" />
                                            <span className="truncate">{b.driver?.name || 'No Driver'}</span>
                                        </div>
                                    </div>

                                    {/* Cost/Invoice overview */}
                                    {bill && (
                                        <div className="flex justify-between items-center text-xs pt-3 border-t border-dashed border-slate-200">
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Due Amount</span>
                                                <span className="font-bold text-slate-800">₹{bill.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-slate-400 block text-[10px]">Remaining Balance</span>
                                                <span className={`font-bold ${bill.balance <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    ₹{bill.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer actions */}
                                <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-between gap-1 text-xs">
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleOpenAllocateModal(b)}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-md font-medium transition-all"
                                        >
                                            Assign Asset
                                        </button>
                                        <button
                                            onClick={() => { setSelectedBooking(b); setInvoiceViewOpen(true); }}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-md font-medium transition-all flex items-center gap-1"
                                        >
                                            <FileText size={12} /> Bill Details
                                        </button>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleOpenBookingModal(b)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/50 rounded"
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleBookingDelete(b.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Booking Modal */}
            {bookingModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[95vh]">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-base font-bold text-slate-800">
                                {bookingForm.id ? 'Modify Booking Entry' : 'Add New Booking Duty'}
                            </h3>
                            <button onClick={() => setBookingModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="p-5 overflow-y-auto space-y-4">
                            {/* Client Selector or Add Client */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Passenger / Client Information</h4>
                                    <button
                                        type="button"
                                        onClick={() => setBookingForm(prev => ({ ...prev, create_new_client: !prev.create_new_client }))}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                                    >
                                        <PlusCircle size={14} /> {bookingForm.create_new_client ? "Select Existing Client" : "Register Client on fly"}
                                    </button>
                                </div>

                                {!bookingForm.create_new_client ? (
                                    <div>
                                        <label className="block text-[11px] text-slate-400 mb-1">Select Client *</label>
                                        <select
                                            required
                                            value={bookingForm.client_id}
                                            onChange={(e) => setBookingForm({ ...bookingForm, client_id: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-indigo-600"
                                        >
                                            <option value="">-- Choose Client --</option>
                                            {clients.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Passenger Full Name *</label>
                                            <input
                                                type="text" required
                                                value={bookingForm.new_client_name}
                                                onChange={(e) => setBookingForm({...bookingForm, new_client_name: e.target.value})}
                                                placeholder="e.g. Mukesh Kumawat"
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Phone Number *</label>
                                            <input
                                                type="text" required
                                                value={bookingForm.new_client_phone}
                                                onChange={(e) => setBookingForm({...bookingForm, new_client_phone: e.target.value})}
                                                placeholder="e.g. +91 9988776655"
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-400 mb-0.5">Corporate Company Name</label>
                                            <input
                                                type="text"
                                                value={bookingForm.new_client_company}
                                                onChange={(e) => setBookingForm({...bookingForm, new_client_company: e.target.value})}
                                                placeholder="e.g. TCS Pvt Ltd"
                                                className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Booking configurations */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Booking Type *</label>
                                    <select
                                        required
                                        value={bookingForm.booking_type_id}
                                        onChange={(e) => setBookingForm({ ...bookingForm, booking_type_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    >
                                        <option value="">-- Choose Category --</option>
                                        {bookingTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} (Min: {t.min_km_per_day}KM)</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Select Billing Firm</label>
                                    <select
                                        value={bookingForm.firm_id}
                                        onChange={(e) => setBookingForm({ ...bookingForm, firm_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    >
                                        {firms.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Department / Cost Center</label>
                                    <input
                                        type="text"
                                        value={bookingForm.department}
                                        onChange={(e) => setBookingForm({ ...bookingForm, department: e.target.value })}
                                        placeholder="e.g. HR Operations"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                            </div>

                            {/* Route & Times */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">From Location *</label>
                                    <input
                                        type="text" required
                                        value={bookingForm.from_place}
                                        onChange={(e) => setBookingForm({ ...bookingForm, from_place: e.target.value })}
                                        placeholder="e.g. Connaught Place, Delhi"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">To Location *</label>
                                    <input
                                        type="text" required
                                        value={bookingForm.to_place}
                                        onChange={(e) => setBookingForm({ ...bookingForm, to_place: e.target.value })}
                                        placeholder="e.g. Taj Mahal, Agra"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">From Date Time *</label>
                                    <input
                                        type="datetime-local" required
                                        value={bookingForm.from_date_time}
                                        onChange={(e) => setBookingForm({ ...bookingForm, from_date_time: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">To Date Time *</label>
                                    <input
                                        type="datetime-local" required
                                        value={bookingForm.to_date_time}
                                        onChange={(e) => setBookingForm({ ...bookingForm, to_date_time: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                            </div>

                            {/* KMs and Allowance */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Start KM (Opening Odometer)</label>
                                    <input
                                        type="number"
                                        value={bookingForm.start_km}
                                        onChange={(e) => setBookingForm({ ...bookingForm, start_km: e.target.value })}
                                        placeholder="e.g. 10200"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">End KM (Closing Odometer)</label>
                                    <input
                                        type="number"
                                        value={bookingForm.end_km}
                                        onChange={(e) => setBookingForm({ ...bookingForm, end_km: e.target.value })}
                                        placeholder="e.g. 10650"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-2">Driver Allowance? *</label>
                                    <div className="flex gap-4 items-center mt-1">
                                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="allowance"
                                                checked={bookingForm.driver_allowance === true}
                                                onChange={() => setBookingForm({ ...bookingForm, driver_allowance: true })}
                                                className="text-indigo-600 focus:ring-0"
                                            /> Yes
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="allowance"
                                                checked={bookingForm.driver_allowance === false}
                                                onChange={() => setBookingForm({ ...bookingForm, driver_allowance: false })}
                                                className="text-indigo-600 focus:ring-0"
                                            /> No
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Toll, Parking, border tax arrays */}
                            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Toll & Parking Charges</h5>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Static Toll Tax (₹)</label>
                                        <input
                                            type="number"
                                            value={bookingForm.toll_charge}
                                            onChange={(e) => setBookingForm({ ...bookingForm, toll_charge: parseFloat(e.target.value) || 0 })}
                                            placeholder="Toll tax amount..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Location Wise Parking</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Location (e.g. Airport)"
                                                value={tempParking.location}
                                                onChange={(e) => setTempParking({...tempParking, location: e.target.value})}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={tempParking.amount}
                                                onChange={(e) => setTempParking({...tempParking, amount: e.target.value})}
                                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddParking}
                                                className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            {bookingForm.parking_charges.map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 font-semibold font-mono">
                                                    {item.location}: ₹{item.amount}
                                                    <button type="button" onClick={() => handleRemoveParking(idx)} className="text-rose-500 hover:text-rose-700">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Border Entry Taxes</h5>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] text-slate-400 mb-0.5">State Wise Border Tax</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="State Name (e.g. Haryana)"
                                                value={tempBorder.state_name}
                                                onChange={(e) => setTempBorder({...tempBorder, state_name: e.target.value})}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={tempBorder.amount}
                                                onChange={(e) => setTempBorder({...tempBorder, amount: e.target.value})}
                                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddBorder}
                                                className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            {bookingForm.border_taxes.map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600 font-semibold font-mono">
                                                    {item.state_name}: ₹{item.amount}
                                                    <button type="button" onClick={() => handleRemoveBorder(idx)} className="text-rose-500 hover:text-rose-700">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Remarks & status */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] text-slate-400 mb-1">Remarks / Driver Instructions</label>
                                    <input
                                        type="text"
                                        value={bookingForm.remarks || ''}
                                        onChange={(e) => setBookingForm({ ...bookingForm, remarks: e.target.value })}
                                        placeholder="Add pickup details or requirements..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Journey Status *</label>
                                    <select
                                        value={bookingForm.status}
                                        onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    >
                                        <option value="Pending">Pending Assignment</option>
                                        <option value="Active">Active Journey</option>
                                        <option value="Completed">Completed / Issue Invoice</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3 bg-slate-50/50 p-4 -m-5 mt-2 rounded-b-xl">
                                <button
                                    type="button"
                                    onClick={() => setBookingModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors"
                                >
                                    Save Booking Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Asset Allocation Modal */}
            {allocateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800">Assign Driver & Vehicle</h3>
                            <button onClick={() => setAllocateModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAllocateSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Select Available Vehicle</label>
                                <select
                                    value={allocForm.vehicle_id}
                                    onChange={(e) => setAllocForm({ ...allocForm, vehicle_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                >
                                    <option value="">-- Choose Vehicle --</option>
                                    {vehicles.filter(v => v.status === 'active').map(v => (
                                        <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.vehicle_number})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Select Available Driver</label>
                                <select
                                    value={allocForm.driver_id}
                                    onChange={(e) => setAllocForm({ ...allocForm, driver_id: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                >
                                    <option value="">-- Choose Driver --</option>
                                    {drivers.filter(d => d.status === 'active').map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Update Status</label>
                                <select
                                    value={allocForm.status}
                                    onChange={(e) => setAllocForm({ ...allocForm, status: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                >
                                    <option value="Pending">Pending Assignment</option>
                                    <option value="Active">Dispatch / Active Journey</option>
                                    <option value="Completed">Trip Completed</option>
                                </select>
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAllocateModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs"
                                >
                                    Confirm Dispatch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Billing Invoice & Payments Split-screen Dialog */}
            {invoiceViewOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden h-[90vh]">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
                            <span className="text-sm font-semibold text-slate-700">Billing Desk: {selectedBooking.client?.name}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                                >
                                    <Printer size={13} /> Print Invoice
                                </button>
                                <button
                                    onClick={() => setInvoiceViewOpen(false)}
                                    className="p-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            {/* Invoice Sheet column */}
                            <div className="flex-1 overflow-y-auto p-6 bg-white print-area">
                                {(() => {
                                    const bill = calculateBilling(selectedBooking);
                                    const firm = selectedBooking.firm || firms[0] || {};
                                    return (
                                        <div className="space-y-6 text-xs text-slate-700">
                                            {/* Invoice Header */}
                                            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                                                <div>
                                                    <img src="/images/logo.webp" alt="Rover Rajasthan" className="h-14 object-contain mb-2" />
                                                    <h2 className="text-lg font-extrabold text-slate-800">{firm.name || 'Swift Travels & Tours'}</h2>
                                                    <p className="text-slate-500 text-[10px] max-w-[200px] leading-relaxed mt-1">
                                                        {firm.address || '102, Connaught Place, New Delhi'}
                                                    </p>
                                                    {firm.gst_number && <p className="text-[10px] text-slate-400 font-mono mt-1">GSTIN: {firm.gst_number}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <h1 className="text-xl font-black text-indigo-600 tracking-wider">DUTY INVOICE</h1>
                                                    <p className="font-mono text-slate-700 mt-1">Invoice: {selectedBooking.invoice_number || `DRAFT-${selectedBooking.id}`}</p>
                                                    <p className="text-slate-400 text-[9px]">Date: {selectedBooking.invoice_date || new Date().toISOString().split('T')[0]}</p>
                                                </div>
                                            </div>

                                            {/* Addresses */}
                                            <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-4">
                                                <div>
                                                    <span className="text-slate-400 font-bold block uppercase text-[9px] mb-1">Billed To:</span>
                                                    <span className="font-bold text-slate-800 text-xs">{selectedBooking.client?.name}</span>
                                                    {selectedBooking.client?.company_name && <p className="text-slate-600">{selectedBooking.client.company_name}</p>}
                                                    <p className="text-slate-500 mt-1">{selectedBooking.client?.phone}</p>
                                                    {selectedBooking.client?.gst_number && (
                                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">GSTIN: {selectedBooking.client.gst_number}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-slate-400 font-bold block uppercase text-[9px] mb-1">Route details:</span>
                                                    <span className="font-semibold text-slate-800">{selectedBooking.from_place} to {selectedBooking.to_place}</span>
                                                    <p className="text-slate-500 mt-1">
                                                        Time: {new Date(selectedBooking.from_date_time).toLocaleDateString('en-IN')} - {new Date(selectedBooking.to_date_time).toLocaleDateString('en-IN')}
                                                    </p>
                                                    <p className="text-slate-500 mt-0.5">Duration: {bill.days} Day(s)</p>
                                                </div>
                                            </div>

                                            {/* Odometer calculation stats */}
                                            <div className="grid grid-cols-4 bg-slate-50 rounded-lg p-3 text-center divide-x divide-slate-200 border border-slate-100">
                                                <div>
                                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Start KM</span>
                                                    <span className="font-bold font-mono text-slate-800 text-xs">{selectedBooking.start_km || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">End KM</span>
                                                    <span className="font-bold font-mono text-slate-800 text-xs">{selectedBooking.end_km || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Total KMs</span>
                                                    <span className="font-bold font-mono text-slate-800 text-xs">{selectedBooking.start_km && selectedBooking.end_km ? bill.distance : 'Calculating'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Assigned Car</span>
                                                    <span className="font-bold text-slate-800 text-xs truncate max-w-[80px] inline-block">{selectedBooking.vehicle?.vehicle_number || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {/* Bill Items */}
                                            <table className="w-full text-left border-collapse text-xs mt-3">
                                                <thead>
                                                    <tr className="bg-slate-100 border-b border-slate-200">
                                                        <th className="p-2.5 font-bold text-slate-600">Charge Head Description</th>
                                                        <th className="p-2.5 font-bold text-slate-600 text-center">Unit / Days</th>
                                                        <th className="p-2.5 font-bold text-slate-600 text-right">Rate (₹)</th>
                                                        <th className="p-2.5 font-bold text-slate-600 text-right">Amount (₹)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    <tr>
                                                        <td className="p-2.5 font-medium text-slate-700">{selectedBooking.booking_type?.name || 'Local'} Package (Min {bill.packageKm} KM)</td>
                                                        <td className="p-2.5 text-center">{bill.days} Day(s)</td>
                                                        <td className="p-2.5 text-right">{Number(selectedBooking.booking_type?.base_price || 0).toFixed(2)}</td>
                                                        <td className="p-2.5 text-right font-semibold">{Number(bill.basePackageCost).toFixed(2)}</td>
                                                    </tr>
                                                    {bill.extraKm > 0 && (
                                                        <tr>
                                                            <td className="p-2.5 font-medium text-slate-700">Extra Distance Charges ({bill.extraKm} KM)</td>
                                                            <td className="p-2.5 text-center">{bill.extraKm} KM</td>
                                                            <td className="p-2.5 text-right">{Number(selectedBooking.booking_type?.rate_per_km || 0).toFixed(2)}</td>
                                                            <td className="p-2.5 text-right font-semibold">{Number(bill.extraKmCost).toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                    {bill.driverAllow > 0 && (
                                                        <tr>
                                                            <td className="p-2.5 font-medium text-slate-700">Driver Night Allowance</td>
                                                            <td className="p-2.5 text-center">{bill.days} Night(s)</td>
                                                            <td className="p-2.5 text-right">{Number(selectedBooking.booking_type?.night_charge || 0).toFixed(2)}</td>
                                                            <td className="p-2.5 text-right font-semibold">{Number(bill.driverAllow).toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                    {bill.toll > 0 && (
                                                        <tr>
                                                            <td className="p-2.5 font-medium text-slate-700">Static Toll charges</td>
                                                            <td className="p-2.5 text-center">-</td>
                                                            <td className="p-2.5 text-right">-</td>
                                                            <td className="p-2.5 text-right font-semibold">{Number(bill.toll).toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                    {selectedBooking.parking_charges?.map((item, idx) => (
                                                        <tr key={`p-${idx}`}>
                                                            <td className="p-2.5 font-medium text-slate-700 text-slate-500">Parking Fee at {item.location}</td>
                                                            <td className="p-2.5 text-center">-</td>
                                                            <td className="p-2.5 text-right">-</td>
                                                            <td className="p-2.5 text-right font-semibold">{Number(item.amount).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                    {selectedBooking.border_taxes?.map((item, idx) => (
                                                        <tr key={`b-${idx}`}>
                                                            <td className="p-2.5 font-medium text-slate-700 text-slate-500">State entry border tax - {item.state_name}</td>
                                                            <td className="p-2.5 text-center">-</td>
                                                            <td className="p-2.5 text-right">-</td>
                                                            <td className="p-2.5 text-right font-semibold">{Number(item.amount).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Calculations */}
                                            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right font-mono text-[11px]">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Duty Subtotal:</span>
                                                    <span className="font-semibold text-slate-700">₹{bill.subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">CGST (2.5%):</span>
                                                    <span className="font-semibold text-slate-700">₹{bill.cgst.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">SGST (2.5%):</span>
                                                    <span className="font-semibold text-slate-700">₹{bill.sgst.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold text-xs">
                                                    <span>Grand Total Due:</span>
                                                    <span className="text-slate-900">₹{bill.grandTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-emerald-600">
                                                    <span>Total Paid Received:</span>
                                                    <span>- ₹{bill.paid.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-sm">
                                                    <span>Outstanding Balance:</span>
                                                    <span className={bill.balance <= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                                        ₹{bill.balance.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bank transfer info */}
                                            {firm.bank_name && (
                                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[10px] text-slate-500 space-y-0.5">
                                                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Direct Bank Transfer Details</span>
                                                    <div className="flex justify-between"><span>Bank:</span><span>{firm.bank_name}</span></div>
                                                    <div className="flex justify-between"><span>Account Number:</span><span>{firm.bank_account_no}</span></div>
                                                    <div className="flex justify-between"><span>IFSC Code:</span><span>{firm.bank_ifsc}</span></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Receipts sidebar column */}
                            <div className="w-full md:w-80 bg-slate-50/50 p-6 space-y-5 no-print flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Payments Log</h4>
                                        <button
                                            onClick={() => handleOpenReceiptModal(selectedBooking)}
                                            className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded hover:bg-emerald-100 border border-emerald-100"
                                        >
                                            + Add Receipt
                                        </button>
                                    </div>

                                    <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-1">
                                        {selectedBooking.receipts?.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-6">No payments received for this trip.</p>
                                        ) : (
                                            selectedBooking.receipts?.map((receipt) => (
                                                <div key={receipt.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 relative group">
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-semibold text-slate-800 font-mono text-[10px]">{receipt.receipt_number}</div>
                                                        <button 
                                                            onClick={() => handleDeleteReceipt(receipt.id)}
                                                            className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-center font-bold text-emerald-700">
                                                        <span>₹{Number(receipt.amount).toLocaleString('en-IN')}</span>
                                                        <span className="bg-emerald-50 text-[9px] px-1.5 py-0.5 rounded uppercase">{receipt.payment_mode}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 flex justify-between">
                                                        <span>{new Date(receipt.date).toLocaleDateString('en-IN')}</span>
                                                        <span className="truncate max-w-[80px] font-mono">{receipt.transaction_id || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setInvoiceViewOpen(false)}
                                    className="w-full bg-slate-800 text-white font-medium py-2 rounded-lg text-xs hover:bg-slate-900 transition-colors"
                                >
                                    Close Billing Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Receipt Modal */}
            {receiptModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Log Payment Receipt</h3>
                            <button onClick={() => setReceiptModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleReceiptSubmit} className="p-4 space-y-3">
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Receipt Voucher Number *</label>
                                <input
                                    type="text" required
                                    value={receiptForm.receipt_number}
                                    onChange={(e) => setReceiptForm({...receiptForm, receipt_number: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-0.5">Receipt Date *</label>
                                    <input
                                        type="date" required
                                        value={receiptForm.date}
                                        onChange={(e) => setReceiptForm({...receiptForm, date: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-0.5">Amount (₹) *</label>
                                    <input
                                        type="number" required min="0.01" step="0.01"
                                        value={receiptForm.amount}
                                        onChange={(e) => setReceiptForm({...receiptForm, amount: parseFloat(e.target.value) || 0})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-0.5">Payment Method *</label>
                                    <select
                                        value={receiptForm.payment_mode}
                                        onChange={(e) => setReceiptForm({...receiptForm, payment_mode: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                    >
                                        <option value="UPI">UPI / GPay / PhonePe</option>
                                        <option value="Cash">Cash Payments</option>
                                        <option value="Net Banking">IMPS / NEFT Transfer</option>
                                        <option value="Card">Debit / Credit Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-0.5">Transaction ID Reference</label>
                                    <input
                                        type="text"
                                        value={receiptForm.transaction_id}
                                        onChange={(e) => setReceiptForm({...receiptForm, transaction_id: e.target.value})}
                                        placeholder="e.g. TXN10029302"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Remarks</label>
                                <input
                                    type="text"
                                    value={receiptForm.remarks}
                                    onChange={(e) => setReceiptForm({...receiptForm, remarks: e.target.value})}
                                    placeholder="e.g. Received advance booking amount..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none"
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setReceiptModalOpen(false)}
                                    className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                >
                                    Issue Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
