import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { surahs } from "@/data/quran";
import { Input } from "@/components/ui/input";
import { BookOpen, Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useSuwar } from "@/services/api";

const QuranSurahList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: apiSurahs, isLoading } = useSuwar();
  const [combinedSurahs, setCombinedSurahs] = useState<any[]>([]);
  
  useEffect(() => {
    if (apiSurahs) {
      const combined = surahs.map(localSurah => {
        const apiSurah = apiSurahs.find(s => s.id === localSurah.id);
        return {
          ...localSurah,
          ayahs: apiSurah?.ayat || localSurah.ayahs,
          startPage: apiSurah?.start_page,
          endPage: apiSurah?.end_page,
        };
      });
      setCombinedSurahs(combined);
    } else {
      setCombinedSurahs(surahs);
    }
  }, [apiSurahs]);

  const filteredSurahs = combinedSurahs.filter(surah => 
    surah.arabicName.includes(searchQuery) || 
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.id.toString().includes(searchQuery)
  );

  const handleSurahClick = (surah: typeof surahs[0]) => {
    toast({
      title: `سورة ${surah.arabicName}`,
      description: `جاري فتح سورة ${surah.arabicName}`,
      duration: 2000,
    });
    
    navigate(`/quran/surah/${surah.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="البحث عن سورة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 text-right"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="animate-spin" />
          <span className="mr-2">جاري تحميل السور...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => (
            <Card
              key={surah.id}
              className="hover:shadow-md transition-all cursor-pointer hover:bg-islamic-light/10 dark:hover:bg-islamic-dark/20"
              onClick={() => handleSurahClick(surah)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-islamic-light dark:bg-islamic-dark/20 flex items-center justify-center">
                  <span className="text-sm">{surah.id}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold arabic-text">{surah.arabicName}</span>
                  <span className="text-xs text-gray-500">{surah.ayahs} آية • {surah.type === "meccan" ? "مكية" : "مدنية"}</span>
                  {surah.startPage && surah.endPage && (
                    <span className="text-xs text-gray-500">صفحة {surah.startPage}-{surah.endPage}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuranSurahList;
