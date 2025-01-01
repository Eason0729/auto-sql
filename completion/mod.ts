import OpenAI from "openai";
import { db, ToolRequest, ToolResponse } from "../db.ts";
import { duckdb, duckdbDef } from "./duckdb.ts";
import { ChatCompletionMessageParam } from "openai/resource";

const toolFunctions: Record<string, (input: string) => Promise<string>> = {
  execute_sql_duckdb: duckdb,
};
const tools = [duckdbDef];

const client = new OpenAI();

const systemPrompt = [
  "# About you:",
  "- You are an data science expert in Tools designed for market research and coding text data at Relevance",
  "",
  "# Rules to follow:",
  "- You are expected to provide SQL queries to the user's requests, running them on the SQL database, and explaining the results",
  "- If the user asks you for a table, prefer to provide a chart instead",
  "- If the duckdb cannot found colunms, tables or data, you can use the following commands: 'SHOW TABLES', 'DESCRIBE table_name'",
  "- If the user asks you for general information about a table, proceed by describing the table and its columns with 'DESCRIBE table_name'",
  "",
  "# Tool available:",
  "- use <chart> to generate a chart from the data",
  "examples: ",
  "<chart>",
  "  <title>price change over the year for each product</title>",
  "  <type>line</type>",
  "  <!-- SQL query, must contain x and y column, use alias in SQL -->",
  "  <sql>SELECT year as x, price as y, product_name as label FROM product;</sql>",
  "</chart>",
  "<chart>",
  "  <title>sales bar chart by region</title>",
  "  <type>bar</type>",
  "  <!-- SQL query, must contain x and y column, use alias in SQL -->",
  "  <sql>SELECT region as x, SUM(price) as y, 'sales' as label FROM transaction;</sql>",
  "</chart>",
  "<chart>",
  "  <title>precentage of education</title>",
  "  <type>pie</type>",
  "  <!-- SQL query, must contain x and y column, use alias in SQL -->",
  "  <sql>SELECT education as x, COUNT(*) as y, 'people' as label FROM demography;</sql>",
  "</chart>",
].join("\n");

function databaseToMessages(
  role: string,
  text: string,
): ChatCompletionMessageParam {
  try {
    const jsonContent: { kind: string } | ToolRequest | ToolResponse = JSON
      .parse(
        text,
      );
    if (!jsonContent || !jsonContent.kind) {
      return {
        role: role as "user" | "assistant",
        content: text,
      };
    }

    switch (jsonContent.kind) {
      case "tool-response":
        return {
          role: "tool",
          content: (jsonContent as ToolResponse).output,
          tool_call_id: (jsonContent as ToolResponse).id,
        };
      case "tool-request": {
        const res = jsonContent as ToolRequest;
        return {
          role: "assistant",
          content: null,
          function_call: null,
          tool_calls: [
            {
              id: res.id,
              function: {
                arguments: res.input,
                name: res.name,
              },
              type: "function",
            },
          ],
        };
      }
      default:
        return {
          role: role as "user" | "assistant",
          content: text,
        };
    }
  } catch (_) {
    return {
      role: role as "user" | "assistant",
      content: text,
    };
  }
}

export default async function completion(): Promise<number> {
  const messages = db.prepare(
    "SELECT text, user FROM messages ORDER BY created_at ASC",
  ).values().map((
    [text, user],
  ) => databaseToMessages(user, text));

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    tools,
    messages: [{
      role: "system",
      content: systemPrompt,
    }, ...messages],
    max_tokens: 2048,
  });

  const choice = response.choices[0];

  if (choice.finish_reason != "tool_calls") {
    db.run("INSERT INTO messages (text, user) VALUES (?, 'assistant')", [
      choice.message.content,
    ]);

    return 1;
  }

  const toolCalls = choice.message.tool_calls!;
  const callResponses: [ToolRequest, ToolResponse][] = await Promise.all(
    toolCalls.map(async (call) => {
      const name = call.function.name;
      const input = call.function.arguments;
      const id = call.id;

      const output = await toolFunctions[name](input);

      return [{
        name,
        input,
        id,
        kind: "tool-request",
      }, {
        name,
        input,
        output,
        id,
        kind: "tool-response",
      }];
    }),
  );

  callResponses.map(([request, response]) => {
    db.run(
      "INSERT INTO messages (text, user) VALUES (?, 'assistant')",
      [JSON.stringify(request)],
    );
    db.run(
      "INSERT INTO messages (text, user) VALUES (?, 'tool')",
      [JSON.stringify(response)],
    );
  });

  return completion().then((newMessage) =>
    newMessage + callResponses.length * 2
  );
}
