import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/common/utils/index';

function formatRaw(value: number): string {
  return Math.round(value).toLocaleString('es-CO');
}

function parseDisplay(str: string): number {
  return parseInt(str.replace(/\D/g, ''), 10) || 0;
}

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  min?: number;
}

export function CurrencyInput({ value, onChange, className, ...props }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatRaw(value));

  useEffect(() => {
    setDisplay(formatRaw(value));
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseDisplay(raw);
    setDisplay(raw === '' ? '' : formatRaw(num));
    onChange(num);
  }, [onChange]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}
