import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Video, 
  Bookmark, 
  Briefcase, 
  Plus,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: formatsCount } = useQuery({
    queryKey: ["formats-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("formats")
        .select("*", { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    retry: false
  });

  const { data: referencesCount } = useQuery({
    queryKey: ["references-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("references")
        .select("*", { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    retry: false
  });

  const { data: projectsCount } = useQuery({
    queryKey: ["projects-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    retry: false
  });

  const stats = [
    { label: "Formatos", value: formatsCount ?? 0, icon: Video, color: "text-blue-500", bg: "bg-blue-50", link: "/formats" },
    { label: "Referências", value: referencesCount ?? 0, icon: Bookmark, color: "text-purple-500", bg: "bg-purple-50", link: "/references" },
    { label: "Projetos", value: projectsCount ?? 0, icon: Briefcase, color: "text-amber-500", bg: "bg-amber-50", link: "/projects" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao seu Painel</h1>
        <p className="text-muted-foreground">Visão geral da sua produção e organização.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de {stat.label}
              </CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Button variant="link" size="sm" className="px-0 mt-2 h-auto text-xs" asChild>
                <Link to={stat.link}>Ver todos <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Crie novos itens rapidamente.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button className="w-full justify-start gap-2" asChild>
              <Link to="/formats"><Plus className="h-4 w-4" /> Novo Formato</Link>
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" asChild>
              <Link to="/references"><Plus className="h-4 w-4" /> Nova Referência</Link>
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" asChild>
              <Link to="/projects"><Plus className="h-4 w-4" /> Novo Projeto</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
