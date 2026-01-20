import { getDb } from "./db";
import {
  literatureContent,
  learningPaths,
  userLearningProgress,
  literatureAssessments,
  userAssessmentResults,
  learningCertificates,
  InsertLiteratureContent,
  InsertLearningPath,
  InsertUserLearningProgress,
  InsertLiteratureAssessment,
  InsertUserAssessmentResult,
  InsertLearningCertificate,
} from "../drizzle/schema";
import { eq, and, desc, asc } from "drizzle-orm";

/**
 * Literature Content Helpers
 */
export async function createLiteratureContent(data: InsertLiteratureContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.insert(literatureContent).values(data);
  return result;
}

export async function getLiteratureContent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.select().from(literatureContent).where(eq(literatureContent.id, id));
  return result[0] || null;
}

export async function getLiteratureContentByCategory(category: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(literatureContent).where(eq(literatureContent.category, category)).limit(limit);
}

export async function getLiteratureContentByType(contentType: string, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(literatureContent).where(eq(literatureContent.contentType, contentType as any)).limit(limit);
}

export async function getAllLiteratureContent(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(literatureContent).limit(limit).orderBy(desc(literatureContent.createdAt));
}

export async function updateLiteratureContent(id: number, data: Partial<InsertLiteratureContent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.update(literatureContent).set(data).where(eq(literatureContent.id, id));
}

export async function deleteLiteratureContent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.delete(literatureContent).where(eq(literatureContent.id, id));
}

/**
 * Learning Paths Helpers
 */
export async function createLearningPath(data: InsertLearningPath) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.insert(learningPaths).values(data);
  return result;
}

export async function getLearningPath(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.select().from(learningPaths).where(eq(learningPaths.id, id));
  return result[0] || null;
}

export async function getLearningPathsByLevel(level: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(learningPaths).where(eq(learningPaths.level, level as any)).orderBy(asc(learningPaths.title));
}

export async function getAllLearningPaths() {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(learningPaths).orderBy(asc(learningPaths.level));
}

export async function updateLearningPath(id: number, data: Partial<InsertLearningPath>) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.update(learningPaths).set(data).where(eq(learningPaths.id, id));
}

/**
 * User Learning Progress Helpers
 */
export async function createUserProgress(data: InsertUserLearningProgress) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.insert(userLearningProgress).values(data);
  return result;
}

export async function getUserProgress(userId: number, learningPathId: number, contentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.learningPathId, learningPathId),
        eq(userLearningProgress.contentId, contentId)
      )
    );
  return result[0] || null;
}

export async function getUserProgressByPath(userId: number, learningPathId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.learningPathId, learningPathId)
      )
    )
    .orderBy(asc(userLearningProgress.contentId));
}

export async function getUserProgressStats(userId: number, learningPathId: number) {
  const progress = await getUserProgressByPath(userId, learningPathId);
  const completed = progress.filter((p: any) => p.status === "completed").length;
  const inProgress = progress.filter((p: any) => p.status === "in_progress").length;
  const total = progress.length;

  return {
    total,
    completed,
    inProgress,
    notStarted: total - completed - inProgress,
    percentageComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function updateUserProgress(userId: number, learningPathId: number, contentId: number, data: Partial<InsertUserLearningProgress>) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db
    .update(userLearningProgress)
    .set(data)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.learningPathId, learningPathId),
        eq(userLearningProgress.contentId, contentId)
      )
    );
}

/**
 * Literature Assessments Helpers
 */
export async function createAssessment(data: InsertLiteratureAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.insert(literatureAssessments).values(data);
  return result;
}

export async function getAssessment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.select().from(literatureAssessments).where(eq(literatureAssessments.id, id));
  return result[0] || null;
}

export async function getAssessmentsByPath(learningPathId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(literatureAssessments).where(eq(literatureAssessments.learningPathId, learningPathId)).orderBy(asc(literatureAssessments.title));
}

/**
 * User Assessment Results Helpers
 */
export async function createAssessmentResult(data: InsertUserAssessmentResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.insert(userAssessmentResults).values(data);
  return result;
}

export async function getUserAssessmentResults(userId: number, assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db
    .select()
    .from(userAssessmentResults)
    .where(
      and(
        eq(userAssessmentResults.userId, userId),
        eq(userAssessmentResults.assessmentId, assessmentId)
      )
    )
    .orderBy(desc(userAssessmentResults.submittedAt));
}

export async function getUserAssessmentStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const results = await db.select().from(userAssessmentResults).where(eq(userAssessmentResults.userId, userId));

  const passed = results.filter((r: any) => r.passed).length;
  const averageScore = results.length > 0 ? results.reduce((sum: number, r: any) => sum + Number(r.score), 0) / results.length : 0;

  return {
    totalAttempts: results.length,
    passed,
    failed: results.length - passed,
    averageScore: Math.round(averageScore * 100) / 100,
  };
}

/**
 * Learning Certificates Helpers
 */
export async function createCertificate(data: InsertLearningCertificate) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.insert(learningCertificates).values(data);
  return result;
}

export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(learningCertificates).where(eq(learningCertificates.userId, userId)).orderBy(desc(learningCertificates.issueDate));
}

export async function getCertificate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.select().from(learningCertificates).where(eq(learningCertificates.id, id));
  return result[0] || null;
}

export async function getCertificateByCode(certificateCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.select().from(learningCertificates).where(eq(learningCertificates.certificateCode, certificateCode));
  return result[0] || null;
}
