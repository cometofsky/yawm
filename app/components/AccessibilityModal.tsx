'use client';

import { RotateCcw } from 'lucide-react';
import { CustomizationSettings } from '../lib/useSettings';
import DisplayDialog from './DisplayDialog';
import SettingsToggle from './SettingsToggle';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CustomizationSettings;
  updateSetting: <K extends keyof CustomizationSettings>(key: K, value: CustomizationSettings[K]) => void;
  resetAccessibility: () => void;
}

export default function AccessibilityModal({ isOpen, onClose, settings, updateSetting, resetAccessibility }: AccessibilityModalProps) {
  return (
    <DisplayDialog isOpen={isOpen} onClose={onClose} title="Accessibility">
      <div className="ui-dialog-body">
        <p className="ui-help">Make the clock comfortable to read. Your choices are remembered on this device.</p>
        <fieldset className="ui-fieldset">
          <legend>Text size</legend>
          <div className="ui-segmented" role="group" aria-label="Text size">
            {([100, 125, 150, 200] as const).map((scale) => <button type="button" key={scale} aria-pressed={settings.textScale === scale} className={`ui-button${settings.textScale === scale ? ' is-selected' : ''}`} onClick={() => updateSetting('textScale', scale)}>{scale}%</button>)}
          </div>
          <p className="ui-help">Changes labels, dates and controls. You can also use your browser’s zoom.</p>
        </fieldset>
        <SettingsToggle label="High contrast" description="Stronger text, separators and selected states." checked={settings.highContrast} onChange={() => updateSetting('highContrast', !settings.highContrast)} />
        <SettingsToggle label="Reduce motion" description="Stop interface animations. Your device’s reduced-motion preference is always respected." checked={settings.reducedMotion} onChange={() => updateSetting('reducedMotion', !settings.reducedMotion)} />
        <SettingsToggle label="Larger controls" description="Increase touch targets to at least 56 pixels." checked={settings.largerControls} onChange={() => updateSetting('largerControls', !settings.largerControls)} />
        <fieldset className="ui-fieldset">
          <legend>Display luminance</legend>
          <div className="ui-segmented" role="group" aria-label="Display luminance">
            {(['normal', 'dim'] as const).map((value) => <button type="button" key={value} className={`ui-button${settings.luminance === value ? ' is-selected' : ''}`} aria-pressed={settings.luminance === value} onClick={() => updateSetting('luminance', value)}>{value === 'normal' ? 'Normal' : 'Dim'}</button>)}
          </div>
          <p className="ui-help">Softens the page for a dark room. Device brightness stays under your control.</p>
        </fieldset>
        <p className="ui-help">Keyboard navigation, visible focus and screen-reader labels are always available. The countdown does not announce every second.</p>
      </div>
      <footer className="ui-dialog-footer">
        <button type="button" className="ui-button" onClick={resetAccessibility}><RotateCcw size={16} aria-hidden="true" /><span>Reset accessibility</span></button>
        <button type="button" className="ui-button ui-button-primary" onClick={onClose}>Done</button>
      </footer>
    </DisplayDialog>
  );
}
