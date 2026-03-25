// components/evaluation/ScoreInput.tsx
'use client';

import React from 'react';

interface ScoreInputProps {
  value: number;
  maxValue?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showMax?: boolean;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  value,
  maxValue = 100,
  onChange,
  disabled = false,
  showMax = true,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (newValue >= 0 && newValue <= maxValue) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={maxValue}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-20 px-3 py-2 border border-[#B0B0B0] rounded-md text-center font-medium
          focus:outline-none focus:ring-2 focus:ring-[#FFB401] focus:border-transparent
          disabled:bg-[#E0E0E0] disabled:cursor-not-allowed
          text-[#333333]"
        style={{ fontSize: '14px' }}
      />
      {showMax && (
        <span className="text-[#828282] text-sm" style={{ fontSize: '14px' }}>
          / {maxValue}
        </span>
      )}
    </div>
  );
};