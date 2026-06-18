-- 005_plans_and_usage.sql
-- Per-user subscription plan + persistent monthly usage quota.
-- Applied to project kphhqxjfmkkutmtqnxkp. Stripe webhook will upsert lf_user_plans later.

-- Per-user plan (defaults to free until a row exists)
CREATE TABLE IF NOT EXISTS public.lf_user_plans (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan       text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','growth','scale')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lf_user_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own plan read" ON public.lf_user_plans;
CREATE POLICY "own plan read" ON public.lf_user_plans FOR SELECT USING (auth.uid() = user_id);

-- Monthly usage counters (period = 'YYYY-MM')
CREATE TABLE IF NOT EXISTS public.lf_usage (
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period        text NOT NULL,
  projects_used int  NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, period)
);
ALTER TABLE public.lf_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own usage read" ON public.lf_usage;
CREATE POLICY "own usage read" ON public.lf_usage FOR SELECT USING (auth.uid() = user_id);

-- Resolve caller's plan (defaults free); SECURITY DEFINER, keyed by auth.uid()
CREATE OR REPLACE FUNCTION public.current_plan()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT plan FROM public.lf_user_plans WHERE user_id = auth.uid()), 'free');
$$;

-- Atomically consume one project from the monthly quota. true = allowed. p_limit < 0 = unlimited.
CREATE OR REPLACE FUNCTION public.consume_project_quota(p_period text, p_limit int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ok boolean;
BEGIN
  INSERT INTO public.lf_usage(user_id, period, projects_used)
    VALUES (auth.uid(), p_period, 0)
    ON CONFLICT (user_id, period) DO NOTHING;
  UPDATE public.lf_usage
    SET projects_used = projects_used + 1, updated_at = now()
    WHERE user_id = auth.uid() AND period = p_period
      AND (p_limit < 0 OR projects_used < p_limit)
    RETURNING true INTO ok;
  RETURN COALESCE(ok, false);
END; $$;

GRANT EXECUTE ON FUNCTION public.current_plan() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.consume_project_quota(text, int) TO authenticated, anon;
