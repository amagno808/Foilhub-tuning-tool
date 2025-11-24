export type SetupInput = {
  riderKg: number;
  discipline: "prone" | "wing" | "sup" | "downwind" | "tow" | "efoil";

  frontAreaCm2: number;
  frontAR: number;

  stabAreaCm2: number;
  mastCm: number;
  fuseCm: number;

  boardLiters: number;
  condition: string;
  goal:
    | "more_lift"
    | "less_lift"
    | "more_speed"
    | "better_pump"
    | "better_turn"
    | "more_stable";

  trackFromTailCm: number | null; // optional current position
};

export type SetupOutput = {
  trackFromTailCm: number;
  shimDeg: number;
  shimNote: string;
  pressureBias: "Front foot heavy" | "Neutral" | "Back foot heavy";
  pressureNote: string;
  pumpScore: number;
  turnScore: number;
  speedScore: number;
  takeoffMph: number;
  liftCurve: { mph: number; lift: number }[];
  notes: string[];
};

export function calcSetup(i: SetupInput): SetupOutput {
  // --- Unit conversions ---
  const areaM2 = i.frontAreaCm2 / 10000; // cm² -> m²
  const stabRatio = i.stabAreaCm2 / i.frontAreaCm2;

  // Discipline multipliers (rough but practical)
  const discLiftBias = {
    prone: 1.0,
    wing: 0.9,
    sup: 1.05,
    downwind: 0.85,
    tow: 0.8,
    efoil: 0.7
  }[i.discipline];

  // Effective CL estimation by AR
  const clBase = 0.55 + (6.5 - i.frontAR) * 0.03;
  const clEff = clamp(clBase * discLiftBias, 0.35, 0.75);

  // Takeoff speed estimate (mph)
  const rho = 1025; // kg/m³ seawater
  const g = 9.81;
  const loadN = i.riderKg * g * 1.05;
  const vTakeoff = Math.sqrt((2 * loadN) / (rho * clEff * areaM2)); // m/s
  const takeoffMph = vTakeoff * 2.23694;

  // --- Track position heuristic (cm from tail) ---
  const wingSizeFactor = mapRange(i.frontAreaCm2, 600, 1800, -2.5, 3.5);
  const fuseFactor = mapRange(i.fuseCm, 55, 85, -2.0, 2.0);
  const stabFactor = mapRange(stabRatio, 0.18, 0.35, -1.5, 1.5);
  const mastFactor = mapRange(i.mastCm, 65, 95, -0.7, 0.7);

  let trackFromTailCm =
    36 +
    wingSizeFactor +
    (-fuseFactor) +
    (-stabFactor) +
    mastFactor;

  // goal adjustments
  if (i.goal === "more_lift") trackFromTailCm += 1.5;
  if (i.goal === "less_lift") trackFromTailCm -= 1.5;
  if (i.goal === "more_speed") trackFromTailCm -= 1.0;
  if (i.goal === "better_pump") trackFromTailCm += 0.7;
  if (i.goal === "better_turn") trackFromTailCm += 0.5;
  if (i.goal === "more_stable") trackFromTailCm -= 0.5;

  trackFromTailCm = clamp(trackFromTailCm, 28, 48);

  const trackDelta =
    i.trackFromTailCm != null ? trackFromTailCm - i.trackFromTailCm : null;

  // --- Shim suggestion (deg) ---
  let shimDeg = 0;

  if (takeoffMph > 12.5) shimDeg += 0.8;
  if (takeoffMph > 14.5) shimDeg += 0.6;
  if (takeoffMph < 9.5) shimDeg -= 0.6;

  if (stabRatio < 0.22) shimDeg += 0.3;
  if (stabRatio > 0.32) shimDeg -= 0.2;

  if (i.fuseCm < 62) shimDeg += 0.2;
  if (i.fuseCm > 75) shimDeg -= 0.1;

  shimDeg = clamp(shimDeg, -1.5, 2.0);

  const shimNote =
    shimDeg > 0.4
      ? "Add tail shim for easier lift / less front foot"
      : shimDeg < -0.4
      ? "Reduce tail shim to calm lift / avoid breaching"
      : "Neutral shim looks good";

  // --- Pressure bias ---
  let pressureBias: SetupOutput["pressureBias"] = "Neutral";
  let pressureNote = "Balanced setup expected.";

  const liftiness = (i.frontAreaCm2 / i.riderKg) * discLiftBias;

  if (liftiness > 18) {
    pressureBias = "Front foot heavy";
    pressureNote =
      "Wing is lift-strong for your weight. Expect front pressure; move mast back or reduce shim if needed.";
  } else if (liftiness < 12) {
    pressureBias = "Back foot heavy";
    pressureNote =
      "Setup is on the smaller side. Expect back foot pressure; move mast forward or add shim to help.";
  }

  // --- Scores ---
  const pumpScore = clamp(
    60 +
      mapRange(i.frontAreaCm2, 700, 1700, -5, 18) +
      mapRange(i.frontAR, 4, 9, -2, 18) +
      mapRange(stabRatio, 0.18, 0.35, 8, -6) +
      mapRange(i.fuseCm, 55, 85, 6, -3),
    0,
    100
  );

  const turnScore = clamp(
    60 +
      mapRange(i.frontAR, 4, 9, 18, -8) +
      mapRange(i.fuseCm, 55, 85, 10, -8) +
      mapRange(i.mastCm, 65, 95, 6, -4) +
      mapRange(i.frontAreaCm2, 700, 1700, 6, -6),
    0,
    100
  );

  const speedScore = clamp(
    55 +
      mapRange(i.frontAR, 4, 9, -4, 18) +
      mapRange(i.fuseCm, 55, 85, -6, 12) +
      mapRange(stabRatio, 0.18, 0.35, -4, 8),
    0,
    100
  );

  // --- Lift curve points ---
  const liftCurve = buildLiftCurve({
    clEff,
    areaM2,
    riderKg: i.riderKg
  });

  const notes: string[] = [];
  if (trackDelta != null) {
    const dir = trackDelta > 0 ? "forward" : "back";
    notes.push(
      `Move mast ${dir} by ~${Math.abs(trackDelta).toFixed(
        1
      )} cm from your current position.`
    );
  }
  notes.push(`Estimated takeoff speed: ~${takeoffMph.toFixed(1)} mph.`);
  if (pumpScore >= 85) notes.push("This setup should pump/link very well.");
  if (speedScore >= 80) notes.push("Expect strong stability at higher speeds.");
  if (turnScore >= 80) notes.push("Caveat: may feel looser in pitch during hard carves if over-shimmed.");

  return {
    trackFromTailCm,
    shimDeg,
    shimNote,
    pressureBias,
    pressureNote,
    pumpScore: Math.round(pumpScore),
    turnScore: Math.round(turnScore),
    speedScore: Math.round(speedScore),
    takeoffMph,
    liftCurve,
    notes
  };
}

/* ---------------- helpers ---------------- */

function buildLiftCurve({
  clEff,
  areaM2,
  riderKg
}: {
  clEff: number;
  areaM2: number;
  riderKg: number;
}) {
  const rho = 1025;
  const g = 9.81;
  const loadN = riderKg * g;

  const points: { mph: number; lift: number }[] = [];
  for (let mph = 6; mph <= 25; mph += 1) {
    const v = mph / 2.23694; // mph -> m/s
    const liftN = 0.5 * rho * v * v * clEff * areaM2;
    const liftPct = (liftN / loadN) * 100;
    points.push({ mph, lift: Math.round(liftPct) });
  }
  return points;
}

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

function mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = (x - inMin) / (inMax - inMin);
  const tt = clamp(t, 0, 1);
  return outMin + tt * (outMax - outMin);
}
