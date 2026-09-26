import { z } from "zod";
import { analyticsTimeseriesTool, analyticsTools } from "./analytics.tools";
import { chatTools, leadTools, peopleTools } from "./people.tools";
import { contentTools } from "./content.tools";
import type { ToolDefinition } from "./types";

export const toolOutputShape = { summary: z.string(), data: z.unknown(), markdown: z.string().nullable(), chartSpec: z.record(z.unknown()).nullable(), nextCursor: z.string().nullable() };
export const mcpToolRegistry: ToolDefinition[] = [...analyticsTools.filter((tool) => tool.name !== "analytics_timeseries"), analyticsTimeseriesTool, ...peopleTools, ...leadTools, ...chatTools, ...contentTools];
export const mcpToolMap = new Map(mcpToolRegistry.map((tool) => [tool.name, tool]));
export { type ToolDefinition, type ToolContext, type ToolRun } from "./types";
