-- Execute este SQL no Supabase para criar a tabela de pedidos

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  cliente_telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  tipo_entrega TEXT NOT NULL DEFAULT 'retirada',
  frete DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  itens JSONB NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de qualquer pessoa (clientes)
CREATE POLICY "Permitir inserção de pedidos" ON pedidos
  FOR INSERT WITH CHECK (true);

-- Política para permitir leitura apenas para usuários autenticados (admin)
CREATE POLICY "Permitir leitura para autenticados" ON pedidos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir atualização apenas para usuários autenticados (admin)
CREATE POLICY "Permitir atualização para autenticados" ON pedidos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão apenas para usuários autenticados (admin)
DROP POLICY IF EXISTS "Permitir exclusão para autenticados" ON pedidos;
CREATE POLICY "Permitir exclusão para autenticados" ON pedidos
  FOR DELETE USING (auth.role() = 'authenticated');