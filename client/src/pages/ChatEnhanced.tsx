import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Mic, Keyboard } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import TamilKeyboard from "@/components/TamilKeyboard";

/**
 * Enhanced Chat Page with Tamil Keyboard and Voice Input
 */
export default function ChatEnhanced() {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState<"tamil" | "tanglish" | "mixed">("tamil");
  const [isLoading, setIsLoading] = useState(false);
  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch conversations
  const { data: conversationsData } = trpc.chat.getConversations.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  // Fetch messages for current conversation
  const { data: messagesData } = trpc.chat.getMessages.useQuery(
    { conversationId: currentConversationId || 0, limit: 100 },
    { enabled: !!currentConversationId }
  );

  // Mutations
  const startConversationMutation = trpc.chat.startConversation.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const transcribeMutation = trpc.voice.transcribe.useMutation();

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
      if (!currentConversationId && conversationsData.length > 0) {
        setCurrentConversationId(conversationsData[0].id);
      }
    }
  }, [conversationsData]);

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
      scrollToBottom();
    }
  }, [messagesData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartConversation = async () => {
    try {
      setIsLoading(true);
      const result = await startConversationMutation.mutateAsync({
        initialMessage: inputText || undefined,
        language,
      });
      setCurrentConversationId(result.conversationId);
      setInputText("");
      setMessages([]);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentConversationId) return;

    try {
      setIsLoading(true);
      const response = await sendMessageMutation.mutateAsync({
        conversationId: currentConversationId,
        message: inputText,
        language,
      });

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          conversationId: currentConversationId,
          userId: user?.id,
          role: "user",
          content: inputText,
          language,
          createdAt: new Date(),
        },
      ]);

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          conversationId: currentConversationId,
          userId: user?.id,
          role: "assistant",
          content: response.response,
          language,
          createdAt: new Date(),
        },
      ]);

      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        // Here you would call the transcribe API
        // For now, we'll just add a placeholder
        console.log("Audio ready for transcription");
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  const handleTamilKeyboardInput = (text: string) => {
    setInputText(text);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-400">Please log in to use the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar - Conversations */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <Button
            onClick={handleStartConversation}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setCurrentConversationId(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  currentConversationId === conv.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <p className="font-medium truncate">{conv.title}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {conv.messageCount} messages
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Tamil AI Chat</h2>
            <p className="text-sm text-slate-400">
              Language: {language.charAt(0).toUpperCase() + language.slice(1)}
            </p>
          </div>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as "tamil" | "tanglish" | "mixed")
            }
            className="px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
          >
            <option value="tamil">Tamil</option>
            <option value="tanglish">Tanglish</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (currentConversationId) {
                    handleSendMessage();
                  } else {
                    handleStartConversation();
                  }
                }
              }}
              placeholder="Type your message in Tamil or Tanglish..."
              className="flex-1 bg-slate-800 text-white border-slate-700"
              disabled={isLoading}
            />

            <Button
              onClick={() => setShowTamilKeyboard(!showTamilKeyboard)}
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Keyboard className="w-4 h-4" />
            </Button>

            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              variant="outline"
              size="icon"
              className={`${
                isRecording
                  ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Mic className="w-4 h-4" />
            </Button>

            <Button
              onClick={
                currentConversationId ? handleSendMessage : handleStartConversation
              }
              disabled={!inputText.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-slate-500">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Tamil Keyboard Modal */}
      <TamilKeyboard
        isOpen={showTamilKeyboard}
        onInput={handleTamilKeyboardInput}
        onClose={() => setShowTamilKeyboard(false)}
      />
    </div>
  );
}
