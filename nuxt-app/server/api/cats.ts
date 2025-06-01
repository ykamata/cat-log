import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    const cats = await prisma.cat.findMany()
    return cats
  }

  if (method === 'POST') {
    const body = await readBody(event)
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing name for cat',
      })
    }
    const newCat = await prisma.cat.create({
      data: {
        name: body.name,
      },
    })
    return newCat
  }

  // Optional: Handle other methods or return a 405 Method Not Allowed error
  // throw createError({
  //   statusCode: 405,
  //   statusMessage: 'Method Not Allowed',
  // })
})
