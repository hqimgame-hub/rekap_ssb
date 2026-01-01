"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAdmin } from "@/lib/actions";
import { Lock, User, ArrowLeft, Loader2, ChevronRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await verifyAdmin(username, password);
            if (result.success) {
                window.location.href = "/admin/dashboard";
            } else {
                setError(result.error || "Akses Ditolak. Periksa ID & Kunci Anda.");
                setLoading(false);
            }
        } catch (err: any) {
            setError("Gagal menghubungi server keamanan.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Ambient Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[140px] rounded-full opacity-60 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[140px] rounded-full opacity-60 pointer-events-none" />

            <div className="w-full max-w-[460px] space-y-10 relative z-10 animate-fade-in -mt-12 sm:-mt-20">
                <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center gap-3.5 text-[12px] font-black text-muted-foreground/60 hover:text-primary transition-all group uppercase tracking-[0.4em] px-4"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                    Beranda
                </button>

                <div className="card-refined p-10 sm:p-14 shadow-2xl shadow-primary/10 bg-white border-2 border-card-border rounded-[2.5rem] space-y-12">
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-2 transition-all hover:rotate-6 duration-500 border-2 border-primary/5 shadow-inner">
                            <ShieldCheck size={48} />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                                <span className="gradient-text">Akses Admin</span>
                            </h1>
                            <p className="text-[11px] font-black text-muted-foreground/50 uppercase tracking-[0.4em]">Official System Access</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] ml-2">Admin Username</label>
                            <div className="relative group">
                                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-all z-10 pointer-events-none p-1 bg-white/50 rounded-lg">
                                    <User size={20} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="ID Anda"
                                    className="w-full h-20 pr-8 rounded-[1.75rem] bg-slate-50 border-2 border-card-border/60 focus:ring-[12px] focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg placeholder:opacity-40"
                                    style={{ paddingLeft: '84px' }}
                                    disabled={loading}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] ml-2">Security Key</label>
                            <div className="relative group">
                                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-all z-10 pointer-events-none p-1 bg-white/50 rounded-lg">
                                    <Lock size={20} strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-20 pr-16 rounded-[1.75rem] bg-slate-50 border-2 border-card-border/60 focus:ring-[12px] focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg placeholder:tracking-widest"
                                    style={{ paddingLeft: '84px' }}
                                    disabled={loading}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-[1.5rem] text-red-500 text-[12px] font-black text-center animate-shake uppercase tracking-[0.2em]">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-base uppercase tracking-[0.4em] hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-5 group shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Verifikasi...</span>
                                </div>
                            ) : (
                                <>
                                    Log In Admin
                                    <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.6em] pb-12">
                    Official System Security &bull; SSB v1.0
                </p>
            </div>
        </div>
    );
}
