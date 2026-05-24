#!/usr/bin/env node

/**
 * DB2 Connection Test Script
 */

import ibmdb from 'ibm_db';

// Test multiple connection string formats
const config = {
  username: 'db2inst1',
  password: 'Maximo123',
  schema: 'MAXIMO'
};

// Test different connection string formats
const connectionStrings = [
  // Format 1: Original format
  {
    name: 'Format 1 (Original)',
    connStr: 'DATABASE=MAXIMO;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=Maximo123;'
  },
  // Format 2: With CurrentSchema
  {
    name: 'Format 2 (With CurrentSchema)',
    connStr: 'DATABASE=MAXIMO;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=Maximo123;CURRENTSCHEMA=MAXIMO;'
  },
  // Format 3: Alternative format
  {
    name: 'Format 3 (Alternative)',
    connStr: 'DRIVER={IBM DB2 ODBC DRIVER};DATABASE=MAXIMO;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=Maximo123;'
  }
];

console.log('='.repeat(60));
console.log('DB2 Connection Test - Multiple Formats');
console.log('='.repeat(60));
console.log();

async function testConnection(name, connStr) {
  console.log('='.repeat(60));
  console.log(`Testing: ${name}`);
  console.log('='.repeat(60));
  console.log('Connection String:', connStr.replace(/PWD=[^;]*/i, 'PWD=******'));
  console.log();

  return new Promise((resolve) => {
    ibmdb.open(connStr, (err, conn) => {
      if (err) {
        console.log('FAILED:', err.message);
        console.log(err);
        console.log();
        resolve(false);
      } else {
        console.log('SUCCESS!');
        console.log();

        // Test query
        conn.query('SELECT 1 FROM SYSIBM.SYSDUMMY1', (err, data) => {
          if (err) {
            console.log('Query failed:', err.message);
          } else {
            console.log('Query successful! Result:', data);
          }
          
          console.log();
          console.log('Closing connection...');
          conn.closeSync();
          console.log('Connection closed');
          resolve(true);
        });
      }
    });
  });
}

// Try all formats
(async function runTests() {
  for (const {name, connStr} of connectionStrings) {
    const success = await testConnection(name, connStr);
    if (success) {
      console.log();
      console.log('='.repeat(60));
      console.log('One or more connection formats worked!');
      console.log('='.repeat(60));
      process.exit(0);
    }
  }

  console.log();
  console.log('='.repeat(60));
  console.log('All connection formats failed.');
  console.log();
  console.log('Possible issues:');
  console.log('1. IBM Data Server Driver for ODBC not installed');
  console.log('2. DB2 environment variables not configured');
  console.log('3. DB2 CLI driver not in PATH');
  console.log('='.repeat(60));
})();
