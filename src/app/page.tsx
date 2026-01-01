"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, UserCog, Sparkles } from "lucide-react";

export default function HomePage() {
    const router = useRouter();
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/classes")
            .then(res => res.json())
            .then(data => {
                setClasses(data);
                setLoading(false);
            });
    }, []);

    const handleClassChange = (id: string) => {
        setSelectedId(id);
        if (id) {
            router.push(`/input-menu/${id}`);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col justify-between relative overflow-hidden selection:bg-primary/10">
            {/* Ambient Background */}
            <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full opacity-40 pointer-events-none" />

            <div className="flex-grow flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[600px] animate-fade-in text-center space-y-20 sm:space-y-32">
                    {/* Hero Section */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* School Logo */}
                        <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <Image
                                    src="/logo.png"
                                    alt="Logo SMPN 32 SURABAYA"
                                    width={120}
                                    height={120}
                                    className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md hover:scale-110 transition-transform duration-500 ease-out"
                                    priority
                                />
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/5 border-2 border-primary/20 text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] mb-1 shadow-sm mx-auto">
                            <Sparkles size={12} />
                            <span>Program Gizi Terpadu</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] px-4">
                                <span className="gradient-text italic py-1 inline-block">Sarapan Sehat Bersama</span>
                            </h1>
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-muted-foreground/20" />
                                    <p className="text-[11px] sm:text-xs font-black text-muted-foreground/50 uppercase tracking-[0.5em]">SMPN 32 SURABAYA</p>
                                    <div className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-muted-foreground/20" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation UI */}
                    <div className="space-y-12 text-center max-w-[400px] mx-auto w-full px-4 flex flex-col items-center">
                        <div className="space-y-7 w-full">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                                <label className="block text-[10px] sm:text-[11px] font-extrabold text-muted-foreground/40 uppercase tracking-[0.3em]">Pilih Kelas Untuk Input</label>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            </div>

                            <div className="relative group w-full flex justify-center">
                                <select
                                    value={selectedId}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    style={{ textAlignLast: 'center' }}
                                    className="w-full h-16 rounded-2xl bg-white border-2 border-card-border appearance-none font-bold text-base sm:text-lg focus:ring-[8px] focus:ring-primary/5 focus:border-primary outline-none transition-all cursor-pointer shadow-lg shadow-slate-200/40 hover:border-primary/40 text-center pr-10 pl-10"
                                >
                                    <option value="" disabled className="text-muted-foreground text-center">{loading ? "Memuat Data..." : "Silakan Pilih Kelas"}</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id} className="text-foreground font-bold text-center">Kelas {c.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-all duration-300">
                                    <ChevronDown size={20} className="group-focus-within:rotate-180 transition-transform opacity-30" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="text-center pt-12 flex justify-center">
                        <Link
                            href="/admin/login"
                            className="inline-flex items-center justify-center gap-3 py-4 px-10 rounded-2xl bg-white/50 backdrop-blur-md border-2 border-card-border/50 text-[11px] font-black text-muted-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-white transition-all uppercase tracking-[0.3em] shadow-lg shadow-slate-200/20 active:scale-95 group"
                        >
                            <UserCog size={18} className="group-hover:scale-110 transition-transform opacity-50 group-hover:opacity-100" />
                            Administrator
                        </Link>
                    </div>
                </div>
            </div>

            <footer className="w-full py-12 text-[11px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] text-center shrink-0">
                &copy; 2025 SMP NEGERI 32 SURABAYA &bull; Membangun Generasi Sehat
            </footer>
        </div>
    );
}
