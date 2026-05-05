import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Aguardando ação...");
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const testConnection = async () => {
    console.log('[Login] Testar conexão clicado');
    setLoadingTest(true);
    setStatus("Testando conexão Supabase...");
    
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('[Login] getSession result', { data, error });
      
      if (error) {
        setStatus("Erro Supabase: " + error.message);
      } else {
        if (data.session) {
          setStatus("Supabase conectado. Sessão encontrada.");
        } else {
          setStatus("Supabase conectado. Nenhuma sessão ativa.");
        }
      }
    } catch (err: any) {
      console.error('[Login] Erro inesperado no teste', err);
      setStatus("Erro inesperado: " + (err.message || String(err)));
    } finally {
      setLoadingTest(false);
    }
  };

  const handleLoginClick = async () => {
    if (!email || !password) {
      setStatus("Preencha e-mail e senha.");
      return;
    }

    setLoadingLogin(true);
    setStatus("Entrando...");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setStatus("Erro no login: " + error.message);
      } else {
        setStatus("Login realizado com sucesso.");
        console.log("Login OK:", data.session);
      }
    } catch (err: any) {
      console.error('[Login] Erro inesperado no login', err);
      setStatus("Erro inesperado no login: " + (err.message || String(err)));
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto", fontFamily: "sans-serif" }}>
      <h1>Login</h1>
      
      <div style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc", borderRadius: 4, backgroundColor: "#f9f9f9" }}>
        <strong>Status:</strong>
        <p style={{ margin: "5px 0", color: status.includes("Erro") ? "red" : "green" }}>{status}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label style={{ display: "block", marginBottom: 5 }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            disabled={loadingLogin || loadingTest}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 5 }}>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            disabled={loadingLogin || loadingTest}
          />
        </div>
        <button
          type="button"
          onClick={handleLoginClick}
          style={{ padding: 10, backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          disabled={loadingLogin || loadingTest}
        >
          {loadingLogin ? "Entrando..." : "Entrar"}
        </button>
      </div>

      <button
        type="button"
        onClick={testConnection}
        style={{ marginTop: 20, width: "100%", padding: 10, backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
        disabled={loadingTest}
      >
        {loadingTest ? "Testando..." : "Testar conexão Supabase"}
      </button>

      <div style={{ marginTop: 20, padding: 10, border: "1px dashed #ccc", fontSize: 12, color: "#666" }}>
        <p><strong>Debug Info:</strong></p>
        <p>Supabase URL detectada: sim</p>
        <p>Supabase Key detectada: sim</p>
        <p>Modo: Recuperação Isolada</p>
      </div>
    </div>
  );
}
