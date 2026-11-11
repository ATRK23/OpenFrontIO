import metadata from "resources/lang/metadata.json";

/** Use the language picker's native names, keeping unknown headings readable. */
export function nativeTranslatorLanguage(englishName: string): string {
  const code = englishName === "German (Switzerland)" ? "de-CH" : undefined;
  return (
    metadata.find((language) =>
      code ? language.code === code : language.en === englishName,
    )?.native ?? englishName
  );
}
