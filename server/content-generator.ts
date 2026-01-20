import { invokeLLM } from "./_core/llm";
import { saveGeneratedContent } from "./db";

const SCRIPT_GENERATION_PROMPT = `You are an expert Tamil YouTube script writer. Generate a compelling, engaging 10-minute video script in Tamil about the given topic.

The script should:
- Be approximately 1200-1500 words (10 minutes of speaking time)
- Have a clear introduction, body, and conclusion
- Include natural transitions and engaging storytelling
- Be optimized for YouTube viewers
- Include suggestions for visuals/B-roll in [brackets]
- Be written in natural, conversational Tamil

Format the script with:
- INTRODUCTION: [Opening hook and topic introduction]
- MAIN CONTENT: [Divided into 3-4 main sections]
- CONCLUSION: [Summary and call-to-action]
- OUTRO: [Channel promotion and subscribe message]`;

const THUMBNAIL_IDEAS_PROMPT = `You are an expert YouTube thumbnail designer. Generate 50 creative, catchy thumbnail text ideas for a YouTube video about the given topic.

Each idea should:
- Be 1-3 words maximum
- Be attention-grabbing and clickable
- Be suitable for Tamil YouTube content
- Include emojis where appropriate
- Be formatted as a numbered list

Format: 1. [Text] [emoji]
2. [Text] [emoji]
... and so on`;

const SEO_OPTIMIZATION_PROMPT = `You are an expert YouTube SEO specialist for Tamil content. Generate SEO-optimized content for a YouTube video about the given topic.

Provide:
1. TITLE (60 characters max): An engaging, keyword-rich title in Tamil
2. DESCRIPTION (5000 characters max): A detailed description with keywords, timestamps, and links
3. TAGS: 15-20 relevant tags in Tamil and English
4. HASHTAGS: 5-10 trending hashtags for Tamil YouTube

Format each section clearly with headers.`;

const TREND_ANALYSIS_PROMPT = `You are a Tamil YouTube trends analyst. Analyze the given topic and provide trend insights for Tamil content creators.

Provide:
1. TREND RELEVANCE: Is this topic trending? (High/Medium/Low)
2. AUDIENCE INTEREST: Estimated audience size and interest level
3. COMPETITION LEVEL: How many similar videos exist? (High/Medium/Low)
4. CONTENT OPPORTUNITIES: 3-5 unique angles to approach this topic
5. BEST UPLOAD TIME: Recommended time to upload based on trends
6. HASHTAG RECOMMENDATIONS: Trending hashtags related to this topic
7. COLLABORATION OPPORTUNITIES: Potential creators to collaborate with`;

export async function generateScript(
  userId: number,
  topic: string,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: SCRIPT_GENERATION_PROMPT,
        },
        {
          role: "user",
          content: `Generate a 10-minute video script about: ${topic}`,
        },
      ],
    });

    const script = typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "Failed to generate script";

    // Save to database
    await saveGeneratedContent(userId, "script", topic, script, language);

    return script;
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
}

export async function generateThumbnailIdeas(
  userId: number,
  topic: string,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: THUMBNAIL_IDEAS_PROMPT,
        },
        {
          role: "user",
          content: `Generate 50 thumbnail text ideas for a video about: ${topic}`,
        },
      ],
    });

    const ideas = typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "Failed to generate thumbnail ideas";

    // Save to database
    await saveGeneratedContent(userId, "thumbnail_ideas", topic, ideas, language);

    return ideas;
  } catch (error) {
    console.error("Error generating thumbnail ideas:", error);
    throw error;
  }
}

export async function generateSEOOptimization(
  userId: number,
  topic: string,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: SEO_OPTIMIZATION_PROMPT,
        },
        {
          role: "user",
          content: `Generate SEO optimization for a YouTube video about: ${topic}`,
        },
      ],
    });

    const seoContent = typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "Failed to generate SEO optimization";

    // Save to database
    await saveGeneratedContent(userId, "seo_title", topic, seoContent, language);

    return seoContent;
  } catch (error) {
    console.error("Error generating SEO optimization:", error);
    throw error;
  }
}

export async function analyzeTrends(
  userId: number,
  topic: string,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: TREND_ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: `Analyze trends for Tamil YouTube content about: ${topic}`,
        },
      ],
    });

    const trendAnalysis = typeof response.choices[0]?.message?.content === "string"
      ? response.choices[0].message.content
      : "Failed to analyze trends";

    // Save to database
    await saveGeneratedContent(userId, "trend_insight", topic, trendAnalysis, language);

    return trendAnalysis;
  } catch (error) {
    console.error("Error analyzing trends:", error);
    throw error;
  }
}

export async function generateAllContent(
  userId: number,
  topic: string,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<{
  script: string;
  thumbnailIdeas: string;
  seoOptimization: string;
  trendAnalysis: string;
}> {
  try {
    const [script, thumbnailIdeas, seoOptimization, trendAnalysis] = await Promise.all([
      generateScript(userId, topic, language),
      generateThumbnailIdeas(userId, topic, language),
      generateSEOOptimization(userId, topic, language),
      analyzeTrends(userId, topic, language),
    ]);

    return {
      script,
      thumbnailIdeas,
      seoOptimization,
      trendAnalysis,
    };
  } catch (error) {
    console.error("Error generating all content:", error);
    throw error;
  }
}
