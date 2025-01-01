import { Head } from "$fresh/runtime.ts";
import { CSS, render } from "@deno/gfm";
import { JSX } from "preact/jsx-runtime";

export default function Markdown(
  props: { content: string & JSX.HTMLAttributes<HTMLDivElement> },
) {
  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <div
        dangerouslySetInnerHTML={{ __html: render(props.content) }}
        class="markdown"
        {...props}
      >
      </div>
    </>
  );
}
