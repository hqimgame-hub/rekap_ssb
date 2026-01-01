import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/AdminHeader";
import { Users, School, CheckCircle2, Activity, Settings2 } from "lucide-react";
import AdvancedNutritionMonitor from "@/components/AdvancedNutritionMonitor";
import ResetDataDialog from "@/components/ResetDataDialog";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await searchParams;
    const selectedDateStr = params.date || new Date().toISOString().split('T')[0];

    const startOfSelectedDate = new Date(selectedDateStr);
    startOfSelectedDate.setHours(0, 0, 0, 0);

    const endOfSelectedDate = new Date(selectedDateStr);
    endOfSelectedDate.setHours(23, 59, 59, 999);

    const dateRange = {
        gte: startOfSelectedDate,
        lt: endOfSelectedDate,
    };

    const [stats, logsToday, classes, allStudents] = await Promise.all([
        {
            totalStudents: await prisma.student.count(),
            totalClasses: await prisma.class.count(),
            totalLogsToday: await prisma.dailyMenuLog.count({ where: { date: dateRange } })
        },
        prisma.dailyMenuLog.findMany({
            where: { date: dateRange },
            select: {
                nasi: true,
                lauk: true,
                sayur: true,
                buah: true,
                minum: true,
                student: {
                    select: { classId: true }
                }
            }
        }),
        prisma.class.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: { students: true }
                }
            },
            orderBy: { name: 'asc' }
        }),
        prisma.student.findMany({
            select: {
                id: true,
                name: true,
                class: {
                    select: { name: true }
                }
            },
            orderBy: { name: 'asc' }
        })
    ]);

    return (
        <div className="min-h-screen bg-background selection:bg-primary/10">
            <AdminHeader />
            <main className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-16 animate-fade-in pb-20">
                {/* Greeting Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
                    <div className="space-y-1">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">Overview</h1>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
                            Dashboard Utama &bull; SMPN 32 SURABAYA
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10 tracking-widest uppercase shadow-sm">
                        <Activity size={12} className="animate-pulse" />
                        System Active
                    </div>
                </div>

                {/* Stats Section - Precise Alignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Siswa"
                        value={stats.totalStudents}
                        icon={<Users size={22} />}
                        color="primary"
                    />
                    <StatCard
                        title="Total Kelas"
                        value={stats.totalClasses}
                        icon={<School size={22} />}
                        color="secondary"
                    />
                    <StatCard
                        title="Input Hari Ini"
                        value={stats.totalLogsToday}
                        icon={<CheckCircle2 size={22} />}
                        color="accent"
                    />
                </div>

                {/* Nutrition Insight Section - Dual Track Analytics */}
                <AdvancedNutritionMonitor
                    logsToday={logsToday as any}
                    totalStudents={stats.totalStudents}
                    classes={classes as any}
                    currentDate={selectedDateStr}
                />

                {/* Data Management Section - Danger Zone */}
                <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                                <Settings2 size={16} />
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-foreground uppercase">Pengaturan Data</h2>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-11 opacity-60">
                            Kelola integritas database & pembersihan data masal
                        </p>
                    </div>

                    <div className="card-refined p-8 bg-white border-red-100 flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden">
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-lg font-black text-slate-900 uppercase">Pembersihan Database</h3>
                            <p className="text-xs font-bold text-slate-400 max-w-xl leading-relaxed uppercase tracking-tight">
                                Fitur ini digunakan untuk menghapus seluruh data siswa atau kelas secara masal. Berguna saat pergantian tahun ajaran atau reset data sekolah.
                            </p>
                        </div>
                        <div className="relative z-10 shrink-0">
                            <ResetDataDialog
                                students={allStudents as any}
                                classes={classes as any}
                            />
                        </div>
                        {/* Danger zone background effect */}
                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                </div>

                {/* Professional Footer */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 opacity-40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                        &copy; 2024 SMPN 32 SURABAYA
                    </p>
                    <div className="flex gap-6">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Privacy Policy</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Terms of Service</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const colorMap: any = {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-emerald-500/10 text-emerald-600",
        accent: "bg-amber-500/10 text-amber-600",
    };

    return (
        <div className="card-refined group p-6 flex items-center gap-6 relative overflow-hidden bg-white hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-xl ${colorMap[color]} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500`}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest">{title}</p>
                <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
            </div>
            {/* Background design effect */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
        </div>
    );
}
