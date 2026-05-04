import type { MODiagram } from "@/types/mo-diagram";

function levelY(energy: number) {
  return 290 - energy * 32;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildDiagramSvg(diagram: MODiagram) {
  const leftOrbitals = diagram.atomicOrbitals.left
    .map(
      (orbital) => `
      <g>
        <line x1="78" y1="${levelY(orbital.energy)}" x2="188" y2="${levelY(orbital.energy)}" stroke="#111111" stroke-width="2" />
        <text x="42" y="${levelY(orbital.energy) + 5}" fill="#111111" font-size="13">${escapeXml(orbital.label)}</text>
      </g>`
    )
    .join("");

  const rightOrbitals = diagram.atomicOrbitals.right
    .map(
      (orbital) => `
      <g>
        <line x1="672" y1="${levelY(orbital.energy)}" x2="782" y2="${levelY(orbital.energy)}" stroke="#111111" stroke-width="2" />
        <text x="792" y="${levelY(orbital.energy) + 5}" fill="#111111" font-size="13">${escapeXml(orbital.label)}</text>
      </g>`
    )
    .join("");

  const molecularOrbitals = diagram.molecularOrbitals
    .map((orbital) => {
      const electrons = orbital.electrons
        .map(
          (electron, index) => `
          <text x="${400 + index * 18}" y="${levelY(orbital.energy) - 8}" fill="#111111" font-size="18">${electron === "up" ? "↑" : "↓"}</text>`
        )
        .join("");

      const symmetry = orbital.symmetry
        ? `<text x="314" y="${levelY(orbital.energy) + 5}" fill="#6b665f" font-size="12">${escapeXml(orbital.symmetry)}</text>`
        : "";

      return `
      <g>
        <line x1="350" y1="${levelY(orbital.energy)}" x2="510" y2="${levelY(orbital.energy)}" stroke="#155eef" stroke-width="2" />
        <text x="520" y="${levelY(orbital.energy) + 5}" fill="#111111" font-size="13">${escapeXml(orbital.label)}</text>
        ${symmetry}
        ${electrons}
      </g>`;
    })
    .join("");

  const connectors = diagram.connectors
    .map(
      (connector) => `
      <line
        x1="${connector.fromX}"
        y1="${levelY(connector.fromEnergy)}"
        x2="${connector.toX}"
        y2="${levelY(connector.toEnergy)}"
        stroke="#c2bbb1"
        stroke-width="1.2"
      />`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 340" role="img" aria-label="${escapeXml(diagram.title)}">
  <rect x="0" y="0" width="860" height="340" fill="#ffffff" />
  <line x1="210" y1="24" x2="210" y2="316" stroke="#dfd8ce" stroke-width="1" />
  <line x1="650" y1="24" x2="650" y2="316" stroke="#dfd8ce" stroke-width="1" />
  <text x="80" y="28" fill="#6b665f" font-size="12" letter-spacing="2.2">LEFT AO</text>
  <text x="372" y="28" fill="#6b665f" font-size="12" letter-spacing="2.2">MO</text>
  <text x="703" y="28" fill="#6b665f" font-size="12" letter-spacing="2.2">RIGHT AO</text>
  ${leftOrbitals}
  ${rightOrbitals}
  ${molecularOrbitals}
  ${connectors}
</svg>`;
}
