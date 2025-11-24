"use client";

import { useMemo, useState } from "react";
import InputForm from "./components/InputForm";
import ResultsPanel from "./components/ResultsPanel";
import { calcSetup, type SetupInput } from "../lib/calc";
import { parseQueryToInput, inputToQuery } from "../lib/utils";

export default function HomePage() {
  const [input, setInput] = useState<SetupInput>(() => parseQueryToInput());
  const results = useMemo(() => calcSetup(input), [input]);

  function onChange(next: SetupInput) {
    setInput(next);
    const qs = inputToQuery(next);
    history.replaceState({}, "", `?${qs}`);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-4">
      <InputForm value={input} onChange={onChange} />
      <ResultsPanel input={input} results={results} />
    </main>
  );
}
