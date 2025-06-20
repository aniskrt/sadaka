
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Surah } from "@/services/api/types";
import { surahs } from "@/data/quran";

interface SurahHeaderProps {
  surah: typeof surahs[0] | undefined;
  apiSurahInfo: Surah | undefined;
}

const SurahHeader = ({ surah, apiSurahInfo }: SurahHeaderProps) => {
  if (!surah) return null;

  return (
    <>
      <div className="islamic-gradient text-white p-6">
        <div className="flex items-center justify-between">
          <Link to="/quran" className="text-white">
            <ChevronRight />
          </Link>
          <h1 className="text-xl font-bold text-center flex-1 arabic-text">
            {`سورة ${surah.arabicName}`}
          </h1>
          <div className="w-5"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="inline-block rounded-full bg-islamic-light dark:bg-islamic-dark/20 p-4 mb-2">
            <span className="text-xl">{surah.id}</span>
          </div>
          <h2 className="text-2xl font-bold arabic-text">{surah.arabicName}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {surah.ayahs} آية • {surah.type === "meccan" ? "مكية" : "مدنية"}
          </p>
          {apiSurahInfo && (
            <p className="text-sm text-gray-500 mt-1">
              صفحة {apiSurahInfo.start_page} - {apiSurahInfo.end_page}
            </p>
          )}
          {surah.id !== 9 && (
            <div className="mt-4 p-4 border rounded-lg bg-islamic-light/10 dark:bg-islamic-dark/10">
              <p className="text-xl text-center arabic-text">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SurahHeader;
