import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: SITE_URL + c.href } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="no-print text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-x-1.5">
            {i > 0 && <span aria-hidden>›</span>}
            {c.href ? (
              <Link href={c.href} className="underline underline-offset-2 hover:text-brand">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </nav>
  );
}
