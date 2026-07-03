# sks-convert-file-mcp

文件格式转换 MCP 服务器，支持 CSV、JSON、YAML、Markdown、HTML、XML、Excel 等多种格式之间的相互转换。

## 安装

```bash
# 全局安装
npm install -g sks-convert-file-mcp

# 或使用 npx 直接运行（无需安装）
npx sks-convert-file-mcp
```

## MCP 客户端配置

在支持 MCP 的客户端（如 Claude Desktop、Cursor 等）中添加以下配置：

```json
{
      "sks-convert-file-mcp": {
        "name": "文件格式转换 MCP",
        "description": "支持CSV、JSON、YAML、Markdown、HTML、XML、Excel等多种格式之间的相互转换",
        "command": "npx",
        "args": [
          "-y",
          "sks-convert-file-mcp"
        ],
        "env": {
          "npm_config_registry": "https://registry.npm.taobao.org"
        },
        "icon": "📄"
      }
}
```

## 支持的转换工具

### 文本格式转换

| 工具 | 功能 | 输入参数 |
|------|------|----------|
| `csv_to_json` | CSV → JSON | `csv_content` |
| `json_to_csv` | JSON → CSV | `json_content` |
| `json_to_yaml` | JSON → YAML | `json_content` |
| `yaml_to_json` | YAML → JSON | `yaml_content` |
| `markdown_to_html` | Markdown → HTML | `markdown_content` |
| `xml_to_json` | XML → JSON | `xml_content` |
| `json_to_xml` | JSON → XML | `json_content` |

### Excel 转换

| 工具 | 功能 | 输入参数 |
|------|------|----------|
| `excel_to_html` | Excel → HTML 表格 | `excel_base64` |
| `excel_to_markdown` | Excel → Markdown 表格 | `excel_base64` |
| `excel_to_json` | Excel → JSON | `excel_base64` |
| `excel_to_csv` | Excel → CSV | `excel_base64` |

> Excel 工具接收 Base64 编码的文件内容，支持多 Sheet 转换。

## 命令行工具

项目附带独立的 CLI 工具，可直接转换本地 Excel 文件：

```bash
# 用法
node convert-cli.js <输入文件> <输出格式>

# 示例
node convert-cli.js "C:\path\to\file.xlsx" html
node convert-cli.js "C:\path\to\file.xlsx" markdown
node convert-cli.js "C:\path\to\file.xlsx" json
node convert-cli.js "C:\path\to\file.xlsx" csv
```

支持的输出格式：`html`、`markdown`（输出 `.md`）、`json`、`csv`

输出文件保存在输入文件同目录下，文件名保持一致仅更换扩展名。

## 项目结构

```
sks-convert-file-mcp/
├── src/
│   ├── index.js          # MCP 服务器入口，注册所有工具
│   └── tools/
│       ├── excel.js      # Excel 转换核心模块（单一来源）
│       └── convert.js    # MCP 工具封装（处理 base64 解码与响应格式）
├── convert-cli.js        # 独立 CLI 工具（引用核心模块）
├── mcp-config.json       # MCP 客户端配置示例
└── package.json
```

### 架构说明

Excel 转换逻辑统一封装在 [excel.js](src/tools/excel.js) 核心模块中，MCP 工具和 CLI 工具共同引用，避免重复维护：

- **excel.js** - 纯转换函数，接收 Buffer，返回字符串
- **convert.js** - MCP 封装层，处理 Base64 解码和 MCP 响应格式
- **convert-cli.js** - CLI 封装层，处理文件读写和命令行参数

## 技术栈

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - MCP 协议 SDK
- [xlsx](https://www.npmjs.com/package/xlsx) - Excel 文件解析
- [marked](https://www.npmjs.com/package/marked) - Markdown 转 HTML
- [yaml](https://www.npmjs.com/package/yaml) - YAML 解析
- [csv-parse](https://www.npmjs.com/package/csv-parse) / [csv-stringify](https://www.npmjs.com/package/csv-stringify) - CSV 处理
- [xml2js](https://www.npmjs.com/package/xml2js) - XML 解析

## License

MIT
