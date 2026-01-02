import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

try {
    const id = '441e47bd-2efa-4cb4-a583-19c8b2742745'
    const classData = await prisma.class.findUnique({ where: { id } })
    console.log('Class exists:', !!classData)
} catch (e) {
    console.error(e)
} finally {
    await prisma.$disconnect()
}
