"use client";

import { useState, useMemo, useRef } from "react";
import { Search, Filter, Trash2, Download, Upload, Pencil, Save, X, ChevronLeft, ChevronRight, User } from "lucide-react";
import { deleteStudent, bulkDeleteStudents, updateStudent, importStudents } from "@/lib/actions";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';

interface StudentData {
    id: string;
    name: string;
    classId: string;
    class: {
        id: string;
        name: string;
    };
}

interface ClassData {
    id: string;
    name: string;
}

export default function StudentsTable({ students, classes }: { students: StudentData[], classes: ClassData[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [filterClass, setFilterClass] = useState("");
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showAll, setShowAll] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", classId: "" });
    const [isLoading, setIsLoading] = useState(false);

    // Import State
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter Logic
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase());
            const matchesClass = filterClass ? student.classId === filterClass : true;
            return matchesSearch && matchesClass;
        });
    }, [students, search, filterClass]);

    // Pagination Logic
    const totalPages = showAll ? 1 : Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = showAll ? filteredStudents : filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedStudents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedStudents.map(s => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    // Bulk Delete
    const handleBulkDelete = async () => {
        if (!confirm(`Yakin ingin menghapus ${selectedIds.length} siswa terpilih?`)) return;
        setIsLoading(true);
        const res = await bulkDeleteStudents(selectedIds);
        setIsLoading(false);
        if (res.success) {
            setSelectedIds([]);
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    // Single Delete
    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus siswa ini?")) return;
        setIsLoading(true);
        const res = await deleteStudent(id);
        setIsLoading(false);
        if (res.success) router.refresh();
        else alert(res.error);
    };

    // Edit Logic
    const startEdit = (student: StudentData) => {
        setEditingId(student.id);
        setEditForm({ name: student.name, classId: student.classId });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setIsLoading(true);
        const res = await updateStudent(editingId, editForm.name, editForm.classId);
        setIsLoading(false);
        if (res.success) {
            setEditingId(null);
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    // Export Template
    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { "Nama Siswa": "Contoh Siswa 1", "Kelas": "7A" },
            { "Nama Siswa": "Contoh Siswa 2", "Kelas": "7B" },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Template_Import_Siswa_SSB.xlsx");
    };

    // Import Excel
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

            // Validate data structure
            const formattedData = data.map(row => ({
                name: row["Nama Siswa"] || row["Nama"] || row["name"],
                className: row["Kelas"] || row["Class"] || row["class"] || row["className"]
            })).filter(row => row.name && row.className);

            if (formattedData.length === 0) {
                alert("Format file tidak valid atau kosong. Pastikan ada kolom 'Nama Siswa' dan 'Kelas'.");
                return;
            }

            if (!confirm(`Ditemukan ${formattedData.length} data siswa. Lanjutkan import?`)) return;

            setIsLoading(true);
            const res = await importStudents(formattedData);
            setIsLoading(false);

            if (res.success) {
                alert(`Berhasil import ${res.count} siswa.\n${res.errors?.length ? `Gagal: ${res.errors.length}\n` + res.errors.join('\n') : ''}`);
                router.refresh();
            } else {
                alert(res.error);
            }

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white  p-6 rounded-2xl shadow-sm border border-card-border">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative group w-full sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama siswa..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            style={{ paddingLeft: '3.5rem' }}
                            className="w-full h-11 pr-4 rounded-xl bg-slate-50  border border-slate-200  text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
                        />
                    </div>
                    <div className="relative group w-full sm:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <select
                            value={filterClass}
                            onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}
                            style={{ paddingLeft: '3.5rem' }}
                            className="w-full h-11 pr-8 rounded-xl bg-slate-50  border border-slate-200  text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all whitespace-nowrap"
                    >
                        <Download size={16} /> Template
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
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider hover:bg-blue-100 transition-all whitespace-nowrap disabled:opacity-50"
                        >
                            <Upload size={16} /> Max Upload
                        </button>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider hover:bg-red-100 transition-all whitespace-nowrap animate-fade-in"
                        >
                            <Trash2 size={16} /> Hapus ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white  rounded-2xl overflow-hidden border border-slate-200  shadow-xl shadow-slate-200/40  min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-card-border/50 bg-slate-50/30">
                                <th className="p-5 pl-8 w-14 text-center">
                                    <input
                                        type="checkbox"
                                        checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                    />
                                </th>
                                <th className="p-5 font-extrabold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Nama Siswa</th>
                                <th className="p-5 font-extrabold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Kelas</th>
                                <th className="p-5 pr-8 font-extrabold text-[10px] text-muted-foreground uppercase tracking-[0.2em] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border/50">
                            {paginatedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <User size={48} strokeWidth={1} />
                                            <p className="text-sm font-bold text-muted-foreground">Tidak ada data siswa ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudents.map((s, index) => (
                                    <tr key={s.id} className={`group hover:bg-slate-50  transition-colors ${selectedIds.includes(s.id) ? "bg-primary/5" : ""}`}>
                                        <td className="p-5 pl-8 text-center bg-transparent">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(s.id)}
                                                    onChange={() => toggleSelect(s.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {editingId === s.id ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full md:w-64 px-3 py-2 rounded-xl border border-primary text-sm font-bold outline-none bg-white ring-4 ring-primary/10"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100  flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all font-black text-sm">
                                                        {(page - 1) * itemsPerPage + index + 1}
                                                    </div>
                                                    <span className="font-extrabold text-sm tracking-tight text-foreground block uppercase">{s.name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            {editingId === s.id ? (
                                                <select
                                                    value={editForm.classId}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, classId: e.target.value }))}
                                                    className="w-full md:w-32 px-3 py-2 rounded-xl border border-primary text-sm font-bold outline-none bg-white ring-4 ring-primary/10"
                                                >
                                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            ) : (
                                                <span className="px-3 py-1 rounded-lg bg-slate-100  text-[11px] font-black text-muted-foreground uppercase tracking-widest">{s.class.name}</span>
                                            )}
                                        </td>
                                        <td className="p-5 pr-8">
                                            <div className="flex justify-center items-center gap-2">
                                                {editingId === s.id ? (
                                                    <>
                                                        <button
                                                            onClick={saveEdit}
                                                            disabled={isLoading}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(s)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(s.id)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50  transition-all"
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

                {/* Pagination Footer */}
                <div className="p-5 border-t border-card-border bg-slate-50/50  flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center sm:text-left flex items-center gap-4">
                        <span>Menampilkan <span className="text-foreground">{paginatedStudents.length}</span> dari <span className="text-foreground">{filteredStudents.length}</span> siswa</span>
                        {filteredStudents.length > 20 && (
                            <button
                                onClick={() => {
                                    setShowAll(!showAll);
                                    setPage(1);
                                }}
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${showAll
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-slate-100 text-muted-foreground border border-slate-200 hover:bg-slate-200"
                                    }`}
                            >
                                {showAll ? "Mode Halaman" : "Tampilkan Semua"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-slate-200  disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Simple logic to show first few pages or surrounding current page
                                // For now, just show first 5 or simpler logic
                                let pNum = i + 1;
                                if (page > 3 && totalPages > 5) pNum = page - 2 + i;
                                if (pNum > totalPages) return null;

                                return (
                                    <button
                                        key={pNum}
                                        onClick={() => setPage(pNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === pNum
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "text-muted-foreground hover:bg-slate-200 "
                                            }`}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="p-2 rounded-lg hover:bg-slate-200  disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
