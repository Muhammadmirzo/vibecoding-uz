import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { requireServerToken } from "./auth";
import { dispatchTool, listToolDefs } from "./server";

async function main(): Promise<void> {
  requireServerToken();
  const server = new Server(
    { name: "naqsh-mcp-server", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: listToolDefs(),
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await dispatchTool(request.params.name, request.params.arguments ?? {});
    return { content: result.content, isError: result.isError ?? false };
  });
  await server.connect(new StdioServerTransport());
  console.error("Naqsh MCP Server running on stdio...");
}

main().catch((error: unknown) => {
  console.error("MCP Server Error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
