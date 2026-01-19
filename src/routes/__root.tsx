import { createRootRoute, Outlet, Scripts, HeadContent } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TanStack Start Repro</title>
        <HeadContent />
      </head>
      <body>
        <div id="root">
          <Outlet />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
