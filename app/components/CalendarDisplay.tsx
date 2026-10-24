'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import DisplayDialog from './DisplayDialog';
import MonthlyCalendar from './MonthlyCalendar';
import LocationPicker from './LocationPicker';
import { resolveHijri } from '../lib/hijri';
import { CITIES } from '../lib/locations';
import { useLocationState, locationLabel } from '../lib/useLocationState';
import { CustomizationSettings } from '../lib/useSettings';

const banglaCalendar = require('bangla-calendar');

interface CalendarDisplayProps {
  locationState?: ReturnType<typeof useLocationState>;
  settings?: CustomizationSettings;
}

export default function CalendarDisplay({
  locationState: externalState,
  settings,
}: CalendarDisplayProps) {
  const internalState = useLocationState();
  const state = externalState || internalState;

  const {
    location,
    selectedCity,
    recents,
    pickerOpen,
    setPickerOpen,
    hijriOffset,
    updateOffset,
    handleSelectCity,
    clearLocation,
    isLoaded,
  } = state;

  const [hijriDateStr, setHijriDateStr] = useState<string>('Calculating...');
  const [bengaliDate, setBengaliDate] = useState<string>('Calculating...');
  const [englishDate, setEnglishDate] = useState<string>('Calculating...');
  const [rolledOver, setRolledOver] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);

  // Re-evaluate dates once a minute so an always-on display rolls over at midnight and Maghrib.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Headline dates — computed offline. Hijri goes through the shared resolver (with Maghrib rollover).
  useEffect(() => {
    if (!isLoaded) return;

    const today = new Date();

    // English
    const enOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: location.tz || undefined,
    };
    try {
      setEnglishDate(today.toLocaleDateString('en-US', enOptions));
    } catch (e) {
      setEnglishDate(
        today.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    }

    // Bengali
    try {
      const bnDate = banglaCalendar.getDate(today);
      setBengaliDate(bnDate);
    } catch (err) {
      setBengaliDate('Unavailable');
    }

    // Hijri — shared resolver: region offset + Maghrib rollover + manual sighting adjustment.
    const result = resolveHijri({
      now: today,
      location: location,
      manualOffset: hijriOffset,
      applyRollover: true,
    });
    setHijriDateStr(result.text);
    setRolledOver(result.rolledOver);
  }, [hijriOffset, isLoaded, location, tick]);

  const showGregorian = settings ? settings.showGregorian : true;
  const showHijri = settings ? settings.showHijri : true;
  const showBengali = settings ? settings.showBengali : true;
  const showMonthlyCalendar = settings ? settings.showMonthlyCalendar : true;

  const offsetControl = <div className="offset-stepper" role="group" aria-label="Hijri manual sighting adjustment"><button type="button" onClick={() => updateOffset(hijriOffset - 1)} aria-label="Shift Hijri date back one day"><Minus aria-hidden="true"/></button><output aria-live="polite" aria-label="Hijri sighting correction">{hijriOffset > 0 ? '+' : ''}{hijriOffset} days</output><button type="button" onClick={() => updateOffset(hijriOffset + 1)} aria-label="Shift Hijri date forward one day"><Plus aria-hidden="true"/></button></div>;

  return (
    <div className="calendar-section">
      {(showHijri || showGregorian || showBengali) && <div className="calendar-dates">
        {showHijri && <section className="date-block hijri-date"><h2>Hijri · predicted</h2><p className="date-text">{hijriDateStr}</p>{rolledOver && <p className="date-note">After Maghrib</p>}{offsetControl}<p className="date-note">Adjust to your local moon sighting.</p></section>}
        {showGregorian && <section className="date-block"><h2>Gregorian</h2><p className="date-text">{englishDate}</p></section>}
        {showBengali && <section className="date-block"><h2>Bengali</h2><p className="date-text" lang={bengaliDate === 'Unavailable' || bengaliDate === 'Calculating...' ? 'en' : 'bn'}>{bengaliDate}</p></section>}
      </div>}
      {!showHijri && <div className="adjustment-only"><span className="date-note">Hijri sighting adjustment</span>{offsetControl}</div>}
      {location.source === 'city' && <p className="date-note">Using {locationLabel(location)}. <button type="button" className="ui-button" onClick={clearLocation}>Use device location</button></p>}
      {showMonthlyCalendar && <MonthlyCalendar location={location} manualOffset={hijriOffset} />}
      <DisplayDialog isOpen={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose location">
        <div className="ui-dialog-body"><LocationPicker cities={CITIES} value={selectedCity} recents={recents} onSelect={handleSelectCity} onClose={() => setPickerOpen(false)} /></div>
      </DisplayDialog>
    </div>
  );
}
