import type { EmotionEntry, EventType, LoggedEvent } from "../types";

export function exportToJSON(
  entries: EmotionEntry[],
  events: LoggedEvent[],
  customEventTypes: EventType[],
) {
  const entriesAndMetadata = {
    metadata: {
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.1",
      timezone: "Europe/Oslo",
      energy_scale: "0 to 6 (body battery: 0=drained, 3=ok, 6=energetic)",
      nss_scale: "0 to 6 (nervous system state: 0=shutdown, 2=calm, 6=explosive)",
    },
    entries,
    events,
    customEventTypes,
  };
  const data = JSON.stringify(entriesAndMetadata, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `emotions-log-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
