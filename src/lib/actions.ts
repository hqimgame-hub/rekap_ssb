"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function saveDailyLogs(classId: string, logs: any[]) {
    // ... existing code ...
    try {
        // We use a transaction to ensure all logs are saved together
        await prisma.$transaction(
            logs.map((log) => {
                const { studentId, date, ...menuItems } = log;
                const logDate = new Date(date);
                logDate.setHours(0, 0, 0, 0);

                return prisma.dailyMenuLog.upsert({
                    where: {
                        studentId_date: {
                            studentId,
                            date: logDate,
                        },
                    },
                    update: { ...menuItems },
                    create: {
                        studentId,
                        date: logDate,
                        ...menuItems,
                    },
                });
            })
        );

        revalidatePath(`/input-menu/${classId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to save logs:", error);
        return { success: false, error: "Gagal menyimpan data ke database." };
    }
}

// Class Management Actions
export async function addClass(name: string, homeroomTeacher: string = "") {
    try {
        await prisma.class.create({
            data: {
                name,
                homeroomTeacher: homeroomTeacher || null
            }
        });
        revalidatePath("/admin/classes");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menambahkan kelas (mungkin nama sudah ada)." };
    }
}

export async function deleteClass(id: string) {
    try {
        await prisma.class.delete({ where: { id } });
        revalidatePath("/admin/classes");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menghapus kelas." };
    }
}

export async function updateClass(id: string, name: string, homeroomTeacher: string) {
    try {
        await prisma.class.update({
            where: { id },
            data: { name, homeroomTeacher: homeroomTeacher || null }
        });
        revalidatePath("/admin/classes");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal mengupdate kelas." };
    }
}

export async function bulkDeleteClasses(ids: string[]) {
    try {
        await prisma.class.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath("/admin/classes");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menghapus kelas terpilih." };
    }
}

export async function importClasses(data: { name: string; homeroomTeacher?: string }[]) {
    try {
        const validData = data
            .filter(row => row.name)
            .map(row => ({
                name: row.name.toString().trim(),
                homeroomTeacher: row.homeroomTeacher ? row.homeroomTeacher.toString().trim() : null
            }));

        if (validData.length === 0) return { success: false, error: "Data kosong atau tidak valid." };

        let successCount = 0;
        let errors: string[] = [];

        // Sequential processing to ensure stability and precise error reporting
        for (const row of validData) {
            try {
                // Check if exists to avoid error throwing if possible
                const existing = await prisma.class.findUnique({
                    where: { name: row.name }
                });

                if (existing) {
                    // Update homeroom teacher if provided? Or skip?
                    // User context suggests adding new. We'll skip if exists, or update if user wants (ambiguous).
                    // Safe bet: Skip distinct names, or maybe update teacher if that's the goal.
                    // Given "Upload excel", usually implies "Update/Sync".
                    // I'll update the homeroom teacher if it exists, to be more useful.
                    if (row.homeroomTeacher) {
                        await prisma.class.update({
                            where: { id: existing.id },
                            data: { homeroomTeacher: row.homeroomTeacher }
                        });
                    }
                    // Consider this a success or ignored? We'll count it as processed.
                    successCount++;
                } else {
                    await prisma.class.create({
                        data: {
                            name: row.name,
                            homeroomTeacher: row.homeroomTeacher
                        }
                    });
                    successCount++;
                }
            } catch (innerError: any) {
                console.error(`Error importing class ${row.name}:`, innerError);
                errors.push(`Gagal memproses kelas ${row.name}: ${innerError.message}`);
            }
        }

        revalidatePath("/admin/classes");
        revalidatePath("/");

        if (successCount === 0 && errors.length > 0) {
            return { success: false, error: errors.join(", ") };
        }

        return {
            success: true,
            count: successCount,
            message: errors.length > 0 ? `Berhasil: ${successCount}. Gagal: ${errors.length}` : undefined
        };
    } catch (error: any) {
        console.error("Import classes fatal error:", error);
        return { success: false, error: "Terjadi kesalahan sistem saat import: " + error.message };
    }
}

// Student Management Actions
export async function addStudent(name: string, classId: string) {
    try {
        await prisma.student.create({ data: { name, classId } });
        revalidatePath("/admin/students");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menambahkan siswa." };
    }
}

export async function deleteStudent(id: string) {
    try {
        await prisma.student.delete({ where: { id } });
        revalidatePath("/admin/students");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menghapus siswa." };
    }
}

export async function updateStudent(id: string, name: string, classId: string) {
    try {
        await prisma.student.update({
            where: { id },
            data: { name, classId }
        });
        revalidatePath("/admin/students");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal mengupdate siswa." };
    }
}

export async function bulkDeleteStudents(ids: string[]) {
    try {
        await prisma.student.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath("/admin/students");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menghapus siswa terpilih." };
    }
}

export async function deleteAllStudents() {
    try {
        await prisma.student.deleteMany();
        revalidatePath("/admin/students");
        revalidatePath("/admin/dashboard");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menghapus semua siswa." };
    }
}

export async function deleteAllClasses() {
    try {
        await prisma.class.deleteMany();
        revalidatePath("/admin/classes");
        revalidatePath("/admin/dashboard");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menghapus semua kelas." };
    }
}

export async function importStudents(data: { name: string; className: string }[]) {
    try {
        const classes = await prisma.class.findMany();
        const classMap = new Map(classes.map(c => [c.name.toLowerCase(), c.id]));

        const studentsToCreate = [];
        const errors = [];

        for (const row of data) {
            const normalizedClassName = row.className.toString().trim().toLowerCase();
            let classId = classMap.get(normalizedClassName);

            if (classId) {
                studentsToCreate.push({
                    name: row.name,
                    classId: classId
                });
            } else {
                errors.push(`Kelas '${row.className}' tidak ditemukan untuk siswa '${row.name}'`);
            }
        }

        if (studentsToCreate.length > 0) {
            await prisma.student.createMany({
                data: studentsToCreate
            });
        }

        revalidatePath("/admin/students");
        return { success: true, count: studentsToCreate.length, errors };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Gagal mengimport data siswa." };
    }
}

// Recap Data Fetcher
export async function getMonthlyRecap(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const logs = await prisma.dailyMenuLog.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            student: {
                include: { class: true }
            }
        },
    });

    // Group logs by student
    const result: Record<string, any> = {};

    logs.forEach(log => {
        const studentId = log.studentId;
        if (!result[studentId]) {
            result[studentId] = {
                studentName: log.student.name,
                className: log.student.class.name,
                logs: {}
            };
        }
        const day = log.date.getDate();
        result[studentId].logs[day] = {
            lengkap: log.nasi && log.lauk && log.sayur && log.buah && log.minum,
            kurang: (log.nasi || log.lauk || log.sayur || log.buah || log.minum) && !(log.nasi && log.lauk && log.sayur && log.buah && log.minum),
            none: !log.nasi && !log.lauk && !log.sayur && !log.buah && !log.minum
        };
    });

    return Object.values(result);
}

// SSB Attendance Actions
export async function saveSSBAttendance(date: string, attendances: { studentId: string, isPresent: boolean }[]) {
    try {
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);

        // Upsert the event
        const event = await prisma.breakfastEvent.upsert({
            where: { date: eventDate },
            update: {},
            create: { date: eventDate }
        });

        // Upsert all attendances in a transaction
        await prisma.$transaction(
            attendances.map(a => prisma.breakfastAttendance.upsert({
                where: {
                    breakfastEventId_studentId: {
                        breakfastEventId: event.id,
                        studentId: a.studentId
                    }
                },
                update: { isPresent: a.isPresent },
                create: {
                    breakfastEventId: event.id,
                    studentId: a.studentId,
                    isPresent: a.isPresent
                }
            }))
        );

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to save SSB attendance:", error);
        return { success: false, error: "Gagal menyimpan absensi SSB." };
    }
}

// Authentication Actions
export async function verifyAdmin(username: string, password: string) {
    const admin = await prisma.admin.findUnique({
        where: { username }
    });

    if (admin && await bcrypt.compare(password, admin.password)) {
        (await cookies()).set("admin_auth", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });
        return { success: true };
    }
    return { success: false, error: "Username atau password salah." };
}

// System Settings Actions
export async function getSystemSetting(key: string) {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key }
        });
        return setting?.value || "";
    } catch (error) {
        console.error(`Failed to get setting ${key}:`, error);
        return "";
    }
}

export async function updateSystemSetting(key: string, value: string) {
    try {
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        revalidatePath("/admin/dashboard");
        revalidatePath("/input-menu/[classId]", "page");
        return { success: true };
    } catch (error) {
        console.error(`Failed to update setting ${key}:`, error);
        return { success: false, error: "Gagal memperbarui pengaturan." };
    }
}
