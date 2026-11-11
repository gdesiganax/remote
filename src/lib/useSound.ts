import { useSyncExternalStore } from 'react';
import { isSoundEnabled, setSoundEnabled, subscribeSound } from './sound';

/** React binding for the persisted sound-effects preference. */
export function useSoundPreference() {
  const enabled = useSyncExternalStore(subscribeSound, isSoundEnabled, () => true);
  return { enabled, setEnabled: setSoundEnabled, toggle: () => setSoundEnabled(!isSoundEnabled()) };
}
