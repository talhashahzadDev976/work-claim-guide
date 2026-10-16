export type FaqItem = { q: string; a: string };

export function Faq({ items, withSchema = false }: { items: FaqItem[]; withSchema?: boolean }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="border-b border-line">
          <summary className="flex min-h-12 items-start gap-2.5 py-3.5 font-semibold hover:text-brand">
            <span aria-hidden className="marker mt-[5px] text-[10px]">
              ▶
            </span>
            <span>{item.q}</span>
          </summary>
          <p className="pb-4 pl-[20px] text-muted">{item.a}</p>
        </details>
      ))}
      {withSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
    </div>
  );
}
