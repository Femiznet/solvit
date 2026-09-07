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

function writeErrorLog(fileName: string, error: unknown): void {
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
        
        // Skip if it's a raw path instead of a function name
        if (fnName.includes(":\\") || fnName.includes("/")) {
          continue;
        }

        // Extract just the line number if present
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

export type SafeActionResult<T> = 
  | { success: true, data: T } | { success: false; error: string }

export async function safeAction<T extends object>(
  fn: () => Promise<T>,
  fallbackErrorMsg: string,
  fileName: string = "actions-errors.log"
): Promise<SafeActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: unknown) {
    // If it's a known user-facing error, return the message directly (no file log)
    if (err instanceof ClientError) {
      return { success: false, error: err.message };
    }

    if (err instanceof DrizzleQueryError) {
      writeErrorLog(fileName, err);
      return { success: false, error: fallbackErrorMsg };
    }

    // Otherwise, it's an unexpected server crash—log it and re-throw
    writeErrorLog(fileName, err);
    throw err;
  }
}

export function logServerError(
  error: unknown,
  fileName: string = "server-errors.log"
) {
  writeErrorLog(fileName, error);

  return "Server Error";
}