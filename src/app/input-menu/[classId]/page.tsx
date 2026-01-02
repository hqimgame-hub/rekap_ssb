import { prisma } from "@/lib/prisma";
import MenuForm from "@/components/MenuForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function InputMenuPage({ params }: { params: Promise<{ classId: string }> }) {
    console.log('InputMenuPage called with params:', await params);
    const { classId } = await params;

    console.log('Fetching class with ID:', classId);
    const [classData, uploadUrl] = await Promise.all([
        prisma.class.findUnique({
            where: { id: classId },
            include: {
                students: {
                    orderBy: { name: 'asc' }
                }
            }
        }),
        // Safely check if systemSetting exists to avoid crashes if Prisma client is not re-generated/reloaded
        (prisma as any).systemSetting ? (prisma as any).systemSetting.findUnique({
            where: { key: "upload_url" }
        }).then((s: any) => s?.value || "") : Promise.resolve("")
    ]);

    console.log('Class data found:', !!classData);

    if (!classData) {
        console.log('Class not found, calling notFound()');
        notFound();
    }

    return (
        <div className="py-12 px-2 sm:px-6">
            <MenuForm
                students={classData.students}
                classId={classId}
                className={classData.name}
                homeroomTeacher={classData.homeroomTeacher}
                uploadUrl={uploadUrl}
            />
        </div>
    );
}
