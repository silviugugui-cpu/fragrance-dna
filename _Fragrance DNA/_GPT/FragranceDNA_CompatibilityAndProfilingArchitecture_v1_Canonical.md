# FragranceDNA Compatibility & Profiling Architecture v1 Canonical

## Status
LOCKED

## Foundational Principle

FragranceDNA nu profilează preferința pentru parfumuri.
FragranceDNA profilează preferința pentru caracteristici olfactive și experiențiale.

Parfumurile sunt instrumente de măsurare.
Atributele sunt sursa de adevăr.

---

## Core Principle

Utilizatorul nu iubește un parfum.

Utilizatorul iubește:
- anumite mirosuri;
- anumite senzații;
- anumite experiențe;
- anumite tipare emoționale și sociale.

Parfumurile sunt manifestări ale acestor preferințe.

---

## Canonical Flow

Benchmark Fragrances
→ Evaluation Attributes
→ Attribute Profile
→ DNA Axes
→ Territories
→ Recommendations
→ Fragrances

---

## Source of Truth

### Attribute Profile

Attribute Profile este stratul fundamental al sistemului.

Exemplu:

- Honey = +100
- Tobacco = +85
- Mineral = -45
- Elegant = +70
- Memorable = +95

Toate celelalte straturi sunt derivate din acesta.

---

## DNA Model v1

1. Freshness
2. Warmth
3. Complexity
4. Elegance
5. Character
6. Presence
7. Comfort
8. Uniqueness
9. Versatility
10. Luxury
11. Formality

Status: LOCKED

---

## Evaluation Attributes

Fiecare benchmark conține exact 6 Evaluation Attributes.

Acestea pot proveni din:
- Core Attributes
- Supporting Attributes

Scopul lor este maximizarea valorii diagnostice.

---

## Evaluation Scale

UI:

1. Urăsc
2. Nu îmi place foarte mult
3. Nu îmi place
4. Neutru
5. Îmi place
6. Îmi place foarte mult
7. Ador

Valori interne:

-100
-66
-33
0
+33
+66
+100

Status: LOCKED

---

## Attribute Influence Rule

Impact direct:
atributul evaluat primește exact scorul utilizatorului.

Impact indirect:
atributele înrudite sunt ajustate ponderat conform unui mapping canonic.

Semnalele negative folosesc aceeași logică.

---

## Diagnostic Strength

Fiecare benchmark are un Diagnostic Strength.

Influența unei evaluări este ponderată de:
- Diagnostic Strength
- Attribute Weight
- Confidence
- Mapping Weight

---

## Overall Rating Rule

Nota generală a parfumului NU participă la profilare.

Este utilizată exclusiv pentru:
- colecție;
- wishlist;
- tier lists;
- statistici;
- artefacte personale.

---

## Profile Maturity Model

Profile Maturity =
Coverage +
Consistency +
Data Volume

### Coverage
Cât din spațiul diagnostic a fost explorat.

### Consistency
Cât de coerente sunt preferințele observate.

### Data Volume
Cantitatea totală de informație colectată.

Status: LOCKED

---

## Discovery Mission System

Fiecare benchmark conține:

### Diagnostic Purpose
Intern.
Invizibil utilizatorului.

### User Mission
Vizibil utilizatorului.
Scris narativ.
Orientat spre curiozitate și descoperire.

---

## Discovery Philosophy

Utilizatorul nu completează un chestionar.

Utilizatorul își descoperă identitatea olfactivă.

Fiecare benchmark reprezintă un nou capitol al acestei descoperiri.

---

## Recommendation Philosophy

Benchmark-urile sunt recomandate pe baza:
- golurilor diagnostice;
- creșterii Profile Maturity;
- valorii experienței de descoperire.

---

## Canonical FragranceDNA Principle

Parfumurile nu sunt centrul sistemului.

Atributele olfactive și experiențiale sunt centrul sistemului.

Parfumurile sunt:
1. instrumente de măsurare la intrare;
2. expresii ale profilului la ieșire.

Acesta este nucleul conceptual al FragranceDNA.
