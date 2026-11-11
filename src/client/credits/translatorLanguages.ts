import metadata from "resources/lang/metadata.json";

/** Use the language picker's native name and icon, with a readable fallback. */
export function translatorLanguage(englishName: string): {
  name: string;
  icon?: string;
} {
  const code = englishName === "German (Switzerland)" ? "de-CH" : undefined;
  const language = metadata.find((entry) =>
    code ? entry.code === code : entry.en === englishName,
  );
  return { name: language?.native ?? englishName, icon: language?.svg };
}
