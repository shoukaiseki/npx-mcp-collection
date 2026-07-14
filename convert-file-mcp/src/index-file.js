#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const {
  csv_to_json_file,
  json_to_csv_file,
  json_to_yaml_file,
  yaml_to_json_file,
  markdown_to_html_file,
  xml_to_json_file,
  json_to_xml_file,
  excel_to_html_file,
  excel_to_markdown_file,
  excel_to_json_file,
  excel_to_csv_file
} = require('./tools/convert-file');

async function main() {
  const server = new McpServer({
    name: "sks-convert-file-mcp-local",
    version: "1.0.0"
  });

  server.tool(
    "csv_to_json",
    { file_path: z.string().describe('CSV文件的完整路径') },
    async ({ file_path }) => {
      const result = await csv_to_json_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "json_to_csv",
    { file_path: z.string().describe('JSON文件的完整路径') },
    async ({ file_path }) => {
      const result = await json_to_csv_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "json_to_yaml",
    { file_path: z.string().describe('JSON文件的完整路径') },
    async ({ file_path }) => {
      const result = await json_to_yaml_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "yaml_to_json",
    { file_path: z.string().describe('YAML文件的完整路径') },
    async ({ file_path }) => {
      const result = await yaml_to_json_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "markdown_to_html",
    { file_path: z.string().describe('Markdown文件的完整路径') },
    async ({ file_path }) => {
      const result = await markdown_to_html_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "xml_to_json",
    { file_path: z.string().describe('XML文件的完整路径') },
    async ({ file_path }) => {
      const result = await xml_to_json_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "json_to_xml",
    { file_path: z.string().describe('JSON文件的完整路径') },
    async ({ file_path }) => {
      const result = await json_to_xml_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "excel_to_html",
    { file_path: z.string().describe('Excel文件的完整路径') },
    async ({ file_path }) => {
      const result = await excel_to_html_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "excel_to_markdown",
    { file_path: z.string().describe('Excel文件的完整路径') },
    async ({ file_path }) => {
      const result = await excel_to_markdown_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "excel_to_json",
    { file_path: z.string().describe('Excel文件的完整路径') },
    async ({ file_path }) => {
      const result = await excel_to_json_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "excel_to_csv",
    { file_path: z.string().describe('Excel文件的完整路径') },
    async ({ file_path }) => {
      const result = await excel_to_csv_file({ file_path });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);