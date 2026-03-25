import { spawn } from "child_process";

const NO_APP_MSG = "No app found to open file — set a default application";

async function runCommand(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: "ignore" });
    let resolved = false;

    proc.once("error", () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    });

    proc.once("close", (code) => {
      if (!resolved) {
        resolved = true;
        resolve(code === 0);
      }
    });
  });
}

/**
 * Open a file in the user's default OS application.
 * Returns "" on success, or an error message string on failure.
 */
export async function openFileInDefaultApp(filePath: string): Promise<string> {
  try {
    const platform = process.platform;
    let ok = false;

    if (platform === "darwin") {
      ok = await runCommand("open", [filePath]);
    } else if (platform === "win32") {
      ok = await runCommand("cmd", ["/c", "start", "", filePath]);
    } else {
      ok = await runCommand("xdg-open", [filePath]);
    }

    if (!ok) {
      return NO_APP_MSG;
    }
    return "";
  } catch {
    return NO_APP_MSG;
  }
}
