'use server';

import { register } from "@/backend/controllers/auth-controller";


export type RegisterResult =
  | { created: true }
  | { created: false; error: { message: string } };

export async function registerUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    await register(name, username, email, password);

    return {
      created: true,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Registration failed";

    return {
      created: false,
      error: {
        message,
      },
    };
  }
}