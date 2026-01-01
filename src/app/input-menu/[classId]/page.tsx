import { prisma } from "@/lib/prisma";
import MenuForm from "@/components/MenuForm";
import { notFound } from "next/navigation";

export default async function InputMenuPage({ params }: { params: Promise<{ classId: string }> }) {
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
        <div className="py-12 px-2 sm:px-6">
            <MenuForm
                students={classData.students}
                classId={classId}
                className={classData.name}
                homeroomTeacher={classData.homeroomTeacher}
            />
        </div>
    );
}
