import React, { useEffect, useRef, useState } from "react";

import { useKeyDown } from "@/hooks/use-keydown";

interface SelectProps<T extends string | number> {
  placeholder?: string;
  options: T[];
  selected: T;
  onChange: (value: T) => void;
  formatOption?: (option: T) => string;
  className?: string;
}

export function Select<T extends string | number>({
  placeholder,
  options,
  selected,
  onChange,
  formatOption = (option) => `${option}`,
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option === selected);
  const selectedLabel = selectedOption ? formatOption(selectedOption) : (placeholder ?? 'Select…');
  const selectedIndex = options.findIndex((option) => option === selected);

  const toggleOptions = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState) setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0);
      return newState;
    });
  }

  const selectOption = (index: number) => {
    const option = options[index];
    
    if (option) {
      onChange(option);
      setIsOpen(false);
    }
  };

  useKeyDown(["ArrowDown", "ArrowUp"], () => {
    setIsOpen(true);
    setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0); 
  }, {
    condition: !isOpen,
    preventDefault: true,
    ...(containerRef.current && { target: containerRef.current })
  });

  useKeyDown("ArrowDown", () => {
    setIsOpen(true);

    setHighlightedIndex((prevIndex) => {
      if (prevIndex === null) return 0;
      return (++prevIndex + options.length) % options.length;
    });
  }, {
    condition: isOpen,
    preventDefault: true,
    ...(containerRef.current && { target: containerRef.current })
  });

  useKeyDown("ArrowUp", () => {
    setIsOpen(true);

    setHighlightedIndex((prevIndex) => {
      if (prevIndex === null) return options.length - 1;
      return (--prevIndex + options.length) % options.length;
    });
  }, {
    condition: isOpen,
    preventDefault: true,
    ...(containerRef.current && { target: containerRef.current })
  });

  useKeyDown(["Enter", "Space"], () => {
    selectOption(highlightedIndex!);
  }, {
    condition: isOpen && highlightedIndex !== null,
    preventDefault: true,
    ...(containerRef.current && { target: containerRef.current })
  });

  useKeyDown(["Enter", "Space"], () => {
    setIsOpen(true);
    setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0);
  }, {
    condition: !isOpen || highlightedIndex === null,
    preventDefault: true,
    ...(containerRef.current && { target: containerRef.current })
  });

  useKeyDown("Escape", () => { setIsOpen(false); }, {
    ...(containerRef.current && { target: containerRef.current })
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`group relative ${className}`} ref={containerRef}>
      <div
        ref={selectRef}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="select-options"
        className="select flex items-center relative w-full h-10 rounded-lg px-3 pr-8 py-2 truncate font-medium text-sm transition-colors duration-200 bg-white/5 text-white/60 hover:text-white placeholder:text-gray-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
        onClick={toggleOptions}
      >
        <span className="truncate min-w-0 w-full overflow-hidden whitespace-nowrap">{selectedLabel}</span>
      </div>

      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-white pointer-events-none transition-colors duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </span>

      {isOpen && (
        <ul
          id="select-options"
          role="listbox"
          className="absolute w-full z-50 mt-2 p-1 flex flex-col gap-1 ring-2 ring-white/30 rounded-lg backdrop-blur-sm bg-[#191919] text-white overflow-hidden"
        >
          {options.map((option, index) => (
            <li
              key={option}
              role="option"
              aria-selected={selected === option}
              className={`px-3 py-2 cursor-pointer text-sm font-medium rounded-md transition-colors ${
                highlightedIndex === index ? "bg-white/10 text-white" :  "text-white/60 hover:text-white hover:bg-white/10"
              } ${
                selectedIndex === index ? "!bg-blue-600 hover:!bg-blue-700 focus:!bg-blue-700 !text-white" : ""}`}
              onClick={() => selectOption(index)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {formatOption(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
