import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useEffect } from "react";
import { handleError } from "@/lib/error-handler";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  errorComponent: ({ error, reset }) => {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Ops! Algo deu errado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Não conseguimos carregar as informações agora.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => reset()} variant="outline">Tentar novamente</Button>
          <Button onClick={() => window.location.href = "/"}>Página Inicial</Button>
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
  return <Outlet />;
}
