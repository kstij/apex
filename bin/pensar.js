#!/usr/bin/env node

import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, "..", "build", "cli.js");

process.argv = [process.argv[0], cliPath, ...process.argv.slice(2)];
await import(cliPath);
