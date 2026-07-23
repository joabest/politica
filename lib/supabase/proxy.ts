import { NextResponse, type NextRequest } from "next/server";

/**
 * Modo temporário de demonstração.
 * Libera todas as rotas sem exigir login para testes de interface e navegação.
 * Para reativar a autenticação, restaure a implementação com Supabase.
 */
export async function updateSession(_request: NextRequest) {
  return NextResponse.next();
}
