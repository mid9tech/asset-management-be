import * as bcrypt from 'bcrypt';

export async function GenSalt(): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return salt;
}

export async function HashPW(password: string, salt: string): Promise<string> {
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function IsCorrectPW(
  hashPW: string,
  password: string,
): Promise<boolean> {
  const res = await bcrypt.compare(password, hashPW);

  return res;
}
