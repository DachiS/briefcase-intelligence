// src/lib/identity.ts
//
// Single source of truth for the pseudonymous OPERATIVE ID derived from a user's
// database id. It appears in the dashboard/navbar UI AND is baked into every PDF
// watermark, so the two MUST use the exact same derivation — otherwise a leaked
// issue's watermark no longer maps back to the account the user sees. Keep this
// the only definition; import it everywhere the operative ID is shown or stamped.

export function operativeId(id: string): string {
  return '0x' + id.slice(0, 3).toUpperCase() + '-' + id.slice(-3).toUpperCase()
}
