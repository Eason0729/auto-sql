import Chat from "../../components/Chat.tsx";
import Message from "../../components/Message.tsx";
import { db } from "../../db.ts";
import { PageProps } from "$fresh/server.ts";
import MessageBox from "../../components/MessageBox.tsx";

export default function Latest(props: PageProps) {
  const n = parseInt(props.params.n) ?? 2;

  const messages = db.prepare(
    `SELECT text, user FROM messages ORDER BY created_at DESC LIMIT ${n}`,
  ).values();
  messages.reverse();

  return (
    <Chat>
      {messages.map(([text, user]) => (
        <Message user={user}>
          <MessageBox content={text} />
        </Message>
      ))}
    </Chat>
  );
}
