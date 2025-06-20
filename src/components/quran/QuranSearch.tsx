
import React, { useState } from "react";
import { Search, Loader2, BookOpen } from "lucide-react";
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

const QuranSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
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
      // Search in Arabic text (quran-uthmani edition)
      const response = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/quran-uthmani`
      );
      
      if (!response.ok) {
        throw new Error("فشل في البحث");
      }

      const data: SearchResponse = await response.json();
      
      if (data.code === 200 && data.data.matches) {
        setResults(data.data.matches);
        setShowResults(true);
        toast({
          title: "نتائج البحث",
          description: `تم العثور على ${data.data.count} نتيجة`,
        });
      } else {
        setResults([]);
        setShowResults(true);
        toast({
          title: "لا توجد نتائج",
          description: "لم يتم العثور على نتائج للبحث",
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

  const handleResultClick = (result: SearchResult) => {
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
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-700"></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" size={22} />
                <Input
                  type="text"
                  placeholder="ابحث في القرآن الكريم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-14 py-4 rounded-xl border-0 bg-white/90 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-green-400 focus:bg-white transition-all duration-300 text-lg text-right"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="rounded-xl px-8 py-4 font-medium transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105"
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
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 text-center">
            نتائج البحث ({results.length})
          </h3>
          
          {results.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">لم يتم العثور على نتائج</p>
              <p className="text-gray-500">جرب كلمات أخرى للبحث</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-md hover:scale-[1.02]"
                  onClick={() => handleResultClick(result)}
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
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {result.surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuranSearch;
