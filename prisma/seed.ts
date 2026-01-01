import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
        },
    });

    // Create sample classes
    const class1A = await prisma.class.upsert({
        where: { name: '1A' },
        update: { homeroomTeacher: 'Drs. H. Ahmad Fauzi' },
        create: { name: '1A', homeroomTeacher: 'Drs. H. Ahmad Fauzi' },
    });

    const class1B = await prisma.class.upsert({
        where: { name: '1B' },
        update: { homeroomTeacher: 'Siti Aminah, S.Pd.' },
        create: { name: '1B', homeroomTeacher: 'Siti Aminah, S.Pd.' },
    });

    // Create sample students
    await prisma.student.upsert({
        where: { id: 'student-1' },
        update: {},
        create: {
            id: 'student-1',
            name: 'Ahmad Rizki',
            classId: class1A.id,
        },
    });

    await prisma.student.upsert({
        where: { id: 'student-2' },
        update: {},
        create: {
            id: 'student-2',
            name: 'Siti Nurhaliza',
            classId: class1A.id,
        },
    });

    await prisma.student.upsert({
        where: { id: 'student-3' },
        update: {},
        create: {
            id: 'student-3',
            name: 'Budi Santoso',
            classId: class1B.id,
        },
    });

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
