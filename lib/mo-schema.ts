import type { MODiagram } from "@/types/mo-diagram";

export const moDiagramSchemaDescription = {
  formula: "Molecule formula, such as O2 or CO.",
  title: "Human-readable diagram title.",
  metadata: {
    source: "database | ai",
    sourceLabel: "Readable badge text for UI.",
    experimental: "Whether the diagram should be flagged as experimental."
  },
  atomicOrbitals: {
    left: "Array of left-side atomic orbital levels.",
    right: "Array of right-side atomic orbital levels."
  },
  molecularOrbitals: "Array of central molecular orbital levels with electron arrows.",
  connectors: "Array of visual connector lines between atomic and molecular levels."
} as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isElectronDirection(value: unknown): value is "up" | "down" {
  return value === "up" || value === "down";
}

function isOrbitalLevel(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.energy === "number" &&
    Number.isFinite(value.energy)
  );
}

function isConnector(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.fromX === "number" &&
    typeof value.fromEnergy === "number" &&
    typeof value.toX === "number" &&
    typeof value.toEnergy === "number"
  );
}

export function isValidDiagramPayload(payload: unknown): payload is MODiagram {
  if (!isObject(payload)) {
    return false;
  }

  const candidate = payload as Partial<MODiagram>;

  return (
    typeof candidate.formula === "string" &&
    typeof candidate.title === "string" &&
    isObject(candidate.metadata) &&
    (candidate.metadata.source === "database" || candidate.metadata.source === "ai") &&
    typeof candidate.metadata.sourceLabel === "string" &&
    typeof candidate.metadata.experimental === "boolean" &&
    isObject(candidate.atomicOrbitals) &&
    Array.isArray(candidate.atomicOrbitals.left) &&
    candidate.atomicOrbitals.left.every(isOrbitalLevel) &&
    Array.isArray(candidate.atomicOrbitals.right) &&
    candidate.atomicOrbitals.right.every(isOrbitalLevel) &&
    Array.isArray(candidate.molecularOrbitals) &&
    candidate.molecularOrbitals.every(
      (item) =>
        isOrbitalLevel(item) &&
        Array.isArray(item.electrons) &&
        item.electrons.every(isElectronDirection) &&
        (item.symmetry === undefined || typeof item.symmetry === "string")
    ) &&
    Array.isArray(candidate.connectors) &&
    candidate.connectors.every(isConnector)
  );
}

export function parseDiagramPayload(raw: string): MODiagram | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isValidDiagramPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
