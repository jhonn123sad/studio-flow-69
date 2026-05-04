import { createFileRoute } from "@tanstack/react-router";
import { 
  Video, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Grid,
  List,
  Filter,
  Trash2,
  Edit2
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/formats")({
  component: FormatsPage,
});

const formatSchema = z.object({
  title: z.string().min(2, "Título muito curto"),
  description: z.string().default(""),
  status: z.string().default("Ativo"),
  tags: z.string().default(""),
});

type FormatFormValues = z.infer<typeof formatSchema>;

function FormatsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // MOCK DATA - PLACEHOLDER
  const [formats, setFormats] = useState([
    { id: "1", title: "Vídeo Curto (Reels/TikTok)", description: "Vídeos verticais de até 60 segundos com edição dinâmica.", status: "Ativo", tags: ["Vídeo", "Social"] },
    { id: "2", title: "Newsletter Semanal", description: "Informativo por e-mail com curadoria de conteúdos e novidades.", status: "Em Produção", tags: ["Escrita", "E-mail"] },
    { id: "3", title: "Carrossel Educativo", description: "Sequência de imagens para Instagram explicando um conceito.", status: "Ativo", tags: ["Design", "Social"] },
    { id: "4", title: "Podcast: Entrevistas", description: "Áudio longo gravado com convidados sobre temas técnicos.", status: "Arquivado", tags: ["Áudio", "Long-form"] },
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormatFormValues>({
    resolver: zodResolver(formatSchema),
    defaultValues: { status: "Ativo" }
  });

  const filteredFormats = formats.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: FormatFormValues) => {
    const newFormat = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: data.description || "",
      status: data.status,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
    };
    
    setFormats([newFormat, ...formats]);
    setIsCreateDialogOpen(false);
    reset();
    toast.success("Formato criado com sucesso!");
  };

  const deleteFormat = (id: string) => {
    setFormats(formats.filter(f => f.id !== id));
    toast.success("Formato removido.");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formatos de Conteúdo</h1>
          <p className="text-muted-foreground">Gerencie os diferentes tipos de conteúdo que você produz.</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Novo Formato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Formato</DialogTitle>
              <DialogDescription>
                Defina um novo padrão de conteúdo para sua produção.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Ex: Vídeo de Review" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Descreva brevemente como funciona este formato..." {...register("description")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="Ativo">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Em Produção">Em Produção</SelectItem>
                      <SelectItem value="Arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input id="tags" placeholder="Vídeo, Social..." {...register("tags")} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Formato</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filtrar formatos..."
                className="pl-9 bg-muted/30 border-transparent focus:bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border/40 rounded-md p-1 bg-muted/30">
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {filteredFormats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Video className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Nenhum formato encontrado</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">Tente ajustar sua busca ou crie um novo formato para começar.</p>
              </div>
              <Button variant="outline" onClick={() => setSearchTerm("")}>Limpar Busca</Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredFormats.map((format) => (
                <Card key={format.id} className="group hover:border-primary/40 transition-all shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Video className="h-5 w-5" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Edit2 className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => deleteFormat(format.id)}>
                          <Trash2 className="h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{format.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {format.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {format.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] font-medium bg-muted/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        format.status === 'Ativo' ? 'text-emerald-500 border-emerald-500/20' : 
                        format.status === 'Em Produção' ? 'text-amber-500 border-amber-500/20' : 
                        'text-muted-foreground border-muted-foreground/20'
                      }`}
                    >
                      {format.status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold">
                            {i}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">3 ref.</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
