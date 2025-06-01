import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    const query = getQuery(event)
    const catId = query.catId ? parseInt(query.catId as string) : undefined

    const meals = await prisma.mealRecord.findMany({
      where: {
        catId: catId,
      },
      include: {
        cat: true,
        foodType: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })
    return meals
  }

  if (method === 'POST') {
    const body = await readBody(event)
    if (!body.catId || !body.foodTypeId || body.amountGrams === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing catId, foodTypeId, or amountGrams for meal record',
      })
    }

    const foodType = await prisma.foodType.findUnique({
      where: { id: parseInt(body.foodTypeId) },
    })

    if (!foodType) {
      throw createError({
        statusCode: 404,
        statusMessage: 'FoodType not found',
      })
    }

    const calories = parseFloat(body.amountGrams) * foodType.caloriesPerGram

    const newMealRecord = await prisma.mealRecord.create({
      data: {
        catId: parseInt(body.catId),
        foodTypeId: parseInt(body.foodTypeId),
        amountGrams: parseFloat(body.amountGrams),
        calories: calories,
      },
    })
    return newMealRecord
  }
})
