export function toKebab(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function toSpellId(name: string, source: string): string {
  return `${toKebab(name)}-${toKebab(source)}`;
}
