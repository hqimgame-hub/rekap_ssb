import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const classes = await prisma.class.findMany({
        select: { id: true, name: true }
    })
    console.log('Classes:', JSON.stringify(classes, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
