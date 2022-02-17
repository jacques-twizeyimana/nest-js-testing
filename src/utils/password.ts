import { genSaltSync, hashSync } from 'bcrypt';

export async function hashPassword(password: string) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}
