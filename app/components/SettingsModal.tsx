'use client';

import { useEffect } from 'react';
import { X, RotateCcw, Clock, Moon, CalendarDays } from 'lucide-react';
import { CustomizationSettings } from '../lib/useSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CustomizationSettings;
  updateSetting: <K extends keyof CustomizationSettings>(
    key: K,
    value: CustomizationSettings[K]
  ) => void;
  resetDefaults: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  resetDefaults,
}: SettingsModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 id="settings-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Customize Display
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Turn sections on or off to tailor your clock layout
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="py-4 space-y-6">
          {/* 1. Clocks Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white/80 font-semibold text-xs tracking-wider uppercase">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Clocks & Time</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-medium text-white/90">World Clocks</span>
                  <span className="text-xs text-white/50">
                    Display London and Sydney alongside your local time
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showWorldClocks}
                  onClick={() => updateSetting('showWorldClocks', !settings.showWorldClocks)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    settings.showWorldClocks ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showWorldClocks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Prayer Times Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white/80 font-semibold text-xs tracking-wider uppercase">
              <Moon className="w-4 h-4 text-amber-400" />
              <span>Prayer Times</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-medium text-white/90">Prayer Times</span>
                  <span className="text-xs text-white/50">
                    Turn off to let the local clock take full hero width
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showPrayerTimes}
                  onClick={() => updateSetting('showPrayerTimes', !settings.showPrayerTimes)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    settings.showPrayerTimes ? 'bg-amber-400' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                      settings.showPrayerTimes ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.showPrayerTimes && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-xs font-medium text-white/70 block">
                    Prayer Display Detail
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => updateSetting('prayerDisplayMode', 'current_next')}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
                        settings.prayerDisplayMode === 'current_next'
                          ? 'bg-amber-400 text-black font-semibold'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Current / Next Waqt
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSetting('prayerDisplayMode', 'all')}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors text-center ${
                        settings.prayerDisplayMode === 'all'
                          ? 'bg-amber-400 text-black font-semibold'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Full 5 Prayers
                    </button>
                  </div>
                  <span className="text-[11px] text-white/40 block">
                    {settings.prayerDisplayMode === 'current_next'
                      ? 'Shows the current countdown card without the bottom timetable ribbon.'
                      : 'Shows the waqt card plus the full 5-prayer timetable ribbon.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Calendars Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white/80 font-semibold text-xs tracking-wider uppercase">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span>Calendars</span>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 divide-y divide-white/10">
              {/* Gregorian */}
              <div className="flex items-center justify-between py-2.5 first:pt-0">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-medium text-white/90">Gregorian Calendar</span>
                  <span className="text-xs text-white/50">Civil solar date</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showGregorian}
                  onClick={() => updateSetting('showGregorian', !settings.showGregorian)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    settings.showGregorian ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showGregorian ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Hijri */}
              <div className="flex items-center justify-between py-2.5">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-medium text-white/90">Hijri Calendar</span>
                  <span className="text-xs text-white/50">Islamic lunar date & sighting knob</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showHijri}
                  onClick={() => updateSetting('showHijri', !settings.showHijri)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    settings.showHijri ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showHijri ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Bengali */}
              <div className="flex items-center justify-between py-2.5">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-medium text-white/90">Bengali Calendar</span>
                  <span className="text-xs text-white/50">Bangla solar calendar</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showBengali}
                  onClick={() => updateSetting('showBengali', !settings.showBengali)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    settings.showBengali ? 'bg-orange-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showBengali ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Monthly Calendar View */}
              <div className="flex items-center justify-between py-2.5 last:pb-0">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-medium text-white/90">Monthly Calendar Grid</span>
                  <span className="text-xs text-white/50">Detailed interactive month view</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showMonthlyCalendar}
                  onClick={() => updateSetting('showMonthlyCalendar', !settings.showMonthlyCalendar)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                    settings.showMonthlyCalendar ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showMonthlyCalendar ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={resetDefaults}
            className="flex items-center space-x-1.5 text-xs text-white/50 hover:text-white/80 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
