
import AdminHeader from "@/components/AdminHeader";
import { HelpCircle, BookOpen, CheckCircle, Smartphone, Download } from "lucide-react";

export default function HelpPage() {
    const guides = [
        {
            title: "Pencatatan Menu Harian",
            description: "Wali kelas dapat mengisi menu sehat harian siswa melalui halaman utama tanpa perlu login. Cukup pilih kelas, pilih tanggal, dan centang item yang dibawa siswa.",
            icon: BookOpen,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Absensi SSB",
            description: "Pencatatan kehadiran kegiatan 'Sarapan Sehat Bersama' dilakukan secara terpisah. Anda bisa menandai kehadiran siswa dengan satu klik pada kartu nama mereka.",
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Manajemen Data Sekolah",
            description: "Melalui Dashboard Admin, Anda dapat mengelola daftar kelas dan database siswa. Data ini akan otomatis sinkron dengan form input wali kelas.",
            icon: Smartphone,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            title: "Laporan & Rekap",
            description: "Unduh laporan bulanan dalam format Excel atau PDF melalui menu Rekap. Laporan ini sudah menyertakan ringkasan kelengkapan menu tiap siswa.",
            icon: Download,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        }
    ];

    return (
        <div className="min-h-screen">
            <AdminHeader />
            <div className="p-8 max-w-5xl mx-auto animate-fade-in">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-bold gradient-text mb-4">Panduan Penggunaan</h1>
                    <p className="text-slate-500 max-w-2xl font-medium">
                        Temukan petunjuk langkah demi langkah untuk memaksimalkan penggunaan sistem SSB di SMPN 32 Surabaya.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {guides.map((guide, idx) => {
                        const Icon = guide.icon;
                        return (
                            <div key={idx} className="glass p-8 rounded-[32px] border border-white/20 hover:border-primary/30 transition-all">
                                <div className={`w-14 h-14 rounded-2xl ${guide.bg} ${guide.color} flex items-center justify-center mb-6`}>
                                    <Icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{guide.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {guide.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 glass p-8 rounded-[32px] bg-gradient-to-br from-slate-900 to-indigo-900 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <HelpCircle size={40} className="text-indigo-300" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2 text-center md:text-left">Masih butuh bantuan?</h3>
                            <p className="opacity-80 text-sm text-center md:text-left">
                                Hubungi tim IT sekolah melalui email di <span className="font-mono text-indigo-300">it-support@sekolah.sch.id</span> atau kunjungi ruang IT pada jam kerja.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
