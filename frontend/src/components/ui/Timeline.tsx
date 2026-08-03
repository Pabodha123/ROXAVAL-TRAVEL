import React from 'react';
import { CheckIcon } from 'lucide-react';
import type { TimelineResult } from '../../lib/tourTimeline';

interface TimelineProps extends TimelineResult {
  className?: string;
}

/**
 * Reusable ✓ done / ● current / ○ future step-progress row, extracted from
 * CustomTourWizard's progress header. Used for both the single-request view
 * (REQUEST_STAGES) and the whole-tour view (FULL_STAGES) — see lib/tourTimeline.ts.
 */
export function Timeline({ stages, currentIndex, halted, haltedLabel, caption, className = '' }: TimelineProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {stages.map((stage, i) => {
          const isHaltedHere = halted && i === currentIndex;
          const isDone = !halted && i < currentIndex;
          const isCurrent = i === currentIndex;

          const dotStyle = isHaltedHere ?
          'bg-red-600 text-white' :
          isCurrent ?
          'bg-gold text-forest' :
          isDone ?
          'bg-emerald text-white' :
          'border border-forest/20 text-forest/40';

          const labelStyle = isHaltedHere ?
          'text-red-600' :
          isCurrent ?
          'text-forest' :
          isDone ?
          'text-forest/70' :
          'text-forest/35';

          return (
            <React.Fragment key={stage.key}>
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors ${dotStyle}`}>
                  {isDone ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`whitespace-nowrap text-[11px] font-medium ${labelStyle}`}>
                  {isHaltedHere ? haltedLabel || stage.label : stage.label}
                </span>
              </div>
              {i < stages.length - 1 &&
              <div className={`h-px w-6 shrink-0 sm:w-10 ${isDone || isHaltedHere ? 'bg-emerald' : 'bg-forest/10'}`} />
              }
            </React.Fragment>);

        })}
      </div>
      {caption && !halted && <p className="mt-2 text-xs font-medium text-gold">{caption}</p>}
    </div>);

}
