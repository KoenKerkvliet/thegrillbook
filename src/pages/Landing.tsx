import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Logo } from '../components/Logo'
import { StarRating } from '../components/StarRating'
import { RankIcon } from '../components/RankIcon'
import { RANKS } from '../lib/ranks'

gsap.registerPlugin(ScrollTrigger)

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
      <div className="gsap-hero-card rounded-lg overflow-hidden border border-line bg-surface">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-hamburger.webp`}
            alt="Hamburger op de grill, boven de gloeiende kolen"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="gsap-hero-badge hidden sm:flex absolute -bottom-5 -left-5 items-center gap-2 bg-surface border border-line rounded-md px-4 py-3 shadow-lg">
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
            <span className="gsap-flame inline-block" aria-hidden="true">
              🔥
            </span>
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
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance — punchy stamped-in text, then card + badge.
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.gsap-eyebrow', { opacity: 0, x: -24, duration: 0.5 })
        .from('.gsap-hero-line', { yPercent: 110, duration: 0.85, stagger: 0.1 }, '-=0.15')
        .from('.gsap-hero-sub', { opacity: 0, y: 16, duration: 0.6 }, '-=0.35')
        .from('.gsap-hero-cta', { opacity: 0, y: 16, duration: 0.5, stagger: 0.1 }, '-=0.35')
        .from('.gsap-hero-note', { opacity: 0, duration: 0.4 }, '-=0.25')
        .from(
          '.gsap-hero-card',
          { opacity: 0, scale: 0.94, duration: 0.9, ease: 'power3.out' },
          '-=0.9',
        )
        .from(
          '.gsap-hero-badge',
          { opacity: 0, scale: 0.4, y: 12, duration: 0.55, ease: 'back.out(2.4)' },
          '-=0.25',
        )

      // Generic scroll-reveal for section content further down the page.
      gsap.utils.toArray<HTMLElement>('.gsap-reveal-section').forEach((section) => {
        const targets = section.querySelectorAll('.gsap-reveal')
        if (!targets.length) return
        gsap.from(targets, {
          opacity: 0,
          y: 32,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 78%' },
        })
      })

      // Rank ladder: badges pop in one by one.
      gsap.from('.gsap-rank-icon', {
        opacity: 0,
        scale: 0.3,
        y: 14,
        duration: 0.5,
        stagger: 0.09,
        ease: 'back.out(2.6)',
        scrollTrigger: { trigger: '.gsap-rank-row', start: 'top 82%' },
      })
      gsap.from('.gsap-rank-arrow', {
        opacity: 0,
        duration: 0.3,
        stagger: 0.09,
        delay: 0.2,
        scrollTrigger: { trigger: '.gsap-rank-row', start: 'top 82%' },
      })

      // Closing CTA: a slightly harder slam-in for the final punch.
      gsap.from('.gsap-cta-heading', {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.gsap-cta-heading', start: 'top 85%' },
      })
      gsap.from('.gsap-cta-button', {
        opacity: 0,
        y: 16,
        duration: 0.5,
        delay: 0.15,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: '.gsap-cta-heading', start: 'top 85%' },
      })

      // Ambient flame flicker — subtle, continuous, never stops.
      gsap.to('.gsap-flame', {
        scale: 1.12,
        rotate: -3,
        duration: 0.55,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '50% 100%',
        stagger: { each: 0.35, from: 'random' },
      })
    }, rootRef)

    const handleLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', handleLoad)

    return () => {
      window.removeEventListener('load', handleLoad)
      ctx.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="bg-ink text-cream">
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
          <div className="gsap-eyebrow flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
            <span className="w-6 h-px bg-flame" />
            NOG GEEN KOOKBOEK? SNEU.
          </div>
          <h1 className="font-display text-6xl sm:text-7xl leading-[0.95] mb-6">
            <span className="block overflow-hidden">
              <span className="gsap-hero-line block">Kook je</span>
            </span>
            <span className="block overflow-hidden">
              <span className="gsap-hero-line block">eigen</span>
            </span>
            <span className="block overflow-hidden">
              <span className="gsap-hero-line block text-flame">shit.</span>
            </span>
          </h1>
          <p className="gsap-hero-sub text-cream/70 max-w-md mb-8">
            Log elk gerecht dat je maakt — ingrediënten, stappen, en wat er misging. Wat je krijgt
            is geen app vol andermans recepten, maar jouw kookboek.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Link
              to="/registreren"
              className="gsap-hero-cta bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-6 py-3 rounded-md text-center"
            >
              Maak een account
            </Link>
            <a
              href="#functies"
              className="gsap-hero-cta border border-line hover:border-cream/40 transition-colors px-6 py-3 rounded-md text-center font-semibold"
            >
              Kijk eerst rond
            </a>
          </div>
          <p className="gsap-hero-note text-xs text-cream/40">Gratis · Geen creditcard nodig</p>
        </div>

        <RecipePreviewCard />
      </main>

      <section id="functies" className="gsap-reveal-section border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="gsap-reveal max-w-xl mb-12">
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
              <div key={feature.title} className="gsap-reveal">
                <span
                  className={`text-3xl mb-3 inline-block${feature.icon === '🔥' ? ' gsap-flame' : ''}`}
                  aria-hidden="true"
                >
                  {feature.icon}
                </span>
                <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                <p className="text-cream/60 text-sm leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gsap-reveal-section border-t border-line bg-surface/40">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="gsap-reveal max-w-xl mb-10">
            <div className="flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
              <span className="w-6 h-px bg-flame" />
              VAN RECRUIT TOT LEGENDE
            </div>
            <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-4">
              Verdien je rang.
            </h2>
            <p className="text-cream/60 max-w-md">
              Elk recept en elk moment telt mee. Hoe actiever je BBQ't, hoe hoger je klimt.
            </p>
          </div>
          <div className="gsap-rank-row flex flex-wrap items-center gap-4 sm:gap-6">
            {RANKS.slice(0, 5).map((rank, i) => (
              <div key={rank.name} className="flex items-center gap-4 sm:gap-6">
                <div className="gsap-rank-icon flex flex-col items-center gap-2 w-20 text-center">
                  <span className="text-3xl" aria-hidden="true">
                    {rank.icon}
                  </span>
                  <p className="text-xs text-cream/60 leading-tight">{rank.name}</p>
                </div>
                {i < 4 && <span className="gsap-rank-arrow text-cream/20 text-xl">→</span>}
              </div>
            ))}
            <span className="gsap-rank-arrow text-cream/20 text-xl">→</span>
            <p className="gsap-rank-icon text-cream/40 text-sm">... tot BBQ General 🏆</p>
          </div>
        </div>
      </section>

      <section id="zo-ziet-het-eruit" className="gsap-reveal-section border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="gsap-reveal">
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
          <div className="gsap-reveal flex justify-center">
            <MockFeedCard />
          </div>
        </div>
      </section>

      <section className="gsap-reveal-section bg-cream text-ink">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="gsap-reveal font-display text-3xl sm:text-4xl leading-[0.95] mb-12">
            Hoe het werkt.
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.n} className="gsap-reveal">
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
          <h2 className="gsap-cta-heading font-display text-4xl sm:text-5xl leading-[0.95] mb-6">
            Tijd om je eigen shit te koken.
          </h2>
          <Link
            to="/registreren"
            className="gsap-cta-button bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-8 py-3.5 rounded-md inline-block"
          >
            Begin je kookboek
          </Link>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cream/40">
        <p>
          BBQHeros — kook je eigen shit. 2026 · Gemaakt door{' '}
          <a
            href="https://designpixels.nl"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cream/70"
          >
            Design Pixels
          </a>
        </p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-cream/70">
            Privacy
          </Link>
          <Link to="/voorwaarden" className="hover:text-cream/70">
            Voorwaarden
          </Link>
          <a href="mailto:info@designpixels.nl" className="hover:text-cream/70">
            Contact
          </a>
        </div>
      </footer>

      <BackToTop />
    </div>
  )
}
