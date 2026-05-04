import type { MODiagram } from "@/types/mo-diagram";

type DiagramCanvasProps = {
  diagram: MODiagram;
};

function levelY(energy: number) {
  return 290 - energy * 32;
}

export function DiagramCanvas({ diagram }: DiagramCanvasProps) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-[#fffefc] p-5">
      <div className="flex items-center justify-between border-b border-black/6 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">Diagram</p>
          <h2 className="mt-1 text-base font-semibold">{diagram.title}</h2>
        </div>
        <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/55">
          {diagram.metadata.sourceLabel}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[20px] border border-line bg-white p-4">
        <svg viewBox="0 0 860 340" role="img" aria-label={diagram.title} className="h-auto w-full">
          <rect x="0" y="0" width="860" height="340" fill="#ffffff" />
          <line x1="210" y1="24" x2="210" y2="316" stroke="#dfd8ce" strokeWidth="1" />
          <line x1="650" y1="24" x2="650" y2="316" stroke="#dfd8ce" strokeWidth="1" />
          <text x="80" y="28" fill="#6b665f" fontSize="12" letterSpacing="2.2">
            LEFT AO
          </text>
          <text x="372" y="28" fill="#6b665f" fontSize="12" letterSpacing="2.2">
            MO
          </text>
          <text x="703" y="28" fill="#6b665f" fontSize="12" letterSpacing="2.2">
            RIGHT AO
          </text>

          {diagram.atomicOrbitals.left.map((orbital) => (
            <g key={`left-${orbital.id}`}>
              <line x1="78" y1={levelY(orbital.energy)} x2="188" y2={levelY(orbital.energy)} stroke="#111111" strokeWidth="2" />
              <text x="42" y={levelY(orbital.energy) + 5} fill="#111111" fontSize="13">
                {orbital.label}
              </text>
            </g>
          ))}

          {diagram.atomicOrbitals.right.map((orbital) => (
            <g key={`right-${orbital.id}`}>
              <line
                x1="672"
                y1={levelY(orbital.energy)}
                x2="782"
                y2={levelY(orbital.energy)}
                stroke="#111111"
                strokeWidth="2"
              />
              <text x="792" y={levelY(orbital.energy) + 5} fill="#111111" fontSize="13">
                {orbital.label}
              </text>
            </g>
          ))}

          {diagram.molecularOrbitals.map((orbital) => (
            <g key={orbital.id}>
              <line x1="350" y1={levelY(orbital.energy)} x2="510" y2={levelY(orbital.energy)} stroke="#155eef" strokeWidth="2" />
              <text x="520" y={levelY(orbital.energy) + 5} fill="#111111" fontSize="13">
                {orbital.label}
              </text>
              {orbital.symmetry ? (
                <text x="314" y={levelY(orbital.energy) + 5} fill="#6b665f" fontSize="12">
                  {orbital.symmetry}
                </text>
              ) : null}
              {orbital.electrons.map((electron, index) => (
                <text
                  key={`${orbital.id}-${electron}-${index}`}
                  x={400 + index * 18}
                  y={levelY(orbital.energy) - 8}
                  fill="#111111"
                  fontSize="18"
                >
                  {electron === "up" ? "↑" : "↓"}
                </text>
              ))}
            </g>
          ))}

          {diagram.connectors.map((connector) => (
            <line
              key={connector.id}
              x1={connector.fromX}
              y1={levelY(connector.fromEnergy)}
              x2={connector.toX}
              y2={levelY(connector.toEnergy)}
              stroke="#c2bbb1"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
