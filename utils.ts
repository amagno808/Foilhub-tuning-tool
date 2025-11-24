import { SetupInput } from "./calc";

const DEFAULT: SetupInput = {
  riderKg: 75,
  discipline: "prone",
  frontAreaCm2: 1200,
  frontAR: 7,
  stabAreaCm2: 260,
  mastCm: 82,
  fuseCm: 68,
  boardLiters: 40,
  condition: "Clean waist-to-chest",
  goal: "better_pump",
  trackFromTailCm: null
};

export function parseQueryToInput(): SetupInput {
  if (typeof window === "undefined") return DEFAULT;
  const q = new URLSearchParams(window.location.search);

  const num = (k: keyof SetupInput, fallback: number) =>
    q.get(k as string) ? Number(q.get(k as string)) : fallback;

  const str = (k: keyof SetupInput, fallback: any) =>
    q.get(k as string) ?? fallback;

  const track =
    q.get("trackFromTailCm") == null || q.get("trackFromTailCm") === ""
      ? null
      : Number(q.get("trackFromTailCm"));

  return {
    riderKg: num("riderKg", DEFAULT.riderKg),
    discipline: str("discipline", DEFAULT.discipline),
    frontAreaCm2: num("frontAreaCm2", DEFAULT.frontAreaCm2),
    frontAR: num("frontAR", DEFAULT.frontAR),
    stabAreaCm2: num("stabAreaCm2", DEFAULT.stabAreaCm2),
    mastCm: num("mastCm", DEFAULT.mastCm),
    fuseCm: num("fuseCm", DEFAULT.fuseCm),
    boardLiters: num("boardLiters", DEFAULT.boardLiters),
    condition: str("condition", DEFAULT.condition),
    goal: str("goal", DEFAULT.goal),
    trackFromTailCm: track
  };
}

export function inputToQuery(i: SetupInput) {
  const q = new URLSearchParams();
  (Object.keys(i) as (keyof SetupInput)[]).forEach((k) => {
    const v = i[k];
    if (v == null) return;
    q.set(k, String(v));
  });
  return q.toString();
}
