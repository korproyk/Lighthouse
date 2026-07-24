// Lightweight local password hashing (SHA-256) for the on-device nickname
// accounts system. This is NOT a substitute for real server-side auth —
// there is no backend account system here, just a way to stop someone from
// casually reusing a nickname that already has saved progress on this device.
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
