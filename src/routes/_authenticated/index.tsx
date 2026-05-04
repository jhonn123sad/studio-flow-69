import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, marginBottom: 10 }}>Dashboard Estático</h1>
      <p>O bypass foi bem sucedido. Se você está vendo isso, o TanStack Router e o layout estão funcionando.</p>
      <div style={{ marginTop: 20, padding: 15, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
        <strong>Passo A concluído:</strong> React e Router renderizando sem Auth ou Supabase.
      </div>
    </div>
  );
}