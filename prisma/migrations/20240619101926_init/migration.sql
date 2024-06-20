-- CreateEnum
CREATE TYPE "USER_TYPE" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "LOCATION" AS ENUM ('HCM', 'HN', 'DN');

-- CreateEnum
CREATE TYPE "REQUEST_RETURN_STATE" AS ENUM ('CANCELED', 'COMPLETED', 'WAITING_FOR_RETURNING');

-- CreateEnum
CREATE TYPE "ASSIGNMENT_STATE" AS ENUM ('WAITING_FOR_ACCEPTANCE', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ASSET_STATE" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE', 'WAITING_FOR_RECYCLING', 'RECYCLED', 'ASSIGNED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "staffCode" TEXT,
    "lastName" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "gender" "GENDER" NOT NULL DEFAULT 'OTHER',
    "salt" TEXT,
    "refreshToken" TEXT,
    "joinedDate" TIMESTAMP(3) NOT NULL,
    "type" "USER_TYPE" NOT NULL DEFAULT 'USER',
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "state" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "location" "LOCATION" NOT NULL DEFAULT 'HCM',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestReturn" (
    "id" SERIAL NOT NULL,
    "assetCode" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "requestedById" INTEGER NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "acceptedById" INTEGER,
    "returnedDate" TIMESTAMP(3),
    "state" "REQUEST_RETURN_STATE" NOT NULL DEFAULT 'WAITING_FOR_RETURNING',
    "assignmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "assetCode" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    "assignedById" INTEGER NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "state" "ASSIGNMENT_STATE" NOT NULL DEFAULT 'WAITING_FOR_ACCEPTANCE',
    "note" TEXT,
    "assetId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "assetCode" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "installedDate" TIMESTAMP(3) NOT NULL,
    "state" "ASSET_STATE" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT NOT NULL,
    "specification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_staffCode_key" ON "User"("staffCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetCode_key" ON "Asset"("assetCode");

-- AddForeignKey
ALTER TABLE "RequestReturn" ADD CONSTRAINT "RequestReturn_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestReturn" ADD CONSTRAINT "RequestReturn_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestReturn" ADD CONSTRAINT "RequestReturn_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
