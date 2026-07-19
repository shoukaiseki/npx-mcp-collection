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

在支持 MCP 的客户端中添加以下配置：

### 本地文件模式（默认）⭐ 推荐

默认启动即本地模式，工具名带 `_local` 后缀，AI 只传文件路径字符串，**节省 token**：

```json
{
  "sks-convert-file-mcp": {
    "name": "文件格式转换 MCP (本地)",
    "description": "支持CSV、JSON、YAML、Markdown、HTML、XML、Excel等多种文件格式转换",
    "command": "npx",
    "args": ["-y", "sks-convert-file-mcp"],
    "env": {
      "npm_config_registry": "https://registry.npmmirror.com"
    }
  }
}
```

### 通用模式（需加 `--standard` 参数）

加 `--standard` 参数启用内容传参版（22个工具），AI 直接传文件内容而非路径：

```json
{
  "sks-convert-file-mcp": {
    "name": "文件格式转换 MCP",
    "command": "npx",
    "args": ["-y", "sks-convert-file-mcp", "--standard"],
    "env": {
      "npm_config_registry": "https://registry.npmmirror.com"
    }
  }
}
```

## 支持的转换工具

### 通用模式（`--standard`）

| 工具 | 功能 | 输入参数 |
|------|------|----------|
| `csv_to_json` | CSV → JSON | `csv_content` |
| `json_to_csv` | JSON → CSV | `json_content` |
| `json_to_yaml` | JSON → YAML | `json_content` |
| `yaml_to_json` | YAML → JSON | `yaml_content` |
| `markdown_to_html` | Markdown → HTML | `markdown_content` |
| `xml_to_json` | XML → JSON | `xml_content` |
| `json_to_xml` | JSON → XML | `json_content` |
| `excel_to_html` | Excel → HTML 表格 | `excel_base64` |
| `excel_to_markdown` | Excel → Markdown 表格 | `excel_base64` |
| `excel_to_json` | Excel → JSON | `excel_base64` |
| `excel_to_csv` | Excel → CSV | `excel_base64` |
| `csv_to_json_file` | CSV → JSON | `file_path` |
| `json_to_csv_file` | JSON → CSV | `file_path` |
| `json_to_yaml_file` | JSON → YAML | `file_path` |
| `yaml_to_json_file` | YAML → JSON | `file_path` |
| `markdown_to_html_file` | Markdown → HTML | `file_path` |
| `xml_to_json_file` | XML → JSON | `file_path` |
| `json_to_xml_file` | JSON → XML | `file_path` |
| `excel_to_html_file` | Excel → HTML 表格 | `file_path` |
| `excel_to_markdown_file` | Excel → Markdown 表格 | `file_path` |
| `excel_to_json_file` | Excel → JSON | `file_path` |
| `excel_to_csv_file` | Excel → CSV | `file_path` |

### 本地文件模式（默认，或加 `--local`）

| 工具 | 功能 | 输入参数 |
|------|------|----------|
| `csv_to_json_local` | CSV → JSON | `file_path` |
| `json_to_csv_local` | JSON → CSV | `file_path` |
| `json_to_yaml_local` | JSON → YAML | `file_path` |
| `yaml_to_json_local` | YAML → JSON | `file_path` |
| `markdown_to_html_local` | Markdown → HTML | `file_path` |
| `xml_to_json_local` | XML → JSON | `file_path` |
| `json_to_xml_local` | JSON → XML | `file_path` |
| `excel_to_html_local` | Excel → HTML 表格 | `file_path` |
| `excel_to_markdown_local` | Excel → Markdown 表格 | `file_path` |
| `excel_to_json_local` | Excel → JSON | `file_path` |
| `excel_to_csv_local` | Excel → CSV | `file_path` |

## 命令行工具

项目附带独立的 CLI 工具，全局安装后可在任意目录直接使用：

```bash
# 用法
sks-convert-file <输入文件> <输出格式>

# 示例
sks-convert-file "C:\path\to\file.xlsx" html
sks-convert-file "C:\path\to\file.xlsx" markdown
sks-convert-file "C:\path\to\file.xlsx" json
sks-convert-file "C:\path\to\file.xlsx" csv
```

支持的输出格式：`html`、`markdown`（输出 `.md`）、`json`、`csv`

输出文件保存在输入文件同目录下，文件名保持一致仅更换扩展名。

## 项目结构

```
sks-convert-file-mcp/
├── src/
│   ├── index.js              # MCP 服务器入口（支持 --local 参数切换模式）
│   └── tools/
│       ├── excel.js          # Excel 转换核心模块（单一来源）
│       ├── convert.js        # 内容版 MCP 工具封装
│       └── convert-file.js   # 文件路径版 MCP 工具封装
├── convert-cli.js            # 独立 CLI 工具（引用核心模块）
└── package.json
```

### 架构说明

转换逻辑统一封装在核心模块中，MCP 工具和 CLI 工具共同引用，避免重复维护：

- **excel.js** - 纯转换函数，接收 Buffer，返回字符串
- **convert.js** - 内容传参版，处理 Base64 解码和 MCP 响应格式
- **convert-file.js** - 文件路径版，处理本地文件读取
- **convert-cli.js** - CLI 封装层，处理文件读写和命令行参数

## 技术栈

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - MCP 协议 SDK
- [xlsx](https://www.npmjs.com/package/xlsx) - Excel 文件解析
- [marked](https://www.npmjs.com/package/marked) - Markdown 转 HTML
- [yaml](https://www.npmjs.com/package/yaml) - YAML 解析
- [csv-parse](https://www.npmjs.com/package/csv-parse) / [csv-stringify](https://www.npmjs.com/package/csv-stringify) - CSV 处理
- [xml2js](https://www.npmjs.com/package/xml2js) - XML 解析

## License

MulanPSL-2.0
