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

  let userSourceLine = "N/A";
  if (err.stack) {
    const stackLines: string[] = err.stack.split("\n");
    
    // Find the first relevant stack line that isn't safeAction or node_modules internals
    const foundLine = stackLines.find(
      (line) => 
        line.includes("at async ") && 
        !line.includes("safeAction") && 
        !line.includes("node_modules") &&
        !line.includes("file-logger")
    );

    if (foundLine) {
      // Extract function name and file/chunk reference
      const match = foundLine.match(/at async\s+([^\s]+)\s+\(([^)]+)\)/) || 
                    foundLine.match(/at\s+([^\s]+)\s+\(([^)]+)\)/);
      
      if (match) {
        const fnName = match[1];
        // Clean up the path to just show the chunk or file name with line number
        const rawPath = match[2].split("?")[0]; // remove query params if any
        const fileNameOnly = path.basename(rawPath);
        const lineColMatch = foundLine.match(/:(\d+):\d+\)?$/);
        const lineNum = lineColMatch ? `:${lineColMatch[1]}` : "";
        
        userSourceLine = `${fnName} (${fileNameOnly}${lineNum})`;
      } else {
        userSourceLine = foundLine.trim();
      }
    }
  }

  let logEntry = `[${timestamp}] ERROR\n`;
  logEntry += `  Source     : ${userSourceLine}\n`;

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
  | { success: true; data: T }
  | { success: false; error: string };

export async function safeAction<T>(
  fn: () => Promise<T>,
  fallbackMessage: string,
  fileName: string = "actions-errors.log"
): Promise<SafeActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: unknown) {
    writeErrorLog(fileName, error);
    return { success: false, error: fallbackMessage };
  }
}