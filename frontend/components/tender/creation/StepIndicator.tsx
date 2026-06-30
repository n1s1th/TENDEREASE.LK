"use client";

import { cn } from "@/lib/utils";
import { STEP_LABELS, type StepIndex } from "@/lib/types/tender-creation.types";

interface StepIndicatorProps {
  currentStep: StepIndex;
  onStepClick: (step: StepIndex) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between p-1.5 rounded-xl bg-grey-1/70 backdrop-blur-sm border border-grey-2 shadow-inner overflow-x-auto overflow-y-hidden no-scrollbar">
        {STEP_LABELS.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          // Gradient for active: primary #953002 to secondary #FFB401 (or just primary)
          const activeClasses = "bg-gradient-to-r from-[#953002] to-[#c44e05] text-white shadow-sm rounded-md px-4 lg:px-5 py-2 whitespace-nowrap";
          const inactiveClasses = "text-grey-4 hover:text-[#953002] px-3 py-2 transition-colors whitespace-nowrap rounded-md hover:bg-grey-2/50";
          
          return (
            <button
              key={label}
              type="button"
              onClick={() => onStepClick(index as StepIndex)}
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-medium outline-none shrink-0",
                isCurrent ? activeClasses : inactiveClasses
              )}
            >
              {/* Using a small circle for index */}
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  isCurrent 
                    ? "bg-white/20 text-white" 
                    : isCompleted
                      ? "bg-grey-2 text-grey-4" // Use grey check/number for completed
                      : "bg-grey-2 text-grey-4"
                )}
              >
                {index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
