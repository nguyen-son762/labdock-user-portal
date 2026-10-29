import type { LegalSection } from "../legal.types";

type LegalDocumentSectionProps = {
  index: number;
  section: LegalSection;
};

export function LegalDocumentSection({ index, section }: LegalDocumentSectionProps) {
  const headingId = `legal-section-${index + 1}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="flex gap-1 text-2xl font-semibold leading-8 text-[#1f5fa8]">
        <span aria-hidden="true">{index + 1}.</span>
        <span>{section.title}</span>
      </h2>
      <div className="mt-3 text-base leading-6 text-[#051a50]">
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {section.list ? (
          <ul className="list-none" aria-labelledby={headingId}>
            {section.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {section.closing?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
