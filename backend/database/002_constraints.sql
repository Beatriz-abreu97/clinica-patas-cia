CREATE INDEX IF NOT EXISTS idx_animal_tutor_id ON animal (tutor_id);

ALTER TABLE tutor  ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ;
ALTER TABLE animal ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ;

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
