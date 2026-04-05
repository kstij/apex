import readline from "readline";
import { spawn } from "child_process";

const MENU = [
  { key: "1", label: "Help", args: ["help"] },
  { key: "2", label: "Version", args: ["version"] },
  { key: "3", label: "Auth", args: ["auth"] },
  { key: "4", label: "Projects", args: ["projects"] },
  { key: "5", label: "Pentests", args: ["pentests"] },
  { key: "6", label: "Issues", args: ["issues"] },
  { key: "7", label: "Fixes", args: ["fixes"] },
  { key: "8", label: "Logs", args: ["logs"] },
  { key: "9", label: "Doctor", args: ["doctor"] },
  { key: "10", label: "Run custom command", args: [] as string[] },
  { key: "q", label: "Quit", args: [] as string[] },
] as const;

function clearScreen() {
  process.stdout.write("\x1Bc");
}

function printHeader() {
  clearScreen();
  console.log("Pensar Apex - Termux Node Compatibility Mode");
  console.log("================================================");
  console.log("OpenTUI on Node/Termux is not yet supported by upstream runtime.");
  console.log("This fallback keeps an interactive terminal workflow on mobile.");
  console.log("");
}

function printMenu() {
  for (const item of MENU) {
    console.log(`  [${item.key}] ${item.label}`);
  }
  console.log("");
}

function ask(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, (ans) => resolve(ans.trim())));
}

function splitArgs(input: string): string[] {
  return input
    .split(" ")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function runCliCommand(args: string[]): Promise<number> {
  const entry = process.argv[1];
  if (!entry) {
    console.error("Unable to resolve CLI entrypoint for command execution.");
    return 1;
  }

  const child = spawn(process.execPath, [...process.execArgv, entry, ...args], {
    stdio: "inherit",
    env: process.env,
  });

  return await new Promise((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

export async function runTermuxFallbackTui(): Promise<void> {
  if (!process.env["TERM"]) {
    process.env["TERM"] = "xterm-256color";
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      printHeader();
      printMenu();
      const input = (await ask(rl, "Choose an option: ")).toLowerCase();

      if (input === "q" || input === "quit" || input === "exit") {
        break;
      }

      const choice = MENU.find((m) => m.key === input);

      if (!choice) {
        console.log("\nUnknown choice. Press Enter to continue...");
        await ask(rl, "");
        continue;
      }

      let args: string[];
      if (choice.key === "10") {
        const command = await ask(
          rl,
          "Enter command (example: pentest --target https://example.com): ",
        );
        args = splitArgs(command);
      } else {
        args = [...choice.args];
      }

      if (args.length === 0) {
        console.log("\nNo command entered. Press Enter to continue...");
        await ask(rl, "");
        continue;
      }

      console.log("");
      const exitCode = await runCliCommand(args);
      console.log(`\nCommand exited with code ${exitCode}.`);
      await ask(rl, "Press Enter to return to menu...");
    }
  } finally {
    rl.close();
  }
}
