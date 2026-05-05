import { createFileRoute } from "@tanstack/react-router";
import { 
  Bookmark, 
  Search, 
  Plus, 
  ChevronRight, 
  MoreVertical,
  ArrowLeft,
  Youtube,
  Instagram,
  Zap,
  Cpu,
  Trash2,
  Edit2
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/references")({
  component: ReferencesPage,
});

function ReferencesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categoriesData } = useQuery({
    queryKey: ["reference-categories"],
    enabled: true,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("reference_categories").select("*, references(count)");
        if (error) {
          console.error("Reference Categories Error:", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error("Reference Categories Critical Error:", err);
        return [];
      }
    }
  });

  const { data: topicsData } = useQuery({
    queryKey: ["reference-topics", selectedCategory],
    enabled: !!selectedCategory,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("references")
          .select("*")
          .eq("category_id", selectedCategory);
        if (error) {
          console.error("Reference Topics Error:", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error("Reference Topics Critical Error:", err);
        return [];
      }
    }
  });

  const categories = categoriesData?.map((c: any) => ({
    id: c.id,
    title: c.name,
    icon: c.icon === 'Youtube' ? Youtube : c.icon === 'Instagram' ? Instagram : c.icon === 'Zap' ? Zap : Cpu,
    color: c.color || "text-blue-500",
    count: c.references?.[0]?.count || 0
  })) || [];

  const topics = topicsData?.map((t: any) => ({
    id: t.id,
    categoryId: t.category_id,
    title: t.title,
    description: t.description,
    status: t.status,
    tags: t.tags || []
  })) || [];

  const filteredCategories = categories.filter((c: any) => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTopics = topics.filter((t: any) => 
    t.categoryId === selectedCategory &&
    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedCategory) {
    const category = categories.find((c: any) => c.id === selectedCategory);
    return (
      <div className="space-y-8 pb-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category?.title}</h1>
            <p className="text-muted-foreground">Tópicos de referência para {category?.title}.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Buscar em ${category?.title}...`}
              className="pl-9 bg-muted/30 border-transparent focus:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Novo Tópico
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic: any) => (
            <Card key={topic.id} className="hover:border-primary/40 transition-all shadow-sm group">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{topic.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-medium bg-muted/50">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                    {topic.status}
                  </Badge>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">Ver detalhes</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredTopics.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              Nenhum tópico encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referências</h1>
          <p className="text-muted-foreground">Organize inspirações, tutoriais e estudos por categoria.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar categorias..."
          className="pl-9 bg-muted/30 border-transparent focus:bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCategories.map((category: any) => (
          <Card 
            key={category.id} 
            className="group hover:border-primary/40 transition-all shadow-md cursor-pointer overflow-hidden border-border/40"
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-muted/50 ${category.color} transition-transform group-hover:scale-110`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {category.count} itens
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{category.title}</h3>
                <p className="text-sm text-muted-foreground">Clique para ver tópicos</p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir categoria <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
