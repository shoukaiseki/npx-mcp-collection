# DB2 Query MCP

一个基于 Node.js 的 DB2 数据库查询 MCP (Model Context Protocol) 服务，仅支持只读查询操作。

## 特性

- 🔒 **只读安全**: 严格限制仅允许 SELECT 查询，禁止任何数据修改操作
- 🚀 **SSE 模式**: 支持 Server-Sent Events 通信协议
- 📊 **元数据查询**: 提供表列表、列信息、数据库信息等查询工具
- 🔧 **灵活配置**: 通过环境变量配置数据库连接
- 📝 **TypeScript**: 使用 TypeScript 编写，提供类型安全

## 安装

### 使用 npx (推荐)

```bash
npx db2-query-mcp
```

### 本地安装

```bash
# 克隆或下载项目
cd db2-query-mcp

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 启动服务
npm start
```

## 配置

通过环境变量配置数据库连接：

| 环境变量 | 必填 | 说明 |
|---------|------|------|
| `DB2_JDBC_URL` | ✅ | JDBC 连接字符串，格式: `DATABASE=xxx;HOSTNAME=xxx;PORT=xxx;PROTOCOL=TCPIP` |
| `DB2_USERNAME` | ✅ | 数据库用户名 |
| `DB2_PASSWORD` | ✅ | 数据库密码 |
| `DB2_SCHEMA` | ❌ | 默认 Schema 名称 |
| `MCP_PORT` | ❌ | MCP 服务端口，默认 `21002` |

### 配置示例

```bash
# Linux/Mac
export DB2_JDBC_URL="DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP"
export DB2_USERNAME="db2user"
export DB2_PASSWORD="db2pass"
export DB2_SCHEMA="MYSCHEMA"
export MCP_PORT="21002"

# Windows PowerShell
$env:DB2_JDBC_URL="DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP"
$env:DB2_USERNAME="db2user"
$env:DB2_PASSWORD="db2pass"
$env:DB2_SCHEMA="MYSCHEMA"
$env:MCP_PORT="21002"
```

## MCP 配置

在 MCP 客户端配置文件中添加：

```json
{
  "mcpServers": {
    "db2-query": {
      "command": "npx",
      "args": ["db2-query-mcp"],
      "env": {
        "DB2_JDBC_URL": "DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP",
        "DB2_USERNAME": "db2user",
        "DB2_PASSWORD": "db2pass",
        "DB2_SCHEMA": "MYSCHEMA"
      }
    }
  }
}
```

或者使用 SSE 模式：

```json
{
  "mcpServers": {
    "db2-query": {
      "url": "http://localhost:21002/sse"
    }
  }
}
```

## 可用工具

### 1. query_by_sql

执行只读 SQL 查询。

**参数：**
- `sql` (string, 必填): SELECT 查询语句
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

**示例：**
```json
{
  "sql": "SELECT * FROM EMPLOYEE WHERE DEPT = 'IT'",
  "limit": 100
}
```

### 2. query_tables

查询数据库中的表列表。

**参数：**
- `tableName` (string, 可选): 表名关键词，支持 `%` 通配符
- `schema` (string, 可选): Schema 名称，默认为配置中的 schema
- `limit` (number, 可选): 返回行数上限，默认 200

**示例：**
```json
{
  "tableName": "%EMP%",
  "schema": "MYSCHEMA",
  "limit": 50
}
```

### 3. query_table_columns

查询指定表的列/字段定义信息。

**参数：**
- `tableName` (string, 必填): 表名
- `schema` (string, 可选): Schema 名称

**示例：**
```json
{
  "tableName": "EMPLOYEE",
  "schema": "MYSCHEMA"
}
```

### 4. get_database_info

获取数据库基本信息。

**参数：** 无

## 安全特性

### SQL 注入防护

- 仅允许以 `SELECT` 开头的语句
- 禁止以下关键词：`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `TRUNCATE`, `MERGE`, `CALL`, `EXEC`, `GRANT`, `REVOKE`, `LOCK`

### 只读保障

- 自动添加 `FOR READ ONLY` 后缀
- 使用 `FETCH FIRST n ROWS ONLY` 限制返回行数

## 开发

```bash
# 安装依赖
npm install

# 开发模式（自动编译）
npm run dev

# 构建
npm run build

# 运行
npm start
```

## 依赖

- `@modelcontextprotocol/sdk`: MCP SDK
- `ibm_db`: DB2 数据库驱动
- `express`: Web 服务器框架

## 许可证

MIT
