import type { MODiagram } from "@/types/mo-diagram";

const presetDiagrams: Record<string, MODiagram> = {
  O2: {
    formula: "O2",
    title: "Oxygen (O2) Molecular Orbital Diagram",
    metadata: {
      source: "database",
      sourceLabel: "Verified preset",
      experimental: false
    },
    atomicOrbitals: {
      left: [
        { id: "l-2s", label: "2s", energy: 2.2 },
        { id: "l-2p", label: "2p", energy: 5.7 }
      ],
      right: [
        { id: "r-2s", label: "2s", energy: 2.2 },
        { id: "r-2p", label: "2p", energy: 5.7 }
      ]
    },
    molecularOrbitals: [
      { id: "sigma-2s", label: "σ2s", energy: 1.2, electrons: ["up", "down"], symmetry: "g" },
      { id: "sigma-2s-star", label: "σ*2s", energy: 2.4, electrons: ["up", "down"], symmetry: "u*" },
      { id: "sigma-2p", label: "σ2p", energy: 4.6, electrons: ["up", "down"], symmetry: "g" },
      { id: "pi-2p", label: "π2p", energy: 5.2, electrons: ["up", "down", "up", "down"], symmetry: "u" },
      { id: "pi-2p-star", label: "π*2p", energy: 6.2, electrons: ["up", "up"], symmetry: "g*" },
      { id: "sigma-2p-star", label: "σ*2p", energy: 7.1, electrons: [], symmetry: "u*" }
    ],
    connectors: [
      { id: "o2-left-low", fromX: 188, fromEnergy: 2.2, toX: 350, toEnergy: 1.2 },
      { id: "o2-left-high", fromX: 188, fromEnergy: 5.7, toX: 350, toEnergy: 4.6 },
      { id: "o2-right-low", fromX: 672, fromEnergy: 2.2, toX: 510, toEnergy: 1.2 },
      { id: "o2-right-high", fromX: 672, fromEnergy: 5.7, toX: 510, toEnergy: 4.6 }
    ]
  },
  CO: {
    formula: "CO",
    title: "Carbon Monoxide (CO) Molecular Orbital Diagram",
    metadata: {
      source: "database",
      sourceLabel: "Verified preset",
      experimental: false
    },
    atomicOrbitals: {
      left: [
        { id: "co-l-2s", label: "C 2s", energy: 2.7 },
        { id: "co-l-2p", label: "C 2p", energy: 5.3 }
      ],
      right: [
        { id: "co-r-2s", label: "O 2s", energy: 1.9 },
        { id: "co-r-2p", label: "O 2p", energy: 6.0 }
      ]
    },
    molecularOrbitals: [
      { id: "co-sigma-2s", label: "σ2s", energy: 1.4, electrons: ["up", "down"] },
      { id: "co-sigma-2s-star", label: "σ*2s", energy: 2.6, electrons: ["up", "down"] },
      { id: "co-pi-2p", label: "π2p", energy: 4.9, electrons: ["up", "down", "up", "down"] },
      { id: "co-sigma-2p", label: "σ2p", energy: 5.4, electrons: ["up", "down"] },
      { id: "co-pi-2p-star", label: "π*2p", energy: 6.5, electrons: [], symmetry: "*" },
      { id: "co-sigma-2p-star", label: "σ*2p", energy: 7.2, electrons: [] }
    ],
    connectors: [
      { id: "co-left-low", fromX: 188, fromEnergy: 2.7, toX: 350, toEnergy: 1.4 },
      { id: "co-left-high", fromX: 188, fromEnergy: 5.3, toX: 350, toEnergy: 4.9 },
      { id: "co-right-low", fromX: 672, fromEnergy: 1.9, toX: 510, toEnergy: 1.4 },
      { id: "co-right-high", fromX: 672, fromEnergy: 6.0, toX: 510, toEnergy: 5.4 }
    ]
  },
  HF: {
    formula: "HF",
    title: "Hydrogen Fluoride (HF) Molecular Orbital Diagram",
    metadata: {
      source: "database",
      sourceLabel: "Verified preset",
      experimental: false
    },
    atomicOrbitals: {
      left: [
        { id: "hf-l-1s", label: "H 1s", energy: 4.2 }
      ],
      right: [
        { id: "hf-r-2s", label: "F 2s", energy: 1.8 },
        { id: "hf-r-2p", label: "F 2p", energy: 5.6 }
      ]
    },
    molecularOrbitals: [
      { id: "hf-sigma", label: "σ", energy: 3.2, electrons: ["up", "down"] },
      { id: "hf-nb-1", label: "n", energy: 5.1, electrons: ["up", "down"] },
      { id: "hf-nb-2", label: "n", energy: 5.7, electrons: ["up", "down"] },
      { id: "hf-nb-3", label: "n", energy: 6.2, electrons: ["up", "down"] },
      { id: "hf-sigma-star", label: "σ*", energy: 7.0, electrons: [] }
    ],
    connectors: [
      { id: "hf-left", fromX: 188, fromEnergy: 4.2, toX: 350, toEnergy: 3.2 },
      { id: "hf-right-low", fromX: 672, fromEnergy: 1.8, toX: 510, toEnergy: 3.2 },
      { id: "hf-right-high", fromX: 672, fromEnergy: 5.6, toX: 510, toEnergy: 7.0 }
    ]
  }
};

export const sampleMoleculeOptions = Object.entries(presetDiagrams).map(([formula, diagram]) => ({
  formula,
  diagram,
  source: diagram.metadata.source
}));

export function getPresetMolecule(formula: string): MODiagram {
  return presetDiagrams[formula] ?? presetDiagrams.O2;
}

export function findPresetMolecule(formula: string): MODiagram | null {
  return presetDiagrams[formula] ?? null;
}

export function buildMoleculeDiagramPrompt(formula: string) {
  return [
    "You are a chemistry diagram data engine.",
    "Return only valid JSON. Do not wrap it in markdown. Do not add commentary.",
    "Your task is to generate molecular orbital diagram data for a renderer.",
    "The response must match this TypeScript shape exactly:",
    JSON.stringify(
      {
        formula: "string",
        title: "string",
        metadata: {
          source: "ai",
          sourceLabel: "AI generated",
          experimental: true
        },
        atomicOrbitals: {
          left: [{ id: "string", label: "string", energy: 0 }],
          right: [{ id: "string", label: "string", energy: 0 }]
        },
        molecularOrbitals: [{ id: "string", label: "string", energy: 0, electrons: ["up", "down"], symmetry: "string?" }],
        connectors: [{ id: "string", fromX: 188, fromEnergy: 0, toX: 350, toEnergy: 0 }]
      },
      null,
      2
    ),
    "Rules:",
    "1. Use normalized relative energies only. Lower orbitals must have smaller energy numbers. Keep all values between 0.5 and 9.5.",
    "2. Keep atomicOrbitals.left and atomicOrbitals.right ordered from low energy to high energy.",
    "3. Keep molecularOrbitals ordered from low energy to high energy.",
    "4. Electrons array may only contain \"up\" or \"down\".",
    "5. Use realistic MO labels such as σ1s, σ*1s, π2p, π*2p, n, σ, σ*.",
    "6. For homonuclear diatomics, left and right atomic orbital energies should usually match.",
    "7. For heteronuclear molecules, left and right atomic orbital energies may differ.",
    "8. Include all occupied and relevant low-lying unoccupied molecular orbitals needed to render the diagram.",
    "9. Every connector must use one of these X positions only: left AO lines start at x=188, right AO lines start at x=672, MO left endpoint x=350, MO right endpoint x=510.",
    "10. fromEnergy and toEnergy must correspond to actual orbital energy values present in the same JSON.",
    "11. metadata.source must be \"ai\", metadata.sourceLabel must be \"AI generated review required\", metadata.experimental must be true.",
    "12. Title must be a human-readable English title like \"Oxygen (O2) Molecular Orbital Diagram\".",
    "13. If the molecule is ambiguous or outside normal introductory MO treatment, still return best-effort JSON instead of refusing.",
    `Molecule to generate: ${formula}`
  ].join("\n");
}
