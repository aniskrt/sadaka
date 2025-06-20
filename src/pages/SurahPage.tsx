
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { surahs } from "@/data/quran";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/BottomNavigation";
import { useSuwar, useReciters, useAyatTiming, useAllVerses } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import SurahHeader from "@/components/quran/SurahHeader";
import AudioPlayer from "@/components/quran/AudioPlayer";
import VersesList from "@/components/quran/VersesList";
import SurahPagination from "@/components/quran/SurahPagination";
import { ApiVerse, Verse, getTranslationForFatihah } from "@/components/quran/helpers";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const [surah, setSurah] = useState<typeof surahs[0] | undefined>(undefined);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const versesPerPage = 10;
  const { toast } = useToast();

  const surahId = id ? parseInt(id) : 0;
  const { data: apiSurahs } = useSuwar();
  const { data: reciters } = useReciters({ surah: surahId });
  const { data: ayatTimings, isLoading: isLoadingTimings } = useAyatTiming(
    0, // We're not using this directly in the refactored components
    surahId
  );
  
  const { data: quranpediaVerses, isLoading: isLoadingQuranpedia, isError: isQuranpediaError } = useAllVerses(surahId);

  useEffect(() => {
    if (id) {
      const surahId = parseInt(id);
      const foundSurah = surahs.find(s => s.id === surahId);
      if (foundSurah) {
        setSurah(foundSurah);
      }
    }
  }, [id]);

  useEffect(() => {
    setIsLoadingVerses(isLoadingQuranpedia);
    
    if (quranpediaVerses && Array.isArray(quranpediaVerses)) {
      const formattedVerses: Verse[] = quranpediaVerses.map((verse: ApiVerse) => ({
        id: verse.id,
        text: verse.text,
        translation: surahId === 1 ? getTranslationForFatihah(verse.id) : undefined
      }));
      
      setVerses(formattedVerses);
    } else if (isQuranpediaError || (!isLoadingQuranpedia && !quranpediaVerses)) {
      // Fallback to local data if API fails or returns unexpected format
      fallbackToLocalData(surahId);
    }
  }, [quranpediaVerses, isLoadingQuranpedia, isQuranpediaError, surahId]);

  const fallbackToLocalData = (surahId: number) => {
    // Import local data from quran.ts
    import('@/data/quran').then(({ quranVerses }) => {
      const localVerses = quranVerses[surahId] || [];
      
      const verses: Verse[] = localVerses.map((text, index) => ({
        id: index + 1,
        text: text,
        translation: surahId === 1 ? getTranslationForFatihah(index + 1) : undefined
      }));
      
      setVerses(verses);
      
      if (localVerses.length === 0) {
        toast({
          title: "خطأ في تحميل الآيات",
          description: "لم يتم العثور على الآيات لهذه السورة",
          variant: "destructive"
        });
      }
    });
  };

  const apiSurahInfo = apiSurahs?.find(s => s.id === surahId);
  
  const indexOfLastVerse = currentPage * versesPerPage;
  const indexOfFirstVerse = indexOfLastVerse - versesPerPage;
  const currentVerses = verses.slice(indexOfFirstVerse, indexOfLastVerse);
  const totalPages = Math.ceil(verses.length / versesPerPage);

  return (
    <div className="min-h-screen pb-16">
      <SurahHeader surah={surah} apiSurahInfo={apiSurahInfo} />
      
      <div className="container mx-auto px-4">
        {surah && (
          <>
            <AudioPlayer 
              reciters={reciters} 
              surahId={surahId} 
              isLoading={isLoadingTimings} 
            />
            
            <Card className="mb-6">
              <CardContent className="p-4">
                <VersesList 
                  verses={currentVerses} 
                  isLoading={isLoadingVerses} 
                />
                
                <SurahPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default SurahPage;
