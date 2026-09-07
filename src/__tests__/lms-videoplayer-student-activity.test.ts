import { describe, it, expect } from "vitest";
import { parseYouTubeUrl, detectVideoType } from "../features/lms/videoUtils";
import { studentActivityFilterSchema } from "../lib/validations/crm";
import { mcpGetStudentActivitySchema } from "../lib/validations/mcp";

describe("LMS Hybrid Video Player & Student Activity Validations", () => {
  describe("VideoPlayer Helper Functions", () => {
    it("should correctly parse YouTube watch URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      const embedUrl = parseYouTubeUrl(url);
      expect(embedUrl).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should correctly parse YouTube short link (youtu.be)", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ?t=42";
      const embedUrl = parseYouTubeUrl(url);
      expect(embedUrl).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should correctly parse YouTube Shorts link", () => {
      const url = "https://www.youtube.com/shorts/dQw4w9WgXcQ";
      const embedUrl = parseYouTubeUrl(url);
      expect(embedUrl).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should detect YouTube URL type", () => {
      const result = detectVideoType("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result.type).toBe("youtube");
      expect(result.embedUrl).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
    });

    it("should detect HTML5 direct video stream (MP4)", () => {
      const result = detectVideoType("https://storage.googleapis.com/sample-videos/video.mp4");
      expect(result.type).toBe("html5");
    });

    it("should return empty type for missing or empty URL", () => {
      expect(detectVideoType("").type).toBe("empty");
      expect(detectVideoType(undefined).type).toBe("empty");
    });
  });

  describe("studentActivityFilterSchema", () => {
    it("should accept valid student activity query filters", () => {
      const valid = {
        search: "Sardor",
        cohortId: "cohort_oct_2026",
        status: "active" as const,
        page: 1,
        limit: 10,
      };
      const result = studentActivityFilterSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should set default status and pagination", () => {
      const result = studentActivityFilterSchema.parse({});
      expect(result.status).toBe("all");
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("should reject invalid status filter", () => {
      const result = studentActivityFilterSchema.safeParse({ status: "invalid_status" });
      expect(result.success).toBe(false);
    });
  });

  describe("mcpGetStudentActivitySchema", () => {
    it("should accept valid MCP get_student_activity payload", () => {
      const valid = {
        studentId: "std_01",
        email: "sardor@vibecoding.uz",
        cohortId: "cohort_oct_2026",
        status: "at_risk" as const,
        limit: 20,
      };
      const result = mcpGetStudentActivitySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should allow empty arguments with defaults", () => {
      const result = mcpGetStudentActivitySchema.parse({});
      expect(result.status).toBe("all");
      expect(result.limit).toBe(10);
    });
  });
});
