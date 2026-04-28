import { MetadataRoute } from "next";
import { defaultSiteContent } from "@/lib/data/default-site-content";
import { getProjectSlug } from "@/lib/data/project-slug";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${SITE_URL}/construction`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${SITE_URL}/architecture`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${SITE_URL}/fleet-rental`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${SITE_URL}/projeler`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];

  const projectDetailRoutes: MetadataRoute.Sitemap = defaultSiteContent.projects.map((project) => ({
    url: `${SITE_URL}/projeler/${getProjectSlug(project)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75
  }));

  return [...staticRoutes, ...projectDetailRoutes];
}

