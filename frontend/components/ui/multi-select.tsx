"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="min-h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-500 flex flex-wrap gap-1 cursor-text"
        onClick={() => setOpen(true)}
      >
        {selected.length > 0 ? (
          selected.map((val) => {
            const option = options.find((o) => o.value === val);
            return (
              <Badge key={val} variant="secondary" className="bg-amber-100 text-amber-900 hover:bg-amber-200">
                {option?.label || val}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(val);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleRemove(val)}
                >
                  <X className="h-3 w-3 text-amber-900" />
                </button>
              </Badge>
            );
          })
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
            <div className="px-3 py-2 sticky top-0 bg-white border-b">
              <input
                type="text"
                className="w-full outline-none text-sm"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-amber-50 hover:text-amber-900",
                    selected.includes(option.value) && "bg-amber-50 text-amber-900 font-medium"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="block truncate">{option.label}</span>
                  {selected.includes(option.value) && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-2 pl-3 pr-9 text-muted-foreground">No results found.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
