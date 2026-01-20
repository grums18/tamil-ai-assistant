import { describe, it, expect, beforeEach, vi } from "vitest";
import * as chatService from "./chat";
import * as db from "./db";

// Mock the database module
vi.mock("./db", () => ({
  createConversation: vi.fn(),
  addMessage: vi.fn(),
  getMessages: vi.fn(),
  getConversations: vi.fn(),
  getConversationById: vi.fn(),
}));

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "This is a test response.",
        },
      },
    ],
  }),
}));

describe("Chat Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNewConversation", () => {
    it("should create a new conversation with initial message", async () => {
      const mockConversation = {
        id: 1,
        userId: 1,
        title: "Test conversation",
        language: "tamil",
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createConversation).mockResolvedValue(mockConversation as any);

      const result = await chatService.createNewConversation(
        1,
        "Hello, how can I create better Tamil content?",
        "tamil"
      );

      expect(result.conversationId).toBe(1);
      expect(result.title).toContain("Hello");
      expect(db.createConversation).toHaveBeenCalledWith(
        1,
        expect.stringContaining("Hello"),
        undefined,
        "tamil"
      );
    });

    it("should create a conversation with default title if no initial message", async () => {
      const mockConversation = {
        id: 2,
        userId: 1,
        title: "New Conversation",
        language: "tamil",
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createConversation).mockResolvedValue(mockConversation as any);

      const result = await chatService.createNewConversation(1, undefined, "tamil");

      expect(result.conversationId).toBe(2);
      expect(result.title).toBe("New Conversation");
    });

    it("should throw error if conversation creation fails", async () => {
      vi.mocked(db.createConversation).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        chatService.createNewConversation(1, "Test", "tamil")
      ).rejects.toThrow("Database error");
    });
  });

  describe("generateChatResponse", () => {
    it("should generate response with conversation history", async () => {
      const mockMessages = [
        {
          id: 1,
          conversationId: 1,
          userId: 1,
          role: "user",
          content: "Previous message",
          language: "tamil",
          audioUrl: null,
          metadata: null,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getMessages).mockResolvedValue(mockMessages as any);
      vi.mocked(db.addMessage).mockResolvedValue(undefined);

      const response = await chatService.generateChatResponse(
        1,
        1,
        "How do I optimize for YouTube?",
        "tamil"
      );

      expect(response).toBe("This is a test response.");
      expect(db.getMessages).toHaveBeenCalledWith(1, 10);
      expect(db.addMessage).toHaveBeenCalledWith(
        1,
        1,
        "assistant",
        "This is a test response.",
        "tamil"
      );
    });

    it("should handle empty conversation history", async () => {
      vi.mocked(db.getMessages).mockResolvedValue([]);
      vi.mocked(db.addMessage).mockResolvedValue(undefined);

      const response = await chatService.generateChatResponse(
        1,
        1,
        "First message",
        "tamil"
      );

      expect(response).toBe("This is a test response.");
      expect(db.addMessage).toHaveBeenCalled();
    });

    it("should throw error if LLM call fails", async () => {
      vi.mocked(db.getMessages).mockResolvedValue([]);

      // Mock LLM to fail
      const { invokeLLM } = await import("./_core/llm");
      vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM API error"));

      await expect(
        chatService.generateChatResponse(1, 1, "Test", "tamil")
      ).rejects.toThrow("LLM API error");
    });
  });

  describe("getUserConversationHistory", () => {
    it("should retrieve conversation history with pagination", async () => {
      const mockConversations = [
        {
          id: 1,
          userId: 1,
          title: "First conversation",
          language: "tamil",
          messageCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          title: "Second conversation",
          language: "tanglish",
          messageCount: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getConversations).mockResolvedValue(mockConversations as any);

      const result = await chatService.getUserConversationHistory(1, 10, 0);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("First conversation");
      expect(db.getConversations).toHaveBeenCalledWith(1, 10, 0);
    });

    it("should handle empty conversation history", async () => {
      vi.mocked(db.getConversations).mockResolvedValue([]);

      const result = await chatService.getUserConversationHistory(1, 10, 0);

      expect(result).toHaveLength(0);
    });
  });

  describe("getConversationMessages", () => {
    it("should retrieve messages from a conversation", async () => {
      const mockMessages = [
        {
          id: 1,
          conversationId: 1,
          userId: 1,
          role: "user",
          content: "First message",
          language: "tamil",
          audioUrl: null,
          metadata: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          conversationId: 1,
          userId: 1,
          role: "assistant",
          content: "Assistant response",
          language: "tamil",
          audioUrl: null,
          metadata: null,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getMessages).mockResolvedValue(mockMessages as any);

      const result = await chatService.getConversationMessages(1, 100, 0);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe("user");
      expect(result[1].role).toBe("assistant");
      expect(db.getMessages).toHaveBeenCalledWith(1, 100, 0);
    });

    it("should handle empty message list", async () => {
      vi.mocked(db.getMessages).mockResolvedValue([]);

      const result = await chatService.getConversationMessages(1, 100, 0);

      expect(result).toHaveLength(0);
    });
  });
});
