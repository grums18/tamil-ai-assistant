import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
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
  updateLearningPath,
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
} from "../db-literature";
import { invokeLLM } from "../_core/llm";

export const literatureRouter = router({
  /**
   * Literature Content Endpoints
   */
  getContent: publicProcedure.input(z.object({ id: z.number() })).query(async (opts: any) => {
    const { input } = opts;
    return await getLiteratureContent(input.id);
  }),

  getContentByCategory: publicProcedure
    .input(z.object({ category: z.string(), limit: z.number().optional() }))
    .query(async (opts: any) => {
      const { input } = opts;
      return await getLiteratureContentByCategory(input.category, input.limit);
    }),

  getContentByType: publicProcedure
    .input(z.object({ contentType: z.string(), limit: z.number().optional() }))
    .query(async (opts: any) => {
      const { input } = opts;
      return await getLiteratureContentByType(input.contentType, input.limit);
    }),

  getAllContent: publicProcedure.input(z.object({ limit: z.number().optional() }).optional()).query(async (opts: any) => {
    const { input } = opts;
    return await getAllLiteratureContent(input?.limit);
  }),

  createContent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        contentType: z.enum(["kural", "story", "poem", "essay", "lesson"]),
        category: z.string(),
        tamilText: z.string(),
        englishTranslation: z.string(),
        tanglishTransliteration: z.string().optional(),
        meaning: z.string(),
        culturalContext: z.string().optional(),
        author: z.string().optional(),
        period: z.string().optional(),
        audioUrl: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async (opts: any) => {
      const { input, ctx } = opts;
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create literature content");
      }

      return await createLiteratureContent({
        ...input,
        tags: input.tags ? JSON.stringify(input.tags) : null,
      });
    }),

  updateContent: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        updates: z.record(z.string(), z.any()),
      })
    )
    .mutation(async (opts: any) => {
      const { input, ctx } = opts;
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can update literature content");
      }

      return await updateLiteratureContent(input.id, input.updates);
    }),

  deleteContent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async (opts: any) => {
      const { input, ctx } = opts;
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can delete literature content");
      }

      return await deleteLiteratureContent(input.id);
    }),

  /**
   * Learning Paths Endpoints
   */
  getLearningPath: publicProcedure.input(z.object({ id: z.number() })).query(async (opts: any) => {
    const { input } = opts;
    return await getLearningPath(input.id);
  }),

  getLearningPathsByLevel: publicProcedure
    .input(z.object({ level: z.enum(["beginner", "intermediate", "advanced"]) }))
    .query(async (opts: any) => {
      const { input } = opts;
      return await getLearningPathsByLevel(input.level);
    }),

  getAllLearningPaths: publicProcedure.query(async () => {
    return await getAllLearningPaths();
  }),

  createLearningPath: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        duration: z.string().optional(),
        targetAudience: z.string().optional(),
        contentIds: z.array(z.number()),
        learningObjectives: z.array(z.string()).optional(),
        assessmentType: z.enum(["quiz", "essay", "project", "discussion"]).optional(),
        certificateEligible: z.boolean().optional(),
      })
    )
    .mutation(async (opts: any) => {
      const { input, ctx } = opts;
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create learning paths");
      }

      return await createLearningPath({
        ...input,
        contentIds: JSON.stringify(input.contentIds),
        learningObjectives: input.learningObjectives ? JSON.stringify(input.learningObjectives) : null,
      });
    }),

  /**
   * User Progress Endpoints
   */
  getUserProgress: protectedProcedure
    .input(
      z.object({
        learningPathId: z.number(),
        contentId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getUserProgress(ctx.user.id, input.learningPathId, input.contentId);
    }),

  getUserProgressByPath: protectedProcedure
    .input(z.object({ learningPathId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getUserProgressByPath(ctx.user.id, input.learningPathId);
    }),

  getUserProgressStats: protectedProcedure
    .input(z.object({ learningPathId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getUserProgressStats(ctx.user.id, input.learningPathId);
    }),

  updateUserProgress: protectedProcedure
    .input(
      z.object({
        learningPathId: z.number(),
        contentId: z.number(),
        status: z.enum(["not_started", "in_progress", "completed", "reviewed"]).optional(),
        score: z.number().optional(),
        timeSpent: z.number().optional(),
        notes: z.string().optional(),
        bookmarked: z.boolean().optional(),
      })
    )
    .mutation(async (opts: any) => {
      const { input, ctx } = opts;
      const { learningPathId, contentId, ...updates } = input;
      const updateData: any = updates;
      if (updateData.score !== undefined) {
        updateData.score = String(updateData.score);
      }
      return await updateUserProgress(ctx.user.id, learningPathId, contentId, updateData);
    }),

  /**
   * Assessment Endpoints
   */
  getAssessment: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await getAssessment(input.id);
  }),

  getAssessmentsByPath: publicProcedure
    .input(z.object({ learningPathId: z.number() }))
    .query(async ({ input }) => {
      return await getAssessmentsByPath(input.learningPathId);
    }),

  createAssessment: protectedProcedure
    .input(
      z.object({
        learningPathId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        assessmentType: z.enum(["quiz", "essay", "project", "discussion"]),
        questions: z.array(z.record(z.string(), z.any())),
        passingScore: z.number().optional(),
        timeLimit: z.number().optional(),
      })
    )
    .mutation(async (opts: any) => {
      const { input, ctx } = opts;
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can create assessments");
      }

      return await createAssessment({
        ...input,
        questions: JSON.stringify(input.questions),
        passingScore: input.passingScore ? String(input.passingScore) : "70",
      });
    }),

  /**
   * Assessment Results Endpoints
   */
  submitAssessment: protectedProcedure
    .input(
      z.object({
        assessmentId: z.number(),
        responses: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const assessment = await getAssessment(input.assessmentId);
      if (!assessment) {
        throw new Error("Assessment not found");
      }

      // Calculate score based on responses
      const score = Math.random() * 100; // Placeholder - implement proper scoring
      const passed = score >= Number(assessment.passingScore || 70);

      // Generate AI feedback
      let feedback = "Good attempt! Keep practicing.";
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a Tamil literature tutor. Provide constructive feedback on student responses.",
            },
            {
              role: "user",
              content: `Assessment: ${assessment.title}\nStudent responses: ${JSON.stringify(input.responses)}\nScore: ${score}%\nPassed: ${passed}`,
            },
          ],
        });
        const content = response.choices[0]?.message?.content;
        if (typeof content === 'string') {
          feedback = content;
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
      }

      return await createAssessmentResult({
        userId: ctx.user.id,
        assessmentId: input.assessmentId,
        responses: JSON.stringify(input.responses),
        score: String(score),
        passed,
        feedback,
      });
    }),

  getUserAssessmentResults: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getUserAssessmentResults(ctx.user.id, input.assessmentId);
    }),

  getUserAssessmentStats: protectedProcedure.query(async ({ ctx }) => {
    return await getUserAssessmentStats(ctx.user.id);
  }),

  /**
   * Certificate Endpoints
   */
  getUserCertificates: protectedProcedure.query(async ({ ctx }) => {
    return await getUserCertificates(ctx.user.id);
  }),

  getCertificate: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await getCertificate(input.id);
  }),

  getCertificateByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      return await getCertificateByCode(input.code);
    }),

  issueCertificate: protectedProcedure
    .input(
      z.object({
        learningPathId: z.number(),
        title: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Generate unique certificate code
      const certificateCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return await createCertificate({
        userId: ctx.user.id,
        learningPathId: input.learningPathId,
        certificateCode,
        title: input.title,
      });
    }),

  /**
   * AI-Powered Explanations
   */
  getKuralExplanation: publicProcedure
    .input(z.object({ kuralNumber: z.string(), kuralText: z.string() }))
    .query(async (opts: any) => {
      const { input } = opts;
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert in Tamil literature and Thirukkural. Provide detailed explanations of Thirukkural couplets in English, including:
1. Literal translation
2. Deeper meaning and wisdom
3. Historical and cultural context
4. Modern-day applications
5. Related couplets or themes`,
            },
            {
              role: "user",
              content: `Explain Thirukkural ${input.kuralNumber}: "${input.kuralText}"`,
            },
          ],
        });

        return {
          kuralNumber: input.kuralNumber,
          explanation: response.choices[0]?.message?.content || "Unable to generate explanation",
        };
      } catch (error) {
        throw new Error(`Failed to generate explanation: ${error}`);
      }
    }),

  getStoryContext: publicProcedure
    .input(z.object({ storyTitle: z.string(), excerpt: z.string() }))
    .query(async (opts: any) => {
      const { input } = opts;
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert in Tamil literature. Provide cultural and historical context for Tamil stories and literature.`,
            },
            {
              role: "user",
              content: `Provide context for the story "${input.storyTitle}" with this excerpt: "${input.excerpt}"`,
            },
          ],
        });

        return {
          storyTitle: input.storyTitle,
          context: response.choices[0]?.message?.content || "Unable to generate context",
        };
      } catch (error) {
        throw new Error(`Failed to generate context: ${error}`);
      }
    }),
});
