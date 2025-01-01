import { Head } from "$fresh/runtime.ts";
import { ToolRequest, ToolResponse } from "../db.ts";
import { CSS, render } from "@deno/gfm";
import { JSX } from "preact";

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

function Codeblock({ code }: { code: string }) {
  return (
    <div class="bg-slate-700 text-white p-2 rounded-md overflow-x-scroll whitespace-pre">
      {code}
    </div>
  );
}

function Markdown(
  props: { content: string & JSX.HTMLAttributes<HTMLDivElement> },
) {
  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <div
        dangerouslySetInnerHTML={{ __html: render(props.content) }}
        {...props}
      >
      </div>
    </>
  );
}

function Table(data: { data: { [key: string]: string }[] }) {
  function roundUp(key: string | number) {
    if (typeof key === "number" && key % 1 !== 0) {
      return key.toFixed(3);
    }
    return key;
  }

  const keys = Object.keys(data.data[0]);

  return (
    <div class="overflow-x-scroll">
      <table class="bg-white border">
        <thead>
          <tr class="w-full bg-gray-200 text-gray-700">
            <th class="py-2 px-4 border-b text-left">#</th>
            {keys.map((key) => (
              <th class="py-2 px-4 border-b text-left">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row, i) => (
            <tr class="hover:bg-gray-100">
              <td class="py-2 px-4 border-b">{i + 1}</td>
              {keys.map((key) => (
                <td class="py-2 px-4 border-b">{roundUp(row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

export default function MessageBox({ content }: { content: string }) {
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

  return (
    <div class="px-4 py-2 rounded-lg">
      <Markdown content={content} />
    </div>
  );
}
