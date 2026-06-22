import type { RequestHandler } from "express";
import { loginUser } from "./auth.service.js";

export const login: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body as { email?: string; password?: string };

    if (!email || !password) {
      response.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await loginUser(email, password);

    if (!user) {
      response.status(401).json({ message: "Invalid credentials." });
      return;
    }

    response.json({ user });
  } catch (error) {
    next(error);
  }
};
