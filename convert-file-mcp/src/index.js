#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const {
  csv_to_json,
  json_to_csv,
  json_to_yaml,
  yaml_to_json,
  markdown_to_html,
  xml_to_json,
  json_to_xml,
  excel_to_html,
  excel_to_markdown
} = require('./tools/convert');

async function main() {
  const server = new McpServer({
    name: "sks-convert-file-mcp",
    version: "1.0.0"
  });

  server.tool(
    "csv_to_json",
    { csv_content: z.string().describe('CSV格式的文本内容') },
    async ({ csv_content }) => {
      const result = await csv_to_json({ csv_content });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "json_to_csv",
    { json_content: z.string().describe('JSON格式的文本内容，应为数组格式') },
    async ({ json_content }) => {
      const result = await json_to_csv({ json_content });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "json_to_yaml",
    { json_content: z.string().describe('JSON格式的文本内容') },
    async ({ json_content }) => {
      const result = await json_to_yaml({ json_content });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "yaml_to_json",
    { yaml_content: z.string().describe('YAML格式的文本内容') },
    async ({ yaml_content }) => {
      const result = await yaml_to_json({ yaml_content });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "markdown_to_html",
    { markdown_content: z.string().describe('Markdown格式的文本内容') },
    async ({ markdown_content }) => {
      const result = await markdown_to_html({ markdown_content });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "xml_to_json",
    { xml_content: z.string().describe('XML格式的文本内容') },
    async ({ xml_content }) => {
      const result = await xml_to_json({ xml_content });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "json_to_xml",
    { json_content: z.string().describe('JSON格式的文本内容') },
    async ({ json_content }) => {
      const result = await json_to_xml({ json_content });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "excel_to_html",
    { excel_base64: z.string().describe('Excel文件的Base64编码内容') },
    async ({ excel_base64 }) => {
      const result = await excel_to_html({ excel_base64 });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  server.tool(
    "excel_to_markdown",
    { excel_base64: z.string().describe('Excel文件的Base64编码内容') },
    async ({ excel_base64 }) => {
      const result = await excel_to_markdown({ excel_base64 });
      return { content: [{ type: "text", text: result.content }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);