import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

const root = process.cwd();
const inputPath = path.join(root, "data", "FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json");
const outputDir = path.join(root, "data", "generated");
const outputPath = path.join(outputDir, "user-dna-test-database.xlsx");

if (!fs.existsSync(inputPath)) {
  throw new Error(`Input file missing: ${inputPath}`);
}

const raw = fs.readFileSync(inputPath, "utf-8");
const parsed = JSON.parse(raw);
const rootPayload = parsed?.FragranceDNA_USER_ATTRIBUTE_LAYER_v3 ?? parsed;
const layers = Array.isArray(rootPayload?.layers) ? rootPayload.layers : [];

const recordsRows = [];
const axesRows = [];
const semanticRows = [];

for (let index = 0; index < layers.length; index += 1) {
  const layer = layers[index] ?? {};
  const id = String(layer.id ?? "").trim() || `${String(layer.name ?? "fragrance").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "fragrance"}::${index + 1}`;
  const name = String(layer.name ?? "").trim();
  const type = String(layer.type ?? "").trim();
  const userAttrs = layer.user_attributes_v3 ?? {};
  const abstractAttrs = Array.isArray(userAttrs.abstract) ? userAttrs.abstract.map((v) => String(v).trim()).filter(Boolean) : [];
  const concreteAttrs = Array.isArray(userAttrs.concrete) ? userAttrs.concrete.map((v) => String(v).trim()).filter(Boolean) : [];
  const notes = Array.isArray(layer.notes) ? layer.notes.map((v) => String(v).trim()).filter(Boolean) : [];
  const accords = Array.isArray(layer.mainAccords) ? layer.mainAccords.map((v) => String(v).trim()).filter(Boolean) : [];
  const dnaAxes = layer.dna_axes && typeof layer.dna_axes === "object" ? layer.dna_axes : {};
  const semanticV1 = layer.semantic_v1 && typeof layer.semantic_v1 === "object" ? layer.semantic_v1 : {};

  const axisEntries = Object.entries(dnaAxes).map(([axisName, value]) => ({
    id,
    name,
    type,
    axisName,
    axisValue: Number(value ?? 0),
  }));

  const semanticEntries = Object.entries(semanticV1).map(([key, value]) => ({
    id,
    name,
    type,
    semanticKey: key,
    semanticValue: Number(value ?? 0),
  }));

  const axisAverage = axisEntries.length > 0
    ? Number((axisEntries.reduce((acc, entry) => acc + entry.axisValue, 0) / axisEntries.length).toFixed(2))
    : 0;
  const semanticDensity = semanticEntries.filter((entry) => entry.semanticValue >= 70).length;
  const dnaReady = axisEntries.length >= 10 && semanticEntries.length >= 8 && abstractAttrs.length >= 2 && concreteAttrs.length >= 2;
  const richProfile = axisAverage >= 70 && semanticDensity >= 4 && abstractAttrs.length >= 3;

  recordsRows.push({
    id,
    name,
    type,
    brand: String(layer.brand ?? "").trim(),
    launchYear: String(layer.launchYear ?? layer.year ?? "").trim(),
    source: String(layer.source ?? "user-dna-db").trim(),
    status: String(layer.status ?? "user-dna-db").trim(),
    externalId: String(layer.externalId ?? "").trim(),
    externalUrl: String(layer.externalUrl ?? "").trim(),
    rating: String(layer.rating ?? "").trim(),
    voteCount: String(layer.voteCount ?? "").trim(),
    sourceFingerprint: String(layer.sourceFingerprint ?? "").trim(),
    perfumer: String(layer.perfumer ?? "").trim(),
    gender: String(layer.gender ?? "").trim(),
    description: String(layer.description ?? "").trim(),
    imageUrl: String(layer.imageUrl ?? "").trim(),
    localImagePath: String(layer.localImagePath ?? "").trim(),
    notes: notes.join(" | "),
    mainAccords: accords.join(" | "),
    abstractAttributes: abstractAttrs.join(" | "),
    concreteAttributes: concreteAttrs.join(" | "),
    axisAverage,
    semanticDensity,
    dnaReady: dnaReady ? "Yes" : "No",
    richProfile: richProfile ? "Yes" : "No",
  });

  axesRows.push(...axisEntries);
  semanticRows.push(...semanticEntries);
}

fs.mkdirSync(outputDir, { recursive: true });

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(recordsRows), "records");
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(axesRows), "dna_axes");
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(semanticRows), "semantic_v1");

XLSX.writeFile(workbook, outputPath);

console.log(JSON.stringify({
  outputPath,
  records: recordsRows.length,
  dnaAxesRows: axesRows.length,
  semanticRows: semanticRows.length,
}, null, 2));
