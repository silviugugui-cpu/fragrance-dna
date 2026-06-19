# FragranceDNA_Project_Update_Pack_v1

## Purpose

Acest document consolidează toate deciziile majore luate după MasterSpec v2 și după Compatibility & Profiling Architecture.

---

# LOCKED PRINCIPLES

## Core Principle

FragranceDNA nu profilează parfumuri.

FragranceDNA profilează preferințe olfactive și experiențiale.

Parfumurile sunt:
- instrumente de măsurare;
- benchmark-uri diagnostice;
- expresii ale profilului rezultat.

## Source of Truth

Attribute Profile = Source of Truth

DNA Axes sunt derivate din Attribute Profile.

---

# DNA MODEL V1 (LOCKED)

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

---

# ATTRIBUTE MAPPING RULES (LOCKED)

- Fiecare atribut are 1 Primary Axis.
- Fiecare atribut poate avea 0-3 Secondary Axes.
- Total Weight = 1.00.
- Mapping-ul se face din perspectiva utilizatorului.
- Nu mapăm rolul atributului în parfumuri iconice.
- Attribute Profile este stratul canonic.
- DNA Profile este strat derivat.

---

# MASTERATTRIBUTEMAP V1
## Phase 1 – Primary Axis Layer (COMPLETE)

### Recognizable Smells

Freshness:
- Citrice
- Măr Verde
- Ananas
- Iarbă Tăiată
- Mentă
- Sare de Mare

Warmth:
- Fructe Dulci
- Miere
- Ciocolată

Comfort:
- Vanilie
- Ceai

Character:
- Fructe Negre
- Cafea
- Tutun
- Piele
- Piper

Elegance:
- Lemn
- Flori Albe

### Sensory Impressions

Freshness:
- Proaspăt
- Luminos
- Verde
- Acvatic

Warmth:
- Bogat

Complexity:
- Complex
- Evolutiv

Comfort:
- Dulce
- Natural
- Neted
- Cremos

Character:
- Întunecat
- Condimentat

Elegance:
- Echilibrat

Versatility:
- Curat

Uniqueness:
- Mineral

### Identity Signals

Elegance:
- Elegant
- Rafinat
- Sofisticat

Luxury:
- Luxos
- Exclusivist

Formality:
- Profesional

Uniqueness:
- Creativ
- Distinctiv
- Artistic

Character:
- Memorabil
- Modern
- Misterios
- Autentic

Presence:
- Încrezător
- Seducător
- Carismatic
- Energic

Comfort:
- Relaxat

### Behavioral Signals

Versatility:
- Ușor de Purtat
- Versatil
- Potrivit Zilnic
- Sigur
- Ușor de Apreciat

Formality:
- Potrivit Birou
- Potrivit Evenimente

Comfort:
- Confortabil
- Îți Ridică Moralul

Presence:
- Atrage Atenția
- Lasă Impresie
- Îți Dă Încredere

Luxury:
- Pare Scump

Character:
- Parfum Semnătură

Uniqueness:
- Provocator

Complexity:
- Necesită Timp

---

# DNA AXIS TEMPLATES V1 (LOCKED)

Freshness
= 0.60 Freshness
+ 0.20 Versatility
+ 0.15 Comfort
+ 0.05 Elegance

Warmth
= 0.60 Warmth
+ 0.20 Comfort
+ 0.15 Luxury
+ 0.05 Character

Complexity
= 0.60 Complexity
+ 0.20 Uniqueness
+ 0.15 Character
+ 0.05 Luxury

Elegance
= 0.60 Elegance
+ 0.20 Luxury
+ 0.15 Formality
+ 0.05 Character

Character
= 0.55 Character
+ 0.20 Presence
+ 0.15 Uniqueness
+ 0.10 Luxury

Presence
= 0.60 Presence
+ 0.20 Character
+ 0.10 Luxury
+ 0.10 Uniqueness

Comfort
= 0.60 Comfort
+ 0.20 Warmth
+ 0.15 Versatility
+ 0.05 Luxury

Uniqueness
= 0.60 Uniqueness
+ 0.20 Character
+ 0.15 Complexity
+ 0.05 Presence

Versatility
= 0.60 Versatility
+ 0.20 Comfort
+ 0.15 Freshness
+ 0.05 Formality

Luxury
= 0.60 Luxury
+ 0.20 Elegance
+ 0.10 Character
+ 0.10 Presence

Formality
= 0.60 Formality
+ 0.20 Elegance
+ 0.10 Versatility
+ 0.10 Luxury

---

# ATTRIBUTE RELATIONSHIP GRAPH V1 RULES (LOCKED)

- Relații bidirecționale.
- Relații pozitive.
- Minimum 3 relații per atribut.
- Maximum 5 relații per atribut.

Strength Levels:

Strong = 0.70 – 1.00
Medium = 0.40 – 0.69
Weak = 0.10 – 0.39

---

# ROADMAP

NEXT:

1. AttributeRelationshipGraph_v1
2. MasterAttributeMap_v1 Complete
3. CompatibilityEngine_v1
4. RecommendationEngine_v1
5. ProfileArtifactSystem_v1

