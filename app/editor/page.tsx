import { EditorShell } from "@/components/editor/EditorShell";
import { getPresetMolecule } from "@/lib/molecules";

export default function EditorPage() {
  const initialDiagram = getPresetMolecule("O2");

  return <EditorShell initialDiagram={initialDiagram} />;
}
