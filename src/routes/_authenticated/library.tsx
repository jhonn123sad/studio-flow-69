import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/library")({
  component: () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
      <p className="text-muted-foreground">Em breve: Sua biblioteca central de ativos e templates.</p>
    </div>
  ),
});
