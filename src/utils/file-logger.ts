import { handleDbError } from "@/lib/db-error";
import { ClientError } from "@/lib/errors";
import { DrizzleQueryError } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface DbError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  table?: string;
  routine?: string;
  cause?: DbError;
}

function writeErrorLog(fileName: string, error: unknown, input?: unknown): void {
  const logDir = path.join(process.cwd(), "logs");
  const logFile = path.join(logDir, fileName);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const err = error as DbError;
  const dbError = err.cause || err;

  const cleanedSteps: string[] = [];
  if (err.stack) {
    const stackLines: string[] = err.stack.split("\n");

    for (const line of stackLines) {
      if (
        !line.includes("at ") ||
        line.includes("node_modules") ||
        line.includes("node:internal") ||
        line.includes("file-logger") ||
        line.includes("processTicksAndRejections")
      ) {
        continue;
      }

      const match = line.match(/at\s+(?:async\s+)?([^\s]+)/);

      if (match) {
        const fnName = match[1];

        if (fnName.includes(":\\") || fnName.includes("/")) {
          continue;
        }

        const lineColMatch = line.match(/:(\d+):\d+\)?$/);
        const lineNum = lineColMatch ? `:${lineColMatch[1]}` : "";

        cleanedSteps.push(`${fnName}${lineNum}`);
      }
    }
  }

  let logEntry = `[${timestamp}] ERROR\n`;
  logEntry += `  Source:\n`;

  if (cleanedSteps.length > 0) {
    const reversed = cleanedSteps.reverse();
    reversed.forEach((step, idx) => {
      const prefix = idx === 0 ? "    -> " : "       ";
      logEntry += `${prefix}${step}\n`;
    });
  } else {
    logEntry += `    N/A\n`;
  }

  // Include the input payload
  try {
    const formattedInput = typeof input === "string" ? input : JSON.stringify(input, null, 2);
    logEntry += `  Input      :\n${formattedInput
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")}\n`;
  } catch {
    logEntry += `  Input      : [Unserializable Input]\n`;
  }

  if (dbError.code) {
    logEntry += `  Type       : Database Error\n`;
    logEntry += `  Code       : ${dbError.code}\n`;
    logEntry += `  Constraint : ${dbError.constraint ?? "N/A"}\n`;
    logEntry += `  Detail     : ${dbError.detail ?? dbError.message}\n`;
    logEntry += `  Table      : ${dbError.table ?? "N/A"}\n`;
  } else {
    logEntry += `  Message    : ${err.message}\n`;
  }

  logEntry += `${"=".repeat(50)}\n\n`;
  fs.appendFileSync(logFile, logEntry, "utf-8");
}

// export type SafeActionResult<T> =
//   | { success: true; data: T }
//   | { success: false; error: string };

//   export async function safeAction<T extends object>(
//     fn: () => Promise<T>,
//     fallbackErrorMsg: string,
//     input?: unknown,
//     fileName: string = "actions-errors.log",
//     constraintErrors?: Record<string, string>
//   ): Promise<SafeActionResult<T>> {
//     try {
//       const data = await fn();
//       return { success: true, data };
//     } catch (err: unknown) {
//       // 1. If constraint mappings were provided, let handleDbError
//       //    translate matching database errors into a ClientError.
//       if (constraintErrors) {
//         try {
//           handleDbError(err, constraintErrors);
//         } catch (mappedErr) {
//           err = mappedErr; // If handleDbError threw a ClientError, capture it here
//         }
//       }

//       // 2. If it's a ClientError (either thrown by service or translated from a constraint), return it
//       if (err instanceof ClientError) {
//         return { success: false, error: err.message };
//       }

//       // 3. Otherwise, it's an unexpected server/database crash -> log it
//       writeErrorLog(fileName, err, input);

//       if (err instanceof DrizzleQueryError) {
//         return { success: false, error: fallbackErrorMsg };
//       }

//       throw err;
//     }
// }

export function logServerError(
  error: unknown,
  fileName: string = "server-errors.log",
  input?: unknown
) {
  writeErrorLog(fileName, error, input);

  return "Server Error";
}

interface DbError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  cause?: DbError;
}

export type SafeActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function safeAction<T>(
  fn: () => Promise<T>,
  fallbackErrorMsg: string,
  options?: {
    input?: unknown;
    fileName?: string;
    constraintErrors?: Record<string, string>;
  }
): Promise<SafeActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: unknown) {
    // 1. Check database constraints if provided
    if (options?.constraintErrors) {
      try {
        handleDbError(err, options.constraintErrors);
      } catch (mappedErr) {
        err = mappedErr;
      }
    }

    // 2. If it's a ClientError, return it cleanly
    if (err instanceof ClientError) {
      return { success: false, error: err.message };
    }

    // 3. Otherwise, log it as an unexpected server crash
    writeErrorLog(options?.fileName ?? "actions-errors.log", err, options?.input);

    if (err instanceof DrizzleQueryError) {
      return { success: false, error: fallbackErrorMsg };
    }

    throw err;
  }
}
