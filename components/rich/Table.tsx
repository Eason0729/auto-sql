import Hide from "../../islands/Hide.tsx";

export default function Table(data: { data: { [key: string]: string }[] }) {
  function roundUp(key: string | number) {
    if (typeof key === "number" && key % 1 !== 0) {
      return key.toFixed(3);
    }
    return key;
  }

  const keys = Object.keys(data.data[0]);

  return (
    <Hide text="Show Result">
      <div class="overflow-x-scroll shadow-lg">
        <table class="bg-white border">
          <thead>
            <tr class="w-full bg-gray-200 text-gray-700">
              <th class="py-2 px-4 border-b text-center">#</th>
              {keys.map((key) => (
                <th class="py-2 px-4 border-b text-center">{key}</th>
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
    </Hide>
  );
}
