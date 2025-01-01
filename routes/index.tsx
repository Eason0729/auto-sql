import { Handlers } from "$fresh/server.ts";
import completion from "../completion/mod.ts";
import Chat from "../components/Chat.tsx";
import Message from "../components/Message.tsx";
import MessageBox from "../components/MessageBox.tsx";
import { db } from "../db.ts";

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

export default function Home() {
  const messages = db.prepare(
    "SELECT text, user FROM messages ORDER BY created_at ASC",
  ).values();

  return (
    <>
      <h4 class="text-4xl font-semibold text-center mb-4">
        Welcome to AUTO-SQL
      </h4>
      <Chat>
        {messages.map(([text, user]) => (
          <Message user={user}>
            <MessageBox content={text} />
          </Message>
        ))}
      </Chat>
    </>
  );
}
