"use client";

import { useState, useRef } from "react";
import { School, Users, Trash2, Pencil, CheckSquare, X, Save, AlertCircle, Download, Upload } from "lucide-react";
import { deleteClass, bulkDeleteClasses, updateClass, importClasses } from "@/lib/actions";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';

interface ClassData {
    id: string;
    name: string;
    homeroomTeacher: string | null;
    _count: {
        students: number;
    };
}

export default function ClassesTable({ classes }: { classes: ClassData[] }) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", homeroomTeacher: "" });
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.length === classes.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(classes.map(c => c.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    // Bulk Delete Logic
    const handleBulkDelete = async () => {
        if (!confirm(`Yakin ingin menghapus ${selectedIds.length} kelas terpilih?`)) return;

        setIsLoading(true);
        const res = await bulkDeleteClasses(selectedIds);
        setIsLoading(false);

        if (res.success) {
            setSelectedIds([]);
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    // Edit Logic
    const startEdit = (cls: ClassData) => {
        setEditingId(cls.id);
        setEditForm({ name: cls.name, homeroomTeacher: cls.homeroomTeacher || "" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: "", homeroomTeacher: "" });
    };

    const saveEdit = async () => {
        if (!editingId) return;

        setIsLoading(true);
        const res = await updateClass(editingId, editForm.name, editForm.homeroomTeacher);
        setIsLoading(false);

        if (res.success) {
            setEditingId(null);
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    // Single Delete Logic
    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus kelas ini?")) return;

        setIsLoading(true);
        const res = await deleteClass(id);
        setIsLoading(false);

        if (res.success) {
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    // Excel Logic
    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { "Nama Kelas": "7A", "Wali Kelas": "Budi Santoso, S.Pd" },
            { "Nama Kelas": "7B", "Wali Kelas": "Siti Aminah, M.Pd" },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_Kelas");
        XLSX.writeFile(wb, "Template_Import_Kelas_SSB.xlsx");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws) as any[];

            // Validate and map data
            const formattedData = data.map(row => ({
                name: row["Nama Kelas"] || row["name"] || row["Kelas"],
                homeroomTeacher: row["Wali Kelas"] || row["Wali"] || row["homeroomTeacher"]
            })).filter(row => row.name);

            if (formattedData.length === 0) {
                alert("Format file tidak valid atau kosong. Pastikan ada kolom 'Nama Kelas'.");
                return;
            }

            if (!confirm(`Ditemukan ${formattedData.length} kelas. Lanjutkan import?`)) return;

            setIsLoading(true);
            const res = await importClasses(formattedData);
            setIsLoading(false);

            if (res.success) {
                alert(`Berhasil mengimport ${res.count} kelas.`);
                router.refresh();
            } else {
                alert(res.error);
            }

            // Reset
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all">
            {/* Table Header / Toolbar */}
            <div className="p-6 border-b border-card-border bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 min-h-[80px]">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <School size={14} />
                        Daftar Kelas Aktif
                    </h3>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                                {selectedIds.length} Terpilih
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isLoading}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Trash2 size={12} /> Hapus Masal
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 transition-all"
                        title="Download Template Excel"
                    >
                        <Download size={14} /> Template
                    </button>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wider hover:bg-blue-100 transition-all"
                            title="Upload Data Kelas"
                        >
                            <Upload size={14} /> Import
                        </button>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-card-border text-[10px] font-black text-primary uppercase tracking-wider md:mr-12">
                        {classes.length} KELAS
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-card-border/50 bg-slate-50/30">
                            <th className="p-5 pl-6 w-10">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={classes.length > 0 && selectedIds.length === classes.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                    />
                                </div>
                            </th>
                            <th className="p-5 font-extrabold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Identitas Kelas</th>
                            <th className="p-5 font-extrabold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Wali Kelas</th>
                            <th className="p-5 font-extrabold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Statistik</th>
                            <th className="p-5 pr-8 font-extrabold text-[10px] text-muted-foreground uppercase tracking-[0.2em] text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border/50">
                        {classes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-50">
                                        <School size={48} strokeWidth={1} />
                                        <p className="text-sm font-bold text-muted-foreground">Belum ada data kelas.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            classes.map((c, index) => (
                                <tr key={c.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${selectedIds.includes(c.id) ? "bg-primary/5" : ""}`}>
                                    <td className="p-5 pl-6">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(c.id)}
                                                onChange={() => toggleSelect(c.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {editingId === c.id ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-24 px-2 py-1 rounded-md border border-primary text-sm font-bold outline-none"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all font-black text-sm">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <span className="font-black text-base tracking-tight text-foreground block">Kelas {c.name}</span>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        {editingId === c.id ? (
                                            <input
                                                type="text"
                                                value={editForm.homeroomTeacher}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, homeroomTeacher: e.target.value }))}
                                                placeholder="Nama Wali Kelas"
                                                className="w-full px-2 py-1 rounded-md border border-primary text-sm font-bold outline-none"
                                            />
                                        ) : (
                                            c.homeroomTeacher ? (
                                                <span className="text-sm font-bold text-foreground">{c.homeroomTeacher}</span>
                                            ) : (
                                                <span className="text-xs font-bold text-muted-foreground/50 italic">Belum diatur</span>
                                            )
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Users size={14} />
                                            <span className="text-[10px] font-bold tracking-tight uppercase">{c._count.students} Siswa</span>
                                        </div>
                                    </td>
                                    <td className="p-5 pr-8">
                                        <div className="flex justify-center items-center gap-2">
                                            {editingId === c.id ? (
                                                <>
                                                    <button
                                                        onClick={saveEdit}
                                                        disabled={isLoading}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
                                                        title="Simpan"
                                                    >
                                                        <Save size={14} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                        title="Batal"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEdit(c)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                        title="Edit Kelas"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        disabled={isLoading}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                                        title="Hapus Kelas"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
