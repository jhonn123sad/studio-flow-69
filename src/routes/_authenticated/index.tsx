import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Video, 
  Bookmark, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const [formatsRes, refsRes, projectsRes] = await Promise.all([
          supabase.from("formats").select("*", { count: "exact", head: true }),
          supabase.from("references").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }),
        ]);
        
        return { 
          formats: formatsRes.count || 0, 
          refs: refsRes.count || 0, 
          projects: projectsRes.count || 0 
        };
      } catch (err) {
        console.error("Dashboard Stats Fetch Error:", err);
        return { formats: 0, refs: 0, projects: 0 };
      }
    }
  });

  const { data: recentProjectsData } = useQuery({
    queryKey: ["recent-projects"],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(3);
          
        if (error) {
          console.error("Recent Projects Fetch Error:", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error("Recent Projects Critical Error:", err);
        return [];
      }
    }
  });

  const stats = [
    { title: "Formatos", value: statsData?.formats?.toString() || "0", icon: Video, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Referências", value: statsData?.refs?.toString() || "0", icon: Bookmark, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Projetos Ativos", value: statsData?.projects?.toString() || "0", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Tasks Pendentes", value: "0", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const recentProjects = recentProjectsData?.map(p => ({
    id: p.id,
    title: p.title,
    status: p.status,
    priority: p.priority,
    deadline: p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : "S/D"
  })) || [];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua produção de conteúdo para hoje.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/40 shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="bg-muted/50 text-[10px] uppercase tracking-wider font-bold">Total</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Projetos Recentes</CardTitle>
              <CardDescription>Os últimos projetos que você trabalhou.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/projects">Ver todos <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <Link 
                  key={project.id} 
                  to="/projects/$projectId" 
                  params={{ projectId: project.id }}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{project.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] py-0 h-4">{project.status}</Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {project.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={project.priority === "Alta" ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {project.priority}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/40 shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Acesso Rápido</CardTitle>
              <CardDescription className="text-primary-foreground/70">Crie novos itens rapidamente.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="secondary" className="justify-start gap-2 w-full h-11" asChild>
                <Link to="/formats">
                  <Plus className="h-4 w-4" /> Novo Formato
                </Link>
              </Button>
              <Button variant="secondary" className="justify-start gap-2 w-full h-11" asChild>
                <Link to="/references">
                  <Plus className="h-4 w-4" /> Nova Referência
                </Link>
              </Button>
              <Button variant="secondary" className="justify-start gap-2 w-full h-11" asChild>
                <Link to="/projects">
                  <Plus className="h-4 w-4" /> Novo Projeto
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Dica do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 p-4 rounded-xl bg-muted/50">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  "A consistência é o que transforma o amador em profissional. Tente organizar pelo menos 3 referências hoje."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
