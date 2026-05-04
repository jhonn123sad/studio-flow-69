import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências de conta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Como você aparece no painel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input disabled value={user?.email || ""} />
              </div>
              <div className="space-y-2">
                <Label>Nome de Exibição</Label>
                <Input placeholder="Seu nome" defaultValue={user?.user_metadata?.full_name || ""} />
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Mude sua senha ou gerencie sessões.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button variant="outline">Alterar Senha</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Assinatura</CardTitle>
              <CardDescription>Seu plano atual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="font-bold text-primary">Plano Pro</p>
                <p className="text-xs text-primary/80">Renova em 12 de Junho, 2024</p>
              </div>
              <Button variant="outline" className="w-full">Gerenciar Assinatura</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
