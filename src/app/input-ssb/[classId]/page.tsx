
import { prisma } from "@/lib/prisma";
import SSBForm from "@/components/SSBForm";
import { notFound } from "next/navigation";

export default async function InputSSBPage({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = await params;

    const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
            students: {
                orderBy: { name: 'asc' }
            }
        }
    });

    if (!classData) {
        notFound();
    }

    return (
        <div className="py-12 px-6">
            <div className="max-w-5xl mx-auto mb-12 animate-fade-in text-center md:text-left">
                <h1 className="text-4xl font-bold opacity-90 mb-2">
                    Absensi SSB: Kelas {classData.name}
                </h1>
                <p className="text-slate-500">
                    Catat kehadiran siswa pada kegiatan Sarapan Sehat Bersama.
                </p>
            </div>

            <SSBForm students={classData.students} classId={classId} />
        </div>
    );
}
