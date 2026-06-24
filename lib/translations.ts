// Traducciones de los avisos demo (estilo "Ver traducción" de Twitter).
// Demo sin API: traducciones hechas a mano para los posts sembrados. En
// producción esto se reemplaza por una llamada a un traductor (Azure/DeepL/
// Claude) cacheada por contenido+idioma — la UI no cambia.

export type TLang = "pt-BR" | "en";
interface Translated {
  title: string;
  body: string;
}

export const POST_TRANSLATIONS: Record<string, Partial<Record<TLang, Translated>>> = {
  // Puertas abiertas
  "44444444-0000-0000-0000-000000000001": {
    "pt-BR": {
      title: "Jornada de portas abertas — Sábado, 14 de junho",
      body: "Convidamos todas as famílias a conhecer a escola, ver os projetos do ano e compartilhar uma manhã com as equipes docentes. Haverá atividades para os menores no pátio central.",
    },
    en: {
      title: "Open house — Saturday, June 14",
      body: "We invite all families to tour the school, see this year's projects and share a morning with the teaching teams. There will be activities for the little ones in the main courtyard.",
    },
  },
  // Salida al museo
  "44444444-0000-0000-0000-000000000002": {
    "pt-BR": {
      title: "Saída pedagógica ao Museu de Ciências",
      body: "Na próxima quinta-feira visitaremos o Museu de Ciências Naturais. Lembrem-se de enviar a autorização assinada e usar o uniforme de educação física. Saímos às 8:30 em ponto.",
    },
    en: {
      title: "Field trip to the Science Museum",
      body: "Next Thursday we will visit the Natural Sciences Museum. Please remember to send the signed permission slip and wear the PE uniform. We leave at 8:30 sharp.",
    },
  },
  // Feria del libro
  "44444444-0000-0000-0000-000000000003": {
    "pt-BR": {
      title: "Resultados da feira do livro",
      body: "Obrigado a todas as famílias que participaram! Juntos arrecadamos mais de 300 livros para a biblioteca. Compartilhamos os vencedores do concurso de leitura.",
    },
    en: {
      title: "Book fair results",
      body: "Thank you to all the families who joined! Together we collected more than 300 books for the library. Here are the winners of the reading contest.",
    },
  },
  // Ruta 14
  "44444444-0000-0000-0000-000000000004": {
    "pt-BR": {
      title: "Novo trajeto da rota 14",
      body: "A partir de segunda-feira, a rota 14 inclui duas novas paradas no bairro Norte. Vocês podem ver o trajeto atualizado e o horário estimado na seção de Transporte.",
    },
    en: {
      title: "New route 14 itinerary",
      body: "Starting Monday, route 14 adds two new stops in the North neighborhood. You can see the updated route and estimated schedule in the Transport section.",
    },
  },
};

/** Devuelve la traducción del post para el locale, o null si no aplica/no existe. */
export function getTranslation(
  postId: string,
  locale: string,
): Translated | null {
  const lang: TLang | null = locale.startsWith("pt")
    ? "pt-BR"
    : locale.startsWith("en")
      ? "en"
      : null;
  if (!lang) return null;
  return POST_TRANSLATIONS[postId]?.[lang] ?? null;
}
