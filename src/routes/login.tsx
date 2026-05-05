import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: () => (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Página de Login Desativada</h1>
      <p>O app agora abre diretamente no Painel Pessoal.</p>
      <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Ir para o Painel</a>
    </div>
  ),
});
