import React, { useEffect, useRef } from "react";

type CustomValueChangeEventContext = {
  e: React.KeyboardEvent<HTMLInputElement>;
  context: 'keyboard';
} | {
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>;
  context: 'button-up' | 'button-down';
}

interface BorderRadiusSelectorProps {
  title: string;
  options: number[];
  selected: number | "custom";
  onChange: (value: number | "custom") => void;
  customValue?: number | null;
  onCustomValueChange?: (value: number | null) => void;
}

export function BorderRadiusSelector({
  title,
  options,
  selected,
  onChange,
  customValue,
  onCustomValueChange,
}: BorderRadiusSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const customValueInputRef = useRef<HTMLInputElement>(null);
  const customValueIncrementRef = useRef<HTMLButtonElement>(null);
  const customValueDecrementRef = useRef<HTMLButtonElement>(null);

  // handle basic validation on the change event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // If the input is a valid number, set state (empty string should become null)
    if (/^(\d+\.?\d*|\.\d*)?$/.test(rawInput)) {
      onCustomValueChange?.(rawInput === "" ? null : parseFloat(rawInput));
    }
  }

  // but handle most of the validation on blur, which allows the user to clear the input
  // completely, so they can type anything—including values that begin with "0", like "0.25"
  const handleInputBlur = () => {
    // Empty input and invalid (NaN) input should cause the input to be reset to 1
    if (customValue === null || customValue === undefined || isNaN(customValue)) {
      onCustomValueChange?.(1);
      return;
    }
    
    // Remove leading and trailing whitespace
    let normalizedValue = customValue.toString().trim();

    // Decimal values should always have a single leading zero
    if (normalizedValue.startsWith("."))
      normalizedValue = "0" + normalizedValue;
    
    // Decimal values should always have only one leading zero
    if (/^0+\d+$/.test(normalizedValue))
      normalizedValue = String(parseFloat(normalizedValue));

    // Decimal values should never have trailing zeroes
    if (normalizedValue.includes("."))
      normalizedValue = parseFloat(normalizedValue).toString();

    // Values of 0 should be normalized to 1
    if (normalizedValue === "0") normalizedValue = "1";

    // Parse the normalized value as a number, clamp it to the range 0 < value < 1000, and set state
    const clampedValue = Math.min(1000 - Number.EPSILON, Math.max(Number.MIN_VALUE, parseFloat(normalizedValue)));
    onCustomValueChange?.(clampedValue);
  }

  // a generalized handler for custom value changes which can operate in different contexts—keyboard/keydown
  // on the custom value input itself, or pointer/click on the custom value input's increment/decrement buttons
  const handleCustomValueStep = ({ e, context }: CustomValueChangeEventContext) => {
    if (context === 'keyboard' && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

    e.preventDefault();
    const currentValue = customValue ?? 0.1;
    let step = 1;

    if (e.shiftKey) step = 10;
    if (e.altKey) step = 0.1;
    
    const newValue =
      (context === 'keyboard' && e.key === "ArrowUp") || (context === 'button-up')
        ? (currentValue || 0) + step
        : (currentValue || 0) - step;

    const clampedValue = Math.min(
      e.altKey ? 999.9 : 999,
      Math.max(e.altKey ? 0.1 : 1, Number(newValue.toFixed(1))),
    );

    onCustomValueChange?.(clampedValue);
  }

  useEffect(() => {
    if (!selectedRef.current || !highlightRef.current || !containerRef.current) return;

    // prevent layout thrashing
    requestAnimationFrame(() => {
      const container = containerRef.current!;
      const selected = selectedRef.current!;
      const highlight = highlightRef.current!;

      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();

      highlight.style.left = `${selectedRect.left - containerRect.left}px`;
      highlight.style.width = `${selectedRect.width}px`;
    });
  }, [selected]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-white/60">{title}</span>
      <div className="flex flex-col items-center justify-center gap-2">
        <div
          ref={containerRef}
          className="relative inline-flex rounded-lg bg-white/5 p-1"
        >
          <div
            ref={highlightRef}
            className="absolute inset-y-1 rounded-md bg-blue-600 transition-all duration-200"
          />
          {[...options, "custom" as const].map((option) => (
            <button
              key={String(option)}
              ref={option === selected ? selectedRef : null}
              onClick={() =>
                onChange(typeof option === "number" ? option : "custom")
              }
              className={`option relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-none ${
                option === selected
                  ? "text-white"
                  : "text-white/60 hover:text-white focus:bg-white/10"
              }`}
            >
              {option === "custom" ? "Custom" : option}
            </button>
          ))}
        </div>
        {selected === "custom" && (
          <div className="w-36 flex items-center gap-2">
            <div className="group relative flex items-center w-full">
              <input
                ref={customValueInputRef}
                type="number"
                min="1"
                max="999"
                step="1"
                value={customValue === null ? "" : customValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={(e) => handleCustomValueStep({ e, context: 'keyboard' })}
                className="w-full h-10 rounded-lg px-3 pr-[50px] py-2 text-sm font-medium bg-white/5 text-white/60 group-hover:text-white group-focus-within:text-white placeholder:text-gray-500 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-none group-focus-within:ring-2 group-focus-within:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:[-webkit-appearance:none] [&::-webkit-inner-spin-button]:opacity-0 [&::-webkit-outer-spin-button]:opacity-0"
                placeholder="Enter radius"
              />
              <span className="absolute right-8 font-medium text-sm text-gray-500">px</span>
              <button
                ref={customValueIncrementRef}
                className="absolute right-2 top-2 flex items-center justify-center w-4 h-3 cursor-pointer transition-colors text-gray-500 hover:text-white focus:rounded-sm focus:outline-none focus:ring-none focus:text-white focus:bg-white/10"
                onClick={(e) => handleCustomValueStep({ e, context: 'button-up' })}
                onMouseLeave={() => {
                  // prevent increment/decrement buttons from retaining focus after click and even after mouseleave
                  if (document.activeElement === customValueIncrementRef.current) {
                    customValueIncrementRef.current?.blur();
                    customValueInputRef.current?.focus();
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </button>
              <button
                ref={customValueDecrementRef}
                className="absolute right-2 bottom-2 flex items-center justify-center w-4 h-3 cursor-pointer transition-colors text-gray-500 hover:text-white focus:rounded-sm focus:outline-none focus:ring-none focus:text-white focus:bg-white/10"
                onClick={(e) => handleCustomValueStep({ e, context: 'button-down' })}
                onMouseLeave={() => {
                  // prevent increment/decrement buttons from retaining focus after click and even after mouseleave
                  if (document.activeElement === customValueDecrementRef.current) {
                    customValueDecrementRef.current?.blur();
                    customValueInputRef.current?.focus();
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
