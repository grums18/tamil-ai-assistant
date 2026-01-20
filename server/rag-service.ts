import { invokeLLM } from "./_core/llm";
import { addRAGDocument, searchRAGDocuments, trackUsage } from "./db";

export interface Document {
  title: string;
  content: string;
  category?: string;
  source?: string;
  language: "tamil" | "tanglish" | "english" | "mixed";
}

export interface SearchResult {
  title: string;
  content: string;
  category?: string;
  source?: string;
  relevanceScore: number;
}

// Simple embedding function using LLM
// In production, use a dedicated embedding model like sentence-transformers
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // For now, return a simple hash-based embedding
    // In production, use a proper embedding model
    const embedding: number[] = [];
    const hash = text.split("").reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    // Generate 384-dimensional embedding (common for sentence-transformers)
    for (let i = 0; i < 384; i++) {
      embedding.push(Math.sin(hash * i) * Math.cos(hash + i));
    }

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Calculate cosine similarity between two embeddings
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function addDocument(document: Document): Promise<void> {
  try {
    // Generate embedding for the document
    const embedding = await generateEmbedding(document.content);

    // Store document with embedding
    await addRAGDocument(
      document.title,
      document.content,
      document.language,
      document.source,
      document.category,
      embedding
    );
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
}

export async function searchDocuments(
  query: string,
  category?: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar documents
    const documents = await searchRAGDocuments(category, limit * 2);

    if (!documents || documents.length === 0) {
      return [];
    }

    // Calculate similarity scores
    const scored = documents.map((doc: any) => ({
      ...doc,
      relevanceScore: doc.embedding ? cosineSimilarity(queryEmbedding, doc.embedding) : 0,
    }));

    // Sort by relevance and return top results
    return scored
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map((doc: any) => ({
        title: doc.title,
        content: doc.content,
        category: doc.category,
        source: doc.source,
        relevanceScore: doc.relevanceScore,
      }));
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error;
  }
}

export async function generateRAGResponse(
  query: string,
  category?: string
): Promise<string> {
  try {
    // Search for relevant documents
    const relevantDocs = await searchDocuments(query, category, 5);

    if (relevantDocs.length === 0) {
      // Fallback to LLM without RAG
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a helpful Tamil content creation assistant. Provide helpful information about YouTube content creation.",
          },
          {
            role: "user",
            content: query,
          },
        ],
      });

      return typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : "Unable to generate response";
    }

    // Build context from relevant documents
    const context = relevantDocs
      .map((doc, idx) => `[Source ${idx + 1}: ${doc.title}]\n${doc.content}`)
      .join("\n\n");

    // Generate response with RAG context
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a helpful Tamil content creation assistant. Use the provided context to answer questions accurately. 
          
Context:
${context}

Instructions:
- Answer based on the provided context
- If context doesn't contain relevant information, say so
- Always cite sources when using context
- Provide helpful, actionable advice for Tamil YouTube creators`,
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    return typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "Unable to generate response";
  } catch (error) {
    console.error("Error generating RAG response:", error);
    throw error;
  }
}

export async function initializeKnowledgeBase(): Promise<void> {
  try {
    // Initialize with sample Tamil content creation knowledge
    const sampleDocuments: Document[] = [
      {
        title: "YouTube SEO Best Practices for Tamil Creators",
        content: `Tamil YouTube creators should focus on:
1. Using Tamil keywords in titles and descriptions
2. Adding Tamil subtitles for better reach
3. Creating engaging thumbnails with Tamil text
4. Using trending Tamil hashtags
5. Optimizing video length (10-15 minutes for tutorials, 5-10 for entertainment)
6. Consistent upload schedule
7. Engaging with Tamil YouTube community`,
        category: "seo",
        language: "tamil",
        source: "YouTube Best Practices",
      },
      {
        title: "Tamil Content Trends 2024",
        content: `Popular Tamil content categories:
1. Educational content (tutorials, how-to videos)
2. Entertainment (comedy, skits, pranks)
3. Lifestyle (vlogs, daily routines)
4. Technology reviews in Tamil
5. Tamil music and performances
6. Cooking and recipes
7. Motivational content
8. News and current affairs`,
        category: "trends",
        language: "tamil",
        source: "Content Analytics",
      },
      {
        title: "Script Writing Tips for Tamil Videos",
        content: `Effective Tamil video scripts should:
1. Start with a strong hook (first 5 seconds crucial)
2. Use conversational Tamil language
3. Include natural transitions
4. Have clear call-to-action
5. Balance entertainment and information
6. Use code-switching (Tamil + English) naturally
7. Include pacing for visual elements
8. End with engagement prompts`,
        category: "scripting",
        language: "tamil",
        source: "Content Creation Guide",
      },
    ];

    // Add sample documents to knowledge base
    for (const doc of sampleDocuments) {
      await addDocument(doc);
    }

    console.log("Knowledge base initialized with sample documents");
  } catch (error) {
    console.error("Error initializing knowledge base:", error);
    // Don't throw - this is optional initialization
  }
}
