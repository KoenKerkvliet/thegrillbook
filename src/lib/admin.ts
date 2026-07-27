export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase().endsWith('@designpixels.nl'))
}
