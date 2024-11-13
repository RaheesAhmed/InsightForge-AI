import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function signJWT(
  payload: {
    userId: string;
    email: string;
    name?: string;
    role?: string;
  },
  expiresIn: string = "1d"
) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJWT(token: string) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
