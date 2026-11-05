import type { Dictionary } from '../en';

const articles: Dictionary['articles'] = {
  menu: {
    passionMenu: 'Menú Pasión',
    items: {
      fragrances: { label: 'Perfumes', hint: 'Explora el catálogo de perfumes' },
      needToKnow: { label: 'Lo esencial', hint: 'Conocimientos esenciales del perfume' },
      perfumeCreators: { label: 'Creadores de perfume', hint: 'ADN de los perfumistas y estilos distintivos' },
      scentTerritories: { label: 'Territorios olfativos', hint: 'Explora los mundos olfativos' },
      perfumeHouses: { label: 'TOP Olfactive Houses', hint: 'Descubre casas y perfumes' },
      occasions: { label: 'Ocasiones', hint: 'Un perfume para cada momento' },
    },
  },
  houses: {
    title: 'TOP Olfactive Houses',
    intro: 'Una selección editorial, no una clasificación de popularidad ni un catálogo exhaustivo. Las recomendaciones de compra usan solo este catálogo seleccionado.',
    notice: 'Este catálogo no incluye todos los lanzamientos. Los territorios son sugerencias editoriales, no clasificaciones confirmadas.',
    search: 'Buscar casas', fragranceSearch: 'Buscar en esta casa', searchAction: 'Buscar',
    catalog: 'Perfumes de nuestro catálogo',
    description: 'Descripción editorial',
    editorialDescription: (name, accords) => accords
      ? `Explora el universo olfativo de ${name} a través de los perfumes de nuestro catálogo. Entre los acordes documentados con mayor frecuencia se encuentran ${accords}. Esta visión general ofrece un punto de partida para descubrir la casa, mientras cada composición aporta sus propios matices.`
      : `Explora el universo olfativo de ${name} a través de los perfumes de nuestro catálogo. Descubre las composiciones de abajo y compara sus perfiles disponibles para encontrar tu propio punto de partida en la casa.`,
    website: 'Website',
    source: 'Fuente documental', territories: 'Territorios sugeridos · revisión pendiente',
    evidence: 'Términos de evidencia', method: 'Método', confidence: 'Confianza declarada por la fuente',
    similarity: 'Similitud reportada · no equivalencia', brandClaim: 'Inspiración declarada por la marca',
    pending: 'Similitud en investigación', notes: 'Notas del catálogo (sin estructura; pirámide no verificada)',
    noResults: 'Sin resultados en esta selección.', previous: 'Anterior', next: 'Siguiente', back: 'Todas las casas seleccionadas',
    page: 'Página', art: 'Ilustración editorial original; no es una imagen oficial.', reviewStatus: 'Estado de revisión',
  },
  needToKnow: {
    kicker: 'Lo esencial',
    title: 'Artículos de Lo esencial',
    intro:
      'Explora conocimientos estructurados sobre perfumería por categoría.',
    sectionLabel: 'Sección',
    nowReading: 'Leyendo ahora',
    articleCount: (count) => `${count} artículos`,
    sections: {
      'scent-fundamentals': {
        title: 'Fundamentos olfativos',
        description: 'Principios básicos que explican cómo se estructuran e interpretan los perfumes.',
        intro: 'Construye una base sólida antes de evaluar rendimiento, valor o categoría de marca.',
        articles: [
          {
            title: 'Notas de salida, corazón y fondo',
            subtitle: 'Un perfume es un viaje',
            paragraphs: [
              'La mayoría de los perfumes evolucionan por etapas en lugar de oler igual de principio a fin.',
              'Las notas de salida son la primera impresión: suelen ser luminosas y efímeras.',
              'Las notas de corazón definen el carácter central cuando se desvanece la apertura.',
              'Las notas de fondo aportan profundidad y suelen moldear el aroma duradero sobre la piel.',
            ],
          },
          {
            title: 'Entender las concentraciones',
            subtitle: 'EDT, EDP y Parfum en contexto',
            paragraphs: [
              'La concentración indica la cantidad aproximada de material aromático disuelto en alcohol, pero por sí sola no garantiza el rendimiento.',
              'El diseño de la fórmula, la calidad de los ingredientes, la química de la piel y el clima pueden influir en el rendimiento más que la etiqueta de concentración.',
              'Algunos EDT superan a muchos Parfum según la composición.',
            ],
            bullets: [
              'Eau Fraiche: 1-3 %',
              'Eau de Cologne (EDC): 2-5 %',
              'Eau de Toilette (EDT): 5-15 %',
              'Eau de Parfum (EDP): 15-20 %',
              'Parfum / Extrait: 20-40 %',
            ],
            callout:
              'Mito: una mayor concentración siempre significa mayor rendimiento.\nRealidad: la arquitectura de la fórmula importa más que la etiqueta.',
          },
          {
            title: '¿Qué es un acorde?',
            subtitle: 'Los ladrillos de la composición',
            paragraphs: [
              'Un acorde es una mezcla de materiales que crea una impresión olfativa reconocible, como cuero, ámbar, tabaco o aire marino.',
              'Muchos acordes son ilusiones compositivas y no existen como un único material natural.',
              'Entender los acordes ayuda a explicar por qué las pirámides de notas y la percepción olfativa no siempre coinciden literalmente.',
            ],
          },
          {
            title: 'Ingredientes naturales vs sintéticos',
            subtitle: 'Ambos son esenciales en la perfumería moderna',
            paragraphs: [
              'Los materiales naturales pueden aportar riqueza y textura, mientras que los sintéticos mejoran la consistencia, la estabilidad y el margen creativo.',
              'La mayoría de los perfumes de alta calidad combinan ambos enfoques.',
              'La calidad la determinan la creatividad y el equilibrio de la fórmula, no una simple proporción entre natural y sintético.',
            ],
          },
        ],
      },
      'application-technique': {
        title: 'Técnica de aplicación',
        description: 'Cómo aplicar el perfume correctamente para una proyección elegante y un uso más consistente.',
        intro: 'Aplica estas prácticas para mejorar el comportamiento del aroma sin excederte con las pulverizaciones.',
        articles: [
          {
            title: 'Cómo aplicar bien el perfume',
            subtitle: 'Menos suele ser más',
            paragraphs: [
              'Aplícalo en puntos de pulso como el cuello, el pecho y las muñecas, para que el calor corporal ayude a la difusión durante el día.',
              'Busca una estela que invite a descubrirla, no saturar la habitación.',
            ],
            bullets: [
              'Perfumes frescos: 4-6 pulverizaciones',
              'Perfumes versátiles: 3-5 pulverizaciones',
              'Perfumes potentes: 2-4 pulverizaciones',
            ],
          },
          {
            title: 'No frotes después de pulverizar',
            subtitle: 'Deja que la salida se desarrolle con naturalidad',
            paragraphs: [
              'Frotar las muñecas aumenta la fricción y puede alterar la percepción de las notas de salida.',
              'El mejor método es sencillo: pulveriza y deja que el perfume se seque de forma natural.',
            ],
          },
          {
            title: 'La colocación gana a la cantidad',
            subtitle: 'Estrategia antes que más pulverizaciones',
            paragraphs: [
              'Duplicar las pulverizaciones rara vez duplica la duración y a menudo solo aumenta la intensidad.',
              'Una colocación estratégica suele ofrecer una proyección más limpia y mayor comodidad que el exceso de producto.',
            ],
          },
        ],
      },
      'testing-selection': {
        title: 'Prueba y selección',
        description: 'Un marco práctico para probar perfumes y comprar con confianza.',
        intro: 'Evalúa con método para evitar compras impulsivas y arrepentimientos de coleccionista.',
        articles: [
          {
            title: 'Cómo probar un perfume',
            subtitle: 'Evalúa la evolución completa',
            paragraphs: [
              'No juzgues un perfume solo por los primeros minutos; muchas fórmulas se transforman notablemente a lo largo del uso.',
              'Siempre que puedas, pruébalo un día entero antes de comprar.',
            ],
            bullets: [
              'Salida: 0-15 minutos',
              'Corazón: 30-120 minutos',
              'Fondo: 3-8 horas',
            ],
          },
          {
            title: 'Tira de papel vs piel',
            subtitle: 'Dos herramientas, dos propósitos',
            paragraphs: [
              'Usa las tiras de prueba para comparar rápido y orientarte al principio.',
              'Usa la prueba en piel para valorar duración, proyección e interacción con tu química.',
              'Nunca tomes la decisión final de compra basándote solo en la tira.',
            ],
          },
          {
            title: 'Muestra antes que frasco completo',
            subtitle: 'Reduce el riesgo y mejora tu tasa de acierto',
            paragraphs: [
              'Los decants y las muestras revelan el comportamiento real en el día a día mejor que las impresiones en tienda.',
              'Un proceso estructurado de «muestra primero» reduce los errores caros de compra a ciegas.',
            ],
          },
          {
            title: 'No existe el mejor perfume universal',
            subtitle: 'El mejor perfume es personal',
            paragraphs: [
              'Las preferencias personales, el clima, el estilo de vida y las asociaciones emocionales determinan el éxito de un perfume más que el hype o los rankings.',
              'El objetivo no es la nota más alta. El objetivo es el mejor ajuste con tu propio ADN olfativo.',
            ],
          },
        ],
      },
      'performance-science': {
        title: 'Ciencia del rendimiento',
        description: 'Comprende la proyección, la duración, los límites de la percepción y el comportamiento estacional.',
        intro: 'Separa los mitos del comportamiento medible al juzgar cómo rinde un perfume.',
        articles: [
          {
            title: 'Proyección vs duración',
            subtitle: 'Métricas distintas, significados distintos',
            paragraphs: [
              'La proyección describe la distancia a la que irradia desde la piel, mientras que la duración mide el tiempo total en que resulta perceptible.',
              'Un perfume puede proyectar mucho y desvanecerse pronto, durar mucho con poca proyección, o destacar en ambas dimensiones.',
            ],
          },
          {
            title: 'Por qué dejas de oler tu propio perfume',
            subtitle: 'La fatiga olfativa explicada',
            paragraphs: [
              'La exposición continua hace que el cerebro filtre las señales olfativas familiares.',
              'No notar un perfume no demuestra que haya desaparecido. Los demás pueden seguir percibiéndolo con claridad.',
            ],
          },
          {
            title: 'Cambios de rendimiento por estación',
            subtitle: 'La temperatura lo cambia todo',
            paragraphs: [
              'El calor suele amplificar la proyección y la luminosidad, mientras que el frío puede suavizar la proyección y acentuar las notas densas.',
              'El mismo perfume puede sentirse completamente distinto en verano que en invierno.',
            ],
          },
          {
            title: 'Por qué los perfumes huelen distinto en cada persona',
            subtitle: 'Química de la piel y entorno',
            paragraphs: [
              'La hidratación, la temperatura de la piel, el clima y los aceites naturales influyen tanto en la percepción como en el rendimiento.',
              'Probar en tu propia piel siempre es más fiable que confiar solo en las reseñas.',
            ],
          },
        ],
      },
      'formula-evolution': {
        title: 'Evolución de las fórmulas',
        description: 'Cómo cambian los perfumes con el tiempo: envejecimiento, reformulación y variables de producción.',
        intro: 'Entiende por qué dos frascos pueden diferir y cómo proteger la calidad a largo plazo.',
        articles: [
          {
            title: 'Por qué se reformulan los perfumes',
            subtitle: 'Por qué tus favoritos a veces cambian',
            paragraphs: [
              'Las reformulaciones responden a motivos regulatorios, de seguridad, de abastecimiento, de costes y de estrategia.',
              'Algunos cambios son sutiles, mientras que otros pueden alterar la identidad de forma significativa.',
            ],
            bullets: [
              'Restricciones de ingredientes',
              'Normativas de seguridad',
              'Escasez de suministros',
              'Cambios en el coste de materiales',
              'Cambios de estrategia de marca',
            ],
          },
          {
            title: 'Variación entre lotes',
            subtitle: 'Por qué los frascos pueden diferir ligeramente',
            paragraphs: [
              'Las pequeñas diferencias entre lotes pueden deberse a la variabilidad de materiales, cambios de proveedor y ajustes de producción.',
              'La mayoría de las diferencias son mínimas y solo se hacen evidentes en una comparación directa, lado a lado.',
            ],
          },
          {
            title: 'Maceración y envejecimiento en frasco',
            subtitle: 'Cambios sutiles con el tiempo',
            paragraphs: [
              'Tras abrirlo, el oxígeno y el tiempo pueden suavizar algunas composiciones, aunque los cambios drásticos son poco comunes.',
              'Unas buenas prácticas de conservación suelen importar más que los intentos deliberados de maceración.',
            ],
          },
          {
            title: 'Cómo guardar los perfumes correctamente',
            subtitle: 'Protege tu colección',
            paragraphs: [
              'El calor, la luz, la humedad y la exposición excesiva al aire aceleran la degradación.',
              'Guarda los frascos en lugares frescos, secos y oscuros, con temperatura estable.',
              'Los cajones, armarios y vitrinas suelen ser más seguros que los cuartos de baño.',
            ],
          },
          {
            title: 'Por qué los frascos vintage huelen distinto',
            subtitle: 'Una instantánea de otra época',
            paragraphs: [
              'Los frascos vintage pueden diferir por sus fórmulas históricas, las restricciones de ingredientes y la evolución de los materiales.',
              'A menudo revelan estilos menos comunes en los lanzamientos modernos.',
            ],
          },
        ],
      },
      'market-reality': {
        title: 'Realidad del mercado',
        description: 'Supera las suposiciones del marketing y evalúa la calidad con mejores criterios.',
        intro: 'Céntrate en la calidad de la composición y en el ajuste personal, no en etiquetas, hype ni precios.',
        articles: [
          {
            title: 'Precio vs calidad',
            subtitle: 'Caro no significa automáticamente mejor',
            paragraphs: [
              'El precio puede reflejar la marca, el envase, la rareza y el posicionamiento tanto como la calidad olfativa.',
              'Muchos perfumes asequibles superan a los caros en versatilidad, disfrute y ajuste personal.',
            ],
          },
          {
            title: 'Nicho vs diseñador',
            subtitle: 'La calidad existe en ambos mundos',
            paragraphs: [
              'Nicho y diseñador son categorías comerciales, no garantías de calidad.',
              'En cada categoría hay perfumes excelentes y otros olvidables.',
              'Juzga el perfume en sí, no la familia de la etiqueta.',
            ],
          },
          {
            title: 'La potencia no es calidad',
            subtitle: 'Una proyección fuerte es solo una métrica',
            paragraphs: [
              'Una proyección alta puede ser útil, pero la calidad también depende del equilibrio, la creatividad, la estructura y la evolución.',
              'Algunos de los perfumes más respetados son íntimos en lugar de estridentes.',
            ],
          },
          {
            title: 'La complejidad no es el número de notas',
            subtitle: 'La estructura importa más que las listas largas',
            paragraphs: [
              'Una lista larga de notas no garantiza profundidad.',
              'La verdadera complejidad nace de acordes en capas, contrastes, transiciones y desarrollo en el tiempo.',
            ],
          },
          {
            title: 'Las etiquetas de género son marketing',
            subtitle: 'Usa lo que disfrutes',
            paragraphs: [
              'La mayoría de las notas esenciales aparecen tanto en lanzamientos llamados masculinos como femeninos.',
              'Tu gusto personal es más útil que las etiquetas de público en la caja.',
            ],
          },
        ],
      },
    },
  },
  perfumers: {
    directory: {
      eyebrow: 'Directorio de creadores', count: (shown, total) => `${shown} de ${total} perfumistas`,
      intro: 'Descubre a las personas detrás de perfumes extraordinarios, sus enfoques creativos y sus creaciones emblemáticas.',
      search: 'Buscar perfumista', placeholder: 'Nombre del perfumista', topCreations: 'Creaciones destacadas',
      all: 'Todos los perfumistas', sort: 'Ordenar por', name: 'Nombre', view: 'Ver perfil',
      portrait: (name) => `Retrato del perfumista ${name}`, photoSource: 'Fuente de la foto', portraitUnavailable: 'Retrato no disponible',
      veryHigh: 'Creador muy recurrente', high: 'Creador de alta recurrencia', recurrent: 'Creador recurrente',
      creations: 'Creaciones en el 33 % superior', examples: 'Ejemplos del catálogo', empty: 'Ningún perfumista coincide con esta búsqueda.',
      profileRank: (rank) => `Perfil de perfumista · puesto ${rank}`, biographySource: 'Fuente biográfica y documental', credited: 'Perfumes acreditados',
      examplesNote: 'Ejemplos del catálogo; cada cocreador se cuenta una vez por perfume distinto.',
      methodTitle: 'Cómo funciona la clasificación', method: 'Método OlfactiveDNA',
      classification: 'Clasificación', classificationNote: 'Los creadores se ordenan por el número de perfumes distintos acreditados en el 33 % superior de la puntuación.',
      formula: 'Fórmula de puntuación', formulaNote: '80 % valoración comunitaria ajustada con un prior de 50 votos hacia la mediana de la comunidad de origen, más 20 % percentil de popularidad dentro de esa comunidad.',
      sample: 'Muestra y umbral', sampleNote: (scored, cutoff, included) => `${scored} perfumes tenían puntuación. Tomamos el 33 % superior, redondeado hacia arriba, conservando los empates en el umbral ${cutoff}: ${included} perfumes.`,
      credits: 'Créditos de los perfumistas', bands: 'Niveles de recurrencia',
      bandsNote: '15–24 creaciones: recurrente · 25–49: alta · 50+: muy alta. Categorías editoriales, no premios a toda una carrera.',
      rankingNote: (rank, count) => `Puesto #${rank} entre los creadores presentados; los empates comparten puesto. ${count} creaciones acreditadas.`,
      snapshot: (date) => `Instantánea del catálogo: ${date}. Los recuentos no son en directo ni representan toda la carrera o tu compatibilidad ADN.`,
    },
    kicker: 'Creadores de perfume',
    title: 'Perfumistas y ADN creativo',
    intro: 'Explora los estilos distintivos de los creadores y sus filosofías de perfumería.',
    iconicFragrances: 'Perfumes icónicos',
    clusters: {
      'FRESH ARCHITECTS': 'ARQUITECTOS DE LA FRESCURA',
      'ORIENTAL SCULPTORS': 'ESCULTORES ORIENTALES',
      'FLORAL ARTISTS': 'ARTISTAS FLORALES',
      'MODERN MOLECULAR DESIGNERS': 'DISEÑADORES MOLECULARES MODERNOS',
      'HERITAGE HOUSES': 'CASAS CON HERENCIA',
    },
    profiles: {
      'Jean-Claude Ellena': {
        style: 'Transparencia minimalista, composiciones cítricas etéreas',
        philosophy: 'Menos es más',
      },
      'Francis Kurkdjian': {
        style: 'Lujo moderno, firmas de identidad potentes',
        philosophy: 'Reconocibilidad a través del contraste',
      },
      'Olivier Creed': {
        style: 'Lujo aristocrático y fresco',
        philosophy: 'Naturaleza más herencia',
      },
      'Alberto Morillas': {
        style: 'Frescura moderna y limpia',
        philosophy: 'La simplicidad perfecta',
      },
      'Dominique Ropion': {
        style: 'Estructuras florales densas y sensuales',
        philosophy: 'Composiciones con una columna vertebral sólida',
      },
      'Thierry Wasser': {
        style: 'La elegancia cálida de Guerlain',
        philosophy: 'Perfumería francesa atemporal',
      },
      'Pierre Montale': {
        style: 'Composiciones audaces de corte oriental, proyección intensa',
        philosophy: '«Más es más» en la intensidad de las materias primas',
      },
      'Roja Dove': {
        style: 'Perfumería británica de ultralujo, mezclas extremadamente opulentas',
        philosophy: 'Refinamiento absoluto y exceso en armonía',
      },
      'Serge Lutens': {
        style: 'Composiciones artísticas, oscuras y poco convencionales',
        philosophy: 'El perfume como narración y emoción',
      },
      'Kilian Hennessy': {
        style: 'Lujo sensual, composiciones inspiradas en la vida nocturna',
        philosophy: 'No seas tímido, sé adictivo',
      },
      'David Le Goff': {
        style: 'Frescura acuática y mineral moderna',
        philosophy: 'Elegancia moderna y limpia con transparencia etérea',
      },
      Houbigant: {
        style: 'Perfumería francesa histórica con reinterpretaciones modernas, florales elegantes y estructuras amaderadas refinadas',
        philosophy: 'La tradición refinada por la artesanía moderna',
      },
    },
  },
};

export default articles;
