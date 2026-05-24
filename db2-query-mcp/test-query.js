
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JAVA_DIR = resolve(__dirname, 'java');
const JAVA_JAR = resolve(JAVA_DIR, 'jcc-11.5.9.0.jar');
const JAVA_CLASS = 'Db2Query';

process.env.JAVA_HOME = 'D:\\usr\\java\\jdk1.8.0_491x64';
process.env.DB2_JDBC_URL = 'jdbc:db2://localhost:50000/MAXIMO:currentSchema=MAXIMO;';
process.env.DB2_USERNAME = 'db2inst1';
process.env.DB2_PASSWORD = 'Maximo123';
process.env.DB2_SCHEMA = 'MAXIMO';

console.log('='.repeat(60));
console.log('Testing Query: select AUTOSCRIPT from AUTOSCRIPT');
console.log('='.repeat(60));
console.log();

const javaPath = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}\\bin\\java` : 'java';

const proc = spawn(javaPath, [
  '-cp',
  `.;${JAVA_JAR}`,
  JAVA_CLASS,
  'query',
  'select AUTOSCRIPT from AUTOSCRIPT',
  '100'
], {
  cwd: JAVA_DIR,
  env: process.env
});

let stdout = '';
let stderr = '';

proc.stdout?.on('data', (data) => {
  stdout += data.toString();
  process.stdout.write(data);
});

proc.stderr?.on('data', (data) => {
  stderr += data.toString();
  process.stderr.write(data);
});

proc.on('close', (code) => {
  console.log();
  console.log('='.repeat(60));
  if (code === 0) {
    console.log('Query executed successfully!');
    try {
      const result = JSON.parse(stdout.trim());
      console.log(`Total rows: ${result.rowCount}`);
      console.log('='.repeat(60));
    } catch (e) {
      console.log('Raw output:', stdout);
    }
  } else {
    console.log(`Query failed with code: ${code}`);
    console.error('Error:', stderr);
  }
});

proc.on('error', (err) => {
  console.error('Failed to start Java:', err);
});
