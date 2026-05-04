import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <html>
      <head>
        <title>Minimal App</title>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});