"use server";

import { getAllGenerations } from "@/lib/storage/generation-store";

export interface ProjectAnalyticsSummary {
  id: string;
  name: string;
  type: string;
  score: number;
  demand: number;
  monetization: number;
  competition: number;
  difficulty: number;
  createdAt: string;
  hasWebsite: boolean;
  hasMarketing: boolean;
  fileCount: number;
  websiteFileCount: number;
  niche: string;
  topRecommendation: string | null;
}

export interface AnalyticsData {
  projects: ProjectAnalyticsSummary[];
  totalProjects: number;
  totalFiles: number;
  totalWebsites: number;
  totalMarketingPlans: number;
  avgScore: number;
  topProject: ProjectAnalyticsSummary | null;
  scoreDistribution: { label: string; score: number }[];
}

export interface ProjectListItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  hasWebsite: boolean;
  hasMarketing: boolean;
}

export async function actionGetProjectList(): Promise<ProjectListItem[]> {
  try {
    const generations = getAllGenerations();
    return generations.map((g) => ({
      id: g.id,
      name: g.product.name,
      type: g.formData.businessType ?? "open",
      createdAt: g.createdAt,
      hasWebsite: (g.projectFiles?.filter((f) => f.folder === "website") ?? []).length > 0,
      hasMarketing: (g.marketing?.launchStrategy?.length ?? 0) > 0,
    }));
  } catch (err) {
    console.error("[actionGetProjectList] unexpected error:", err);
    return [];
  }
}

export async function actionGetAnalyticsData(): Promise<AnalyticsData> {
  const generations = getAllGenerations();

  const projects: ProjectAnalyticsSummary[] = generations.map((g) => {
    const websiteFiles = g.projectFiles?.filter((f) => f.folder === "website") ?? [];
    const topRec = g.recommendations?.find((r) => r.priority === "high") ?? null;

    return {
      id: g.id,
      name: g.product.name,
      type: g.formData.businessType ?? "open",
      score: g.scores.overall,
      demand: g.scores.demand,
      monetization: g.scores.monetization,
      competition: g.scores.competition,
      difficulty: g.scores.difficulty,
      createdAt: g.createdAt,
      hasWebsite: websiteFiles.length > 0,
      hasMarketing: (g.marketing?.launchStrategy?.length ?? 0) > 0,
      fileCount: g.projectFiles?.length ?? 0,
      websiteFileCount: websiteFiles.length,
      niche: g.niche,
      topRecommendation: topRec?.title ?? null,
    };
  });

  const sorted = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalFiles = projects.reduce((s, p) => s + p.fileCount, 0);
  const totalWebsites = projects.filter((p) => p.hasWebsite).length;
  const totalMarketingPlans = projects.filter((p) => p.hasMarketing).length;
  const avgScore =
    projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + p.score, 0) / projects.length)
      : 0;
  const topProject =
    projects.reduce<ProjectAnalyticsSummary | null>(
      (best, p) => (!best || p.score > best.score ? p : best),
      null,
    );

  const scoreDistribution = sorted.slice(0, 8).map((p) => ({
    label: p.name.split(" ").slice(0, 2).join(" "),
    score: p.score,
  }));

  return {
    projects: sorted,
    totalProjects: projects.length,
    totalFiles,
    totalWebsites,
    totalMarketingPlans,
    avgScore,
    topProject,
    scoreDistribution,
  };
}
