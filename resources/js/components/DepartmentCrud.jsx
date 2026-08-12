import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Building2, Search, X } from 'lucide-react';

export default function DepartmentCrud() {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', description: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setFormData(dept);
        } else {
            setFormData({ id: '', name: '', description: '' });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axios.put(`/api/departments/${formData.id}`, formData);
            } else {
                await axios.post('/api/departments', formData);
            }
            fetchDepartments();
            handleCloseModal();
        } catch (err) {
            alert('Error saving department.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await axios.delete(`/api/departments/${id}`);
                fetchDepartments();
            } catch (err) {
                alert('Error deleting department.');
            }
        }
    };

    const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Departments Directory</h2>
                    <p className="text-slate-500 text-sm">Manage corporate and internal departments.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm w-full sm:w-auto"
                >
                    <Plus size={18} /> Add Department
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search departments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-slate-700 text-sm focus:ring-0"
                />
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading departments...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    No departments found.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department Name</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                                                    <Building2 size={16} />
                                                </div>
                                                <span className="font-semibold text-slate-800">{dept.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {dept.description || <span className="text-slate-400 italic">No description</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(dept)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dept.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Department' : 'Add New Department'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. IT Department"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    placeholder="Optional description..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none resize-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
                                >
                                    {formData.id ? 'Update' : 'Save'} Department
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
