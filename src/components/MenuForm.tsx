"use client";

import { useState, useEffect } from "react";
import { saveDailyLogs } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft, Save, User, Utensils, CheckCircle2, Download, FileDown, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
    id: string;
    name: string;
}

interface MenuFormProps {
    students: Student[];
    classId: string;
    className: string;
    homeroomTeacher?: string | null;
    uploadUrl?: string;
}

export default function MenuForm({ students, classId, className, homeroomTeacher, uploadUrl }: MenuFormProps) {
    const router = useRouter();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [showNotif, setShowNotif] = useState<{ show: boolean, message: string } | null>(null);

    useEffect(() => {
        if (showNotif) {
            const timer = setTimeout(() => setShowNotif(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [showNotif]);
    const [logs, setLogs] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        students.forEach(s => {
            initial[s.id] = { nasi: false, lauk: false, sayur: false, buah: false, minum: false, keterangan: "" };
        });
        return initial;
    });

    const handleKeteranganChange = (studentId: string, value: string) => {
        setLogs(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                keterangan: value,
                // If "Tidak Masuk", reset all checkboxes
                ...(value === "Tidak Masuk" ? { nasi: false, lauk: false, sayur: false, buah: false, minum: false } : {})
            }
        }));
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
            setShowNotif({ show: true, message: "Laporan harian berhasil disimpan!" });
        } else {
            alert(result.error);
        }
    };

    const exportToExcel = () => {
        // Prepare Metadata Header
        const headerData = [
            ["LAPORAN MENU HARIAN"],
            ["Sekolah", "SMPN 32 Surabaya"],
            ["Kelas", className],
            ["Wali Kelas", homeroomTeacher || "Umum"],
            ["Tanggal", date],
            [], // Empty row for spacing
        ];

        // Prepare Table Data
        const tableData = students.map((student, index) => ({
            "No": index + 1,
            "Nama Siswa": student.name,
            "Nasi": logs[student.id].nasi ? "V" : "-",
            "Lauk": logs[student.id].lauk ? "V" : "-",
            "Sayur": logs[student.id].sayur ? "V" : "-",
            "Buah": logs[student.id].buah ? "V" : "-",
            "Minum": logs[student.id].minum ? "V" : "-",
            "Keterangan": logs[student.id].keterangan || "Hadir",
        }));

        // Create Worksheet
        const ws = XLSX.utils.aoa_to_sheet(headerData);

        // Add table data after header
        XLSX.utils.sheet_add_json(ws, tableData, { origin: "A7" });

        // Create Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Menu Harian");

        // Finalize and Download
        XLSX.writeFile(wb, `Menu_Harian_${className}_${date}.xlsx`);
        setShowNotif({ show: true, message: "File Excel berhasil diunduh!" });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Laporan Menu Harian - Kelas ${className}`, 14, 20);
        doc.setFontSize(11);
        doc.text(`Tanggal: ${date}`, 14, 30);
        doc.text(`Wali Kelas: ${homeroomTeacher || "Umum"}`, 14, 37);

        const tableData = students.map((student, index) => [
            index + 1,
            student.name,
            logs[student.id].nasi ? "V" : "-",
            logs[student.id].lauk ? "V" : "-",
            logs[student.id].sayur ? "V" : "-",
            logs[student.id].buah ? "V" : "-",
            logs[student.id].minum ? "V" : "-",
            logs[student.id].keterangan || "Hadir",
        ]);

        autoTable(doc, {
            head: [["No", "Nama Siswa", "Nasi", "Lauk", "Sayur", "Buah", "Minum", "Keterangan"]],
            body: tableData,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }, // Indigo primary
        });

        doc.save(`Menu_Harian_${className}_${date}.pdf`);
        setShowNotif({ show: true, message: "File PDF berhasil diunduh!" });
    };

    const menuItems = [
        { key: 'nasi', label: 'Nasi', color: 'bg-gradient-to-br from-blue-500 to-blue-600', hoverColor: 'hover:from-blue-600 hover:to-blue-700', textColor: 'text-blue-600', bgLight: 'bg-blue-50' },
        { key: 'lauk', label: 'Lauk', color: 'bg-gradient-to-br from-amber-400 to-amber-500', hoverColor: 'hover:from-amber-500 hover:to-amber-600', textColor: 'text-amber-500', bgLight: 'bg-amber-50' },
        { key: 'sayur', label: 'Sayur', color: 'bg-gradient-to-br from-green-500 to-green-600', hoverColor: 'hover:from-green-600 hover:to-green-700', textColor: 'text-green-600', bgLight: 'bg-green-50' },
        { key: 'buah', label: 'Buah', color: 'bg-gradient-to-br from-rose-500 to-rose-600', hoverColor: 'hover:from-rose-600 hover:to-rose-700', textColor: 'text-rose-600', bgLight: 'bg-rose-50' },
        { key: 'minum', label: 'Minum', color: 'bg-gradient-to-br from-sky-500 to-sky-600', hoverColor: 'hover:from-sky-600 hover:to-sky-700', textColor: 'text-sky-600', bgLight: 'bg-sky-50' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Sticky Header & Info Section */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-indigo-100/50 shadow-lg shadow-indigo-100/20">
                {/* Standardized Navigation Header */}
                <header className="px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto flex items-center justify-between h-20 sm:h-24">
                        <button
                            onClick={() => router.push("/")}
                            className="p-3 rounded-2xl text-muted-foreground hover:text-primary hover:bg-purple-50/50 transition-all active:scale-90"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <div className="text-center">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">
                                <span className="gradient-text">Menu Harian</span>
                            </h1>
                            <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.4em] mt-1.5 leading-none">SMPN 32 Surabaya</p>
                        </div>

                        <div className="w-12"></div>
                    </div>
                </header>

                {/* Compact Info & Download Bar - Sticky */}
                <div className="max-w-6xl mx-auto px-4 sm:px-10 pb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Class Info - Compact */}
                        <div className="flex-1 bg-green-50/50 rounded-2xl p-4 flex items-center gap-4 border border-green-100/50">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20">
                                <Utensils size={20} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-black tracking-tight text-foreground uppercase truncate">Kelas {className}</h2>
                                <p className="text-[8px] font-black uppercase text-green-600/70 tracking-widest truncate">{homeroomTeacher || "Umum"}</p>
                            </div>
                        </div>

                        {/* Date Picker - Compact */}
                        <div className="flex-1 bg-purple-50/50 rounded-2xl p-4 flex items-center gap-4 border border-purple-100/50">
                            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                                <Calendar size={20} />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none block text-foreground uppercase cursor-pointer w-full leading-none"
                                />
                            </div>
                        </div>

                        {/* Action Bar - Hidden from Header as requested */}
                    </div>
                </div>
            </div>

            <main className="flex-grow p-4 sm:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8 relative z-10">
                {/* Responsive Card View - All Screen Sizes */}
                <div className="space-y-8 sm:space-y-12">
                    {students.map((student, index) => (
                        <div key={student.id} className="bg-white border-2 border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 p-6 sm:p-10 space-y-8 hover:border-indigo-100 transition-all duration-500 group">
                            {/* Student Header - Minimal & Balanced */}
                            <div className="flex items-center gap-5">
                                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                    <span className="text-2xl sm:text-3xl font-black text-slate-800 select-none">
                                        {index + 1}
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-xl sm:text-2xl tracking-tighter uppercase text-slate-800 flex-1">
                                    {student.name}
                                </h3>

                                <div className="relative group/select">
                                    <select
                                        value={logs[student.id].keterangan || ""}
                                        onChange={(e) => handleKeteranganChange(student.id, e.target.value)}
                                        className={`h-12 px-5 rounded-xl border-2 text-xs font-black uppercase tracking-wider outline-none transition-all cursor-pointer appearance-none pr-11
                                            ${logs[student.id].keterangan === "Tidak Masuk"
                                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                                : logs[student.id].keterangan === "Tidak Membawa"
                                                    ? "bg-amber-50 border-amber-200 text-amber-600"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 focus:border-indigo-300"
                                            }`}
                                    >
                                        <option value="">Hadir</option>
                                        <option value="Tidak Masuk">Tidak Masuk</option>
                                        <option value="Tidak Membawa">Tidak Membawa</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                        <svg width="8" height="6" viewBox="0 0 8 6" fill="currentColor">
                                            <path d="M0 0L4 6L8 0H0Z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Checkboxes Grid - Improved Spacing */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.key}
                                        disabled={logs[student.id].keterangan === "Tidak Masuk"}
                                        onClick={() => handleToggle(student.id, item.key)}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed ${logs[student.id][item.key]
                                            ? `${item.color} ${item.hoverColor} border-transparent text-white shadow-lg shadow-${item.key}-500/30`
                                            : `${item.bgLight} border-${item.key}-200/50 ${item.textColor} hover:border-${item.key}-300 hover:shadow-md`
                                            }`}
                                    >
                                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${logs[student.id][item.key]
                                            ? "bg-white/20 border-white scale-110"
                                            : `bg-white border-${item.key}-300`
                                            }`}>
                                            {logs[student.id][item.key] && (
                                                <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Compact Action Section - Bottom of List */}
                <div className="pt-6 pb-24 flex flex-col items-center gap-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:max-w-md h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-2xl shadow-purple-500/20 font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Simpan Laporan Harian</span>
                            </>
                        )}
                    </button>

                    {/* Secondary Action Buttons - Restructured Below Submit */}
                    <div className="flex items-center gap-4 w-full sm:max-w-md">
                        <button
                            onClick={exportToExcel}
                            className="flex-1 h-14 rounded-2xl bg-emerald-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            <Download size={18} /> EXCEL
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="flex-1 h-14 rounded-2xl bg-slate-800 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2.5 active:scale-95 shadow-lg shadow-slate-900/20"
                        >
                            <FileDown size={18} /> PDF
                        </button>
                    </div>

                    {uploadUrl && (
                        <button
                            onClick={() => window.open(uploadUrl, '_blank')}
                            className="w-full sm:max-w-md h-14 rounded-2xl bg-indigo-50 text-indigo-600 border-2 border-indigo-100 font-black text-[11px] sm:text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-indigo-100/10"
                        >
                            <Upload size={18} /> Kirim Laporan
                        </button>
                    )}
                </div>
            </main>

            {/* Floating Notification */}
            {showNotif && (
                <div className="fixed top-44 sm:top-28 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{showNotif.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
