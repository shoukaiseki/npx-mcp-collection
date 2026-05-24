#!/usr/bin/env node

/**
 * DB2 连接测试脚本
 * 用于验证数据库配置是否正确
 */

import ibmdb from "ibm_db";

function getDbConfigFromEnv() {
  const jdbcUrl = process.env.DB2_JDBC_URL;
  const username = process.env.DB2_USERNAME;
  const password = process.env.DB2_PASSWORD;

  if (!jdbcUrl || !username || !password) {
    console.error("❌ 错误: 缺少必要的环境变量");
    console.error("\n请设置以下环境变量:");
    console.error("  DB2_JDBC_URL    - JDBC 连接字符串");
    console.error("  DB2_USERNAME    - 数据库用户名");
    console.error("  DB2_PASSWORD    - 数据库密码");
    console.error("\n示例 (PowerShell):");
    console.error('  $env:DB2_JDBC_URL="DATABASE=MYDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP"');
    console.error('  $env:DB2_USERNAME="db2user"');
    console.error('  $env:DB2_PASSWORD="db2pass"');
    process.exit(1);
  }

  return { jdbcUrl, username, password };
}

async function testConnection() {
  console.log("=".repeat(60));
  console.log("DB2 连接测试");
  console.log("=".repeat(60));

  const config = getDbConfigFromEnv();
  const connStr = `${config.jdbcUrl};UID=${config.username};PWD=${config.password}`;

  console.log("\n连接字符串:");
  console.log(`  ${config.jdbcUrl};UID=${config.username};PWD=***`);

  console.log("\n正在连接数据库...");

  try {
    const conn = await new Promise<any>((resolve, reject) => {
      ibmdb.open(connStr, (err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });

    console.log("✅ 数据库连接成功!");

    // 测试查询
    console.log("\n执行测试查询...");
    const result = await new Promise<any>((resolve, reject) => {
      conn.query(
        `SELECT 
          CURRENT SERVER AS DB_NAME,
          CURRENT USER AS DB_USER,
          CURRENT SCHEMA AS DB_SCHEMA
        FROM SYSIBM.SYSDUMMY1`,
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });

    console.log("\n📊 数据库信息:");
    console.log(`  数据库名: ${result[0].DB_NAME}`);
    console.log(`  当前用户: ${result[0].DB_USER}`);
    console.log(`  当前Schema: ${result[0].DB_SCHEMA}`);

    // 查询表数量
    const tableCount = await new Promise<any>((resolve, reject) => {
      conn.query(
        `SELECT COUNT(*) AS CNT FROM SYSCAT.TABLES WHERE TYPE = 'T'`,
        (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data[0].CNT);
          }
        }
      );
    });

    console.log(`  表数量: ${tableCount}`);

    // 关闭连接
    conn.close((err: any) => {
      if (err) {
        console.error("\n⚠️ 关闭连接时出错:", err.message);
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ 所有测试通过!");
    console.log("=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ 连接失败:");
    console.error(`  ${error.message}`);
    console.log("\n" + "=".repeat(60));
    console.log("❌ 测试未通过");
    console.log("=".repeat(60));
    process.exit(1);
  }
}

testConnection();
