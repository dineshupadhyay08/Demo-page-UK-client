import { Prisma } from "@prisma/client";

export type DatabaseErrorCategory =
  | "database-authentication"
  | "database-configuration"
  | "database-connectivity"
  | "database-permission"
  | "database-schema"
  | "database-timeout"
  | "database-transaction"
  | "database-tls"
  | "database-unknown";

export type DatabaseErrorDiagnostic = Readonly<{
  category: DatabaseErrorCategory;
  errorName: string;
  prismaCode?: string | undefined;
  transactionReason?: "acquisition-timeout" | "expired" | "unclassified";
  transactionDetail?: string;
}>;

function errorText(error: unknown): string {
  if (!(error instanceof Error)) return "";
  const cause = error.cause instanceof Error ? error.cause.message : "";
  return `${error.message} ${cause}`;
}

export function databaseErrorDiagnostic(error: unknown): DatabaseErrorDiagnostic {
  const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code
    : error instanceof Prisma.PrismaClientInitializationError ? error.errorCode : undefined;
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const text = `${prismaCode ?? ""} ${errorText(error)}`;

  if (prismaCode === "P2028" && error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2028 covers several transaction errors. Inspect metadata, but never log it.
    const detail = typeof error.meta?.["error"] === "string" ? error.meta["error"] : error.message;
    // Extract only recognised Prisma-generated prose. Raw messages can contain
    // query arguments, patient values, connection URLs or transaction identifiers.
    const transactionDetail = detail.match(/Unable to start a transaction in the given time\.?/i)?.[0]
      ?? detail.match(/Transaction already closed: (?:A query|A commit) cannot be executed on an expired transaction\.(?: The timeout for this transaction was \d+ ms, however \d+ ms passed since the start of the transaction\.)?/i)?.[0]
      ?? "Unrecognised transaction details redacted.";
    const transactionReason = /Unable to start a transaction in the given time/i.test(detail)
      ? "acquisition-timeout"
      : typeof detail === "string" && /expired transaction|transaction.*expired/i.test(detail)
        ? "expired" : "unclassified";
    return { category: transactionReason === "unclassified" ? "database-transaction" : "database-timeout",
      errorName, prismaCode, transactionReason, transactionDetail };
  }

  let category: DatabaseErrorCategory = "database-unknown";
  if (errorName === "AvailabilityLookupTimeoutError" || /P1002|P1008|P2024|timeout/i.test(text)) {
    category = "database-timeout";
  } else if (/P1000|authentication|password|SCRAM/i.test(text)) {
    category = "database-authentication";
  } else if (/P1001|P1017|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|reach database/i.test(text)) {
    category = "database-connectivity";
  } else if (/P1011|certificate|TLS|SSL/i.test(text)) {
    category = "database-tls";
  } else if (/P1013|connection string|invalid.*url/i.test(text)) {
    category = "database-configuration";
  } else if (/P1010|permission denied/i.test(text)) {
    category = "database-permission";
  } else if (/P2021|P2022|does not exist|column .* does not exist/i.test(text)) {
    category = "database-schema";
  }

  return { category, errorName, ...(prismaCode ? { prismaCode } : {}) };
}

export function isDatabaseAvailabilityFailure(category: DatabaseErrorCategory): boolean {
  return category !== "database-unknown";
}
