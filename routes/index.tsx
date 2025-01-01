import { Handlers } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";
import completion from "../completion/mod.ts";
import Chat from "../components/Chat.tsx";
import Message from "../components/Message.tsx";
import Rich from "../components/rich/mod.tsx";
import { db } from "../db.ts";
import { preload } from "../components/rich/preload.tsx";

interface Data {
  message: string;
}

export const handler: Handlers<Data> = {
  async POST(req) {
    const form = await req.formData();
    const message = form.get("message")?.toString();

    db.run("INSERT INTO messages (text, user) VALUES (?, 'user')", [message]);

    const newMessage = await completion();

    const headers = new Headers();
    headers.set("location", `/latest/${newMessage + 1}`);
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default async function Home() {
  const messages = db.prepare(
    "SELECT text, user FROM messages ORDER BY created_at ASC",
  ).values();

  let preloadMap = new Map<string, JSX.Element>();
  await Promise.all(messages.map(async ([text]) => {
    preloadMap = new Map([...preloadMap, ...await preload(text)]);
  }));

  return (
    <>
      <h4 class="text-4xl font-semibold text-center mb-4">
        Welcome to AUTO-SQL
      </h4>
      <Chat>
        <Message user="assistant">
          <Rich content="Hello! I'm AUTO-SQL, your SQL assistant. How can I help you today?" />
        </Message>
        {messages.map(([text, user]) => (
          <Message user={user}>
            <Rich content={text} preload={preloadMap} />
          </Message>
        ))}
      </Chat>
    </>
  );
}
