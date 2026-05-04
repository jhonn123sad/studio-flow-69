import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Briefcase, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronRight,
  Filter
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // MOCK DATA - PLACEHOLDER
  const projects = [
    { 
      id: "1", 
      title: "Lançamento Curso IA", 
      description: "Planejamento e produção de conteúdo para o lançamento do curso de automação com IA.", 
      status: "Em Produção", 
      priority: "Alta", 
      deadline: "15 Mai",
      progress: 65,
      tasksCount: 12,
      pendingTasks: 4,
      tags: ["Lançamento", "Curso", "IA"],
      cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: "2", 
      title: "Série YouTube: Productivity", 
      description: "Série de 5 vídeos focada em ferramentas de produtividade para desenvolvedores.", 
      status: "Ideias", 
      priority: "Média", 
      deadline: "22 Mai",
      progress: 15,
      tasksCount: 8,
      pendingTasks: 7,
      tags: ["YouTube", "Produtividade"],
      cover: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: "3", 
      title: "Rebranding Instagram", 
      description: "Nova identidade visual e linha editorial para o perfil do Instagram.", 
      status: "Concluído", 
      priority: "Baixa", 
      deadline: "01 Mai",
      progress: 100,
      tasksCount: 15,
      pendingTasks: 0,
      tags: ["Design", "Social"],
      cover: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800"
    },
  ];

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">Gerencie seus projetos digitais e acompanhe o progresso.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 h-11 px-6">
          <Plus className="h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar projetos..."
            className="pl-9 bg-muted/30 border-transparent focus:bg-background h-10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-10">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Badge variant="secondary" className="h-10 px-4 rounded-md font-semibold text-xs border border-border/40">
            {filteredProjects.length} Ativos
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group hover:border-primary/40 transition-all shadow-md overflow-hidden flex flex-col border-border/40">
            <Link 
              to="/projects/$projectId" 
              params={{ projectId: project.id }}
              className="relative aspect-video overflow-hidden block"
            >
              <img 
                src={project.cover} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              <div className="absolute top-4 left-4">
                <Badge className={
                  project.priority === "Alta" ? "bg-red-500 hover:bg-red-600" : 
                  project.priority === "Média" ? "bg-amber-500 hover:bg-amber-600" : 
                  "bg-blue-500 hover:bg-blue-600"
                }>
                  {project.priority}
                </Badge>
              </div>
            </Link>
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider h-5">
                  {project.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Edit2 className="h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                <CardTitle className="text-xl group-hover:text-primary transition-colors cursor-pointer">{project.title}</CardTitle>
              </Link>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {project.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Progresso</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-muted/50 text-[10px] py-0 px-2 h-5 font-medium">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-border/40 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{project.deadline}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{project.pendingTasks} tasks</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-8 group-hover:translate-x-1 transition-transform">
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                  Abrir <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
