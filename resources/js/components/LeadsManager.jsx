import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Edit2, Trash2, Search, X, User, Phone, Mail, FileText,
    Calendar, CheckCircle, AlertCircle, RefreshCw, Send, Printer,
    Clock, DollarSign, MessageSquare, ChevronRight, Compass
} from 'lucide-react';

export default function LeadsManager({ onSendToQuotation, onSendToBooking }) {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal states
    const [leadModalOpen, setLeadModalOpen] = useState(false);
    const [followupModalOpen, setFollowupModalOpen] = useState(false);

    // Form states
    const [leadForm, setLeadForm] = useState({
        id: '',
        client_name: '',
        phone: '',
        email: '',
        source: 'Website',
        requirements: '',
        status: 'New'
    });

    const [followupForm, setFollowupForm] = useState({
        lead_id: '',
        date_time: '',
        remarks: '',
        next_followup_date: '',
        status: 'Pending'
    });


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/leads');
            setLeads(res.data);
            if (selectedLead) {
                const updated = res.data.find(l => l.id === selectedLead.id);
                if (updated) setSelectedLead(updated);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    // ==========================================
    // LEAD ACTIONS
    // ==========================================
    const handleOpenLeadModal = (lead = null) => {
        if (lead) {
            setLeadForm(lead);
        } else {
            setLeadForm({
                id: '',
                client_name: '',
                phone: '',
                email: '',
                source: 'Website',
                requirements: '',
                status: 'New'
            });
        }
        setLeadModalOpen(true);
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        try {
            if (leadForm.id) {
                await axios.put(`/api/leads/${leadForm.id}`, leadForm);
            } else {
                await axios.post('/api/leads', leadForm);
            }
            fetchLeads();
            setLeadModalOpen(false);
        } catch (err) {
            alert('Error saving lead details.');
        }
    };

    const handleLeadDelete = async (id) => {
        if (window.confirm('Delete this lead and all associated follow-ups/quotations?')) {
            try {
                await axios.delete(`/api/leads/${id}`);
                setSelectedLead(null);
                fetchLeads();
            } catch (err) {
                alert('Error deleting lead.');
            }
        }
    };

    // ==========================================
    // FOLLOWUP ACTIONS
    // ==========================================
    const handleOpenFollowupModal = () => {
        if (!selectedLead) return;
        setFollowupForm({
            lead_id: selectedLead.id,
            date_time: new Date().toISOString().slice(0, 16),
            remarks: '',
            next_followup_date: '',
            status: 'Pending'
        });
        setFollowupModalOpen(true);
    };

    const handleFollowupSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/followups', followupForm);
            fetchLeads();
            setFollowupModalOpen(false);
        } catch (err) {
            alert('Error logging follow-up.');
        }
    };

    const handleToggleFollowupStatus = async (followup) => {
        const updatedStatus = followup.status === 'Pending' ? 'Completed' : 'Pending';
        try {
            await axios.put(`/api/followups/${followup.id}`, {
                ...followup,
                status: updatedStatus
            });
            fetchLeads();
        } catch (err) {
            alert('Error updating status.');
        }
    };

    const handleFollowupDelete = async (id) => {
        if (window.confirm('Delete this follow-up entry?')) {
            try {
                await axios.delete(`/api/followups/${id}`);
                fetchLeads();
            } catch (err) {
                alert('Error deleting follow-up.');
            }
        }
    };

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.client_name.toLowerCase().includes(search.toLowerCase()) ||
            lead.phone.includes(search) ||
            (lead.requirements && lead.requirements.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full">
            {/* Leads Column */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
                <div className="p-4 border-b border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-lg">Travel Leads Pipeline</h3>
                        <button
                            onClick={() => handleOpenLeadModal()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg transition-colors"
                            title="Add Lead"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 flex-1">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-0 outline-none text-xs w-full"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs px-2 py-1.5 rounded-lg outline-none text-slate-600 focus:border-indigo-600"
                        >
                            <option value="All">All Status</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {loading ? (
                        <div className="text-center py-8 text-xs text-slate-400">Loading pipeline...</div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">No leads found.</div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <div
                                key={lead.id}
                                className={`p-4 transition-all border-l-4 hover:bg-indigo-50/20 ${selectedLead?.id === lead.id
                                        ? 'bg-indigo-50/40 border-l-indigo-600'
                                        : 'border-l-transparent'
                                    }`}
                            >
                                <div onClick={() => setSelectedLead(lead)} className="cursor-pointer flex items-center justify-between">
                                    <div className="space-y-1 min-w-0 pr-2">
                                        <div className="font-semibold text-sm text-slate-800 truncate">{lead.client_name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{lead.phone}</div>
                                        <p className="text-slate-500 text-xs truncate max-w-[200px]">{lead.requirements || 'No specifications listed'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lead.status === 'New' ? 'bg-blue-50 text-blue-700' :
                                                lead.status === 'Contacted' ? 'bg-amber-50 text-amber-700' :
                                                    lead.status === 'Quoted' ? 'bg-purple-50 text-purple-700' :
                                                        lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-700' :
                                                            'bg-slate-100 text-slate-600'
                                            }`}>
                                            {lead.status}
                                        </span>
                                        <span className="text-[9px] text-slate-400">
                                            {new Date(lead.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSendToQuotation && onSendToQuotation(lead); }}
                                        className="flex-1 text-[10px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md px-2 py-1.5 flex items-center justify-center gap-1 transition-colors"
                                        title="Send To Quotation"
                                    >
                                        <FileText size={12} /> Send To Quotation
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSendToBooking && onSendToBooking(lead); }}
                                        className="flex-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md px-2 py-1.5 flex items-center justify-center gap-1 transition-colors"
                                        title="Send To Booking Desk"
                                    >
                                        <Compass size={12} /> Send To Booking Desk
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Lead Details Column (Follow-ups & Quotations) */}
            <div className="lg:col-span-2 h-[calc(100vh-12rem)] min-h-[500px]">
                {selectedLead ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                        {/* Header details */}
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedLead.client_name}</h3>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${selectedLead.status === 'New' ? 'bg-blue-50 text-blue-700' :
                                            selectedLead.status === 'Contacted' ? 'bg-amber-50 text-amber-700' :
                                                selectedLead.status === 'Quoted' ? 'bg-purple-50 text-purple-700' :
                                                    selectedLead.status === 'Converted' ? 'bg-emerald-50 text-emerald-700' :
                                                        'bg-slate-100 text-slate-600'
                                        }`}>
                                        {selectedLead.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Phone size={13} /> {selectedLead.phone}</span>
                                    {selectedLead.email && <span className="flex items-center gap-1"><Mail size={13} /> {selectedLead.email}</span>}
                                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">Source: {selectedLead.source}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenLeadModal(selectedLead)}
                                    className="p-2 border border-slate-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                                >
                                    <Edit2 size={13} /> Edit Lead
                                </button>
                                <button
                                    onClick={() => handleLeadDelete(selectedLead.id)}
                                    className="p-2 border border-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>

                        {/* Split views: Follow-ups and Quotations */}
                        <div className="flex-1 overflow-y-auto p-6 ">
                            {/* Followups Column */}
                            <div className="space-y-4 ">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                        <MessageSquare size={16} className="text-slate-400" /> Lead Follow-ups Log
                                    </h4>
                                    <button
                                        onClick={handleOpenFollowupModal}
                                        className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded hover:bg-indigo-100 transition-colors"
                                    >
                                        + Schedule Log
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {selectedLead.followups?.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-6 text-center">No follow-ups recorded yet. Log the first touchpoint.</p>
                                    ) : (
                                        selectedLead.followups?.map((followup) => (
                                            <div key={followup.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2 relative group">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-slate-500">
                                                        {new Date(followup.date_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => handleToggleFollowupStatus(followup)}
                                                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${followup.status === 'Completed'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-amber-100 text-amber-700'
                                                                }`}
                                                        >
                                                            {followup.status}
                                                        </button>
                                                        <button
                                                            onClick={() => handleFollowupDelete(followup.id)}
                                                            className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-slate-700 text-xs leading-relaxed">{followup.remarks}</p>
                                                {followup.next_followup_date && (
                                                    <div className="text-[10px] text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded font-medium inline-block mt-1">
                                                        Next Followup: {new Date(followup.next_followup_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-12 text-center h-full">
                        <div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-3">
                            <Clock size={32} />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">Select a Travel Lead</h3>
                        <p className="text-slate-400 text-sm max-w-sm mt-1">Click on any lead from the list to view its pipeline details, log follow-ups, and generate quotes.</p>
                    </div>
                )}
            </div>

            {/* Lead Modal */}
            {leadModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {leadForm.id ? 'Edit Lead Profile' : 'Capture New Travel Lead'}
                            </h3>
                            <button onClick={() => setLeadModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleLeadSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client/Lead Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={leadForm.client_name}
                                    onChange={(e) => setLeadForm({ ...leadForm, client_name: e.target.value })}
                                    placeholder="e.g. Vikram Malhotra"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={leadForm.phone}
                                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                        placeholder="e.g. +91 9988776655"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={leadForm.email || ''}
                                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                        placeholder="e.g. client@domain.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Lead Source</label>
                                    <select
                                        value={leadForm.source}
                                        onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    >
                                        <option value="Website">Website Form</option>
                                        <option value="Referral">Client Referral</option>
                                        <option value="Cold Call">Cold Call</option>
                                        <option value="Google Ads">Google Ads</option>
                                        <option value="WhatsApp">WhatsApp Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status *</label>
                                    <select
                                        value={leadForm.status}
                                        onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Quoted">Quoted</option>
                                        <option value="Converted">Converted (Closed Won)</option>
                                        <option value="Lost">Lost (Closed Lost)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Trip Specifications & Requirements</label>
                                <textarea
                                    value={leadForm.requirements || ''}
                                    onChange={(e) => setLeadForm({ ...leadForm, requirements: e.target.value })}
                                    rows="3"
                                    placeholder="Enter trip schedule, destination details, passenger count, preferred car type..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none resize-none"
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setLeadModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
                                >
                                    Save Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Followup Log Modal */}
            {followupModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Log Travel Touchpoint</h3>
                            <button onClick={() => setFollowupModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFollowupSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={followupForm.date_time}
                                        onChange={(e) => setFollowupForm({ ...followupForm, date_time: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Next follow-up date</label>
                                    <input
                                        type="date"
                                        value={followupForm.next_followup_date}
                                        onChange={(e) => setFollowupForm({ ...followupForm, next_followup_date: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Discussion Summary / Remarks *</label>
                                <textarea
                                    required
                                    value={followupForm.remarks}
                                    onChange={(e) => setFollowupForm({ ...followupForm, remarks: e.target.value })}
                                    rows="3"
                                    placeholder="Client requested customized quote with Taj entry charges details..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Touchpoint Status *</label>
                                <select
                                    value={followupForm.status}
                                    onChange={(e) => setFollowupForm({ ...followupForm, status: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                >
                                    <option value="Pending">Pending (Action Required)</option>
                                    <option value="Completed">Completed (Logged/Done)</option>
                                </select>
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFollowupModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
                                >
                                    Log Call
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
