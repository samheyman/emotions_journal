import type { EmotionEntry } from '../types';

export function exportToJSON(entries: EmotionEntry[]) {
  const entriesAndMetadata = {metadata:{
    exportedAt: new Date().toISOString(),
    appVersion: "0.1.1",
    "valence_scale": "-3 to +3",
    "energy_scale": "-3 to +3"
  },entries:entries};
  const data = JSON.stringify(entriesAndMetadata, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `emotions-log-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
