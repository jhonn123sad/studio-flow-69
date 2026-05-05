import { createFileRoute } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Info, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  CheckSquare, 
  Trello,
  Calendar,
  Clock,
  MoreVertical,
  Plus,
  Share2,
  Trash2,
  ExternalLink,
  ChevronRight,
  GripVertical,
  AlertCircle,
  Edit2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", projectId],
    enabled: false, // Desativado temporariamente para isolamento
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();
          
        if (error) {
          console.error("Project Fetch Error:", error.message);
          return null;
        }
        return data;
      } catch (err) {
        console.error("Project Critical Error:", err);
        return null;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  // Se não encontrar o projeto ou der erro, mostramos um estado amigável
  const project = projectData ? {
    id: projectData.id,
    title: projectData.title,
    description: projectData.description || "Sem descrição",
    status: projectData.status,
    priority: projectData.priority,
    startDate: projectData.created_at ? new Date(projectData.created_at).toLocaleDateString('pt-BR') : "-",
    deadline: projectData.deadline ? new Date(projectData.deadline).toLocaleDateString('pt-BR') : "-",
    tags: projectData.tags || [],
    progress: projectData.progress || 0,
    cover: projectData.cover_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
  } : null;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Projeto não encontrado</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            O projeto solicitado não existe ou você não tem permissão para acessá-lo.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: "/projects" })}>
          Voltar para Projetos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/projects" })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Projetos</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{project.title}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" /> Compartilhar
            </Button>
            <Button size="sm" className="gap-2">
              <SettingsIcon className="h-4 w-4" /> Configurar
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-12 w-full justify-start gap-1 overflow-x-auto no-scrollbar border border-border/40">
          <TabsTrigger value="overview" className="gap-2 px-4"><Info className="h-4 w-4" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="notes" className="gap-2 px-4"><FileText className="h-4 w-4" /> Notas</TabsTrigger>
          <TabsTrigger value="links" className="gap-2 px-4"><LinkIcon className="h-4 w-4" /> Links</TabsTrigger>
          <TabsTrigger value="images" className="gap-2 px-4"><ImageIcon className="h-4 w-4" /> Imagens</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2 px-4"><CheckSquare className="h-4 w-4" /> Tasks</TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2 px-4"><Trello className="h-4 w-4" /> Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab project={project} />
        </TabsContent>
        <TabsContent value="notes">
          <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed">
            <p className="text-muted-foreground italic">Editor de notas temporariamente desativado para estabilidade.</p>
          </div>
        </TabsContent>
        <TabsContent value="links">
          <LinksTab />
        </TabsContent>
        <TabsContent value="images">
          <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed">
            <p className="text-muted-foreground italic">Upload de imagens temporariamente desativado para estabilidade.</p>
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          <TasksTab />
        </TabsContent>
        <TabsContent value="kanban">
          <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed">
            <p className="text-muted-foreground italic">Kanban drag-and-drop temporariamente desativado para estabilidade.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ================= TAB COMPONENTS =================

function OverviewTab({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="border-border/40 shadow-sm overflow-hidden">
          <div className="aspect-video w-full">
            <img src={project.cover} alt="Capa" className="w-full h-full object-cover" />
          </div>
          <CardHeader>
            <CardTitle>Sobre o Projeto</CardTitle>
            <CardDescription>Informações fundamentais e objetivos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 pt-4">
              {project.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="px-3">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Status</span>
                <Badge variant="outline" className="font-bold">{project.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Prioridade</span>
                <Badge variant={project.priority === "Alta" ? "destructive" : "secondary"}>{project.priority}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Início</span>
                <span className="font-medium">{project.startDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Prazo</span>
                <span className="font-medium">{project.deadline}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Progresso Geral</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NotesTab() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: `
      <h2>Objetivos da Produção</h2>
      <p>Este curso deve focar na aplicação prática de ferramentas de IA para aumentar a produtividade em 3x.</p>
      <ul>
        <li>Scripts de vídeo validados com IA</li>
        <li>Automação de postagens</li>
        <li>Geração de criativos</li>
      </ul>
      <p><strong>Nota importante:</strong> Manter a linguagem acessível para quem não é desenvolvedor.</p>
    `,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6"
      }
    }
  });

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Editor de Notas</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()}>B</Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()}>I</Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()}>Lista</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <EditorContent editor={editor} />
      </CardContent>
      <CardFooter className="border-t border-border/40 p-4 flex justify-end">
        <Button size="sm">Salvar Nota</Button>
      </CardFooter>
    </Card>
  );
}

function LinksTab() {
  const [links, setLinks] = useState([
    { id: "1", title: "Site do Curso", url: "https://curso-ia.com" },
    { id: "2", title: "Repositório de Assets", url: "https://github.com/assets" },
    { id: "3", title: "Dashboard Vendas", url: "https://stripe.com/dashboard" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Links do Projeto</h3>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Adicionar Link</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Card key={link.id} className="border-border/40 hover:border-primary/40 transition-all shadow-sm group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{link.title}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{link.url}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={link.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ImagesTab() {
  const images = [
    { id: "1", url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400", alt: "Capa do Curso" },
    { id: "2", url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400", alt: "Logo Social" },
    { id: "3", url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=400", alt: "Planejamento" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Galeria de Imagens</h3>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Upload</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-border/40">
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button variant="secondary" size="icon" className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
              <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksTab() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Gravar aula 01", status: "Pendente", priority: "Alta", deadline: "10/05", completed: false },
    { id: "2", title: "Configurar funil de vendas", status: "Em Produção", priority: "Alta", deadline: "12/05", completed: false },
    { id: "3", title: "Criação de criativos", status: "Pendente", priority: "Média", deadline: "14/05", completed: true },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Tarefas</h3>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Task</Button>
      </div>

      <Card className="border-border/40 shadow-sm overflow-hidden">
        <div className="divide-y divide-border/40">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <Checkbox checked={task.completed} />
                <div className={task.completed ? "line-through opacity-50" : ""}>
                  <p className="font-bold text-sm">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0 h-4">{task.priority}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {task.deadline}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function KanbanTab() {
  const [columns, setColumns] = useState([
    { id: "ideas", title: "Ideias", tasks: ["Aula sobre GPT-4", "Tutorial Make.com"] },
    { id: "todo", title: "A Fazer", tasks: ["Scripts Módulo 1", "Gravar Introdução"] },
    { id: "in-progress", title: "Em Produção", tasks: ["Edição Vídeo Promo"] },
    { id: "review", title: "Revisão", tasks: ["Landing Page"] },
    { id: "done", title: "Concluído", tasks: ["Estrutura do Curso"] },
  ]);

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar min-h-[500px]">
      {columns.map((col) => (
        <div key={col.id} className="min-w-[280px] w-[280px] flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">{col.title}</h4>
              <Badge variant="secondary" className="bg-muted text-[10px] h-5">{col.tasks.length}</Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
          </div>
          
          <div className="flex-1 rounded-xl bg-muted/30 p-2 space-y-3">
            {col.tasks.map((task, idx) => (
              <Card key={idx} className="border-border/40 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium">{task}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[8px] font-bold">U</div>
                    </div>
                    <Badge variant="outline" className="text-[9px] h-4">Alta</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground text-xs h-9 border border-dashed border-border/40">
              <Plus className="h-3 w-3 mr-2" /> Adicionar card
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
