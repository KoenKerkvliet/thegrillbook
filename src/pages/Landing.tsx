import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { StarRating } from '../components/StarRating'
import { RankIcon } from '../components/RankIcon'
import { RANKS } from '../lib/ranks'

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

const FEATURES = [
  {
    icon: '🔥',
    title: 'Recepten',
    body: 'Foto, ingrediënten, stappen en sterren. Plus een privénotitie die niemand anders ziet.',
  },
  {
    icon: '📸',
    title: 'BBQ-momenten',
    body: 'Geen zin in een heel recept? Log gewoon dat het vuur aanstaat.',
  },
  {
    icon: '📺',
    title: "Video's delen",
    body: "Deel een YouTube-tutorial met je chefs, of sla 'm op als recept in je eigen kookboek.",
  },
  {
    icon: '🎖️',
    title: 'Rangen & streaks',
    body: 'Verdien punten met elk recept en moment. Bouw een reputatie op, week na week.',
  },
  {
    icon: '🤝',
    title: 'Collega chefs',
    body: 'Volg wie kan koken. Hun recepten verschijnen vanzelf in jouw feed.',
  },
  {
    icon: '📓',
    title: 'Persoonlijk logboek',
    body: 'Bewaar kerntemperaturen en andere trucs die je toch steeds weer opzoekt.',
  },
]

function RecipePreviewCard() {
  return (
    <div className="relative">
      <div className="rounded-lg overflow-hidden border border-line bg-surface">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-hamburger.webp`}
            alt="Hamburger op de grill, boven de gloeiende kolen"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="hidden sm:flex absolute -bottom-5 -left-5 items-center gap-2 bg-surface border border-line rounded-md px-4 py-3 shadow-lg">
        <span className="text-xl leading-none" aria-hidden="true">
          🍖
        </span>
        <div>
          <p className="text-sm font-semibold text-cream">Corporal of the Coals</p>
          <p className="text-xs text-cream/50">17 punten deze week</p>
        </div>
      </div>
    </div>
  )
}

function MockFeedCard() {
  return (
    <article className="bg-surface border border-line max-w-md w-full">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 flex items-center justify-center text-xs text-cream/40">
          KO
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate flex items-center gap-1.5">
            Koen
            <RankIcon points={17} />
          </p>
          <p className="text-xs text-cream/50">@koen · 2 uur</p>
        </div>
      </div>

      <div className="aspect-video overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-spareribs.webp`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="font-display text-2xl leading-tight mb-2">Spareribs, 6 uur laag</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-cream/60 mb-3">
          <StarRating value={5} size="sm" />
          <span>360 min</span>
          <span>5 personen</span>
        </div>
        <p className="text-cream/70 text-sm leading-relaxed mb-4">
          Eindelijk de bark waar ik voor ging. Volgende keer een uur langer roken.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-line">
          <span className="flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5 border bg-flame/10 border-flame text-flame">
            <span aria-hidden="true">🔥</span>
            <span>12</span>
          </span>
          <span className="flex items-center justify-center w-9 h-9 rounded-md border border-line text-cream/70">
            <span aria-hidden="true">✈️</span>
          </span>
          <span className="flex items-center justify-center w-9 h-9 rounded-md border border-line text-cream/70">
            <span aria-hidden="true">🔖</span>
          </span>
        </div>
      </div>
    </article>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Naar boven"
      title="Naar boven"
      className={`fixed bottom-6 right-6 z-20 w-11 h-11 rounded-full bg-flame hover:bg-flame-dark text-ink flex items-center justify-center text-lg shadow-lg transition-all ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      ↑
    </button>
  )
}

export default function Landing() {
  return (
    <div className="bg-ink text-cream">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/">
          <Logo className="h-10" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-cream/60">
          <a href="#functies" className="hover:text-cream">
            Functies
          </a>
          <a href="#zo-ziet-het-eruit" className="hover:text-cream">
            Zo ziet het eruit
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-cream/80 hover:text-cream">
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

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-28 grid lg:grid-cols-2 gap-16 items-start">
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
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Link
              to="/registreren"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-6 py-3 rounded-md text-center"
            >
              Maak een account
            </Link>
            <a
              href="#functies"
              className="border border-line hover:border-cream/40 transition-colors px-6 py-3 rounded-md text-center font-semibold"
            >
              Kijk eerst rond
            </a>
          </div>
          <p className="text-xs text-cream/40">Gratis · Geen creditcard nodig</p>
        </div>

        <RecipePreviewCard />
      </main>

      <section id="functies" className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-12">
            <div className="flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
              <span className="w-6 h-px bg-flame" />
              MEER DAN EEN RECEPTENBOEK
            </div>
            <h2 className="font-display text-4xl sm:text-5xl leading-[0.95]">
              Alles wat je nodig hebt om je BBQ-kunsten bij te houden.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <span className="text-3xl mb-3 inline-block" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                <p className="text-cream/60 text-sm leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface/40">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-10">
            <div className="flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
              <span className="w-6 h-px bg-flame" />
              VAN RECRUIT TOT LEGENDE
            </div>
            <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-4">
              Verdien je rang.
            </h2>
            <p className="text-cream/60 max-w-md">
              Elk recept, elk moment, elke like op je werk telt mee. Hoe actiever je BBQ't, hoe
              hoger je klimt.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {RANKS.slice(0, 5).map((rank, i) => (
              <div key={rank.name} className="flex items-center gap-4 sm:gap-6">
                <div className="flex flex-col items-center gap-2 w-20 text-center">
                  <span className="text-3xl" aria-hidden="true">
                    {rank.icon}
                  </span>
                  <p className="text-xs text-cream/60 leading-tight">{rank.name}</p>
                </div>
                {i < 4 && <span className="text-cream/20 text-xl">→</span>}
              </div>
            ))}
            <span className="text-cream/20 text-xl">→</span>
            <p className="text-cream/40 text-sm">... tot BBQ General 🏆</p>
          </div>
        </div>
      </section>

      <section id="zo-ziet-het-eruit" className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
              <span className="w-6 h-px bg-flame" />
              ZO ZIET HET ERUIT
            </div>
            <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-6">
              Jouw feed, jouw regels.
            </h2>
            <p className="text-cream/70 max-w-md">
              Alleen recepten en momenten van chefs die je zelf volgt. Geen algoritme, geen
              vreemden, geen ruis — gewoon wat jouw collega chefs op het vuur hebben staan.
            </p>
          </div>
          <div className="flex justify-center">
            <MockFeedCard />
          </div>
        </div>
      </section>

      <section className="bg-cream text-ink">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-3xl sm:text-4xl leading-[0.95] mb-12">
            Hoe het werkt.
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-display text-3xl text-flame mb-3">{step.n}</p>
                <h3 className="font-display text-xl mb-2">{step.title}</h3>
                <p className="text-ink/70 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-6">
            Tijd om je eigen shit te koken.
          </h2>
          <Link
            to="/registreren"
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-8 py-3.5 rounded-md inline-block"
          >
            Begin je kookboek
          </Link>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cream/40">
        <p>BBQHeros — kook je eigen shit. 2026</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-cream/70">
            Privacy
          </Link>
          <Link to="/voorwaarden" className="hover:text-cream/70">
            Voorwaarden
          </Link>
          <a href="mailto:koenkerkvliet@gmail.com" className="hover:text-cream/70">
            Contact
          </a>
        </div>
      </footer>

      <BackToTop />
    </div>
  )
}
