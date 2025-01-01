import { ToolRequest, ToolResponse } from "../../db.ts";
import Table from "./Table.tsx";
import Codeblock from "./Codeblock.tsx";
import Markdown from "./Markdown.tsx";
import { JSX } from "preact/jsx-runtime";

function ToolRequestBlock({ request }: { request: ToolRequest }) {
  if (request.name === "execute_sql_duckdb") {
    const sql = JSON.parse(request.input).sql;
    return (
      <div>
        <div>
          Bot is executing the following SQL query:
        </div>
        <Codeblock code={sql} />
      </div>
    );
  }
  return <></>;
}

function ToolResponseBlock({ response }: { response: ToolResponse }) {
  try {
    const data = JSON.parse(response.output);
    if (data instanceof Array) {
      return data.length > 0
        ? <Table data={data} />
        : <div>No data returned</div>;
    }
    // deno-lint-ignore no-empty
  } catch (_) {}
  return (
    <div class="px-4 py-2 rounded-lg">
      <div>Exception during Execution</div>
      <Codeblock code={response.output} />
    </div>
  );
}

export default function Rich(
  { content, preload }: { content: string; preload?: Map<string, JSX.Element> },
) {
  try {
    const jsonContent: { kind: string } | ToolRequest | ToolResponse = JSON
      .parse(content);
    if (!jsonContent || !jsonContent.kind) {
      return <div>{content}</div>;
    }
    switch (jsonContent.kind) {
      case "tool-response":
        return <ToolResponseBlock response={jsonContent as ToolResponse} />;
      case "tool-request":
        return (
          <div class="px-4 py-2 rounded-lg">
            <ToolRequestBlock request={jsonContent as ToolRequest} />
          </div>
        );
    }
    // deno-lint-ignore no-empty
  } catch (_) {}

  const chartRegex = /<chart>([\s\S]*?)<\/chart>/;
  const chartMatch = content.match(chartRegex);
  const charts: JSX.Element[] = [];
  if (chartMatch && preload) {
    const chartContent = chartMatch[1];
    charts.push(preload.get(chartContent) ?? <div>SQL not preloaded</div>);
  }

  const contents = content.split(/<chart>[\s\S]*?<\/chart>/g);

  return (
    <div class="px-4 py-2 rounded-lg">
      {contents.map((c, i) => (
        <div>
          <Markdown content={c} />
          {charts[i] ?? null}
        </div>
      ))}
    </div>
  );
}
