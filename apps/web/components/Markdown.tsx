import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/** Rendu Markdown (GFM) sûr — pas d'exécution de JSX depuis le contenu généré. */
const components: Components = {
  h2: ({ node, ...p }) => (
    <h2 className="mt-10 font-display text-xl font-bold tracking-display" {...p} />
  ),
  h3: ({ node, ...p }) => (
    <h3 className="mt-6 font-display text-lg font-semibold" {...p} />
  ),
  p: ({ node, ...p }) => <p className="mt-4 leading-relaxed text-ink/80" {...p} />,
  ul: ({ node, ...p }) => <ul className="mt-4 list-disc space-y-1 pl-6 text-ink/80" {...p} />,
  ol: ({ node, ...p }) => <ol className="mt-4 list-decimal space-y-1 pl-6 text-ink/80" {...p} />,
  li: ({ node, ...p }) => <li className="leading-relaxed" {...p} />,
  a: ({ node, ...p }) => (
    <a className="text-refund-text underline underline-offset-4" {...p} />
  ),
  blockquote: ({ node, ...p }) => (
    <blockquote className="mt-6 border-l-2 border-stamp bg-paper-2 px-4 py-3 text-ink/75" {...p} />
  ),
  strong: ({ node, ...p }) => <strong className="font-semibold text-ink" {...p} />,
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
