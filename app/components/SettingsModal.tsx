'use client';

import { Check, RotateCcw } from 'lucide-react';
import { CustomizationSettings } from '../lib/useSettings';
import DisplayDialog from './DisplayDialog';
import SettingsToggle from './SettingsToggle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CustomizationSettings;
  updateSetting: <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => void;
  resetDefaults: () => void;
  resetAppearance?: () => void;
}

const THEMES = [
  { value: 'original', name: 'Original', note: 'Plum & pearl', ground: '#211b27', ink: '#fff1e9' },
  { value: 'slate', name: 'Slate', note: 'Blue & silver', ground: '#182632', ink: '#edf2f5' },
  { value: 'forest', name: 'Forest', note: 'Pine & linen', ground: '#172d27', ink: '#eff2e8' },
  { value: 'warm', name: 'Warm', note: 'Umber & ivory', ground: '#30221e', ink: '#fff0e2' },
] as const;

export default function SettingsModal({ isOpen, onClose, settings, updateSetting, resetDefaults, resetAppearance }: SettingsModalProps) {
  return (
    <DisplayDialog isOpen={isOpen} onClose={onClose} title="Appearance & display" className="appearance-dialog">
      <div className="ui-dialog-body">
        <fieldset className="ui-fieldset">
          <legend>Color theme</legend>
          <div className="theme-options" role="group" aria-label="Color theme">
            {THEMES.map((theme) => <button type="button" key={theme.value} className={`theme-option${settings.colorTheme === theme.value ? ' is-selected' : ''}`} aria-pressed={settings.colorTheme === theme.value} onClick={() => updateSetting('colorTheme', theme.value)}>
              <span className="theme-swatch" style={{ backgroundColor: theme.ground, color: theme.ink }} aria-hidden="true">12:34</span>
              <span>{theme.name}{settings.colorTheme === theme.value && <Check size={16} aria-hidden="true" />}</span>
              <small>{theme.note}</small>
            </button>)}
          </div>
          <button type="button" className="ui-button" onClick={() => resetAppearance ? resetAppearance() : updateSetting('colorTheme', 'original')}>Reset color theme</button>
        </fieldset>
        <fieldset className="ui-fieldset">
          <legend>Clocks & prayer</legend>
          <SettingsToggle label="World clocks" description="Keep London and Sydney within reach." checked={settings.showWorldClocks} onChange={() => updateSetting('showWorldClocks', !settings.showWorldClocks)} />
          <SettingsToggle label="Prayer times" description="Show the current waqt and its next boundary." checked={settings.showPrayerTimes} onChange={() => updateSetting('showPrayerTimes', !settings.showPrayerTimes)} />
          {settings.showPrayerTimes && <div className="ui-fieldset">
            <span id="prayer-detail-label">Prayer detail</span>
            <div className="ui-segmented" role="group" aria-labelledby="prayer-detail-label">
              <button type="button" className={`ui-button${settings.prayerDisplayMode === 'current_next' ? ' is-selected' : ''}`} aria-pressed={settings.prayerDisplayMode === 'current_next'} onClick={() => updateSetting('prayerDisplayMode', 'current_next')}>Current & next</button>
              <button type="button" className={`ui-button${settings.prayerDisplayMode === 'all' ? ' is-selected' : ''}`} aria-pressed={settings.prayerDisplayMode === 'all'} onClick={() => updateSetting('prayerDisplayMode', 'all')}>Full timetable</button>
            </div>
          </div>}
        </fieldset>
        <fieldset className="ui-fieldset">
          <legend>Calendars</legend>
          <SettingsToggle label="Gregorian date" description="The civil solar date." checked={settings.showGregorian} onChange={() => updateSetting('showGregorian', !settings.showGregorian)} />
          <SettingsToggle label="Hijri date" description="Predicted lunar date with your sighting correction." checked={settings.showHijri} onChange={() => updateSetting('showHijri', !settings.showHijri)} />
          <SettingsToggle label="Bengali date" description="The Bengali solar calendar." checked={settings.showBengali} onChange={() => updateSetting('showBengali', !settings.showBengali)} />
          <SettingsToggle label="Monthly calendar" description="Browse dates across the three calendars." checked={settings.showMonthlyCalendar} onChange={() => updateSetting('showMonthlyCalendar', !settings.showMonthlyCalendar)} />
        </fieldset>
      </div>
      <footer className="ui-dialog-footer">
        <button type="button" className="ui-button" onClick={resetDefaults}><RotateCcw size={16} aria-hidden="true" /><span>Reset display sections</span></button>
        <button type="button" className="ui-button ui-button-primary" onClick={onClose}>Done</button>
      </footer>
    </DisplayDialog>
  );
}
