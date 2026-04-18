import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

type ImportRecord = {
  nome: string;
  tipo: string;
  cidade_origem: string | null;
  especialidades: string[] | null;
  convenios_aceitos?: string[] | null;
  endereco_completo: string | null;
  bairro: string | null;
  telefone: string | null;
  whatsapp: string | null;
  atendimento_particular: string | null;
  nota_media: number | null;
  url_fonte: string | null;
};

type ImportPayload = {
  clinicas_profissionais: ImportRecord[];
};

type ImportedClinic = {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  whatsapp: string | null;
};

/** Compara tipo ignorando acentos (JSON pode vir como "clínica" ou "clinica"). */
function normTipo(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function loadImportPayload(): ImportPayload {
  const importPath = join(__dirname, "import", "clinicas-novas.json");
  const fileContent = readFileSync(importPath, "utf8");
  return JSON.parse(fileContent) as ImportPayload;
}

function normalizeText(value: string | null | undefined, maxLength: number): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function normalizeDigits(value: string | null | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  return digits.slice(-11);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function toCanonicalSpecialtyName(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("fono")) return "Fonoaudiólogo";
  if (normalized.includes("terapia ocupacional")) return "Terapeuta Ocupacional";
  if (normalized.includes("psicopedagog")) return "Psicopedagogo";
  if (normalized.includes("psiquiatr")) return "Psiquiatra Infantil";
  if (normalized.includes("neuro")) return "Neurologista";
  if (normalized.includes("psicolog")) return "Psicólogo";
  return "Clínica multidisciplinar";
}

function toCanonicalInsuranceName(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("amil")) return "Amil";
  if (normalized.includes("bradesco")) return "Bradesco Saúde";
  if (normalized.includes("sul") && normalized.includes("america")) return "SulAmérica";
  if (normalized.includes("unimed")) return "Unimed";
  if (normalized.includes("notredame") || normalized.includes("hapvida")) {
    return "Hapvida NotreDame";
  }
  if (normalized.includes("sus")) return "SUS";
  return normalizeText(name, 120) ?? name;
}

async function upsertSpecialty(client: Client, name: string): Promise<string | null> {
  const canonicalName = toCanonicalSpecialtyName(name);
  const cleanName = normalizeText(canonicalName, 120);
  if (!cleanName) {
    return null;
  }

  const slug = slugify(cleanName);
  if (!slug) {
    return null;
  }

  await client.query(
    `
    INSERT INTO specialties (slug, name)
    VALUES ($1, $2)
    ON CONFLICT (slug) DO NOTHING
    `,
    [slug, cleanName]
  );

  const specialty = await client.query<{ id: string }>(
    `
    SELECT id
    FROM specialties
    WHERE slug = $1
    LIMIT 1
    `,
    [slug]
  );

  return specialty.rows[0]?.id ?? null;
}

async function upsertInsurance(client: Client, name: string): Promise<string | null> {
  const canonicalName = toCanonicalInsuranceName(name);
  const cleanName = normalizeText(canonicalName, 120);
  if (!cleanName) {
    return null;
  }

  const slug = slugify(cleanName);
  if (!slug) {
    return null;
  }

  await client.query(
    `
    INSERT INTO insurances (slug, name)
    VALUES ($1, $2)
    ON CONFLICT (slug) DO NOTHING
    `,
    [slug, cleanName]
  );

  const insurance = await client.query<{ id: string }>(
    `
    SELECT id
    FROM insurances
    WHERE slug = $1
    LIMIT 1
    `,
    [slug]
  );

  return insurance.rows[0]?.id ?? null;
}

async function importClinicsFromJson(client: Client, payload: ImportPayload): Promise<ImportedClinic[]> {
  const records = payload.clinicas_profissionais ?? [];

  const clinics = records.filter((record) => normTipo(record.tipo) === "clinica");

  // Remove apenas dados de demonstração antigos do seed.
  await client.query(
    `DELETE FROM professionals WHERE name = ANY($1::text[])`,
    [["Dra. Mariana Alves", "Dr. Rafael Costa"]]
  );
  await client.query(
    `DELETE FROM clinics WHERE name = ANY($1::text[])`,
    [["Clínica Horizonte Azul", "Espaço Integrar Kids"]]
  );

  const importedClinics: ImportedClinic[] = [];

  for (const clinic of clinics) {
    const name = normalizeText(clinic.nome, 160);
    const city = normalizeText(clinic.cidade_origem, 120);

    if (!name || !city) {
      continue;
    }

    const descriptionParts = clinic.especialidades?.length
      ? [`Especialidades: ${clinic.especialidades.join(", ")}`]
      : [];
    if (clinic.url_fonte) {
      descriptionParts.push(`Fonte: ${clinic.url_fonte}`);
    }
    const description = normalizeText(descriptionParts.join(" | "), 8000);

    await client.query(
      `
      DELETE FROM clinics
      WHERE name = $1
        AND city = $2
      `,
      [name, city]
    );

    const phone = normalizeText(clinic.telefone, 20);
    const whatsapp = normalizeText(clinic.whatsapp, 20);

    const result = await client.query<{ id: string }>(
      `
      INSERT INTO clinics (
        name,
        description,
        city,
        neighborhood,
        address_line,
        address_number,
        zipcode,
        phone,
        whatsapp_phone,
        accepts_online,
        supports_tea_tdh,
        rating
      )
      VALUES (
        $1, $2, $3, $4, $5, NULL, NULL, $6, $7, false, true, $8
      )
      RETURNING id
      `,
      [
        name,
        description,
        city,
        normalizeText(clinic.bairro, 120),
        normalizeText(clinic.endereco_completo, 200),
        phone,
        whatsapp,
        clinic.nota_media ?? 0
      ]
    );

    const clinicId = result.rows[0]?.id;
    if (clinicId) {
      importedClinics.push({ id: clinicId, name, city, phone, whatsapp });

      const specialties = (clinic.especialidades ?? []).filter(Boolean);
      for (const specialtyName of specialties) {
        const specialtyId = await upsertSpecialty(client, specialtyName);
        if (!specialtyId) {
          continue;
        }
        await client.query(
          `
          INSERT INTO clinic_specialties (clinic_id, specialty_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [clinicId, specialtyId]
        );
      }

      const insurances = (clinic.convenios_aceitos ?? []).filter(Boolean);
      for (const insuranceName of insurances) {
        const insuranceId = await upsertInsurance(client, insuranceName);
        if (!insuranceId) {
          continue;
        }
        await client.query(
          `
          INSERT INTO clinic_insurances (clinic_id, insurance_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [clinicId, insuranceId]
        );
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Importação de clínicas concluída: ${clinics.length} registros processados.`);
  return importedClinics;
}

function inferClinicIdForProfessional(
  professionalName: string,
  professionalCity: string,
  importedClinics: ImportedClinic[],
  professionalPhone: string | null,
  professionalWhatsapp: string | null
): string | null {
  const cityClinics = importedClinics.filter((clinic) => clinic.city === professionalCity);
  const normalizedProfessionalName = professionalName.toLowerCase();

  const professionalPhoneDigits = normalizeDigits(professionalPhone);
  const professionalWhatsappDigits = normalizeDigits(professionalWhatsapp);
  const phoneMatches = cityClinics.filter((clinic) => {
    const clinicPhoneDigits = normalizeDigits(clinic.phone);
    const clinicWhatsappDigits = normalizeDigits(clinic.whatsapp);
    return (
      (professionalPhoneDigits && (professionalPhoneDigits === clinicPhoneDigits || professionalPhoneDigits === clinicWhatsappDigits)) ||
      (professionalWhatsappDigits && (professionalWhatsappDigits === clinicPhoneDigits || professionalWhatsappDigits === clinicWhatsappDigits))
    );
  });
  if (phoneMatches.length === 1) {
    return phoneMatches[0].id;
  }

  const matches = cityClinics.filter((clinic) => {
    const normalizedClinicName = clinic.name.toLowerCase();
    return (
      normalizedProfessionalName.includes(normalizedClinicName) ||
      normalizedClinicName.includes(normalizedProfessionalName)
    );
  });

  if (matches.length === 1) {
    return matches[0].id;
  }

  return null;
}

async function importProfessionalsFromJson(
  client: Client,
  payload: ImportPayload,
  importedClinics: ImportedClinic[]
): Promise<void> {
  const records = payload.clinicas_profissionais ?? [];
  const professionals = records.filter((record) => normTipo(record.tipo) === "profissional");
  let linkedProfessionalsCount = 0;

  for (const professional of professionals) {
    const name = normalizeText(professional.nome, 160);
    const city = normalizeText(professional.cidade_origem, 120);

    if (!name || !city) {
      continue;
    }

    const phone = normalizeText(professional.telefone, 20);
    const whatsapp = normalizeText(professional.whatsapp, 20);

    const clinicId = inferClinicIdForProfessional(
      name,
      city,
      importedClinics,
      phone,
      whatsapp
    );
    if (clinicId) {
      linkedProfessionalsCount += 1;
    }

    await client.query(
      `
      DELETE FROM professionals
      WHERE name = $1
        AND city = $2
      `,
      [name, city]
    );

    const result = await client.query<{ id: string }>(
      `
      INSERT INTO professionals (
        name,
        clinic_id,
        city,
        neighborhood,
        phone,
        whatsapp_phone,
        accepts_online,
        supports_tea_tdh,
        rating
      )
      VALUES ($1, $2, $3, $4, $5, $6, false, true, $7)
      RETURNING id
      `,
      [
        name,
        clinicId,
        city,
        normalizeText(professional.bairro, 120),
        phone,
        whatsapp,
        professional.nota_media ?? 0
      ]
    );

    const professionalId = result.rows[0]?.id;
    if (!professionalId) {
      continue;
    }

    const specialties = (professional.especialidades ?? []).filter(Boolean);
    for (const specialtyName of specialties) {
      const specialtyId = await upsertSpecialty(client, specialtyName);
      if (!specialtyId) {
        continue;
      }
      await client.query(
        `
        INSERT INTO professional_specialties (professional_id, specialty_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [professionalId, specialtyId]
      );
    }

    const insurances = (professional.convenios_aceitos ?? []).filter(Boolean);
    for (const insuranceName of insurances) {
      const insuranceId = await upsertInsurance(client, insuranceName);
      if (!insuranceId) {
        continue;
      }
      await client.query(
        `
        INSERT INTO professional_insurances (professional_id, insurance_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [professionalId, insuranceId]
      );
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Importação de profissionais concluída: ${professionals.length} registros processados.`);
  // eslint-disable-next-line no-console
  console.log(`Profissionais vinculados automaticamente a clínicas: ${linkedProfessionalsCount}.`);
}

async function runImportFromJson() {
  const client = new Client({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "ondeacho"
  });

  await client.connect();
  const payload = loadImportPayload();
  const importedClinics = await importClinicsFromJson(client, payload);
  await importProfessionalsFromJson(client, payload, importedClinics);
  await client.end();
  // eslint-disable-next-line no-console
  console.log("Importação JSON concluída com sucesso.");
}

runImportFromJson().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Falha na importação:", error);
  process.exit(1);
});
