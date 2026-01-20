import { transcribeAudio } from "./_core/voiceTranscription";
import { saveAudioRecording, addMessage, trackUsage } from "./db";
import { storagePut } from "./storage";

export interface TranscriptionResult {
  text: string;
  language: string;
  duration?: number;
  confidence?: number;
}

export async function transcribeVoiceInput(
  userId: number,
  audioUrl: string,
  language: "tamil" | "tanglish" | "english" | "mixed" = "tamil",
  fileName?: string,
  conversationId?: number
): Promise<TranscriptionResult> {
  try {
    // Call Whisper API for transcription
    const result = await transcribeAudio({
      audioUrl,
      language: language === "tamil" ? "ta" : language === "english" ? "en" : undefined,
      prompt: "This is a Tamil YouTube content creator speaking about their video ideas and content.",
    });

    // Type assertion for result
    const whisperResult = result as any;
    
    // Check if result is an error
    if (whisperResult.error) {
      throw new Error(`Transcription failed: ${whisperResult.error}`);
    }

    // Determine detected language
    const detectedLanguage = whisperResult.language || language;
    const transcribedText = whisperResult.text || "";

    // Upload audio to S3 first
    const recordingFileName = fileName || `recording-${Date.now()}.wav`;
    let s3Url = audioUrl;
    
    try {
      // Convert base64 data URL to buffer if needed
      let audioBuffer: Buffer;
      if (audioUrl.startsWith('data:')) {
        // Extract base64 from data URL
        const base64Data = audioUrl.split(',')[1];
        audioBuffer = Buffer.from(base64Data, 'base64');
      } else {
        audioBuffer = Buffer.from('');
      }
      
      // Upload to S3 if we have buffer data
      if (audioBuffer.length > 0) {
        const storageKey = `audio/${userId}/${Date.now()}-${recordingFileName}`;
        const result = await storagePut(storageKey, audioBuffer, 'audio/wav');
        s3Url = result.url;
      }
    } catch (s3Error) {
      console.warn('Failed to upload audio to S3:', s3Error);
    }
    
    // Save audio recording to database with S3 URL
    await saveAudioRecording(
      userId,
      recordingFileName,
      s3Url,
      detectedLanguage as any,
      conversationId,
      undefined,
      undefined
    );

    // If conversation ID provided, add message to conversation
    if (conversationId) {
      await addMessage(conversationId, userId, "user", transcribedText, detectedLanguage as any, s3Url);
    }

    // Track usage
    const estimatedTokens = Math.ceil(transcribedText.length / 4);
    await trackUsage(userId, "voice_transcription", estimatedTokens, 0);

    return {
      text: transcribedText,
      language: detectedLanguage,
      duration: undefined,
      confidence: undefined,
    };
  } catch (error) {
    console.error("Error transcribing voice input:", error);
    throw error;
  }
}

export async function getUserAudioRecordings(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    const { getAudioRecordings } = await import("./db");
    return getAudioRecordings(userId, limit, offset);
  } catch (error) {
    console.error("Error fetching audio recordings:", error);
    throw error;
  }
}

export async function processVoiceCommand(
  userId: number,
  transcribedText: string,
  commandType: "chat" | "generate" | "search" = "chat"
): Promise<{
  command: string;
  parameters: Record<string, any>;
}> {
  try {
    // Parse voice command to extract intent and parameters
    // This is a simple implementation - can be enhanced with NLU

    const lowerText = transcribedText.toLowerCase();

    // Command patterns for content generation
    if (lowerText.includes("script") || lowerText.includes("generate script")) {
      const topicMatch = transcribedText.match(/(?:about|for|on)\s+(.+?)(?:\.|$)/i);
      return {
        command: "generate_script",
        parameters: {
          topic: topicMatch ? topicMatch[1] : transcribedText,
        },
      };
    }

    if (lowerText.includes("thumbnail") || lowerText.includes("ideas")) {
      const topicMatch = transcribedText.match(/(?:for|about)\s+(.+?)(?:\.|$)/i);
      return {
        command: "generate_thumbnails",
        parameters: {
          topic: topicMatch ? topicMatch[1] : transcribedText,
        },
      };
    }

    if (lowerText.includes("seo") || lowerText.includes("optimization")) {
      const topicMatch = transcribedText.match(/(?:for|about)\s+(.+?)(?:\.|$)/i);
      return {
        command: "generate_seo",
        parameters: {
          topic: topicMatch ? topicMatch[1] : transcribedText,
        },
      };
    }

    if (lowerText.includes("trend") || lowerText.includes("trending")) {
      const topicMatch = transcribedText.match(/(?:for|about)\s+(.+?)(?:\.|$)/i);
      return {
        command: "analyze_trends",
        parameters: {
          topic: topicMatch ? topicMatch[1] : transcribedText,
        },
      };
    }

    // Default to chat command
    return {
      command: "chat",
      parameters: {
        message: transcribedText,
      },
    };
  } catch (error) {
    console.error("Error processing voice command:", error);
    throw error;
  }
}
