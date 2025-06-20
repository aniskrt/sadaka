
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const AfterPrayerReminder = () => {
  return (
    <Card className="mb-4 overflow-hidden">
      <div className="teal-gradient text-white p-3">
        <h2 className="text-lg font-bold text-center arabic-text">أذكار بعد الصلاة</h2>
      </div>
      <CardContent className="p-4">
        <p className="text-right arabic-text leading-relaxed">
          لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير
        </p>
      </CardContent>
    </Card>
  );
};

export default AfterPrayerReminder;
