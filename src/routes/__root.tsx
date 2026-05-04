import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ background: '#333', color: '#fff', padding: '10px 20px', display: 'flex', gap: '20px' }}>
        <strong>Root Shell</strong>
        <a href="/login" style={{ color: '#fff' }}>Login</a>
        <a href="/" style={{ color: '#fff' }}>Dashboard</a>
      </div>
      <div style={{ padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  ),
});