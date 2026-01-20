import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface TTSPlayerProps {
  text: string;
  contentType?: "script" | "description" | "thumbnail" | "seo";
  autoPlay?: boolean;
}

export function TTSPlayer({ text, contentType = "script", autoPlay = false }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [voiceId, setVoiceId] = useState("tamil-female");
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudioMutation = trpc.tts.generateContentAudio.useMutation();
  const { data: voices } = trpc.tts.getVoices.useQuery();

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast.error("No text to convert to speech");
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateAudioMutation.mutateAsync({
        content: text,
        contentType,
        voiceId,
      });

      if (audioRef.current) {
        audioRef.current.src = result.audioUrl;
        if (autoPlay) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }

      toast.success("Audio generated successfully!");
    } catch (error) {
      toast.error("Failed to generate audio");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div className="space-y-4 bg-slate-700 p-4 rounded-lg">
      <audio ref={audioRef} />

      <div className="flex gap-2">
        <Button
          onClick={handleGenerateAudio}
          disabled={isGenerating || !text.trim()}
          className="bg-blue-600 hover:bg-blue-700 flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              Generate Audio
            </>
          )}
        </Button>

        <Button
          onClick={handlePlayPause}
          disabled={!audioRef.current?.src}
          variant="outline"
          className="border-slate-600"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Voice</label>
        <Select value={voiceId} onValueChange={setVoiceId}>
          <SelectTrigger className="bg-slate-600 border-slate-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {voices?.voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Speed</label>
          <span className="text-sm text-slate-400">{speed.toFixed(1)}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={handleSpeedChange}
          min={0.5}
          max={2.0}
          step={0.1}
          className="w-full"
        />
      </div>
    </div>
  );
}
