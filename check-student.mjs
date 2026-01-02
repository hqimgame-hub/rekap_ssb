import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

try {
    const id = '441e47bd-2efa-4cb4-a583-19c8b2742745'
    const studentData = await prisma.student.findUnique({ where: { id } })
    console.log('Student exists:', !!studentData)
    if (studentData) {
        console.log('Student name:', studentData.name)
    }
} catch (e) {
    console.error(e)
} finally {
    await prisma.$disconnect()
}
