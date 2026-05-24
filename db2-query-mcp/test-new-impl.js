
import { Db2QueryService } from './dist/db2-query-service.js';

process.env.JAVA_HOME = 'D:\\usr\\java\\jdk1.8.0_491x64';
process.env.DB2_JDBC_URL = 'jdbc:db2://localhost:50000/MAXIMO:currentSchema=MAXIMO;';
process.env.DB2_USERNAME = 'db2inst1';
process.env.DB2_PASSWORD = 'Maximo123';
process.env.DB2_SCHEMA = 'MAXIMO';

async function test() {
  console.log('='.repeat(60));
  console.log('Testing new DB2 Query Service (Java Implementation)');
  console.log('='.repeat(60));
  console.log();

  const service = new Db2QueryService();

  try {
    // Test 1: Database info
    console.log('[1] Getting database info...');
    const info = await service.getDatabaseInfo();
    console.log('✓ Success:', JSON.stringify(info, null, 2));
    console.log();

    // Test 2: Query tables
    console.log('[2] Querying tables...');
    const tables = await service.queryTables('%', 'MAXIMO', 5);
    console.log(`✓ Found ${tables.rowCount} tables`);
    console.log('  Sample:', JSON.stringify(tables.rows.slice(0, 2), null, 2));
    console.log();

    // Test 3: Query by SQL
    console.log('[3] Executing SQL query...');
    const queryResult = await service.queryBySql('SELECT * FROM MAXIMO.DEPLOYMENTRESOURCES FETCH FIRST 5 ROWS ONLY', 5);
    console.log(`✓ Query returned ${queryResult.rowCount} rows`);
    console.log('  Sample:', JSON.stringify(queryResult.rows, null, 2));
    console.log();

    console.log('='.repeat(60));
    console.log('All tests passed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

test();
