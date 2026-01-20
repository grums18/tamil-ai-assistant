import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Mic, Square, Play, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Recording {
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}

export default function VoiceInput() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [language, setLanguage] = useState<"tamil" | "tanglish" | "english" | "mixed">("tamil");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const transcribeMutation = trpc.voice.transcribe.useMutation();
  const { data: recordingHistory } = trpc.voice.getRecordings.useQuery({ limit: 10 });

  // Request microphone access
  useEffect(() => {
    const requestMicAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const duration = (Date.now() - startTimeRef.current) / 1000;
          const url = URL.createObjectURL(audioBlob);

          setRecordings(prev => [...prev, {
            blob: audioBlob,
            url,
            duration,
            timestamp: new Date(),
          }]);

          audioChunksRef.current = [];
        };
      } catch (error) {
        toast.error("Microphone access denied");
        console.error(error);
      }
    };

    requestMicAccess();
  }, []);

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAndTranscribe = async (recording: Recording, index: number) => {
    try {
      setIsTranscribing(true);

      // Upload audio to S3 (using manus-upload-file utility)
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        // Call transcribe API
        const result = await transcribeMutation.mutateAsync({
          audioUrl: dataUrl,
          language,
          fileName: `recording-${index}-${Date.now()}.wav`,
        });

        setTranscribedText(result.text);
        toast.success("Audio transcribed successfully!");
      };
      reader.readAsDataURL(recording.blob);
    } catch (error) {
      toast.error("Failed to transcribe audio");
      console.error(error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const deleteRecording = (index: number) => {
    setRecordings(prev => {
      const newRecordings = [...prev];
      URL.revokeObjectURL(newRecordings[index].url);
      newRecordings.splice(index, 1);
      return newRecordings;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Voice Input</h1>
          <p className="text-slate-400">Record Tamil audio and convert to text using Whisper ASR</p>
        </div>

        {/* Recording Section */}
        <Card className="mb-8 border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle>Record Audio</CardTitle>
            <CardDescription className="text-slate-400">Speak in Tamil to record your voice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tamil">Tamil</SelectItem>
                  <SelectItem value="tanglish">Tanglish</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recording Controls */}
            <div className="flex gap-4 justify-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span>Recording...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recordings List */}
        {recordings.length > 0 && (
          <Card className="mb-8 border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle>Recent Recordings ({recordings.length})</CardTitle>
              <CardDescription className="text-slate-400">Transcribe your recorded audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recordings.map((recording, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Recording {index + 1}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                      <span>{formatDuration(recording.duration)}</span>
                      <span>•</span>
                      <span>{recording.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const audio = new Audio(recording.url);
                        audio.play();
                      }}
                      variant="outline"
                      size="sm"
                      className="border-slate-600"
                    >
                      <Play className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() => uploadAndTranscribe(recording, index)}
                      disabled={isTranscribing}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          Transcribing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-1" />
                          Transcribe
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => deleteRecording(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Transcribed Text */}
        {transcribedText && (
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle>Transcribed Text</CardTitle>
              <CardDescription className="text-slate-400">Your voice has been converted to text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-700 p-4 rounded-lg mb-4">
                <p className="text-white whitespace-pre-wrap">{transcribedText}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(transcribedText);
                    toast.success("Copied to clipboard!");
                  }}
                  variant="outline"
                  className="border-slate-600"
                >
                  Copy Text
                </Button>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  Use in Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recording History */}
        {recordingHistory && recordingHistory.length > 0 && (
          <Card className="mt-8 border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle>Recording History</CardTitle>
              <CardDescription className="text-slate-400">Your uploaded recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recordingHistory.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between bg-slate-700 p-3 rounded text-sm">
                    <div>
                      <p className="font-medium">{record.fileName}</p>
                      <p className="text-slate-400">{new Date(record.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-xs bg-slate-600 px-2 py-1 rounded capitalize">
                      {record.language}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
