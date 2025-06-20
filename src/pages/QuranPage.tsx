import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BookOpen, Star, Search, Volume2, Heart, Bookmark, Sparkles } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useQuranApiChapters } from "@/services/api/quranApiService";
import QuranSearch from "@/components/quran/QuranSearch";

const QuranPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentView, setCurrentView] = useState<"chapters" | "search">("chapters");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuranApiChapters();

  const chapters = data?.chapters || [];

  const filteredChapters = chapters.filter(chapter => 
    chapter.name_arabic.includes(searchQuery) || 
    chapter.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.id.toString().includes(searchQuery)
  );

  const handleChapterClick = (chapter: any) => {
    toast({
      title: `سورة ${chapter.name_arabic}`,
      description: `جاري فتح ${chapter.translated_name.name}`,
      duration: 2000,
    });
    navigate(`/quran/surah/${chapter.id}`);
  };

  const dailyVerse = {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    translation: "And when My servants ask you concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    surah: "البقرة",
    ayah: "186"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Modern Floating Header */}
      <div className="relative">
        {/* Background with animated gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-pink-500/20 to-orange-500/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-10 left-1/3 w-16 h-16 bg-blue-300/20 rounded-full blur-lg animate-pulse animation-delay-2000"></div>
        
        <div className="relative z-10 px-6 py-10">
          <div className="max-w-6xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="group flex items-center gap-3 text-white/90 hover:text-white transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <ChevronRight size={20} />
                </div>
                <span className="font-medium text-lg">العودة</span>
              </Link>
              
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="text-yellow-300 animate-pulse" size={28} />
                  <h1 className="text-4xl font-bold arabic-text bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                    القرآن الكريم
                  </h1>
                  <Sparkles className="text-yellow-300 animate-pulse animation-delay-2000" size={28} />
                </div>
                <p className="text-white/80 text-lg font-medium">هدى ونور للعالمين</p>
              </div>
              
              <div className="w-20"></div>
            </div>

            {/* Daily Verse Card - Ultra Modern */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
                <div className="text-center text-white">
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Star className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold arabic-text bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                      آية اليوم
                    </h2>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <BookOpen className="text-white" size={24} />
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                    <p className="text-right arabic-text text-2xl leading-relaxed mb-6 max-w-4xl mx-auto font-medium">
                      {dailyVerse.arabic}
                    </p>
                  </div>
                  
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-6"></div>
                  
                  <p className="text-white/90 italic leading-relaxed mb-6 max-w-3xl mx-auto text-lg">
                    {dailyVerse.translation}
                  </p>
                  
                  <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                    <Heart className="text-red-300" size={18} />
                    <span className="font-medium">سورة {dailyVerse.surah} - آية {dailyVerse.ayah}</span>
                    <Bookmark className="text-blue-300" size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Navigation Tabs */}
        <div className="relative group mb-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={currentView === "chapters" ? "default" : "outline"}
                  onClick={() => setCurrentView("chapters")}
                  className="rounded-xl px-6 py-3 font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <BookOpen size={18} className="mr-2" />
                  السور
                </Button>
                <Button
                  variant={currentView === "search" ? "default" : "outline"}
                  onClick={() => setCurrentView("search")}
                  className="rounded-xl px-6 py-3 font-medium transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Search size={18} className="mr-2" />
                  البحث
                </Button>
              </div>
              
              {currentView === "chapters" && (
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-20"></div>
                    <div className="relative">
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500" size={22} />
                      <Input
                        type="text"
                        placeholder="ابحث عن السورة التي تريدها..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-14 py-4 rounded-xl border-0 bg-white/90 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all duration-300 text-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {currentView === "chapters" && (
                <div className="flex items-center gap-4">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    className="rounded-xl px-6 py-3 font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <BookOpen size={18} className="mr-2" />
                    شبكة
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className="rounded-xl px-6 py-3 font-medium transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Star size={18} className="mr-2" />
                    قائمة
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Based on Current View */}
        {currentView === "search" ? (
          <QuranSearch />
        ) : (
          /* Modern Chapters Display */
          <>
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-2000"></div>
                </div>
                <span className="mt-6 text-gray-600 text-lg font-medium">جاري تحميل السور الكريمة...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="text-red-400" size={40} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">خطأ في التحميل</h3>
                <p className="text-gray-500 text-lg">حدث خطأ أثناء تحميل السور</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1 max-w-4xl mx-auto"
              }`}>
                {filteredChapters.map((chapter, index) => (
                  <div key={chapter.id} className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
                    <Card
                      className="relative cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden"
                      onClick={() => handleChapterClick(chapter)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          {/* Modern Chapter Number */}
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                              <span className="text-white font-bold text-lg">{chapter.id}</span>
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                              <Sparkles size={12} className="text-white" />
                            </div>
                          </div>
                          
                          {/* Chapter Info */}
                          <div className="flex-1">
                            <h3 className="arabic-text font-bold text-gray-800 text-xl mb-2 group-hover:text-purple-700 transition-colors duration-300">
                              {chapter.name_arabic}
                            </h3>
                            <p className="text-gray-600 font-medium mb-2 group-hover:text-gray-700 transition-colors duration-300">
                              {chapter.translated_name.name}
                            </p>
                            <div className="flex items-center gap-3 text-gray-500 text-sm">
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                {chapter.verses_count} آية
                              </span>
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                {chapter.revelation_place === "makkah" ? "مكية" : "مدنية"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Icons */}
                          <div className="flex flex-col gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                              <ChevronRight className="text-purple-600 group-hover:text-white transition-colors duration-300" size={18} />
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 group-hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-sm">
                              <Volume2 className="text-blue-600 group-hover:text-white transition-colors duration-300" size={16} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {filteredChapters.length === 0 && !isLoading && !error && (
              <div className="text-center py-20">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Search className="text-gray-400" size={40} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">لا توجد نتائج</h3>
                <p className="text-gray-500 text-lg">لم يتم العثور على سور تطابق بحثك</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="pb-20">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default QuranPage;
