
import React, { useState } from "react";
import { useRiwayat } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

const RiwayatList = () => {
  const { data: riwayat, isLoading } = useRiwayat();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRiwayat = riwayat?.filter(riwaya => 
    riwaya.name.includes(searchQuery) || 
    searchQuery === ""
  ) || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 text-right">الروايات</h2>
      
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="البحث عن رواية..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 text-right"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader className="animate-spin" />
          <span className="mr-2">جاري تحميل الروايات...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredRiwayat.length > 0 ? (
            filteredRiwayat.map((riwaya) => (
              <Card
                key={riwaya.id}
                className="hover:shadow-md transition-all cursor-pointer hover:bg-islamic-light/10 dark:hover:bg-islamic-dark/20"
              >
                <CardContent className="p-3">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold arabic-text">{riwaya.name}</span>
                    <span className="text-xs text-gray-500">
                      {riwaya.count} قارئ
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-lg">لا توجد روايات مطابقة للبحث</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiwayatList;
