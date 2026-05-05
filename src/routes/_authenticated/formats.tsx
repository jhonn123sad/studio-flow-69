import { createFileRoute } from "@tanstack/react-router";
import { 
  Video, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Grid,
  List,
  Trash2,
  Edit2,
  AlertCircle
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [editingFormat, setEditingFormat] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: formatsData, error: queryError, isLoading } = useQuery({
    queryKey: ["formats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formats")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    retry: false
  });

  const formats = formatsData?.map((f: any) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    status: f.status,
    tags: Array.isArray(f.tags) ? f.tags : []
  })) || [];

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormatFormValues>({
    resolver: zodResolver(formatSchema),
    defaultValues: { status: "Ativo", description: "", tags: "" }
  });

  const filteredFormats = formats.filter((f: any) => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const createMutation = useMutation({
    mutationFn: async (newFormat: any) => {
      const { data, error } = await supabase
        .from("formats")
        .insert([newFormat])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formats"] });
      setIsCreateDialogOpen(false);
      reset();
      toast.success("Formato criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar formato: " + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const { error } = await supabase
        .from("formats")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formats"] });
      setIsCreateDialogOpen(false);
      setEditingFormat(null);
      reset();
      toast.success("Formato atualizado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("formats")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formats"] });
      toast.success("Formato removido.");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover: " + error.message);
    }
  });

  const onSubmit = (data: FormatFormValues) => {
    const payload = {
      title: data.title,
      description: data.description || "",
      status: data.status,
      tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()) : [],
    };

    if (editingFormat) {
      updateMutation.mutate({ id: editingFormat.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (format: any) => {
    setEditingFormat(format);
    setValue("title", format.title);
    setValue("description", format.description || "");
    setValue("status", format.status);
    setValue("tags", format.tags.join(", "));
    setIsCreateDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setEditingFormat(null);
      reset();
    }
  };

  if (queryError) {
    const isRLSError = (queryError as any).message?.includes("row-level security") || (queryError as any).code === "42501";
    const isTableMissing = (queryError as any).message?.includes("does not exist") || (queryError as any).code === "42P01";

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Ocorreu um erro no banco de dados</h2>
        <p className="text-muted-foreground max-w-md">
          {isRLSError ? "Permissão negada. Verifique as políticas de RLS no Supabase para permitir acesso sem autenticação." : 
           isTableMissing ? "A tabela 'formats' não foi encontrada no Supabase." : 
           (queryError as any).message}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["formats"] })}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formatos de Conteúdo</h1>
          <p className="text-muted-foreground">Gerencie os tipos de conteúdo do seu painel pessoal.</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Novo Formato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingFormat ? "Editar Formato" : "Criar Novo Formato"}</DialogTitle>
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
                <Textarea id="description" placeholder="Descreva brevemente este formato..." {...register("description")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="Ativo" onValueChange={(v) => setValue("status", v)}>
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
                  <Label htmlFor="tags">Tags (vírgula)</Label>
                  <Input id="tags" placeholder="Vídeo, Social..." {...register("tags")} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingFormat ? "Atualizar" : "Salvar"}
                </Button>
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-20 text-center">Carregando formatos...</div>
          ) : filteredFormats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Video className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Nenhum formato encontrado</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">Crie seu primeiro formato para começar a organizar sua produção.</p>
              </div>
              <Button variant="outline" onClick={() => setSearchTerm("")}>Limpar Busca</Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredFormats.map((format: any) => (
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
                        <DropdownMenuItem className="gap-2" onClick={() => startEdit(format)}>
                          <Edit2 className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => deleteMutation.mutate(format.id)}>
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
                      {format.tags.map((tag: string) => (
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
