export type TopPerfumerProfile = {
  slug: string;
  name: string;
  portraitUrl: string;
  portraitPosition?: string;
  portraitSourceUrl: string;
  biographySourceUrl: string;
  bio: { ro: string; en: string };
  approach: { ro: string; en: string };
  creations: Array<{ brand: string; name: string }>;
};

/**
 * Editorial profile records for the creators most frequently credited on
 * catalogue perfumes in the top 33% of Olfactive Score. Portraits are real
 * photographs linked to the cited publisher; they are not generated assets.
 */
export const topPerfumerProfiles: TopPerfumerProfile[] = [
  {
    slug: 'alberto-morillas', name: 'Alberto Morillas',
    portraitUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/alberto-morillas/_jcr_content/root/responsivegrid/pscontentmediatext/image.coreimg.png',
    portraitSourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/alberto-morillas.html',
    biographySourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/alberto-morillas.html',
    bio: { ro: 'Născut și crescut în Sevilla, Alberto Morillas este unul dintre creatorii cei mai prezenți în primele 33% ale catalogului nostru după Olfactive Score.', en: 'Born and raised in Seville, Alberto Morillas is one of the most widely credited creators in the top 33% of our catalog by Olfactive Score.' },
    approach: { ro: 'Lucrează pornind de la amintiri senzoriale și ingrediente, combinând tehnici inspirate de natură cu molecule de sinteză.', en: 'His work draws on sensory memories and ingredients, combining techniques inspired by nature with synthetic molecules.' },
    creations: [
      { brand: 'Bvlgari', name: 'Bvlgari Man In Black' }, { brand: 'Giorgio Armani', name: 'Acqua di Gio Parfum' }, { brand: 'Giorgio Armani', name: 'Sensi' }, { brand: 'Giorgio Armani', name: 'Acqua di Gio Essenza' }, { brand: 'Kenzo', name: 'Flower by Kenzo L Elixir' },
    ],
  },
  {
    slug: 'francois-demachy', name: 'François Demachy',
    portraitUrl: 'https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Library-Sites-DiorSharedLibrary/default/dw3083c754/images/beauty/discovery-pages/fragrance/LES-CREATIONS-DE-MONSIEUR-DIOR/fdm_1440_1200.jpg?sfrm=jpg&sw=840',
    portraitSourceUrl: 'https://www.dior.com/en_gb/beauty/discover-les-creations-de-monsieur-dior/discover-les-creations-de-monsieur-dior.html',
    biographySourceUrl: 'https://fragrance.org/honoree/lifetime-achievement-perfumer-6/',
    bio: { ro: 'Originar din Grasse, François Demachy a fost parfumier-creator Dior între 2006 și 2021 și a dezvoltat numeroase creații pentru casa franceză.', en: 'Originally from Grasse, François Demachy served as Dior Perfumer-Creator from 2006 to 2021 and developed numerous creations for the French house.' },
    approach: { ro: 'Pune accent pe calitatea materiilor prime și pe echilibrul dintre ingrediente, păstrând identitatea olfactivă a casei.', en: 'He emphasizes the quality of raw materials and the balance between ingredients while maintaining the house’s olfactory identity.' },
    creations: [
      { brand: 'Dior', name: 'Dior Homme Parfum' }, { brand: 'Dior', name: 'Sauvage Elixir' }, { brand: 'Dior', name: 'Ambre Nuit' }, { brand: 'Dior', name: 'Eau Sauvage Parfum' }, { brand: 'Dior', name: 'Fahrenheit Absolute' },
    ],
  },
  {
    slug: 'anne-flipo', name: 'Anne Flipo',
    portraitUrl: 'https://cdn.shopify.com/s/files/1/0277/3703/0709/files/Anne-flipo_parfumeur.jpg?v=1673349627',
    portraitSourceUrl: 'https://bastilleparfums.com/en/blogs/news/interview-parfumee-a-la-rencontre-de-la-parfumeur-anne-flipo',
    biographySourceUrl: 'https://ir.iff.com/news-releases/news-release-details/iff-recognizes-anne-flipo-master-perfumer-designation',
    bio: { ro: 'Anne Flipo este Master Perfumer și absolventă a școlii ISIPCA. Experiențele din natură, călătorii, artă, muzică și gastronomie îi alimentează curiozitatea creativă.', en: 'Anne Flipo is a Master Perfumer and ISIPCA alumna. Nature, travel, art, music and gastronomy feed her creative curiosity.' },
    approach: { ro: 'Nu urmărește o semnătură fixă: își adaptează paleta și construcția parfumului la povestea fiecărui proiect.', en: 'Rather than following a fixed signature, she adapts her palette and composition to the story of each brief.' },
    creations: [
      { brand: 'Rabanne', name: 'Invictus Victory Elixir' }, { brand: 'Yves Saint Laurent', name: 'L Homme Ultime' }, { brand: 'Yves Saint Laurent', name: 'Libre Le Parfum' }, { brand: 'Rabanne', name: 'Invictus Victory' }, { brand: 'Coach', name: 'Coach for Men' },
    ],
  },
  {
    slug: 'olivier-cresp', name: 'Olivier Cresp',
    portraitUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/olivier-cresp/_jcr_content/root/responsivegrid/pscontentmediatext_23341767/image.coreimg.png',
    portraitSourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/olivier-cresp.html',
    biographySourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/olivier-cresp.html',
    bio: { ro: 'Provenit dintr-o familie cu rădăcini în Grasse, Olivier Cresp este Master Perfumer la dsm-firmenich și mentor pentru noi generații de parfumieri.', en: 'From a family with roots in Grasse, Olivier Cresp is a Master Perfumer at dsm-firmenich and a mentor to new generations of perfumers.' },
    approach: { ro: 'Caută un concept limpede și memorabil, apoi îl construiește printr-o compoziție cu impact și claritate.', en: 'He looks for a clear, memorable concept, then builds it into a composition with impact and clarity.' },
    creations: [
      { brand: 'Yves Saint Laurent', name: 'Black Opium Le Parfum' }, { brand: 'Parfums de Marly', name: 'Sedley' }, { brand: 'Kenzo', name: 'Kenzo Amour' }, { brand: 'Dolce & Gabbana', name: 'Light Blue Eau Intense' }, { brand: 'Montblanc', name: 'Legend Spirit' },
    ],
  },
  {
    slug: 'quentin-bisch', name: 'Quentin Bisch',
    portraitUrl: 'https://www.fragrancefoundation.fr/app/uploads/2020/11/quentin-bisch-givaudan-1024x731.jpg',
    portraitSourceUrl: 'https://www.fragrancefoundation.fr/2020/11/rencontre-avec-quentin-bisch-parfumeur-chez-givaudan/',
    biographySourceUrl: 'https://us.essentialparfums.com/pages/quentin-bisch',
    bio: { ro: 'Înainte de parfumerie, Quentin Bisch a studiat teatrul și artele spectacolului. Parcursul său interdisciplinar se reflectă în concepte cu o narațiune puternică.', en: 'Before perfumery, Quentin Bisch studied theatre and performing arts. His interdisciplinary background informs fragrances built around strong narratives.' },
    approach: { ro: 'Este atras de contraste și de imagini olfactive expresive, inspirate adesea din natură și din schimbarea anotimpurilor.', en: 'He is drawn to contrasts and expressive olfactory imagery, often inspired by nature and the changing seasons.' },
    creations: [
      { brand: 'Jean Paul Gaultier', name: 'Le Male Le Parfum' }, { brand: 'Jean Paul Gaultier', name: 'Le Male Elixir' }, { brand: 'Jean Paul Gaultier', name: 'Le Beau Le Parfum' }, { brand: 'Parfums de Marly', name: 'Carlisle' }, { brand: 'Jean Paul Gaultier', name: 'Le Beau' },
    ],
  },
  {
    slug: 'francis-kurkdjian', name: 'Francis Kurkdjian',
    portraitPosition: '72% 25%',
    portraitUrl: 'https://www.dior.com/on/demandware.static/-/Library-Sites-DiorSharedLibrary/default/dw60bf668a/images/beauty/01-FRAGRANCES/2023/FRANCIS_K/Francis-Kurkdjian_Dior.com_3000x3000_V2.jpg',
    portraitSourceUrl: 'https://www.dior.com/en_sg/beauty/fragrance/dlp-franciskurkdjian.html',
    biographySourceUrl: 'https://www.dior.com/en_sg/beauty/fragrance/dlp-franciskurkdjian.html',
    bio: { ro: 'Francis Kurkdjian a devenit cunoscut la 25 de ani prin crearea parfumului Le Male. A cofondat Maison Francis Kurkdjian în 2009 și este Director of Perfume Creation la Dior din 2021.', en: 'Francis Kurkdjian came to prominence at 25 with the creation of Le Male. He co-founded Maison Francis Kurkdjian in 2009 and became Dior’s Director of Perfume Creation in 2021.' },
    approach: { ro: 'Îmbină compoziția de parfum cu proiecte artistice și instalații olfactive, explorând felul în care mirosul creează emoție și memorie.', en: 'He combines fragrance composition with artistic projects and olfactory installations, exploring how scent creates emotion and memory.' },
    creations: [
      { brand: 'Jean Paul Gaultier', name: 'Ultra Male' }, { brand: 'Maison Francis Kurkdjian', name: 'Grand Soir' }, { brand: 'Dior', name: 'J Adore L Or' }, { brand: 'Maison Francis Kurkdjian', name: 'Gentle Fluidity Gold' }, { brand: 'Maison Francis Kurkdjian', name: 'Gentle Fluidity Silver' },
    ],
  },
  {
    slug: 'dominique-ropion', name: 'Dominique Ropion',
    portraitUrl: 'https://headspaceparfums.com/cdn/shop/files/headspace-parfums-team-dominique-ropion.jpg?v=1738535364&width=1500',
    portraitSourceUrl: 'https://headspaceparfums.com/pages/team',
    biographySourceUrl: 'https://ir.iff.com/news-releases/news-release-details/iff-master-perfumer-dominique-ropion-celebrated-fragrance',
    bio: { ro: 'Dominique Ropion este Master Perfumer IFF. A început cu studii de fizică și experiență într-un laborator de parfum, apoi s-a alăturat IFF în 2000.', en: 'Dominique Ropion is an IFF Master Perfumer. He began with studies in physics and work in a fragrance laboratory before joining IFF in 2000.' },
    approach: { ro: 'Este cunoscut pentru construcții îndrăznețe și pentru măiestria cu care îmbină ingrediente cu personalități diferite; contribuie și la formarea altor creatori.', en: 'He is known for bold structures and for combining ingredients with distinct personalities; he also contributes to the training of other creators.' },
    creations: [
      { brand: 'Yves Saint Laurent', name: 'La Nuit de L Homme Bleu Electrique' }, { brand: 'Yves Saint Laurent', name: 'Y Le Parfum' }, { brand: 'Yves Saint Laurent', name: 'L Homme Ultime' }, { brand: 'Issey Miyake', name: 'Nuit D Issey Noir Argent' }, { brand: 'Dior', name: 'Pure Poison' },
    ],
  },
  {
    slug: 'nathalie-lorson', name: 'Nathalie Lorson',
    portraitUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/nathalie-lorson/_jcr_content/root/responsivegrid/pscontentmediatext/image.coreimg.png',
    portraitSourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/nathalie-lorson.html',
    biographySourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/nathalie-lorson.html',
    bio: { ro: 'Nathalie Lorson este Master Perfumer la dsm-firmenich. Cariera ei cuprinde creații pentru case internaționale și colaborări cu numeroase echipe de design.', en: 'Nathalie Lorson is a Master Perfumer at dsm-firmenich. Her career spans creations for international houses and collaborations with many design teams.' },
    approach: { ro: 'Descrie creația ca pe un schimb de idei și urmărește formule concise, în care fiecare ingredient are un rol recognoscibil.', en: 'She sees creation as an exchange of ideas and favours concise formulas in which every ingredient has a clear role.' },
    creations: [
      { brand: 'Yves Saint Laurent', name: 'Black Opium Le Parfum' }, { brand: 'Montblanc', name: 'Legend Spirit' }, { brand: 'Amouage', name: 'Love Tuberose' }, { brand: 'Yves Saint Laurent', name: 'Black Opium Nuit Blanche' }, { brand: 'Parfums de Marly', name: 'Meliora' },
    ],
  },
  {
    slug: 'jean-claude-ellena', name: 'Jean-Claude Ellena',
    portraitUrl: 'https://www.fredericmalle.com/media/export/cms/perfumers/Perfumers_Landing_page/Jean-Claude_Ellena-Perfumer_LandingPage.jpg',
    portraitSourceUrl: 'https://www.fredericmalle.com/perfumer/jean-claude-ellena',
    biographySourceUrl: 'https://www.fredericmalle.com/perfumer/jean-claude-ellena',
    bio: { ro: 'Născut într-o familie de parfumieri din Grasse, Jean-Claude Ellena este apreciat pentru compozițiile aerisite și limbajul său olfactiv minimalist.', en: 'Born into a perfumer family in Grasse, Jean-Claude Ellena is known for airy compositions and a minimalist olfactory language.' },
    approach: { ro: 'Acordă atenție spațiului dintre ingrediente și expresiei clare a unei singure idei sau materii prime.', en: 'He gives attention to the space between ingredients and to the clear expression of a single idea or raw material.' },
    creations: [
      { brand: 'Hermès', name: 'Terre d Hermes Eau Tres Fraiche' }, { brand: 'Hermès', name: 'Bel Ami Vetiver' }, { brand: 'Hermès', name: 'Un Jardin En Mediterranee' }, { brand: 'Hermès', name: 'Un Jardin Sur Le Nil' }, { brand: 'Hermès', name: 'L Ambre des Merveilles' },
    ],
  },
  {
    slug: 'fabrice-pellegrin', name: 'Fabrice Pellegrin',
    portraitUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/fabrice-pellegrin/_jcr_content/root/responsivegrid/pscontentmediatext/image.coreimg.png',
    portraitSourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/fabrice-pellegrin.html',
    biographySourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/fabrice-pellegrin.html',
    bio: { ro: 'Fabrice Pellegrin provine dintr-o familie de parfumieri din Grasse și este Master Perfumer la dsm-firmenich.', en: 'Fabrice Pellegrin comes from a perfumer family in Grasse and is a Master Perfumer at dsm-firmenich.' },
    approach: { ro: 'Urmărește parcursul ingredientelor de la recoltare la compoziția finală și acordă o atenție specială materiilor prime naturale.', en: 'He follows ingredients from harvest to finished composition and gives particular attention to natural raw materials.' },
    creations: [
      { brand: 'Rabanne', name: 'Black XS L Exces for Him' }, { brand: 'Jean Paul Gaultier', name: 'Scandal Le Parfum' }, { brand: 'Lancôme', name: 'Oud Bouquet' }, { brand: 'Parfums de Marly', name: 'Safanad' }, { brand: 'Jean Paul Gaultier', name: 'So Scandal' },
    ],
  },
  {
    slug: 'bertrand-duchaufour', name: 'Bertrand Duchaufour',
    portraitUrl: 'https://cdn.shopify.com/s/files/1/0564/7420/6391/files/bertrand-duchaufour.png?v=1622233270',
    portraitSourceUrl: 'https://jcbfragrance.com/pages/bertrand-duchaufour',
    biographySourceUrl: 'https://jcbfragrance.com/pages/bertrand-duchaufour',
    bio: { ro: 'Format în Grasse, Bertrand Duchaufour a lucrat ca parfumier independent pentru numeroase case, explorând culturi, locuri și ingrediente din întreaga lume.', en: 'Trained in Grasse, Bertrand Duchaufour has worked as an independent perfumer for many houses, exploring cultures, places and ingredients around the world.' },
    approach: { ro: 'Compozițiile sale se bazează frecvent pe contraste și pe transformarea impresiilor de călătorie în povești olfactive.', en: 'His compositions often rely on contrasts and on turning travel impressions into olfactory stories.' },
    creations: [
      { brand: 'Amouage', name: 'Jubilation XXV Man' }, { brand: 'Penhaligon’s', name: 'Sartorial' }, { brand: 'Amouage', name: 'Dia Man' }, { brand: 'L’Artisan Parfumeur', name: 'Traversee du Bosphore' }, { brand: 'L’Artisan Parfumeur', name: 'Timbuktu' },
    ],
  },
  {
    slug: 'daniela-andrier', name: 'Daniela Andrier',
    portraitUrl: 'https://www.givaudan.com/sites/givaudanweb.int/files/2025-04/giv-daniela-andrier-800x800.webp',
    portraitSourceUrl: 'https://www.givaudan.com/media/media-releases/2025/daniela-andrier-receives-lifetime-achievement-perfumer-award',
    biographySourceUrl: 'https://www.givaudan.com/media/media-releases/2025/daniela-andrier-receives-lifetime-achievement-perfumer-award',
    bio: { ro: 'Daniela Andrier a studiat filosofia la Sorbona înainte de formarea în parfumerie. Este cunoscută pentru colaborarea îndelungată cu Prada și pentru creații cu o identitate distinctă.', en: 'Daniela Andrier studied philosophy at the Sorbonne before training in perfumery. She is known for a long-standing collaboration with Prada and distinctive creations.' },
    approach: { ro: 'Își găsește inspirația în asocieri neașteptate de culori, obiecte și ingrediente rare sau familiare.', en: 'She finds inspiration in unexpected associations of colours, objects and ingredients that may be rare or familiar.' },
    creations: [
      { brand: 'Prada', name: 'Luna Rossa Black' }, { brand: 'Prada', name: 'Luna Rossa Carbon' }, { brand: 'Gucci', name: 'Gucci Eau de Parfum' }, { brand: 'Prada', name: 'Luna Rossa Extreme' }, { brand: 'Kenzo', name: 'Le Monde Est Beau' },
    ],
  },
  {
    slug: 'olivier-polge', name: 'Olivier Polge',
    portraitUrl: 'https://www.fragrancefoundation.fr/app/uploads/2025/09/11-1-1024x1024.jpeg',
    portraitSourceUrl: 'https://www.fragrancefoundation.fr/2025/09/nez-a-nez-avec-olivier-polge/',
    biographySourceUrl: 'https://www.fragrancefoundation.fr/2025/09/nez-a-nez-avec-olivier-polge/',
    bio: { ro: 'Olivier Polge este parfumierul-creator al casei Chanel. Înainte de acest rol, a colaborat cu branduri internaționale și a primit recunoaștere pentru creațiile sale.', en: 'Olivier Polge is Chanel’s in-house perfumer-creator. Before taking the role, he worked with international brands and received recognition for his creations.' },
    approach: { ro: 'Lucrează cu paleta și patrimoniul olfactiv Chanel, păstrând reperele casei și găsind forme contemporane pentru ele.', en: 'He works with Chanel’s olfactory palette and heritage, preserving the house’s signatures while finding contemporary expressions for them.' },
    creations: [
      { brand: 'Dior', name: 'Dior Homme' }, { brand: 'Chanel', name: 'Bleu de Chanel Parfum' }, { brand: 'Viktor&Rolf', name: 'Spicebomb' }, { brand: 'Chanel', name: 'Allure Homme Sport Cologne' }, { brand: 'Chanel', name: 'Paris Venise' },
    ],
  },
  {
    slug: 'christophe-raynaud', name: 'Christophe Raynaud',
    portraitUrl: 'https://images.squarespace-cdn.com/content/v1/633d57596b4dca58ec18a9a7/e8546091-963d-4e45-ae64-8d47004671f9/2.png',
    portraitSourceUrl: 'https://www.fragrancefoundation.org.uk/christophe-raynaud',
    biographySourceUrl: 'https://www.fragrancefoundation.org.uk/christophe-raynaud',
    bio: { ro: 'Christophe Raynaud s-a format la ISIPCA și a lucrat în case de compoziție precum Drom și Symrise; s-a alăturat Givaudan în 2007.', en: 'Christophe Raynaud trained at ISIPCA and worked at fragrance houses including Drom and Symrise before joining Givaudan in 2007.' },
    approach: { ro: 'Construiește parfumuri cu impact și caracter, adaptându-și stilul la universul fiecărui brand și la publicul căruia i se adresează.', en: 'He creates fragrances with impact and character, adapting his style to each brand’s world and intended audience.' },
    creations: [
      { brand: 'Jean Paul Gaultier', name: 'Scandal Pour Homme Le Parfum' }, { brand: 'Carolina Herrera', name: 'CH Men Prive' }, { brand: 'Issey Miyake', name: 'L Eau d Issey Pour Homme Noir Ambre' }, { brand: 'Jean Paul Gaultier', name: 'Scandal Pour Homme' }, { brand: 'Lancôme', name: 'La Nuit Tresor a la Folie' },
    ],
  },
  {
    slug: 'marie-salamagne', name: 'Marie Salamagne',
    portraitUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/marie-salamagne/_jcr_content/root/responsivegrid/pscontentmediatext/image.coreimg.png',
    portraitSourceUrl: 'https://www.dsm-firmenich.com/en/businesses/perfumery-beauty/perfumery/fine-fragrance/people/marie-salamagne.html',
    biographySourceUrl: 'https://our-company.dsm-firmenich.com/en/our-company/news/trade-news/2026/dsm-firmenich-appoints-marie-salamagne-and-frank-voelkl-as-master-perfumers.html',
    bio: { ro: 'Marie Salamagne este Master Perfumer la dsm-firmenich. Observațiile și notițele de călătorie îi oferă un repertoriu bogat de imagini și senzații.', en: 'Marie Salamagne is a Master Perfumer at dsm-firmenich. Observations and travel notes give her a rich store of images and sensations.' },
    approach: { ro: 'Explorează contrastele de culoare și ingrediente pentru a transforma o emoție sau o imagine într-o compoziție recognoscibilă.', en: 'She explores contrasts in colour and ingredients, turning an emotion or image into a recognisable composition.' },
    creations: [
      { brand: 'Giorgio Armani', name: 'Armani Prive Rose d Arabie' }, { brand: 'Yves Saint Laurent', name: 'Black Opium Le Parfum' }, { brand: 'Yves Saint Laurent', name: 'Black Opium Nuit Blanche' }, { brand: 'Yves Saint Laurent', name: 'Black Opium' }, { brand: 'Penhaligon’s', name: 'The Bewitching Yasmine' },
    ],
  },
];

const normalizePerfumerName = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

export function filterPerfumerProfiles<T extends { name: string; topCreations: number; evaluatedCreations: number; rank: number | null }>(query: string, minimum: number, sort: 'count' | 'name', locale: string, profiles: T[]): T[] {
  const normalized = normalizePerfumerName(query);
  return profiles
    .filter((profile) => profile.topCreations >= minimum && normalizePerfumerName(profile.name).includes(normalized))
    .sort((a, b) => sort === 'name'
      ? a.name.localeCompare(b.name, locale)
      : Number(a.rank === null) - Number(b.rank === null)
        || b.topCreations - a.topCreations
        || b.topCreations * a.evaluatedCreations - a.topCreations * b.evaluatedCreations
        || a.name.localeCompare(b.name, locale));
}
