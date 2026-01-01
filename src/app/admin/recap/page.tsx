"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getMonthlyRecap } from "@/lib/actions";
import { Download, Calendar, FileDown, Search, Info, ChevronDown, ChevronUp, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminHeader from "@/components/AdminHeader";

export default function RecapPage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [recap, setRecap] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

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
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rekap Bulanan");
        XLSX.writeFile(wb, `Rekap_SSB_${selectedMonth}_${selectedYear}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF("landscape");
        const monthName = new Date(0, selectedMonth - 1).toLocaleString('id-ID', { month: 'long' });
        doc.text(`Rekap SSB - ${monthName} ${selectedYear} `, 14, 15);
        autoTable(doc, {
            head: [["Nama Siswa", "Kls", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())]],
            body: recap.map(row => [row.studentName, row.className, ...Array.from({ length: 31 }, (_, i) => {
                const log = row.logs[i + 1];
                return log ? (log.lengkap ? "L" : log.kurang ? "K" : "T") : "-";
            })]),
            startY: 25,
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [79, 70, 229] }
        });
        doc.save(`Rekap_SSB_${selectedMonth}_${selectedYear}.pdf`);
    };

    const monthName = new Date(0, selectedMonth - 1).toLocaleString('id-ID', { month: 'long' });

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminHeader />
            <main className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-fade-in">

                {/* Hero Header Section */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-100 shadow-sm">
                        <FileText size={14} className="animate-pulse" /> Monthly Report Center
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight italic">
                        Pusat <span className="gradient-text">Laporan Bulanan</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg italic">Pilih periode dan unduh laporan resmi Sekolah untuk pengarsipan bulanan.</p>
                </div>

                {/* Selection Section - Clean & Focused */}
                <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-100/50 transition-colors duration-700"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        {/* Period Picker */}
                        <div className="flex-1 space-y-6 w-full">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 text-center md:text-left">Pilih Periode Laporan</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all focus-within:ring-4 focus-within:ring-indigo-50 group/select">
                                    <Calendar className="text-indigo-500 group-hover/select:scale-110 transition-transform" size={24} />
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="bg-transparent border-none focus:outline-none font-bold text-lg cursor-pointer w-full text-slate-800"
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full sm:w-32 flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="bg-transparent border-none focus:outline-none font-bold text-lg cursor-pointer w-full text-slate-800 text-center"
                                    >
                                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex shrink-0 items-center gap-6 p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100/80 mb-1">Status Laporan</p>
                                <p className="text-xl font-black italic">Siap Diunduh</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Cards - Two Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Excel Card */}
                    <button
                        onClick={exportToExcel}
                        className="group relative p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200/40 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                                <FileSpreadsheet size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">Export ke Excel</h3>
                                <p className="text-slate-500 font-medium mt-2 italic text-sm">Download data lengkap untuk pengelolaan spreadsheet.</p>
                            </div>
                        </div>
                    </button>

                    {/* PDF Card */}
                    <button
                        onClick={exportToPDF}
                        className="group relative p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/40 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                <FileDown size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">Export ke PDF</h3>
                                <p className="text-slate-500 font-medium mt-2 italic text-sm">Download laporan formal yang siap dicetak untuk arsip.</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Collapsible Preview Section */}
                <div className="space-y-6">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="mx-auto flex items-center gap-3 px-8 py-4 rounded-full bg-slate-200/50 text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-black text-xs uppercase tracking-[0.2em] transition-all"
                    >
                        {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {showPreview ? "Sembunyikan Detail Data" : "Pratinjau Detail Data"}
                    </button>

                    {showPreview && (
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up relative">
                            {loading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-indigo-600 border-t-transparent"></div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-5 pl-8 font-black text-[11px] text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-20 w-[250px]">
                                                Siswa
                                            </th>
                                            {[...Array(31)].map((_, i) => (
                                                <th key={i} className="p-3 text-center font-black text-[10px] text-slate-300 min-w-[35px]">
                                                    {i + 1}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 italic">
                                        {recap.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="p-5 pl-8 sticky left-0 bg-white z-10 border-r border-slate-50 shadow-[4px_0_10px_rgba(0,0,0,0.01)]">
                                                    <div className="font-extrabold text-[13px] text-slate-800 uppercase tracking-tight">{row.studentName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400">Kelas {row.className}</div>
                                                </td>
                                                {[...Array(31)].map((_, i) => {
                                                    const log = row.logs[i + 1];
                                                    return (
                                                        <td key={i} className="p-2 text-center">
                                                            <div className={`w - 2 h - 2 rounded - full mx - auto ${!log ? "bg-slate-100" :
                                                                    log.lengkap ? "bg-emerald-500" :
                                                                        log.kurang ? "bg-amber-500" : "bg-rose-500"
                                                                } `}></div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Disclaimer */}
                <div className="text-center pb-20">
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em] flex items-center justify-center gap-2">
                        <Info size={12} /> Data sinkron secara real-time dari database pusat
                    </p>
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
