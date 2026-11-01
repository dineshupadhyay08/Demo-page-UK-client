import { ApiError } from "@/server/core/errors";

export const roles = ["PATIENT", "PRACTITIONER", "ADMINISTRATOR"] as const;
export type Role = (typeof roles)[number];

export const permissions = [
  "appointment:read:own",
  "appointment:read:any",
  "appointment:manage",
  "course:access:own",
  "course:manage",
  "admin:manage",
] as const;
export type Permission = (typeof permissions)[number];

export type AuthenticatedActor = Readonly<{
  userId: string;
  role: Role;
  sessionId: string;
}>;

const permissionsByRole: Readonly<Record<Role, readonly Permission[]>> = {
  PATIENT: ["appointment:read:own", "course:access:own"],
  PRACTITIONER: ["appointment:read:any", "appointment:manage"],
  ADMINISTRATOR: [
    "appointment:read:any",
    "appointment:manage",
    "course:manage",
    "admin:manage",
  ],
};

function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}

export function isAuthenticatedActor(actor: unknown): actor is AuthenticatedActor {
  if (!actor || typeof actor !== "object") return false;

  const candidate = actor as Record<string, unknown>;
  return (
    typeof candidate["userId"] === "string" &&
    candidate["userId"].length > 0 &&
    typeof candidate["sessionId"] === "string" &&
    candidate["sessionId"].length > 0 &&
    isRole(candidate["role"])
  );
}

export function hasPermission(actor: unknown, permission: Permission): boolean {
  return isAuthenticatedActor(actor) && permissionsByRole[actor.role].includes(permission);
}

export function requireAuthentication(actor: unknown): AuthenticatedActor {
  if (!isAuthenticatedActor(actor)) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
  }

  return actor;
}

export function requirePermission(
  actor: unknown,
  permission: Permission,
): AuthenticatedActor {
  const authenticatedActor = requireAuthentication(actor);
  if (!hasPermission(authenticatedActor, permission)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action.");
  }

  return authenticatedActor;
}
