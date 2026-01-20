import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Mic, Square, Play, Trash2, Copy, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRouter as useWouterRouter } from "wouter";
import { useState, useRef } from "react";

/**
 * Enhanced Voice Input Page with Better UX
 * Supports Tamil speech-to-text with Whisper API
 */
export default function VoiceInputEnhanced() {
  const { user, isAuthenticated } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [language, setLanguage] = useState<"tamil" | "tanglish" | "english" | "mixed">("tamil");
  const [currentRecording, setCurrentRecording] = useState<{
    blob: Blob;
    duration: number;
    timestamp: Date;
  } | null>(null);
  const [transcription, setTranscription] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const audioPlayRef = useRef<HTMLAudioElement | null>(null);

  const transcribeMutation = trpc.voice.transcribe.useMutation();
  const chatMutation = trpc.chat.sendMessage.useMutation();
  const [, router] = useWouterRouter() as any;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-xl text-slate-400">Please log in to use voice input.</p>
        </div>
      </div>
    );
  }

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        setCurrentRecording({
          blob: audioBlob,
          duration,
          timestamp: new Date(),
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Unable to access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const handleTranscribe = async () => {
    if (!currentRecording) {
      toast.error("No recording to transcribe");
      return;
    }

    try {
      setIsTranscribing(true);

      // Convert blob to base64 for API
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const audioUrl = base64Audio;

        try {
          const result = await transcribeMutation.mutateAsync({
            audioUrl,
            language,
          });

          setTranscription(result.text || "");
          toast.success("Transcription completed!");

          // Add to recordings list
          setRecordings((prev) => [
            {
              id: `rec-${Date.now()}`,
              transcription: result.text,
              language,
              duration: currentRecording.duration,
              timestamp: currentRecording.timestamp,
              audioUrl: base64Audio,
            },
            ...prev,
          ]);

          setCurrentRecording(null);
        } catch (error) {
          console.error("Transcription error:", error);
          toast.error("Failed to transcribe audio");
        } finally {
          setIsTranscribing(false);
        }
      };
      reader.readAsDataURL(currentRecording.blob);
    } catch (error) {
      console.error("Error during transcription:", error);
      toast.error("Error processing audio");
      setIsTranscribing(false);
    }
  };

  const handlePlayRecording = (audioUrl: string) => {
    if (audioPlayRef.current) {
      audioPlayRef.current.src = audioUrl;
      audioPlayRef.current.play();
      setPlayingId(audioUrl);
    }
  };

  const handleCopyTranscription = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((rec) => rec.id !== id));
    toast.success("Recording deleted");
  };

  const handleUseInChat = async (text: string) => {
    if (!text.trim()) {
      toast.error("No text to send to chat");
      return;
    }

    try {
      await chatMutation.mutateAsync({
        conversationId: 0,
        message: text,
        language,
      });
      toast.success("Message sent to chat!");
      router("/chat");
    } catch (error) {
      console.error("Error sending to chat:", error);
      toast.error("Failed to send message to chat");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Voice Input</h1>
          <p className="text-slate-400">
            Record Tamil audio and get instant transcriptions using Whisper AI
          </p>
        </div>

        {/* Recording Section */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Record Audio
                </h2>
                <p className="text-slate-400">
                  Language: {language.charAt(0).toUpperCase() + language.slice(1)}
                </p>
              </div>
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value as "tamil" | "tanglish" | "english" | "mixed"
                  )
                }
                className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
              >
                <option value="tamil">Tamil</option>
                <option value="tanglish">Tanglish</option>
                <option value="english">English</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Recording Controls */}
            <div className="flex gap-4">
              <Button
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                className={`flex-1 ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>

              {currentRecording && (
                <Button
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    "Transcribe"
                  )}
                </Button>
              )}
            </div>

            {/* Current Recording Info */}
            {currentRecording && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-300">
                  Recording Duration:{" "}
                  <span className="font-semibold">
                    {formatDuration(currentRecording.duration)}
                  </span>
                </p>
              </div>
            )}

            {/* Transcription Display */}
            {transcription && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Transcription
                  </h3>
                  <Button
                    onClick={() => handleCopyTranscription(transcription)}
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-white text-lg font-tamil mb-4">
                  {transcription}
                </p>
                <Button
                  onClick={() => handleUseInChat(transcription)}
                  disabled={chatMutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {chatMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending to Chat...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Use in Chat
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Recording History */}
        {recordings.length > 0 && (
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recording History
            </h2>
            <div className="space-y-3">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-1">
                        {rec.timestamp.toLocaleString()} • {rec.language} •{" "}
                        {formatDuration(rec.duration)}
                      </p>
                      <p className="text-white font-tamil">
                        {rec.transcription}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handlePlayRecording(rec.audioUrl)}
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleCopyTranscription(rec.transcription)}
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleUseInChat(rec.transcription)}
                      size="sm"
                      variant="ghost"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteRecording(rec.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioPlayRef} className="hidden" />
    </div>
  );
}
