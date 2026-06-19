export type Fragrance = {
  id: string;
  name: string;
  brand?: string;
  year?: string;
  notes?: string[];
  dna_axes?: DNAAxis[];
  semantic_v1?: Record<string, number>;
};

export type AttributeKey =
  | 'elegant'
  | 'carismatic'
  | 'misterios'
  | 'citrice'
  | 'miere'
  | 'lemn';

export type AnswerRecord = Record<AttributeKey, number>;

export type DNAAxis = { name: string; value?: number };

export type FragranceLayer = {
  id?: string;
  name?: string;
  fragrances?: any[];
};
