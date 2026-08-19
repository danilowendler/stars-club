'use client';

const PHRASES = [
  'La Jetée',
  'Coucher du Soleil',
  'We See The Stars',
  "Rien n'est plus précieux que le temps",
  'Stars Studios',
];

/** Rhythm break between the dense product grid and the closing sections.
    Purely decorative — the same words exist as real text elsewhere. */
export default function Marquee() {
  const run = [...PHRASES, ...PHRASES];

  return (
    <section aria-hidden="true" className="relative overflow-hidden border-y border-line py-10">
      <div
        className="marquee-track flex w-max items-center gap-14 whitespace-nowrap"
        style={{ ['--marquee-duration' as string]: '52s' }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-14">
            {run.map((phrase, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-14">
                <span
                  className="display text-bone/70 italic"
                  style={{ fontSize: 'var(--step-2)' }}
                >
                  {phrase}
                </span>
                <span className="size-1 shrink-0 rounded-full bg-gold" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
