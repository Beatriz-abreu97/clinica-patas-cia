-- Ajustes aplicados sobre o schema já existente no Supabase.
-- Pode rodar mais de uma vez: todas as operações são idempotentes.

-- Índice para a consulta mais frequente ("animais de um tutor").
CREATE INDEX IF NOT EXISTS idx_animal_tutor_id ON animal (tutor_id);

-- Colunas de auditoria. Preenchidas pelo UPDATE da API (sem trigger).
ALTER TABLE tutor  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ;
ALTER TABLE animal ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ;

-- Regras também garantidas pelo banco, além da validação na API.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_animal_idade') THEN
        ALTER TABLE animal ADD CONSTRAINT ck_animal_idade
            CHECK (idade IS NULL OR idade >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_animal_peso') THEN
        ALTER TABLE animal ADD CONSTRAINT ck_animal_peso
            CHECK (peso IS NULL OR peso > 0);
    END IF;
END $$;
