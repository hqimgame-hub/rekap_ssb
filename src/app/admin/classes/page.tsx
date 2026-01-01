import { prisma } from "@/lib/prisma";
import { addClass, deleteClass } from "@/lib/actions";
import AdminHeader from "@/components/AdminHeader";
import ClassesTable from "./ClassesTable";
import { Plus, School, Users, PlusCircle } from "lucide-react";

export default async function ClassesPage() {
    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { students: true } } }
    });

    return (
        <div className="min-h-screen bg-background">
            <AdminHeader />
            <main className="w-full px-6 sm:px-8 py-10 max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Kelola Kelas</h1>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Manajemen Ruang Kelas & Siswa</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Add Class Form */}
                    <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8 sticky top-24">
                        <div className="space-y-3">
                            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary border border-primary/10">
                                <PlusCircle size={24} />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Tambah Kelas Baru</h2>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">Buat entitas kelas baru dan tetapkan wali kelas untuk mulai menginput data sarapan siswa.</p>
                        </div>

                        <form action={async (formData) => {
                            "use server";
                            const name = formData.get("name") as string;
                            const homeroomTeacher = formData.get("homeroomTeacher") as string;
                            if (name) await addClass(name, homeroomTeacher);
                        }} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nama Identitas Kelas</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                                            <School size={18} />
                                        </div>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="Misal: 7A, 9C, dsb."
                                            style={{ paddingLeft: '3.5rem' }}
                                            className="w-full h-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nama Wali Kelas</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                                            <Users size={18} />
                                        </div>
                                        <input
                                            name="homeroomTeacher"
                                            type="text"
                                            placeholder="Nama Lengkap Wali Kelas"
                                            style={{ paddingLeft: '3.5rem' }}
                                            className="w-full h-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20">
                                <Plus size={18} /> Simpan Kelas
                            </button>
                        </form>
                    </div>

                    {/* Classes Table - Client Component with CRUD */}
                    <div className="lg:col-span-8">
                        <ClassesTable classes={classes as any} />
                    </div>
                </div>
            </main>
        </div>
    );
}
