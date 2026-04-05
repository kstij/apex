export function isTermuxEnvironment(): boolean {
  const prefix = process.env["PREFIX"] ?? "";
  return (
    process.platform === "android" ||
    prefix.includes("com.termux") ||
    Boolean(process.env["TERMUX_VERSION"])
  );
}

export function isBunRuntime(): boolean {
  return Boolean(process.versions?.bun);
}

/**
 * OpenTUI currently relies on Bun-specific internals (`bun:ffi`) and Bun file
 * imports for syntax assets. That combination does not execute under pure Node
 * on Termux today.
 */
export function canRunOpenTuiRuntime(): boolean {
  if (isBunRuntime()) return true;
  if (isTermuxEnvironment()) return false;
  return true;
}
