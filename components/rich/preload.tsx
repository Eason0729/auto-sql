import { ExecuteRaw, Transform } from "../../completion/duckdb.ts";
import { ChartProps } from "../../islands/Chart.tsx";
import { ChartType } from "../../islands/Chart.tsx";

async function SQLChart(
  { type, sql, title }: { type: ChartType; sql: string; title?: string },
): Promise<ChartProps> {
  // TODO: stream the data
  const query = await ExecuteRaw(sql);
  const data = await Transform(query) as {
    label?: string;
    x: string | number;
    y: number;
  }[];

  return { type, data, title };
}

export async function preload(
  raw: string,
): Promise<{ [key: string]: ChartProps }> {
  const chartRegex = /<chart>([\s\S]*?)<\/chart>/;
  const chartParts = raw.match(chartRegex);

  const map = new Map<string, ChartProps>();

  if (chartParts) {
    await Promise.all(chartParts.map(async (chartContent) => {
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

        map.set(chartContent, await SQLChart({ type: kind, sql, title }));
      } catch (e) {
        console.log(e);
      }
    }));
  }

  return Object.fromEntries(map);
}
