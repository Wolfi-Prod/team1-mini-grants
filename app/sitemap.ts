import type { MetadataRoute } from "next";

const BASE = "https://team1.grants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/discover`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/showcase`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/hackathons`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/challenges`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];

  // In a real deployment, these would be fetched from the database.
  // For the mock layer, we list known IDs.
  const grantPages: MetadataRoute.Sitemap = [
    "grant_minigrant",
    "grant_defi",
    "grant_nft",
    "grant_infra",
    "grant_tooling",
    "grant_gaming",
    "grant_education",
  ].map((id) => ({
    url: `${BASE}/discover/grants/${id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const projectPages: MetadataRoute.Sitemap = [
    "proj_01",
    "proj_04",
  ].map((id) => ({
    url: `${BASE}/discover/projects/${id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const competitionPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/hackathons/comp_summer_hack`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE}/hackathons/comp_subnet_jam`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE}/challenges/comp_security_challenge`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE}/challenges/comp_zk_challenge`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
  ];

  const profilePages: MetadataRoute.Sitemap = [
    "alice",
    "oscar",
    "paul",
  ].map((handle) => ({
    url: `${BASE}/u/${handle}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...grantPages,
    ...projectPages,
    ...competitionPages,
    ...profilePages,
  ];
}
