
import React, { useState } from "react";
import { Search, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
}

interface SearchResponse {
  code: number;
  status: string;
  data: {
    count: number;
    matches: SearchResult[];
  };
}

interface SurahSearchProps {
  currentSurahNumber: number;
  currentSurahName: string;
  onVerseHighlight?: (verseNumber: number) => void;
}

const SurahSearch = ({ currentSurahNumber, currentSurahName, onVerseHighlight }: SurahSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [otherSurahs, setOtherSurahs] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة للبحث",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // البحث في السورة الحالية
      const currentSurahResponse = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/${currentSurahNumber}/quran-uthmani`
      );
      
      let currentSurahResults: SearchResult[] = [];
      if (currentSurahResponse.ok) {
        const currentData: SearchResponse = await currentSurahResponse.json();
        if (currentData.code === 200 && currentData.data.matches) {
          currentSurahResults = currentData.data.matches;
        }
      }

      // البحث في جميع السور الأخرى إذا لم توجد نتائج في السورة الحالية
      let allSurahsResults: SearchResult[] = [];
      if (currentSurahResults.length === 0) {
        const allSurahsResponse = await fetch(
          `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/quran-uthmani`
        );
        
        if (allSurahsResponse.ok) {
          const allData: SearchResponse = await allSurahsResponse.json();
          if (allData.code === 200 && allData.data.matches) {
            allSurahsResults = allData.data.matches.filter(match => match.surah.number !== currentSurahNumber);
          }
        }
      }

      setResults(currentSurahResults);
      setOtherSurahs(allSurahsResults);
      setShowResults(true);

      if (currentSurahResults.length > 0) {
        toast({
          title: "نتائج البحث",
          description: `تم العثور على ${currentSurahResults.length} نتيجة في سورة ${currentSurahName}`,
        });
      } else if (allSurahsResults.length > 0) {
        toast({
          title: "لا توجد نتائج في هذه السورة",
          description: `لكن تم العثور على ${allSurahsResults.length} نتيجة في سور أخرى`,
        });
      } else {
        toast({
          title: "لا توجد نتائج",
          description: "لم يتم العثور على نتائج للبحث في القرآن كله",
        });
      }
    } catch (error) {
      console.error("خطأ في البحث:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء البحث",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentSurahResultClick = (result: SearchResult) => {
    if (onVerseHighlight) {
      onVerseHighlight(result.numberInSurah);
    }
    toast({
      title: `الآية ${result.numberInSurah}`,
      description: `في سورة ${currentSurahName}`,
    });
  };

  const handleOtherSurahResultClick = (result: SearchResult) => {
    navigate(`/quran/surah/${result.surah.number}`);
    toast({
      title: `سورة ${result.surah.name}`,
      description: `الآية ${result.numberInSurah}`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-700"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={22} />
                <Input
                  type="text"
                  placeholder={`ابحث في سورة ${currentSurahName}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-14 py-4 rounded-xl border-0 bg-white/90 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all duration-300 text-lg text-right"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="rounded-xl px-8 py-4 font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Search size={20} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="space-y-6">
          {/* Results in Current Surah */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800 text-center">
                النتائج في سورة {currentSurahName} ({results.length})
              </h3>
              
              <div className="grid gap-4">
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-md hover:scale-[1.02]"
                    onClick={() => handleCurrentSurahResultClick(result)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {result.numberInSurah}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-xl leading-relaxed arabic-text text-gray-800 mb-3">
                            {result.text}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              صفحة {result.page}
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              جزء {result.juz}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results in Current Surah but Found in Others */}
          {results.length === 0 && otherSurahs.length > 0 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  لا توجد نتائج في سورة {currentSurahName}
                </h3>
                <p className="text-gray-600 mb-4">
                  ولكن تم العثور على {otherSurahs.length} نتيجة في سور أخرى
                </p>
              </div>

              <h4 className="text-xl font-bold text-gray-800 text-center">
                النتائج في السور الأخرى ({otherSurahs.length})
              </h4>
              
              <div className="grid gap-4">
                {otherSurahs.map((result, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-md hover:scale-[1.02]"
                    onClick={() => handleOtherSurahResultClick(result)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {result.surah.number}
                        </div>
                        <div className="flex-1 text-right">
                          <div className="mb-3">
                            <h4 className="font-bold text-lg text-gray-800 mb-1">
                              سورة {result.surah.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {result.surah.englishNameTranslation} - الآية {result.numberInSurah}
                            </p>
                          </div>
                          <p className="text-xl leading-relaxed arabic-text text-gray-800 mb-3">
                            {result.text}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              صفحة {result.page}
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              جزء {result.juz}
                            </span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <ArrowRight size={12} />
                              انتقال للسورة
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results Anywhere */}
          {results.length === 0 && otherSurahs.length === 0 && showResults && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">لم يتم العثور على نتائج</p>
              <p className="text-gray-500">جرب كلمات أخرى للبحث</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurahSearch;
