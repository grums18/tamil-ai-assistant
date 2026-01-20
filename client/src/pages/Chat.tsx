import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Plus, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [language, setLanguage] = useState<"tamil" | "tanglish" | "mixed">("tamil");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startConversationMutation = trpc.chat.startConversation.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const { data: conversations } = trpc.chat.getConversations.useQuery({ limit: 20 });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStartConversation = async () => {
    try {
      setIsLoading(true);
      const result = await startConversationMutation.mutateAsync({
        initialMessage: inputValue || undefined,
        language,
      });
      setConversationId(result.conversationId);
      if (inputValue) {
        setMessages([{ role: "user", content: inputValue }]);
        setInputValue("");
      }
    } catch (error) {
      toast.error("Failed to start conversation");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return;

    try {
      setIsLoading(true);
      const userMessage: Message = { role: "user", content: inputValue };
      setMessages(prev => [...prev, userMessage]);
      setInputValue("");

      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        message: inputValue,
        language,
      });

      const assistantMessage: Message = { role: "assistant", content: result.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (conversationId) {
        handleSendMessage();
      } else if (inputValue.trim()) {
        handleStartConversation();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto h-screen flex gap-4 p-4">
        {/* Sidebar - Conversation History */}
        <div className="w-64 flex flex-col gap-4">
          <Button onClick={handleStartConversation} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-400 mb-2">Recent Conversations</p>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {conversations?.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setConversationId(conv.id);
                      setMessages([]);
                    }}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      conversationId === conv.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{conv.title || "Untitled"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Chat Messages */}
          <Card className="flex-1 bg-slate-800 border-slate-700 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && conversationId && (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Start typing to begin the conversation</p>
                    </div>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-100"
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
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </Card>

          {/* Input Area */}
          <div className="flex gap-2">
            <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tamil">Tamil</SelectItem>
                <SelectItem value="tanglish">Tanglish</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={conversationId ? "Type your message..." : "Start a new conversation..."}
              className="flex-1 bg-slate-800 border-slate-700 text-white"
              disabled={isLoading}
            />

            <Button
              onClick={conversationId ? handleSendMessage : handleStartConversation}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
