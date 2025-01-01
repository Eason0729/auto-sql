import { JSX } from "preact/jsx-runtime";
import { ExecuteRaw, Transform } from "../../completion/duckdb.ts";
import Chart from "../../islands/Chart.tsx";
import { ChartType } from "../../islands/Chart.tsx";

async function SQLChart(
  { type, sql, title }: { type: ChartType; sql: string; title?: string },
) {
  // TODO: stream the data
  const query = await ExecuteRaw(sql);
  const data = await Transform(query) as {
    label?: string;
    x: string | number;
    y: number;
  }[];

  return <Chart data={data} type={type} title={title} />;
}

export async function preload(raw: string): Promise<Map<string, JSX.Element>> {
  const chartRegex = /<chart>([\s\S]*?)<\/chart>/;
  const chartParts = raw.match(chartRegex);

  const map = new Map<string, JSX.Element>();

  if (chartParts) {
    (await Promise.all(chartParts.map(async (chartContent) => {
      let element: JSX.Element = <div>Fail to load chart.</div>;
      try {
        const sql = chartContent.match(/<sql>([\s\S]*?)<\/sql>/)![0].replaceAll(
          "<sql>",
          "",
        ).replaceAll("</sql>", "");

        const kind = chartContent.match(
          /<type>([\s\S]*?)<\/type>/,
        )![0].replaceAll("<type>", "").replaceAll("</type>", "") as ChartType;

        const title = chartContent.match(
          /<title>([\s\S]*?)<\/title>/,
        )?.[0].replaceAll("<title>", "").replaceAll("</title>", "");

        element = await SQLChart({ type: kind, sql, title });
      } catch (e) {
        console.log(e);
      }
      return {
        key: chartContent,
        element,
      };
    })))
      .filter((x) => !!x)
      .forEach(({ key, element }) => map.set(key, element));
  }

  return map;
}
