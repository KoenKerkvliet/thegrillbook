import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export default function Privacy() {
  return (
    <div className="bg-ink text-cream min-h-svh">
      <header className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/">
          <Logo className="h-9" />
        </Link>
        <Link to="/" className="text-sm text-cream/60 hover:text-cream">
          ← Terug naar de homepage
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-24">
        <h1 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-3">Privacybeleid</h1>
        <p className="text-cream/50 text-sm mb-12">Laatst bijgewerkt: 27 juli 2026</p>

        <div className="flex flex-col gap-10 text-cream/80 leading-relaxed">
          <section>
            <p>
              BBQHeros is een klein, persoonlijk project — begonnen voor eigen gebruik en gedeeld
              met familie en vrienden. Dit privacybeleid legt in gewone taal uit welke gegevens we
              verzamelen, waarom, en wat jouw rechten zijn.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Wie is verantwoordelijk</h2>
            <p>
              BBQHeros wordt beheerd door Koen Kerkvliet (Design Pixels). Voor alle vragen over
              deze pagina of je gegevens kun je mailen naar{' '}
              <a href="mailto:info@designpixels.nl" className="text-flame hover:underline">
                info@designpixels.nl
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Welke gegevens we verzamelen</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-cream">Accountgegevens</strong> — e-mailadres, wachtwoord
                (versleuteld opgeslagen door onze inlogprovider, wij zien 'm nooit in leesbare
                vorm), gebruikersnaam, weergavenaam, profielfoto, bio en de BBQ-hardware die je
                zelf toevoegt.
              </li>
              <li>
                <strong className="text-cream">Content die je zelf plaatst</strong> — recepten
                (met foto's, ingrediënten en stappen), BBQ-momenten, gedeelde video's, persoonlijke
                notities en aantekeningen.
              </li>
              <li>
                <strong className="text-cream">Sociale gegevens</strong> — wie je volgt en wie jou
                volgt, likes, en met wie je content deelt.
              </li>
              <li>
                <strong className="text-cream">Technische gegevens</strong> — een inlogsessie wordt
                lokaal in je browser bewaard (niet op een server) zodat je ingelogd blijft. We
                gebruiken geen advertentie- of trackingcookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Waarom we deze gegevens gebruiken</h2>
            <p>
              Uitsluitend om de app te laten werken: je account beheren, je content tonen aan de
              mensen voor wie jij 'm bedoeld hebt (niemand, je collega chefs, of iedereen die jij
              volgt — dat kies je zelf per recept of video), en je e-mails sturen die bij het
              gebruik van de app horen (accountbevestiging, wachtwoord resetten, een melding als
              iemand je volgt, liket of iets met je deelt). We gebruiken je gegevens niet voor
              advertenties en verkopen niets door aan derden.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Wie je gegevens verwerkt</h2>
            <p className="mb-3">
              We draaien BBQHeros met een klein aantal betrouwbare, gespecialiseerde diensten in
              plaats van alles zelf te bouwen:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-cream">Supabase</strong> — database, inloggen en opslag
                van foto's.
              </li>
              <li>
                <strong className="text-cream">emailit.com</strong> — het versturen van de
                e-mails hierboven genoemd.
              </li>
              <li>
                <strong className="text-cream">GitHub Pages</strong> — het hosten van de website
                zelf.
              </li>
              <li>
                <strong className="text-cream">Google Fonts</strong> — de lettertypen op deze
                site worden geladen vanaf Google's servers, waarbij je IP-adres met Google wordt
                gedeeld (zoals bij vrijwel elke website die Google Fonts gebruikt).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Hoe lang we gegevens bewaren</h2>
            <p>
              Zolang je account bestaat. Wil je stoppen met BBQHeros? Verwijder je account zelf via
              je profielpagina, of mail naar{' '}
              <a href="mailto:info@designpixels.nl" className="text-flame hover:underline">
                info@designpixels.nl
              </a>{' '}
              — in beide gevallen verwijderen we je account en alle bijbehorende gegevens direct
              en definitief.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Jouw rechten</h2>
            <p>
              Je hebt altijd het recht om in te zien welke gegevens we van je hebben, ze te laten
              corrigeren, ze te laten verwijderen, of een kopie te ontvangen. Stuur daarvoor een
              mail naar{' '}
              <a href="mailto:info@designpixels.nl" className="text-flame hover:underline">
                info@designpixels.nl
              </a>
              . Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht
              indienen bij de Autoriteit Persoonsgegevens.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Beveiliging</h2>
            <p>
              Onze database is zo ingesteld dat elke gebruiker technisch alleen bij zijn eigen
              gegevens en toegestane content kan: recepten die je privé houdt zijn dus ook via de
              normale app niet door anderen op te vragen. Wachtwoorden worden nooit door ons in
              leesbare vorm opgeslagen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Wijzigingen</h2>
            <p>
              Dit is een klein, groeiend project — dit beleid kan meebewegen als de app verandert.
              Belangrijke wijzigingen laten we altijd via de datum bovenaan deze pagina zien.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
