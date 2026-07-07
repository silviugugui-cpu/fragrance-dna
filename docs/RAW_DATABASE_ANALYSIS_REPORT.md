# Raw Database Analysis Report

## Executive Summary
- Analysis scope: raw source workbook only (FragranceDNA_RawPerfumeDatabase_Export.xlsx)
- Worksheet analyzed: Sheet1
- Total analyzed rows (fragrances): 37926
- Total analyzed columns: 8
- Total missing values (all columns): 11213
- Mandatory-field risk highlights: missing brand=0, missing perfume=3

## Complete Database Statistics
- Total fragrances: 37923
- Total brands: 2571
- Total unique notes: 1011
- Total unique accords: 80
- Total concentrations: Not available (column not present)
- Total perfumers: Not available (column not present)
- Total fragrance families: Not available (column not present)
- Total genders: Not available (column not present)
- Total seasons: Not available (column not present)
- Total years: 166
- Total countries: Not available (column not present)
- Total missing values: 11213

## Column-by-Column Analysis
| Column | Data Type | Populated Rows | Empty Rows | Completeness % | Unique Values | Example Values | Max Text Length | Min Text Length |
|---|---:|---:|---:|---:|---:|---|---:|---:|
| brand | string | 37926 | 0 | 100 | 2571 | 18 21 Man Made, 40 Notes Perfume, 50 Cent, A Dozen Roses, A Lab on Fire | 47 | 2 |
| perfume | string | 37923 | 3 | 99.99 | 33962 | Sweet Tobacco Spirits, Cashmere Musk, Exotic Ylang Ylang, Exquisite Amber, Oudwood Veil | 72 | 1 |
| image | string | 37926 | 0 | 100 | 37921 | o.37691.jpg, o.15537.jpg, o.15536.jpg, o.15538.jpg, o.15539.jpg | 11 | 7 |
| launch_year | string | 26716 | 11210 | 70.44 | 166 | 2016, 2009, 2012, 2013, 2011 | 4 | 4 |
| main_accords | string | 37926 | 0 | 100 | 33072 | ["wine", "vanilla", "sweet", "woody", "aromatic"], ["woody", "musky", "balsamic", "powdery", "warm spicy", "amber"], ["yellow floral", "white floral", "sweet", "musky", "woody"], ["balsamic", "vanilla", "amber", "musky", "warm spicy"], ["oud", "amber", "fresh spicy", "balsamic", "woody"] | 85 | 4 |
| notes | string | 37926 | 0 | 100 | 35340 | ["Citruses", "Saffron", "Tonka Bean", "Vanilla", "Exotic Fruits", "Red wine", "Musk", "Woodsy Notes"], ["Sandalwood", "Cedar", "White Musk", "Cashmere Wood"], ["Ylang-Ylang", "Gardenia", "Musk"], ["Labdanum", "Styrax", "Benzoin", "Vanilla", "Musk"], ["Kephalis", "Agarwood (Oud)"] | 561 | 4 |
| longevity | string(JSON array) | 37926 | 0 | 100 | 10530 | ["4", "0", "9", "14", "31"], ["1", "0", "0", "1", "1"], ["1", "0", "0", "0", "2"], ["0", "0", "0", "0", "1"], ["1", "1", "1", "0", "6"] | 34 | 25 |
| sillage | string(JSON array) | 37926 | 0 | 100 | 9699 | ["10", "19", "28", "11"], ["1", "3", "0", "2"], ["0", "2", "1", "2"], ["1", "0", "3", "1"], ["1", "4", "0", "5"] | 29 | 20 |

## Uniqueness Analysis
- Duplicate fragrance names (exact): 2109
- Duplicate brand names (exact): 2185
- Duplicate note spellings (case variant groups): 2
- Duplicate accord spellings (case variant groups): 0
- Duplicate concentration spellings: Not available (column not present)
- Duplicate family spellings: Not available (column not present)
- Duplicate gender spellings: Not available (column not present)
- Duplicate season spellings: Not available (column not present)
- Sample duplicate fragrance names: Patchouli (39), Rose (38), Vetiver (31), Gardenia (27), Black (24), Musk (23), Gold (22), Love (22), Vanille (21), Amber (19), Jasmin (19), Lavender (19), White Musk (19), Jasmine (18), Iris (17), Vanilla (17), Ambre (16), Magnolia (16), Vetyver (16), Oud (15)
- Sample duplicate brand names: Avon (644), Demeter Fragrance (358), Guerlain (332), Victoria s Secret (288), O Boticario (241), DSH Perfumes (234), Novaya Zarya (228), Zara (224), Natura (217), Yves Rocher (217), Givenchy (204), Ajmal (199), Christian Dior (189), Black Phoenix Alchemy Lab (172), Yves Saint Laurent (171), Al Haramain Perfumes (168), Jequiti (167), Rasasi (155), CIEL Parfum (149), Jeanne Arthes (146)

## Completeness Analysis
### Ranked by Completeness
- brand: 100% (Highly complete)
- image: 100% (Highly complete)
- longevity: 100% (Highly complete)
- main_accords: 100% (Highly complete)
- notes: 100% (Highly complete)
- sillage: 100% (Highly complete)
- perfume: 99.99% (Highly complete)
- launch_year: 70.44% (Medium completeness)

- Highly complete fields: brand, image, longevity, main_accords, notes, sillage, perfume
- Medium completeness fields: launch_year
- Low completeness fields: None
- Almost empty fields: None

## Consistency Analysis
- brand: mixed capitalization detected (title, mixed, lower, upper)
- perfume: mixed capitalization detected (title, mixed, lower, upper)
- notes: mixed capitalization detected (mixed, lower)
- notes: unexpected symbols detected

## Cardinality Analysis
### brand
- Unique values: 2571
- Top 20: Avon (644), Demeter Fragrance (358), Guerlain (332), Victoria s Secret (288), O Boticario (241), DSH Perfumes (234), Novaya Zarya (228), Zara (224), Natura (217), Yves Rocher (217), Givenchy (204), Ajmal (199), Christian Dior (189), Black Phoenix Alchemy Lab (172), Yves Saint Laurent (171), Al Haramain Perfumes (168), Jequiti (167), Rasasi (155), CIEL Parfum (149), Jeanne Arthes (146)
- Least frequent values: 18 21 Man Made (1), 50 Cent (1), A Bathing Ape (1), A La Russe (1), Acqua di Montisola (1), Addy van den Krommenacker (1), Adrien Arpel (1), Aeon (1), Alan Cumming (1), Albert Nipon (1), Alessandro (1), Alessandro Della Torre (1), Alex Curran (1), Alla Pugacheva (1), Allegri (1), Amanda Lepore (1), Ambregris (1), America s Next Top Model (1), Anastacia (1), Anicka Yi Maggie Peng (1)

### launch_year
- Unique values: 166
- Top 20: 2015 (2994), 2014 (2652), 2016 (2594), 2013 (2346), 2012 (2221), 2011 (1790), 2010 (1547), 2009 (1388), 2008 (1353), 2007 (1053), 2006 (813), 2005 (602), 2004 (471), 2003 (464), 2000 (355), 2001 (336), 2002 (310), 1999 (259), 1998 (219), 1997 (213)
- Least frequent values: 1533 (1), 1781 (1), 1786 (1), 1792 (1), 1798 (1), 1799 (1), 1800 (1), 1801 (1), 1806 (1), 1821 (1), 1830 (1), 1832 (1), 1843 (1), 1845 (1), 1847 (1), 1849 (1), 1856 (1), 1860 (1), 1870 (1), 1871 (1)

### notes (item-level)
- Unique values: 1011
- Top 20: Musk (2690), Jasmine (2009), Amber (1982), Sandalwood (1933), Rose (1808), Vanilla (1607), Patchouli (1567), Bergamot (1437), Floral Notes (1019), Woody Notes (991), Cedar (973), Vetiver (906), Citruses (886), Lavender (793), Agarwood (Oud) (697), Mandarin Orange (673), Incense (618), Violet (616), Green Notes (598), Ylang-Ylang (587)
- Least frequent values: Acerola (1), Algerian Geranium (1), Almond Wood (1), Amaranth (1), Amazon Lily (1), American Apple (1), Apple Leaf (1), Apple Tree Blossom (1), Arnica (1), Asparagus (1), Avocado (1), Baobab (1), BBQ (1), Bellini (1), Black Cardamom (1), Black Clover (1), Black Currant Blossom (1), Black Iris (1), Blackwood (1), Blue Curacao (1)

### main_accords (item-level)
- Unique values: 80
- Top 20: woody (20505), citrus (15780), floral (14320), aromatic (11676), sweet (11504), fresh spicy (11356), white floral (9737), fruity (9376), green (8733), powdery (8502), balsamic (8216), warm spicy (8101), musky (7549), vanilla (5654), rose (5561), amber (5017), fresh (4979), patchouli (2859), animalic (2346), earthy (2104)
- Least frequent values: bbq (1), cognac (1), foresty (1), martini (1), plastic (1), tennis ball (1), wet plaster (1), anis (2), industrial glue (3), asphault (4), Champagne (4), clay (5), white wine (5), vinil (8), caramela (9), alcohol (12), coca-cola (13), mossy (24), vodka (25), wine (30)

### longevity (raw field)
- Unique values: 10530
- Top 20: ["0", "0", "0", "0", "0"] (10587), ["0", "0", "1", "0", "0"] (1462), ["0", "0", "0", "0", "1"] (1390), ["0", "0", "0", "1", "0"] (891), ["0", "1", "0", "0", "0"] (653), ["1", "0", "0", "0", "0"] (513), ["0", "0", "2", "0", "0"] (406), ["0", "0", "0", "0", "2"] (381), ["0", "0", "1", "1", "0"] (336), ["0", "0", "1", "0", "1"] (324), ["0", "1", "1", "0", "0"] (310), ["0", "0", "0", "1", "1"] (292), ["0", "0", "0", "2", "0"] (189), ["1", "0", "1", "0", "0"] (181), ["0", "0", "3", "0", "0"] (164), ["0", "1", "0", "0", "1"] (155), ["0", "0", "2", "1", "0"] (149), ["0", "0", "1", "1", "1"] (146), ["1", "0", "0", "0", "1"] (145), ["1", "1", "0", "0", "0"] (139)
- Least frequent values: ["-1", "0", "1", "7", "9"] (1), ["-1", "2", "1", "2", "0"] (1), ["-1", "2", "4", "13", "34"] (1), ["-1", "2", "8", "2", "3"] (1), ["-1", "5", "10", "3", "4"] (1), ["-1", "6", "32", "15", "8"] (1), ["-1", "8", "10", "3", "2"] (1), ["0", "0", "-1", "3", "3"] (1), ["0", "0", "0", "0", "10"] (1), ["0", "0", "0", "0", "19"] (1), ["0", "0", "0", "1", "10"] (1), ["0", "0", "0", "1", "14"] (1), ["0", "0", "0", "1", "9"] (1), ["0", "0", "0", "15", "10"] (1), ["0", "0", "0", "2", "20"] (1), ["0", "0", "0", "2", "7"] (1), ["0", "0", "0", "3", "9"] (1), ["0", "0", "0", "4", "-1"] (1), ["0", "0", "0", "4", "11"] (1), ["0", "0", "0", "4", "19"] (1)

### sillage (raw field)
- Unique values: 9699
- Top 20: ["0", "0", "0", "0"] (9508), ["0", "1", "0", "0"] (1791), ["0", "0", "0", "1"] (1147), ["1", "0", "0", "0"] (861), ["0", "0", "1", "0"] (799), ["0", "2", "0", "0"] (517), ["0", "1", "0", "1"] (475), ["1", "1", "0", "0"] (473), ["0", "1", "1", "0"] (468), ["0", "0", "1", "1"] (268), ["0", "0", "0", "2"] (228), ["0", "1", "1", "1"] (227), ["1", "0", "0", "1"] (210), ["2", "0", "0", "0"] (204), ["1", "2", "0", "0"] (201), ["0", "2", "0", "1"] (193), ["0", "2", "1", "0"] (186), ["1", "1", "0", "1"] (166), ["0", "3", "0", "0"] (162), ["1", "1", "1", "0"] (149)
- Least frequent values: ["-1", "14", "7", "8"] (1), ["0", "0", "2", "6"] (1), ["0", "0", "2", "7"] (1), ["0", "0", "3", "6"] (1), ["0", "0", "3", "7"] (1), ["0", "0", "5", "3"] (1), ["0", "0", "6", "4"] (1), ["0", "0", "6", "9"] (1), ["0", "0", "7", "0"] (1), ["0", "0", "7", "1"] (1), ["0", "0", "7", "4"] (1), ["0", "0", "9", "1"] (1), ["0", "1", "0", "6"] (1), ["0", "1", "0", "8"] (1), ["0", "1", "10", "2"] (1), ["0", "1", "2", "6"] (1), ["0", "1", "2", "7"] (1), ["0", "1", "2", "8"] (1), ["0", "1", "4", "3"] (1), ["0", "1", "5", "6"] (1)

## Notes Analysis
- Total unique note names: 1011
- Most frequent notes: Musk (2690), Jasmine (2009), Amber (1982), Sandalwood (1933), Rose (1808), Vanilla (1607), Patchouli (1567), Bergamot (1437), Floral Notes (1019), Woody Notes (991), Cedar (973), Vetiver (906), Citruses (886), Lavender (793), Agarwood (Oud) (697), Mandarin Orange (673), Incense (618), Violet (616), Green Notes (598), Ylang-Ylang (587)
- Least frequent notes: Acerola (1), Algerian Geranium (1), Almond Wood (1), Amaranth (1), Amazon Lily (1), American Apple (1), Apple Leaf (1), Apple Tree Blossom (1), Arnica (1), Asparagus (1), Avocado (1), Baobab (1), BBQ (1), Bellini (1), Black Cardamom (1), Black Clover (1), Black Currant Blossom (1), Black Iris (1), Blackwood (1), Blue Curacao (1)
- Possible duplicate spellings: plum: Plum | plum, vanilla orchid: Vanilla orchid | vanilla orchid
- Possible aliases: limelindenblossom: Lime (Linden Blossom) | Lime (Linden) Blossom, oakmoss: Oakmoss | oak moss, plum: Plum | plum, stjohnswort: St John's wort | St. John's Wort, vanillaorchid: Vanilla orchid | vanilla orchid
- Average notes per fragrance: 1.67
- Maximum notes per fragrance: 39
- Minimum notes per fragrance: 0

## Accords Analysis
- Total unique accord names: 80
- Most frequent accords: woody (20505), citrus (15780), floral (14320), aromatic (11676), sweet (11504), fresh spicy (11356), white floral (9737), fruity (9376), green (8733), powdery (8502), balsamic (8216), warm spicy (8101), musky (7549), vanilla (5654), rose (5561), amber (5017), fresh (4979), patchouli (2859), animalic (2346), earthy (2104)
- Least frequent accords: bbq (1), cognac (1), foresty (1), martini (1), plastic (1), tennis ball (1), wet plaster (1), anis (2), industrial glue (3), asphault (4), Champagne (4), clay (5), white wine (5), vinil (8), caramela (9), alcohol (12), coca-cola (13), mossy (24), vodka (25), wine (30)
- Possible duplicate spellings: None
- Possible aliases: None
- Average accords per fragrance: 5.19
- Maximum accords per fragrance: 6
- Minimum accords per fragrance: 0

## Brand Analysis
- Number of brands: 2571
- Fragrances per brand (top 20): Avon (644), Demeter Fragrance (358), Guerlain (332), Victoria s Secret (288), O Boticario (241), DSH Perfumes (234), Novaya Zarya (228), Zara (224), Natura (217), Yves Rocher (217), Givenchy (204), Ajmal (199), Christian Dior (189), Black Phoenix Alchemy Lab (172), Yves Saint Laurent (171), Al Haramain Perfumes (168), Jequiti (167), Rasasi (155), CIEL Parfum (149), Jeanne Arthes (146)
- Potential duplicate brands: fragrance du bois: Fragrance Du Bois | Fragrance du Bois, l acqua di fiori: L acqua Di Fiori | L acqua di Fiori
- Brands with incomplete metadata (top 20): Demeter Fragrance (245), DSH Perfumes (175), Black Phoenix Alchemy Lab (170), Al Haramain Perfumes (160), Rasasi (138), CIEL Parfum (135), Novaya Zarya (134), Milton Lloyd (111), Jean Pierre Sand (104), Yves de Sistelle (98), Adopt by Reserve Naturelle (96), Fleurage (88), Ajmal (87), Estiara (86), Christine Lavoisier Parfums (85), O Boticario (85), Swiss Arabian (84), Shirley May (80), Apple Parfums (77), I Profumi di Firenze (76)

## Data Quality Assessment
- Missing mandatory data: brand missing=0, perfume missing=3
- Inconsistent formatting indicators: 4
- Columns with suspicious values: launch_year out-of-format/out-of-range=1, notes malformed JSON=25473, accords malformed JSON=969
- Columns with unexpected value ranges/formats: image unexpected extension=0
- Potential Builder risks: malformed JSON-like lists can break deterministic parsing; sparse optional fields can propagate null-heavy artifacts; spelling variants increase rule complexity.

## Potential Normalization Candidates
- brand: case and punctuation variants
- perfume: duplicate name spellings and punctuation variants
- notes: spelling and alias-like variants
- main_accords: spelling and alias-like variants
- launch_year: non-uniform year formatting in suspicious entries

## Potential Translation Rule Candidates
- notes containing multilingual or alternate spellings
- accords containing multilingual or alternate spellings
- brand and perfume naming variants with locale-specific punctuation/case

## Potential Metadata Candidates
- derived fragrance family candidates from accord combinations
- inferred concentration candidates are not available from current columns
- perfumer, country, gender, season metadata are not present in source schema

## Risks
- High-cardinality free-text fields can produce unstable downstream grouping without explicit canonical rules.
- Duplicate spellings in notes/accords can fragment aggregate statistics.
- Missing columns for concentration/perfumer/family/gender/season/country block related analytics until supplemental sources exist.

## Recommendations
- Keep raw source unchanged and treat this report as baseline for future translation and metadata milestones.
- Prioritize rule design for notes and accords variants first due to highest cardinality and alias pressure.
- Gate downstream consumers on strict JSON-array parsing checks for notes and accords fields.
- Track unavailable metadata columns explicitly as schema gaps rather than null-value anomalies.
