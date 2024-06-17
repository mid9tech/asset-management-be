import { PrismaClient, GENDER, LOCATION } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Upsert Admin
  const admin = await prisma.user.upsert({
    update: {},
    create: {
      id: 1,
      firstName: 'Hai',
      lastName: 'Nguyen Van',
      gender: GENDER.MALE,
      dateOfBirth: faker.date.past(),
      joinedDate: new Date(),
      location: LOCATION.HN,
      state: true,
      staffCode: 'SD0001',
      username: 'hainv',
      password: '$2b$10$a9Eaf/fML42Kqro/QNd/FewOm.hDdiu3omJHqsh6xQ2Kzz7FiX8Uu',
      salt: '$2b$10$a9Eaf/fML42Kqro/QNd/Fe',
    },
    where: {
      id: 1,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
