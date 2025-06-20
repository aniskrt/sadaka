import React, { useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Reciter } from "@/services/api/types";

interface AudioPlayerProps {
  reciters: Reciter[] | undefined;
  surahId: number;
  isLoading: boolean;
}

const AudioPlayer = ({ reciters, surahId, isLoading }: AudioPlayerProps) => {
  const [selectedReciterId, setSelectedReciterId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (reciters && reciters.length > 0 && !selectedReciterId) {
      setSelectedReciterId(reciters[0].id);
    }
  }, [reciters, selectedReciterId]);

  const handleReciterChange = (reciterId: string) => {
    const id = parseInt(reciterId);
    setSelectedReciterId(id);
    
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const handlePlaySurah = () => {
    if (!selectedReciterId) return;
    
    const reciter = reciters?.find(r => r.id === selectedReciterId);
    if (!reciter || reciter.moshaf.length === 0) return;
    
    const moshaf = reciter.moshaf[0];
    const surahPadded = surahId.toString().padStart(3, '0');
    const audioUrl = `${moshaf.server}/${surahPadded}.mp3`;
    
    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      
      const audio = new Audio(audioUrl);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  };

  if (!reciters || reciters.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePlaySurah}
              variant={isPlaying ? "default" : "outline"}
              disabled={!selectedReciterId}
              className="flex items-center gap-1"
            >
              {isPlaying ? (
                <>
                  <Pause size={16} />
                  <span>إيقاف</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>استماع</span>
                </>
              )}
            </Button>
            <div className="flex-1 mx-2">
              <Select
                value={selectedReciterId?.toString() || "none"}
                onValueChange={handleReciterChange}
              >
                <SelectTrigger className="w-full text-right">
                  <SelectValue placeholder="اختر القارئ" />
                </SelectTrigger>
                <SelectContent>
                  {reciters?.map((reciter) => (
                    <SelectItem key={reciter.id} value={reciter.id.toString()}>
                      {reciter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
