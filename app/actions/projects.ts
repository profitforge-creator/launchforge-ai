"use server";

import { getIntegration } from "@/lib/storage/integration-store";
import { getUserSupabaseClient, getCurrentUser } from "@/lib/auth/session";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LFProject {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  github_repo_name: string | null;
  github_repo_url: string | null;
  github_repo_full_name: string | null;
  github_clone_url: string | null;
  vercel_project_id: string | null;
  vercel_project_name: string | null;
  vercel_project_url: string | null;
  stripe_product_id: string | null;
  stripe_product_name: string | null;
  stripe_dashboard_url: string | null;
  status: string;
  archived_at: string | null;
}

export interface CreateProjectStep {
  key: "github" | "vercel" | "stripe" | "storage";
  label: string;
  status: "pending" | "done" | "skipped" | "error";
  detail?: string;
  url?: string;
}

export interface CreateProjectResult {
  success: boolean;
  project: LFProject | null;
  steps: CreateProjectStep[];
}

function isMissingLFProjectsSchemaError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205" ||
    (message.includes("lf_projects") && message.includes("schema cache")) ||
    (message.includes("lf_projects") && message.includes("does not exist")) ||
    (message.includes("lf_projects.user_id") && message.includes("does not exist")) ||
    (message.includes("column") && message.includes("user_id") && message.includes("does not exist"))
  );
}

// ── Create project ────────────────────────────────────────────────────────────
// Runs each step independently — a failure in one step does not abort others.
// The caller receives all step statuses and any created resource URLs.

export async function actionCreateProject(
  name: string,
  description?: string,
  confirmExternalCreation = false,
): Promise<CreateProjectResult> {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  const steps: CreateProjectStep[] = [
    { key: "github",  label: "Create GitHub repository", status: "pending" },
    { key: "vercel",  label: "Create Vercel project",    status: "pending" },
    { key: "stripe",  label: "Create Stripe product",    status: "pending" },
    { key: "storage", label: "Save to LaunchForge",      status: "pending" },
  ];

  // Resolve auth without redirecting — this runs from a client action call, so
  // a thrown NEXT_REDIRECT would surface as a console error, not a navigation.
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      project: null,
      steps: steps.map((s) => ({ ...s, status: "error", detail: "Sign in to create a project." })),
    };
  }

  let githubRepoName:      string | null = null;
  let githubRepoUrl:       string | null = null;
  let githubRepoFullName:  string | null = null;
  let githubCloneUrl:      string | null = null;
  let vercelProjectId:     string | null = null;
  let vercelProjectName:   string | null = null;
  let vercelProjectUrl:    string | null = null;
  let stripeProductId:     string | null = null;
  let stripeProductName:   string | null = null;
  let stripeDashboardUrl:  string | null = null;

  // ── GitHub ──────────────────────────────────────────────────────────────────
  const githubIntegration = confirmExternalCreation ? await getIntegration("github", user.id) : null;
  if (!confirmExternalCreation) {
    steps[0] = { ...steps[0], status: "skipped", detail: "Skipped until external repository creation is explicitly confirmed." };
  } else if (!githubIntegration) {
    steps[0] = { ...steps[0], status: "skipped", detail: "GitHub not connected — reconnect on the Deployments page." };
  } else {
    try {
      const res = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization:          `Bearer ${githubIntegration.token}`,
          Accept:                 "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type":         "application/json",
          "User-Agent":           "launchforge-ai",
        },
        body: JSON.stringify({
          name:        slug,
          description: description ?? `${name} — created by LaunchForge`,
          private:     false,
          auto_init:   true,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (res.ok) {
        const repo = await res.json();
        githubRepoName     = repo.name        as string;
        githubRepoUrl      = repo.html_url    as string;
        githubRepoFullName = repo.full_name   as string;
        githubCloneUrl     = repo.clone_url   as string;
        steps[0] = { ...steps[0], status: "done", url: repo.html_url as string, detail: repo.full_name as string };
      } else {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        // 403 with "Missing required scopes" means the token needs repo scope — tell the user to reconnect
        const msg = res.status === 403 && String(body.message).includes("scope")
          ? "Token missing 'repo' scope — disconnect GitHub and reconnect to grant repository access."
          : ((body.message as string | undefined) ?? `HTTP ${res.status}`);
        steps[0] = { ...steps[0], status: "error", detail: msg };
      }
    } catch (e) {
      steps[0] = { ...steps[0], status: "error", detail: e instanceof Error ? e.message : "Network error" };
    }
  }

  // ── Vercel ──────────────────────────────────────────────────────────────────
  const vercelIntegration = confirmExternalCreation ? await getIntegration("vercel", user.id) : null;
  const vercelToken = confirmExternalCreation ? (vercelIntegration?.token ?? process.env.VERCEL_TOKEN) : undefined;
  if (!confirmExternalCreation) {
    steps[1] = { ...steps[1], status: "skipped", detail: "Skipped until external Vercel project creation is explicitly confirmed." };
  } else if (!vercelToken) {
    steps[1] = { ...steps[1], status: "skipped", detail: "VERCEL_TOKEN not set." };
  } else {
    try {
      // Get username so we can construct a direct project URL.
      let vercelUsername: string | null = null;
      try {
        const uRes = await fetch("https://api.vercel.com/v2/user", {
          headers: { Authorization: `Bearer ${vercelToken}` },
          cache:   "no-store",
          signal:  AbortSignal.timeout(8_000),
        });
        if (uRes.ok) {
          const u = await uRes.json();
          vercelUsername = (u.user?.username as string | undefined) ?? null;
        }
      } catch { /* non-fatal */ }

      const projectBody: Record<string, unknown> = { name: slug };
      if (githubRepoFullName) {
        projectBody.gitRepository = { type: "github", repo: githubRepoFullName };
      }

      const res = await fetch("https://api.vercel.com/v10/projects", {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body:   JSON.stringify(projectBody),
        signal: AbortSignal.timeout(15_000),
      });

      if (res.ok) {
        const proj = await res.json();
        vercelProjectId   = proj.id   as string;
        vercelProjectName = proj.name as string;
        vercelProjectUrl  = vercelUsername
          ? `https://vercel.com/${vercelUsername}/${proj.name}`
          : "https://vercel.com/dashboard";
        steps[1] = { ...steps[1], status: "done", url: vercelProjectUrl, detail: proj.name as string };
      } else {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const err  = body.error as Record<string, unknown> | undefined;
        steps[1] = { ...steps[1], status: "error", detail: (err?.message as string | undefined) ?? (body.message as string | undefined) ?? `HTTP ${res.status}` };
      }
    } catch (e) {
      steps[1] = { ...steps[1], status: "error", detail: e instanceof Error ? e.message : "Network error" };
    }
  }

  // ── Stripe ──────────────────────────────────────────────────────────────────
  const stripeIntegration = confirmExternalCreation ? await getIntegration("stripe", user.id) : null;
  const stripeKey = confirmExternalCreation ? (stripeIntegration?.token ?? process.env.STRIPE_SECRET_KEY) : undefined;
  if (!confirmExternalCreation) {
    steps[2] = { ...steps[2], status: "skipped", detail: "Skipped until external Stripe product creation is explicitly confirmed." };
  } else if (!stripeKey) {
    steps[2] = { ...steps[2], status: "skipped", detail: "STRIPE_SECRET_KEY not set." };
  } else {
    try {
      const form = new URLSearchParams();
      form.set("name", name);
      if (description) form.set("description", description);
      form.set("metadata[source]", "launchforge");
      form.set("metadata[slug]",   slug);

      const res = await fetch("https://api.stripe.com/v1/products", {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body:   form.toString(),
        signal: AbortSignal.timeout(15_000),
      });

      if (res.ok) {
        const product = await res.json();
        stripeProductId    = product.id   as string;
        stripeProductName  = product.name as string;
        stripeDashboardUrl = `https://dashboard.stripe.com/products/${product.id}`;
        steps[2] = { ...steps[2], status: "done", url: stripeDashboardUrl, detail: product.id as string };
      } else {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const err  = (body.error as Record<string, unknown> | undefined);
        steps[2] = { ...steps[2], status: "error", detail: (err?.message as string | undefined) ?? `HTTP ${res.status}` };
      }
    } catch (e) {
      steps[2] = { ...steps[2], status: "error", detail: e instanceof Error ? e.message : "Network error" };
    }
  }

  // ── Supabase ─────────────────────────────────────────────────────────────────
  try {
    const supabase = await getUserSupabaseClient();
    if (!supabase) {
      steps[3] = { ...steps[3], status: "error", detail: "Authentication required." };
      return { success: false, project: null, steps };
    }
    const { data, error } = await supabase
      .from("lf_projects")
      .insert({
        user_id: user.id,
        name,
        slug,
        description:          description ?? null,
        github_repo_name:     githubRepoName,
        github_repo_url:      githubRepoUrl,
        github_repo_full_name: githubRepoFullName,
        github_clone_url:     githubCloneUrl,
        vercel_project_id:    vercelProjectId,
        vercel_project_name:  vercelProjectName,
        vercel_project_url:   vercelProjectUrl,
        stripe_product_id:    stripeProductId,
        stripe_product_name:  stripeProductName,
        stripe_dashboard_url: stripeDashboardUrl,
        status:               "active",
        archived_at:          null,
      })
      .select()
      .single();

    if (error) {
      if (isMissingLFProjectsSchemaError(error)) {
        steps[3] = {
          ...steps[3],
          status: "error",
          detail: "Supabase project schema is missing public.lf_projects.user_id. Apply the approved migration before saving projects.",
        };
        return { success: false, project: null, steps };
      }
      steps[3] = { ...steps[3], status: "error", detail: error.message };
      return { success: false, project: null, steps };
    }

    steps[3] = { ...steps[3], status: "done" };
    return { success: true, project: data as LFProject, steps };
  } catch (e) {
    steps[3] = { ...steps[3], status: "error", detail: e instanceof Error ? e.message : "Database error" };
    return { success: false, project: null, steps };
  }
}

// ── List projects ─────────────────────────────────────────────────────────────

export async function actionGetLFProjects(): Promise<{ data: LFProject[]; error: string | null }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: [], error: null }; // not signed in — empty list, no error banner
    const supabase = await getUserSupabaseClient();
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
      .from("lf_projects")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (isMissingLFProjectsSchemaError(error)) {
      // TODO: Apply the lf_projects ownership migration so public.lf_projects.user_id exists.
      return { data: [], error: null };
    }
    if (error) return { data: [], error: error.message };
    return { data: (data as LFProject[]) ?? [], error: null };
  } catch (e) {
    return { data: [], error: e instanceof Error ? e.message : String(e) };
  }
}

// ── Delete project ────────────────────────────────────────────────────────────

export async function actionDeleteLFProject(id: string): Promise<{ error: string | null }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Authentication required." };
    const supabase = await getUserSupabaseClient();
    if (!supabase) return { error: "Authentication required." };
    const { error } = await supabase
      .from("lf_projects")
      .update({ archived_at: new Date().toISOString(), status: "archived" })
      .eq("id", id)
      .eq("user_id", user.id);
    if (isMissingLFProjectsSchemaError(error)) return { error: null };
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
