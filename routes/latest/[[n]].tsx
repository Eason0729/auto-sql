import Chat from "../../components/Chat.tsx";
import Message from "../../components/Message.tsx";
import { db } from "../../db.ts";
import { FreshContext, PageProps } from "$fresh/server.ts";
import Rich from "../../components/rich/mod.tsx";
import { preload } from "../../components/rich/preload.tsx";
import { ChartProps } from "../../islands/Chart.tsx";

export default async function Latest(_: FreshContext, props: PageProps) {
  const n = parseInt(props.params.n) ?? 2;

  const messages = db.prepare(
    `SELECT text, user FROM messages ORDER BY created_at DESC LIMIT ${n}`,
  ).values();

  messages.reverse();

  const preloadMap: { [key: string]: ChartProps } = {};
  await Promise.all(messages.map(async ([text]) => {
    const map = await preload(text);
    Object.assign(preloadMap, map);
  }));

  return (
    <Chat>
      {messages.map(([text, user]) => (
        <Message user={user}>
          <Rich content={text} preload={preloadMap} />
        </Message>
      ))}
    </Chat>
  );
}
