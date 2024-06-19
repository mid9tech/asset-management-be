import { PrismaClient, GENDER, LOCATION, USER_TYPE } from '@prisma/client';
import { faker } from '@faker-js/faker';
import {
  GenSalt,
  generatePassword,
  generateStaffCode,
  generateUsername,
} from '../src/shared/helpers';

const prisma = new PrismaClient();

function generateValidDOB() {
  const date = faker.date.past(
    30,
    new Date().setFullYear(new Date().getFullYear() - 18),
  );
  return date;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

async function main() {
  prisma.$use(async (params, next) => {
    if (params.model === 'User' && params.action === 'create') {
      // Auto-generate staff code
      if (!params.args.data.staffCode) {
        params.args.data.staffCode = await generateStaffCode(prisma);
      }

      // Auto-generate username
      if (!params.args.data.username) {
        params.args.data.username = await generateUsername(params, prisma);
      }

      // Auto-generate salt
      if (!params.args.data.salt) {
        params.args.data.salt = await GenSalt();
      }

      // Auto-generate password based on username and date of birth
      if (!params.args.data.password) {
        params.args.data.password = await generatePassword(params);
      }
    }

    return next(params);
  });

  // Upsert Admin
  const admins = [];

  const validDOB = generateValidDOB();

  admins.push(
    await prisma.user.create({
      data: {
        firstName: 'Hai',
        lastName: 'Nguyen Van',
        gender: GENDER.MALE,
        dateOfBirth: validDOB,
        joinedDate: addYears(validDOB, 18),
        type: USER_TYPE.ADMIN,
        location: LOCATION.HN,
        state: true,
      },
    }),
  );

  admins.push(
    await prisma.user.create({
      data: {
        firstName: 'Phuc',
        lastName: 'Hoang Nguyen',
        gender: GENDER.FEMALE,
        dateOfBirth: validDOB,
        joinedDate: addYears(validDOB, 18),
        type: USER_TYPE.ADMIN,
        location: LOCATION.DN,
        state: true,
      },
    }),
  );

  admins.push(
    await prisma.user.create({
      data: {
        firstName: 'Hai',
        lastName: 'Nguyen Van',
        gender: GENDER.FEMALE,
        dateOfBirth: validDOB,
        joinedDate: addYears(validDOB, 18),
        location: LOCATION.HCM,
        type: USER_TYPE.ADMIN,
        state: true,
      },
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
