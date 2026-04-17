import Link from "next/link";
import { AdminLayout } from "../src/components/AdminLayout";

export default function HomePage() {
  return (
    <AdminLayout variant="minimal" title="Painel Admin">
      <div className="oa-home-hero">
        <h1>OndeAcho Admin</h1>
        <p>Base para cadastro de clínicas, profissionais, catálogos e moderação de conteúdo da comunidade.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/login" className="oa-btn oa-btn--primary">
            Login administrativo
          </Link>
          <Link href="/dashboard" className="oa-btn oa-btn--secondary">
            Dashboard
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
