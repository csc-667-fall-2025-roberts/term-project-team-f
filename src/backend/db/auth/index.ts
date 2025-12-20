import bcrypt from "bcrypt";
import db from "../connection";
import type { SecureUser, User } from "../../types/types";
import { SIGNUP, LOGIN } from "./sql";

const signup = async (
  username: string,
  email: string,
  clearTextPassword: string,
) => {
  // create record in db
  // with encrypted password
  // ensure username is unique
  const password = await bcrypt.hash(clearTextPassword, 10);

  try {
    return await db.one<User>(SIGNUP, [username, email, password]);
  } catch (e) {
    throw new Error("Email or username invalid");
  }
};
const login = async (username: string, clearTextPassword: string) => {
  const secureUser = await db.one<SecureUser>(LOGIN, username);

  if (await bcrypt.compare(clearTextPassword, secureUser.password)) {
    const { id, username, email, created_at } = secureUser;
    return { id, username, email, created_at };
  } else {
    throw "Invalid login";
  }
};

export { login, signup };
