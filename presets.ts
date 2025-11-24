export const DISCIPLINES = [
  { value: "prone", label: "Prone" },
  { value: "wing", label: "Wingfoil" },
  { value: "sup", label: "SUP Foil" },
  { value: "downwind", label: "Downwind" },
  { value: "tow", label: "Tow/Surf Assist" },
  { value: "efoil", label: "E-foil" }
] as const;

export const GOALS = [
  { value: "more_lift", label: "Need more lift / easier takeoff" },
  { value: "less_lift", label: "Too much lift / breaching" },
  { value: "more_speed", label: "Want more top speed" },
  { value: "better_pump", label: "Want better pumping/linking" },
  { value: "better_turn", label: "Want tighter carves" },
  { value: "more_stable", label: "Want stability at speed" }
] as const;

export const CONDITIONS = [
  "Glassy / small swell",
  "Clean waist-to-chest",
  "Windy / bumps",
  "Strong current / heavy swell"
];
