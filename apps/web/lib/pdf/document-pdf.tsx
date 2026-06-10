import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { colors } from "@troppaye/shared";

/**
 * Rendu PDF d'un document juridique (mandat / courriers) à partir du markdown d'un template
 * [AVOCAT] déjà interpolé. Mise en page sobre aux couleurs de la charte. Helvetica (police
 * intégrée react-pdf) pour rester léger — pas de chargement de fonte externe.
 */

const styles = StyleSheet.create({
  page: { paddingVertical: 48, paddingHorizontal: 56, fontSize: 11, color: colors.ink, lineHeight: 1.5 },
  brand: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  brandAccent: { color: colors.refund },
  rule: { borderBottomWidth: 1, borderBottomColor: colors.line, marginVertical: 14 },
  h1: { fontSize: 18, fontWeight: 700, marginTop: 6, marginBottom: 10 },
  h2: { fontSize: 13, fontWeight: 700, marginTop: 14, marginBottom: 4 },
  p: { marginBottom: 6 },
  draft: { color: colors.stamp, fontWeight: 700, marginBottom: 8 },
  footer: { position: "absolute", bottom: 28, left: 56, right: 56, fontSize: 8, color: "#8a8a82" },
});

type Block = { type: "h1" | "h2" | "p" | "draft"; text: string };

function parseBlocks(md: string): Block[] {
  return md
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line): Block => {
      const text = line.replace(/\*\*/g, "").replace(/^_|_$/g, "");
      if (line.startsWith("## ")) return { type: "h2", text: text.slice(3) };
      if (line.startsWith("# ")) return { type: "h1", text: text.slice(2) };
      if (line.includes("[AVOCAT]")) return { type: "draft", text };
      return { type: "p", text };
    });
}

function LegalDocument({ blocks }: { blocks: Block[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>
          TropPay<Text style={styles.brandAccent}>é</Text>
        </Text>
        <View style={styles.rule} />
        {blocks.map((b, i) => (
          <Text key={i} style={styles[b.type]}>
            {b.text}
          </Text>
        ))}
        <Text style={styles.footer} fixed>
          Information générale — ceci n'est pas un conseil juridique. Document généré par TropPayé.
        </Text>
      </Page>
    </Document>
  );
}

/** Rend le markdown interpolé d'un template en un PDF (Buffer). Runtime Node uniquement. */
export async function renderLegalPdf(markdown: string): Promise<Buffer> {
  const buf = await renderToBuffer(<LegalDocument blocks={parseBlocks(markdown)} />);
  return buf as Buffer;
}
