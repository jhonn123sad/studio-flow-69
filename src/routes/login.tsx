import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: () => (
    <div style={{ padding: 20 }}>
      <h1>Login Page Estática</h1>
      <p>Bypass total de auth e Supabase.</p>
    </div>
  ),
});
