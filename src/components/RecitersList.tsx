import React, { useState } from "react";
import { useReciters, useRiwayat, useSuwar } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";

const RecitersList = () => {
  const [language, setLanguage] = useState<string>("");
  const [reciterId, setReciterId] = useState<number | undefined>();
  const [rewaya, setRewaya] = useState<number | undefined>();
  const [surah, setSurah] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: reciters, isLoading, refetch } = useReciters({
    language,
    reciter_id: reciterId,
    rewaya,
    surah,
  });

  const { data: riwayatList, isLoading: isLoadingRiwayat } = useRiwayat();
  const { data: suwarList, isLoading: isLoadingSuwar } = useSuwar();

  const handleApplyFilters = () => {
    refetch();
  };

  const handleClearFilters = () => {
    setLanguage("");
    setReciterId(undefined);
    setRewaya(undefined);
    setSurah(undefined);
    refetch();
  };

  const filteredReciters = reciters?.filter(reciter => 
    reciter.name.includes(searchQuery) || 
    searchQuery === ""
  ) || [];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-right">القراء</h2>
        
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="البحث عن قارئ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 text-right mb-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <Select
              value={language}
              onValueChange={setLanguage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل اللغات</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">الإنجليزية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={rewaya?.toString() || "all"}
              onValueChange={(value) => setRewaya(value !== "all" ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="الرواية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الروايات</SelectItem>
                {!isLoadingRiwayat && riwayatList?.map((riwayah) => (
                  <SelectItem key={riwayah.id} value={riwayah.id.toString()}>
                    {riwayah.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <Select
              value={surah?.toString() || "all"}
              onValueChange={(value) => setSurah(value !== "all" ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="السورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل السور</SelectItem>
                {!isLoadingSuwar && suwarList?.map((surah) => (
                  <SelectItem key={surah.id} value={surah.id.toString()}>
                    {surah.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={handleApplyFilters}
          >
            تطبيق
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleClearFilters}
          >
            مسح
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="animate-spin" />
          <span className="mr-2">جاري تحميل القراء...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredReciters.length > 0 ? (
            filteredReciters.map((reciter) => (
              <Card
                key={reciter.id}
                className="hover:shadow-md transition-all cursor-pointer hover:bg-islamic-light/10 dark:hover:bg-islamic-dark/20"
              >
                <CardContent className="p-3">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold arabic-text">{reciter.name}</span>
                    <span className="text-xs text-gray-500">
                      {reciter.moshaf.length} مصحف متاح
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-lg">لا يوجد قراء مطابقين للبحث</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecitersList;
