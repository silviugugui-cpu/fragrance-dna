# Raw Database Audit

## Scope
- Workbook: public/FragranceDNA_RawPerfumeDatabase_Export.xlsx
- Worksheet: Sheet1
- Rows analyzed: 37,926
- Mode: Observation-only (read-only audit, no normalization, no data changes)

## Audit Categories
- Identity
- Brand
- Perfume
- Image
- Launch Year
- Notes
- Main Accords
- Performance (Longevity Votes, Sillage Votes)

## Identity
- Missing brand values: 0
- Missing perfume values: 3
- Duplicate brand+perfume identity keys: 518

Top duplicate identity keys:

| Identity Key (normalized) | Count | Sample Rows |
| --- | --- | --- |
| perry ellis\|\|perry ellis | 3 | 7816, 7817, 7818 |
| victoria s secret\|\|body by victoria | 3 | 9834, 9835, 9836 |
| victoria s secret\|\|love spell | 3 | 9902, 10055, 10095 |
| victoria s secret\|\|sheer love | 3 | 9912, 10058, 10107 |
| annick goutal\|\|eau d hadrien | 3 | 10807, 10855, 10860 |
| cacharel\|\|amor amor l eau | 3 | 11410, 11423, 11426 |
| cacharel\|\|noa l eau | 3 | 11412, 11425, 11428 |
| courreges\|\|courreges in blue | 3 | 12606, 12607, 12608 |
| jacques fath\|\|green water | 3 | 15164, 15165, 15185 |
| bejar\|\|love day | 3 | 30258, 30279, 30280 |
| zara\|\|zara for him | 3 | 31160, 31161, 31162 |
| zara\|\|zara woman gold | 3 | 31197, 31198, 31199 |
| zara\|\|zara woman rose gold | 3 | 31201, 31202, 31203 |
| novaya zarya\|\|driver | 3 | 34197, 34198, 34199 |
| o boticario\|\|ops | 3 | 37234, 37235, 37236 |
| adidas\|\|adidas adrenaline | 2 | 142, 143 |
| aeropostale\|\|aero new york 1987 | 2 | 217, 218 |
| american eagle\|\|live | 2 | 458, 459 |
| american eagle\|\|real | 2 | 461, 462 |
| american eagle\|\|seventy seven | 2 | 463, 464 |

## Brand
- Unique brands: 2,571

Top brands by row count:

| Brand | Rows |
| --- | --- |
| Avon | 644 |
| Demeter Fragrance | 358 |
| Guerlain | 332 |
| Victoria s Secret | 288 |
| O Boticario | 241 |
| DSH Perfumes | 234 |
| Novaya Zarya | 228 |
| Zara | 224 |
| Natura | 217 |
| Yves Rocher | 217 |
| Givenchy | 204 |
| Ajmal | 199 |
| Christian Dior | 189 |
| Black Phoenix Alchemy Lab | 172 |
| Yves Saint Laurent | 171 |
| Al Haramain Perfumes | 168 |
| Jequiti | 167 |
| Rasasi | 155 |
| CIEL Parfum | 149 |
| Jeanne Arthes | 146 |
| Ulric de Varens | 142 |
| Giorgio Armani | 141 |
| L Occitane en Provence | 138 |
| Donna Karan | 137 |
| Calvin Klein | 133 |

Suspected duplicate spellings (normalization-collision groups):

| Normalized Key | Variants |
| --- | --- |
| fragrancedubois | Fragrance Du Bois ; Fragrance du Bois |
| lacquadifiori | L acqua Di Fiori ; L acqua di Fiori |

## Perfume
- Unique perfume names: 33,962
- Missing perfume values: 3

Top repeated perfume names (across rows):

| Perfume | Rows |
| --- | --- |
| Patchouli | 39 |
| Rose | 38 |
| Vetiver | 31 |
| Gardenia | 27 |
| Black | 24 |
| Musk | 23 |
| Gold | 22 |
| Love | 22 |
| Vanille | 21 |
| Amber | 19 |
| Jasmin | 19 |
| Lavender | 19 |
| White Musk | 19 |
| Jasmine | 18 |
| Iris | 17 |
| Vanilla | 17 |
| Ambre | 16 |
| Magnolia | 16 |
| Vetyver | 16 |
| Oud | 15 |
| No 1 | 14 |
| Tuberose | 14 |
| Blue | 13 |
| Green Tea | 13 |
| Lily of the Valley | 13 |

## Image
- Missing image values: 0

Sample rows with missing image:

| Row | Brand | Perfume |
| --- | --- | --- |

## Launch Year
- Missing launch year: 11,210
- Invalid launch year: 1
- Future launch year: 0
- Distribution range (valid years): 1774 - 2017

Launch year distribution (top years):

| Year | Rows |
| --- | --- |
| 2015 | 2994 |
| 2014 | 2652 |
| 2016 | 2594 |
| 2013 | 2346 |
| 2012 | 2221 |
| 2011 | 1790 |
| 2010 | 1547 |
| 2009 | 1388 |
| 2008 | 1353 |
| 2007 | 1053 |
| 2006 | 813 |
| 2005 | 602 |
| 2004 | 471 |
| 2003 | 464 |
| 2000 | 355 |
| 2001 | 336 |
| 2002 | 310 |
| 1999 | 259 |
| 1998 | 219 |
| 1997 | 213 |
| 1996 | 180 |
| 1995 | 175 |
| 1993 | 149 |
| 1994 | 139 |
| 1992 | 109 |
| 2017 | 108 |
| 1989 | 105 |
| 1988 | 102 |
| 1990 | 94 |
| 1987 | 85 |

Sample invalid launch year rows:

| Row | Value | Brand | Perfume |
| --- | --- | --- | --- |
| 25125 | 1533 | Santa Maria Novella | Acqua di Colonia |

## Notes
- Unique notes: 1,300
- Perfumes without notes: 957
- Rows with duplicated notes inside one perfume (sampled): 50
- Suspicious spellings (rare note close to common note): 6 samples

Note frequency distribution (top notes):

| Note | Frequency |
| --- | --- |
| Musk | 15059 |
| Jasmine | 11157 |
| Sandalwood | 10756 |
| Bergamot | 10529 |
| Amber | 10485 |
| Rose | 9151 |
| Patchouli | 8739 |
| Vanilla | 7794 |
| Cedar | 6830 |
| Mandarin Orange | 5202 |
| Vetiver | 4827 |
| Lemon | 3995 |
| Lily-of-the-Valley | 3758 |
| Lavender | 3713 |
| Tonka Bean | 3688 |
| Violet | 3360 |
| Ylang-Ylang | 3059 |
| Grapefruit | 3054 |
| iris | 3001 |
| Orange Blossom | 2901 |
| Peach | 2696 |
| Oakmoss | 2597 |
| Woody Notes | 2595 |
| Cardamom | 2591 |
| Orange | 2565 |
| Freesia | 2478 |
| Geranium | 2447 |
| Citruses | 2305 |
| Leather | 2293 |
| White Musk | 2091 |
| Cinnamon | 2064 |
| Neroli | 2021 |
| Pink Pepper | 1984 |
| Nutmeg | 1978 |
| Green Notes | 1976 |
| Black Currant | 1955 |
| Incense | 1934 |
| Tuberose | 1905 |
| Benzoin | 1877 |
| Agarwood (Oud) | 1869 |

Shortest non-empty note lists:

| Row | Brand | Perfume | Note Count |
| --- | --- | --- | --- |
| 77 | A Wing A Prayer Perfumes | Sarah | 1 |
| 166 | Adidas | Adidas Woman Active Start | 1 |
| 314 | Ajne | Kincaid | 1 |
| 364 | Alkemia Perfumes | Divine Goddess Musk | 1 |
| 370 | Alkemia Perfumes | Fire and Ice | 1 |
| 371 | Alkemia Perfumes | Ghost Fire | 1 |
| 372 | Alkemia Perfumes | Green Carnation | 1 |
| 408 | Aloha Beauty | Hawaiian Plumeria | 1 |
| 411 | Aloha Beauty | Tropical Gardenia | 1 |
| 418 | Alyssa Ashley | En Fleur | 1 |
| 432 | Alyssa Ashley | Wildflower | 1 |
| 524 | Amway | Shariel | 1 |
| 611 | Antica Farmacista | Grapefruit | 1 |
| 619 | Antonia s Flowers | Asoluto | 1 |
| 643 | Antonio Banderas | Diavolo Temptation per Donna | 1 |
| 693 | Anya s Garden | Ylang Tincture 2014 | 1 |
| 864 | Ava Luxe | Ambre Fonce | 1 |
| 873 | Ava Luxe | Bois Fonce | 1 |
| 878 | Ava Luxe | China Pearl | 1 |
| 885 | Ava Luxe | Egyptian Musk | 1 |

Longest note lists:

| Row | Brand | Perfume | Note Count |
| --- | --- | --- | --- |
| 4044 | DSH Perfumes | Mata Hari | 41 |
| 33045 | The Spirit of Dubai | Majalis | 41 |
| 4618 | Euphorium Brooklyn | 100 Tweeds | 39 |
| 5000 | Halston | Catalyst for Men | 38 |
| 33061 | Tola | Misqaal | 38 |
| 32456 | Nabeel | Hayati | 36 |
| 33059 | Tola | Masha | 36 |
| 12531 | Corday | Fame | 35 |
| 33986 | Nimere Parfums | Shades of Darkness | 35 |
| 4154 | DSH Perfumes | Giverny in Bloom | 34 |
| 5228 | House of Matriarch | Fitnessence | 34 |
| 35840 | Western Valley Avenue London | Signature IV | 34 |
| 18906 | Pierre Balmain | Ivoire de Balmain | 33 |
| 21318 | Art Landi Profumi | Art 02 Voglie di Mare | 33 |
| 4519 | Est e Lauder | Beautiful | 32 |
| 26902 | Jaguar | Jaguar for Men | 32 |
| 32472 | Nabeel | Layali Al Hub | 32 |
| 33966 | Nimere Parfums | La Gitane | 32 |
| 33985 | Nimere Parfums | Marquise | 32 |
| 4621 | Euphorium Brooklyn | Petales | 31 |

Sample duplicated notes inside one perfume:

| Row | Brand | Perfume | Duplicate Note |
| --- | --- | --- | --- |
| 50 | A Wing A Prayer Perfumes | SkyDancer | Saffron |
| 79 | A Wing A Prayer Perfumes | Tallulah B | Rose |
| 199 | Aedes de Venustas | Cierge De Lune | Musk |
| 200 | Aedes de Venustas | Copal Azur | Incense |
| 200 | Aedes de Venustas | Copal Azur | Incense |
| 249 | Aether Arts Perfume | Burner Perfume No 6 Reflection | Sage |
| 251 | Aether Arts Perfume | Burner Perfume No 5 Incense Indica | Choya Loban |
| 512 | Amway | Anticipate | Pink Pepper |
| 827 | Atelier Cologne | Oud Saphir | Birch |
| 1091 | Avon | Ice Sheers Luscious | Lemon |
| 1092 | Avon | Ice Sheers Refreshing | Pear |
| 1092 | Avon | Ice Sheers Refreshing | Sugar |
| 1361 | Avon | Musk Oxygen | Lavender |
| 1421 | Avon | Far Away Dreams | Floral Notes |
| 1456 | Avon | Incandessence | Orchid |
| 1676 | Bath and Body Works | Chocolate Amber | Honey |
| 1736 | Bath and Body Works | Sparkling Peach | Peach |
| 1737 | Bath and Body Works | Sweet Cinnamon Pumpkin | Ginger |
| 1751 | Bath and Body Works | Warm Vanilla Sugar | Vanilla |
| 1751 | Bath and Body Works | Warm Vanilla Sugar | Vanilla |
| 1764 | Bath and Body Works | Waikiki Beach Coconut | Coconut |
| 1766 | Bath and Body Works | Lavender Spring Apricot | Lavender |
| 1818 | Betty Boop | Sexy Betty | plum |
| 1840 | Bijan | Bijan Men | Musk |
| 1857 | Bill Blass | Basic Black | Carnation |
| 1857 | Bill Blass | Basic Black | Ylang-Ylang |
| 2062 | Blackbird | Targa | Olibanum |
| 2385 | Calvin Klein | Ck One Electric | Cedar |
| 2390 | Calvin Klein | CK One Scene | Ginger |
| 2413 | Calvin Klein | Escape | Oakmoss |

Sample suspicious note spellings:

| Rare Note | Probable Similar Note | Edit Distance |
| --- | --- | --- |
| Beech | Birch | 2 |
| Tamarisk | Tamarind | 2 |
| Red Maple | Red Apple | 2 |
| vanilla orchid | Vanilla orchid | 0 |
| Narciussus | Narcissus | 1 |
| Rumex | Rum | 2 |

## Main Accords
- Unique accords: 80
- Perfumes without accords: 969
- Rows with duplicated accords inside one perfume (sampled): 0

Accord frequency distribution (top accords):

| Accord | Frequency |
| --- | --- |
| woody | 20505 |
| citrus | 15780 |
| floral | 14320 |
| aromatic | 11676 |
| sweet | 11504 |
| fresh spicy | 11356 |
| white floral | 9737 |
| fruity | 9376 |
| green | 8733 |
| powdery | 8502 |
| balsamic | 8216 |
| warm spicy | 8101 |
| musky | 7549 |
| vanilla | 5654 |
| rose | 5561 |
| amber | 5017 |
| fresh | 4979 |
| patchouli | 2859 |
| animalic | 2346 |
| earthy | 2104 |
| herbal | 1771 |
| aquatic | 1744 |
| leather | 1584 |
| soft spicy | 1560 |
| smoky | 1432 |
| yellow floral | 1403 |
| ozonic | 1273 |
| tropical | 1219 |
| oud | 1187 |
| tuberose | 917 |
| marine | 871 |
| cinnamon | 784 |
| sour | 687 |
| honey | 673 |
| cacao | 580 |
| aldehydic | 561 |
| caramel | 554 |
| tobacco | 547 |
| coconut | 520 |
| almond | 497 |

Sample duplicated accords inside one perfume:

| Row | Brand | Perfume | Duplicate Accord |
| --- | --- | --- | --- |

## Performance
- Perfumes with no performance data (all longevity and sillage votes zero/empty): 8,904
- Perfumes with longevity only: 604
- Perfumes with sillage only: 1,683

Total longevity vote distribution:

| Longevity Bucket | Total Votes |
| --- | --- |
| 2 | 212000 |
| 3 | 199299 |
| 4 | 124376 |
| 1 | 74637 |
| 0 | 57383 |

Total sillage vote distribution:

| Sillage Bucket | Total Votes |
| --- | --- |
| 1 | 318210 |
| 2 | 183922 |
| 0 | 147311 |
| 3 | 123873 |

Histogram of total longevity votes per perfume:

| Range | Perfumes |
| --- | --- |
| 0 | 10587 |
| 1-5 | 13782 |
| 6-10 | 4266 |
| 11-20 | 3423 |
| 21+ | 5868 |

Histogram of total sillage votes per perfume:

| Range | Perfumes |
| --- | --- |
| 0 | 9508 |
| 1-5 | 13146 |
| 6-10 | 4632 |
| 11-20 | 3769 |
| 21+ | 6871 |

## Structural Observation
Notes structures:

| Structure | Rows |
| --- | --- |
| object | 24516 |
| array | 12453 |
| empty | 957 |

Accords structures:

| Structure | Rows |
| --- | --- |
| array | 36957 |
| empty | 969 |

Longevity structures:

| Structure | Rows |
| --- | --- |
| array | 37926 |

Sillage structures:

| Structure | Rows |
| --- | --- |
| array | 37926 |

Sample invalid notes structures:

| Row | Brand | Perfume | Raw Notes (truncated) |
| --- | --- | --- | --- |

Sample invalid accords structures:

| Row | Brand | Perfume | Raw Accords (truncated) |
| --- | --- | --- | --- |

Sample invalid performance structures:

| Row | Brand | Perfume | Longevity Raw | Sillage Raw |
| --- | --- | --- | --- | --- |

## Automatically Discovered Anomalies
- Unexpected empty values exist in key identity/media fields (brand: 0, perfume: 3, image: 0).
- Duplicate brand+perfume identities detected: 518 duplicate keys.
- Launch year anomalies detected (invalid: 1, future: 0).
- Duplicated tokens inside single perfumes detected (notes samples: 50, accords samples: 0).
- Performance vote outliers detected above IQR threshold (56.00 total votes).
- Very rare note spellings with high similarity to common notes detected (6 samples).

Performance total-vote outliers (IQR-based):

| Row | Brand | Perfume | Longevity Votes | Sillage Votes | Total Votes |
| --- | --- | --- | --- | --- | --- |
| 20796 | Yves Saint Laurent | La Nuit de l Homme | 1841 | 1964 | 3805 |
| 11764 | Chanel | Bleu de Chanel | 1797 | 1847 | 3644 |
| 12662 | Creed | Aventus | 1644 | 1735 | 3379 |
| 19995 | Thierry Mugler | Alien | 1639 | 1723 | 3362 |
| 14804 | Hermes | Terre d Hermes | 1578 | 1668 | 3246 |
| 30712 | Paco Rabanne | 1 Million | 1590 | 1624 | 3214 |
| 16254 | Lancome | La Vie Est Belle | 1556 | 1615 | 3171 |
| 15442 | Jean Paul Gaultier | Le Male | 1558 | 1595 | 3153 |
| 20015 | Thierry Mugler | Angel | 1544 | 1606 | 3150 |
| 19978 | Thierry Mugler | A Men | 1544 | 1558 | 3102 |
| 22231 | Dolce Gabbana | The One for Men | 1527 | 1564 | 3091 |
| 11787 | Chanel | Coco Mademoiselle | 1470 | 1496 | 2966 |
| 16168 | Lalique | Encre Noire | 1445 | 1505 | 2950 |
| 12184 | Christian Dior | Hypnotic Poison | 1445 | 1486 | 2931 |
| 35379 | Issey Miyake | L Eau d Issey Pour Homme | 1404 | 1436 | 2840 |
| 9468 | Tom Ford | Black Orchid | 1354 | 1452 | 2806 |
| 12071 | Christian Dior | Dior Homme Intense | 1243 | 1346 | 2589 |
| 12092 | Christian Dior | Fahrenheit | 1250 | 1296 | 2546 |
| 25720 | Versace | Versace Pour Homme | 1167 | 1221 | 2388 |
| 22806 | Giorgio Armani | Acqua di Gio | 1191 | 1186 | 2377 |
| 35244 | Viktor Rolf | Spicebomb | 1122 | 1211 | 2333 |
| 22214 | Dolce Gabbana | D G Light Blue | 1135 | 1156 | 2291 |
| 20788 | Yves Saint Laurent | L Homme | 1134 | 1131 | 2265 |
| 11757 | Chanel | Allure Homme Sport | 1110 | 1136 | 2246 |
| 26437 | Burberry | London for Men | 1113 | 1116 | 2229 |
| 2457 | Calvin Klein | Euphoria | 1095 | 1113 | 2208 |
| 9502 | Tom Ford | Tobacco Vanille | 1070 | 1132 | 2202 |
| 34592 | Davidoff | Cool Water | 1094 | 1105 | 2199 |
| 2272 | Britney Spears | Fantasy | 1086 | 1096 | 2182 |
| 25681 | Versace | Crystal Noir | 1044 | 1095 | 2139 |

Notes list-length outliers (IQR-based):

| Row | Brand | Perfume | Note Count |
| --- | --- | --- | --- |
| 4044 | DSH Perfumes | Mata Hari | 41 |
| 33045 | The Spirit of Dubai | Majalis | 41 |
| 4618 | Euphorium Brooklyn | 100 Tweeds | 39 |
| 5000 | Halston | Catalyst for Men | 38 |
| 33061 | Tola | Misqaal | 38 |
| 32456 | Nabeel | Hayati | 36 |
| 33059 | Tola | Masha | 36 |
| 12531 | Corday | Fame | 35 |
| 33986 | Nimere Parfums | Shades of Darkness | 35 |
| 4154 | DSH Perfumes | Giverny in Bloom | 34 |
| 5228 | House of Matriarch | Fitnessence | 34 |
| 35840 | Western Valley Avenue London | Signature IV | 34 |
| 18906 | Pierre Balmain | Ivoire de Balmain | 33 |
| 21318 | Art Landi Profumi | Art 02 Voglie di Mare | 33 |
| 4519 | Est e Lauder | Beautiful | 32 |
| 26902 | Jaguar | Jaguar for Men | 32 |
| 32472 | Nabeel | Layali Al Hub | 32 |
| 33966 | Nimere Parfums | La Gitane | 32 |
| 33985 | Nimere Parfums | Marquise | 32 |
| 4621 | Euphorium Brooklyn | Petales | 31 |
| 20839 | Yves Saint Laurent | Opium | 31 |
| 20855 | Yves Saint Laurent | Opium Parfum | 31 |
| 21320 | Art Landi Profumi | Art 04 Il Solo E l Unico Legno | 31 |
| 27842 | Roja Dove | Diaghilev | 31 |
| 28474 | biehl parfumkunstwerke | al03 | 31 |
| 30473 | Loewe | Aire Loewe | 31 |
| 32457 | Nabeel | Heritage Man | 31 |
| 36959 | Natura | Kriska | 31 |
| 1840 | Bijan | Bijan Men | 30 |
| 7823 | Perry Ellis | Perry Ellis for Men Original 1985 | 30 |

---
Generated on: 2026-07-06T20:11:08.201Z
