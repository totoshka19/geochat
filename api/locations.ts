import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
    })
    res.status(200).json(locations)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch locations' })
  }
}
