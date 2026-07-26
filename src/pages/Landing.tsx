import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

const STEPS = [
  {
    n: '01',
    title: 'Log het',
    body: 'Foto, ingrediënten, stappen, sterren. En je eigen notitie: volgende keer minder zout.',
  },
  {
    n: '02',
    title: 'Hou het voor jezelf',
    body: 'Alles staat privé tot jij besluit het te delen. Je mislukte risotto hoeft niemand te zien.',
  },
  {
    n: '03',
    title: 'Volg wie kan koken',
    body: 'Hun recepten komen in je feed. Eén tik en het staat in jouw kookboek.',
  },
]

function RecipePreviewCard() {
  return (
    <div className="rounded-lg overflow-hidden border border-line bg-surface">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-steak.png`}
          alt="Steak op de grill, boven de gloeiende kolen"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="bg-ink text-cream">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/">
          <Logo className="h-6" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide text-cream/70">
          <a href="#hoe-het-werkt" className="hover:text-cream">
            Hoe het werkt
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-cream/80 hover:text-cream hidden sm:inline">
            Inloggen
          </Link>
          <Link
            to="/registreren"
            className="bg-flame hover:bg-flame-dark transition-colors text-ink text-sm font-semibold px-4 py-2 rounded-md"
          >
            Begin je kookboek
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-24 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <div className="flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
            <span className="w-6 h-px bg-flame" />
            NOG GEEN KOOKBOEK? SNEU.
          </div>
          <h1 className="font-display text-6xl sm:text-7xl leading-[0.95] mb-6">
            Kook je
            <br />
            eigen
            <br />
            <span className="text-flame">shit.</span>
          </h1>
          <p className="text-cream/70 max-w-md mb-8">
            Log elk gerecht dat je maakt — ingrediënten, stappen, en wat er misging. Wat je krijgt
            is geen app vol andermans recepten, maar jouw kookboek.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              to="/registreren"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-6 py-3 rounded-md text-center"
            >
              Maak een account
            </Link>
            <a
              href="#hoe-het-werkt"
              className="border border-line hover:border-cream/40 transition-colors px-6 py-3 rounded-md text-center font-semibold"
            >
              Kijk eerst rond
            </a>
          </div>
        </div>

        <RecipePreviewCard />
      </main>

      <section id="hoe-het-werkt" className="bg-cream text-ink">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
          {STEPS.map((step) => (
            <div key={step.n}>
              <p className="font-display text-3xl text-flame mb-3">{step.n}</p>
              <h2 className="font-display text-xl mb-2">{step.title}</h2>
              <p className="text-ink/70 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cream/40">
        <p>TheGrillBook — kook je eigen shit. 2026</p>
        <div className="flex gap-6">
          <a href="#privacy" className="hover:text-cream/70">
            Privacy
          </a>
          <a href="#voorwaarden" className="hover:text-cream/70">
            Voorwaarden
          </a>
          <a href="#contact" className="hover:text-cream/70">
            Contact
          </a>
        </div>
      </footer>
    </div>
  )
}
