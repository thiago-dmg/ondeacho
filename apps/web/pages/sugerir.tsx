import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "../src/components/SiteLayout";
import { apiRequest } from "../src/lib/api";
import { useAuth } from "../src/lib/auth-context";

const OTHER = "__other__";

type CatalogRow = { id: string; name: string };
type ClinicRow = { id: string; name: string; city: string };

export default function SugerirPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [targetType, setTargetType] = useState<"clinica" | "profissional">("clinica");
  const [name, setName] = useState("");
  const [professionalCrm, setProfessionalCrm] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [observations, setObservations] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<CatalogRow[]>([]);
  const [insurances, setInsurances] = useState<CatalogRow[]>([]);
  const [clinics, setClinics] = useState<ClinicRow[]>([]);

  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([]);
  const [specialtyOtherText, setSpecialtyOtherText] = useState("");
  const [selectedInsuranceIds, setSelectedInsuranceIds] = useState<string[]>([]);
  const [insuranceOtherText, setInsuranceOtherText] = useState("");
  const [linkedClinicValue, setLinkedClinicValue] = useState("");
  const [linkedClinicOtherText, setLinkedClinicOtherText] = useState("");
  const [draftClinicCity, setDraftClinicCity] = useState("");

  const specialtyOtherOn = useMemo(() => selectedSpecialtyIds.includes(OTHER), [selectedSpecialtyIds]);
  const insuranceOtherOn = useMemo(() => selectedInsuranceIds.includes(OTHER), [selectedInsuranceIds]);
  const linkedClinicOtherOn = linkedClinicValue === OTHER;
  const isProf = targetType === "profissional";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const [s, i, rawListings] = await Promise.all([
          apiRequest<unknown[]>("/catalog/specialties", { skipAuth: true }),
          apiRequest<unknown[]>("/catalog/insurances", { skipAuth: true }),
          apiRequest<unknown[]>("/listings", { skipAuth: true })
        ]);
        if (cancelled) return;
        setSpecialties(
          (s as Record<string, unknown>[]).map((row) => ({
            id: String(row.id ?? ""),
            name: String(row.name ?? "")
          }))
        );
        setInsurances(
          (i as Record<string, unknown>[]).map((row) => ({
            id: String(row.id ?? ""),
            name: String(row.name ?? "")
          }))
        );
        setClinics(
          (rawListings as Record<string, unknown>[])
            .filter((row) => row && typeof row === "object")
            .map((row) => ({
              id: String(row.id ?? ""),
              name: String(row.name ?? ""),
              city: String(row.city ?? "")
            }))
        );
      } catch (e) {
        if (!cancelled) {
          setCatalogError(e instanceof Error ? e.message : "Erro ao carregar listas.");
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMulti = (prev: string[], id: string, selected: boolean): string[] => {
    if (selected) {
      return prev.includes(id) ? prev : [...prev, id];
    }
    return prev.filter((x) => x !== id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      void router.push(`/login?from=${encodeURIComponent("/sugerir")}`);
      return;
    }
    setError(null);
    if (specialtyOtherOn && !specialtyOtherText.trim()) {
      setError("Descreva as especialidades em «Outros» ou desmarque a opção.");
      return;
    }
    if (insuranceOtherOn && !insuranceOtherText.trim()) {
      setError("Descreva os convênios em «Outros» ou desmarque a opção.");
      return;
    }
    if (isProf && linkedClinicOtherOn) {
      if (!linkedClinicOtherText.trim()) {
        setError("Indique o nome da clínica.");
        return;
      }
      if (!draftClinicCity.trim()) {
        setError("Indique a cidade da clínica.");
        return;
      }
    }
    if (isProf && !linkedClinicOtherOn && !city.trim()) {
      setError("Indique a cidade.");
      return;
    }

    setSubmitting(true);
    try {
      const specialtyIds = selectedSpecialtyIds.filter((id) => id !== OTHER);
      const insuranceIds = selectedInsuranceIds.filter((id) => id !== OTHER);

      const body: Record<string, unknown> = {
        targetType,
        name: name.trim(),
        city: isProf && linkedClinicOtherOn ? draftClinicCity.trim() : city.trim(),
        specialtyIds,
        insuranceIds
      };

      if (!isProf) {
        body.neighborhood = neighborhood.trim() || undefined;
        body.addressLine = addressLine.trim() || undefined;
        body.phone = phone.trim() || undefined;
        body.whatsappPhone = whatsappPhone.trim() || undefined;
        body.observations = observations.trim() || undefined;
      }

      if (specialtyOtherOn) {
        body.specialtyOther = specialtyOtherText.trim();
      }
      if (insuranceOtherOn) {
        body.insuranceOther = insuranceOtherText.trim();
      }

      if (isProf) {
        body.professionalCrm = professionalCrm.trim() || undefined;
        if (linkedClinicValue && linkedClinicValue !== OTHER) {
          body.linkedClinicId = linkedClinicValue;
        } else if (linkedClinicOtherOn) {
          body.linkedClinicName = linkedClinicOtherText.trim();
        }
      }

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
          {isProf
            ? "Sugestão rápida: só o essencial. Telefone, morada e notas podem ser completados depois pela equipa."
            : "Ajude outras famílias: use as listas do OndeAchoTEA quando possível. É necessário estar logado."}
        </p>

        {!token ? (
          <p>
            <Link href={`/login?from=${encodeURIComponent("/sugerir")}`} style={{ fontWeight: 700 }}>
              Entrar para continuar
            </Link>
          </p>
        ) : (
          <form className="card" style={{ padding: 24 }} onSubmit={submit}>
            {catalogLoading ? <p className="muted">A carregar especialidades, convênios e clínicas…</p> : null}
            {catalogError ? (
              <p style={{ color: "#b45309", marginBottom: 12 }} role="alert">
                {catalogError}
              </p>
            ) : null}

            <label style={{ display: "block", marginBottom: 16 }}>
              <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Tipo
              </span>
              <select
                className="text-input"
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as "clinica" | "profissional");
                  setLinkedClinicValue("");
                  setLinkedClinicOtherText("");
                  setDraftClinicCity("");
                }}
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

            {isProf ? (
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

            {!catalogLoading && !catalogError ? (
              <>
                <fieldset style={{ border: "none", margin: "0 0 16px", padding: 0 }}>
                  <legend className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                    Especialidades
                  </legend>
                  <div
                    className="card"
                    style={{
                      maxHeight: 200,
                      overflowY: "auto",
                      padding: "10px 12px",
                      border: "1px solid var(--color-divider)"
                    }}
                  >
                    {specialties.map((row) => (
                      <label
                        key={row.id}
                        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSpecialtyIds.includes(row.id)}
                          onChange={(e) =>
                            setSelectedSpecialtyIds((prev) => toggleMulti(prev, row.id, e.target.checked))
                          }
                        />
                        <span style={{ fontSize: 14 }}>{row.name}</span>
                      </label>
                    ))}
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={specialtyOtherOn}
                        onChange={(e) =>
                          setSelectedSpecialtyIds((prev) => toggleMulti(prev, OTHER, e.target.checked))
                        }
                      />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Outros…</span>
                    </label>
                  </div>
                  {specialtyOtherOn ? (
                    <label style={{ display: "block", marginTop: 10 }}>
                      <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                        Descreva (pode usar vírgula entre várias)
                      </span>
                      <input
                        className="input"
                        value={specialtyOtherText}
                        onChange={(e) => setSpecialtyOtherText(e.target.value)}
                        placeholder="Ex.: Musicoterapia, ABA"
                        maxLength={500}
                      />
                    </label>
                  ) : null}
                </fieldset>

                <fieldset style={{ border: "none", margin: "0 0 16px", padding: 0 }}>
                  <legend className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                    Convênios
                  </legend>
                  <div
                    className="card"
                    style={{
                      maxHeight: 200,
                      overflowY: "auto",
                      padding: "10px 12px",
                      border: "1px solid var(--color-divider)"
                    }}
                  >
                    {insurances.map((row) => (
                      <label
                        key={row.id}
                        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInsuranceIds.includes(row.id)}
                          onChange={(e) =>
                            setSelectedInsuranceIds((prev) => toggleMulti(prev, row.id, e.target.checked))
                          }
                        />
                        <span style={{ fontSize: 14 }}>{row.name}</span>
                      </label>
                    ))}
                    <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={insuranceOtherOn}
                        onChange={(e) =>
                          setSelectedInsuranceIds((prev) => toggleMulti(prev, OTHER, e.target.checked))
                        }
                      />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Outros…</span>
                    </label>
                  </div>
                  {insuranceOtherOn ? (
                    <label style={{ display: "block", marginTop: 10 }}>
                      <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                        Descreva os convênios
                      </span>
                      <input
                        className="input"
                        value={insuranceOtherText}
                        onChange={(e) => setInsuranceOtherText(e.target.value)}
                        placeholder="Ex.: plano da empresa X"
                        maxLength={500}
                      />
                    </label>
                  ) : null}
                </fieldset>
              </>
            ) : null}

            {isProf && !catalogLoading && !catalogError ? (
              <>
                <label style={{ display: "block", marginBottom: 16 }}>
                  <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                    Clínica onde atende (opcional)
                  </span>
                  <select
                    className="text-input"
                    value={linkedClinicValue}
                    onChange={(e) => {
                      setLinkedClinicValue(e.target.value);
                      if (e.target.value !== OTHER) {
                        setLinkedClinicOtherText("");
                        setDraftClinicCity("");
                      }
                    }}
                  >
                    <option value="">— Não informar —</option>
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.city}
                      </option>
                    ))}
                    <option value={OTHER}>Outros…</option>
                  </select>
                </label>
                {linkedClinicOtherOn ? (
                  <>
                    <label style={{ display: "block", marginBottom: 16 }}>
                      <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                        Nome da clínica *
                      </span>
                      <input
                        className="input"
                        value={linkedClinicOtherText}
                        onChange={(e) => setLinkedClinicOtherText(e.target.value)}
                        placeholder="Nome da clínica ainda não no OndeAchoTEA"
                        maxLength={200}
                      />
                    </label>
                    <label style={{ display: "block", marginBottom: 16 }}>
                      <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                        Cidade da clínica *
                      </span>
                      <input
                        className="input"
                        value={draftClinicCity}
                        onChange={(e) => setDraftClinicCity(e.target.value)}
                        required={linkedClinicOtherOn}
                        minLength={2}
                      />
                    </label>
                  </>
                ) : (
                  <label style={{ display: "block", marginBottom: 16 }}>
                    <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                      Cidade *
                    </span>
                    <input className="input" value={city} onChange={(e) => setCity(e.target.value)} required minLength={2} />
                  </label>
                )}
              </>
            ) : null}

            {!isProf ? (
              <>
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
                <label style={{ display: "block", marginBottom: 16 }}>
                  <span className="muted" style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                    Endereço (opcional)
                  </span>
                  <input
                    className="input"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Rua e número — ajuda no mapa e na busca"
                  />
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
              </>
            ) : null}

            {error ? (
              <p style={{ color: "#b45309", marginBottom: 12 }} role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={submitting || catalogLoading || Boolean(catalogError)}>
              {submitting ? "Enviando…" : "Enviar sugestão"}
            </button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
