import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";
import { useAuth } from "../src/lib/auth-context";

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function SugerirPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [targetType, setTargetType] = useState<"clinica" | "profissional">("clinica");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [insurances, setInsurances] = useState("");
  const [observations, setObservations] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      void router.push(`/login?from=${encodeURIComponent("/sugerir")}`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest("/clinic-suggestions", {
        method: "POST",
        body: JSON.stringify({
          targetType,
          name: name.trim(),
          city: city.trim(),
          neighborhood: neighborhood.trim() || undefined,
          addressLine: addressLine.trim() || undefined,
          phone: phone.trim() || undefined,
          whatsappPhone: whatsappPhone.trim() || undefined,
          specialtyNames: parseList(specialties),
          insuranceNames: parseList(insurances),
          observations: observations.trim() || undefined
        })
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SiteLayout title="Sugestão enviada">
        <div className="container" style={{ paddingTop: 40, maxWidth: 560 }}>
          <h1 style={{ fontSize: 24 }}>Obrigado!</h1>
          <p className="muted">Sua sugestão foi registrada. A equipe pode analisá-la em breve.</p>
          <Link href="/clinicas" style={{ fontWeight: 600 }}>
            Voltar à busca
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout title="Sugerir clínica" description="Indique uma clínica ou profissional para a comunidade.">
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48, maxWidth: 560 }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Sugerir clínica ou profissional</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Ajude outras famílias: informe dados que ainda não estão no OndeAcho. É necessário estar logado.
        </p>

        {!token ? (
          <p>
            <Link href={`/login?from=${encodeURIComponent("/sugerir")}`} style={{ fontWeight: 700 }}>
              Entrar para continuar
            </Link>
          </p>
        ) : (
          <form className="card" style={{ padding: 24 }} onSubmit={submit}>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Tipo
              </span>
              <select
                className="text-input"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as "clinica" | "profissional")}
              >
                <option value="clinica">Clínica</option>
                <option value="profissional">Profissional</option>
              </select>
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Nome *
              </span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Cidade *
              </span>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} required minLength={2} />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Bairro
              </span>
              <input className="input" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Endereço
              </span>
              <input className="input" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Telefone
              </span>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                WhatsApp
              </span>
              <input className="input" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Especialidades (separadas por vírgula)
              </span>
              <input
                className="input"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="Ex.: Fonoaudiologia, Psicologia infantil"
              />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Convênios (separados por vírgula)
              </span>
              <input className="input" value={insurances} onChange={(e) => setInsurances(e.target.value)} />
            </label>
            <label style={{ display: "block", marginBottom: 20 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Observações
              </span>
              <textarea
                className="input"
                rows={4}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </label>
            {error ? (
              <p style={{ color: "#b45309", marginBottom: 12 }} role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Enviando…" : "Enviar sugestão"}
            </button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
