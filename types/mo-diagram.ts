export type ElectronDirection = "up" | "down";

export type OrbitalLevel = {
  id: string;
  label: string;
  energy: number;
};

export type MolecularOrbitalLevel = OrbitalLevel & {
  electrons: ElectronDirection[];
  symmetry?: string;
};

export type Connector = {
  id: string;
  fromX: number;
  fromEnergy: number;
  toX: number;
  toEnergy: number;
};

export type MODiagram = {
  formula: string;
  title: string;
  metadata: {
    source: "database" | "ai";
    sourceLabel: string;
    experimental: boolean;
  };
  atomicOrbitals: {
    left: OrbitalLevel[];
    right: OrbitalLevel[];
  };
  molecularOrbitals: MolecularOrbitalLevel[];
  connectors: Connector[];
};
