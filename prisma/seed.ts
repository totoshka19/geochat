import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import locations from '../src/data/locations.json' assert { type: 'json' }

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding locations...')

  // Очищаем таблицу перед заполнением (idempotent seed)
  await prisma.location.deleteMany()

  for (const loc of locations) {
    await prisma.location.create({
      data: {
        id:           loc.id,
        name:         loc.name,
        description:  loc.description,
        address:      loc.address,
        longitude:    loc.longitude,
        latitude:     loc.latitude,
        category:     loc.category,
        rating:       loc.rating ?? null,
        workingHours: loc.workingHours ?? null,
      },
    })
  }

  console.log(`Seeded ${locations.length} locations.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
