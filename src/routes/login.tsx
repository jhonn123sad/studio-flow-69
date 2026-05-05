import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
const supabase = { auth: { getSession: async () => ({ data: { session: null }, error: null }), signInWithPassword: async () => ({ data: { user: null }, error: null }) } } as any;

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Aguardando ação...");
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setStatus("Testando conexão...");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setStatus(`Erro ao conectar Supabase: ${error.message}`);
      } else {
        setStatus(`Supabase conectado. Sessão: ${data.session ? "encontrada" : "vazia"}`);
      }
    } catch (err: any) {
      setStatus(`Erro fatal ao conectar Supabase: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Realizando login...");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus(`Erro no login: ${error.message}`);
      } else {
        setStatus("Login realizado com sucesso!");
        console.log("Sessão iniciada:", data.session);
      }
    } catch (err: any) {
      setStatus(`Erro fatal no login: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto", fontFamily: "sans-serif" }}>
      <h1>Login</h1>
      
      <div style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc", borderRadius: 4, backgroundColor: "#f9f9f9" }}>
        <strong>Status:</strong>
        <p style={{ margin: "5px 0", color: status.includes("Erro") ? "red" : "green" }}>{status}</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label style={{ display: "block", marginBottom: 5 }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 5 }}>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          style={{ padding: 10, backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : "Entrar"}
        </button>
      </form>

      <button
        onClick={testConnection}
        style={{ marginTop: 20, width: "100%", padding: 10, backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
        disabled={isLoading}
      >
        Testar conexão Supabase
      </button>

      <div style={{ marginTop: 20, fontSize: 12, color: "#666" }}>
        <p>Nota: O app está em modo de recuperação isolada.</p>
      </div>
    </div>
  );
}
