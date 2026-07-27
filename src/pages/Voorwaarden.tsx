import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export default function Voorwaarden() {
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
        <h1 className="font-display text-4xl sm:text-5xl leading-[0.95] mb-3">
          Algemene voorwaarden
        </h1>
        <p className="text-cream/50 text-sm mb-12">Laatst bijgewerkt: 27 juli 2026</p>

        <div className="flex flex-col gap-10 text-cream/80 leading-relaxed">
          <section>
            <p>
              BBQHeros is een klein, persoonlijk project voor het loggen en delen van BBQ-recepten
              met mensen die je zelf volgt. Door een account aan te maken ga je akkoord met deze
              voorwaarden. Ze zijn met opzet in gewone taal geschreven.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Je account</h2>
            <p>
              Je bent zelf verantwoordelijk voor het geheimhouden van je wachtwoord en voor wat er
              met je account gebeurt. Merk je iets vreemds op je account? Mail dan naar{' '}
              <a href="mailto:info@designpixels.nl" className="text-flame hover:underline">
                info@designpixels.nl
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Wat je wel en niet mag plaatsen</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Plaats alleen content die van jezelf is, of waar je toestemming voor hebt.</li>
              <li>
                Geen illegale, discriminerende, aanstootgevende of schadelijke content — dit is een
                plek voor recepten en BBQ-plezier, niet voor rotzooi.
              </li>
              <li>Val andere gebruikers niet lastig en misbruik het platform niet.</li>
            </ul>
            <p className="mt-3">
              We behouden ons het recht voor om content te verwijderen of een account te blokkeren
              als dit niet gebeurt.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Eigendom van je content</h2>
            <p>
              Alles wat je plaatst — recepten, foto's, momenten, notities — blijft van jou. Door
              het te plaatsen geef je BBQHeros alleen het recht om het te tonen aan de mensen voor
              wie jij het bedoeld hebt (jijzelf, je collega chefs, of iedereen — dat kies je zelf
              per stuk content). We gebruiken je content nergens anders voor.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Geen garanties over recepten</h2>
            <p>
              Recepten, kooktijden, kerntemperaturen en andere tips komen van gebruikers zelf, niet
              van ons. We controleren dit niet. Gebruik je gezond verstand, vooral bij dingen die
              met voedselveiligheid te maken hebben.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Beschikbaarheid</h2>
            <p>
              BBQHeros is een klein project zonder een team eromheen. We doen ons best om de app
              beschikbaar en werkend te houden, maar kunnen geen 100%-uptime of foutloze werking
              garanderen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Je account opzeggen</h2>
            <p>
              Je kunt op elk moment stoppen. Verwijder je account zelf via je profielpagina, of
              mail naar{' '}
              <a href="mailto:info@designpixels.nl" className="text-flame hover:underline">
                info@designpixels.nl
              </a>{' '}
              en we verwijderen je account en gegevens. Meer hierover staat in ons{' '}
              <Link to="/privacy" className="text-flame hover:underline">
                privacybeleid
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Wijzigingen</h2>
            <p>
              Deze voorwaarden kunnen meebewegen als de app verandert. Belangrijke wijzigingen zie
              je terug via de datum bovenaan deze pagina.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-3">Toepasselijk recht</h2>
            <p>Op deze voorwaarden is Nederlands recht van toepassing.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
