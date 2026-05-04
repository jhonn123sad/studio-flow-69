import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <div style={{ border: '2px solid blue', padding: 20 }}>
      <h1>Layout Autenticado (Bypass de Auth)</h1>
      <Outlet />
    </div>
  ),
});