CREATE TABLE brand_art (
      brand_id TEXT PRIMARY KEY REFERENCES brands(brand_id),
      asset_path TEXT NOT NULL,
      alt_text_ro TEXT NOT NULL,
      asset_format TEXT NOT NULL,
      art_method TEXT NOT NULL,
      palette TEXT NOT NULL,
      inspiration_cues_json TEXT NOT NULL
    );

CREATE TABLE brands (
      brand_id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL,
      selection_category TEXT NOT NULL CHECK(selection_category IN ('Nișă','Dupe','Designer')),
      official_site_url TEXT,
      official_site_status TEXT NOT NULL,
      official_site_notes TEXT,
      representative_perfume_name TEXT NOT NULL,
      source_catalog_record_count INTEGER NOT NULL DEFAULT 0,
      catalog_completeness_status TEXT NOT NULL,
      editorial_description_ro TEXT NOT NULL,
      description_status TEXT NOT NULL DEFAULT 'editorial_draft_needs_review',
      match_variants_json TEXT NOT NULL,
      created_date TEXT NOT NULL
    );

CREATE TABLE dna_axes (
      axis_id TEXT PRIMARY KEY,
      label_ro TEXT NOT NULL,
      definition_ro TEXT,
      low_ro TEXT,
      high_ro TEXT,
      dashboard_formula TEXT,
      dashboard_kind TEXT,
      scale_min REAL,
      scale_max REAL,
      higher_is_better INTEGER,
      note TEXT
    );

CREATE TABLE dna_model_metadata (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL
    );

CREATE TABLE dupe_similarities (
      dupe_similarity_id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_source_record_id TEXT REFERENCES fragrances(source_record_id),
      subject_featured_id TEXT REFERENCES featured_fragrances(featured_id),
      subject_perfume_name TEXT NOT NULL,
      subject_brand_id TEXT NOT NULL REFERENCES brands(brand_id),
      research_status TEXT NOT NULL CHECK(research_status IN ('pending_research','documented_resemblance','brand_claimed_inspired_by','reviewed_no_match')),
      relation_type TEXT,
      reference_brand TEXT,
      reference_perfume TEXT,
      evidence_source_url TEXT,
      evidence_source_type TEXT,
      evidence_summary TEXT,
      confidence REAL,
      verified_date TEXT,
      CHECK((subject_source_record_id IS NOT NULL) OR (subject_featured_id IS NOT NULL))
    );

CREATE TABLE featured_fragrances (
      featured_id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL REFERENCES brands(brand_id),
      selected_perfume_name TEXT NOT NULL,
      source_record_id TEXT REFERENCES fragrances(source_record_id),
      match_status TEXT NOT NULL,
      match_method TEXT,
      candidate_record_ids_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT
    );

CREATE TABLE fragrance_badge_definitions (
      badge_family TEXT NOT NULL CHECK(badge_family IN ('community_score','popularity','olfactive_score')),
      badge_code TEXT NOT NULL,
      label_ro TEXT NOT NULL,
      rank INTEGER NOT NULL,
      metric_name TEXT NOT NULL,
      min_value REAL,
      max_value_exclusive REAL,
      range_label_internal TEXT NOT NULL,
      description_ro TEXT NOT NULL,
      PRIMARY KEY(badge_family, badge_code)
    );

CREATE TABLE fragrance_badges (
      source_record_id TEXT PRIMARY KEY REFERENCES fragrances(source_record_id),
      community_badge_code TEXT NOT NULL,
      popularity_badge_code TEXT NOT NULL,
      olfactive_badge_code TEXT NOT NULL,
      badge_status TEXT NOT NULL CHECK(badge_status IN ('all_defined','partially_undefined','all_undefined')),
      method_id TEXT NOT NULL,
      generated_date TEXT NOT NULL
    );

CREATE TABLE fragrance_rating_sources (
      source_row_id INTEGER PRIMARY KEY,
      source_record_id TEXT NOT NULL REFERENCES fragrances(source_record_id),
      source_platform TEXT NOT NULL,
      source_url TEXT,
      source_rating REAL,
      source_scale_max REAL,
      normalized_score_100 REAL,
      reported_vote_count INTEGER,
      scale_status TEXT NOT NULL,
      is_community_source INTEGER NOT NULL,
      matches_selected_product INTEGER NOT NULL,
      included_in_aggregate INTEGER NOT NULL DEFAULT 0,
      selection_note TEXT,
      ingested_date TEXT NOT NULL
    );

CREATE TABLE fragrance_ratings (
      source_record_id TEXT PRIMARY KEY REFERENCES fragrances(source_record_id),
      source_rating_count INTEGER NOT NULL,
      source_platform_count INTEGER NOT NULL,
      reported_votes_total INTEGER,
      user_score_100 REAL,
      confidence_adjusted_score_100 REAL,
      popularity_index_100 REAL,
      fragrantiq_rating_100 REAL,
      fragrantiq_rating_5 REAL,
      evidence_level TEXT NOT NULL,
      rating_status TEXT NOT NULL,
      method_id TEXT NOT NULL,
      source_components_json TEXT NOT NULL,
      generated_date TEXT NOT NULL
    );

CREATE TABLE fragrance_territory_suggestions (
      suggestion_id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_record_id TEXT NOT NULL REFERENCES fragrances(source_record_id),
      territory_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      confidence TEXT NOT NULL CHECK(confidence IN ('low','moderate','high')),
      is_primary_suggestion INTEGER NOT NULL DEFAULT 0,
      review_status TEXT NOT NULL DEFAULT 'editorial_review_pending',
      evidence_terms_json TEXT NOT NULL,
      evidence_source_url TEXT,
      method_id TEXT NOT NULL,
      UNIQUE(source_record_id, territory_id)
    );

CREATE TABLE fragrances (
      source_record_id TEXT PRIMARY KEY,
      source_row_id INTEGER NOT NULL UNIQUE,
      canonical_key TEXT NOT NULL,
      brand_id TEXT NOT NULL REFERENCES brands(brand_id),
      source_brand_name TEXT NOT NULL,
      perfume_name TEXT NOT NULL,
      launch_year TEXT,
      perfumer TEXT,
      gender TEXT,
      source_name TEXT,
      source_url TEXT,
      rating TEXT,
      vote_count TEXT,
      accords_json TEXT NOT NULL,
      notes_json TEXT NOT NULL,
      description TEXT,
      project_image_path TEXT,
      image_exists INTEGER NOT NULL,
      source_brand_type TEXT,
      source_confidence REAL,
      source_status TEXT,
      source_fields_json TEXT NOT NULL,
      FOREIGN KEY(brand_id) REFERENCES brands(brand_id)
    );

CREATE TABLE olfactory_territories (
      territory_id TEXT PRIMARY KEY,
      territory_key TEXT,
      name_en TEXT NOT NULL,
      label_ro TEXT,
      definition_ro TEXT,
      source_descriptors_json TEXT NOT NULL,
      effective_affinity_axes_json TEXT NOT NULL,
      characteristics_json TEXT NOT NULL,
      examples_json TEXT NOT NULL,
      intensity TEXT,
      versatility_metadata INTEGER,
      seasons_json TEXT NOT NULL,
      color TEXT
    );

CREATE TABLE sources (
      source_id TEXT PRIMARY KEY,
      source_url TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_title TEXT,
      review_status TEXT NOT NULL,
      usage_note TEXT
    );

CREATE TABLE sqlite_sequence(name,seq);

CREATE VIEW article_brand_cards AS
      SELECT b.brand_id, b.brand_name, b.selection_category, b.official_site_url,
             b.official_site_status, b.editorial_description_ro, b.description_status,
             b.representative_perfume_name, b.source_catalog_record_count, b.catalog_completeness_status,
             a.asset_path AS brand_art_path, a.alt_text_ro AS brand_art_alt
      FROM brands b LEFT JOIN brand_art a ON a.brand_id=b.brand_id;

CREATE VIEW article_fragrance_badges AS
      SELECT f.source_record_id, b.brand_name, f.perfume_name,
             bc.badge_code AS community_badge_code, bc.label_ro AS community_badge,
             bp.badge_code AS popularity_badge_code, bp.label_ro AS popularity_badge,
             bo.badge_code AS olfactive_score_badge_code, bo.label_ro AS olfactive_score_badge,
             fb.badge_status
      FROM fragrance_badges fb JOIN fragrances f ON f.source_record_id=fb.source_record_id
      JOIN brands b ON b.brand_id=f.brand_id
      LEFT JOIN fragrance_badge_definitions bc ON bc.badge_family='community_score' AND bc.badge_code=fb.community_badge_code
      LEFT JOIN fragrance_badge_definitions bp ON bp.badge_family='popularity' AND bp.badge_code=fb.popularity_badge_code
      LEFT JOIN fragrance_badge_definitions bo ON bo.badge_family='olfactive_score' AND bo.badge_code=fb.olfactive_badge_code;

CREATE VIEW article_fragrance_catalog AS
      SELECT f.source_record_id, f.canonical_key, f.brand_id, f.perfume_name, f.launch_year,
             f.perfumer, f.gender, f.accords_json, f.notes_json, f.description,
             f.project_image_path, f.image_exists, b.brand_name, b.selection_category,
             a.asset_path AS brand_art_path,
             fb.community_badge_code, bc.label_ro AS community_badge,
             fb.popularity_badge_code, bp.label_ro AS popularity_badge,
             fb.olfactive_badge_code AS olfactive_score_badge_code,
             bo.label_ro AS olfactive_score_badge, fb.badge_status
      FROM fragrances f JOIN brands b ON b.brand_id=f.brand_id
      LEFT JOIN brand_art a ON a.brand_id=b.brand_id
      LEFT JOIN fragrance_badges fb ON fb.source_record_id=f.source_record_id
      LEFT JOIN fragrance_badge_definitions bc ON bc.badge_family='community_score' AND bc.badge_code=fb.community_badge_code
      LEFT JOIN fragrance_badge_definitions bp ON bp.badge_family='popularity' AND bp.badge_code=fb.popularity_badge_code
      LEFT JOIN fragrance_badge_definitions bo ON bo.badge_family='olfactive_score' AND bo.badge_code=fb.olfactive_badge_code;

CREATE VIEW article_fragrance_ratings AS
      SELECT * FROM article_fragrance_badges;

CREATE VIEW dupe_similarity_review_queue AS
      SELECT d.*, b.brand_name AS subject_brand_name
      FROM dupe_similarities d JOIN brands b ON b.brand_id=d.subject_brand_id
      WHERE d.research_status='pending_research';

CREATE INDEX idx_dupe_similarity_subject ON dupe_similarities(subject_source_record_id, subject_featured_id);

CREATE INDEX idx_fragrance_badges_status ON fragrance_badges(badge_status);

CREATE INDEX idx_fragrances_brand_name ON fragrances(brand_id, perfume_name);

CREATE INDEX idx_fragrances_canonical_key ON fragrances(canonical_key);

CREATE INDEX idx_rating_sources_product ON fragrance_rating_sources(source_record_id, source_platform);

CREATE INDEX idx_territory_suggestion_source ON fragrance_territory_suggestions(source_record_id);
