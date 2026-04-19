import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";
import { useAuth } from "../src/lib/auth-context";

const PROFESSIONAL_ATTENDANCE = {
  at_clinic: "at_clinic",
  own_office: "own_office",
  other_location: "other_location"
} as const;

type ProfessionalAttendance = (typeof PROFESSIONAL_ATTENDANCE)[keyof typeof PROFESSIONAL_ATTENDANCE];

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
  const [professionalAttendance, setProfessionalAttendance] = useState<ProfessionalAttendance>(
    PROFESSIONAL_ATTENDANCE.at_clinic
  );
  const [name, setName] = useState("");
  const [professionalCrm, setProfessionalCrm] = useState("");
  const [linkedClinicName, setLinkedClinicName] = useState("");
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

  const showProfessionalAddress =
    targetType === "profissional" &&
    (professionalAttendance === PROFESSIONAL_ATTENDANCE.own_office ||
      professionalAttendance === PROFESSIONAL_ATTENDANCE.other_location);

  useEffect(() => {
    if (targetType === "clinica") {
      setProfessionalAttendance(PROFESSIONAL_ATTENDANCE.at_clinic);
    }
  }, [targetType]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      void router.push(`/login?from=${encodeURIComponent("/sugerir")}`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const base = {
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
      };

      const body =
        targetType === "profissional"
          ? {
              ...base,
              professionalAttendance,
              linkedClinicName: linkedClinicName.trim() || undefined,
              professionalCrm: professionalCrm.trim() || undefined
            }
          : base;

      await apiRequest("/clinic-suggestions", {
        method: "POST",
        body: JSON.stringify(body)
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

            {targetType === "profissional" ? (
              <label style={{ display: "block", marginBottom: 16 }}>
                <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  CRM ou registro profissional (opcional)
                </span>
                <input
                  className="input"
                  value={professionalCrm}
                  onChange={(e) => setProfessionalCrm(e.target.value)}
                  placeholder="Ex.: CRM-SP 123456"
                  maxLength={80}
                />
              </label>
            ) : null}

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

            {targetType === "profissional" ? (
              <fieldset style={{ border: "none", margin: "0 0 16px", padding: 0 }}>
                <legend className="muted" style={{ fontSize: 13, marginBottom: 8, padding: 0 }}>
                  Onde atende? *
                </legend>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="attendance"
                    checked={professionalAttendance === PROFESSIONAL_ATTENDANCE.at_clinic}
                    onChange={() => setProfessionalAttendance(PROFESSIONAL_ATTENDANCE.at_clinic)}
                  />
                  <span>
                    Em clínica ou consultório de terceiros
                    <span className="muted" style={{ display: "block", fontSize: 12, marginTop: 2 }}>
                      Não pedimos endereço completo do profissional; use o nome da clínica abaixo, se souber.
                    </span>
                  </span>
                </label>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="attendance"
                    checked={professionalAttendance === PROFESSIONAL_ATTENDANCE.own_office}
                    onChange={() => setProfessionalAttendance(PROFESSIONAL_ATTENDANCE.own_office)}
                  />
                  <span>
                    Consultório próprio
                    <span className="muted" style={{ display: "block", fontSize: 12, marginTop: 2 }}>
                      Pode informar endereço completo abaixo (opcional, mas ajuda no mapa).
                    </span>
                  </span>
                </label>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="attendance"
                    checked={professionalAttendance === PROFESSIONAL_ATTENDANCE.other_location}
                    onChange={() => setProfessionalAttendance(PROFESSIONAL_ATTENDANCE.other_location)}
                  />
                  <span>
                    Outro local ou sem vínculo fixo com clínica
                    <span className="muted" style={{ display: "block", fontSize: 12, marginTop: 2 }}>
                      Endereço completo opcional, se quiser indicar onde costuma atender.
                    </span>
                  </span>
                </label>

                {professionalAttendance === PROFESSIONAL_ATTENDANCE.at_clinic ? (
                  <label style={{ display: "block", marginTop: 14 }}>
                    <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                      Nome da clínica ou centro (opcional)
                    </span>
                    <input
                      className="input"
                      value={linkedClinicName}
                      onChange={(e) => setLinkedClinicName(e.target.value)}
                      placeholder="Ex.: Clínica Esperança"
                      maxLength={200}
                    />
                  </label>
                ) : null}
              </fieldset>
            ) : null}

            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Cidade *
              </span>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} required minLength={2} />
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Bairro (opcional)
              </span>
              <input className="input" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            </label>

            {targetType === "clinica" || showProfessionalAddress ? (
              <label style={{ display: "block", marginBottom: 16 }}>
                <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                  {targetType === "clinica" ? "Endereço (rua e número)" : "Endereço completo (opcional)"}
                </span>
                <input
                  className="input"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder={targetType === "clinica" ? "Para localização e busca no mapa" : "Se quiser aparecer no mapa ou facilitar a verificação"}
                />
                {targetType === "clinica" ? (
                  <span className="muted" style={{ display: "block", marginTop: 6, fontSize: 12 }}>
                    Quanto mais completo, melhor para famílias encontrarem o local.
                  </span>
                ) : null}
              </label>
            ) : null}

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
