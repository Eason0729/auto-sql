import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>auto-sql</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="max-w-screen-md xl:max-w-screen-lg w-full mx-auto flex flex-col items-center justify-center p-4 pt-8">
          <Component />
        </div>
      </body>
    </html>
  );
}
