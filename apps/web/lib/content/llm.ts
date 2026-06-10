import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { sourcesForTopic, slugify, type SourceRef } from "./sources";

/** Brouillon d'article généré (jamais publié automatiquement). */
export interface ArticleDraft {
  title: string;
  slug: string;
  excerpt: string;
  markdown: string;
  sources: SourceRef[];
}

export interface GenerateInput {
  keyword: string;
  topic: string;
}

/** Port : génération de contenu derrière une interface swappable. */
export interface LLMProvider {
  readonly mode: "mock" | "anthropic";
  generateDraft(input: GenerateInput): Promise<ArticleDraft>;
}

const SYSTEM = `Tu rédiges un GUIDE SEO sobre et factuel pour TropPayé (plateforme française d'aide aux locataires). Registre : calme, précis, "vous" de respect, zéro jargon non expliqué, jamais de promesse de gain.
RÈGLES STRICTES :
- Chaque affirmation juridique chiffrée (montant, délai, plafond) est marquée [AVOCAT] et reste à valider.
- Cite tes sources (liens officiels : legifrance, service-public, anil, insee, ademe).
- Information générale uniquement, jamais de conseil juridique personnalisé.
- Aucune valeur réglementaire présentée comme certaine sans source datée.
Réponds UNIQUEMENT par un objet JSON (aucun texte autour) :
{"title": string, "slug": string (kebab-case), "excerpt": string (<=160 caractères), "markdown": string (corps en Markdown GFM : titres ##, listes), "sources": [{"label": string, "url": string}]}`;

function capitalize(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

class MockLLMProvider implements LLMProvider {
  readonly mode = "mock" as const;

  async generateDraft({ keyword, topic }: GenerateInput): Promise<ArticleDraft> {
    const srcs = sourcesForTopic(topic);
    const title = capitalize(keyword);
    const markdown = [
      "> **Brouillon à valider** — généré automatiquement, non publié en l'état.",
      "",
      `## ${title}`,
      "",
      `Ce guide explique en langage simple ce que dit la loi sur « ${keyword} » et comment vérifier votre situation.`,
      "",
      "## Ce que dit la loi",
      "",
      "Les règles applicables sont fixées par la loi du 6 juillet 1989 et les textes associés. Les valeurs précises (montants, délais, plafonds) doivent être vérifiées à leur source officielle. [AVOCAT]",
      "",
      "## Comment vérifier votre cas",
      "",
      "1. Rassemblez votre bail et vos quittances.",
      "2. Lancez le diagnostic gratuit TropPayé (2 minutes).",
      "3. Recevez une estimation chiffrée, sources à l'appui.",
      "",
      "## Sources",
      "",
      ...srcs.map((s) => `- [${s.label}](${s.url})`),
      "",
      "*Estimation informative à partir de données publiques — ceci n'est pas un conseil juridique.*",
    ].join("\n");

    return {
      title,
      slug: slugify(keyword),
      excerpt: `Ce que dit la loi sur « ${keyword} » et comment vérifier votre loyer en 2 minutes.`,
      markdown,
      sources: srcs,
    };
  }
}

class AnthropicLLMProvider implements LLMProvider {
  readonly mode = "anthropic" as const;
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateDraft({ keyword, topic }: GenerateInput): Promise<ArticleDraft> {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `Mot-clé cible : "${keyword}" (thème : ${topic}). Recherche les sources officielles à jour, puis rédige le guide. Sources prioritaires : ${sourcesForTopic(topic)
          .map((s) => s.url)
          .join(", ")}.`,
      },
    ];

    let response = await this.create(messages);
    let guard = 0;
    while (response.stop_reason === "pause_turn" && guard < 4) {
      guard += 1;
      messages.push({ role: "assistant", content: response.content });
      response = await this.create(messages);
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return parseDraft(text, keyword, topic);
  }

  private create(messages: Anthropic.Messages.MessageParam[]) {
    return this.client.messages.create({
      model: env.CONTENT_MODEL,
      max_tokens: 8000,
      system: SYSTEM,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      tools: [{ type: "web_search_20260209", name: "web_search" }],
      messages,
    });
  }
}

function parseDraft(text: string, keyword: string, topic: string): ArticleDraft {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1)) as Partial<ArticleDraft>;
      if (obj.title && obj.markdown) {
        return {
          title: obj.title,
          slug: obj.slug ? slugify(obj.slug) : slugify(keyword),
          excerpt: obj.excerpt ?? "",
          markdown: obj.markdown,
          sources: Array.isArray(obj.sources) ? obj.sources : sourcesForTopic(topic),
        };
      }
    } catch {
      // fall through to raw wrap
    }
  }
  return {
    title: capitalize(keyword),
    slug: slugify(keyword),
    excerpt: "",
    markdown: text.length > 0 ? text : "(génération vide)",
    sources: sourcesForTopic(topic),
  };
}

/** Mock tant qu'aucune clé Anthropic n'est fournie ; sinon génération réelle. */
export function getLLMProvider(): LLMProvider {
  return env.ANTHROPIC_API_KEY
    ? new AnthropicLLMProvider(env.ANTHROPIC_API_KEY)
    : new MockLLMProvider();
}
