# Manifest imagini parfumuri pentru Vercel Blob

## Selecția

Fișierul de transmis împreună cu proiectul este [vercel-blob-olfactive-score-manifest.csv](../data/generated/vercel-blob-olfactive-score-manifest.csv). Lista este ordonată descrescător după Olfactive Score.

- **8.049 imagini unice**, disponibile local și mapate la un parfum cu scor intern.
- Total exact al fișierelor: **406.146.092 bytes** = **406.1 MB** (decimal) / **387.3 MiB**.
- Am folosit o limită operațională de **850.000.000 bytes**, sub plafonul de 900 MB. Toate imaginile eligibile încap; nu a fost nevoie să eliminăm parfumuri cu scor mai mic.
- Scorul provine din coloana internă fragrantiq_rating_100, metoda weighted-community-rating-v1: 80% apreciere a comunității ajustată cu un prior de 50 de voturi către mediana sursei și 20% percentilă de popularitate în cadrul aceleiași surse. Include și codul badge-ului Olfactive Score deja stabilit de proiect.
- Au fost găsite 8.137 înregistrări cu scor și fotografie locală. Am exclus 88 înregistrări care indicau fișiere identice între parfumuri, ca să evităm asocieri ambigue, și 79 înregistrări cu fotografie dar fără Olfactive Score.
- Asocierea exactă se face prin source_record_id / canonical_key și master_row_id, niciodată după numele parfumului.

## Cerințe pentru AI-ul din Visual Studio

1. Citește manifestul CSV și încarcă numai fișierele din source_file_repo_relative, păstrând bytes originali. Înainte de upload, verifică image_sha256 și image_size_bytes.
2. Folosește target_blob_key exact ca pathname-ul Vercel Blob și cheie deterministă, fără sufix aleator. Citește BLOB_READ_WRITE_TOKEN din environment-ul local; nu îl scrie în cod, loguri sau Git.
3. După upload reușit, salvează URL-ul întors de Blob ca asset pentru înregistrarea identificată prin canonical_key / master_row_id. Nu schimba Olfactive Score, badge-ul, imaginea locală sau alte date ale parfumului. Păstrează local_image_path ca fallback.
4. Actualizează rezolvarea imaginilor astfel încât URL-ul Blob mapat să fie preferat pentru înregistrările din listă, iar calea locală să rămână fallback; în UI-ul actual calea locală poate avea prioritate în fața image_url.
5. Fă procesul reluabil și idempotent: nu reîncărca un obiect cu aceeași cheie și hash valid, persistă URL-ul numai după upload reușit, raportează erorile după source_record_id și verifică la final numărul de obiecte și totalul bytes. Nu încărca înregistrări absente din CSV.
6. Setează acces public doar conform configurării și politicii proiectului. Documentația proiectului precizează că atribuirea sursei sau existența imaginii local nu confirmă drepturile de redistribuire.

Manifestul nu modifică și nu înlocuiește baza SQLite; doar descrie fișierele și cheile de asociere pentru procesul de upload.

## Utilizare în proiect

Store-ul public `olfactivedna-product-photos` este conectat proiectului Vercel.
Tokenul rămâne exclusiv în mediul local și în configurația Vercel.

```powershell
node --import tsx scripts\uploadPerfumeImagesToBlob.ts
node --import tsx scripts\uploadPerfumeImagesToBlob.ts --apply --rights-confirmed --limit 1800
```

Publicarea necesită confirmarea drepturilor pentru imaginile selectate. URL-ul
verificat se salvează în `blobImageUrl`; calea locală și URL-ul original rămân
nemodificate. Reluarea verifică obiectele existente fără a le încărca din nou.

### Limitele variantei gratuite

Planul Hobby are și limite de operațiuni: 2.000 de operațiuni avansate și
10.000 de operațiuni simple, nu doar 1 GB de stocare și 10 GB de transfer.
Fiecare upload consumă o operațiune avansată. Încărcarea întregii selecții de
8.049 de obiecte într-o singură perioadă nu se încadrează în limita gratuită.

Lotul aprobat este de maximum 1.800 de imagini, în ordinea din CSV, cu rezervă
pentru listări și administrare. Scriptul refuză depășirea a 1.800 de obiecte
încărcate în ultimele 31 de zile. Verifică și consumul întregii echipe înainte
de fiecare lot; interacțiunile din dashboard și alte store-uri consumă cote.
După resetarea cotei și expirarea ferestrei de siguranță, crește limita
cumulativă: 3600, 5400, 7200, apoi 8049. Nu există un job lunar automat.
Depășirea cotelor Hobby poate suspenda accesul la Blob, chiar dacă stocarea
este sub 1 GB.

Rapoarte locale:

- `data/generated/vercel-blob-upload-events.jsonl`
- `data/generated/vercel-blob-upload-summary.json`

Documentație: https://vercel.com/docs/vercel-blob/usage-and-pricing
