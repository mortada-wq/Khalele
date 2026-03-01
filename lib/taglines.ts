/**
 * Tagline storage and config.
 * Uses in-memory store; add DynamoDB/S3 for production persistence.
 */

export interface Tagline {
  id: string;
  text: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface TaglineConfig {
  taglines: Tagline[];
  rotationEnabled: boolean;
  rotationIntervalMinutes: number;
  activeTaglineId: string | null; // when rotation disabled, use this
}

const DEFAULT_TAGLINES: Tagline[] = [
  { id: "1", text: "حضر الأصيل .. اشطبوا الوكلاء، تعرف على خليل", order: 0, active: true, createdAt: new Date().toISOString() },
  { id: "2", text: "ذكاء اصطناعي عربي — يفهم كل اللهجات ويرد بالفصحى أو العربية السهلة", order: 1, active: true, createdAt: new Date().toISOString() },
];

let config: TaglineConfig = {
  taglines: [...DEFAULT_TAGLINES],
  rotationEnabled: false,
  rotationIntervalMinutes: 5,
  activeTaglineId: "1",
};

export function getTaglineConfig(): TaglineConfig {
  return JSON.parse(JSON.stringify(config));
}

export function setTaglineConfig(newConfig: Partial<TaglineConfig>): void {
  config = { ...config, ...newConfig };
}

export function getTaglines(): Tagline[] {
  return [...config.taglines].sort((a, b) => a.order - b.order);
}

export function addTagline(text: string): Tagline {
  const id = crypto.randomUUID();
  const order = config.taglines.length;
  const tagline: Tagline = {
    id,
    text,
    order,
    active: true,
    createdAt: new Date().toISOString(),
  };
  config.taglines.push(tagline);
  return tagline;
}

export function updateTagline(id: string, updates: Partial<Tagline>): Tagline | null {
  const idx = config.taglines.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  config.taglines[idx] = { ...config.taglines[idx], ...updates };
  return config.taglines[idx];
}

export function deleteTagline(id: string): boolean {
  const idx = config.taglines.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  config.taglines.splice(idx, 1);
  if (config.activeTaglineId === id) {
    config.activeTaglineId = config.taglines[0]?.id ?? null;
  }
  return true;
}

export function reorderTaglines(orderedIds: string[]): void {
  config.taglines = config.taglines.map((t) => {
    const newOrder = orderedIds.indexOf(t.id);
    return { ...t, order: newOrder === -1 ? t.order : newOrder };
  });
}

/**
 * Returns the tagline to display based on config.
 * When rotation: picks by (timestamp / interval) % count.
 * When fixed: returns activeTaglineId.
 */
export function getCurrentTagline(): string {
  const active = config.taglines.filter((t) => t.active);
  if (active.length === 0) return "خليلي — ذكاء اصطناعي عربي";

  if (config.rotationEnabled && active.length > 1) {
    const intervalMs = config.rotationIntervalMinutes * 60 * 1000;
    const idx = Math.floor(Date.now() / intervalMs) % active.length;
    return active[idx].text;
  }

  const fixed = config.taglines.find((t) => t.id === config.activeTaglineId);
  return fixed?.text ?? active[0].text;
}
