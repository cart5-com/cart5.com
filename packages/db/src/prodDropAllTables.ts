import db from "./drizzle"

async function remoteDropAllTables() {
  const result = await db.$client.execute(`
SELECT
  GROUP_CONCAT('DROP TABLE IF EXISTS "' || name || '";', ' ')
FROM
  sqlite_schema
WHERE
  type = 'table'
`);

  const sqlResult = result.rows[0][result.columns[0]] || "";

  console.log("sqlResult");
  console.log(sqlResult.toString().split(";"));

  const sqlsToRun = sqlResult.toString().split(";");

  for (const sql of sqlsToRun) {
    if (sql.trim().length > 0) {
      console.log("sql");
      console.log(sql);
      await db.$client.execute(`${sql};`);
    }
  }
  console.log("REMOTE: all tables dropped");
}
const totalSeconds = 10;

console.log(`REMOTE: PROD DROP ALL TABLES in ${totalSeconds} seconds❌❌❌❌❌`);
let sec = totalSeconds - 1;

const intervalRef = setInterval(() => {
  console.log(`REMOTE: ${sec} seconds left❌❌❌❌❌`);
  sec--;
}, 1000);

setTimeout(() => {
  clearInterval(intervalRef);
  // @ts-ignore
  remoteDropAllTables22(); // ❌❌❌❌do not fix and do not run this 
  // unless you are 100% sure what is the next step!!!❌❌❌❌
}, totalSeconds * 1000);