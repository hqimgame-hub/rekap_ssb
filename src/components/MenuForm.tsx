"use client";

import { useState, useEffect } from "react";
import { saveDailyLogs } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft, Save, Sun, Moon, User, UserCheck, Utensils } from "lucide-react";

interface Student {
    id: string;
    name: string;
}

interface MenuFormProps {
    students: Student[];
    classId: string;
    className: string;
    homeroomTeacher?: string | null;
}

export default function MenuForm({ students, classId, className, homeroomTeacher }: MenuFormProps) {
    const router = useRouter();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [logs, setLogs] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        students.forEach(s => {
            initial[s.id] = { nasi: false, lauk: false, sayur: false, buah: false, minum: false };
        });
        return initial;
    });

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleToggle = (studentId: string, field: string) => {
        setLogs(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: !prev[studentId][field]
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const dataToSave = Object.entries(logs).map(([studentId, menuItems]) => ({
            studentId,
            date,
            ...menuItems
        }));

        const result = await saveDailyLogs(classId, dataToSave);
        setLoading(false);

        if (result.success) {
            router.push("/");
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col transition-colors duration-300">
            {/* Standardized Navigation Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b-2 border-card-border/60 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between h-20 sm:h-24">
                    <button
                        onClick={() => router.push("/")}
                        className="p-3 rounded-2xl text-muted-foreground hover:text-primary transition-all active:scale-90"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">
                            <span className="gradient-text">Menu Harian</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.4em] mt-1.5">SMPN 32 Surabaya</p>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-2xl text-muted-foreground hover:text-foreground transition-all active:scale-95 border-2 border-transparent hover:border-card-border"
                    >
                        {isDark ? <Sun size={22} className="text-yellow-500" /> : <Moon size={22} className="text-indigo-600" />}
                    </button>
                </div>
            </header>

            <main className="flex-grow p-4 sm:p-10 pb-40 max-w-6xl mx-auto w-full animate-fade-in space-y-10">
                {/* Horizontal Info Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Class Info */}
                    <div className="card-refined bg-white dark:bg-slate-900 flex items-center gap-5 p-5">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                            <Utensils size={30} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase truncate">Kelas {className}</h2>
                            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest truncate">Wali: <span className="text-foreground">{homeroomTeacher || "Umum"}</span></p>
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="card-refined bg-white dark:bg-slate-900 flex items-center gap-5 p-5">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Calendar size={30} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-0.5">Tanggal Input</p>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent border-none p-0 text-lg font-black focus:ring-0 outline-none block text-foreground uppercase cursor-pointer w-full"
                            />
                        </div>
                    </div>

                    {/* Stats Legend (Desktop Only) */}
                    <div className="card-refined bg-slate-100 dark:bg-slate-800/50 flex items-center gap-5 p-5 border-none lg:flex hidden">
                        <div className="w-12 h-12 rounded-xl bg-white/50 dark:bg-slate-700 flex items-center justify-center text-muted-foreground shrink-0">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-foreground leading-none">{students.length} Siswa</p>
                            <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mt-1">Total Absensi</p>
                        </div>
                    </div>
                </div>

                {/* HEADER AREA - Relocated to the "Red Box" zone above the list */}
                <div className="sticky top-[80px] sm:top-[96px] z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between px-6 mb-4 rounded-2xl border-2 border-card-border/40 h-16 sm:h-20 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all">
                    <div className="flex items-center gap-4 flex-1 h-full">
                        <span className="text-xs font-black uppercase tracking-widest text-secondary/50 w-10 text-center">No</span>
                        <span className="text-xs font-black uppercase tracking-widest text-secondary">Identitas Siswa</span>
                    </div>
                    <div className="flex h-full border-l-2 border-card-border/60 ml-6">
                        {[
                            { label: 'Nasi', color: 'text-blue-600' },
                            { label: 'Lauk', color: 'text-amber-500' },
                            { label: 'Sayur', color: 'text-green-600' },
                            { label: 'Buah', color: 'text-rose-500' },
                            { label: 'Minum', color: 'text-sky-500' }
                        ].map((item, i) => (
                            <div key={item.label} className="w-[60px] sm:w-24 text-center border-r border-card-border/20 last:border-r-0 flex items-center justify-center">
                                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${item.color}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Unified Student List Container */}
                <div className="border-2 border-card-border/40 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none mb-20 relative">
                    {/* Student List - SEQUENTIAL ROWS */}
                    <div className="divide-y divide-card-border/30">
                        {students.map((student, index) => (
                            <div key={student.id} className="flex items-stretch justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                {/* Identity Zone */}
                                <div className="flex items-center gap-4 px-6 py-4 flex-1">
                                    <div className="w-10 text-center font-black text-sm text-secondary/40 group-hover:text-primary transition-all">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base tracking-tight uppercase text-foreground/80 group-hover:text-primary transition-colors">
                                        {student.name}
                                    </h3>
                                </div>

                                {/* Menu Zone (Aligned to Header Columns above) */}
                                <div className="flex justify-end items-stretch border-l-2 border-card-border/60">
                                    {[
                                        { key: 'nasi', color: 'bg-blue-500', track: 'bg-blue-500/[0.04] dark:bg-blue-400/[0.03]' },
                                        { key: 'lauk', color: 'bg-amber-400', track: 'bg-amber-500/[0.04] dark:bg-amber-400/[0.03]' },
                                        { key: 'sayur', color: 'bg-green-500', track: 'bg-green-500/[0.04] dark:bg-green-400/[0.03]' },
                                        { key: 'buah', color: 'bg-rose-500', track: 'bg-rose-500/[0.04] dark:bg-rose-400/[0.03]' },
                                        { key: 'minum', color: 'bg-sky-500', track: 'bg-sky-500/[0.04] dark:bg-sky-400/[0.03]' }
                                    ].map((item) => (
                                        <div key={item.key} className={`w-[60px] sm:w-24 flex items-center justify-center border-r border-card-border/20 last:border-r-0 py-3 sm:py-5 ${item.track} transition-colors group-hover:bg-opacity-100`}>
                                            <button
                                                onClick={() => handleToggle(student.id, item.key)}
                                                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl border-2 transition-all active:scale-90 flex items-center justify-center ${logs[student.id][item.key]
                                                    ? `${item.color} border-transparent text-white shadow-lg scale-[1.05]`
                                                    : "bg-white dark:bg-slate-900 border-card-border/40 text-muted-foreground/20 hover:border-slate-300"
                                                    }`}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${logs[student.id][item.key] ? "bg-white" : "bg-slate-200 dark:bg-slate-700"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Compact Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background/80 to-transparent z-50">
                <div className="max-w-6xl mx-auto flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:max-w-xs h-16 bg-primary text-white rounded-[1.5rem] shadow-2xl shadow-primary/30 font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-primary-hover hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Simpan Laporan</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
