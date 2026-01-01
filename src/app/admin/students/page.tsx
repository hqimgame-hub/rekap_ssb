import { prisma } from "@/lib/prisma";
import { addStudent, deleteStudent } from "@/lib/actions";
import AdminHeader from "@/components/AdminHeader";
import StudentsTable from "./StudentsTable";
import { Plus, UserPlus } from "lucide-react";

export default async function StudentsPage() {
    const [students, classes] = await Promise.all([
        prisma.student.findMany({
            orderBy: { name: 'asc' },
            include: { class: true }
        }),
        prisma.class.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminHeader />
            <main className="w-full px-6 sm:px-8 py-10 max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Kelola Siswa</h1>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Manajemen Database Siswa Sekolah</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Add Student Form */}
                    <div className="lg:col-span-4 card-refined p-8 bg-white dark:bg-slate-900 shadow-sm space-y-8 h-fit">
                        <div className="space-y-3">
                            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
                                <UserPlus size={24} />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Tambah Siswa</h2>
                            <p className="text-xs text-muted-foreground leading-relaxed">Daftarkan siswa baru ke dalam kelas yang tersedia secara permanen.</p>
                        </div>

                        <form action={async (formData) => {
                            "use server";
                            const name = formData.get("name") as string;
                            const classId = formData.get("classId") as string;
                            if (name && classId) await addStudent(name, classId);
                        }} className="space-y-5">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest ml-1">Nama Lengkap Siswa</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Nama sesuai absen"
                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-card-border focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest ml-1">Penempatan Kelas</label>
                                <div className="relative">
                                    <select
                                        name="classId"
                                        required
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-card-border focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/10">
                                <Plus size={18} /> Simpan Siswa
                            </button>
                        </form>
                    </div>

                    {/* Students Table - Client Component */}
                    <div className="lg:col-span-8 h-full">
                        <StudentsTable students={students as any} classes={classes} />
                    </div>
                </div>
            </main>
        </div>
    );
}
