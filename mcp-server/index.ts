import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { requireServerToken } from "./auth";
import { createMcpServer } from "./server";

async function main(): Promise<void> {
  requireServerToken();
  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
  console.error("Naqsh MCP Server running on stdio...");
}

main().catch((error: unknown) => {
  console.error("MCP Server Error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
