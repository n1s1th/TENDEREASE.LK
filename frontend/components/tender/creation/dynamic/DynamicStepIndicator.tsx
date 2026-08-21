"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface DynamicStepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function DynamicStepIndicator({ steps, currentStep, onStepClick }: DynamicStepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="w-full py-2">
      <ol className="flex items-start justify-between">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={index} className="flex-1 relative">
              <div className="flex flex-col items-center gap-2.5">
                {/* Connector line (left side) */}
                {index > 0 && (
                  <div
                    className={cn(
                      "absolute top-[18px] right-1/2 w-full h-[2px] -translate-y-1/2",
                      isCompleted || isCurrent ? "bg-[#953002]" : "bg-grey-2"
                    )}
                  />
                )}

                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    isCompleted && "border-[#953002] bg-[#953002] text-white",
                    isCurrent && "border-[#953002] bg-white text-[#953002] shadow-[0_0_0_3px_rgba(149,48,2,0.15)]",
                    !isCompleted && !isCurrent && "border-grey-3 bg-white text-grey-4"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs text-center leading-tight max-w-[90px]",
                    isCurrent ? "font-semibold text-[#953002]" :
                    isCompleted ? "font-medium text-foreground" :
                    "font-normal text-grey-5"
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
