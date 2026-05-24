# DB2 Query MCP

一个基于 Node.js 的 DB2 数据库查询 MCP (Model Context Protocol) 服务，仅支持只读查询操作。

## 特性

- 🔒 **只读安全**: 严格限制仅允许 SELECT 查询，禁止任何数据修改操作
- 🌏 **中文支持**: 完美支持中文字符，解决 Windows 编码问题
- 📊 **元数据查询**: 提供表列表、列信息、数据库信息等查询工具
- 🔧 **灵活配置**: 通过环境变量配置数据库连接
- ☕ **Java 驱动**: 使用官方 DB2 JDBC 驱动，性能稳定
- 📝 **TypeScript**: 使用 TypeScript 编写，提供类型安全

## 安装

### 全局安装

```bash
npm install -g shoukaiseki-db2-query-mcp
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

## 环境要求

- Node.js >= 18.0.0
- Java 8 或更高版本
- DB2 数据库

## 配置

通过环境变量配置数据库连接：

| 环境变量 | 必填 | 说明 |
|---------|------|------|
| `JAVA_HOME` | ✅ | Java 安装路径 |
| `DB2_JDBC_URL` | ✅ | JDBC 连接字符串 |
| `DB2_USERNAME` | ✅ | 数据库用户名 |
| `DB2_PASSWORD` | ✅ | 数据库密码 |
| `DB2_SCHEMA` | ❌ | 默认 Schema 名称 |

### 配置示例

```bash
# Linux/Mac
export JAVA_HOME="/usr/lib/jvm/java-8-openjdk"
export DB2_JDBC_URL="jdbc:db2://localhost:50000/MYDB:currentSchema=MYSCHEMA;"
export DB2_USERNAME="db2user"
export DB2_PASSWORD="db2pass"
export DB2_SCHEMA="MYSCHEMA"

# Windows PowerShell
$env:JAVA_HOME="D:\usr\java\jdk1.8.0_491x64"
$env:DB2_JDBC_URL="jdbc:db2://localhost:50000/MYDB:currentSchema=MYSCHEMA;"
$env:DB2_USERNAME="db2user"
$env:DB2_PASSWORD="db2pass"
$env:DB2_SCHEMA="MYSCHEMA"
```

## MCP 配置

在 MCP 客户端配置文件中添加：

### 方式 1：全局安装（推荐，启动快）

```bash
npm install -g shoukaiseki-db2-query-mcp
```

```json
{
  "mcpServers": {
    "db2-query": {
      "command": "shoukaiseki-db2-query-mcp",
      "env": {
        "JAVA_HOME": "D:\\usr\\java\\jdk1.8.0_491x64",
        "DB2_JDBC_URL": "jdbc:db2://localhost:50000/MYDB:currentSchema=MYSCHEMA;",
        "DB2_USERNAME": "db2user",
        "DB2_PASSWORD": "db2pass",
        "DB2_SCHEMA": "MYSCHEMA"
      }
    }
  }
}
```

### 方式 2：使用 npx（无需安装，自动使用最新版本）

```json
{
  "mcpServers": {
    "db2-query": {
      "command": "npx",
      "args": ["shoukaiseki-db2-query-mcp"],
      "env": {
        "JAVA_HOME": "D:\\usr\\java\\jdk1.8.0_491x64",
        "DB2_JDBC_URL": "jdbc:db2://localhost:50000/MYDB:currentSchema=MYSCHEMA;",
        "DB2_USERNAME": "db2user",
        "DB2_PASSWORD": "db2pass",
        "DB2_SCHEMA": "MYSCHEMA"
      }
    }
  }
}
```

### 方式 3：使用 npx 指定版本

```json
{
  "mcpServers": {
    "db2-query": {
      "command": "npx",
      "args": ["shoukaiseki-db2-query-mcp@1.0.0"],
      "env": {
        "JAVA_HOME": "D:\\usr\\java\\jdk1.8.0_491x64",
        "DB2_JDBC_URL": "jdbc:db2://localhost:50000/MYDB:currentSchema=MYSCHEMA;",
        "DB2_USERNAME": "db2user",
        "DB2_PASSWORD": "db2pass",
        "DB2_SCHEMA": "MYSCHEMA"
      }
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

### 5. test_chinese_encoding

测试中文编码是否正常。

**参数：** 无

**返回示例：**
```json
{
  "message": "中文测试 - Node.js 直接返回中文",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "test": "这是一段测试中文，包含特殊字符：你好世界！🌟✨🎉",
  "encoding": "UTF-8",
  "platform": "win32",
  "nodeVersion": "v20.20.2"
}
```

## 安全特性

### SQL 注入防护

- 仅允许以 `SELECT` 开头的语句
- 禁止以下关键词：`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `TRUNCATE`, `MERGE`, `CALL`, `EXEC`, `GRANT`, `REVOKE`, `LOCK`

### 只读保障

- 自动添加 `FOR READ ONLY` 后缀
- 使用 `FETCH FIRST n ROWS ONLY` 限制返回行数

## 中文编码支持

本项目完美解决了 Windows 系统上 Node.js 调用 Java 时的中文乱码问题：

1. 使用 `iconv-lite` 库正确处理编码转换
2. Java 进程添加 `-Dfile.encoding=UTF-8` 参数
3. 提供测试工具验证编码是否正常

详细解决方案请参考 [ENCODING_FIX.md](ENCODING_FIX.md)。

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

# 打包
npm pack
```

## 测试

### 测试数据库连接

```bash
cd java
java\test-connection.bat
```

### 测试中文编码

在 MCP 客户端中调用 `test_chinese_encoding` 工具。

## 依赖

- `@modelcontextprotocol/sdk`: MCP SDK
- `iconv-lite`: 字符编码转换
- Java 8+: 运行时依赖
- DB2 JDBC 驱动: 内置

## 项目结构

```
db2-query-mcp/
├── src/                    # TypeScript 源码
│   ├── index.ts           # MCP 服务器入口
│   └── db2-query-service.ts  # DB2 查询服务
├── dist/                   # 编译后的 JavaScript
├── java/                   # Java 相关文件
│   ├── Db2Query.java      # Java 查询类
│   ├── Db2Query.class     # 编译后的类
│   ├── jcc-11.5.9.0.jar   # DB2 JDBC 驱动
│   ├── json-20251224.jar  # JSON 库
│   ├── build.bat          # 编译脚本
│   └── test-connection.bat # 测试脚本
├── package.json
├── tsconfig.json
├── README.md
└── ENCODING_FIX.md        # 编码问题解决方案
```

## 许可证

MIT