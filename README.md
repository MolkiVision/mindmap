# Mapa myšlienok

Lokálna vizuálna mind-map aplikácia na bežné poznámkovanie. Mapa je strom, ale
pod ním je graf: každý uzol môže mať **typované vzťahy** na iné uzly (aj v iných
mapách), na **poznámky** a na zápisy v **denníku**. Z inšpektora uzla sa dá
prejsť na jeho závislosti (aj reťazovo), na poznámky, ktoré sa ho týkajú, a na
dni v denníku, kde sa spomína.

Rešerš existujúcich aplikácií (XMind, MindNode, TheBrain, Obsidian, Heptabase,
Tana, Kinopio…) a z nej odvodené odporúčania sú v [`docs/research.md`](docs/research.md).

## Spustenie

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # produkčný build do dist/
npm run preview    # náhľad buildu
```

Dáta sa ukladajú iba v prehliadači (IndexedDB). Zálohu (JSON) stiahneš ikonou
v ľavom dolnom rohu a tou istou cestou ju vieš obnoviť. Pri prvom spustení sa
vytvorí ukážková mapa s poznámkami a zápisom v denníku.

## Čo appka vie

**Mapa**
- Uzly s automatickým vyváženým rozložením (koreň v strede, vetvy vľavo a vpravo), farba vetvy sa dedí, vlastná farba a ikona uzla.
- Editovanie klávesnicou: `Tab` podradený, `Enter` súrodenec, `Space`/`F2`/dvojklik úprava, písanie nahradí text, `Delete` zmaže podstrom, šípky navigujú, `Ctrl+↑/↓` presúva medzi súrodencami, `Ctrl+.` zbalí/rozbalí, `Ctrl+Z` / `Ctrl+Shift+Z` späť/znova.
- Presun uzla ťahaním na iný uzol (stane sa jeho podradeným).
- Voľné bubliny bez rodiča: dvojklik na plátno alebo tlačidlo v lište, ťahanie kamkoľvek, pozícia sa uloží. Ťahaním na uzol sa pripoja, uzol stromu sa dá „odtrhnúť" aj s podstromom.
- Obrázok v uzle: nahrať v inšpektore alebo vložiť zo schránky (Ctrl+V) pri vybranom uzle. Zobrazí sa ako náhľad do 256 px, dvojklik otvorí plnú veľkosť. Obrázky sa zmenšia na 640 px a ukladajú lokálne.
- Šírka uzla ťahaním okraja, veľkosť textu S/M/L/XL, predvolené hodnoty pre mapu.
- Zbalenie vetvy s počítadlom skrytých uzlov, mini-mapa, zoom, prispôsobenie zobrazenia.
- Export PNG, Markdown osnova, OPML (ide načítať do XMind / Freeplane), JSON záloha všetkého.
- Export jednej mapy aj s poznámkami a vzťahmi (`.map.json`) a import mapy zo súboru (JSON balík alebo Markdown osnova), ktorý mapu pridá a nič neprepíše.
- Tmavý a svetlý režim.

**Vzťahy**
- Typy vzťahov so smerom a farbou: závisí od, blokuje, súvisí s, je súčasťou, spôsobuje, je v rozpore s, je príkladom + vlastné typy (názov, opačný smer, farba).
- Vzťahy medzi uzlami v tej istej mape sa kreslia ako prerušované hrany so štítkom; vzťahy do iných máp sú v inšpektore s odkazom na mapu.
- Inšpektor zobrazuje vzťahy zoskupené podľa typu, reťazec závislostí v oboch smeroch (s detekciou cyklov) a uzly súvisiace s výberom zvýrazní na plátne.

**Poznámky a denník**
- Markdown poznámky s tagmi, náhľadom a autocomplete pre `[[wiki linky]]` na uzly a poznámky.
- `[[Názov uzla]]` v texte automaticky vytvorí väzbu „spomína“; poznámku ide tiež priložiť k uzlu explicitne.
- Denník: jeden zápis na deň, navigácia po dňoch; keď v zápise spomenieš uzol, objaví sa v inšpektore uzla v sekcii Denník.
- Backlinky: v poznámke vidíš, čo sa na ňu odkazuje.

**Hľadanie**
- `Ctrl+K` paleta: mapy, uzly, poznámky, zápisy denníka, rýchle akcie (nová mapa, nová poznámka, dnešný denník).
- Odkazy v URL (`#/map/<id>/node/<id>`, `#/note/<id>`, `#/journal/<dátum>`) sa dajú zdieľať so sebou samým ako záložky.

## Architektúra

| Vrstva | Technológia |
|---|---|
| UI | React 19 + TypeScript, Vite |
| Plátno | [@xyflow/react](https://reactflow.dev) (React Flow) s vlastnými uzlami a hranami |
| Rozloženie | vlastný algoritmus v `src/lib/layout.ts` (vyvážený strom, premenlivé šírky uzlov) |
| Stav | Zustand (`src/lib/store.ts`), snapshotový undo/redo per mapa |
| Ukladanie | Dexie (IndexedDB), zápis pri každej zmene |
| Markdown | marked + rozšírenie pre `[[wiki linky]]` |

### Dátový model (`src/lib/types.ts`)

- `MindMap` – mapa a jej koreňový uzol.
- `MapNode` – uzol stromu: `parentId`, `order`, text, farba, ikona, `collapsed`, voliteľne `width`, `size`, `image` a pre voľné bubliny (`parentId: null` mimo koreňa) pozícia `x`, `y`.
- `ImageRec` – zmenšený obrázok ako data URL s rozmermi; uzol naň odkazuje cez `image`.
- `Note` – poznámka alebo zápis denníka (`kind: 'journal'`, `date`).
- `Link` – smerovaná typovaná väzba medzi ľubovoľnými dvoma entitami (`node` alebo `note`). Väzby s `auto: true` sa generujú z `[[wiki liniek]]` a pri úprave poznámky sa prepočítajú.
- `RelationType` – typ väzby: `forward` / `inverse` popis, farba, smerovosť. Vstavané typy sú v `src/lib/relations.ts`, vlastné sa ukladajú do nastavení.

Strom (rodič–dieťa) je teda len jeden pohľad; graf väzieb žije vedľa neho a nie je obmedzený na jednu mapu.

## Štruktúra

```
src/
  lib/        typy, store, layout, databáza, export, seed
  components/ MapView (plátno), MindNode, Edges, Inspector, NoteEditor,
              NotesView, JournalView, Sidebar, CommandPalette, EntityPicker
docs/research.md  rešerš mind-map aplikácií
```
