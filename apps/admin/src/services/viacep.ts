export type ViaCepResult = {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

function onlyDigits(cep: string): string {
  return cep.replace(/\D/g, "");
}

/** CEP com 8 dígitos; retorna null em erro ou CEP inválido na API. */
export async function fetchViaCep(cepRaw: string): Promise<ViaCepResult | null> {
  const cep = onlyDigits(cepRaw);
  if (cep.length !== 8) {
    return null;
  }
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { method: "GET" });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as Record<string, unknown>;
    if (data.erro === true) {
      return null;
    }
    const logradouro = typeof data.logradouro === "string" ? data.logradouro.trim() : "";
    const bairro = typeof data.bairro === "string" ? data.bairro.trim() : "";
    const localidade = typeof data.localidade === "string" ? data.localidade.trim() : "";
    const uf = typeof data.uf === "string" ? data.uf.trim() : "";
    if (!localidade && !logradouro && !bairro) {
      return null;
    }
    return { logradouro, bairro, localidade, uf };
  } catch {
    return null;
  }
}
