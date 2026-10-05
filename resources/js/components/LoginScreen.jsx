import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, LogIn, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, Building2 } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/login', {
                login: loginIdentifier,
                password
            });
            onLogin(res.data.token, res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to sign in. Please verify your credentials.');
        }
        setLoading(false);
    };

    const fillCredentials = (identifier, pass) => {
        setLoginIdentifier(identifier);
        setPassword(pass);
        setError('');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800/40">
                    {/* Branding */}
                    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-8 py-8 text-center border-b border-slate-800">
                        <div className="inline-block p-2 bg-white rounded-2xl shadow-xl shadow-indigo-950/40 mb-3">
                            <img
                                src="/images/logo.webp"
                                alt="Rover Rajasthan"
                                className="h-14 object-contain"
                            />
                        </div>
                        <h1 className="text-xl font-black text-white tracking-wide">Rover Rajasthan</h1>
                        <p className="text-indigo-300 text-xs font-medium tracking-wide mt-1">
                            Tour &amp; Travel ERP • Multi-Branch Control Board
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                                Username or Email Address
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type="text"
                                    required
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    placeholder="e.g. admin or jaipur_manager"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 animate-fadeIn">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm cursor-pointer mt-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                            {loading ? 'Signing in...' : 'Sign In to Workspace'}
                        </button>

                        {/* Quick Role Fill helper */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                                Demo Accounts (Quick Fill)
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => fillCredentials('admin@roverrajasthan.com', 'password')}
                                    className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-100 transition-colors text-left"
                                >
                                    <ShieldCheck size={14} className="shrink-0 text-purple-600" />
                                    <div className="truncate">
                                        <div className="font-bold">Super Admin</div>
                                        <div className="text-[10px] text-purple-500 font-normal">All Branches</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fillCredentials('manager_jaipur', 'password123')}
                                    className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-100 transition-colors text-left"
                                >
                                    <Building2 size={14} className="shrink-0 text-indigo-600" />
                                    <div className="truncate">
                                        <div className="font-bold">Jaipur Manager</div>
                                        <div className="text-[10px] text-indigo-500 font-normal">Jaipur Branch</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
