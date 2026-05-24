# DB2 Query MCP 测试指南

## 1. 安装依赖

```bash
cd db2-query-mcp
npm install
```

## 2. 编译项目

```bash
npm run build
```

## 3. 配置环境变量

### Windows PowerShell

```powershell
$env:DB2_JDBC_URL="DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP"
$env:DB2_USERNAME="db2user"
$env:DB2_PASSWORD="db2pass"
$env:DB2_SCHEMA="MYSCHEMA"
$env:MCP_PORT="21002"
```

### Windows CMD

```cmd
set DB2_JDBC_URL=DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP
set DB2_USERNAME=db2user
set DB2_PASSWORD=db2pass
set DB2_SCHEMA=MYSCHEMA
set MCP_PORT=21002
```

### Linux/Mac

```bash
export DB2_JDBC_URL="DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP"
export DB2_USERNAME="db2user"
export DB2_PASSWORD="db2pass"
export DB2_SCHEMA="MYSCHEMA"
export MCP_PORT="21002"
```

## 4. 测试数据库连接

```bash
node dist/test-connection.js
```

如果连接成功，会显示数据库信息和表数量。

## 5. 启动 MCP 服务器

### 方式一：直接运行

```bash
npm start
```

启动后会显示：
```
============================================================
DB2 Query MCP Server
============================================================
启动模式: SSE (Server-Sent Events)
监听端口: 21002
============================================================
✓ 数据库连接成功

✓ MCP 服务器已启动
  SSE 端点: http://localhost:21002/sse
  健康检查: http://localhost:21002/health
```

### 方式二：使用 npx

```bash
npx db2-query-mcp
```

## 6. 测试 MCP 服务

### 6.1 健康检查

```bash
curl http://localhost:21002/health
```

预期响应：
```json
{
  "status": "ok",
  "service": "db2-query-mcp",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6.2 使用 MCP Inspector 测试

安装 MCP Inspector：

```bash
npm install -g @modelcontextprotocol/inspector
```

运行 Inspector：

```bash
mcp-inspector node dist/index.js
```

### 6.3 手动测试 SSE 连接

创建一个测试脚本 `test-sse.js`：

```javascript
const EventSource = require('eventsource');

const sse = new EventSource('http://localhost:21002/sse');

sse.onopen = () => {
  console.log('SSE 连接已建立');
};

sse.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

sse.onerror = (error) => {
  console.error('SSE 错误:', error);
};
```

## 7. 在 Claude Desktop 中测试

### 7.1 配置 Claude Desktop

编辑 `claude_desktop_config.json`：

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

添加配置：

```json
{
  "mcpServers": {
    "db2-query": {
      "command": "node",
      "args": ["E:\\gitwork\\npx-mcp-collection\\db2-query-mcp\\dist\\index.js"],
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

### 7.2 重启 Claude Desktop

完全关闭 Claude Desktop 后重新打开。

### 7.3 测试工具

在 Claude 对话中测试：

```
请帮我查询数据库中有哪些表
```

或

```
请查询 EMPLOYEE 表的字段信息
```

## 8. 常见问题排查

### 问题 1: 数据库连接失败

**症状：**
```
❌ 连接失败: [IBM][CLI Driver] SQL30081N
```

**解决：**
- 检查 JDBC URL 是否正确
- 确认数据库服务是否启动
- 检查防火墙设置
- 验证用户名密码

### 问题 2: 缺少环境变量

**症状：**
```
❌ 错误: 缺少必要的环境变量
```

**解决：**
- 确保所有必需的环境变量已设置
- 检查环境变量名称拼写

### 问题 3: 端口被占用

**症状：**
```
Error: listen EADDRINUSE: address already in use :::21002
```

**解决：**
- 更换端口：`$env:MCP_PORT="21003"`
- 或关闭占用该端口的程序

### 问题 4: ibm_db 安装失败

**症状：**
```
npm install 时 ibm_db 编译失败
```

**解决：**
- 确保已安装 Python 2.7 或 3.x
- 安装 Visual Studio Build Tools (Windows)
- 或使用预编译版本：
  ```bash
  npm install ibm_db --build-from-source
  ```

## 9. 日志查看

启动后会自动创建 `logs/` 目录，日志文件位于：

```
logs/db2-query-mcp.log
```

查看实时日志：

```bash
tail -f logs/db2-query-mcp.log
```

## 10. 安全测试

测试 SQL 注入防护：

```
尝试执行: INSERT INTO test VALUES (1)
预期结果: 错误 - SQL 中包含禁止的操作: INSERT

尝试执行: DROP TABLE test
预期结果: 错误 - SQL 中包含禁止的操作: DROP

尝试执行: SELECT * FROM test; DELETE FROM test
预期结果: 错误 - SQL 中包含禁止的操作: DELETE
```

## 11. 性能测试

测试大数据量查询：

```sql
-- 测试返回 1000 行数据
SELECT * FROM LARGE_TABLE FETCH FIRST 1000 ROWS ONLY
```

预期：查询会被自动限制在 1000 行以内。
