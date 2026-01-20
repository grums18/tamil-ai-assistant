import { invokeLLM } from "./_core/llm";
import { createConversation, addMessage, getMessages, getConversations } from "./db";

const SYSTEM_PROMPT = `You are a helpful Tamil AI assistant designed to help YouTube content creators. 
You support Tamil language, Tanglish (Tamil + English code-switching), and mixed language responses.
You are knowledgeable about YouTube content creation, trends, SEO, and Tamil digital culture.
Always respond in the user's preferred language when possible.
Be creative, helpful, and culturally aware of Tamil content creation ecosystem.`;

export async function generateChatResponse(
  userId: number,
  conversationId: number,
  userMessage: string,
  language: "tamil" | "tanglish" | "english" | "mixed" = "tamil"
): Promise<string> {
  try {
    // Get conversation history
    const messages = await getMessages(conversationId, 10);
    
    // Build message history for LLM
    const conversationHistory = messages.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Add current user message
    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Call LLM with conversation context
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...conversationHistory,
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const assistantMessage = typeof messageContent === "string" ? messageContent : "Sorry, I couldn't generate a response.";
    
    // Store assistant response
    await addMessage(conversationId, userId, "assistant", assistantMessage, language);

    return assistantMessage;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw error;
  }
}

export async function createNewConversation(
  userId: number,
  initialMessage?: string,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<{ conversationId: number; title: string }> {
  try {
    // Generate title from initial message if provided
    let title = "New Conversation";
    if (initialMessage && initialMessage.length > 0) {
      title = initialMessage.substring(0, 50) + (initialMessage.length > 50 ? "..." : "");
    }

    const result = await createConversation(userId, title, undefined, language);
    // Extract conversation ID from result
    const conversationId = (result as any)?.id;

    if (!conversationId) {
      throw new Error("Failed to create conversation: no ID returned");
    }

    return {
      conversationId,
      title,
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function getUserConversationHistory(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    return getConversations(userId, limit, offset);
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    throw error;
  }
}

export async function getConversationMessages(
  conversationId: number,
  limit: number = 100,
  offset: number = 0
): Promise<any[]> {
  try {
    return getMessages(conversationId, limit, offset);
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}
