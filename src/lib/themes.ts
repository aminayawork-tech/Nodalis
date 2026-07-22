import { db } from "./db";
import { slugify } from "./slug";

export async function upsertThemes(names: string[]) {
  const themes = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const slug = slugify(trimmed);
    const theme = await db.theme.upsert({
      where: { slug },
      update: {},
      create: { name: trimmed, slug },
    });
    themes.push(theme);
  }
  return themes;
}
