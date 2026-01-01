"use client";

import { useState, useMemo } from "react";
import { Search, Trash2, X, AlertTriangle, Users, School } from "lucide-react";
import { deleteAllStudents, deleteAllClasses } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface Student {
    id: string;
    name: string;
    class: { name: string };
}

interface Class {
    id: string;
    name: string;
    _count: { students: number };
}

interface ResetDataDialogProps {
    students: Student[];
    classes: Class[];
}

export default function ResetDataDialog({ students, classes }: ResetDataDialogProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"students" | "classes">("students");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const filteredStudents = useMemo(() => {
        return students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.class.name.toLowerCase().includes(search.toLowerCase()));
    }, [students, search]);

    const filteredClasses = useMemo(() => {
        return classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }, [classes, search]);

    const handleResetStudents = async () => {
        if (!confirm("PERINGATAN KRITIS: Anda akan menghapus SELURUH data siswa dan log konsumsi harian mereka. Tindakan ini tidak dapat dibatalkan. Lanjutkan?")) return;
        if (!confirm("KONFIRMASI TERAKHIR: Apakah Anda benar-benar yakin?")) return;

        setIsLoading(true);
        const res = await deleteAllStudents();
        setIsLoading(false);

        if (res.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    const handleResetClasses = async () => {
        if (!confirm("PERINGATAN KRITIS: Anda akan menghapus SELURUH data kelas, siswa, dan log konsumsi. Tindakan ini tidak dapat dibatalkan. Lanjutkan?")) return;
        if (!confirm("KONFIRMASI TERAKHIR: Apakah Anda benar-benar yakin?")) return;

        setIsLoading(true);
        const res = await deleteAllClasses();
        setIsLoading(false);

        if (res.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-100 transition-all border border-red-100 active:scale-95 shadow-lg shadow-red-500/5 group"
            >
                <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                Reset Database
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden border border-white/20 animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Reset Database</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Data Masal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Warning Banner */}
                <div className="mx-8 mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-4">
                    <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                    <p className="text-xs font-bold text-amber-900 leading-relaxed uppercase tracking-tight">
                        Tindakan ini akan menghapus data secara permanen dari database. Pastikan Anda telah melakukan backup jika diperlukan.
                    </p>
                </div>

                {/* Tabs & Search */}
                <div className="p-8 pb-4 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveTab("students")}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "students" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <Users size={14} />
                                Siswa ({students.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("classes")}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "classes" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                <School size={14} />
                                Kelas ({classes.length})
                            </button>
                        </div>
                        <div className="relative group flex-grow max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder={`Cari ${activeTab === "students" ? "nama siswa..." : "nama kelas..."}`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-grow overflow-y-auto px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeTab === "students" ? (
                            filteredStudents.map(s => (
                                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 hover:border-primary/20 transition-colors">
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{s.name}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.class.name}</span>
                                </div>
                            ))
                        ) : (
                            filteredClasses.map(c => (
                                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-primary/20 transition-colors">
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">KELAS {c.name}</span>
                                    <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg uppercase tracking-widest">{c._count.students} SISWA</span>
                                </div>
                            ))
                        )}
                        {((activeTab === "students" && filteredStudents.length === 0) || (activeTab === "classes" && filteredClasses.length === 0)) && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 opacity-30">
                                <Search size={48} />
                                <p className="text-xs font-black uppercase tracking-widest">Data tidak ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center sm:text-left">
                        Total {activeTab === "students" ? `${students.length} Siswa` : `${classes.length} Kelas`} Terdeteksi
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-grow sm:flex-grow-0 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={activeTab === "students" ? handleResetStudents : handleResetClasses}
                            className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl disabled:opacity-50 ${isLoading ? 'bg-slate-400' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20 active:scale-95'}`}
                        >
                            {isLoading ? 'Memproses...' : (activeTab === "students" ? 'Hapus Semua Siswa' : 'Hapus Semua Kelas')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
