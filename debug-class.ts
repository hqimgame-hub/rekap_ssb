import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const classId = '441e47bd-2efa-4cb4-a583-19c8b2742745'
    const classData = await prisma.class.findUnique({
        where: { id: classId }
    })
    console.log('Class data:', classData)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
