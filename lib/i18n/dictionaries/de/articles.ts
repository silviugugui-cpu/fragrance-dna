import type { Dictionary } from '../en';

const articles: Dictionary['articles'] = {
  menu: {
    passionMenu: 'Passions-Menü',
    items: {
      fragrances: { label: 'Düfte', hint: 'Den Duftkatalog entdecken' },
      needToKnow: { label: 'Wissenswertes', hint: 'Grundlegendes Duftwissen' },
      perfumeCreators: { label: 'Parfumschöpfer', hint: 'Parfümeur-DNA und Signaturstile' },
      scentTerritories: { label: 'Olfaktorische Territorien', hint: 'Entdecken Sie die olfaktorischen Welten' },
      perfumeHouses: { label: 'TOP Olfactive Houses', hint: 'Häuser und ihre Düfte entdecken' },
      occasions: { label: 'Anlässe', hint: 'Ein Duft für jeden Moment' },
    },
  },
  houses: {
    title: 'TOP Olfactive Houses',
    intro: 'Eine redaktionelle Auswahl, keine Beliebtheitsrangliste oder vollständige Veröffentlichungshistorie. Kaufempfehlungen verwenden nur diesen ausgewählten Katalog.',
    notice: 'Dieser Katalog umfasst nicht alle Veröffentlichungen. Duftterritorien sind redaktionelle Vorschläge, keine bestätigten Klassifizierungen.',
    search: 'Häuser suchen', fragranceSearch: 'Düfte dieses Hauses suchen', searchAction: 'Suchen',
    catalog: 'Düfte in unserem Katalog',
    description: 'Redaktionelle Beschreibung',
    editorialDescription: (name, accords) => accords
      ? `Entdecken Sie die Duftwelt von ${name} anhand der Düfte in unserem Katalog. Zu den am häufigsten dokumentierten Akkorden zählen ${accords}. Dieser Überblick bietet einen Einstieg in das Haus, während jede Komposition ihre eigenen Nuancen mitbringt.`
      : `Entdecken Sie die Duftwelt von ${name} anhand der Düfte in unserem Katalog. Erkunden Sie die folgenden Kompositionen und vergleichen Sie die verfügbaren Profile, um Ihren persönlichen Einstieg in das Haus zu finden.`,
    website: 'Website',
    source: 'Dokumentationsquelle', territories: 'Territoriumsvorschläge · Prüfung ausstehend',
    evidence: 'Belegbegriffe', method: 'Methode', confidence: 'Vertrauen laut Quelle',
    similarity: 'Berichtete Ähnlichkeit · keine Gleichwertigkeit', brandClaim: 'Von der Marke erklärte Inspiration',
    pending: 'Ähnlichkeit noch in Recherche', notes: 'Noten',
    noResults: 'Keine Treffer in dieser Auswahl.', previous: 'Zurück', next: 'Weiter', back: 'Alle ausgewählten Häuser',
    page: 'Seite', art: 'Originale redaktionelle Illustration; kein offizielles Markenbild.', reviewStatus: 'Prüfstatus',
  },
  needToKnow: {
    kicker: 'Wissenswertes',
    title: 'Artikel in Wissenswertes',
    intro:
      'Entdecken Sie strukturiertes Duftwissen nach Kategorien.',
    sectionLabel: 'Bereich',
    nowReading: 'Sie lesen gerade',
    articleCount: (count) => `${count} Artikel`,
    sections: {
      'scent-fundamentals': {
        title: 'Olfaktorische Grundlagen',
        description: 'Kernprinzipien, die erklären, wie Düfte aufgebaut und wahrgenommen werden.',
        intro: 'Schaffen Sie ein solides Fundament, bevor Sie Leistung, Wert oder Markenkategorie beurteilen.',
        articles: [
          {
            title: 'Kopf-, Herz- und Basisnoten',
            subtitle: 'Ein Duft ist eine Reise',
            paragraphs: [
              'Die meisten Düfte entwickeln sich in Phasen, statt von Anfang bis Ende gleich zu riechen.',
              'Kopfnoten sind der erste Eindruck – meist strahlend und kurzlebig.',
              'Herznoten prägen den zentralen Charakter, sobald der Auftakt verklingt.',
              'Basisnoten verleihen Tiefe und formen oft den langanhaltenden Duft auf der Haut.',
            ],
          },
          {
            title: 'Konzentrationsstufen verstehen',
            subtitle: 'EDT, EDP und Parfum im Kontext',
            paragraphs: [
              'Die Konzentration gibt den ungefähren Anteil an Duftstoffen an, die in Alkohol gelöst sind – sie ist jedoch keine Leistungsgarantie für sich allein.',
              'Formelaufbau, Qualität der Inhaltsstoffe, Hautchemie und Klima können die Leistung stärker beeinflussen als die Konzentrationsangabe allein.',
              'Je nach Komposition übertrifft manches EDT viele Parfums.',
            ],
            bullets: [
              'Eau Fraiche: 1-3 %',
              'Eau de Cologne (EDC): 2-5 %',
              'Eau de Toilette (EDT): 5-15 %',
              'Eau de Parfum (EDP): 15-20 %',
              'Parfum / Extrait: 20-40 %',
            ],
            callout:
              'Mythos: Höhere Konzentration bedeutet immer stärkere Leistung.\nRealität: Die Architektur der Formel zählt mehr als das Etikett.',
          },
          {
            title: 'Was ist ein Akkord?',
            subtitle: 'Die Bausteine der Komposition',
            paragraphs: [
              'Ein Akkord ist eine Mischung von Materialien, die einen wiedererkennbaren Dufteindruck erzeugt – etwa Leder, Amber, Tabak oder Meeresluft.',
              'Viele Akkorde sind kompositorische Illusionen und existieren nicht als einzelnes natürliches Material.',
              'Wer Akkorde versteht, begreift auch, warum Notenpyramiden und Geruchswahrnehmung nicht immer wörtlich übereinstimmen.',
            ],
          },
          {
            title: 'Natürliche vs. synthetische Inhaltsstoffe',
            subtitle: 'Beide sind in der modernen Parfümerie unverzichtbar',
            paragraphs: [
              'Natürliche Materialien können Fülle und Textur beisteuern, während Synthetik Konstanz, Stabilität und kreativen Spielraum verbessert.',
              'Die meisten hochwertigen Düfte kombinieren beide Ansätze.',
              'Qualität entsteht durch Kreativität und Balance der Formel, nicht durch ein simples Verhältnis von natürlich zu synthetisch.',
            ],
          },
        ],
      },
      'application-technique': {
        title: 'Auftragetechnik',
        description: 'Wie Sie Parfum richtig auftragen – für elegante Projektion und gleichmäßigeres Trageverhalten.',
        intro: 'Mit diesen Praktiken verbessern Sie das Duftverhalten, ohne zu übersprühen.',
        articles: [
          {
            title: 'Parfum richtig auftragen',
            subtitle: 'Weniger ist oft mehr',
            paragraphs: [
              'Tragen Sie den Duft auf Pulspunkte wie Hals, Brust und Handgelenke auf, damit die Körperwärme die Verbreitung über den Tag unterstützt.',
              'Streben Sie eine entdeckbare Duftspur an, keine Raumsättigung.',
            ],
            bullets: [
              'Frische Düfte: 4-6 Sprühstöße',
              'Vielseitige Düfte: 3-5 Sprühstöße',
              'Kraftvolle Düfte: 2-4 Sprühstöße',
            ],
          },
          {
            title: 'Nach dem Sprühen nicht reiben',
            subtitle: 'Lassen Sie den Auftakt sich natürlich entfalten',
            paragraphs: [
              'Das Reiben der Handgelenke erhöht die Reibung und kann die Wahrnehmung der Kopfnoten stören.',
              'Der beste Ablauf ist einfach: aufsprühen und den Duft natürlich trocknen lassen.',
            ],
          },
          {
            title: 'Platzierung schlägt Menge',
            subtitle: 'Sprühstrategie statt mehr Sprühstöße',
            paragraphs: [
              'Die doppelte Anzahl an Sprühstößen verdoppelt selten die Haltbarkeit und erhöht oft nur die Intensität.',
              'Strategische Platzierung liefert meist eine sauberere Projektion und mehr Komfort als Übersprühen.',
            ],
          },
        ],
      },
      'testing-selection': {
        title: 'Testen und Auswahl',
        description: 'Ein praxisnaher Rahmen, um Düfte zu testen und mit Zuversicht zu kaufen.',
        intro: 'Bewerten Sie methodisch, um Impulskäufe und Sammlerfrust zu vermeiden.',
        articles: [
          {
            title: 'Wie man einen Duft testet',
            subtitle: 'Bewerten Sie die gesamte Entwicklung',
            paragraphs: [
              'Beurteilen Sie einen Duft nicht nur in den ersten Minuten; viele Formeln verändern sich im Verlauf des Tragens erheblich.',
              'Testen Sie nach Möglichkeit einen ganzen Tag, bevor Sie kaufen.',
            ],
            bullets: [
              'Auftakt: 0-15 Minuten',
              'Herz: 30-120 Minuten',
              'Drydown: 3-8 Stunden',
            ],
          },
          {
            title: 'Teststreifen vs. Haut',
            subtitle: 'Zwei Werkzeuge, zwei Zwecke',
            paragraphs: [
              'Nutzen Sie Teststreifen für den schnellen Vergleich und die erste Orientierung.',
              'Nutzen Sie den Hauttest für Haltbarkeit, Projektion und das Zusammenspiel mit Ihrer Hautchemie.',
              'Treffen Sie nie eine endgültige Kaufentscheidung allein auf Basis des Teststreifens.',
            ],
          },
          {
            title: 'Erst Probe, dann Flakon',
            subtitle: 'Risiko senken, Trefferquote erhöhen',
            paragraphs: [
              'Abfüllungen und Proben zeigen das reale Trageverhalten besser als Eindrücke im Geschäft.',
              'Ein strukturierter „Probe zuerst“-Prozess reduziert teure Blindkauf-Fehler.',
            ],
          },
          {
            title: 'Kein universell bestes Parfum',
            subtitle: 'Der beste Duft ist persönlich',
            paragraphs: [
              'Persönliche Vorlieben, Klima, Lebensstil und emotionale Assoziationen entscheiden mehr über den Erfolg eines Dufts als Hype oder Ranglisten.',
              'Das Ziel ist nicht die höchste Bewertung. Das Ziel ist die beste Passung zu Ihrer eigenen olfaktorischen DNA.',
            ],
          },
        ],
      },
      'performance-science': {
        title: 'Leistungswissenschaft',
        description: 'Verstehen Sie Projektion, Haltbarkeit, Wahrnehmungsgrenzen und saisonales Verhalten.',
        intro: 'Trennen Sie Mythen von messbarem Verhalten, wenn Sie die Leistung eines Dufts beurteilen.',
        articles: [
          {
            title: 'Projektion vs. Haltbarkeit',
            subtitle: 'Verschiedene Messgrößen, verschiedene Bedeutungen',
            paragraphs: [
              'Projektion beschreibt die Ausstrahlungsdistanz von der Haut, während Haltbarkeit die gesamte wahrnehmbare Dauer erfasst.',
              'Ein Duft kann stark projizieren und schnell verfliegen, lange halten bei geringer Projektion – oder in beiden Dimensionen überzeugen.',
            ],
          },
          {
            title: 'Warum Sie Ihren eigenen Duft nicht mehr riechen',
            subtitle: 'Olfaktorische Ermüdung erklärt',
            paragraphs: [
              'Bei dauerhafter Exposition filtert das Gehirn vertraute Duftsignale heraus.',
              'Dass Sie einen Duft nicht mehr wahrnehmen, heißt nicht, dass er verflogen ist. Andere können ihn weiterhin deutlich riechen.',
            ],
          },
          {
            title: 'Saisonale Leistungsschwankungen',
            subtitle: 'Die Temperatur verändert alles',
            paragraphs: [
              'Wärme verstärkt oft Projektion und Strahlkraft, während Kälte die Projektion dämpfen und dichte Noten betonen kann.',
              'Derselbe Duft kann sich im Sommer und im Winter völlig unterschiedlich anfühlen.',
            ],
          },
          {
            title: 'Warum Düfte bei jedem anders riechen',
            subtitle: 'Hautchemie und Umgebung',
            paragraphs: [
              'Hydration, Hauttemperatur, Klima und natürliche Hautöle beeinflussen sowohl die Wahrnehmung als auch die Leistung.',
              'Der Test auf der eigenen Haut ist immer verlässlicher, als sich nur auf Rezensionen zu stützen.',
            ],
          },
        ],
      },
      'formula-evolution': {
        title: 'Formel-Evolution',
        description: 'Wie sich Düfte im Laufe der Zeit durch Alterung, Reformulierung und Produktionsvariablen verändern.',
        intro: 'Verstehen Sie, warum zwei Flakons sich unterscheiden können und wie Sie langfristig Qualität bewahren.',
        articles: [
          {
            title: 'Warum Düfte reformuliert werden',
            subtitle: 'Warum sich Favoriten manchmal verändern',
            paragraphs: [
              'Reformulierungen erfolgen aus regulatorischen, sicherheitsbezogenen, beschaffungs-, kosten- und strategiebedingten Gründen.',
              'Manche Änderungen sind subtil, andere können die Identität deutlich verändern.',
            ],
            bullets: [
              'Beschränkungen von Inhaltsstoffen',
              'Sicherheitsvorschriften',
              'Lieferengpässe',
              'Veränderte Materialkosten',
              'Neue Markenstrategien',
            ],
          },
          {
            title: 'Chargenvariation',
            subtitle: 'Warum Flakons leicht voneinander abweichen können',
            paragraphs: [
              'Kleine Chargenunterschiede können durch Materialschwankungen, Lieferantenwechsel und Produktionsanpassungen entstehen.',
              'Die meisten Unterschiede sind gering und fallen vor allem im direkten Seite-an-Seite-Vergleich auf.',
            ],
          },
          {
            title: 'Mazeration und Flakon-Alterung',
            subtitle: 'Subtile Veränderungen über die Zeit',
            paragraphs: [
              'Nach dem Öffnen können Sauerstoff und Zeit manche Kompositionen abrunden, dramatische Veränderungen sind jedoch selten.',
              'Richtige Lagerung zählt in der Regel mehr als absichtliche Mazerationsversuche.',
            ],
          },
          {
            title: 'Parfums richtig lagern',
            subtitle: 'Schützen Sie Ihre Sammlung',
            paragraphs: [
              'Hitze, Licht, Feuchtigkeit und übermäßiger Luftkontakt beschleunigen den Verfall.',
              'Lagern Sie Flakons an kühlen, trockenen, dunklen Orten mit stabilen Temperaturen.',
              'Schubladen, Schränke und Vitrinen sind in der Regel sicherer als Badezimmer.',
            ],
          },
          {
            title: 'Warum Vintage-Flakons anders riechen',
            subtitle: 'Eine Momentaufnahme einer anderen Ära',
            paragraphs: [
              'Vintage-Flakons können sich aufgrund historischer Formeln, Inhaltsstoffbeschränkungen und der Entwicklung der Materialien unterscheiden.',
              'Sie offenbaren oft Stile, die in modernen Veröffentlichungen seltener geworden sind.',
            ],
          },
        ],
      },
      'market-reality': {
        title: 'Markt-Realitätscheck',
        description: 'Durchschauen Sie Marketing-Annahmen und bewerten Sie Qualität mit besseren Kriterien.',
        intro: 'Konzentrieren Sie sich auf Kompositionsqualität und persönliche Passung statt auf Etiketten, Hype und Preisschilder.',
        articles: [
          {
            title: 'Preis vs. Qualität',
            subtitle: 'Teuer heißt nicht automatisch besser',
            paragraphs: [
              'Der Preis kann Markenimage, Verpackung, Seltenheit und Positionierung ebenso widerspiegeln wie olfaktorische Qualität.',
              'Viele erschwingliche Düfte übertreffen teure in Vielseitigkeit, Tragefreude und persönlicher Passung.',
            ],
          },
          {
            title: 'Nische vs. Designer',
            subtitle: 'Qualität gibt es in beiden Welten',
            paragraphs: [
              'Nische und Designer sind Geschäftskategorien, keine garantierten Qualitätsstufen.',
              'In jeder Kategorie gibt es hervorragende Düfte – und vergessliche.',
              'Beurteilen Sie den Duft selbst, nicht die Etikettenfamilie.',
            ],
          },
          {
            title: 'Lautstärke ist nicht Qualität',
            subtitle: 'Starke Projektion ist nur eine Messgröße',
            paragraphs: [
              'Hohe Projektion kann nützlich sein, doch Qualität hängt auch von Balance, Kreativität, Struktur und Entwicklung ab.',
              'Einige der angesehensten Düfte sind eher intim als laut.',
            ],
          },
          {
            title: 'Komplexität ist nicht die Notenanzahl',
            subtitle: 'Struktur zählt mehr als lange Listen',
            paragraphs: [
              'Eine lange Notenliste garantiert keine Tiefe.',
              'Echte Komplexität entsteht durch geschichtete Akkorde, Kontraste, Übergänge und Entwicklung über die Zeit.',
            ],
          },
          {
            title: 'Gender-Etiketten sind Marketing',
            subtitle: 'Tragen Sie, was Ihnen gefällt',
            paragraphs: [
              'Die meisten Kernnoten erscheinen sowohl in sogenannten maskulinen als auch femininen Veröffentlichungen.',
              'Ihr persönlicher Geschmack ist nützlicher als Zielgruppen-Etiketten auf der Verpackung.',
            ],
          },
        ],
      },
    },
  },
  perfumers: {
    directory: {
      eyebrow: 'TOP Parfümeure', count: (shown, total) => `${shown} von ${total} Parfümeuren`,
      intro: 'Entdecken Sie die Menschen hinter besonderen Düften, ihre kreativen Ansätze und prägenden Kreationen.',
      search: 'Parfümeur suchen', placeholder: 'Name des Parfümeurs', topCreations: 'Top-Kreationen',
      all: 'Alle Parfümeure', sort: 'Sortieren nach', name: 'Name', view: 'Profil ansehen',
      portrait: (name) => `Porträt des Parfümeurs ${name}`, photoSource: 'Bildquelle', portraitUnavailable: 'Porträt nicht verfügbar',
      veryHigh: 'Sehr häufig vertretener Kreativer', high: 'Häufig vertretener Kreativer', recurrent: 'Wiederkehrender Kreativer',
      creations: 'Kreationen in den besten 33 %', examples: 'Katalogbeispiele', empty: 'Keine Parfümeure entsprechen dieser Suche.',
      profileRank: (rank) => `Parfümeurprofil · Rang ${rank}`, biographySource: 'Quelle für Biografie und Informationen', credited: 'Zugeordnete Düfte',
      examplesNote: 'Beispiele aus dem Katalog; jeder Mitgestalter wird je eigenständigem Duft einmal gezählt.',
      methodTitle: 'So funktioniert die Einordnung', method: 'OlfactiveDNA-Methode',
      classification: 'Einordnung', classificationNote: 'Kreative werden nach der Zahl eigenständiger zugeordneter Düfte in den besten 33 % des Plattformwerts geordnet.',
      formula: 'Berechnungsformel', formulaNote: '80 % Community-Bewertung, mit einem 50-Stimmen-Prior zum Median der jeweiligen Community angepasst, plus 20 % Beliebtheitsperzentil innerhalb derselben Community.',
      sample: 'Stichprobe und Schwelle', sampleNote: (scored, cutoff, included) => `${scored} Düfte hatten einen Wert. Die besten 33 % werden aufgerundet und alle Gleichstände an der Schwelle ${cutoff} einbezogen: ${included} Düfte.`,
      credits: 'Nennung der Parfümeure', bands: 'Häufigkeitsstufen',
      bandsNote: '15–24 Kreationen: wiederkehrend · 25–49: hoch · 50+: sehr hoch. Redaktionelle Stufen, keine Auszeichnungen für das Lebenswerk.',
      rankingNote: (rank, count) => `Rang #${rank} unter den vorgestellten Kreativen; Gleichstände teilen den Rang. ${count} zugeordnete Kreationen.`,
      snapshot: (date) => `Katalog-Momentaufnahme: ${date}. Die Zahlen sind nicht live und stehen weder für das gesamte Lebenswerk noch für Ihre DNA-Übereinstimmung.`,
    },
    kicker: 'Parfumschöpfer',
    title: 'Parfümeure und kreative DNA',
    intro: 'Entdecken Sie die Signaturstile der Schöpfer und ihre Parfümerie-Philosophien.',
    iconicFragrances: 'Ikonische Düfte',
    clusters: {
      'FRESH ARCHITECTS': 'ARCHITEKTEN DER FRISCHE',
      'ORIENTAL SCULPTORS': 'ORIENTALISCHE BILDHAUER',
      'FLORAL ARTISTS': 'FLORALE KÜNSTLER',
      'MODERN MOLECULAR DESIGNERS': 'MODERNE MOLEKULAR-DESIGNER',
      'HERITAGE HOUSES': 'TRADITIONSHÄUSER',
    },
    profiles: {
      'Jean-Claude Ellena': {
        style: 'Minimalistische Transparenz, luftige Zitrus-Kompositionen',
        philosophy: 'Weniger ist mehr',
      },
      'Francis Kurkdjian': {
        style: 'Moderner Luxus, starke Identitätssignaturen',
        philosophy: 'Wiedererkennbarkeit durch Kontrast',
      },
      'Olivier Creed': {
        style: 'Frischer aristokratischer Luxus',
        philosophy: 'Natur plus Erbe',
      },
      'Alberto Morillas': {
        style: 'Saubere moderne Frische',
        philosophy: 'Perfekte Schlichtheit',
      },
      'Dominique Ropion': {
        style: 'Dichte, sinnliche florale Strukturen',
        philosophy: 'Kompositionen mit starkem Rückgrat',
      },
      'Thierry Wasser': {
        style: 'Die warme Eleganz von Guerlain',
        philosophy: 'Zeitlose französische Parfümerie',
      },
      'Pierre Montale': {
        style: 'Kühne, orientalisch geprägte Kompositionen mit intensiver Projektion',
        philosophy: '„Mehr ist mehr“ bei der Intensität der Rohstoffe',
      },
      'Roja Dove': {
        style: 'Britische Ultra-Luxus-Parfümerie, äußerst opulente Kreationen',
        philosophy: 'Absolute Raffinesse und Überfluss in Harmonie',
      },
      'Serge Lutens': {
        style: 'Künstlerische, dunkle, unkonventionelle Kompositionen',
        philosophy: 'Parfum als Erzählung und Emotion',
      },
      'Kilian Hennessy': {
        style: 'Sinnlicher Luxus, vom Nachtleben inspirierte Kompositionen',
        philosophy: 'Seien Sie nicht schüchtern, seien Sie süchtig machend',
      },
      'David Le Goff': {
        style: 'Moderne aquatisch-mineralische Frische',
        philosophy: 'Klare moderne Eleganz mit luftiger Transparenz',
      },
      Houbigant: {
        style: 'Historische französische Parfümerie mit modernen Neuinterpretationen, eleganten Floralnoten und raffinierten holzigen Strukturen',
        philosophy: 'Tradition, veredelt durch modernes Handwerk',
      },
    },
  },
};

export default articles;
