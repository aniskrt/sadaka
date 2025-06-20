

export const getTranslationForFatihah = (verseNumber: number) => {
  const translations: { [key: number]: string } = {
    1: "In the name of Allah, the Most Gracious, the Most Merciful",
    2: "All praise is due to Allah, Lord of the worlds",
    3: "The Most Gracious, the Most Merciful",
    4: "Sovereign of the Day of Recompense",
    5: "It is You we worship and You we ask for help",
    6: "Guide us to the straight path",
    7: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray"
  };
  return translations[verseNumber] || "";
};

export interface Verse {
  id: number;
  text: string;
  translation?: string;
  page?: number;
  juz?: number;
}

export interface ApiVerse {
  id: number;
  text: string;
  page: number;
  juz: number;
  surah: number;
  page_number?: number;
  juz_number?: number;
}

// Helper to check if a verse is Basmala
export const isBasmala = (text: string): boolean => {
  return text.includes("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ") || text.includes("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ");
};

// Helper to remove Basmala from the beginning of verse text
export const removeBasmalaFromText = (text: string): string => {
  // Remove different variations of Basmala from the beginning of text
  const basmalas = [
    "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
  ];
  
  let cleanText = text.trim();
  
  // Try to remove each basmala pattern
  for (const basmala of basmalas) {
    if (cleanText.includes(basmala)) {
      // Remove the basmala and any extra spaces that might follow
      cleanText = cleanText.replace(basmala, "").trim();
      // Remove any remaining leading/trailing whitespace or special characters
      cleanText = cleanText.replace(/^[\s\u200F\u200E\u202A\u202B\u202C\u202D\u202E\uFEFF]+/, "").trim();
      break;
    }
  }
  
  return cleanText;
};

// Helper to format Arabic verse text properly
export const formatArabicText = (text: string): string => {
  return text.trim();
};

// Helper to get translations for any surah (can be expanded later)
export const getTranslationForVerse = (surahId: number, verseNumber: number): string => {
  if (surahId === 1) {
    return getTranslationForFatihah(verseNumber);
  }
  return "";
};

// Helper to filter verses and remove Basmala where appropriate
export const filterVersesBasmala = (verses: Verse[], surahId: number): Verse[] => {
  // For Al-Fatiha (surah 1), keep all verses including Basmala as first verse
  if (surahId === 1) {
    return verses;
  }

  // For At-Tawbah (surah 9), keep all verses (no Basmala anyway)
  if (surahId === 9) {
    return verses;
  }

  // For all other surahs, remove the first verse if it's Basmala
  if (verses.length > 0 && isBasmala(verses[0].text)) {
    return verses.slice(1);
  }

  return verses;
};

