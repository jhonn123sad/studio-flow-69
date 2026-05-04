import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  errorComponent: ({ error, reset }) => {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Ops! Algo deu errado no layout</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Não conseguimos carregar a interface autenticada.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => reset()} variant="outline">Tentar novamente</Button>
          <Button onClick={() => window.location.href = "/login"}>Ir para Login</Button>
        </div>
        <pre className="mt-8 rounded bg-muted p-4 text-left font-mono text-xs text-destructive">
          {error.message}
        </pre>
      </div>
    );
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-7xl w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
