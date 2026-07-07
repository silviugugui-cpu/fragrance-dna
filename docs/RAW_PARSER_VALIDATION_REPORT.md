# Raw Parser Validation Report

## Executive Summary
- Workbook: FragranceDNA_RawPerfumeDatabase_Export.xlsx
- Worksheet: Sheet1
- Total fragrances validated: 37926
- Columns validated: notes, main_accords
- Parser status: PARTIALLY LOSSLESS
- Malformed field-level rows: 26442
- Malformed fragrance rows (distinct): 25485

## Parser Correctness
- Verification executed for every fragrance row on both Notes and Main Accords fields.
- Strict JSON parsing and tokenizer parsing were compared row-by-row.
- Rows with parser mismatches: 0
- Rows containing UTF-8 values: 12
- Rows containing comma-inside-value elements: 2
- Rows containing quote/apostrophe characters inside values: 8

## Lossless Verification
- Every parsed row was validated for complete element extraction against tokenizer and strict parser outputs.
- No element-skipping is reported when tokenizer and strict parser outputs are identical.
- Quotation marks, commas inside values, special characters, and UTF-8 were checked in extracted values.

## Malformed Rows
- Total malformed field-level rows: 26442
- Distinct malformed fragrance rows: 25485
- workbook failures: 26442
- parser failures: 0
- escaping failures: 0
- malformed source data failures: 0

### Failure Examples (first 30)
| Row | Fragrance | Field | Source | Reason | Raw Value |
|---:|---|---|---|---|---|
| 10 | Power by 50 Cent | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Woodsy Notes", "Coriander", "Nutmeg"], "base": ["Patchouli", "Oakmoss", "Musk"], "top": ["Petitgrain", "Pepper", "Artemisia"]} |
| 11 | Amber Queen | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Damask Rose", "Rose"], "base": ["Amber"], "top": ["Ginger", "Apricot", "Clementine"]} |
| 12 | Angel Face | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Peony", "Violet", "Jasmine", "Lilac", "Rose"], "base": ["Patchouli", "Tonka Bean", "Vetiver"], "top": ["Black Currant", "Apple"]} |
| 15 | Iced White | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Osmanthus", "Peony", "Primrose", "Rose"], "base": ["Musk", "Vanille"], "top": null} |
| 16 | Shakespeare in Love | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Jasmine", "Gardenia", "Rose"], "base": ["Vanille", "Woodsy Notes"], "top": ["Pear"]} |
| 18 | Eau d Ipanema | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Orange Blossom", "Water Notes", "Jasmine", "Freesia", "Neroli"], "base": ["Whipped cream", "Vanilla", "Musk"], "top": ["Pineapple", "Bergamot", "Red Berries", "Mango", "Pink Pepper"]} |
| 19 | L Anonyme ou OP 1475 A | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Geranium"], "base": ["Woodsy Notes", "Amber", "Suede"], "top": ["Bergamot"]} |
| 20 | Liquidnight | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Sage", "Lavender", "Hinoki Wood"], "base": ["Incense", "Vanilla", "Musk"], "top": ["Bergamot", "Lime", "Saffron"]} |
| 21 | Made in Heaven | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | null |
| 21 | Made in Heaven | main_accords | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | null |
| 22 | Messy Sexy Just Rolled out of Bed | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Turkish Rose", "Heliotrope"], "base": ["Musk", "Cashmere Wood", "Toffee", "Amber", "Sandalwood", "Vanilla", "Tonka Bean"], "top": ["Bergamot", "Peach Blossom"]} |
| 23 | Oxymusc | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Thyme", "Lavender"], "base": ["Musk", "Birch", "Bourbon Vanilla"], "top": ["Lily-of-the-Valley"]} |
| 24 | Paris L A | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Neroli", "Coriander", "Thyme"], "base": ["Macarons", "Amber", "Musk"], "top": ["Lime", "Ginger", "Coca-Cola"]} |
| 26 | Rose Rebelle Respawn | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Carnation", "Rose"], "base": ["Musk", "Incense", "Cacao"], "top": ["Ivy", "Mint"]} |
| 27 | Sweet Dreams 2003 | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Jasmine", "Orange Blossom"], "base": ["Musk", "Amber", "Castoreum"], "top": ["Petitgrain", "Neroli", "Bergamot"]} |
| 28 | What We Do In Paris Is Secret | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Vanille", "Heliotrope", "Rose"], "base": ["Sandalwood", "Amber", "Tolu Balsam", "Tonka Bean"], "top": ["Bergamot", "white honey", "Litchi"]} |
| 29 | Mon Musc a Moi | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Turkish Rose", "Heliotrope"], "base": ["Musk", "Toffee", "Amber", "White Woods", "Vanilla", "Tonka Bean"], "top": ["Bergamot", "Peach Blossom"]} |
| 30 | One Night In Rio | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Passionfruit", "Tiare Flower", "Magnolia"], "base": ["Musk", "White Amber", "Vanilla"], "top": ["Black Pepper", "Neroli"]} |
| 40 | HOLLY wOUD VINE | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Violet Leaf", "Jasmine Sambac", "Neroli"], "base": ["Galbanum", "Agarwood (Oud)", "Fir"], "top": ["Mimosa", "Bitter Orange", "Tomato Leaf"]} |
| 50 | SkyDancer | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Osmanthus", "Saffron", "iris", "Frangipani"], "base": ["Amber", "Musk", "Sandalwood"], "top": ["Saffron", "Cashmeran", "Virginia Cedar", "Pink Pepper", "Bergamot"]} |
| 52 | Summer Varies | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Ylang-Ylang"], "base": ["Vanilla", "Olibanum"], "top": ["Citruses"]} |
| 53 | Verde Perfume | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Jasmine Sambac", "Rose", "Yuzu"], "base": ["Galbanum"], "top": ["Mint", "Bergamot", "Lemon", "Mimosa"]} |
| 62 | Dreams and Visions | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Cassis", "Rose"], "base": ["Sandalwood", "Patchouli"], "top": ["Mimosa"]} |
| 65 | LACE Perfume | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Nutmeg", "White Ginger Lily", "Geranium", "Lavender"], "base": ["Vetiver", "Labdanum", "Cloves"], "top": ["Lemon", "Mint", "Bergamot"]} |
| 71 | Bronte Perfume | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Turkish Rose", "Tuberose", "Lime (Linden) Blossom"], "base": ["Amber", "Benzoin", "Musk", "Ambergris"], "top": ["Bergamot", "Pink Pepper"]} |
| 73 | Epione | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Jasmine", "Rose", "Frangipani"], "base": ["Tonka Bean", "Amber"], "top": ["Neroli"]} |
| 75 | KISMET Perfume | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Raspberry", "Strawberry", "Jasmine", "Gardenia", "Rose", "Violet"], "base": ["Amber", "Galbanum"], "top": ["Cinnamon", "Lemon"]} |
| 79 | Tallulah B | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | {"middle": ["Rose", "Lime (Linden) Blossom", "Jasmine"], "base": ["Sandalwood", "Musk", "vetyver"], "top": ["Lily", "Neroli", "Vanilla", "Rose", "Mandarin Orange", "Cloves", "Bergamot"]} |
| 80 | Bond James Bond L Homme | notes | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | null |
| 80 | Bond James Bond L Homme | main_accords | workbook | tokenizer=Array does not start with '[' and end with ']'; strict=JSON parsed value is not an array | null |

## Parser Statistics
### Notes
- Average notes per fragrance: 5.0806
- Median notes per fragrance: 4
- Maximum notes per fragrance: 39
- Minimum notes per fragrance: 1
- Distribution histogram:
  - 0: 0
  - 1-2: 2632
  - 3-4: 3801
  - 5-6: 2758
  - 7-8: 1571
  - 9-10: 834
  - 11+: 857

### Main Accords
- Average accords per fragrance: 5.3304
- Median accords per fragrance: 5
- Maximum accords per fragrance: 6
- Minimum accords per fragrance: 1
- Distribution histogram:
  - 0: 0
  - 1-2: 385
  - 3-4: 1109
  - 5-6: 35463
  - 7-8: 0
  - 9-10: 0
  - 11+: 0

## Examples
### Spot Check (50 random fragrances)
| Row | Fragrance | Notes Raw | Notes Parsed | Notes Count | Accords Raw | Accords Parsed | Accords Count | Identical |
|---:|---|---|---|---:|---|---|---:|---|
| 725 | Aramis Classic Reserve | {"middle": ["Cinnamon", "Myrtle", "Sage", "Cloves", "Thyme", "Jasmine", "Caraway", "Galbanum"], "base": ["Leather", "Amber", "Patchouli", "Oakmoss", "Woody Notes"], "top": ["Lemon", "Juniper"]} | [] | 0 | ["aromatic", "fresh spicy", "woody", "warm spicy", "herbal", "cinnamon"] | ["aromatic","fresh spicy","woody","warm spicy","herbal","cinnamon"] | 6 | no |
| 2451 | Eternity Summer for Men 2007 | {"middle": ["Galbanum", "Star Anise", "Lily-of-the-Valley"], "base": ["Patchouli", "Musk", "Cedar", "Red Amber"], "top": ["Coriander", "Watermelon"]} | [] | 0 | ["soft spicy", "ozonic", "aquatic", "aromatic", "musky", "floral"] | ["soft spicy","ozonic","aquatic","aromatic","musky","floral"] | 6 | no |
| 3038 | Sophia | ["Jasmine", "Rose"] | ["Jasmine","Rose"] | 2 | ["rose", "white floral", "animalic", "floral", "citrus"] | ["rose","white floral","animalic","floral","citrus"] | 5 | yes |
| 3066 | Lily | ["Hyacinth", "Ylang-Ylang", "oak moss", "Lily-of-the-Valley", "Violet Leaf", "Woodsy Notes", "Musk", "Green Notes"] | ["Hyacinth","Ylang-Ylang","oak moss","Lily-of-the-Valley","Violet Leaf","Woodsy Notes","Musk","Green Notes"] | 8 | ["floral", "green", "woody", "fresh spicy", "earthy"] | ["floral","green","woody","fresh spicy","earthy"] | 5 | yes |
| 3420 | New Balls | null | [] | 0 | null | [] | 0 | no |
| 4726 | 01 06 Lime Absolue | {"middle": ["Fig", "Vetiver"], "base": ["Sandalwood"], "top": ["Lime"]} | [] | 0 | ["woody", "citrus", "aromatic", "green", "earthy", "fruity"] | ["woody","citrus","aromatic","green","earthy","fruity"] | 6 | no |
| 4835 | Bergamot Silk | ["Bergamot", "Musk"] | ["Bergamot","Musk"] | 2 | ["musky", "citrus", "fresh spicy", "aromatic", "floral"] | ["musky","citrus","fresh spicy","aromatic","floral"] | 5 | yes |
| 5012 | Man Amber | {"middle": ["French labdanum", "Amber", "Myrhh"], "base": ["Musk", "Virginia Cedar", "Agarwood (Oud)"], "top": ["Geranium", "Bergamot", "Thyme"]} | [] | 0 | ["balsamic", "amber", "woody", "oud", "smoky", "musky"] | ["balsamic","amber","woody","oud","smoky","musky"] | 6 | no |
| 6100 | Water Lily | ["Water Lily", "Green Notes"] | ["Water Lily","Green Notes"] | 2 | ["aquatic", "green", "floral", "fresh", "watery"] | ["aquatic","green","floral","fresh","watery"] | 5 | yes |
| 6266 | Master Number No 66 | ["Cotton Flower", "Sage"] | ["Cotton Flower","Sage"] | 2 | ["aromatic", "herbal", "fresh", "soft spicy", "floral"] | ["aromatic","herbal","fresh","soft spicy","floral"] | 5 | yes |
| 8196 | Old Flame | {"middle": ["Coffee blossom", "Tobacco"], "base": ["Black Tea", "Woody Notes", "Amber", "Seashells"], "top": ["Lime", "Artemisia"]} | [] | 0 | ["savory", "animalic", "green", "woody", "amber", "tobacco"] | ["savory","animalic","green","woody","amber","tobacco"] | 6 | no |
| 9166 | Sula Sun Kissed Citrus | ["Bergamot", "Grapefruit", "Amalfi Lemon", "Orange", "Tangerine"] | ["Bergamot","Grapefruit","Amalfi Lemon","Orange","Tangerine"] | 5 | ["citrus", "fresh spicy", "green", "terpenic", "aromatic"] | ["citrus","fresh spicy","green","terpenic","aromatic"] | 5 | yes |
| 9630 | Torrid | {"middle": ["Jasmine"], "base": ["Vanilla", "Sandalwood"], "top": ["Wild berries"]} | [] | 0 | ["woody", "fruity", "vanilla", "powdery", "balsamic", "fresh spicy"] | ["woody","fruity","vanilla","powdery","balsamic","fresh spicy"] | 6 | no |
| 10218 | Classic Orange | ["Blood Orange", "Petitgrain", "Suede", "Chinese Osmanthus", "Black Tea", "Sandalwood", "Musk"] | ["Blood Orange","Petitgrain","Suede","Chinese Osmanthus","Black Tea","Sandalwood","Musk"] | 7 | ["citrus", "musky", "green", "fruity", "floral"] | ["citrus","musky","green","fruity","floral"] | 5 | yes |
| 10323 | Bae by Sebastian Olzanski | {"middle": ["Pink Freesia", "Orange Blossom", "Cedar", "Clary Sage"], "base": ["Patchouli", "Musk", "Amber", "Vanilla"], "top": ["Bergamot", "Strawberry", "Pear", "Grass"]} | [] | 0 | ["sweet", "fruity", "citrus", "amber", "green"] | ["sweet","fruity","citrus","amber","green"] | 5 | no |
| 11194 | Boucheron | {"middle": ["Jasmine", "Tuberose", "Madagascar Ylang-Ylang", "Orris Root", "Lydia Broom", "Lily-of-the-Valley", "Cedar", "Orange Blossom", "Geranium", "Narcissus"], "base": ["Sandalwood", "Indian Vanilla", "Amber", "Musk", "Benzoin", "Civet", "Oakmoss", "Tonka Bean"], "top": ["Apricot", "Tagetes", "Tangerine", "Asafoetida", "Cassia", "Basil", "Orange", "Bergamot", "Bitter Orange", "Lemon"]} | [] | 0 | ["white floral", "citrus", "woody", "animalic", "sweet", "yellow floral"] | ["white floral","citrus","woody","animalic","sweet","yellow floral"] | 6 | no |
| 11215 | Trouble Iridescent Eau Legere | ["Floral Notes", "Citruses", "Amber"] | ["Floral Notes","Citruses","Amber"] | 3 | ["amber", "citrus", "floral", "fresh", "animalic"] | ["amber","citrus","floral","fresh","animalic"] | 5 | yes |
| 11525 | Narcisse Blanc Parfum | {"middle": ["Jasmine", "Rose", "Lime"], "base": ["Musk", "Sandalwood", "iris", "Amber"], "top": ["Orange", "Neroli", "Orange Blossom", "Petitgrain"]} | [] | 0 | ["citrus", "white floral", "powdery", "floral", "woody"] | ["citrus","white floral","powdery","floral","woody"] | 5 | no |
| 11551 | Yuzu Man | {"middle": ["black fig", "Fruity Notes", "Pistachio"], "base": ["Virginia Cedar", "Sandalwood", "Spices"], "top": ["Yuzu", "Lemon Verbena", "Basil"]} | [] | 0 | ["citrus", "woody", "fruity", "sweet", "green", "fresh spicy"] | ["citrus","woody","fruity","sweet","green","fresh spicy"] | 6 | no |
| 12064 | Dior Addict Summer Peonies | {"middle": ["Peony", "Violet"], "base": ["Musk"], "top": ["Bergamot", "Orange"]} | [] | 0 | ["floral", "fresh", "citrus", "rose", "powdery"] | ["floral","fresh","citrus","rose","powdery"] | 5 | no |
| 15881 | L Eau Kenzo Intense pour Homme | {"middle": ["Black Basil"], "base": ["Cedar", "Vetiver"], "top": ["Yuzu", "Lime", "Sea water"]} | [] | 0 | ["woody", "green", "citrus", "fresh spicy", "aromatic"] | ["woody","green","citrus","fresh spicy","aromatic"] | 5 | no |
| 15932 | Kiotis pour Homme | {"middle": ["Lavender", "Pepper", "Carnation"], "base": ["Cedar", "Patchouli", "Sandalwood"], "top": ["Grapefruit", "Sage", "Lavender"]} | [] | 0 | ["aromatic", "fresh spicy", "woody", "warm spicy", "floral"] | ["aromatic","fresh spicy","woody","warm spicy","floral"] | 5 | no |
| 16362 | Lanvin Me Limited Edition 2015 | {"middle": ["Floral Notes"], "base": ["Cedar", "Musk", "Peach"], "top": ["Citruses"]} | [] | 0 | ["floral", "citrus", "fruity", "woody", "musky"] | ["floral","citrus","fruity","woody","musky"] | 5 | no |
| 17304 | No 55 Bois de Sycomore | ["Benzoin", "Patchouli", "Spicy Notes", "sycamore"] | ["Benzoin","Patchouli","Spicy Notes","sycamore"] | 4 | ["warm spicy", "patchouli", "earthy", "woody", "balsamic"] | ["warm spicy","patchouli","earthy","woody","balsamic"] | 5 | yes |
| 17525 | Pink Riviera | {"middle": ["Sandalwood", "Turkish Rose", "Egyptian Jasmine"], "base": ["Amber", "White Musk"], "top": ["Mint", "Grapefruit", "Bergamot", "Italian Mandarin ", "Citron"]} | [] | 0 | ["citrus", "green", "rose", "aromatic", "fresh spicy"] | ["citrus","green","rose","aromatic","fresh spicy"] | 5 | no |
| 17598 | D Ailleurs | {"middle": ["Jasmine", "Mandarin Orange"], "base": ["Passion Flower", "Vetiver"], "top": ["Vanilla", "Peony"]} | [] | 0 | ["floral", "white floral", "vanilla", "woody", "citrus"] | ["floral","white floral","vanilla","woody","citrus"] | 5 | no |
| 17603 | Essentielle Vanille | ["Bergamot", "Vanilla", "Sandalwood"] | ["Bergamot","Vanilla","Sandalwood"] | 3 | ["woody", "powdery", "vanilla", "citrus", "balsamic"] | ["woody","powdery","vanilla","citrus","balsamic"] | 5 | yes |
| 17842 | Woman s Story | null | [] | 0 | null | [] | 0 | no |
| 18125 | New York | {"middle": ["Thyme", "Cinnamon", "Pepper", "Paprika", "Patchouli", "Cedar"], "base": ["Amber", "Vanilla", "Leather"], "top": ["Bergamot", "Amalfi Lemon", "Cloves", "Lavender", "Green Notes"]} | [] | 0 | ["citrus", "fresh spicy", "aromatic", "warm spicy", "green"] | ["citrus","fresh spicy","aromatic","warm spicy","green"] | 5 | no |
| 18197 | L Air | ["Jasmine", "Honeysuckle", "Violet", "Magnolia", "Freesia", "Rose", "Palisander Rosewood", "Patchouli"] | ["Jasmine","Honeysuckle","Violet","Magnolia","Freesia","Rose","Palisander Rosewood","Patchouli"] | 8 | ["white floral", "floral", "powdery", "fruity", "aquatic"] | ["white floral","floral","powdery","fruity","aquatic"] | 5 | yes |
| 18503 | PG14 Iris Taizo | ["Fig Honey", "iris", "Mexican Vanilla", "Cardamom", "Kyara Incense (olibanum)", "Woody Notes"] | ["Fig Honey","iris","Mexican Vanilla","Cardamom","Kyara Incense (olibanum)","Woody Notes"] | 6 | ["woody", "powdery", "warm spicy", "floral", "balsamic", "honey"] | ["woody","powdery","warm spicy","floral","balsamic","honey"] | 6 | yes |
| 19673 | Chergui | ["Tobacco Leaf", "Honey", "iris", "Sandalwood", "Amber", "Musk", "Incense", "Rose", "Hay"] | ["Tobacco Leaf","Honey","iris","Sandalwood","Amber","Musk","Incense","Rose","Hay"] | 9 | ["sweet", "balsamic", "tobacco", "honey", "powdery", "amber"] | ["sweet","balsamic","tobacco","honey","powdery","amber"] | 6 | yes |
| 22243 | Velvet Exotic Leather | ["Leather", "Labdanum", "Styrax", "Juniper Berries", "Clary Sage", "Lavender", "Rum", "Incense", "Olibanum"] | ["Leather","Labdanum","Styrax","Juniper Berries","Clary Sage","Lavender","Rum","Incense","Olibanum"] | 9 | ["balsamic", "smoky", "aromatic", "leather", "fresh spicy"] | ["balsamic","smoky","aromatic","leather","fresh spicy"] | 5 | yes |
| 22478 | New Tradition | {"middle": ["Carnation", "iris", "Ylang-Ylang", "Rose", "Geranium", "Cloves"], "base": ["Patchouli", "Musk", "Vetiver"], "top": ["Lavender", "Bergamot", "Lemon"]} | [] | 0 | ["aromatic", "floral", "fresh spicy", "warm spicy", "woody", "citrus"] | ["aromatic","floral","fresh spicy","warm spicy","woody","citrus"] | 6 | no |
| 22731 | Pret a Porter | {"middle": ["Peony", "Water Lily", "Gardenia"], "base": ["Amber", "Musk", "Vanila"], "top": ["Orange", "Passionfruit", "Mandarin Orange", "Raspberry", "Bergamot", "Watermelon", "Lemon"]} | [] | 0 | ["citrus", "sweet", "vanilla", "fruity", "fresh"] | ["citrus","sweet","vanilla","fruity","fresh"] | 5 | no |
| 23639 | Potiche | {"middle": ["Heliotrope", "Lilac", "Mimosa"], "base": ["Musk", "Vanille"], "top": ["Bergamot"]} | [] | 0 | ["floral", "vanilla", "musky", "powdery", "citrus"] | ["floral","vanilla","musky","powdery","citrus"] | 5 | no |
| 24178 | Gocce di Napoleon | {"middle": ["Lavender", "Jasmine", "Rose", "Basil", "Black Currant", "Pepper"], "base": ["Musk", "French labdanum", "Patchouli", "oak moss", "Incense", "Myrhh"], "top": ["Bergamot", "Amalfi Lemon", "Orange", "Mandarin Orange", "Peach", "Clary Sage"]} | [] | 0 | ["fresh spicy", "citrus", "aromatic", "woody", "earthy", "balsamic"] | ["fresh spicy","citrus","aromatic","woody","earthy","balsamic"] | 6 | no |
| 24412 | 417 | {"middle": ["Vetiver", "Teak Wood", "Patchouli"], "base": ["Ambergris", "White Musk"], "top": ["Olibanum", "Cypress", "Coffee", "Carnation"]} | [] | 0 | ["woody", "warm spicy", "aromatic", "balsamic", "patchouli", "amber"] | ["woody","warm spicy","aromatic","balsamic","patchouli","amber"] | 6 | no |
| 24448 | Ladamo | {"middle": ["Tobacco", "Licorice", "Sandalwood"], "base": ["Mimosa", "Moss", "Juniper", "Water Notes"], "top": ["Soil tincture", "Magnolia", "Ginger"]} | [] | 0 | ["fresh spicy", "woody", "sweet", "earthy", "tobacco"] | ["fresh spicy","woody","sweet","earthy","tobacco"] | 5 | no |
| 24657 | To Be Woman | {"middle": ["Sweet Notes", "White Flowers"], "base": ["Woodsy Notes", "Musk"], "top": ["Lime", "Clementine", "Granny Smith apple"]} | [] | 0 | ["sweet", "citrus", "fruity", "green", "fresh"] | ["sweet","citrus","fruity","green","fresh"] | 5 | no |
| 26206 | White Leather | ["Virginia Cedar", "Guava", "Green Notes", "iris", "Jasmine", "Rose", "Patchouli", "Agarwood (Oud)", "Sandalwood", "Amber", "Musk", "Leather", "Vanille"] | ["Virginia Cedar","Guava","Green Notes","iris","Jasmine","Rose","Patchouli","Agarwood (Oud)","Sandalwood","Amber","Musk","Leather","Vanille"] | 13 | ["powdery", "woody", "vanilla", "leather", "oud", "animalic"] | ["powdery","woody","vanilla","leather","oud","animalic"] | 6 | yes |
| 26955 | Gardenia | {"middle": ["Ylang-Ylang", "Gardenia", "Narcissus", "Jasmine Sambac", "Coumarin"], "base": ["Heliotrope", "Musk"], "top": ["Bergamot", "Gardenia"]} | [] | 0 | ["white floral", "yellow floral", "animalic", "sweet", "woody"] | ["white floral","yellow floral","animalic","sweet","woody"] | 5 | no |
| 28702 | Your Life by Esprit Man | {"middle": ["Geranium"], "base": ["Tonka Bean", "Musk", "Patchouli", "Cedar"], "top": ["Black Pepper", "Apple", "Violet Leaf"]} | [] | 0 | ["fresh spicy", "ozonic", "musky", "aromatic", "aquatic"] | ["fresh spicy","ozonic","musky","aromatic","aquatic"] | 5 | no |
| 29841 | Orient Express | {"middle": ["Jasmine", "Sandalwood", "Cedar", "Rose", "Patchouli"], "base": ["Vanilla", "Musk"], "top": ["Lemon", "Mandarin Orange", "Peach"]} | [] | 0 | ["citrus", "woody", "powdery", "white floral", "patchouli", "balsamic"] | ["citrus","woody","powdery","white floral","patchouli","balsamic"] | 6 | no |
| 31345 | Naema Black | null | [] | 0 | null | [] | 0 | no |
| 32287 | Al Azea | ["Woody Notes", "Agarwood (Oud)", "Incense"] | ["Woody Notes","Agarwood (Oud)","Incense"] | 3 | ["oud", "balsamic", "woody", "smoky", "warm spicy"] | ["oud","balsamic","woody","smoky","warm spicy"] | 5 | yes |
| 34185 | Zeleniy Chai | {"middle": ["Rose", "Jasmine", "Neroli"], "base": ["White Woods", "Guaiac Wood", "Oakmoss", "Coumarin"], "top": ["Bergamot", "Cardamom", "Green Notes"]} | [] | 0 | ["woody", "green", "citrus", "aromatic", "warm spicy"] | ["woody","green","citrus","aromatic","warm spicy"] | 5 | no |
| 34708 | Eaudesalpes Vainilla Fruta RELAJANTE | ["Fruity Notes", "Vanilla"] | ["Fruity Notes","Vanilla"] | 2 | ["vanilla", "sweet", "fruity", "powdery", "sour"] | ["vanilla","sweet","fruity","powdery","sour"] | 5 | yes |
| 37509 | Aqua | {"middle": ["Water Notes", "Jasmine"], "base": ["Cedar"], "top": ["Bergamot"]} | [] | 0 | ["aquatic", "citrus", "woody", "white floral", "fresh"] | ["aquatic","citrus","woody","white floral","fresh"] | 5 | no |
| 37585 | Touch of Woman | {"middle": ["White Flowers"], "base": ["Sandalwood", "Vanilla"], "top": ["Bergamot", "Peach"]} | [] | 0 | ["vanilla", "powdery", "sweet", "fruity", "woody", "white floral"] | ["vanilla","powdery","sweet","fruity","woody","white floral"] | 6 | no |

## Recommendations
- Continue with translation/knowledge only after malformed source rows are reviewed and explicitly accepted as source-side defects.
- Keep parser behavior unchanged for valid JSON arrays to preserve lossless extraction.
- Flag malformed source rows in future pipeline quality gates without auto-repair.
