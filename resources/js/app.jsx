import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import {
    LayoutDashboard, Tag, Building, Users, Car, Calendar,
    Compass, MessageSquare, ClipboardList, PhoneCall, TrendingUp,
    IndianRupee, Loader2, Menu, X, CheckCircle, Clock, AlertTriangle, ArrowUpRight,
    FileText, Building2, Bell, ShieldCheck, MapPin, UserCheck
} from 'lucide-react';

// Import our CRUD and Pipeline components
import FirmCrud from './components/FirmCrud';
import DriverCrud from './components/DriverCrud';
import ClientCrud from './components/ClientCrud';
import VehicleCrud from './components/VehicleCrud';
import EventCrud from './components/EventCrud';
import BookingTypeCrud from './components/BookingTypeCrud';
import LeadsManager from './components/LeadsManager';
import BookingsManager from './components/BookingsManager';
import QuotationCrud from './components/QuotationCrud';
import DepartmentCrud from './components/DepartmentCrud';
import MonthlyHiringReport from './components/MonthlyHiringReport';
import LoginScreen from './components/LoginScreen';
import ProfileMenu from './components/ProfileMenu';
import UserManager from './components/UserManager';
import BranchManager from './components/BranchManager';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        active_bookings: 0,
        total_vehicles: 0,
        active_drivers: 0,
        open_leads: 0,
        pending_followups: 0,
        monthly_revenue: 0,
        booking_trends: []
    });
    const [loadingStats, setLoadingStats] = useState(false);
    const [activeDuties, setActiveDuties] = useState([]);
    const [pendingFollowupsList, setPendingFollowupsList] = useState([]);
    const [prefillLead, setPrefillLead] = useState(null);
    const [prefillQuotation, setPrefillQuotation] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // ==========================================
    // AUTH: restore session, guard expiring tokens
    // ==========================================
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (res) => res,
            (err) => {
                if (err.response?.status === 401 && axios.defaults.headers.common['Authorization']) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                }
                return Promise.reject(err);
            }
        );

        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            axios.get('/api/profile')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => setAuthLoading(false));
        } else {
            setAuthLoading(false);
        }

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const handleLogin = (token, loggedInUser) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        setUser(loggedInUser);
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) {
            // ignore logout errors — clear locally regardless
        }
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const handleUserChange = (updated) => setUser(updated);

    useEffect(() => {
        fetchDashboardStats();
    }, [activeTab]); // reload stats whenever switching back or actions occur

    const fetchDashboardStats = async () => {
        setLoadingStats(true);
        try {
            const res = await axios.get('/api/dashboard-stats');
            setStats(res.data);

            // Fetch currently active bookings for dashboard review
            const booksRes = await axios.get('/api/bookings');
            setActiveDuties(booksRes.data.filter(b => b.status === 'Active').slice(0, 5));

            // Fetch open leads with pending followups
            const leadsRes = await axios.get('/api/leads');
            const followList = [];
            leadsRes.data.forEach(l => {
                l.followups?.forEach(f => {
                    if (f.status === 'Pending') {
                        followList.push({ ...f, client_name: l.client_name, phone: l.phone });
                    }
                });
            });
            setPendingFollowupsList(followList.slice(0, 5));

            // Fetch fleet vehicles for expiry notifications (RC / Insurance / PUC)
            const vehiclesRes = await axios.get('/api/vehicles');
            setVehicles(vehiclesRes.data);
        } catch (err) {
            console.error('Error fetching dashboard stats', err);
        }
        setLoadingStats(false);
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ...(isSuperAdmin ? [
            { id: 'users', label: 'Managers & Users', icon: ShieldCheck },
            { id: 'branches', label: 'Company Branches', icon: Building2 },
        ] : []),
        { id: 'leads', label: 'Leads & Follow-ups', icon: PhoneCall },
        { id: 'bookings', label: 'Booking Desk', icon: Compass },
        { id: 'quotations', label: 'Quotations', icon: FileText },
        { id: 'clients', label: 'Clients & Corporates', icon: Users },
        { id: 'drivers', label: 'Drivers Database', icon: Users },
        { id: 'vehicles', label: 'Fleet (Vehicles)', icon: Car },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'departments', label: 'Departments', icon: Building2 },
        { id: 'monthly-report', label: 'Monthly Dept. Hiring', icon: ClipboardList },
        { id: 'booking-types', label: 'Booking Types (Rates)', icon: Tag },
        { id: 'firms', label: 'Firms Directory', icon: Building },
    ];

    // Lead / Quotation handoff to Quotation / Booking Desk
    const consumePrefill = () => {
        setPrefillLead(null);
        setPrefillQuotation(null);
    };

    // ==========================================
    // EXPIRY NOTIFICATIONS (RC / Insurance / PUC)
    // Alerts shown when within 5 days of expiry (includes the 1-day trigger) or expired.
    // ==========================================
    const expiryAlerts = [];
    vehicles.forEach(v => {
        const docs = [
            { label: 'RC', date: v.rc_expiry },
            { label: 'Insurance', date: v.insurance_expiry },
            { label: 'PUC', date: v.puc_expiry }
        ];
        docs.forEach(doc => {
            if (!doc.date) return;
            const expDate = new Date(doc.date + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const days = Math.round((expDate - today) / 86400000);
            if (days <= 5) {
                expiryAlerts.push({
                    vehicle: v.vehicle_number,
                    label: doc.label,
                    date: doc.date,
                    days
                });
            }
        });
    });
    expiryAlerts.sort((a, b) => a.days - b.days);
    const alertCount = expiryAlerts.length;

    const handleSendToQuotation = (lead) => {
        setPrefillLead(lead);
        setPrefillQuotation(null);
        setActiveTab('quotations');
    };

    const handleSendToBooking = (lead) => {
        setPrefillLead(lead);
        setPrefillQuotation(null);
        setActiveTab('bookings');
    };

    const handleSendQuotationToBooking = (quotation) => {
        setPrefillLead(null);
        setPrefillQuotation(quotation);
        setActiveTab('bookings');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboardOverview();
            case 'users':
                return <UserManager currentUser={user} />;
            case 'branches':
                return <BranchManager currentUser={user} />;
            case 'bookings':
                return <BookingsManager currentUser={user} prefillLead={prefillLead} prefillQuotation={prefillQuotation} onConsumePrefill={consumePrefill} />;
            case 'leads':
                return <LeadsManager currentUser={user} onSendToQuotation={handleSendToQuotation} onSendToBooking={handleSendToBooking} />;
            case 'quotations':
                return <QuotationCrud currentUser={user} prefillLead={prefillLead} onConsumePrefill={consumePrefill} onSendToBooking={handleSendQuotationToBooking} />;
            case 'departments':
                return <DepartmentCrud />;
            case 'monthly-report':
                return <MonthlyHiringReport />;
            case 'booking-types':
                return <BookingTypeCrud />;
            case 'firms':
                return <FirmCrud />;
            case 'clients':
                return <ClientCrud currentUser={user} />;
            case 'drivers':
                return <DriverCrud currentUser={user} />;
            case 'vehicles':
                return <VehicleCrud currentUser={user} />;
            case 'events':
                return <EventCrud currentUser={user} />;
            default:
                return renderDashboardOverview();
        }
    };

    const renderDashboardOverview = () => {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                Welcome back, {user?.name || 'User'}
                            </h2>
                            {isSuperAdmin ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-xl">
                                    <ShieldCheck size={14} /> Super Admin
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-xl">
                                    <Building2 size={14} /> Manager • {user?.branch?.name || 'Assigned Branch'}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-xs font-medium mt-1">
                            {isSuperAdmin
                                ? 'Enterprise Control Board • Showing live operations aggregated across all company branches & managers.'
                                : `Branch Workspace • Showing data and operations created by you for ${user?.branch?.name || 'your assigned branch'}.`}
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab('users')}
                                className="flex items-center gap-1.5 text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                                <ShieldCheck size={14} /> Manage Managers
                            </button>
                            <button
                                onClick={() => setActiveTab('branches')}
                                className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                                <Building2 size={14} /> Branches
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider block">Active Duties</span>
                                <span className="text-3xl font-black text-slate-800">{stats.active_bookings}</span>
                            </div>
                            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
                                <Compass size={22} />
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-4 flex items-center gap-1">
                            <span className="font-semibold text-indigo-600">On-road</span> vehicles currently dispatched.
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider block">Sales Revenue</span>
                                <span className="text-3xl font-black text-emerald-600 flex items-center">
                                    <IndianRupee size={24} className="shrink-0" />
                                    {stats.monthly_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                                <TrendingUp size={22} />
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-4">
                            Consolidated invoice payments received <span className="font-semibold text-emerald-600">this month</span>.
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider block">Open Enquiries</span>
                                <span className="text-3xl font-black text-slate-800">{stats.open_leads}</span>
                            </div>
                            <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
                                <MessageSquare size={22} />
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-4">
                            Leads currently in discussion pipeline.
                        </div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider block">Task Follow-ups</span>
                                <span className="text-3xl font-black text-rose-600">{stats.pending_followups}</span>
                            </div>
                            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg">
                                <PhoneCall size={22} />
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-4">
                            Call schedules pending completion <span className="font-semibold text-rose-600">today</span>.
                        </div>
                    </div>
                </div>

                {/* Operational Details row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Duties Log */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-800 text-sm">Dispatched On-Road Duties</h3>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-0.5"
                            >
                                View Desk <ArrowUpRight size={14} />
                            </button>
                        </div>
                        {activeDuties.length === 0 ? (
                            <p className="text-xs text-slate-400 py-8 text-center">No active vehicles on road currently.</p>
                        ) : (
                            <div className="space-y-3">
                                {activeDuties.map(b => (
                                    <div key={b.id} className="flex justify-between items-center bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs">
                                        <div className="space-y-0.5 min-w-0 pr-2">
                                            <div className="font-bold text-slate-800 truncate">{b.client?.name}</div>
                                            <div className="text-slate-500 font-medium truncate">{b.from_place} → {b.to_place}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                                                {b.vehicle?.vehicle_number || 'ALLOCATING'}
                                            </div>
                                            <span className="text-[9px] text-slate-400 mt-0.5 block">{b.driver?.name || 'No driver'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pending Call Schedules */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-800 text-sm">Pending Call Schedules</h3>
                            <button
                                onClick={() => setActiveTab('leads')}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-0.5"
                            >
                                View CRM <ArrowUpRight size={14} />
                            </button>
                        </div>
                        {pendingFollowupsList.length === 0 ? (
                            <p className="text-xs text-slate-400 py-8 text-center">All call follow-ups completed.</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingFollowupsList.map(f => (
                                    <div key={f.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-800">{f.client_name}</div>
                                            <p className="text-slate-600 leading-relaxed max-w-[280px]">{f.remarks}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-100 font-mono">
                                                {new Date(f.date_time).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Auth gate: show a loading screen while restoring the session,
    // and the login screen if the user is not authenticated.
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
                <img src="/images/logo.webp" alt="Rover Rajasthan" className="h-16 object-contain rounded-lg bg-white p-1" />
                <Loader2 size={26} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`bg-slate-900 text-slate-300 w-64 flex flex-col justify-between shrink-0 transition-transform z-40 duration-300 absolute md:relative h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
                }`}>
                <div>
                    {/* Branding */}
                    <div className="p-5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <img
                                src="/images/logo.webp"
                                alt="Rover Rajasthan"
                                className="h-9 w-9 rounded-lg object-contain bg-white p-0.5 shadow"
                            />
                            <span className={`font-black tracking-wide text-white transition-opacity ${!sidebarOpen ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
                                Rover Rajasthan
                            </span>
                        </div>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white md:hidden">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="p-3 space-y-1 mt-4">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                        }`}
                                >
                                    <Icon size={16} className="shrink-0" />
                                    <span className={`${!sidebarOpen ? 'md:hidden' : 'block'}`}>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className={`p-4 bg-slate-950 text-slate-500 border-t border-slate-800 text-[10px] text-center ${!sidebarOpen ? 'md:hidden' : 'block'}`}>
                    Rover Rajasthan
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Navbar */}
                <header className="bg-white border-b border-slate-200 h-14 shrink-0 flex items-center justify-between px-6 z-30 no-print">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-800">
                            <Menu size={20} />
                        </button>
                        <h1 className="font-extrabold text-slate-800 text-sm tracking-wide hidden sm:block">
                            TOUR & TRAVEL CONTROL BOARD
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Expiry notification bell */}
                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                title="Expiry Notifications"
                            >
                                <Bell size={20} />
                                {alertCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
                                        {alertCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                            <h3 className="font-bold text-sm text-slate-800">Expiry Notifications</h3>
                                            <span className="text-xs text-slate-400">RC • Insurance • PUC</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                            {expiryAlerts.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-slate-400">
                                                    <Bell className="mx-auto mb-2 text-slate-300" size={24} />
                                                    No expiring documents. All fleet documents are up to date.
                                                </div>
                                            ) : expiryAlerts.map((alert, idx) => {
                                                const expired = alert.days < 0;
                                                return (
                                                    <div key={idx} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/60">
                                                        <div className={`mt-0.5 p-1.5 rounded-lg ${expired ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            <AlertTriangle size={16} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-slate-800 truncate">
                                                                {alert.vehicle} — {alert.label}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {alert.label} expiry: {new Date(alert.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${expired ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                                                            {expired
                                                                ? (alert.days === 0 ? 'Expired today' : `Expired ${Math.abs(alert.days)}d ago`)
                                                                : (alert.days === 0 ? 'Expires today' : `In ${alert.days}d`)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Role & Branch pill */}
                        {isSuperAdmin ? (
                            <div className="bg-purple-50 border border-purple-200/80 rounded-xl px-3 py-1.5 text-xs text-purple-700 font-bold flex items-center gap-1.5 shadow-xs">
                                <ShieldCheck size={14} className="text-purple-600" />
                                <span>Super Admin</span>
                            </div>
                        ) : (
                            <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl px-3 py-1.5 text-xs text-indigo-700 font-bold flex items-center gap-1.5 shadow-xs">
                                <Building2 size={14} className="text-indigo-600" />
                                <span className="max-w-[150px] truncate">{user?.branch?.name || 'Manager'}</span>
                            </div>
                        )}

                        <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Live Server
                        </div>

                        {/* Profile dropdown */}
                        <ProfileMenu user={user} onLogout={handleLogout} onUserChange={handleUserChange} />
                    </div>
                </header>

                {/* Sub-view Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);