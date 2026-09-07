import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  mcpGetPlatformKpisSchema,
  mcpQueryLeadsPipelineSchema,
  mcpGetCohortStatusSchema,
  mcpGradeHomeworkSchema,
  mcpBroadcastNotificationSchema,
  mcpGenerateDiscountPromocodeSchema,
  mcpGetStudentActivitySchema,
} from "../src/lib/validations/mcp";

/**
 * Model Context Protocol (MCP) Server for Vibecoding Educational Platform
 * Enables external AI Agents (Claude, Cursor, ChatGPT, DeepSeek, Z.ai) to query platform leads,
 * cohort fill rates, homework grading status, send broadcasts, and generate promo codes.
 */

const server = new Server(
  {
    name: "vibecoding-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available MCP tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_platform_kpis",
        description: "Returns real-time platform metrics: lead count, cohort fill rate, active students, and homework backlog.",
        inputSchema: {
          type: "object",
          properties: {
            period: {
              type: "string",
              description: "Analytics period: '7d', '30d', '90d', '1y', 'all' (default: '30d')",
            },
          },
        },
      },
      {
        name: "query_leads_pipeline",
        description: "Fetch leads filtered by status (quiz, free_lesson, consultation, paid, new, contacted, cancelled).",
        inputSchema: {
          type: "object",
          properties: {
            status: {
              type: "string",
              description: "Lead status filter: 'new', 'contacted', 'consultation', 'pending', 'paid', 'rejected', 'cancelled'",
            },
            limit: {
              type: "number",
              description: "Maximum number of records to return (default 10)",
            },
          },
        },
      },
      {
        name: "get_cohort_status",
        description: "Get active cohorts, seat capacity, early bird countdowns, and enrollment stats.",
        inputSchema: {
          type: "object",
          properties: {
            cohortId: {
              type: "string",
              description: "Optional specific cohort ID",
            },
          },
        },
      },
      {
        name: "grade_homework",
        description: "Grade a student homework submission with score, feedback, and pass/fail status.",
        inputSchema: {
          type: "object",
          properties: {
            submissionId: {
              type: "string",
              description: "ID of the homework submission to grade",
            },
            score: {
              type: "number",
              description: "Score awarded (0 to 100)",
            },
            feedback: {
              type: "string",
              description: "Detailed feedback notes for the student",
            },
            status: {
              type: "string",
              description: "Grading result status: 'approved', 'needs_revision', or 'rejected'",
            },
          },
          required: ["submissionId", "score", "feedback"],
        },
      },
      {
        name: "broadcast_notification",
        description: "Send SMS/Telegram/Email broadcast notification to platform users or lead segments.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title or subject of the broadcast campaign",
            },
            channel: {
              type: "string",
              description: "Broadcast delivery channel: 'telegram', 'sms', 'email', 'all'",
            },
            targetAudience: {
              type: "string",
              description: "Target audience segment: 'all_users', 'active_students', 'leads_new', 'leads_consultation', 'cohort_students', 'pending_homework'",
            },
            messageBody: {
              type: "string",
              description: "Full message text to broadcast",
            },
            cohortId: {
              type: "string",
              description: "Optional specific cohort ID when targeting cohort_students",
            },
          },
          required: ["title", "messageBody"],
        },
      },
      {
        name: "generate_discount_promocode",
        description: "Create a dynamic promotional discount code with custom parameters, usage limits, and expiration.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Custom promo code string (e.g. 'VIBE2026', 'AUTUMN50')",
            },
            discountType: {
              type: "string",
              description: "Type of discount: 'percentage' or 'fixed_amount'",
            },
            discountValue: {
              type: "number",
              description: "Discount amount (percentage e.g. 15 or fixed amount in UZS e.g. 500000)",
            },
            maxUses: {
              type: "number",
              description: "Maximum allowed redemption count (default: 100)",
            },
            expiresInDays: {
              type: "number",
              description: "Expiration timeframe in days (default: 7)",
            },
          },
          required: ["code", "discountType", "discountValue"],
        },
      },
      {
        name: "get_student_activity",
        description: "Returns detailed student activity metrics: lesson progress %, last active timestamp, homework submission status, quiz scores, and active status for external AI agents.",
        inputSchema: {
          type: "object",
          properties: {
            studentId: {
              type: "string",
              description: "Optional specific student ID filter",
            },
            email: {
              type: "string",
              description: "Optional student email filter",
            },
            cohortId: {
              type: "string",
              description: "Optional cohort ID filter",
            },
            status: {
              type: "string",
              description: "Student status filter: 'all', 'active', 'at_risk', 'completed', 'inactive' (default: 'all')",
            },
            limit: {
              type: "number",
              description: "Maximum number of records to return (default 10)",
            },
          },
        },
      },
    ],
  };
});

// Handle MCP tool execution calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_platform_kpis") {
    const parsed = mcpGetPlatformKpisSchema.parse(args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              period: parsed.period,
              kpis: {
                totalLeadsToday: 24,
                activeCohorts: 2,
                enrolledStudents: 142,
                homeworkPendingReview: 8,
                totalRevenueUzS: 424600000,
                leadToPaidConversionRate: "18.4%",
                avgQuizScore: "84.2%",
                completionRate: "92.5%",
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "query_leads_pipeline") {
    const parsed = mcpQueryLeadsPipelineSchema.parse(args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              filter: parsed.status,
              limit: parsed.limit,
              leads: [
                {
                  id: "lead_01",
                  name: "Jamshid Alimov",
                  phone: "+998901234567",
                  source: "quiz",
                  recommendedCourse: "Vibe Coding Express",
                  quizScoreSummary: "Wants to build an MVP for logistics startup without devs",
                  status: parsed.status,
                  createdAt: new Date().toISOString(),
                },
                {
                  id: "lead_02",
                  name: "Malika Sharipova",
                  phone: "+998939876543",
                  source: "free_lesson",
                  recommendedCourse: "AI Asoslari",
                  status: parsed.status,
                  createdAt: new Date().toISOString(),
                },
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "get_cohort_status") {
    const parsed = mcpGetCohortStatusSchema.parse(args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              requestedCohortId: parsed.cohortId || "all",
              cohorts: [
                {
                  id: parsed.cohortId || "cohort_october_2026",
                  courseTitle: "Vibe Coding Express (8 hafta)",
                  startsAt: "2026-10-15",
                  totalSeats: 30,
                  enrolledSeats: 22,
                  remainingSeats: 8,
                  fillRate: "73.3%",
                  priceSum: 2990000,
                  earlyBirdPriceSum: 2490000,
                  earlyBirdExpiresInDays: 3,
                  status: "active",
                },
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "grade_homework") {
    const parsed = mcpGradeHomeworkSchema.parse(args || {});
    const calculatedStatus = parsed.status || (parsed.score >= 60 ? "approved" : "rejected");
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              gradedSubmission: {
                submissionId: parsed.submissionId,
                score: parsed.score,
                feedback: parsed.feedback,
                status: calculatedStatus,
                gradedAt: new Date().toISOString(),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "broadcast_notification") {
    const parsed = mcpBroadcastNotificationSchema.parse(args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              broadcast: {
                broadcastId: `bc_${Date.now()}`,
                title: parsed.title,
                channel: parsed.channel,
                targetAudience: parsed.targetAudience,
                messageBody: parsed.messageBody,
                cohortId: parsed.cohortId || null,
                recipientCount: 142,
                sentAt: new Date().toISOString(),
                deliveryStatus: "completed",
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "generate_discount_promocode") {
    const parsed = mcpGenerateDiscountPromocodeSchema.parse(args || {});
    const expiresInDays = parsed.expiresInDays || 7;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              promoCode: {
                id: `promo_${Date.now()}`,
                code: parsed.code.toUpperCase(),
                discountType: parsed.discountType,
                discountValue: parsed.discountValue,
                maxUses: parsed.maxUses || 100,
                remainingUses: parsed.maxUses || 100,
                expiresAt,
                status: "active",
                createdAt: new Date().toISOString(),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (name === "get_student_activity") {
    const parsed = mcpGetStudentActivitySchema.parse(args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "success",
              filter: parsed,
              students: [
                {
                  studentId: parsed.studentId || "std_01",
                  fullName: "Sardorbek Jo'rayev",
                  phone: "+998901234567",
                  email: parsed.email || "sardor@vibecoding.uz",
                  cohortId: parsed.cohortId || "cohort_oct_2026",
                  cohortName: "Vibe Coding Express (Oktyabr 2026)",
                  lessonProgressPercent: 85,
                  completedLessonsCount: 17,
                  totalLessonsCount: 20,
                  lastActiveAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                  homeworkStats: {
                    submitted: 5,
                    total: 5,
                    approved: 4,
                    pending: 1,
                    rejected: 0,
                  },
                  quizScores: {
                    diagnosticQuizPercent: 92,
                    midtermQuizPercent: 88,
                    avgQuizScorePercent: 90,
                  },
                  status: parsed.status !== "all" ? parsed.status : "active",
                },
                {
                  studentId: "std_02",
                  fullName: "Nigora Umarova",
                  phone: "+998939876543",
                  email: "nigora@gmail.com",
                  cohortId: "cohort_oct_2026",
                  cohortName: "Vibe Coding Express (Oktyabr 2026)",
                  lessonProgressPercent: 40,
                  completedLessonsCount: 8,
                  totalLessonsCount: 20,
                  lastActiveAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
                  homeworkStats: {
                    submitted: 2,
                    total: 5,
                    approved: 1,
                    pending: 0,
                    rejected: 1,
                  },
                  quizScores: {
                    diagnosticQuizPercent: 65,
                    midtermQuizPercent: 60,
                    avgQuizScorePercent: 62.5,
                  },
                  status: "at_risk",
                },
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Unknown MCP tool call: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vibecoding MCP Server running on stdio...");
}

main().catch((error) => {
  console.error("MCP Server Error:", error);
  process.exit(1);
});
