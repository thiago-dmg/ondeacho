import Head from "next/head";
import { Header } from "./Header";

type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export function SiteLayout({ title = "OndeAcho", description, children }: Props) {
  const fullTitle = title === "OndeAcho" ? title : `${title} · OndeAcho`;
  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        {description ? <meta name="description" content={description} /> : null}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <main style={{ minHeight: "60vh" }}>{children}</main>
      <footer style={{ borderTop: "1px solid var(--color-divider)", marginTop: 48, padding: "32px 0" }}>
        <div className="container">
          <p className="muted" style={{ margin: "0 0 12px", fontSize: 14 }}>
            OndeAcho ajuda famílias a encontrar clínicas e profissionais para crianças com TEA e TDAH — fonoaudiologia,
            terapia ocupacional, psicologia infantil, neuropediatria e áreas relacionadas.
          </p>
          <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
            As informações são alimentadas pela própria comunidade (sugestões, avaliações e cadastros colaborativos),
            com moderação quando aplicável. A plataforma não substitui a confirmação direta com cada clínica ou
            convênio.
          </p>
        </div>
      </footer>
    </>
  );
}
