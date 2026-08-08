import React from 'react';

// Renders free-text fields (inclusions/exclusions/cancellation policy/customer-facing
// notes) that admins fill from a blank-line-separated "Heading \n bullet lines"
// template (see DEFAULT_* constants in the admin itinerary builder) — parsed here into
// headed sections instead of dumped as one run-on paragraph.
export function NotesBlock({ text }: { text?: string }) {
  if (!text || !text.trim()) return null;
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length === 1) {
          return <p key={i} className="text-xs leading-relaxed text-forest/60">{lines[0]}</p>;
        }
        const [heading, ...rest] = lines;
        return (
          <div key={i}>
            <p className="text-sm font-semibold text-forest">{heading}</p>
            <ul className="mt-1.5 space-y-1">
              {rest.map((line, j) =>
                <li key={j} className="text-xs leading-relaxed text-forest/70">{line.replace(/^-\s*/, '')}</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
