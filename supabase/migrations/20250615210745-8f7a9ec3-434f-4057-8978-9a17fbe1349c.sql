
ALTER TABLE "public"."workouts" ADD COLUMN IF NOT EXISTS "ended_at" timestamp with time zone;
