-- Controlled vocabulary for seeker skills. Additive: nothing reads or writes
-- this table until the seed and the autocomplete land, so applying it early is
-- safe. Written idempotently so a rebuilt database or preview branch can
-- replay the whole history.

CREATE TABLE IF NOT EXISTS "skills" (
    "id"            TEXT NOT NULL,
    "slug"          TEXT NOT NULL,
    "nameEn"        TEXT NOT NULL,
    "nameHi"        TEXT,
    "categorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aliases"       TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder"     INTEGER NOT NULL DEFAULT 0,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "skills_slug_key" ON "skills"("slug");
