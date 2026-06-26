'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search, MapPin, Check, X } from 'lucide-react';
import type { City } from '../lib/locations';

interface LocationPickerProps {
  cities: City[];
  value: City | null;
  recents: City[];
  onSelect: (c: City) => void;
  onClose: () => void;
}

const MAX_ROWS = 50;

function sameCity(a: City | null, b: City | null): boolean {
  if (!a || !b) return false;
  return a.name === b.name && a.country === b.country && a.lat === b.lat && a.lon === b.lon;
}

export default function LocationPicker({ cities, value, recents, onSelect, onClose }: LocationPickerProps) {
  const baseId = useId();
  const listboxId = baseId + '-listbox';
  const optionId = (i: number) => baseId + '-opt-' + i;

  const [query, setQuery] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Focus the input on mount so the keyboard combobox is immediately usable.
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Flat option list + whether to show the "Recent" header.
  // Empty query -> recents (or first rows as a starting point); typing -> filtered, capped.
  const { options, showRecent } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') {
      if (recents.length > 0) return { options: recents, showRecent: true };
      return { options: cities.slice(0, MAX_ROWS), showRecent: false };
    }
    const out: City[] = [];
    for (let i = 0; i < cities.length && out.length < MAX_ROWS; i++) {
      const c = cities[i];
      if (c.name.toLowerCase().indexOf(q) >= 0 || c.country.toLowerCase().indexOf(q) >= 0) {
        out.push(c);
      }
    }
    return { options: out, showRecent: false };
  }, [query, cities, recents]);

  // Reset virtual focus whenever the option set changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Keep the active option scrolled into view without moving DOM focus off the input.
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = document.getElementById(optionId(activeIndex));
    if (el && el.scrollIntoView) {
      try {
        el.scrollIntoView({ block: 'nearest' });
      } catch (e) {
        el.scrollIntoView(false); // ponytail: Safari 10 lacks options arg; boolean form is enough
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const last = options.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (last < 0) return;
        setActiveIndex((i) => (i >= last ? last : i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (last < 0) return;
        setActiveIndex((i) => (i <= 0 ? last : i - 1));
        break;
      case 'Home':
        if (last < 0) return;
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        if (last < 0) return;
        e.preventDefault();
        setActiveIndex(last);
        break;
      case 'Enter': {
        // Fall back to the top match so type-then-Enter (and the iOS keyboard's return key) selects.
        const idx = activeIndex >= 0 ? activeIndex : 0;
        if (last >= 0 && idx <= last) {
          e.preventDefault();
          onSelect(options[idx]);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const activeDescId = activeIndex >= 0 ? optionId(activeIndex) : undefined;

  return (
    <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="text-base font-semibold text-white/90 tracking-wide">Choose location</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2 -mr-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search input (combobox) */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 focus-within:border-emerald-400/60 transition-colors duration-200">
          <Search className="w-5 h-5 text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeDescId}
            aria-label="Search for a city or country"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Search city or country"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-white/90 placeholder-white/30 text-base py-3 outline-none min-w-0"
          />
          {query !== '' && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                if (inputRef.current) inputRef.current.focus();
              }}
              aria-label="Clear search"
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-200 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Listbox */}
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label="Locations"
        className="max-h-[50vh] overflow-y-auto px-2 pb-3 pt-1"
      >
        {showRecent && (
          <li
            role="presentation"
            className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/40"
          >
            Recent
          </li>
        )}

        {options.length === 0 ? (
          <li role="presentation" className="px-3 py-6 text-center text-sm text-white/40">
            No matches
          </li>
        ) : (
          options.map((c, i) => {
            const selected = sameCity(c, value);
            const active = i === activeIndex;
            return (
              <li
                key={c.name + '|' + c.country + '|' + c.lat + '|' + c.lon}
                id={optionId(i)}
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(c)}
                onMouseEnter={() => setActiveIndex(i)}
                className={
                  'flex items-center gap-3 px-3 py-3 min-h-[48px] rounded-xl cursor-pointer transition-colors duration-200 ' +
                  (active ? 'bg-emerald-500/20 text-white' : 'text-white/80 hover:bg-white/5')
                }
              >
                <MapPin
                  className={'w-4 h-4 shrink-0 ' + (active ? 'text-emerald-400' : 'text-white/40')}
                />
                <span className="flex-1 min-w-0 truncate text-[15px]">
                  {c.name}
                  <span className="text-white/40">, {c.country}</span>
                </span>
                {selected && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
