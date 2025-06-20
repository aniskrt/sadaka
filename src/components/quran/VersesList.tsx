
import React from "react";
import { Loader } from "lucide-react";

interface Verse {
  id: number;
  text: string;
  translation?: string;
}

interface VersesListProps {
  verses: Verse[];
  isLoading: boolean;
}

const VersesList = ({ verses, isLoading }: VersesListProps) => {
  // Function to check if a verse is Basmala
  const isBasmala = (text: string) => {
    return text.includes("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ") || text.includes("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="animate-spin" />
        <span className="mr-2">جاري تحميل الآيات...</span>
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg arabic-text">لا توجد آيات متاحة حالياً</p>
        <p className="text-sm text-gray-500 mt-2">يرجى المحاولة مرة أخرى لاحقاً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-right">
      {verses.map((verse, index) => {
        // Don't display Basmala as a verse (except for Al-Fatiha)
        // Since we don't have surah context here, we'll filter based on verse id and text
        const shouldSkipVerse = verse.id !== 1 && index === 0 && isBasmala(verse.text);
        
        if (shouldSkipVerse) {
          return null;
        }

        return (
          <div key={verse.id} className="relative pb-4 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
            <p className="text-xl leading-relaxed arabic-text mb-2">{verse.text}</p>
            {verse.translation && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{verse.translation}</p>
            )}
            <span className="absolute left-0 bottom-1 rounded-full w-6 h-6 bg-islamic-light dark:bg-islamic-dark/20 flex items-center justify-center text-xs">
              {verse.id}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default VersesList;
