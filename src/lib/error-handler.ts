import { toast } from "sonner";

/**
 * Interface padronizada para erros do sistema
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Captura e trata erros de forma amigável para o usuário
 */
export const handleError = (error: any, context?: string) => {
  console.error(`[Error Context: ${context || "Unknown"}]:`, error);

  let message = "Ocorreu um erro inesperado. Tente novamente.";
  let description = "";

  // Erros do Supabase
  if (error?.message) {
    if (error.message.includes("Invalid login credentials")) {
      message = "Credenciais inválidas";
      description = "E-mail ou senha incorretos.";
    } else if (error.message.includes("JWT expired")) {
      message = "Sessão expirada";
      description = "Por favor, faça login novamente.";
    } else if (error.message.includes("new row violates row-level security policy")) {
      message = "Acesso negado";
      description = "Você não tem permissão para realizar esta ação.";
    } else {
      message = "Erro no servidor";
      description = error.message;
    }
  }

  // Toast amigável
  toast.error(message, {
    description: description || undefined,
    duration: 5000,
  });

  return new AppError(message, error?.code, error);
};

/**
 * Wrapper para chamadas assíncronas com tratamento de erro embutido
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  context: string
): Promise<[T | null, any]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    handleError(error, context);
    return [null, error];
  }
}
