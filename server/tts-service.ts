import { trackUsage } from "./db";

export interface TTSOptions {
  text: string;
  language?: "tamil" | "tanglish" | "english" | "mixed";
  voiceId?: string;
  speed?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 2.0
}

export interface TTSResult {
  audioUrl: string;
  duration: number;
  format: string;
}

// Mock TTS implementation
// In production, integrate with actual TTS service (Google Cloud TTS, Azure TTS, etc.)
export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  try {
    const { text, language = "tamil", voiceId = "tamil-female", speed = 1.0, pitch = 1.0 } = options;

    // Validate input
    if (!text || text.length === 0) {
      throw new Error("Text cannot be empty");
    }

    if (text.length > 5000) {
      throw new Error("Text exceeds maximum length of 5000 characters");
    }

    // Calculate estimated duration (rough approximation)
    // Average speaking rate: 150 words per minute
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60 * (1 / speed);

    // In production, call actual TTS API
    // For now, return a mock audio URL
    const audioUrl = `data:audio/wav;base64,${Buffer.from(text).toString("base64")}`;

    return {
      audioUrl,
      duration: estimatedDuration,
      format: "wav",
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}

export async function generateScriptAudio(
  scriptContent: string,
  voiceId: string = "tamil-female",
  speed: number = 1.0
): Promise<TTSResult> {
  try {
    // Remove markdown formatting and special characters
    const cleanedText = scriptContent
      .replace(/\[.*?\]/g, "") // Remove [visual descriptions]
      .replace(/#+\s/g, "") // Remove markdown headers
      .replace(/\*\*/g, "") // Remove bold markers
      .trim();

    return generateSpeech({
      text: cleanedText,
      language: "tamil",
      voiceId,
      speed,
    });
  } catch (error) {
    console.error("Error generating script audio:", error);
    throw error;
  }
}

export async function generateContentAudio(
  content: string,
  contentType: "script" | "description" | "thumbnail" | "seo" = "script",
  voiceId: string = "tamil-female"
): Promise<TTSResult> {
  try {
    let speed = 1.0;

    // Adjust speed based on content type
    switch (contentType) {
      case "script":
        speed = 1.0; // Normal speed for scripts
        break;
      case "description":
        speed = 1.1; // Slightly faster for descriptions
        break;
      case "thumbnail":
        speed = 1.2; // Faster for short text
        break;
      case "seo":
        speed = 1.0; // Normal speed for SEO content
        break;
    }

    return generateScriptAudio(content, voiceId, speed);
  } catch (error) {
    console.error("Error generating content audio:", error);
    throw error;
  }
}

export function getAvailableVoices(): Array<{
  id: string;
  name: string;
  language: string;
  gender: string;
}> {
  return [
    { id: "tamil-female", name: "Tamil Female", language: "tamil", gender: "female" },
    { id: "tamil-male", name: "Tamil Male", language: "tamil", gender: "male" },
    { id: "tamil-child", name: "Tamil Child", language: "tamil", gender: "child" },
    { id: "tanglish-female", name: "Tanglish Female", language: "tanglish", gender: "female" },
    { id: "tanglish-male", name: "Tanglish Male", language: "tanglish", gender: "male" },
  ];
}

export async function generateBulkAudio(
  contents: Array<{ text: string; voiceId?: string; speed?: number }>
): Promise<TTSResult[]> {
  try {
    const results = await Promise.all(
      contents.map(content =>
        generateSpeech({
          text: content.text,
          voiceId: content.voiceId,
          speed: content.speed,
        })
      )
    );

    return results;
  } catch (error) {
    console.error("Error generating bulk audio:", error);
    throw error;
  }
}
