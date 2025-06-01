/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Cat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FoodType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "caloriesPerGram" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "MealRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountGrams" REAL NOT NULL,
    "calories" REAL NOT NULL,
    "catId" INTEGER NOT NULL,
    "foodTypeId" INTEGER NOT NULL,
    CONSTRAINT "MealRecord_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MealRecord_foodTypeId_fkey" FOREIGN KEY ("foodTypeId") REFERENCES "FoodType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodType_name_key" ON "FoodType"("name");

-- CreateIndex
CREATE INDEX "MealRecord_catId_idx" ON "MealRecord"("catId");

-- CreateIndex
CREATE INDEX "MealRecord_foodTypeId_idx" ON "MealRecord"("foodTypeId");
