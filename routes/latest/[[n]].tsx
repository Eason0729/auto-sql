import Chat from "../../components/Chat.tsx";
import Message from "../../components/Message.tsx";
import { db } from "../../db.ts";
import { FreshContext, PageProps } from "$fresh/server.ts";
import Rich from "../../components/rich/mod.tsx";
import { JSX } from "preact/jsx-runtime";
import { preload } from "../../components/rich/preload.tsx";

export default async function Latest(_: FreshContext, props: PageProps) {
  const n = parseInt(props.params.n) ?? 2;

  const messages = db.prepare(
    `SELECT text, user FROM messages ORDER BY created_at DESC LIMIT ${n}`,
  ).values();

  let preloadMap = new Map<string, JSX.Element>();
  await Promise.all(messages.map(async ([text]) => {
    preloadMap = new Map([...preloadMap, ...await preload(text)]);
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
