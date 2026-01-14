import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { users } from "./schema.js";

export async function findUser(username) {
  return db
    .select({
      id: users.id,
      username: users.username,
      password: users.password,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
}

export async function createUser(username, password) {
  return db
    .insert(users)
    .values({ username, password })
    .returning({ id: users.id });
}

