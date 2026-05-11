import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const register = async (
  name: string,
  username: string,
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    throw new Error("Email already in use");
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });
  if (existingUsername) {
    throw new Error("Username already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: name || null,
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
    },
  });

  return newUser;
};
