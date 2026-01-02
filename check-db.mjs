import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

try {
    const count = await prisma.class.count()
    console.log('Class count:', count)
    const classes = await prisma.class.findMany({ take: 5 })
    console.log('Classes:', classes)
} catch (e) {
    console.error(e)
} finally {
    await prisma.$disconnect()
}
