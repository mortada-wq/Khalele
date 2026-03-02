export type FactVerdict = "likely_true" | "likely_false" | "uncertain";

export interface FactCheckResult {
  verdict: FactVerdict;
  confidence: number; // 0–1
  reasons: string[];
  sources: { title: string; url: string }[];
}

interface CachedFact {
  title: string;
  url: string;
  entities: string[];
  claimHash: string;
}

// Lightweight, zero-cost heuristics and a small static cache. Replace/extend via daily job.
const HOAX_PATTERNS = [
  "flat earth",
  "5g causes",
  "microchip in vaccine",
  "earth is flat",
  "chemtrail",
];

const BAD_DOMAINS = ["antivax.example", "fake-news.example"];

const CACHED_FACTS: CachedFact[] = [
  {
    title: "Vaccines do not contain tracking microchips",
    url: "https://www.politifact.com/factchecks/",
    entities: ["vaccine", "microchip"],
    claimHash: "vax_microchip_false",
  },
];

function containsHoaxPattern(text: string): string | null {
  const lower = text.toLowerCase();
  return HOAX_PATTERNS.find((p) => lower.includes(p)) ?? null;
}

function containsBadDomain(text: string): string | null {
  const lower = text.toLowerCase();
  return BAD_DOMAINS.find((d) => lower.includes(d)) ?? null;
}

function isFutureYear(text: string): string | null {
  const match = text.match(/\b(20[3-9][0-9]|21[0-9]{2})\b/);
  return match ? match[0] : null;
}

function bigUnboundNumber(text: string): string | null {
  const match = text.match(/\b([1-9][0-9]{9,})\b/); // >1B
  return match ? match[0] : null;
}

function matchCached(text: string): CachedFact | null {
  const lower = text.toLowerCase();
  for (const item of CACHED_FACTS) {
    if (item.entities.some((e) => lower.includes(e.toLowerCase()))) return item;
  }
  return null;
}

export function factCheck(text: string): FactCheckResult {
  const trimmed = text.trim();
  const reasons: string[] = [];
  const sources: { title: string; url: string }[] = [];

  if (!trimmed) {
    return { verdict: "uncertain", confidence: 0, reasons: ["No text to check"], sources };
  }

  const hoax = containsHoaxPattern(trimmed);
  if (hoax) reasons.push(`Matches known hoax pattern: ${hoax}`);

  const badDomain = containsBadDomain(trimmed);
  if (badDomain) reasons.push(`Contains low-reputation domain: ${badDomain}`);

  const future = isFutureYear(trimmed);
  if (future) reasons.push(`Future year detected: ${future}`);

  const hugeNum = bigUnboundNumber(trimmed);
  if (hugeNum) reasons.push(`Unusually large number: ${hugeNum}`);

  const cached = matchCached(trimmed);
  if (cached) {
    sources.push({ title: cached.title, url: cached.url });
    reasons.push("Matched cached fact record");
  }

  // Scoring
  let score = 0;
  if (hoax) score += 0.5;
  if (badDomain) score += 0.3;
  if (future) score += 0.2;
  if (hugeNum) score += 0.2;
  if (cached) score += 0.4;
  const confidence = Math.min(1, score);

  let verdict: FactVerdict = "uncertain";
  if (score >= 0.7) verdict = "likely_false";
  else if (score <= 0.2 && cached) verdict = "likely_true";

  return {
    verdict,
    confidence,
    reasons,
    sources,
  };
}

