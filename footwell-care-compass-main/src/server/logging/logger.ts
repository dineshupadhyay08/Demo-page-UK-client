export type LogLevel = "info" | "warn" | "error";

export type LogRecord = Readonly<{
  level: LogLevel;
  event: string;
  context: Record<string, unknown>;
}>;

export type LogSink = (record: LogRecord) => void;

const sensitiveKey = /(?:address|api[_-]?key|authorization|cookie|date.?of.?birth|dob|document|email|file|medical|message|name|note|password|phone|secret|session|signature|token)/i;
const redactedValue = "[REDACTED]";

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[TRUNCATED]";
  if (value instanceof Error) return { name: value.name, message: redactedValue };
  if (Array.isArray(value)) {
    return value.map((item) =>
      item && typeof item === "object" ? redactValue(item, depth + 1) : redactedValue,
    );
  }
  if (value && typeof value === "object") return redactContext(value as Record<string, unknown>, depth + 1);
  return value;
}

export function redactContext(context: Record<string, unknown>, depth = 0): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      sensitiveKey.test(key) ? redactedValue : redactValue(value, depth),
    ]),
  );
}

function consoleSink(record: LogRecord): void {
  const message = JSON.stringify(record);
  if (record.level === "error") console.error(message);
  else if (record.level === "warn") console.warn(message);
  else console.info(message);
}

export function createLogger(sink: LogSink = consoleSink) {
  return {
    info(event: string, context: Record<string, unknown> = {}) {
      sink({ level: "info", event, context: redactContext(context) });
    },
    warn(event: string, context: Record<string, unknown> = {}) {
      sink({ level: "warn", event, context: redactContext(context) });
    },
    error(event: string, context: Record<string, unknown> = {}) {
      sink({ level: "error", event, context: redactContext(context) });
    },
  };
}

export const logger = createLogger();
