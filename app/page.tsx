import Link from "next/link";
import { ArrowRight, Check, FlaskConical, FileOutput, Sparkles } from "lucide-react";

const bullets = [
  "Publication-ready SVG output",
  "Database-first accuracy for common diatomic molecules",
  "Paywall-ready export flow for premium downloads"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between border-b border-black/5 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">SciDiagram.io</p>
          <h1 className="mt-2 text-lg font-semibold">Molecular Orbital diagrams for papers and slides</h1>
        </div>
        <Link
          href="/editor"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-panel transition hover:-translate-y-0.5"
        >
          Open editor
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="grid flex-1 gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-black/55">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Paid MVP for academic diagram generation
          </div>
          <h2 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl">
            Generate publication-ready Molecular Orbital diagrams in seconds with AI.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-black/68 sm:text-lg">
            Built for graduate researchers, chemistry students, and science creators who need crisp white-background
            orbital diagrams without hand-drawing every level, label, and electron arrow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-black/90"
            >
              Launch editor
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium"
            >
              View pricing
            </a>
          </div>

          <ul className="mt-10 grid gap-3 text-sm text-black/70">
            {bullets.map((bullet) => (
              <li key={bullet} className="inline-flex items-center gap-3">
                <span className="rounded-full border border-sage/20 bg-sage/10 p-1 text-sage">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-panel">
          <div className="rounded-[22px] border border-black/8 bg-[#fffdf9] p-5">
            <div className="flex items-center justify-between border-b border-black/6 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">Preview</p>
                <p className="mt-1 text-sm font-medium">Oxygen molecular orbital diagram</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-1 text-xs text-black/55">
                <FlaskConical className="h-3.5 w-3.5" />
                Database-backed model
              </div>
            </div>

            <div className="mt-5 rounded-[18px] border border-line bg-white p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-black/40">
                  <span>Atomic orbitals</span>
                  <span>Molecular orbitals</span>
                </div>
                <div className="h-[260px] rounded-[14px] border border-black/6 bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf7_100%)] p-4">
                  <div className="flex h-full items-center justify-center text-center text-sm text-black/55">
                    SVG editor preview renders here.
                    <br />
                    Free exports include watermark PNG.
                    <br />
                    Premium exports unlock SVG and PDF.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[16px] border border-black/6 bg-mist px-4 py-3">
              <div className="inline-flex items-center gap-2 text-sm font-medium">
                <FileOutput className="h-4 w-4 text-accent" />
                Export tiers
              </div>
              <p className="text-xs text-black/55">PNG free, SVG/PDF premium</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="grid gap-4 border-t border-black/5 py-10 sm:grid-cols-2"
      >
        <div className="rounded-[24px] border border-black/10 bg-white/85 p-6">
          <p className="text-sm font-semibold">Free</p>
          <p className="mt-2 text-sm leading-6 text-black/65">
            Generate and preview diagrams, then download watermark PNG output for rapid drafts.
          </p>
        </div>
        <div className="rounded-[24px] border border-ink bg-ink p-6 text-white">
          <p className="text-sm font-semibold">Premium</p>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Unlock clean SVG and PDF export, saved diagram history, and reusable project editing.
          </p>
        </div>
      </section>
    </main>
  );
}
