
"use client";

import { useState } from "react";
import { saveSSBAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Calendar, Save, ArrowLeft } from "lucide-react";

interface Student {
    id: string;
    name: string;
}

interface SSBFormProps {
    students: Student[];
    classId: string;
}

export default function SSBForm({ students, classId }: SSBFormProps) {
    const router = useRouter();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        students.forEach(s => {
            initial[s.id] = true;
        });
        return initial;
    });

    const toggleAttendance = (studentId: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const dataToSave = Object.entries(attendance).map(([studentId, isPresent]) => ({
            studentId,
            isPresent
        }));

        const result = await saveSSBAttendance(date, dataToSave);
        setLoading(false);

        if (result.success) {
            router.push("/");
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-24">
            <div className="max-w-4xl mx-auto py-6 animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-black italic">Absensi SSB</h1>
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">SMPN 32 SURABAYA</p>
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400">Tanggal Acara</p>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none block"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                    {students.map((student) => (
                        <button
                            key={student.id}
                            onClick={() => toggleAttendance(student.id)}
                            className={`p-5 rounded-3xl border transition-all flex items-center justify-between group ${attendance[student.id]
                                    ? "bg-white dark:bg-slate-900 border-emerald-500/20 dark:border-emerald-500/20 shadow-sm"
                                    : "bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-60"
                                }`}
                        >
                            <div className="text-left">
                                <p className={`font-black text-sm ${attendance[student.id] ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                                    {student.name}
                                </p>
                                <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${attendance[student.id] ? "text-emerald-500" : "text-red-400"}`}>
                                    {attendance[student.id] ? "HADIR" : "TIDAK HADIR"}
                                </p>
                            </div>
                            <div className={`transition-all duration-300 ${attendance[student.id] ? "text-emerald-500 scale-100" : "text-slate-300 scale-90"}`}>
                                {attendance[student.id] ? <CheckCircle size={24} fill="currentColor" className="text-emerald-500 fill-emerald-50" /> : <XCircle size={24} />}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-14 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/25 font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
                    >
                        {loading ? "MEMPROSES..." : <><Save size={18} /> SIMPAN ABSENSI</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
