import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/login', { email, password });
            onLogin(res.data.token, res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to sign in. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Branding */}
                    <div className="bg-slate-900 px-8 py-8 text-center">
                        <img
                            src="/images/logo.webp"
                            alt="Rover Rajasthan"
                            className="h-16 mx-auto object-contain rounded-lg bg-white p-1"
                        />
                        <h1 className="text-xl font-black text-white mt-4 tracking-wide">Rover Rajasthan</h1>
                        <p className="text-slate-400 text-sm mt-1">Tour &amp; Travel Control Board</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 p-2.5 text-sm focus:bg-white focus:border-indigo-600 outline-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2.5">
                                <AlertCircle size={15} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <p className="text-center text-[11px] text-slate-400">
                            Default: admin@roverrajasthan.com / password
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
