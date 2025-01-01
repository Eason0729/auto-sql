import { useState } from "preact/hooks";
import { ComponentChildren } from "preact";

export default function Hide({ children, show, text }: {
  children?: ComponentChildren;
  show?: boolean;
  text?: string;
}) {
  const [signal, setSignal] = useState(show);
  return signal
    ? (
      <div>
        {children}
      </div>
    )
    : (
      <div class="flex justify-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
        <button onClick={() => setSignal(true)}>{text || "show"}</button>
      </div>
    );
}
