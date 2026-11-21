import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const sibling = fileURLToPath(new URL("../../frontail", import.meta.url));

export const frontail = existsSync(sibling) ? { "@marthvon/frontail": sibling } : {};
