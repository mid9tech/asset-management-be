import { Prisma, PrismaClient } from '@prisma/client';
import { HashPW } from './hasher';

export async function generateStaffCode(client: PrismaClient) {
  const lastUser = await client.user.findFirst({
    orderBy: { id: 'desc' },
  });

  const stringId = lastUser?.staffCode.slice(-4);
  const lastId = lastUser ? parseInt(stringId) : 0;
  const newId = lastId + 1;
  const newStaffCode = `SD${newId.toString().padStart(4, '0')}`;
  return newStaffCode;
}

export async function generateUsername(
  params: Prisma.MiddlewareParams,
  client: PrismaClient,
) {
  const { firstName, lastName } = params.args.data;
  const lastNameCharacters = lastName.split(' ');
  let usernameBase = firstName.toLowerCase().replace(/\s+/g, '');

  for (let temp of lastNameCharacters) {
    temp = temp.toLowerCase().replace(/\s+/g, '');
    if (temp.length > 1) {
      usernameBase += temp[0];
    }
  }

  let username = usernameBase;
  let counter = 1;
  while (await client.user.findFirst({ where: { username } })) {
    username = usernameBase + counter;
    counter++;
  }
  return username;
}

export async function generatePassword(params: Prisma.MiddlewareParams) {
  const { username, dateOfBirth } = params.args.data;
  const dobString = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString('en-GB').replace(/\//g, '')
    : '';

  const rawPassword = `${username}@${dobString}`;
  return await HashPW(rawPassword, params.args.data.salt);
}
