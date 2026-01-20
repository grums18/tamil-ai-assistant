import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";

export interface UploadResult {
  key: string;
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface StorageMetadata {
  uploadedBy: number;
  uploadedAt: Date;
  fileSize: number;
  contentType: string;
  description?: string;
}

/**
 * Upload user audio recording to S3
 */
export async function uploadAudioRecording(
  userId: number,
  audioBuffer: Buffer,
  fileName: string,
  contentType: string = "audio/wav"
): Promise<UploadResult> {
  try {
    // Generate unique key with user ID and timestamp
    const uniqueId = nanoid(8);
    const storageKey = `audio/${userId}/${uniqueId}-${fileName}`;

    // Upload to S3
    const { key, url } = await storagePut(storageKey, audioBuffer, contentType);

    return {
      key,
      url,
      fileName,
      fileSize: audioBuffer.length,
      contentType,
    };
  } catch (error) {
    console.error("Error uploading audio recording:", error);
    throw error;
  }
}

/**
 * Upload generated content (scripts, etc.) to S3
 * Note: Content is stored in database, this uploads the file version
 */
export async function uploadGeneratedContent(
  userId: number,
  content: string,
  contentType: "script" | "thumbnail_ideas" | "seo_title" | "seo_description" | "trend_insight",
  topic: string,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<UploadResult> {
  try {
    // Generate unique key
    const uniqueId = nanoid(8);
    const fileName = `${contentType}-${topic.substring(0, 20)}-${uniqueId}.txt`;
    const storageKey = `content/${userId}/${contentType}/${fileName}`;

    // Upload to S3
    const { key, url } = await storagePut(storageKey, content, "text/plain");

    return {
      key,
      url,
      fileName,
      fileSize: content.length,
      contentType: "text/plain",
    };
  } catch (error) {
    console.error("Error uploading generated content:", error);
    throw error;
  }
}

/**
 * Upload user profile image or avatar
 */
export async function uploadProfileImage(
  userId: number,
  imageBuffer: Buffer,
  contentType: string = "image/jpeg"
): Promise<UploadResult> {
  try {
    // Generate unique key
    const uniqueId = nanoid(8);
    const fileName = `avatar-${uniqueId}.jpg`;
    const storageKey = `profiles/${userId}/${fileName}`;

    // Upload to S3
    const { key, url } = await storagePut(storageKey, imageBuffer, contentType);

    return {
      key,
      url,
      fileName,
      fileSize: imageBuffer.length,
      contentType,
    };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
}

/**
 * Upload training dataset or knowledge base document
 */
export async function uploadDatasetFile(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string = "application/octet-stream",
  category?: string
): Promise<UploadResult> {
  try {
    // Generate unique key
    const uniqueId = nanoid(8);
    const storageKey = `datasets/${category || "general"}/${uniqueId}-${fileName}`;

    // Upload to S3
    const { key, url } = await storagePut(storageKey, fileBuffer, contentType);

    return {
      key,
      url,
      fileName,
      fileSize: fileBuffer.length,
      contentType,
    };
  } catch (error) {
    console.error("Error uploading dataset file:", error);
    throw error;
  }
}

/**
 * Get presigned download URL for a file
 */
export async function getDownloadUrl(storageKey: string): Promise<string> {
  try {
    const { url } = await storageGet(storageKey);
    return url;
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw error;
  }
}

/**
 * Delete file from S3 (if supported by storage backend)
 */
export async function deleteFile(storageKey: string): Promise<void> {
  try {
    // Note: The current storage implementation doesn't support deletion
    // This is a placeholder for future implementation
    console.log(`File deletion requested for: ${storageKey}`);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Generate storage key for a file
 */
export function generateStorageKey(
  userId: number,
  fileType: string,
  fileName: string
): string {
  const uniqueId = nanoid(8);
  return `${fileType}/${userId}/${uniqueId}-${fileName}`;
}

/**
 * Get file metadata from storage key
 */
export function parseStorageKey(key: string): {
  fileType: string;
  userId: string;
  fileName: string;
} {
  const parts = key.split("/");
  return {
    fileType: parts[0] || "unknown",
    userId: parts[1] || "unknown",
    fileName: parts[2] || "unknown",
  };
}
