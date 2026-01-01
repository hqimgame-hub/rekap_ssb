"use client";

import { useState, useEffect } from "react";
import { saveDailyLogs } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft, Save, User, Utensils, CheckCircle2, Download, FileDown } from "lucide-react";
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
}

export default function MenuForm({ students, classId, className, homeroomTeacher }: MenuFormProps) {
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
            initial[s.id] = { nasi: false, lauk: false, sayur: false, buah: false, minum: false };
        });
        return initial;
    });

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
        const wsData = students.map((student, index) => ({
            "No": index + 1,
            "Nama Siswa": student.name,
            "Nasi": logs[student.id].nasi ? "V" : "-",
            "Lauk": logs[student.id].lauk ? "V" : "-",
            "Sayur": logs[student.id].sayur ? "V" : "-",
            "Buah": logs[student.id].buah ? "V" : "-",
            "Minum": logs[student.id].minum ? "V" : "-",
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Menu Harian");
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
        ]);

        autoTable(doc, {
            head: [["No", "Nama Siswa", "Nasi", "Lauk", "Sayur", "Buah", "Minum"]],
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

            {/* Standardized Navigation Header - Static & Colorful */}
            <header className="relative z-50 bg-gradient-to-r from-indigo-50/50 via-white/80 to-purple-50/50 backdrop-blur-2xl border-b border-purple-100/20 shadow-sm px-4 sm:px-6">
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
                        <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.4em] mt-1.5">SMPN 32 Surabaya</p>
                    </div>

                    <div className="w-12"></div>
                </div>
            </header>

            <main className="flex-grow p-4 sm:p-10 pb-40 max-w-6xl mx-auto w-full animate-fade-in space-y-8 relative z-10">
                {/* Horizontal Info Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Class Info */}
                    <div className="bg-gradient-to-br from-white to-green-50/20 backdrop-blur-sm border border-green-100/30 rounded-3xl shadow-xl shadow-green-100/30 flex items-center gap-6 p-6 sm:p-7 hover:shadow-2xl transition-all duration-500">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20">
                            <Utensils size={36} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground uppercase truncate">Kelas {className}</h2>
                            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest truncate">Wali: <span className="text-green-600">{homeroomTeacher || "Umum"}</span></p>
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="bg-gradient-to-br from-white to-purple-50/20 backdrop-blur-sm border border-purple-100/30 rounded-3xl shadow-xl shadow-purple-100/30 flex items-center gap-6 p-6 sm:p-7 hover:shadow-2xl transition-all duration-500">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                            <Calendar size={36} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase text-muted-foreground/40 tracking-[0.3em] mb-1">Tanggal Input</p>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent border-none p-0 text-lg font-black focus:ring-0 outline-none block text-foreground uppercase cursor-pointer w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Download Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Ekspor Laporan</span>
                        <span className="text-xs font-bold text-slate-800">Unduh data yang sedang tampil</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToExcel}
                            className="h-12 px-6 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                        >
                            <Download size={14} /> EXCEL
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
                        >
                            <FileDown size={14} /> PDF
                        </button>
                    </div>
                </div>

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
                            </div>

                            {/* Menu Checkboxes Grid - Improved Spacing */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => handleToggle(student.id, item.key)}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 sm:p-5 rounded-xl border-2 transition-all active:scale-95 ${logs[student.id][item.key]
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
            </main>

            {/* Compact Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent z-50">
                <div className="max-w-6xl mx-auto flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:max-w-xs h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-[1.5rem] shadow-2xl shadow-purple-500/30 font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
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

            {/* Floating Notification */}
            {showNotif && (
                <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
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
