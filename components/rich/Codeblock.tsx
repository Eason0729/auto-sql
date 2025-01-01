export default function Codeblock({ code }: { code: string }) {
  return (
    <div class="bg-slate-700 text-white p-2 rounded-md overflow-x-scroll whitespace-pre">
      {code}
    </div>
  );
}
