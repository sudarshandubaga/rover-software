import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Calendar, MapPin, DollarSign, FileText, Search, X, MessageSquare } from 'lucide-react';

export default function EventCrud() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        venue: '',
        start_date: '',
        end_date: '',
        budget: '',
        remarks: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/events');
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleOpenModal = (event = null) => {
        if (event) {
            setFormData(event);
        } else {
            setFormData({
                id: '',
                title: '',
                description: '',
                venue: '',
                start_date: '',
                end_date: '',
                budget: '',
                remarks: ''
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
                await axios.put(`/api/events/${formData.id}`, formData);
            } else {
                await axios.post('/api/events', formData);
            }
            fetchEvents();
            handleCloseModal();
        } catch (err) {
            alert('Error saving event. Please check inputs.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axios.delete(`/api/events/${id}`);
                fetchEvents();
            } catch (err) {
                alert('Error deleting event.');
            }
        }
    };

    const filteredEvents = events.filter(e => 
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.venue && e.venue.toLowerCase().includes(search.toLowerCase())) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Events</h2>
                    <p className="text-slate-500 text-sm">Create events and send promotional messages to customers based on event dates.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Add New Event
                </button>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by event title, venue, or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {/* Event Timeline List */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No events scheduled. Start by adding a corporate or wedding booking event.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{event.title}</h3>
                                        <span className="text-slate-400 text-xs">Event ID: #{event.id}</span>
                                    </div>
                                </div>

                                {event.description && (
                                    <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{event.description}</p>
                                )}

                                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                    {event.venue && (
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} className="text-slate-400" />
                                            <span>{event.venue}</span>
                                        </div>
                                    )}
                                    {event.start_date && (
                                        <div className="flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                            <span>
                                                {new Date(event.start_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`}
                                            </span>
                                        </div>
                                    )}
                                    {event.budget > 0 && (
                                        <div className="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            <DollarSign size={13} />
                                            <span>Budget: ₹{Number(event.budget).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>

                                {event.remarks && (
                                    <div className="text-xs text-slate-400 bg-slate-50 border-l-2 border-indigo-500 p-2 rounded">
                                        <strong>Logistics Remarks:</strong> {event.remarks}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 self-end md:self-center border-t border-slate-100 md:border-t-0 pt-3 md:pt-0">
                                <button
                                    onClick={() => alert(`Promotional messages for "${event.title}" have been queued and will be sent to customers!`)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <MessageSquare size={13} /> Send Promotion
                                </button>
                                <button
                                    onClick={() => handleOpenModal(event)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <Edit2 size={13} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Event Setup' : 'Plan New Event'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Event Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Annual Corporate Retreat / Wedding Group Transport"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description / Fleet Details</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Enter transport schedule details, guest counts, and fleet requirements..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Venue Address</label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Taj Palace, Jaipur"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Estimated Budget (₹)</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 50000"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Internal Remarks</label>
                                    <input
                                        type="text"
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Driver allowance is separate"
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
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
