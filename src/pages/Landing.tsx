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

const SHOWCASE_RECIPES = [
  {
    title: 'Sticky Cola-Bourbon Spareribs',
    chef: 'Bram de Vries',
    image: 'images/demo-recipes/sticky-cola-bourbon-spareribs.webp',
    time: '4 uur 30',
    rating: 5,
    tag: 'Low & slow',
  },
  {
    title: 'Zalm op Cederhout',
    chef: 'Noor El Amrani',
    image: 'images/demo-recipes/zalm-cederhout.webp',
    time: '45 min',
    rating: 5,
    tag: 'Vis',
  },
  {
    title: 'Reverse-Seared Tomahawk',
    chef: 'Daan Vermeer',
    image: 'images/demo-recipes/reverse-seared-tomahawk.webp',
    time: '1 uur 50',
    rating: 5,
    tag: 'Vlees',
  },
]

const CHEFS = [
  {
    initials: 'BV',
    name: 'Bram de Vries',
    handle: '@bram_de_vries',
    bio: 'Klassieke Amerikaanse barbecue, stevige smaken en koken op echt vuur.',
    recipes: ['sticky-cola-bourbon-spareribs.webp', 'jalapeno-smashburgers.webp'],
  },
  {
    initials: 'NE',
    name: 'Noor El Amrani',
    handle: '@noor_el_amrani',
    bio: 'Mediterrane smaken, verse ingrediënten en precies genoeg rook.',
    recipes: ['zalm-cederhout.webp', 'gegrilde-perzik-burrata.webp'],
  },
  {
    initials: 'DV',
    name: 'Daan Vermeer',
    handle: '@daan_vermeer',
    bio: 'Low & slow, goed vlees en lange avonden rond de barbecue.',
    recipes: ['beef-short-ribs.webp', 'gerookte-mac-cheese.webp'],
  },
]

function ShowcaseRecipeCard({ recipe }: { recipe: (typeof SHOWCASE_RECIPES)[number] }) {
  return (
    <article className="group gsap-reveal bg-surface border border-line overflow-hidden rounded-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}${recipe.image}`}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-ink/85 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
          {recipe.tag}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-flame font-semibold mb-2">{recipe.chef}</p>
        <h3 className="font-display text-2xl leading-tight mb-4">{recipe.title}</h3>
        <div className="flex items-center justify-between text-sm text-cream/60">
          <StarRating value={recipe.rating} size="sm" />
          <span>{recipe.time}</span>
        </div>
      </div>
    </article>
  )
}

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
            Noor El Amrani
            <RankIcon points={42} />
          </p>
          <p className="text-xs text-cream/50">@noor_el_amrani · 2 uur</p>
        </div>
      </div>

      <div className="aspect-video overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/demo-recipes/zalm-cederhout.webp`}
          alt="Zalm op cederhout met citroen en dille"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="font-display text-2xl leading-tight mb-2">Zalm op Cederhout</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-cream/60 mb-3">
          <StarRating value={5} size="sm" />
          <span>45 min</span>
          <span>4 personen</span>
        </div>
        <p className="text-cream/70 text-sm leading-relaxed mb-4">
          Zachte zalm met subtiele cederrook, maple glaze, citroen en verse dille.
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
  const [menuOpen, setMenuOpen] = useState(false)

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
          <a href="#recepten" className="hover:text-cream">
            Recepten
          </a>
          <a href="#functies" className="hover:text-cream">
            Functies
          </a>
          <a href="#zo-ziet-het-eruit" className="hover:text-cream">
            Zo ziet het eruit
          </a>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm text-cream/80 hover:text-cream">
            Inloggen
          </Link>
          <Link
            to="/registreren"
            className="bg-flame hover:bg-flame-dark transition-colors text-ink text-sm font-semibold px-4 py-2 rounded-md"
          >
            Start je gratis grillboek
          </Link>
        </div>
        <button
          type="button"
          className="md:hidden w-11 h-11 rounded-md border border-line flex flex-col items-center justify-center gap-1.5"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={`w-5 h-0.5 bg-cream transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`w-5 h-0.5 bg-cream transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span
            className={`w-5 h-0.5 bg-cream transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </header>
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden border-b border-line bg-surface transition-all duration-300 ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-b-transparent'
        }`}
      >
        <nav className="px-6 py-5 flex flex-col gap-1">
          {[
            ['Recepten', '#recepten'],
            ['Functies', '#functies'],
            ['Zo ziet het eruit', '#zo-ziet-het-eruit'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-cream/75 hover:text-cream border-b border-line"
            >
              {label}
            </a>
          ))}
          <Link to="/login" className="py-3 text-cream/75">
            Inloggen
          </Link>
          <Link
            to="/registreren"
            className="mt-2 bg-flame text-ink font-semibold px-5 py-3 rounded-md text-center"
          >
            Start je gratis grillboek
          </Link>
        </nav>
      </div>

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
            Bewaar recepten, volg andere BBQ-liefhebbers en bouw stap voor stap je eigen digitale
            grillboek. Met ruimte voor wat werkte — en wat de volgende keer beter kan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Link
              to="/registreren"
              className="gsap-hero-cta bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-6 py-3 rounded-md text-center"
            >
              Start je gratis grillboek
            </Link>
            <a
              href="#recepten"
              className="gsap-hero-cta border border-line hover:border-cream/40 transition-colors px-6 py-3 rounded-md text-center font-semibold"
            >
              Bekijk de recepten
            </a>
          </div>
          <p className="gsap-hero-note text-xs text-cream/40">Gratis · Geen creditcard nodig</p>
        </div>

        <RecipePreviewCard />
      </main>

      <section id="recepten" className="gsap-reveal-section border-t border-line bg-surface/35">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="gsap-reveal max-w-2xl">
              <div className="flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
                <span className="w-6 h-px bg-flame" />
                VERS VAN DE GRILL
              </div>
              <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-4">
                Wat staat er binnenkort bij jou op het rooster?
              </h2>
              <p className="text-cream/60 max-w-xl">
                Ontdek wat andere BBQ-liefhebbers maken, bewaar je favorieten en geef er op jouw
                manier een draai aan.
              </p>
            </div>
            <Link
              to="/registreren"
              className="gsap-reveal text-sm font-semibold text-flame hover:text-cream transition-colors"
            >
              Start je gratis grillboek →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SHOWCASE_RECIPES.map((recipe) => (
              <ShowcaseRecipeCard key={recipe.title} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

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

      <section className="gsap-reveal-section border-t border-line bg-surface/40">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="gsap-reveal max-w-2xl mb-12">
            <div className="flex items-center gap-2 text-flame text-xs font-semibold tracking-widest mb-4">
              <span className="w-6 h-px bg-flame" />
              ONTDEK BBQ-CHEFS
            </div>
            <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-4">
              Volg mensen met smaak.
            </h2>
            <p className="text-cream/60 max-w-xl">
              Van snelle doordeweekse grills tot een nacht naast de smoker. Jij bepaalt wie er in
              je feed verschijnt.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {CHEFS.map((chef) => (
              <article
                key={chef.handle}
                className="gsap-reveal rounded-lg border border-line bg-surface overflow-hidden"
              >
                <div className="grid grid-cols-2 h-32">
                  {chef.recipes.map((recipe) => (
                    <img
                      key={recipe}
                      src={`${import.meta.env.BASE_URL}images/demo-recipes/${recipe}`}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ))}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-11 h-11 rounded-full bg-flame text-ink flex items-center justify-center font-bold text-sm">
                      {chef.initials}
                    </span>
                    <div>
                      <h3 className="font-semibold">{chef.name}</h3>
                      <p className="text-xs text-cream/45">{chef.handle} · 5 recepten</p>
                    </div>
                  </div>
                  <p className="text-sm text-cream/65 leading-relaxed min-h-11">{chef.bio}</p>
                </div>
              </article>
            ))}
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
            Klaar om je volgende favoriet te bewaren?
          </h2>
          <Link
            to="/registreren"
            className="gsap-cta-button bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-8 py-3.5 rounded-md inline-block"
          >
            Start je gratis grillboek
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
