import { Partial } from "$fresh/runtime.ts";
import { ComponentChildren } from "preact";

export default function Chat({ children }: {
  children?: ComponentChildren;
}) {
  return (
    <div class="w-full space-y-2">
      <div class="flex flex-col space-y-2">
        <Partial name="messages" mode="append">
          {children}
        </Partial>
      </div>
      <form
        class="flex w-full space-x-2 items-center"
        method="POST"
        f-client-nav
      >
        <textarea
          placeholder="Enter Message"
          class="flex-grow px-4 py-2 max-h-32 h-10 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
          name="message"
          required
        >
        </textarea>
        <button
          type="submit"
          class="w-24 px-4 py-2 h-fit bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
}
