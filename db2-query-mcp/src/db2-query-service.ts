
import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JAVA_DIR = path.resolve(__dirname, '..', 'java');
const JAVA_JAR = path.join(JAVA_DIR, 'jcc-11.5.9.0.jar');
const JAVA_CLASS = 'Db2Query';

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  truncated: boolean;
}

export class Db2QueryService {
  private jdbcUrl: string;
  private username: string;
  private password: string;
  private schema: string;
  private javaPath: string;

  constructor() {
    this.jdbcUrl = process.env.DB2_JDBC_URL || '';
    this.username = process.env.DB2_USERNAME || '';
    this.password = process.env.DB2_PASSWORD || '';
    this.schema = process.env.DB2_SCHEMA || '';
    this.javaPath = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
    
    if (!this.jdbcUrl) {
      console.warn('[WARN] DB2_JDBC_URL is not set');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('[INFO] Testing database connection...');
      await this.executeJavaCommand('info');
      console.log('[INFO] Database connection successful!');
      return true;
    } catch (error) {
      console.error('[ERROR] Database connection failed:', error);
      return false;
    }
  }

  async queryBySql(sql: string, limit: number = 200): Promise<QueryResult> {
    console.log('[INFO] Executing query:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
    
    const result = await this.executeJavaCommand('query', sql, limit.toString());
    return result;
  }

  async queryTables(tableNamePattern: string = '%', schemaPattern?: string, limit: number = 200): Promise<QueryResult> {
    const schema = schemaPattern || this.schema;
    console.log(`[INFO] Querying tables: schema=${schema}, table=${tableNamePattern}`);
    
    const result = await this.executeJavaCommand('tables', tableNamePattern, schema, limit.toString());
    return result;
  }

  async queryTableColumns(tableName: string, schemaName?: string): Promise<QueryResult> {
    const schema = schemaName || this.schema;
    console.log(`[INFO] Querying columns: schema=${schema}, table=${tableName}`);
    
    const result = await this.executeJavaCommand('columns', tableName, schema);
    return result;
  }

  async getDatabaseInfo(): Promise<QueryResult> {
    console.log('[INFO] Getting database info...');
    const result = await this.executeJavaCommand('info');
    return result;
  }

  private executeJavaCommand(mode: string, ...args: string[]): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const javaArgs = [
        '-cp',
        `.;${JAVA_JAR}`,
        JAVA_CLASS,
        mode,
        ...args
      ];

      const env = {
        ...process.env,
        DB2_JDBC_URL: this.jdbcUrl,
        DB2_USERNAME: this.username,
        DB2_PASSWORD: this.password,
        DB2_SCHEMA: this.schema
      };

      let stdout = '';
      let stderr = '';

      const proc = spawn(this.javaPath, javaArgs, {
        cwd: JAVA_DIR,
        env
      });

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Java process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const output = stdout.trim();
          if (!output) {
            reject(new Error('Java process returned empty output'));
            return;
          }

          const result = JSON.parse(output) as QueryResult;
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Java output: ${error}\nOutput: ${stdout}`));
        }
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }
}
