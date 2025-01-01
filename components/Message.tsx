import { ComponentChildren } from "preact";

export default function Message({ user, children }: {
  user: "user" | "assistant" | "tool";
  children?: ComponentChildren;
}) {
  const isUser = user === "user";
  return (
    <div class={"flex " + (isUser ? "justify-end" : "justify-start")}>
      <div
        class={"rounded-lg max-w-[90%] md:max-w-[80%] xl:max-w-[70%] " +
          (isUser ? "bg-sky-200" : "bg-slate-200")}
      >
        {children}
      </div>
    </div>
  );
}
