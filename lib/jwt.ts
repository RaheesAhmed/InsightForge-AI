import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

export interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  exp?: number;
}

export async function signJWT(
  payload: JWTPayload,
  expiresIn: string = "24h"
): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const iat = Math.floor(Date.now() / 1000);
    const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now

    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(getJwtSecretKey());

    return token;
  } catch (error) {
    console.error("Error signing JWT:", error);
    throw new Error("Failed to sign JWT");
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    
    // Verify required fields
    if (!payload.userId || !payload.email) {
      console.error("Invalid token payload:", payload);
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error("Error verifying JWT:", error);
    return null;
  }
}

// Helper function to check if a token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    const exp = payload.exp;
    
    if (!exp) return true;
    
    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= exp;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}
