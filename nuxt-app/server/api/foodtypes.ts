import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    const foodTypes = await prisma.foodType.findMany()
    return foodTypes
  }

  if (method === 'POST') {
    const body = await readBody(event)
    if (!body.name || body.caloriesPerGram === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing name or caloriesPerGram for food type',
      })
    }
    const newFoodType = await prisma.foodType.create({
      data: {
        name: body.name,
        caloriesPerGram: parseFloat(body.caloriesPerGram),
      },
    })
    return newFoodType
  }
})
