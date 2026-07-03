# DB2 Query MCP

一个基于 Node.js 的 DB2 数据库查询 MCP (Model Context Protocol) 服务，仅支持只读查询操作。

## 特性

- 🔒 **只读安全**: 严格限制仅允许 SELECT 查询，禁止任何数据修改操作
- 🌏 **中文支持**: 完美支持中文字符，解决 Windows 编码问题
- 📊 **Maximo 元数据查询**: 提供 MAXOBJECT、MAXATTRIBUTE 等 Maximo 元数据表专用查询工具
- 📄 **分页查询**: 支持 offset/limit 分页，方便大数据量浏览
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
| `LANGCODE` | ❌ | 多语言查询语言代码，默认 `ZH` |

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
        "DB2_SCHEMA": "MYSCHEMA",
        "LANGCODE": "ZH"
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
      "args": ["shoukaiseki-db2-query-mcp@1.0.1"],
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

执行只读 SQL 查询，支持分页。

**参数：**
- `sql` (string, 必填): SELECT 查询语句
- `limit` (number, 可选): 每页返回行数上限，默认 200，最大 1000
- `offset` (number, 可选): 跳过的行数，用于分页（默认 0）

**示例：**
```json
// 第1页
{
  "sql": "SELECT * FROM EMPLOYEE WHERE DEPT = 'IT'",
  "limit": 100,
  "offset": 0
}

// 第2页
{
  "sql": "SELECT * FROM EMPLOYEE WHERE DEPT = 'IT'",
  "limit": 100,
  "offset": 100
}
```

### 2. query_maxobjects

按对象名称查询 MAXOBJECT 表，返回 Maximo 对象元数据信息，支持多语言描述字段。

**参数：**
- `objectName` (string, 必填): 对象名称（如 `ITEM`, `WORKORDER`, `ASSET`）
- `schema` (string, 可选): Schema 名称，默认为配置中的 schema
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

**返回字段：**
`CLASSNAME`, `DESCRIPTION`, `EAUDITENABLED`, `EAUDITFILTER`, `ENTITYNAME`, `ESIGFILTER`, `EXTENDSOBJECT`, `HASLD`, `IMPORTED`, `INTERNAL`, `ISVIEW`, `LANGCODE`, `MAINOBJECT`, `MAXOBJECTID`, `OBJECTNAME`, `PERSISTENT`, `RESOURCETYPE`, `SERVICENAME`, `SITEORGTYPE`, `TEXTDIRECTION`, `USERDEFINED`, `LZH_DESCRIPTION`(多语言描述)

### 3. query_maxattributes

按对象名称查询 MAXATTRIBUTE 表，返回 Maximo 属性/字段元数据信息，支持多语言标题和备注。

**参数：**
- `objectName` (string, 必填): 对象名称（如 `WORKORDER`, `ASSET`, `LOCATIONS`）
- `schema` (string, 可选): Schema 名称，默认为配置中的 schema
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000
- `langCode` (string, 可选): 多语言代码覆盖环境变量 LANGCODE，默认 `ZH`

**示例：**
```json
{
  "objectName": "WORKORDER"
}
```

**返回字段：**
`ALIAS`, `ATTRIBUTENAME`, `ATTRIBUTENO`, `AUTOKEYNAME`, `CANAUTONUM`, `CLASSNAME`, `COLUMNNAME`, `COMPLEXEXPRESSION`, `DEFAULTVALUE`, `DOMAINID`, `EAUDITENABLED`, `ENTITYNAME`, `ESIGENABLED`, `EXTENDED`, `HANDLECOLUMNNAME`, `ISLDOWNER`, `ISPOSITIVE`, `LENGTH`, `LOCALIZABLE`, `MAXATTRIBUTEID`, `MAXTYPE`, `MLINUSE`, `MLSUPPORTED`, `MUSTBE`, `OBJECTNAME`, `PERSISTENT`, `PRIMARYKEYCOLSEQ`, `REMARKS`, `REQUIRED`, `RESTRICTED`, `SAMEASATTRIBUTE`, `SAMEASOBJECT`, `SCALE`, `SEARCHTYPE`, `TEXTDIRECTION`, `TITLE`, `USERDEFINED`, `LZH_TITLE`(多语言标题), `LZH_REMARKS`(多语言备注)

### 4. get_database_info

获取数据库基本信息。

**参数：** 无

### 5. query_active_sites

查询有效的站点和组织，对应 `SITE` 表 `ACTIVE=1`。

**参数：**
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

### 6. query_active_persons

查询有效的用户，对应 `PERSON` 表 `status='ACTIVE'`。

**参数：**
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

### 7. query_active_items

查询有效的主项目，排除已废弃项目，过滤 ITEMSET 和 ITEM 类型。

**参数：**
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

### 8. query_inventory

查询当前库存信息，对应 `INVENTORY` 表。

**参数：**
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

### 9. query_invbalances

查询库存余量，包含 itemnum、location、siteid 关联信息。

**参数：**
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

### 10. query_invlot

查询库存批次，包含 itemnum、location、siteid 关联信息。

**参数：**
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

### 11. query_companies

查询供应商/公司信息，对应 `COMPANIES` 表。

**参数：**
- `limit` (number, 可选): 返回行数上限，默认 200，最大 1000

## 安全特性

### SQL 注入防护

- 仅允许以 `SELECT` 开头的语句
- 禁止以下关键词：`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `TRUNCATE`, `MERGE`, `CALL`, `EXEC`, `GRANT`, `REVOKE`, `LOCK`

### 只读保障

- 自动添加 `FOR READ ONLY` 后缀
- 使用 `OFFSET n ROWS FETCH NEXT m ROWS ONLY` 实现分页查询

## 中文编码支持

本项目完美解决了 Windows 系统上 Node.js 调用 Java 时的中文乱码问题：

1. 使用 `iconv-lite` 库正确处理编码转换
2. Java 进程添加 `-Dfile.encoding=UTF-8` 参数
3. 提供测试工具验证编码是否正常（调用 `get_database_info` 查看返回结果）

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

在 MCP 客户端中调用 `query_maxobjects` 或 `query_maxattributes` 工具，检查返回的中文字段是否正确显示。

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