import { useEffect, useRef } from "preact/hooks";
import { Chart as JSChart, ChartDataset, registerables } from "chart.js";
import { IS_BROWSER } from "$fresh/runtime.ts";

export type ChartType = "scatter" | "bar" | "line" | "pie";

function groupBy<T, K>(list: T[], keyGetter: (input: T) => K): Map<K, T[]> {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

// we cannot send prototype objects to the browser, so we send pure json
export default function Chart(
  props: {
    type: ChartType;
    data: { label?: string; x: string | number; y: number }[];
  },
) {
  if (!IS_BROWSER) return <div class="bg-slate-700 text-white">Loading</div>;

  JSChart.register(...registerables);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<JSChart | null>(null);

  const xAxisLabels = props.data.map((d) => d.x).filter((v, i, a) =>
    a.indexOf(v) === i
  );

  const group = groupBy(props.data, (d) => d.label || "Default");
  const datasets: ChartDataset[] = [];

  for (const label of group.keys()) {
    const data = Array(xAxisLabels.length).fill(0);

    group.get(label)!.forEach((d) => {
      const index = xAxisLabels.indexOf(d.x);

      data[index] = (typeof d.y === "bigint") ? Number(d.y) : d.y;
    });

    datasets.push({ label, data });
  }

  useEffect(() => {
    if (chartInstanceRef.current) return;
    const ctx = chartRef.current!.getContext("2d")!;
    chartInstanceRef.current = new JSChart(ctx, {
      type: props.type,
      data: {
        labels: xAxisLabels,
        datasets,
      },
      options: {},
    });
  }, []);

  return (
    <div class="bg-white rounded-lg p-4 my-3 shadow-lg">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}