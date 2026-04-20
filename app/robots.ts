import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/discover", "/discover/grants/", "/discover/projects/", "/showcase", "/hackathons", "/challenges", "/faq", "/u/"],
        disallow: ["/admin", "/dashboard", "/settings", "/projects", "/applications", "/reviews", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/discover", "/discover/grants/", "/discover/projects/", "/showcase", "/hackathons", "/challenges", "/faq", "/u/", "/llms.txt"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/discover", "/discover/grants/", "/discover/projects/", "/showcase", "/hackathons", "/challenges", "/faq", "/u/", "/llms.txt"],
      },
      {
        userAgent: "Anthropic-AI",
        allow: ["/", "/discover", "/discover/grants/", "/discover/projects/", "/showcase", "/hackathons", "/challenges", "/faq", "/u/", "/llms.txt"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/"],
      },
    ],
    sitemap: "https://team1.grants/sitemap.xml",
  };
}
