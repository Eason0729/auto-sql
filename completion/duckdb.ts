import { ChatCompletionTool } from "openai/resource";

import { DuckDBInstance, DuckDBMaterializedResult, DuckDBValue } from "duckdb";

const db = await DuckDBInstance.create("store.sqlite3");
const conn = await db.connect();

export const duckdbDef: ChatCompletionTool = {
  type: "function",
  function: {
    name: "execute_sql_duckdb",
    description: [
      "Get the at most 8 rows of execution result for an sql query in duckdb.",
      "Call this whenever you need to run some SQL, ",
      "for example when a user asks 'What is the sales distribution by region?'",
      "\n\nAdditional syntax:\n",
      "- 'LOAD tpch;': load tpch dataset for benchmarking, tpch table is **only** available after loaded\n",
      "- 'LOAD iceberg;': Load remote data lake and files, use iceberg_scan function to scan the iceberg table\n",
      "- 'LOAD postgres, mysql;': load extension for 3nd party database. ",
      "for example, use 'LOAD postgres' then 'ATTACH '' AS postgres_db (TYPE POSTGRES);' to connect to 3nd party database\n",
    ].join(""),
    parameters: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "SQL to execute.",
        },
      },
      required: ["sql"],
      additionalProperties: false,
    },
  },
};

export async function Transform(
  query: DuckDBMaterializedResult,
  maxRows: number = 1000,
) {
  const columns = query.columnNames();
  const rows = await query.getRows();
  return rows.map((row) => {
    const map: { [key: string]: DuckDBValue } = {};
    row.map((val, idx) => {
      map[columns[idx]] = val;
    });
    return map;
  }).slice(0, maxRows);
}

export async function duckdb(request: string): Promise<string> {
  let sql = JSON.parse(request).sql;
  if (sql.includes("LOAD tpch")) sql += ";CALL dbgen(sf = 1);";

  console.info("running query:", sql);

  let query;
  try {
    query = await conn.run(sql);
  } catch (e) {
    return e.message;
  }

  if (sql.includes("LOAD ")) return "Loaded successfully";

  const data = await Transform(query, 8);

  return JSON.stringify(
    data,
    (_, v) => typeof v === "bigint" ? v.toString() : v,
  );
}
export async function ExecuteRaw(sql: string) {
  const conn = await db.connect();
  let query;
  try {
    query = await conn.run(sql);
  } finally {
    conn.close();
  }
  return query;
}
