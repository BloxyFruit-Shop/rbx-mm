import type { User } from "better-auth";
import { symmetricDecrypt } from "better-auth/crypto";
import { SignJWT, importJWK, type JWK } from "jose";
import { auth } from "./auth";
import { env } from '~/env';

interface JWKModel {
  id: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

async function getJwkDetails() {
  const adapter = (await auth.$context).adapter;
  const [jwkRecord] = await adapter.findMany<JWKModel>({
    model: "jwks",
    sortBy: {
      field: "createdAt",
      direction: "desc",
    },
    limit: 1,
  });

  if (!jwkRecord) {
    console.error("No JWK found in the database for OIDC signing.");
    throw new Error("OIDC signing key not configured.");
  }

  // The 'privateKey' field from the DB stores the *encrypted* JWK. Decrypt it.
  const decryptedJwkString = JSON.parse(
    await symmetricDecrypt({
      key: env.BETTER_AUTH_SECRET,
      data: JSON.parse(jwkRecord.privateKey) as string,
    }),
  ) as JWK;

  // Load decrypted JWK into jose
  const privateKey = await importJWK(
    decryptedJwkString,
    "RS256",
  );

  return {
    privateKey,
    keyId: jwkRecord.id,
  };
}

export async function mintTokenForConvex(user: User) {
  const { privateKey, keyId } = await getJwkDetails();

  return await new SignJWT({
    sub: user.id,
  })
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setIssuedAt()
    .setIssuer(`${env.BETTER_AUTH_URL}/api/auth`)
    .setAudience("convex")
    .setExpirationTime("1h")
    .sign(privateKey);
}