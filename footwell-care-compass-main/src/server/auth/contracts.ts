import type { AuthenticatedActor } from "@/server/auth/authorization";

/**
 * Implemented by the selected authentication provider in Milestone 2.
 * It intentionally has no default or in-memory implementation.
 */
export interface AuthenticationResolver {
  resolve(request: Request): Promise<AuthenticatedActor | null>;
}

/**
 * Persistence boundary for opaque session identifiers. Store only token hashes,
 * never raw session tokens.
 */
export interface SessionRepository {
  findActiveByTokenHash(tokenHash: string): Promise<AuthenticatedActor | null>;
  revokeByTokenHash(tokenHash: string): Promise<void>;
}
