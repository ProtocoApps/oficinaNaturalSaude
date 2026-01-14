-- Execute este SQL no Supabase SQL Editor para permitir exclusão de pedidos
-- Vá em: Supabase Dashboard > SQL Editor > New Query > Cole este código > Run

-- Primeiro, remove a política se ela já existir (para evitar erro se executar novamente)
DROP POLICY IF EXISTS "Permitir exclusão para autenticados" ON pedidos;

-- Depois, cria a política para permitir exclusão apenas para usuários autenticados (admin)
CREATE POLICY "Permitir exclusão para autenticados" ON pedidos
  FOR DELETE USING (auth.role() = 'authenticated');

