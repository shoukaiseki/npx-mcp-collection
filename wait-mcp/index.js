#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "wait-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "wait",
        description: "Wait for N seconds before returning",
        inputSchema: {
          type: "object",
          properties: {
            seconds: {
              type: "number",
              description: "Number of seconds to wait",
              minimum: 0,
            },
          },
          required: ["seconds"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "wait") {
    const seconds = args?.seconds;

    if (typeof seconds !== "number" || seconds < 0) {
      throw new Error("Invalid seconds value. Must be a non-negative number.");
    }

    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

    return {
      content: [
        {
          type: "text",
          text: `Successfully waited for ${seconds} seconds`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wait MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});