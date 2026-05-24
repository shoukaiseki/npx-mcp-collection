import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ibmdb = require('ibm_db');

console.log("✅ ibm_db 模块加载成功！");
console.log("   驱动版本:", ibmdb.version);

// 替换为你的真实连接信息
const connStr = "DATABASE=MAXIMO;HOSTNAME=localhost;PORT=50000;UID=db2inst1;PWD=Maximo123;PROTOCOL=TCPIP";

console.log("\n正在尝试连接数据库...");
console.log("连接字符串:", connStr);

// 输出关键环境信息用于诊断
console.log('\n== 环境诊断 ==');
console.log('Node version:', process.version);
console.log('Platform:', process.platform, 'Arch:', process.arch);
console.log('process.execPath:', process.execPath);
console.log('PATH (truncated):', (process.env.PATH || '').split(';').slice(0,6).join(';'));
console.log('IBM_DB_HOME:', process.env.IBM_DB_HOME || '<not set>');
console.log('IBM_DB_DIR:', process.env.IBM_DB_DIR || '<not set>');
console.log('DB2_HOME:', process.env.DB2_HOME || '<not set>');
console.log('DB2INSTANCE:', process.env.DB2INSTANCE || '<not set>');

try {
    ibmdb.open(connStr, (err, conn) => {
        if (err) {
            console.error("\n❌ 连接失败:");
            console.error(err);

            // 提供具体建议
            const msg = err && err.message ? err.message : '';
            if (msg.includes("SQL30081N")) {
                console.log("\n💡 建议: 检查主机地址、端口是否正确，DB2服务是否启动，防火墙是否拦截。");
            } else if (msg.includes("SQL10007N") || msg.includes("authentication")) {
                console.log("\n💡 建议: 检查用户名和密码是否正确。");
            } else if (msg.includes("CLI0600E")) {
                console.log("\n💡 建议: 驱动加载异常。请确认已将 DB2 客户端/驱动的 bin 目录加入 PATH，且 Node 与驱动位数匹配（64-bit/32-bit）。");
            }
        } else {
            console.log("\n✅ 连接成功！");

            // 执行简单查询
            conn.query("SELECT 1 AS RESULT FROM SYSIBM.SYSDUMMY1", (err, data) => {
                if (err) {
                    console.error("查询失败:", err);
                } else {
                    console.log("查询结果:", data);
                }

                // 关闭连接
                conn.close(() => {
                    console.log("连接已关闭");
                });
            });
        }
    });
} catch (ex) {
    console.error('\n❌ 同步抛出异常 (open 调用未进入回调):', ex && ex.message ? ex.message : ex);
    console.error(ex);
    console.log('\n💡 建议: 可能是本地 DB2/ODBC 驱动未正确加载，检查 IBM DB2 C 运行库是否安装、环境变量 PATH 是否包含驱动 bin 目录，以及 Node 与驱动的位数是否匹配。');
}

// -- End of normal flow

