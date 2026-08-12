import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Building, Car, MapPin, Printer, Clipboard, FileSpreadsheet } from 'lucide-react';

export default function MonthlyHiringReport() {
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7) // default to current month YYYY-MM
    );
    const [searchDept, setSearchDept] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMonthlyBookings();
    }, [selectedMonth]);

    const fetchMonthlyBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/bookings', {
                params: { month: selectedMonth }
            });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    // Calculate billing values for a booking
    const calculateBookingBill = (b) => {
        const bType = b.booking_type || {};
        const ratePerKm = Number(bType.rate_per_km || 0);
        const minKmPerDay = Number(bType.min_km_per_day || 0);
        const nightCharge = Number(bType.night_charge || 0);
        const basePrice = Number(bType.base_price || 0);

        // Days calculation
        const start = new Date(b.from_date_time);
        const end = new Date(b.to_date_time);
        const diffHrs = Math.max(1, (end - start) / (1000 * 60 * 60));
        const days = Math.max(1, Math.ceil(diffHrs / 24));

        // Travel Distance
        const startKm = Number(b.start_km || 0);
        const endKm = Number(b.end_km || 0);
        const distance = Math.max(0, endKm - startKm);

        // Billing
        const basePackageCost = basePrice * days;
        const packageKm = minKmPerDay * days;
        const extraKm = Math.max(0, distance - packageKm);
        const extraKmCost = extraKm * ratePerKm;

        const driverAllow = b.driver_allowance ? (nightCharge * days) : 0;
        
        const toll = Number(b.toll_charge || 0);
        
        const parking = (b.parking_charges || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const border = (b.border_taxes || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const subtotal = basePackageCost + extraKmCost + driverAllow + toll + parking + border;
        const tax = subtotal * 0.05; // 5% GST total
        const grandTotal = subtotal + tax;

        const paid = (b.receipts || []).reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const balance = grandTotal - paid;

        return {
            days,
            distance,
            subtotal,
            grandTotal,
            paid,
            balance
        };
    };

    // Group bookings by Department / Corporate Company
    const getGroupedBookings = () => {
        const groups = {};
        
        bookings.forEach(b => {
            // fallback to Client Company Name or 'Retail Passenger' if no department
            const dept = b.department || b.client?.company_name || 'Retail Passenger';
            
            if (searchDept && !dept.toLowerCase().includes(searchDept.toLowerCase())) {
                return;
            }

            if (!groups[dept]) {
                groups[dept] = {
                    departmentName: dept,
                    bookingsList: [],
                    totalDistance: 0,
                    totalSubtotal: 0,
                    totalGrand: 0,
                    totalPaid: 0,
                    totalBalance: 0
                };
            }

            const bill = calculateBookingBill(b);
            groups[dept].bookingsList.push({ ...b, bill });
            groups[dept].totalDistance += bill.distance;
            groups[dept].totalSubtotal += bill.subtotal;
            groups[dept].totalGrand += bill.grandTotal;
            groups[dept].totalPaid += bill.paid;
            groups[dept].totalBalance += bill.balance;
        });

        return Object.values(groups);
    };

    const groupedData = getGroupedBookings();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Monthly Department Billing</h2>
                    <p className="text-slate-500 text-sm">Review travel logs and dispatch receipts grouped by Corporate Departments for consolidated billing.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto no-print"
                >
                    <Printer size={18} /> Print Invoice Report
                </button>
            </div>

            {/* Filter and Month Picker */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 no-print">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">Billing Period:</span>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-600"
                    />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex-1">
                    <Search className="text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search/Filter by Department / Company Name..."
                        value={searchDept}
                        onChange={(e) => setSearchDept(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full text-slate-700 text-xs"
                    />
                </div>
            </div>

            {/* Loading / Empty States */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Compiling monthly report database...</div>
            ) : groupedData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No bookings found for the month of {new Date(selectedMonth + '-02').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}.
                </div>
            ) : (
                <div className="space-y-8 print-area">
                    {/* Document Header */}
                    <div className="flex items-center justify-between border-b-2 border-slate-800 pb-5">
                        <img src="/images/logo.webp" alt="Rover Rajasthan" className="h-16 object-contain" />
                        <div className="text-right">
                            <h1 className="text-2xl font-black text-indigo-900 tracking-tight">MONTHLY HIRING REPORT</h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                {new Date(selectedMonth + '-02').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>

                    {/* Consolidated billing summaries */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 no-print">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Clipboard size={14} /> Summary Sheet of all Departments
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-3 text-slate-500 font-bold uppercase">Department / Client Company</th>
                                        <th className="p-3 text-slate-500 font-bold uppercase text-center">Duties Run</th>
                                        <th className="p-3 text-slate-500 font-bold uppercase text-center">Total Distance</th>
                                        <th className="p-3 text-slate-500 font-bold uppercase text-right">Net Subtotal (₹)</th>
                                        <th className="p-3 text-slate-500 font-bold uppercase text-right">Tax + Grand (₹)</th>
                                        <th className="p-3 text-slate-500 font-bold uppercase text-right">Received (₹)</th>
                                        <th className="p-3 text-slate-500 font-bold uppercase text-right">Due Balance (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {groupedData.map((group, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                                                <Building size={14} className="text-slate-400" />
                                                {group.departmentName}
                                            </td>
                                            <td className="p-3 text-center text-slate-600 font-semibold">{group.bookingsList.length} Trips</td>
                                            <td className="p-3 text-center text-slate-600 font-mono font-medium">{group.totalDistance} KM</td>
                                            <td className="p-3 text-right text-slate-700 font-medium font-mono">{group.totalSubtotal.toFixed(2)}</td>
                                            <td className="p-3 text-right text-slate-800 font-bold font-mono">{group.totalGrand.toFixed(2)}</td>
                                            <td className="p-3 text-right text-emerald-600 font-bold font-mono">{group.totalPaid.toFixed(2)}</td>
                                            <td className={`p-3 text-right font-black font-mono ${group.totalBalance <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                {group.totalBalance.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Department wise detailed breakdown sheets */}
                    {groupedData.map((group, gIdx) => (
                        <div key={gIdx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden break-after-page">
                            {/* Group Header */}
                            <div className="bg-slate-800 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Building size={20} className="text-indigo-300" />
                                        <h3 className="text-base font-extrabold">{group.departmentName}</h3>
                                    </div>
                                    <p className="text-xs text-slate-300">
                                        Consolidated Travel Statement for {new Date(selectedMonth + '-02').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                <div className="text-right text-xs bg-slate-700/50 p-2.5 rounded-lg border border-slate-700 font-mono">
                                    <div>Duties: <span className="font-bold">{group.bookingsList.length}</span> | Distance: <span className="font-bold">{group.totalDistance} KM</span></div>
                                    <div className="mt-1">Invoice Due: <span className="text-yellow-300 font-extrabold">₹{group.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                </div>
                            </div>

                            {/* Details Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[10px]">
                                    <thead>
                                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                                            <th className="p-3">Duty ID</th>
                                            <th className="p-3">Client / Route</th>
                                            <th className="p-3">Schedule Time</th>
                                            <th className="p-3 text-center">Odo KM (Start/End)</th>
                                            <th className="p-3 text-center">Run KM</th>
                                            <th className="p-3 text-center">Days</th>
                                            <th className="p-3 text-right">Toll/Park/Border (₹)</th>
                                            <th className="p-3 text-right">Net Subtotal (₹)</th>
                                            <th className="p-3 text-right font-bold text-slate-800">Grand Total (5% GST)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {group.bookingsList.map((b, bIdx) => {
                                            const toll = b.bill.toll;
                                            const otherTaxes = b.bill.parking + b.bill.border;
                                            return (
                                                <tr key={bIdx} className="hover:bg-slate-50/50">
                                                    <td className="p-3 font-bold text-slate-500 font-mono">
                                                        #{b.id}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-slate-800">{b.client?.name}</div>
                                                        <div className="text-slate-400 mt-0.5 flex items-center gap-1">
                                                            <MapPin size={10} /> {b.from_place} → {b.to_place}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-slate-500">
                                                        {new Date(b.from_date_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit' })}
                                                    </td>
                                                    <td className="p-3 text-center font-mono font-medium text-slate-600">
                                                        {b.start_km || '-'} / {b.end_km || '-'}
                                                    </td>
                                                    <td className="p-3 text-center font-mono font-bold text-slate-700">
                                                        {b.bill.distance} KM
                                                    </td>
                                                    <td className="p-3 text-center text-slate-500">
                                                        {b.bill.days} Day(s)
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-slate-500">
                                                        Toll: {toll.toFixed(0)} | Other: {otherTaxes.toFixed(0)}
                                                    </td>
                                                    <td className="p-3 text-right font-mono font-medium text-slate-700">
                                                        {b.bill.subtotal.toFixed(2)}
                                                    </td>
                                                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                                                        {b.bill.grandTotal.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
