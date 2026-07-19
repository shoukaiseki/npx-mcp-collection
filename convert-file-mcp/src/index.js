#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

const isStandard = process.argv.includes('--standard');
const isLocal = !isStandard;

// 启动诊断日志，输出到 stderr（不影响 MCP stdout 协议）
console.error(`[sks-convert-file-mcp] v1.6.1 mode=${isLocal ? 'local' : 'standard'} argv=[${process.argv.slice(2).join(', ')}]`);

async function main() {
  const server = new McpServer({
    name: isLocal ? "sks-convert-file-local" : "sks-convert-file-mcp",
    version: "1.0.0"
  });

  if (isLocal) {
    // ===== 纯本地模式：文件路径传参，节省 token =====
    const fileTools = require('./tools/convert-file');

    server.tool("csv_to_json_local",
      { file_path: z.string().describe('CSV文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.csv_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_csv_local",
      { file_path: z.string().describe('JSON文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.json_to_csv_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_yaml_local",
      { file_path: z.string().describe('JSON文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.json_to_yaml_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("yaml_to_json_local",
      { file_path: z.string().describe('YAML文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.yaml_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("markdown_to_html_local",
      { file_path: z.string().describe('Markdown文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.markdown_to_html_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("xml_to_json_local",
      { file_path: z.string().describe('XML文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.xml_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_xml_local",
      { file_path: z.string().describe('JSON文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.json_to_xml_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_html_local",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_html_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_markdown_local",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_markdown_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_json_local",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_csv_local",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_csv_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

  } else {
    // ===== 通用模式：内容传参 + 文件路径传参 =====
    const contentTools = require('./tools/convert');
    const fileTools = require('./tools/convert-file');

    // 内容传参版
    server.tool("csv_to_json",
      { csv_content: z.string().describe('CSV格式的文本内容') },
      async ({ csv_content }) => {
        const r = await contentTools.csv_to_json({ csv_content });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_csv",
      { json_content: z.string().describe('JSON格式的文本内容，应为数组格式') },
      async ({ json_content }) => {
        const r = await contentTools.json_to_csv({ json_content });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_yaml",
      { json_content: z.string().describe('JSON格式的文本内容') },
      async ({ json_content }) => {
        const r = await contentTools.json_to_yaml({ json_content });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("yaml_to_json",
      { yaml_content: z.string().describe('YAML格式的文本内容') },
      async ({ yaml_content }) => {
        const r = await contentTools.yaml_to_json({ yaml_content });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("markdown_to_html",
      { markdown_content: z.string().describe('Markdown格式的文本内容') },
      async ({ markdown_content }) => {
        const r = await contentTools.markdown_to_html({ markdown_content });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("xml_to_json",
      { xml_content: z.string().describe('XML格式的文本内容') },
      async ({ xml_content }) => {
        const r = await contentTools.xml_to_json({ xml_content });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_xml",
      { json_content: z.string().describe('JSON格式的文本内容') },
      async ({ json_content }) => {
        const r = await contentTools.json_to_xml({ json_content });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_html",
      { excel_base64: z.string().describe('Excel文件的Base64编码内容') },
      async ({ excel_base64 }) => {
        const r = await contentTools.excel_to_html({ excel_base64 });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_markdown",
      { excel_base64: z.string().describe('Excel文件的Base64编码内容') },
      async ({ excel_base64 }) => {
        const r = await contentTools.excel_to_markdown({ excel_base64 });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_json",
      { excel_base64: z.string().describe('Excel文件的Base64编码内容') },
      async ({ excel_base64 }) => {
        const r = await contentTools.excel_to_json({ excel_base64 });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_csv",
      { excel_base64: z.string().describe('Excel文件的Base64编码内容') },
      async ({ excel_base64 }) => {
        const r = await contentTools.excel_to_csv({ excel_base64 });
        return { content: [{ type: "text", text: r.content }] };
      });

    // 文件路径版（带 _file 后缀区分）
    server.tool("csv_to_json_file",
      { file_path: z.string().describe('CSV文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.csv_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_csv_file",
      { file_path: z.string().describe('JSON文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.json_to_csv_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_yaml_file",
      { file_path: z.string().describe('JSON文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.json_to_yaml_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("yaml_to_json_file",
      { file_path: z.string().describe('YAML文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.yaml_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("markdown_to_html_file",
      { file_path: z.string().describe('Markdown文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.markdown_to_html_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("xml_to_json_file",
      { file_path: z.string().describe('XML文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.xml_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("json_to_xml_file",
      { file_path: z.string().describe('JSON文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.json_to_xml_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_html_file",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_html_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_markdown_file",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_markdown_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_json_file",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_json_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });

    server.tool("excel_to_csv_file",
      { file_path: z.string().describe('Excel文件的完整路径') },
      async ({ file_path }) => {
        const r = await fileTools.excel_to_csv_file({ file_path });
        return { content: [{ type: "text", text: r.content }] };
      });
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);