import { z, ZodError } from "zod";

export function parseZodError(err: ZodError) {
    return z.treeifyError(err);
}