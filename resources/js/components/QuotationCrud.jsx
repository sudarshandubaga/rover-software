import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, FileText, Search, X, User, Printer, PlusCircle, MinusCircle, Link2, ExternalLink, MessageSquare, Check, Loader2, Compass } from 'lucide-react';

export default function QuotationCrud({ currentUser = null, prefillLead = null, onConsumePrefill = null, onSendToBooking = null }) {
    const [quotations, setQuotations] = useState([]);
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        lead_id: '',
        quotation_number: '',
        date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        details: [
            { description: '', qty: 1, rate: 0, amount: 0 }
        ],
        status: 'Draft'
    });
    const [loading, setLoading] = useState(false);
    const [activePrint, setActivePrint] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [smsSendingId, setSmsSendingId] = useState(null);
    const [toastMsg, setToastMsg] = useState(null);

    useEffect(() => {
        fetchQuotations();
        fetchLeads();
    }, []);

    // Open the quotation modal with the handed-off lead pre-selected
    useEffect(() => {
        if (prefillLead) {
            setFormData(prev => ({
                ...prev,
                lead_id: prefillLead.id,
            }));
            setModalOpen(true);
            if (onConsumePrefill) onConsumePrefill();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefillLead]);

    const fetchQuotations = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/quotations');
            setQuotations(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchLeads = async () => {
        try {
            const res = await axios.get('/api/leads');
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenModal = (quote = null) => {
        if (quote) {
            setFormData({
                ...quote,
                details: typeof quote.details === 'string' ? JSON.parse(quote.details) : quote.details || []
            });
        } else {
            setFormData({
                id: '',
                lead_id: '',
                quotation_number: 'QT-' + Date.now().toString().slice(-6),
                date: new Date().toISOString().split('T')[0],
                total_amount: 0,
                details: [
                    { description: '', qty: 1, rate: 0, amount: 0 }
                ],
                status: 'Draft'
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

    const handleAddQuoteItem = () => {
        setFormData(prev => {
            const details = [...prev.details, { description: '', qty: 1, rate: 0, amount: 0 }];
            return { ...prev, details };
        });
    };

    const handleRemoveQuoteItem = (index) => {
        setFormData(prev => {
            const details = prev.details.filter((_, i) => i !== index);
            const total = details.reduce((sum, item) => sum + (Number(item.qty) * Number(item.rate)), 0);
            return { ...prev, details, total_amount: total };
        });
    };

    const handleQuoteItemChange = (index, field, value) => {
        setFormData(prev => {
            const details = prev.details.map((item, i) => {
                if (i !== index) return item;
                const updated = { ...item, [field]: value };
                if (field === 'qty' || field === 'rate') {
                    updated.amount = Number(updated.qty || 0) * Number(updated.rate || 0);
                }
                return updated;
            });
            const total = details.reduce((sum, item) => sum + (item.amount || 0), 0);
            return { ...prev, details, total_amount: total };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axios.put(`/api/quotations/${formData.id}`, formData);
            } else {
                await axios.post('/api/quotations', formData);
            }
            fetchQuotations();
            handleCloseModal();
        } catch (err) {
            alert('Error saving quotation. Make sure the quotation number is unique.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this quotation?')) {
            try {
                await axios.delete(`/api/quotations/${id}`);
                fetchQuotations();
            } catch (err) {
                alert('Error deleting quotation.');
            }
        }
    };

    const handleStatusChange = async (quote, status) => {
        try {
            await axios.put(`/api/quotations/${quote.id}`, {
                ...quote,
                status
            });
            fetchQuotations();
        } catch (err) {
            alert('Error updating status.');
        }
    };

    const handleCopyLink = (quote) => {
        const url = quote.public_url || `${window.location.origin}/q/${quote.public_token}`;
        navigator.clipboard.writeText(url);
        setCopiedId(quote.id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const handleSendSms = async (quote) => {
        setSmsSendingId(quote.id);
        try {
            const res = await axios.post(`/api/quotations/${quote.id}/send-sms`);
            if (res.data?.success) {
                setToastMsg({ type: 'success', text: `SMS dispatched successfully to ${res.data.recipient}!` });
            } else {
                setToastMsg({ type: 'error', text: res.data?.error || 'Failed to dispatch SMS' });
            }
        } catch (err) {
            setToastMsg({ type: 'error', text: err.response?.data?.message || 'Error sending SMS' });
        } finally {
            setSmsSendingId(null);
            setTimeout(() => setToastMsg(null), 4000);
        }
    };

    const filteredQuotations = quotations.filter(q =>
        q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
        (q.lead && q.lead.client_name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Quotations</h2>
                    <p className="text-slate-500 text-sm">Manage all quotations and estimates sent to leads and clients.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Generate Quotation
                </button>
            </div>

            {toastMsg && (
                <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm border ${
                    toastMsg.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    <span>{toastMsg.text}</span>
                    <button onClick={() => setToastMsg(null)} className="text-xs uppercase tracking-wider font-bold opacity-75 hover:opacity-100">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by quote number or client name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading quotations...</div>
            ) : filteredQuotations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No quotations found.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Quotation No.</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Lead / Client</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Total Amount</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredQuotations.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-sm font-mono font-medium text-indigo-600">
                                            {quote.quotation_number}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 p-1.5 rounded-md text-slate-500">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-semibold text-slate-700">{quote.lead ? quote.lead.client_name : 'Unknown Lead'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(quote.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-800">
                                            ₹{Number(quote.total_amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="p-4 text-center">
                                            <select
                                                value={quote.status}
                                                onChange={(e) => handleStatusChange(quote, e.target.value)}
                                                className={`text-[11px] font-bold uppercase rounded border px-2 py-1 outline-none ${quote.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    quote.status === 'Rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                                                        quote.status === 'Sent' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            'bg-slate-200 text-slate-700 border-slate-300'
                                                    }`}
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Sent">Sent</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Copy Public Link */}
                                                <button
                                                    onClick={() => handleCopyLink(quote)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title={copiedId === quote.id ? "Link Copied!" : "Copy Public URL to Clipboard"}
                                                >
                                                    {copiedId === quote.id ? <Check size={16} className="text-emerald-600" /> : <Link2 size={16} />}
                                                </button>

                                                {/* Open Public Page */}
                                                <a
                                                    href={quote.public_url || `/q/${quote.public_token}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Open Public Customer View"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>

                                                {/* Send SMS to Customer */}
                                                <button
                                                    onClick={() => handleSendSms(quote)}
                                                    disabled={smsSendingId === quote.id}
                                                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Send Quotation SMS with Link to Customer"
                                                >
                                                    {smsSendingId === quote.id ? (
                                                        <Loader2 size={16} className="animate-spin text-sky-600" />
                                                    ) : (
                                                        <MessageSquare size={16} />
                                                    )}
                                                </button>

                                                {/* Create Booking from Quotation */}
                                                <button
                                                    onClick={() => onSendToBooking && onSendToBooking(quote)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Create Booking from Quotation"
                                                >
                                                    <Compass size={16} />
                                                </button>

                                                <button
                                                    onClick={() => setActivePrint(quote)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Print"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(quote)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(quote.id)}
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

            {/* Print View Overlay */}
            {activePrint && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center py-10 overflow-y-auto print:py-0 print:bg-white">
                    <div className="w-full max-w-4xl px-4 flex flex-wrap justify-between items-center gap-3 mb-6 print:hidden">
                        <button
                            onClick={() => setActivePrint(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm"
                        >
                            <X size={18} /> Close
                        </button>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => {
                                    const quoteToConvert = activePrint;
                                    setActivePrint(null);
                                    if (onSendToBooking) onSendToBooking(quoteToConvert);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs shadow-sm transition-colors"
                                title="Create Booking from this Quotation"
                            >
                                <Compass size={15} /> Create Booking
                            </button>

                            <button
                                onClick={() => handleCopyLink(activePrint)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs transition-colors"
                            >
                                {copiedId === activePrint.id ? <Check size={15} /> : <Link2 size={15} />}
                                {copiedId === activePrint.id ? 'Copied Public Link!' : 'Copy Public Link'}
                            </button>

                            <a
                                href={activePrint.public_url || `/q/${activePrint.public_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs transition-colors"
                            >
                                <ExternalLink size={15} /> Open Web Page
                            </a>

                            <button
                                onClick={() => handleSendSms(activePrint)}
                                disabled={smsSendingId === activePrint.id}
                                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs transition-colors disabled:opacity-50"
                            >
                                {smsSendingId === activePrint.id ? <Loader2 size={15} className="animate-spin text-sky-600" /> : <MessageSquare size={15} />}
                                Send SMS
                            </button>

                            <button
                                onClick={() => window.print()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs shadow-sm transition-colors"
                            >
                                <Printer size={15} /> Print Document
                            </button>
                        </div>
                    </div>

                    <div className="w-full max-w-3xl bg-white border border-slate-200 shadow-xl print:shadow-none print:border-none rounded-xl p-10 print:p-0 print:m-0">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                            <div>
                                <img src="/images/logo.webp" alt="Rover Rajasthan" className="h-16 object-contain mb-4" />
                                <h1 className="text-4xl font-black text-indigo-900 tracking-tight">QUOTATION</h1>
                                <p className="text-slate-500 mt-1 font-medium">Quote #{activePrint.quotation_number}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-slate-800">Rover Rajasthan Logistics</h2>
                                <p className="text-slate-500 mt-1">123 Travel Avenue, Tourism Park</p>
                                <p className="text-slate-500">New Delhi, 110001</p>
                                <p className="text-slate-500">GSTIN: 07AAACA1234A1Z5</p>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="flex justify-between mb-8">
                            <div className="bg-slate-50 p-4 rounded-lg flex-1 mr-4 border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prepared For:</h3>
                                <p className="font-bold text-lg text-slate-800">{activePrint.lead?.client_name}</p>
                                <p className="text-slate-600 mt-1">Phone: {activePrint.lead?.phone}</p>
                                {activePrint.lead?.email && <p className="text-slate-600">Email: {activePrint.lead?.email}</p>}
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg flex-1 ml-4 border border-slate-100 text-right">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quote Details:</h3>
                                <p className="text-slate-800"><span className="font-medium">Date:</span> {new Date(activePrint.date).toLocaleDateString('en-IN')}</p>
                                <p className="text-slate-800 mt-1"><span className="font-medium">Valid Until:</span> {new Date(new Date(activePrint.date).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</p>
                                <p className="text-slate-800 mt-1"><span className="font-medium">Status:</span> {activePrint.status}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-left mb-8 border-collapse">
                            <thead>
                                <tr className="bg-slate-800 text-white">
                                    <th className="p-3 rounded-tl-lg font-medium text-sm">Description</th>
                                    <th className="p-3 text-center font-medium text-sm">Quantity</th>
                                    <th className="p-3 text-right font-medium text-sm">Rate (₹)</th>
                                    <th className="p-3 rounded-tr-lg text-right font-medium text-sm">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(typeof activePrint.details === 'string' ? JSON.parse(activePrint.details) : activePrint.details || []).map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-200">
                                        <td className="p-3 py-4 text-slate-800">{item.description}</td>
                                        <td className="p-3 py-4 text-center text-slate-600">{item.qty}</td>
                                        <td className="p-3 py-4 text-right text-slate-600">{Number(item.rate).toLocaleString('en-IN')}</td>
                                        <td className="p-3 py-4 text-right font-bold text-slate-800">{Number(item.amount).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end mb-12">
                            <div className="w-1/2">
                                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                    <span className="text-slate-800 font-bold">₹{Number(activePrint.total_amount).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">Tax (GST)</span>
                                    <span className="text-slate-500 font-medium">As Applicable</span>
                                </div>
                                <div className="flex justify-between items-center py-3 mt-2 bg-indigo-50 px-4 rounded-lg">
                                    <span className="text-indigo-900 font-bold text-lg">Total Amount</span>
                                    <span className="text-indigo-600 font-black text-xl">₹{Number(activePrint.total_amount).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-200 pt-6 text-sm text-slate-500">
                            <p className="font-bold text-slate-700 mb-1">Terms & Conditions:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Quotation is valid for 15 days from the date of issue.</li>
                                <li>Toll taxes, parking, and border taxes will be charged extra on actuals.</li>
                                <li>50% advance payment required for confirmation of booking.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Quotation' : 'Create Quotation'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Lead / Client *</label>
                                    <select
                                        name="lead_id"
                                        required
                                        value={formData.lead_id}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    >
                                        <option value="">-- Choose Lead --</option>
                                        {leads.map(lead => (
                                            <option key={lead.id} value={lead.id}>{lead.client_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Quote Reference Number *</label>
                                    <input
                                        type="text"
                                        name="quotation_number"
                                        required
                                        value={formData.quotation_number}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Quotation Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Sent">Sent</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Line Items details</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddQuoteItem}
                                        className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-1 rounded hover:bg-indigo-100"
                                    >
                                        + Add Line Item
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                    {formData.details.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <input
                                                type="text"
                                                required
                                                value={item.description}
                                                onChange={(e) => handleQuoteItemChange(idx, 'description', e.target.value)}
                                                placeholder="Description (e.g. Innova Rental)"
                                                className="flex-1 bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                                            />
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) => handleQuoteItemChange(idx, 'qty', e.target.value)}
                                                placeholder="Qty"
                                                className="w-16 bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                                            />
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={item.rate}
                                                onChange={(e) => handleQuoteItemChange(idx, 'rate', e.target.value)}
                                                placeholder="Rate"
                                                className="w-24 bg-white border border-slate-200 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                                            />
                                            <div className="w-24 text-right font-bold text-slate-700 text-sm">
                                                ₹{item.amount}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuoteItem(idx)}
                                                className="text-slate-400 hover:text-rose-600 p-1"
                                                disabled={formData.details.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                    <span className="font-bold text-indigo-900">Total Amount:</span>
                                    <span className="font-black text-lg text-indigo-600">₹{formData.total_amount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                                <div>
                                    {formData.id && onSendToBooking && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentLead = leads.find(l => String(l.id) === String(formData.lead_id));
                                                const quoteData = { ...formData, lead: currentLead };
                                                handleCloseModal();
                                                onSendToBooking(quoteData);
                                            }}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-1.5 shadow-sm"
                                            title="Convert this Quotation to a Booking directly"
                                        >
                                            <Compass size={16} /> Create Booking
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
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
                                        Save Quotation
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
