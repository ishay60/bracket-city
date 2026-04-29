export function isAdminEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const workspace = env.WORKSPACE ?? env.NEXT_PUBLIC_WORKSPACE;
  return workspace === "local";
}
