import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {user?.email}! 👋
        </h1>
        <p className="text-muted-foreground">
          Dashboard em modo de recuperação. Queries reais estão temporariamente desativadas para garantir a estabilidade.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted/50 border border-border/50 p-6 flex flex-col justify-end">
            <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2" />
            <div className="h-8 w-12 bg-muted-foreground/40 rounded" />
          </div>
        ))}
      </div>

      <div className="h-96 w-full rounded-xl bg-muted/30 border border-dashed border-border/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground italic">Conteúdo do dashboard indisponível temporariamente.</p>
      </div>
    </div>
  );
}
