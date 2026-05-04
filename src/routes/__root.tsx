import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function GlobalErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold tracking-tight">Erro crítico ao carregar o app</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Ocorreu um erro inesperado que impediu a inicialização. 
        Por favor, recarregue a página ou entre em contato com o suporte.
      </p>
      <pre className="mt-4 rounded bg-destructive/10 p-4 text-left font-mono text-xs text-destructive max-w-2xl overflow-auto">
        {error.message}
      </pre>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
      >
        Recarregar Página
      </button>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Outlet />
            <Toaster />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  ),
});