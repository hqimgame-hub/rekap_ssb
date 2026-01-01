"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getMonthlyRecap } from "@/lib/actions";
import { Download, Calendar, FileDown, Search, Info } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminHeader from "@/components/AdminHeader";

export default function RecapPage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [recap, setRecap] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRecap();
    }, [selectedMonth, selectedYear]);

    const fetchRecap = async () => {
        setLoading(true);
        const data = await getMonthlyRecap(selectedMonth, selectedYear);
        setRecap(data);
        setLoading(false);
    };

    const exportToExcel = () => {
        const wsData = recap.map(row => {
            const rowData: any = { "Nama Siswa": row.studentName, "Kelas": row.className };
            for (let i = 1; i <= 31; i++) {
                const log = row.logs[i];
                if (!log) rowData[i] = "-";
                else if (log.lengkap) rowData[i] = "Lengkap";
                else if (log.kurang) rowData[i] = "Kurang";
                else rowData[i] = "Tidak Membawa";
            }
            return rowData;
        });

        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(XLSX.utils.book_new(), ws, "Rekap Bulanan");
        XLSX.writeFile(XLSX.utils.book_new(), `Rekap_SSB_${selectedMonth}_${selectedYear}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF("landscape");
        const monthName = new Date(0, selectedMonth - 1).toLocaleString('id-ID', { month: 'long' });
        doc.text(`Rekap SSB - ${monthName} ${selectedYear}`, 14, 15);
        autoTable(doc, {
            head: [["Nama Siswa", "Kls", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())]],
            body: recap.map(row => [row.studentName, row.className, ...Array.from({ length: 31 }, (_, i) => {
                const log = row.logs[i + 1];
                return log ? (log.lengkap ? "L" : log.kurang ? "K" : "T") : "-";
            })]),
            startY: 25,
            styles: { fontSize: 7, cellPadding: 1 },
        });
        doc.save(`Rekap_SSB_${selectedMonth}_${selectedYear}.pdf`);
    };

    const monthName = new Date(0, selectedMonth - 1).toLocaleString('id-ID', { month: 'long' });

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminHeader />
            <main className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 pb-2">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                            <Info size={12} /> Data Reports
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none italic">
                                Rekap <span className="text-primary italic">Bulanan</span>
                            </h1>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] pt-1">Periode Laporan {monthName} {selectedYear}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-card-border shadow-sm">
                            <div className="flex items-center gap-3 pr-3 border-r border-card-border">
                                <Calendar size={14} className="text-primary" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="bg-transparent border-none focus:outline-none font-black text-[11px] uppercase cursor-pointer"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-transparent border-none focus:outline-none font-black text-[11px] uppercase cursor-pointer"
                            >
                                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={exportToExcel} className="h-12 px-6 rounded-[1.25rem] bg-white dark:bg-slate-900 border border-card-border text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm active:scale-95">
                                <Download size={14} /> EXCEL
                            </button>
                            <button onClick={exportToPDF} className="h-12 px-6 rounded-[1.25rem] bg-foreground text-background dark:bg-white dark:text-slate-950 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none active:scale-95">
                                <FileDown size={14} /> PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card-refined p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl shadow-slate-100 dark:shadow-none relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Synchronizing...</span>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent">
                        <table className="w-full text-left border-collapse min-w-[1280px]">
                            <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-card-border">
                                    <th className="p-4 pl-8 font-black text-[11px] text-muted-foreground uppercase tracking-[0.2em] sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 w-[280px]">
                                        Identitas Siswa
                                    </th>
                                    {[...Array(31)].map((_, i) => (
                                        <th key={i} className="p-3 text-center font-black text-[10px] text-muted-foreground/50 border-b border-card-border min-w-[40px]">
                                            {String(i + 1).padStart(2, '0')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border/50">
                                {recap.length === 0 ? (
                                    <tr><td colSpan={32} className="p-32 text-center text-muted-foreground italic font-medium">No record found for the selected period.</td></tr>
                                ) : (
                                    recap.map((row, idx) => (
                                        <tr key={idx} className="group hover:bg-primary/[0.02] transition-colors">
                                            <td className="p-4 pl-8 sticky left-0 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 z-10 border-r border-card-border/30 shadow-[4px_0_12px_rgba(0,0,0,0.02)] transition-colors">
                                                <div className="font-extrabold text-[13px] tracking-tight group-hover:text-primary transition-colors italic uppercase">{row.studentName}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">Kelas {row.className}</div>
                                            </td>
                                            {[...Array(31)].map((_, i) => {
                                                const log = row.logs[i + 1];
                                                return (
                                                    <td key={i} className="p-2.5 text-center">
                                                        <div
                                                            className={`w-2.5 h-2.5 rounded-full mx-auto transition-all duration-300 group-hover:scale-150 ${!log ? "bg-slate-100 dark:bg-slate-800" :
                                                                    log.lengkap ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" :
                                                                        log.kurang ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" :
                                                                            "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                                                                }`}
                                                        ></div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend / Info */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-slate-950 text-white selection:bg-white/10">
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <LegendItem color="bg-emerald-500" label="Lengkap" />
                        <LegendItem color="bg-amber-500" label="Kurang" />
                        <LegendItem color="bg-rose-500" label="Tidak Membawa" />
                        <LegendItem color="bg-slate-700" label="Tanpa Data" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] italic">System synchronization active &bull; v1.0</p>
                </div>
            </main>
        </div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color} shadow-lg shadow-current/20 animate-pulse`}></div>
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-widest">{label}</span>
        </div>
    );
}
