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
    <div className="location-picker">
      <p className="ui-help">Search the saved city list. Choosing a city updates the clock, waqt and Hijri prediction.</p>
      <div className="location-search"><Search aria-hidden="true" size={18}/><input ref={inputRef} type="text" role="combobox" aria-expanded="true" aria-controls={listboxId} aria-autocomplete="list" aria-activedescendant={activeDescId} aria-label="Search for a city or country" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} placeholder="Search city or country" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown} />{query !== '' && <button type="button" className="ui-icon-button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search"><X aria-hidden="true" size={16}/></button>}</div>
      <p className="ui-help" role="status" aria-live="polite">{options.length === 0 ? 'No matching city.' : showRecent ? options.length + ' recent cities.' : 'Showing ' + options.length + (options.length === MAX_ROWS ? ' locations. Type to narrow the list.' : ' matching locations.')}</p>
      <ul ref={listRef} id={listboxId} role="listbox" aria-label="Locations" className="location-list">
        {showRecent && <li role="presentation" className="location-recent">Recent cities</li>}
        {options.length === 0 ? <li role="presentation" className="location-empty">No matching city. Try a country name or clear your search.</li> : options.map((city, i) => <li key={city.name + '|' + city.country + '|' + city.lat + '|' + city.lon} id={optionId(i)} role="option" aria-selected={sameCity(city, value)} onClick={() => onSelect(city)} onMouseEnter={() => setActiveIndex(i)} className={'location-option' + (i === activeIndex ? ' is-active' : '')}><MapPin aria-hidden="true" size={16}/><span>{city.name}<span className="location-country">, {city.country}</span></span>{sameCity(city, value) && <Check aria-hidden="true" size={16}/>}</li>)}
      </ul>
    </div>
  );
}
