# Node.js 调用 Java 中文乱码解决方案

## 问题原因

在 Windows 系统上，Java 程序默认使用系统编码（通常是 GBK）输出，而 Node.js 默认使用 UTF-8 编码处理数据。当 Node.js 的 `child_process.spawn()` 调用 Java 程序时，如果编码不匹配，就会出现中文乱码。

## 解决方案

### 1. 安装 iconv-lite 库

```bash
npm install iconv-lite
```

### 2. 正确导入 iconv-lite

```typescript
import iconv from 'iconv-lite';
```

**注意**：不要使用 `import * as iconv from 'iconv-lite'`，这会导致 `iconv.decode is not a function` 错误。

### 3. Java 进程配置

在调用 Java 时添加 `-Dfile.encoding=UTF-8` 参数：

```typescript
const javaArgs = [
  '-Dfile.encoding=UTF-8',  // 设置 Java 输出编码为 UTF-8
  '-cp',
  '.;jcc-11.5.9.0.jar;json-20251224.jar',
  'Db2Query',
  'query',
  'SELECT * FROM table'
];
```

### 4. Node.js 处理输出

使用 `iconv.decode()` 方法正确解码 Java 的输出：

```typescript
import { spawn } from 'child_process';
import iconv from 'iconv-lite';

const proc = spawn('java', javaArgs, {
  cwd: './java',
  env: process.env
});

let stdout = '';
let stderr = '';

proc.stdout?.on('data', (data) => {
  stdout += iconv.decode(data, 'utf-8');
});

proc.stderr?.on('data', (data) => {
  stderr += iconv.decode(data, 'utf-8');
});

proc.on('close', (code) => {
  if (code === 0) {
    console.log(stdout);
  } else {
    console.error(stderr);
  }
});
```

## 完整示例

```typescript
import { spawn } from 'child_process';
import iconv from 'iconv-lite';

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  truncated: boolean;
}

export class JavaService {
  async executeJavaCommand(mode: string, ...args: string[]): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const javaArgs = [
        '-Dfile.encoding=UTF-8',  // 关键：设置 Java 输出编码
        '-cp',
        '.;driver.jar;json.jar',
        'MainClass',
        mode,
        ...args
      ];

      const env = {
        ...process.env,
        DB2_JDBC_URL: process.env.DB2_JDBC_URL,
        DB2_USERNAME: process.env.DB2_USERNAME,
        DB2_PASSWORD: process.env.DB2_PASSWORD
      };

      let stdout = '';
      let stderr = '';

      const proc = spawn('java', javaArgs, {
        cwd: './java',
        env
      });

      proc.stdout?.on('data', (data) => {
        stdout += iconv.decode(data, 'utf-8');  // 关键：使用 iconv 解码
      });

      proc.stderr?.on('data', (data) => {
        stderr += iconv.decode(data, 'utf-8');
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Java process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout) as QueryResult;
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Java output: ${error}`));
        }
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }
}
```

## 常见错误

### 错误 1：`iconv.decode is not a function`

**原因**：错误导入 iconv-lite

```typescript
import * as iconv from 'iconv-lite';  // 错误
```

**解决**：

```typescript
import iconv from 'iconv-lite';  // 正确
```

### 错误 2：中文仍然乱码

**原因**：没有设置 Java 输出编码

**解决**：添加 `-Dfile.encoding=UTF-8` 参数

### 错误 3：TypeScript 编译错误

**原因**：缺少类型定义

**解决**：

```bash
npm install --save-dev @types/iconv-lite
```

**注意**：iconv-lite 0.6.0+ 版本自带类型定义，不需要额外安装。

## 测试方法

### 1. 创建测试工具

在 MCP 服务器中添加测试工具：

```typescript
{
  name: "test_chinese_encoding",
  description: "Test Chinese character encoding",
  inputSchema: {
    type: "object",
    properties: {},
  },
}
```

### 2. 实现测试逻辑

```typescript
case "test_chinese_encoding": {
  result = {
    message: "中文测试 - Node.js 直接返回中文",
    test: "这是一段测试中文，包含特殊字符：你好世界！🌟✨🎉",
    encoding: "UTF-8",
    platform: process.platform,
    nodeVersion: process.version
  };
  break;
}
```

### 3. 测试步骤

1. 调用 `test_chinese_encoding` 工具，检查 Node.js 本身中文是否正常
2. 如果 Node.js 中文正常，调用数据库查询工具
3. 对比结果，确定问题所在

## Windows 系统编码设置

### 检查系统编码

1. 打开"设置" → "时间和语言" → "语言和区域"
2. 点击"管理语言设置"
3. 查看"系统区域设置"

### 启用 UTF-8 支持（可选）

1. 在"管理语言设置"中，勾选"Beta 版：使用 Unicode UTF-8 提供全球语言支持"
2. 重启系统

**注意**：启用后系统默认编码变为 UTF-8，但仍建议使用 iconv-lite 确保兼容性。

## 总结

1. **安装 iconv-lite**：`npm install iconv-lite`
2. **正确导入**：`import iconv from 'iconv-lite'`
3. **Java 参数**：添加 `-Dfile.encoding=UTF-8`
4. **解码输出**：使用 `iconv.decode(data, 'utf-8')`
5. **测试验证**：创建测试工具验证编码

按照以上步骤，可以完全解决 Node.js 调用 Java 时的中文乱码问题。