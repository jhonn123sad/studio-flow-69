import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div style={{ margin: 0, padding: 0, minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <Outlet />
    </div>
  ),
});
