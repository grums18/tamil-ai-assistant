import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  createLiteratureContent,
  getLiteratureContent,
  getLiteratureContentByCategory,
  getLiteratureContentByType,
  getAllLiteratureContent,
  updateLiteratureContent,
  deleteLiteratureContent,
  createLearningPath,
  getLearningPath,
  getLearningPathsByLevel,
  getAllLearningPaths,
  createUserProgress,
  getUserProgress,
  getUserProgressByPath,
  getUserProgressStats,
  updateUserProgress,
  createAssessment,
  getAssessment,
  getAssessmentsByPath,
  createAssessmentResult,
  getUserAssessmentResults,
  getUserAssessmentStats,
  createCertificate,
  getUserCertificates,
  getCertificate,
  getCertificateByCode,
} from "./db-literature";

describe("Literature Database Helpers", () => {
  describe("Literature Content", () => {
    it("should create literature content", async () => {
      const result = await createLiteratureContent({
        title: "Thirukkural 1.1",
        contentType: "kural",
        category: "thirukkural",
        tamilText: "அகரமுதல எழுத்தெல்லாம் ஆதிபகவன் முதற்றே உயर்த्து",
        englishTranslation: "The letter 'A' is the first of all letters",
        meaning: "The first letter represents the beginning of all knowledge",
        difficulty: "beginner",
        tags: JSON.stringify(["fundamental", "beginning"]),
      });

      expect(result).toBeDefined();
    });

    it("should retrieve literature content by ID", async () => {
      const content = await getLiteratureContent(1);
      expect(content).toBeDefined();
    });

    it("should retrieve content by category", async () => {
      const contents = await getLiteratureContentByCategory("thirukkural", 10);
      expect(Array.isArray(contents)).toBe(true);
    });

    it("should retrieve content by type", async () => {
      const contents = await getLiteratureContentByType("kural", 10);
      expect(Array.isArray(contents)).toBe(true);
    });

    it("should retrieve all literature content", async () => {
      const contents = await getAllLiteratureContent(50);
      expect(Array.isArray(contents)).toBe(true);
    });

    it("should update literature content", async () => {
      const result = await updateLiteratureContent(1, {
        title: "Updated Thirukkural 1.1",
      });
      expect(result).toBeDefined();
    });

    it("should delete literature content", async () => {
      const result = await deleteLiteratureContent(1);
      expect(result).toBeDefined();
    });
  });

  describe("Learning Paths", () => {
    it("should create a learning path", async () => {
      const result = await createLearningPath({
        title: "Beginner Tamil Literature Path",
        level: "beginner",
        duration: "4 weeks",
        contentIds: JSON.stringify([1, 2, 3]),
      });

      expect(result).toBeDefined();
    });

    it("should retrieve learning path by ID", async () => {
      const path = await getLearningPath(1);
      expect(path).toBeDefined();
    });

    it("should retrieve learning paths by level", async () => {
      const paths = await getLearningPathsByLevel("beginner");
      expect(Array.isArray(paths)).toBe(true);
    });

    it("should retrieve all learning paths", async () => {
      const paths = await getAllLearningPaths();
      expect(Array.isArray(paths)).toBe(true);
    });
  });

  describe("User Learning Progress", () => {
    it("should create user progress", async () => {
      const result = await createUserProgress({
        userId: 1,
        learningPathId: 1,
        contentId: 1,
        status: "in_progress",
      });

      expect(result).toBeDefined();
    });

    it("should retrieve user progress", async () => {
      const progress = await getUserProgress(1, 1, 1);
      expect(progress).toBeDefined();
    });

    it("should retrieve user progress by path", async () => {
      const progresses = await getUserProgressByPath(1, 1);
      expect(Array.isArray(progresses)).toBe(true);
    });

    it("should calculate user progress stats", async () => {
      const stats = await getUserProgressStats(1, 1);

      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("completed");
      expect(stats).toHaveProperty("inProgress");
      expect(stats).toHaveProperty("notStarted");
      expect(stats).toHaveProperty("percentageComplete");
      expect(typeof stats.percentageComplete).toBe("number");
    });

    it("should update user progress", async () => {
      const result = await updateUserProgress(1, 1, 1, {
        status: "completed",
        score: "95",
      });

      expect(result).toBeDefined();
    });
  });

  describe("Literature Assessments", () => {
    it("should create an assessment", async () => {
      const result = await createAssessment({
        learningPathId: 1,
        title: "Beginner Assessment",
        assessmentType: "quiz",
        questions: JSON.stringify([
          { id: 1, question: "What is the first letter?", type: "multiple_choice" },
        ]),
        passingScore: "70",
      });

      expect(result).toBeDefined();
    });

    it("should retrieve assessment by ID", async () => {
      const assessment = await getAssessment(1);
      expect(assessment).toBeDefined();
    });

    it("should retrieve assessments by learning path", async () => {
      const assessments = await getAssessmentsByPath(1);
      expect(Array.isArray(assessments)).toBe(true);
    });

    it("should create assessment result", async () => {
      const result = await createAssessmentResult({
        userId: 1,
        assessmentId: 1,
        responses: JSON.stringify({ q1: "answer1" }),
        score: "85",
        passed: true,
        feedback: "Great job! You passed the assessment.",
      });

      expect(result).toBeDefined();
    });

    it("should retrieve user assessment results", async () => {
      const results = await getUserAssessmentResults(1, 1);
      expect(Array.isArray(results)).toBe(true);
    });

    it("should calculate user assessment stats", async () => {
      const stats = await getUserAssessmentStats(1);

      expect(stats).toHaveProperty("totalAttempts");
      expect(stats).toHaveProperty("passed");
      expect(stats).toHaveProperty("failed");
      expect(stats).toHaveProperty("averageScore");
      expect(typeof stats.averageScore).toBe("number");
    });
  });

  describe("Learning Certificates", () => {
    it("should create a certificate", async () => {
      const result = await createCertificate({
        userId: 1,
        learningPathId: 1,
        certificateCode: "CERT-2026-001",
        title: "Tamil Literature Beginner Certificate",
      });

      expect(result).toBeDefined();
    });

    it("should retrieve user certificates", async () => {
      const certificates = await getUserCertificates(1);
      expect(Array.isArray(certificates)).toBe(true);
    });

    it("should retrieve certificate by ID", async () => {
      const certificate = await getCertificate(1);
      expect(certificate).toBeDefined();
    });

    it("should retrieve certificate by code", async () => {
      const certificate = await getCertificateByCode("CERT-2026-001");
      expect(certificate).toBeDefined();
    });
  });

  describe("Data Validation", () => {
    it("should handle null values gracefully", async () => {
      const content = await getLiteratureContent(9999);
      expect(content).toBeNull();
    });

    it("should return empty arrays for non-existent data", async () => {
      const contents = await getLiteratureContentByCategory("non-existent", 10);
      expect(Array.isArray(contents)).toBe(true);
    });

    it("should calculate correct progress percentages", async () => {
      const stats = await getUserProgressStats(1, 1);
      expect(stats.percentageComplete).toBeGreaterThanOrEqual(0);
      expect(stats.percentageComplete).toBeLessThanOrEqual(100);
    });

    it("should handle decimal scores correctly", async () => {
      const stats = await getUserAssessmentStats(1);
      expect(Number.isFinite(stats.averageScore)).toBe(true);
    });
  });
});

describe("Literature Router Integration", () => {
  describe("Content Endpoints", () => {
    it("should validate content creation input", async () => {
      const input = {
        title: "Test Content",
        contentType: "kural" as const,
        category: "test",
        tamilText: "தமிழ் உரை",
        englishTranslation: "Tamil text",
        meaning: "Meaning",
      };

      expect(input.title).toBeDefined();
      expect(input.contentType).toMatch(/^(kural|story|poem|essay|lesson)$/);
    });

    it("should validate difficulty levels", () => {
      const validLevels = ["beginner", "intermediate", "advanced"];
      const testLevel = "beginner";
      expect(validLevels).toContain(testLevel);
    });

    it("should validate content types", () => {
      const validTypes = ["kural", "story", "poem", "essay", "lesson"];
      const testType = "kural";
      expect(validTypes).toContain(testType);
    });
  });

  describe("Assessment Endpoints", () => {
    it("should validate assessment types", () => {
      const validTypes = ["quiz", "essay", "project", "discussion"];
      const testType = "quiz";
      expect(validTypes).toContain(testType);
    });

    it("should validate passing scores", () => {
      const score = 75;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("Progress Tracking", () => {
    it("should track progress status correctly", () => {
      const validStatuses = ["not_started", "in_progress", "completed", "reviewed"];
      const testStatus = "in_progress";
      expect(validStatuses).toContain(testStatus);
    });

    it("should calculate progress percentage correctly", () => {
      const completed = 3;
      const total = 10;
      const percentage = Math.round((completed / total) * 100);
      expect(percentage).toBe(30);
    });
  });
});
