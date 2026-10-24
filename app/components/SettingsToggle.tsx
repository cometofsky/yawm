'use client';

import { useId } from 'react';

interface SettingsToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

export default function SettingsToggle({ label, description, checked, onChange }: SettingsToggleProps) {
  const id = useId();
  return (
    <div className="ui-setting-row">
      <div className="ui-setting-copy"><span id={id}>{label}</span><p id={`${id}-help`} className="ui-help">{description}</p></div>
      <button type="button" role="switch" aria-labelledby={id} aria-describedby={`${id}-help`} aria-checked={checked} onClick={onChange} className={`ui-switch${checked ? ' is-on' : ''}`}>
        <span aria-hidden="true">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}
