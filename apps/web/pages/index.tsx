import Link from "next/link";
import { SiteLayout } from "../src/components/SiteLayout";

export default function HomePage() {
  return (
    <SiteLayout
      description="Encontre clínicas e profissionais para TEA e TDAH: fono, TO, psicologia infantil, neuropediatria e mais."
    >
      <section
        style={{
          background: "linear-gradient(180deg, #ecfdf5 0%, var(--color-bg) 55%)",
          padding: "48px 0 56px"
        }}
      >
        <div className="container">
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 12px"
            }}
          >
            Para famílias
          </p>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.35rem)", maxWidth: 720, margin: "0 0 16px" }}>
            Clínicas de confiança para crianças com{" "}
            <span style={{ color: "var(--color-primary)" }}>TEA</span> e{" "}
            <span style={{ color: "var(--color-primary)" }}>TDAH</span>
          </h1>
          <p className="muted" style={{ fontSize: 17, maxWidth: 640, margin: "0 0 28px", lineHeight: 1.55 }}>
            Fonoaudiologia, terapia ocupacional, psicologia infantil, neuropediatria, psiquiatria infantil e outras
            especialidades — com filtros por cidade, bairro, convênio e área de atuação.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/clinicas" className="btn-primary" style={{ textDecoration: "none" }}>
              Buscar clínicas
            </Link>
            <Link href="/sugerir" className="btn-ghost" style={{ textDecoration: "none" }}>
              Sugerir uma clínica
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "40px 0" }}>
        <div className="container">
          <h2 style={{ fontSize: 22, margin: "0 0 8px" }}>Como funciona</h2>
          <p className="muted" style={{ margin: "0 0 24px", maxWidth: 640 }}>
            Escolha especialidade e convênio, explore a lista e abra a ficha completa com avaliações da comunidade,
            endereço no mapa e formas de contato.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20
            }}
          >
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Filtros pensados para quem busca</h3>
              <p className="muted" style={{ margin: 0 }}>
                Convênios e especialidades alinhadas ao que mães e cuidadores mais procuram no dia a dia.
              </p>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Transparência</h3>
              <p className="muted" style={{ margin: 0 }}>
                Avaliações aprovadas pela moderação e informações de contato para você decidir com calma.
              </p>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Construído pela comunidade</h3>
              <p className="muted" style={{ margin: 0 }}>
                Cadastros, sugestões e experiências vêm de quem usa o serviço no dia a dia. Quanto mais famílias e
                profissionais participam, mais completo fica o mapa — sempre confirme horários e convênios diretamente
                com a clínica.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
