import React, { useState } from 'react';
import { Settings } from '../types';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'github', label: 'GitHub' },
  { value: 'monokai', label: 'Monokai' },
] as const;

export function SettingsDialog({ isOpen, onClose, settings, onSave }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-primary rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Industry Name
            </label>
            <input
              type="text"
              value={localSettings.industryName}
              onChange={(e) => setLocalSettings({ ...localSettings, industryName: e.target.value })}
              className="w-full rounded-md border-border bg-bg-secondary text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Theme
            </label>
            <select
              value={localSettings.theme}
              onChange={(e) => setLocalSettings({ ...localSettings, theme: e.target.value as Settings['theme'] })}
              className="w-full rounded-md border-border bg-bg-secondary text-text-primary"
            >
              {THEMES.map(theme => (
                <option key={theme.value} value={theme.value}>{theme.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Currency
            </label>
            <input
              type="text"
              value={localSettings.currency}
              onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
              className="w-full rounded-md border-border bg-bg-secondary text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Date Format
            </label>
            <select
              value={localSettings.dateFormat}
              onChange={(e) => setLocalSettings({ ...localSettings, dateFormat: e.target.value })}
              className="w-full rounded-md border-border bg-bg-secondary text-text-primary"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => {
            onSave(localSettings);
            onClose();
          }}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
