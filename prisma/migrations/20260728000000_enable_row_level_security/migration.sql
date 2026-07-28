-- Enables Row Level Security on every public table, closing the exposure
-- Supabase's Security Advisor flags ("RLS Disabled in Public"): without it,
-- anyone with this project's public Supabase API key could query these
-- tables directly through Supabase's auto-generated REST API.
--
-- No policies are added on purpose. Nodalis never queries through that
-- REST API — it connects straight to Postgres via Prisma, as the tables'
-- owning role, and Postgres does not apply RLS to a table's owner. So this
-- fully blocks the REST API path while leaving the app's own DB access
-- completely unaffected.

ALTER TABLE "Story" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Theme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StoryTheme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Source" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Thread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ThreadEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
