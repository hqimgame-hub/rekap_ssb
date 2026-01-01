"use client";

import React, { useState, useMemo } from "react";
import { FileBarChart, Filter, ChevronDown, Users, Calendar } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface NutritionLog {
    nasi: boolean;
    lauk: boolean;
    sayur: boolean;
    buah: boolean;
    minum: boolean;
    student: {
        classId: string;
    };
}

interface ClassData {
    id: string;
    name: string;
    _count: {
        students: number;
    };
}

interface AdvancedNutritionMonitorProps {
    logsToday: NutritionLog[];
    totalStudents: number;
    classes: ClassData[];
    currentDate: string;
}

export default function AdvancedNutritionMonitor({ logsToday, totalStudents, classes, currentDate }: AdvancedNutritionMonitorProps) {
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleDateChange = (newDate: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', newDate);
        router.push(`${pathname}?${params.toString()}`);
    };

    // Logic for Global Data (Total)
    const globalStats = useMemo(() => {
        const categories = [
            { label: "Nasi", key: "nasi", color: "bg-blue-500" },
            { label: "Lauk", key: "lauk", color: "bg-indigo-500" },
            { label: "Sayur", key: "sayur", color: "bg-emerald-500" },
            { label: "Buah", key: "buah", color: "bg-amber-500" },
            { label: "Minum", key: "minum", color: "bg-cyan-500" },
        ];

        return categories.map(cat => ({
            ...cat,
            count: logsToday.filter(log => (log as any)[cat.key]).length,
            percentage: totalStudents > 0 ? Math.round((logsToday.filter(log => (log as any)[cat.key]).length / totalStudents) * 100) : 0
        }));
    }, [logsToday, totalStudents]);

    // Logic for Filtered Data (Per-Kelas)
    const filteredStats = useMemo(() => {
        if (selectedClassId === "all") return null;

        const classLogs = logsToday.filter(log => log.student.classId === selectedClassId);
        const selectedClass = classes.find(c => c.id === selectedClassId);
        const classStudentCount = selectedClass?._count.students || 1;

        const categories = [
            { label: "Nasi", key: "nasi", color: "bg-blue-400" },
            { label: "Lauk", key: "lauk", color: "bg-indigo-400" },
            { label: "Sayur", key: "sayur", color: "bg-emerald-400" },
            { label: "Buah", key: "buah", color: "bg-amber-400" },
            { label: "Minum", key: "minum", color: "bg-cyan-400" },
        ];

        return {
            className: selectedClass?.name || "Kelas",
            studentCount: classStudentCount,
            inputCount: classLogs.length,
            data: categories.map(cat => ({
                ...cat,
                count: classLogs.filter(log => (log as any)[cat.key]).length,
                percentage: Math.round((classLogs.filter(log => (log as any)[cat.key]).length / classStudentCount) * 100)
            }))
        };
    }, [selectedClassId, logsToday, classes]);

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 md:p-14 shadow-2xl shadow-slate-200/50">
            <div className="relative z-10 space-y-12">
                {/* Header Full Width */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
                    <div className="space-y-4">
                        <div className="inline-flex p-3 rounded-xl bg-primary/5 border border-primary/10 text-primary">
                            <FileBarChart size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900">Pantauan Nutrisi</h3>
                            <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                                Monitor kelengkapan menu pada tanggal <span className="text-primary font-bold">{new Date(currentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                            </p>
                        </div>
                    </div>

                    {/* Filters: Date & Class */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Date Picker */}
                        <div className="relative group/select w-full sm:w-auto min-w-[200px]">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Pilih Tanggal</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={currentDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 pl-12 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm"
                                />
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-primary transition-colors" size={18} />
                            </div>
                        </div>

                        {/* Class Filter Dropdown */}
                        <div className="relative group/select w-full sm:w-auto min-w-[240px]">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Filter Analisis Kelas</label>
                            <div className="relative">
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 pr-12 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-sm"
                                >
                                    <option value="all">Pilih Kelas untuk Detail...</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-primary transition-colors" size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dual Track Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Track 1: Global Summary */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-900 tracking-tight">Ringkasan Total Sekolah</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Akumulasi Seluruh Siswa</p>
                            </div>
                            <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tighter">Global</div>
                        </div>

                        <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 space-y-6 shadow-inner">
                            {globalStats.map((item) => (
                                <div key={item.label} className="space-y-2 group/bar">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/bar:text-slate-900 transition-colors">{item.label}</span>
                                        <span className="text-xs font-black text-slate-900">{item.percentage}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Total Target: {totalStudents} Siswa</span>
                                <span className="text-primary">Terisi: {logsToday.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Track 2: Filtered Class Analytics */}
                    <div className="space-y-8">
                        {filteredStats ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Analisis {filteredStats.className}</h4>
                                        <p className="text-xs text-secondary font-bold uppercase tracking-widest">Detail Performa Kelas</p>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/10 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-tighter shadow-sm border border-emerald-500/10">Filtered</div>
                                </div>

                                <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6 shadow-xl shadow-slate-200/30 ring-1 ring-slate-100">
                                    {filteredStats.data.map((item) => (
                                        <div key={item.label} className="space-y-2 group/bar">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/bar:text-slate-900 transition-colors">{item.label}</span>
                                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{item.percentage}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.1)]`}
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Target Kelas: {filteredStats.studentCount}</span>
                                        <span className="text-emerald-500">Terisi: {filteredStats.inputCount}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center space-y-4 p-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                                <div className="p-5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-300">
                                    <Filter size={32} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-500 italic">Pilih kelas pada dropdown di atas</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Untuk analisis mendalam per-kelas</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subtle aesthetic element */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-50" />
            <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[40%] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none opacity-50" />
        </div>
    );
}
