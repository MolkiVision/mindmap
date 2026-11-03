# Rešerš: mind-mapping a „visual thinking“ aplikácie (stav k novembru 2026)

Cieľ rešerše: zistiť, čo dnešné mind-map a vizuálne poznámkové aplikácie dokážu, aby sme vedeli navrhnúť vlastnú jednoduchú vizuálnu mind-map appku na bežné poznámkovanie, kde sú uzly mapy prepojené s poznámkami a denníkom cez **typované vzťahy** (nie len stromové „bubliny“).

Metodická poznámka: rešerš bol robený cez webové vyhľadávanie (WebSearch). Priame načítanie oficiálnych stránok (xmind.app, thebrain.com, mindnode.com, heptabase.com, obsidian.md, docs.freeplane.org, tana.inc, docs.capacities.io, whimsical.com, help.kinopio.club…) bolo v tomto prostredí zablokované sieťovými pravidlami, preto sú niektoré detaily (hlavne ceny) čerpané z agregátorov a treba ich pred rozhodnutím overiť na oficiálnych stránkach. Ceny sa v roku 2026 u viacerých nástrojov menili (Whimsical, Excalidraw+, Capacities, Tana, Heptabase).

---

## 1. Prehľad aplikácií

### 1.1 Klasické mind-map editory

#### XMind
- **Editovanie:** Tab = podtéma, Enter = súrodenec, Shift+Enter = téma pred / rodič, Ctrl+/ zbaliť/rozbaliť, Ctrl+Shift+L = vzťah (relationship), Ctrl+B = hranica (boundary). Auto-layout podľa štruktúry (logic chart, org chart, fishbone, timeline, matrix, tree table), drag&drop, markery (ikony), štítky (labels), poznámky k uzlu, obrázky, hyperlinky, Summary, Boundary. Pitch mode (prezentácia), ZEN mode.
- **Mimo stromu:** „Relationship“ – voľná čiara medzi dvoma ľubovoľnými témami (alebo hranicami) s popisom; obojsmerné topic-linky medzi témami (skok klikom); floating topics (plávajúce témy mimo stromu). Markery a labely fungujú ako tagy, navigačný panel vie zvýrazniť témy s daným labelom.
- **Poznámky/denník:** poznámka k uzlu (rich text), žiadny denník; nie je to poznámkový systém.
- **Export/import:** import FreeMind .mm, MindManager, MindNode, Lighten, OPML, Markdown, TextBundle, DOCX; export PDF, PNG, SVG, Markdown, Word, Excel, PowerPoint, OPML, TextBundle. Natívny formát .xmind (ZIP s JSON).
- **Platforma/cena:** Win/Mac/Linux/iOS/Android/web. Free (s vodoznakom), Pro ≈ 4,92–10 $/mes., Premium ≈ 8–15 $/mes. podľa fakturácie.
- **Cool:** veľmi bohatý výber štruktúr a tém; Pitch mode; jeden z najlepších exportov.
- Zdroje: https://xmind.app/features/ , https://xmind.com/blog/shortcuts-in-xmind-that-improve-mapping-efficiency , https://apps.apple.com/app/xmind-mind-map-brainstorm/id1286983622 , https://toolradar.com/tools/xmind/pricing

#### MindNode (MindNode Next / Classic)
- **Editovanie:** Tab = dieťa, Enter = súrodenec (v outline režime), Cmd+L = cross-connection, Shift+Cmd+F = Focus mode, Cmd+1/2/3 = mapa / outline / obe. Quick Entry (rýchly zápis), automatický layout, stickers, témy, úlohy (checkboxy s progresom), poznámky k uzlu, obrázky, vizuálne tagy (farebné štítky), Focus mode (vyblednutie ostatného).
- **Mimo stromu:** cross-connections (čiary medzi uzlami, dajú sa skryť naraz), **Visual Tags** (tag-highlight režim zvýrazní uzly s daným tagom cez celú mapu), **Document Linking** – prepojenie uzlov naprieč dokumentmi.
- **Poznámky/denník:** poznámka k uzlu; integrácia s Apple Shortcuts/Reminders; bez denníka.
- **Export/import:** OPML, Markdown, FreeMind .mm, PDF, SVG, PNG, TextBundle, RTF/DOCX/CSV/TXT.
- **Platforma/cena:** iba Apple (Mac/iPad/iPhone, Vision). Free prezerač, MindNode Plus ≈ 2,49–2,99 $/mes.; v Setape.
- **Cool:** najelegantnejší UX, tag-highlight, Focus mode, plynulé Quick Entry.
- Zdroje: https://www.mindnode.com/article/shortcuts-ios , https://mindnode.com/article/shortcuts-mac , https://apps.apple.com/hu/app/mindnode-next/id6446116532 , https://setapp.com/apps/mindnode-next

#### MindMeister
- **Editovanie:** Insert/Tab = dieťa, Enter = súrodenec, Shift+Enter = súrodenec nad, Delete, Esc. Ikony, poznámky, odkazy, prílohy, farby, témy, komentáre, hlasovanie, prezentačný režim. Od 3/2026 „Meister AI“ (generovanie mapy z promptu).
- **Mimo stromu:** „connections“ – šípky medzi témami (kreslia sa z jedného uzla do druhého, dve medzi rovnakou dvojicou len ak každá začína z inej strany); spojenia sa nezobrazujú, keď je uzol zbalený; používatelia dlhodobo žiadajú pomenované/typované spojenia.
- **Poznámky/denník:** poznámka k uzlu, úlohy cez MeisterTask; bez denníka.
- **Export/import:** import text, MindManager, FreeMind; export Word, PPT, PDF, PNG, MindManager, FreeMind, XMind. OPML nepotvrdené.
- **Platforma/cena:** web + mobil. Free 3 mapy; Personal ≈ 6,5 $, Pro ≈ 10–12 $, Business ≈ 15 $/mes.
- **Cool:** real-time kolaborácia, komentáre, história zmien.
- Zdroje: https://workspace.google.com/marketplace/app/mindmeister/119415359491 , https://community.meister.co/discussion/comment/876/ , https://community.meister.co/discussion/comment/683 , https://www.getapp.com/mind-mapping-software/a/mindmeister , https://www.stork.ai/en/mindmeister

#### Coggle
- **Editovanie:** jednoduché, hlavne myšou (+ na vetve), Markdown vo vetvách, LaTeX (MathJax), obrázky, farby vetiev, kolaborácia a história zmien (viď „Awesome“ plán).
- **Mimo stromu:** **loops a joined branches** (vetva sa môže napojiť späť → graf, nie strom), cross-links medzi vetvami, **viac koreňov (multiple starting points)** v jednom diagrame; tvary pre flowchart.
- **Poznámky/denník:** nie.
- **Export/import:** PDF, PNG, text (outline), FreeMind .mm, Visio-kompatibilné; import textu a .mm.
- **Platforma/cena:** web. Free 3 súkromné diagramy + neobmedzené verejné; Awesome ≈ 5 $/mes.; Organisation ≈ 8 $/člen/mes.
- **Cool:** organické krivkové vetvy, jediný „klasický“ mind-map, ktorý natívne dovolí slučky a viac koreňov.
- Zdroje: https://www.techjockey.com/us/detail/coggle , https://toolradar.com/tools/coggle , https://work-management.org/project-management/coggle-review/ , https://alternativeto.net/software/coggle/about

#### Mindomo
- **Editovanie:** Tab = podtéma, Enter = súrodenec, Ctrl+Shift+Enter = nový rodič, F2/Ctrl+E = úprava, Ctrl+Space = zbalenie. Typy tém: central, main, subtopic, **floating**. Hranice (aj vnorené), úlohy, Gantt, timeline, outline, prezentácia.
- **Mimo stromu:** „Relationships“ (vzťahové čiary s editovateľným popisom, fontom, farbou) a koncept-mapové spojenia; floating topics.
- **Poznámky/denník:** poznámka k téme (pri importe Markdownu sa odsek oddelený prázdnym riadkom stane poznámkou).
- **Export/import:** OPML, FreeMind .mm, MindManager .mmap, HTML, PNG, PDF, Markdown (central/floating → `#`, main → `##`, úlohy → `[ ]`), MS Project .mpx; import .mm, OPML, Markdown, text.
- **Platforma/cena:** web, desktop, mobil. Free; Premium ≈ 6–7 €/mes.; Professional ≈ 13,5–15 €/mes.
- **Cool:** najlepšie zdokumentovaný Markdown round-trip (mapa ↔ nadpisy ↔ úlohy ↔ poznámky).
- Zdroje: https://help.exswap.com/basics/export-mind-maps , https://help.exswap.com/basics/import-mind-maps/ , https://help.exswap.com/changelog/ , https://web.creaza.com/en/help/mindomo-top-toolbar , https://frontdeskreview.com/software/mind-mapping/mindomo/

#### Ayoa (ex-iMindMap)
- **Editovanie:** štýly máp: organic (ručne kreslené vetvy podľa Buzana), speed map, radial map (koláčová), capture map, whiteboard, task boards; prezentačný mód, Gantt, AI generovanie.
- **Mimo stromu:** relationship arrows medzi vetvami; whiteboard pre voľné väzby.
- **Poznámky/denník:** poznámky k vetve, úlohy; bez denníka.
- **Export/import:** JPG, PNG, PDF, TXT, HTML, DOCX, OPML.
- **Platforma/cena:** web, desktop, mobil. Free (limit máp, whiteboardy len na čítanie); Mind Map tier ≈ 10 $/user/mes.
- **Cool:** organické „Buzanovské“ vetvy a radiálne mapy – vizuálne najhravejšie.
- Zdroje: https://www.techradar.com/pro/ayoa-review , https://frontdeskreview.com/software/mind-mapping/ayoa/ , https://softwarefinder.com/project-management-software/ayoa , https://support.ayoa.com/relationship-arrows-in-mind-maps

#### Freeplane / FreeMind (open source)
- **Editovanie:** Insert = dieťa, Enter = súrodenec, F2 = úprava, Space = fold/unfold, všetky akcie majú priraditeľné hotkeys (F-bar). Ikony, farby, bubliny, **štýly** (level styles, user styles, **conditional styles** – automatické štýlovanie podľa obsahu/úrovne/atribútov), poznámky (rich text), **atribúty (key/value metadáta na uzle)**, vzorce a skriptovanie (Groovy), filtre, LaTeX, obrázky, klonované uzly.
- **Mimo stromu:** **connectors** (voľné čiary s popiskom, šípkami, tvarom, farbou, priehľadnosťou), **hyperlinky na iné uzly / mapy / súbory**, atribúty ako typované metadáta, filtre podľa atribútov a ikon, klony uzlov (jeden uzol na viacerých miestach).
- **Poznámky/denník:** poznámka k uzlu; bez denníka, ale skripty dovolia čokoľvek.
- **Export/import:** natívne .mm (XML, kompatibilné s FreeMind); export HTML/XHTML, PDF, SVG, PNG, JPEG, OPML cez XSLT exporty, Markdown/Markdown-like text a ďalšie cez doplnky; import z FreeMind, MindManager, textu.
- **Platforma/cena:** Java (Win/Mac/Linux), **zdarma, GPL**.
- **Cool:** najhlbší dátový model zo všetkých klasických mind-mapov (atribúty + podmienené štýly + filtre + klony); .mm je de-facto výmenný formát.
- Zdroje: https://docs.freeplane.org/user-documentation/user-documentation.html , https://docs.freeplane.org/user-documentation/hot-keys-and-beyond.html , https://en.wikipedia.org/wiki/Freeplane , https://freemind.sourceforge.io/wiki/index.php/Keyboard , https://www.warp2search.net/story/freeplane-1126/

### 1.2 Whiteboardy a diagramy

#### Whimsical
- **Editovanie:** M = nový mind-map, Tab = dieťa, Enter = súrodenec; rovné/zakrivené čiary, orientácia mapy, ikony na uzloch, farby, odkazy, komentáre; AI generovanie máp. Mind map je jeden z objektov na spoločnej nekonečnej ploche (vedľa flowchartov, wireframov, docs).
- **Mimo stromu:** connectors medzi ľubovoľnými objektmi na boarde (nie typované).
- **Poznámky/denník:** Whimsical Docs (dokumenty s vloženými boardmi); bez denníka.
- **Export/import:** PNG, PDF (print), kopírovanie uzlov; na Free pláne vodoznak, od 4/2026 export na Free podľa trackera obmedzený.
- **Platforma/cena:** web, desktop. Starter free; Pro 10–12 $/editor/mes.; Business 20 $.
- **Cool:** čisté, rýchle UI; mind map, flowchart a doc na jednom plátne.
- Zdroje: https://whimsical.com/learn/get-started/mind-maps , https://help.whimsical.com/article/594-pricing-and-discounts , https://whimsical.com/learn/imports-exports/exporting-from-whimsical , https://pricingsaas.com/companies/whimsical

#### Miro (mind map mode)
- **Editovanie:** Tab = dieťa, Shift+Enter = nový riadok v uzle (Enter ako súrodenec používatelia roky žiadajú), Delete maže aj deti, zbalenie vetvy ukáže počet skrytých uzlov; auto-layout, farby, ikony, obrázky; AI generovanie. Mind map je objekt na boarde; Web SDK 2.0 podporuje mind mapy programovo.
- **Mimo stromu:** ľubovoľné šípky (connectors) medzi objektmi boardu s popisom; tagy na sticky notes; linky na iné boardy/rámce.
- **Poznámky/denník:** nie (poznámka cez komentár / priložený text).
- **Export/import:** obrázok, PDF boardu; pre mind map nie je OPML.
- **Platforma/cena:** web, desktop, mobil. Free (3 boardy), Starter ≈ 8 $, Business ≈ 16 $/člen/mes.
- **Cool:** kolaborácia, nekonečný board s všetkým; mind map je tu však druhotná.
- Zdroje: https://help.miro.com/hc/articles/360017730753 , https://community.miro.com/ideas/shortcut-key-for-adding-new-child-and-sibling-nodes-3081 , https://developers.miro.com/docs/mind-maps , https://community.miro.com/developer-platform-and-apis-57/the-miro-web-sdk-2-0-introduces-mind-maps-13588

#### Excalidraw / Excalidraw+
- **Editovanie:** ručne kreslený štýl, tvary, text, **arrow binding** (šípka sa prichytí k tvaru a sleduje ho), popisky na šípkach, elbow arrows, frames, knižnice tvarov, Mermaid → diagram, AI text-to-diagram (Plus). Mind map nie je natívny režim – stavia sa z tvarov a viazaných šípok (existujú pluginy, napr. pre Obsidian).
- **Mimo stromu:** šípky medzi čímkoľvek, s textom; bez sémantiky.
- **Poznámky/denník:** nie (v Obsidiane cez plugin áno).
- **Export/import:** .excalidraw (otvorený JSON), PNG, SVG, clipboard; embed scény do PNG/SVG.
- **Platforma/cena:** web, PWA, offline; **MIT open source**; Excalidraw+ ≈ 6–7 $/mes. (cloud, AI, tímy).
- **Cool:** hand-drawn estetika, otvorený JSON, arrow binding – dobrý referenčný model pre „hrany sledujú uzly“.
- Zdroje: https://github.com/excalidraw/excalidraw/ , https://plus.excalidraw.com/changelog , https://costbench.com/changelog/excalidraw-price-decrease-2026-06/

### 1.3 Vizuálne PKM nástroje (karty + plátno + denník)

#### Obsidian (Canvas + Graph view + backlinky + Daily notes)
- **Editovanie (Canvas):** karty = text / súbor (poznámka .md) / web link / skupina; šípky s popiskom a farbou, prichytené k strane uzla; drag&drop poznámok z vaultu; zbaľovanie skupín. Mind-map editovanie Tab/Enter natívne nie je – pridávajú ho komunitné pluginy (Canvas Quick Mindmap, Mind map editor, Enhanced Canvas, Excalidraw).
- **Mimo stromu:** `[[wikilinky]]`, **backlinky + unlinked mentions**, tagy, properties (YAML), **Graph view** (globálny + lokálny s hĺbkou, filtre, farebné skupiny podľa vyhľadávania), canvas súbory sa od 1.x zúčastňujú v grafe a backlinkoch. Typované hrany len cez pluginy (Graph Link Types + Dataview).
- **Poznámky/denník:** core plugin **Daily notes** (dátumový formát, priečinok, šablóna); plugin Canvas Daily Note vloží dnešnú poznámku na plátno.
- **Export/import:** všetko sú lokálne Markdown súbory; **Canvas = JSON Canvas (.canvas)**, otvorená MIT špecifikácia 1.0: `nodes[]` (text/file/link/group, x,y,w,h,color) a `edges[]` (fromNode,toNode, fromSide/toSide, fromEnd/toEnd none|arrow, color, label). PDF export, Publish.
- **Platforma/cena:** Win/Mac/Linux/iOS/Android; **zdarma** (Sync/Publish platené).
- **Cool:** JSON Canvas ako otvorený formát; lokálny graf s hĺbkou; obrovský ekosystém pluginov.
- Zdroje: https://obsidian.md/blog/json-canvas/ , https://jsoncanvas.org/spec/1.0/ , https://obsidian.md/help/plugins/graph , https://publish.obsidian.md/hub/05+-+Concepts/Obsidian+Core+Plugins , https://www.obsidianstats.com/plugins/graph-link-types , https://community.obsidian.md/plugins/canvas-quick-mindmap

#### Logseq (whiteboards, graph)
- **Editovanie:** outliner (bloky), Tab/Shift+Tab = zanorenie, Enter = nový blok; **Whiteboards** (fork tldraw): nástroje select, move, **portal**, pencil, highlight, eraser, connector, text, shapes; drag&drop stránok a blokov zo sidebaru na plátno = embed (portál) živého obsahu. Whiteboardy sú .edn súbory.
- **Mimo stromu:** `[[odkazy]]`, `#tagy`, block references `((uuid))`, vlastnosti blokov (`key:: value`), **Graph view** (v DB verzii v 5/2026 prepísaný od nuly), linked/unlinked references pod každou stránkou. V DB verzii (2.0 beta, SQLite) sú tagy = triedy s vlastnosťami (typované properties).
- **Poznámky/denník:** **Journals** – denník je predvolená domovská stránka, všetko sa zapisuje do dňa a cez odkazy sa „roztečie“ do stránok. Whiteboardy v DB verzii v 2026 podľa migračných guidov ešte neboli dostupné (stav neistý).
- **Export/import:** Markdown/Org súbory (file verzia), EDN/JSON export, OPML export, PNG/PDF stránky; DB verzia má opt-in Markdown mirror.
- **Platforma/cena:** desktop + mobil, **zdarma, AGPL**; Sync platený.
- **Cool:** portály – živý blok z poznámky na plátne; denník ako hlavný vstupný bod; bloková granularita odkazov.
- Zdroje: https://raw.githubusercontent.com/logseq/docs/master/pages/Whiteboard.md , https://discuss.logseq.com/t/whats-new-with-logseq-db-may-16th-2026/35020 , https://raw.githubusercontent.com/logseq/docs/master/db-version.md , https://blog.logseq.com/whiteboards-and-queries-for-everybody/ , https://www.promptquorum.com/power-local-llm/logseq-review

#### Heptabase
- **Editovanie:** karty (Markdown blokový editor) na nekonečných **whiteboardoch**; **Sections** (pomenované oblasti, názov čitateľný aj pri oddialení, vnorené subsekcie); vnorené sub-whiteboardy; **mind map** priamo na whiteboarde, kde uzly môžu byť existujúce karty (karta sa pretiahne na uzol); šípky s popisom; tagy s vlastnosťami (tabuľkové/kanban pohľady), PDF/highlight karty, split view.
- **Mimo stromu:** **karta nepatrí whiteboardu** – tá istá karta môže byť na viacerých boardoch naraz (úpravy sa prejavia všade); backlinky; tagy + properties; vyhľadávanie naprieč.
- **Poznámky/denník:** **Journal** – denné záznamy, z ktorých sa bloky dajú „vyťahovať“ do kariet a na whiteboardy; odporúčaný workflow „mesačné review = všetky journal karty mesiaca na jeden board“.
- **Export/import:** Markdown (+ obrázky), JSON/Mermaid podľa porovnaní; používatelia kritizujú, že export nezachová vizuálne vzťahy.
- **Platforma/cena:** Win/Mac/Linux/iOS/Android/web. Bez free tieru (7-dňová skúška); Pro ≈ 8,99 $/mes. ročne (11,99 $ mesačne), Premium ≈ 17,99 $.
- **Cool:** mind map, karty, whiteboard a denník ako jeden model; sekcie čitateľné pri zoom-out; „card on many boards“.
- Zdroje: https://wiki.heptabase.com/fundamental-elements , https://wiki.heptabase.com/mindmap , https://wiki.heptabase.com/section , https://wiki.heptabase.com/three-ways-to-make-sense-of-your-fleeting-thoughts-in-journal , https://usagepricing.com/blueprint/heptabase , https://toolradar.com/tools/heptabase/pricing

#### Scrintal
- **Editovanie:** karty (text, obrázky, PDF, video) na nekonečnom „desku“ (board); karty sa dajú zbaliť na názov alebo rozbaliť; vizuálne spojenia; AI asistent Gobu.
- **Mimo stromu:** obojsmerné odkazy medzi kartami (backlinky zobrazené vizuálne ako čiary), tagy; používatelia žiadajú transklúziu.
- **Poznámky/denník:** karta = poznámka; denník nie je kľúčová funkcia.
- **Export/import:** Markdown export kariet; obmedzené.
- **Platforma/cena:** web (+ desktop). Trial; Pro ≈ 12 $/mes.; ponúkaná aj lifetime licencia (~322 $).
- **Cool:** „Roam na plátne“ – backlinky sú zároveň viditeľné čiary.
- Zdroje: https://blog.scrintal.com/scrintal-releases-the-private-beta-combine-visuality-with-knowledge-management-61b06de17554 , https://www.capterra.com/p/216983/Scrintal/ , https://subscribed.fyi/scrintal/deals/

#### Kinopio
- **Editovanie:** klik na plátno = karta; ťahaním z konektora karty = spojenie; paint-select na skupinovú manipuláciu; farby kariet, vkladanie URL/obrázkov/videí; rozdelenie karty z outline odsadením.
- **Mimo stromu:** každé spojenie má **connection type** (pomenovaný typ s farbou zdieľaný v priestore), voliteľný **label** na čiare, hromadné priradenie typu; `[[tagy]]` prepájajú karty naprieč priestormi (sidebar tagov); card links medzi priestormi.
- **Poznámky/denník:** karta je krátka poznámka; inbox priestor; bez denníka.
- **Export/import:** export priestorov (JSON/text), obrázok.
- **Platforma/cena:** web, PWA, iOS. Free do 100 kariet; 8 $/mes., 80 $/rok, 250 $ lifetime.
- **Cool:** najjednoduchší model typovaných spojení (typ = meno + farba) a hravá estetika.
- Zdroje: https://help.kinopio.club/posts/editing-connections , https://help.kinopio.club/posts/creating-cards-and-connections/ , https://kinopio.club/help/tags , https://help.kinopio.club/posts/how-much-does-kinopio-cost , https://forum.kinopio.club/t/connection-type-redesign/428

#### Milanote
- **Editovanie:** boardy s kartami (text, obrázky, odkazy s náhľadom, súbory, to-do), stĺpce, šípky/čiary medzi kartami, vnorené boardy (board ako karta na boarde), web clipper.
- **Mimo stromu:** čiary medzi kartami bez typov; vnorenie boardov do hierarchie; odkazy na iné boardy.
- **Poznámky/denník:** nie.
- **Export/import:** PDF, obrázok, Word, Markdown/plain text (board → lineárny dokument).
- **Platforma/cena:** web, desktop, mobil. Free 100 kariet; ≈ 9,99–12,5 $/osoba/mes.
- **Cool:** moodboard estetika, vnorené boardy ako „krabice v krabici“.
- Zdroje: https://www.capterra.com/p/165790/Milanote/pricing/ , https://www.macstories.net/reviews/free-form-card-based-note-taking-with-milanote/ , https://www.getapp.com/collaboration-software/a/milanote/

### 1.4 Grafové/objektové databázy poznámok

#### TheBrain (v14, pripravuje sa v15)
- **Editovanie:** „Plex“ – dynamické zobrazenie: aktívna myšlienka (thought) v strede, **rodičia hore, deti dole, jumps vľavo**, súrodenci odvodení; ťahaním z „gate“ bodov myšlienky vznikajú väzby; ikony, farby, typy; ku každej myšlienke rich-text poznámka, prílohy, web linky, udalosti v kalendári; vyhľadávanie naprieč „brainmi“; AI (v14), API.
- **Mimo stromu – kľúčové:** dátový model je **graf s 3 kategóriami väzieb (parent / child / jump)**; uzol môže mať viac rodičov, dieťa môže byť rodičom súrodenca. Navyše **Link Types**: pomenované, smerované, štýlované (farba, hrúbka) typy väzieb (napr. „acted in“), ukladané ako znovupoužiteľné typy; **Thought Types** (typ uzla s ikonou/farbou), tagy. Poznámky môžu priamo odkazovať na iné myšlienky.
- **Poznámky/denník:** poznámka je súčasťou myšlienky; myšlienka môže byť len odkaz/súbor; udalosti a timeline; denník ako „dnešná“ myšlienka nie je natívny koncept.
- **Export/import:** .brz archív (brainzip), export do HTML/obrázok/outline, API (JSON), MCP servery komunity.
- **Platforma/cena:** Win/Mac/iOS/Android/web. Free (neobmedzené myšlienky, bez cloudu); Pro licencia 219 $ jednorazovo; Pro Combo 299 $ 1. rok, 159 $/rok.
- **Cool:** animovaný plex, kde sa pohľad „prepláva“ k vybranej myšlienke; jediný nástroj, kde sú typované, smerované väzby prvotriedny koncept od 90. rokov.
- Zdroje: https://help.thebrain.com/androidphone/thoughtrelationships.html , https://www.pcworld.com/article/478088/thebrain.html , https://irc.pcper.com/thebrain-link-types.html , https://www.thebrain.com/store/compare-editions , https://en.wikipedia.org/wiki/TheBrain

#### Tana
- **Editovanie:** outliner (Tab/Shift+Tab, Enter), každý uzol môže dostať **supertag** → automaticky dostane polia (fields) a správanie; pohľady: tabuľka, karty, kalendár, kanban; live search nodes (dynamické dotazy); AI agenti, Tana Capture (hlas).
- **Mimo stromu:** referencie `@uzol`, polia typu „odkaz na uzol so supertagom X“ = **typované vzťahy** (napr. field „Projekt“ → uzol s #project); viac supertagov na uzle; backlinky v „References“. Globálny graph view **nie je** (dlhodobá požiadavka); v 2025/26 pribudol **Canvas** (nekonečná tabuľa s tvarmi, šípkami a vloženými dokumentmi ako kartami, s backlinkami).
- **Poznámky/denník:** **Daily notes** – automaticky generované uzly deň/týždeň/mesiac/rok, hlavný vstupný bod; otagované položky z denníka sa objavujú vo view supertagu.
- **Export/import:** Markdown/JSON export, Tana Paste (textový formát pre import), API.
- **Platforma/cena:** web, desktop, mobil. Free (limit uzlov), Plus ≈ 10 $, Pro ≈ 18–20 $/mes.
- **Cool:** supertag = schéma na ľubovoľnom uzle; „všetko je uzol“.
- Zdroje: https://tana.inc/docs/tana-at-a-glance-glossary , https://tana.inc/learn/features/canvas , https://ideas.tana.inc/posts/114-visual-graph-visualize-and-manipulate-my-nodes-via-a-graph-view , https://costbench.com/software/note-taking/tana/free-plan/

#### Capacities
- **Editovanie:** blokový editor; **objektové typy** (Page, Person, Book, Meeting, Project… + vlastné) s vlastnosťami; kolekcie/tabuľky; widgety v pohľadoch; AI.
- **Mimo stromu:** `@odkazy` medzi objektmi, **backlinky** (každý objekt zobrazí, kto naň odkazuje), tagy, properties typu „odkaz na objekt“ = typované väzby; **graph view je lokálny (per objekt)**, globálny neexistuje zámerne.
- **Poznámky/denník:** **Daily notes** ako inbox – správy z Telegramu/WhatsApp/e-mailu pristanú v dnešnej poznámke; dátumy sú objekty (date linking), takže čokoľvek spomenuté v dátume sa prepojí s kalendárom.
- **Export/import:** Markdown + obrázky, JSON (otvorený, bez lock-inu podľa výrobcu; recenzie: menej flexibilné než súborové systémy).
- **Platforma/cena:** Win/Mac/iOS/Android/web. Free; Pro ≈ 9,99–11,99 $, Believer ≈ 12,49–14,99 $/mes.
- **Cool:** „objekt namiesto súboru“ s peknými vizuálnymi náhľadmi (obálky kníh, karty ľudí); date-as-object.
- Zdroje: https://capacities.io/product , https://docs.capacities.io/tutorials/networked-note-taking , https://capacities.io/whats-new/release-10 , https://frontdeskreview.com/software/note-taking-apps/capacities/ , https://tooliverse.ai/tools/capacities

---

## 2. Porovnávacia tabuľka

| Aplikácia | Tab/Enter | Auto-layout | Vzťahy mimo stromu | Typované vzťahy | Backlinky | Denník | Export | Platforma | Cena |
|---|---|---|---|---|---|---|---|---|---|
| XMind | áno | áno (veľa štruktúr) | Relationship čiara + popis, topic link, floating | len popis | nie | nie | OPML, MD, .mm(imp), PNG/SVG/PDF, DOCX | všetky | free / 5–15 $ |
| MindNode | áno | áno | cross-connection, visual tags, document linking | nie | nie | nie | OPML, MD, .mm, SVG, PNG, PDF | Apple | ~2,5–3 $ |
| MindMeister | áno | áno | connections (šípky) | nie | nie | nie | PDF, PNG, DOCX, PPT, .mm, XMind | web | free / 6–15 $ |
| Coggle | čiastočne | áno (organický) | loops, joined branches, viac koreňov | nie | nie | nie | PDF, PNG, TXT, .mm | web | free / 5–8 $ |
| Mindomo | áno | áno | relationships s popisom, floating | len popis | nie | nie | OPML, .mm, .mmap, MD, HTML, PNG | všetky | free / 6–15 € |
| Ayoa | áno | áno (organic/radial) | relationship arrows, whiteboard | nie | nie | nie | OPML, DOCX, HTML, PNG, PDF | všetky | free / ~10 $ |
| Freeplane | Insert/Enter | áno | connectors, node hyperlinks, klony | atribúty + popis + štýl | nie (hyperlinky) | nie | .mm, HTML, PDF, SVG, PNG, OPML (XSLT) | desktop | zdarma GPL |
| Whimsical | áno | áno | connectors na boarde | nie | nie | nie (Docs) | PNG, PDF | web | free / 10–20 $ |
| Miro | Tab áno | áno | ľubovoľné šípky | nie | nie | nie | PNG, PDF | web | free / 8–16 $ |
| Excalidraw | nie (plugin) | nie | viazané šípky s textom | nie | nie | nie | .excalidraw JSON, PNG, SVG | web | MIT / 6 $ |
| Obsidian | plugin | nie (Canvas) | wikilinky, Canvas edges (label, color, side) | plugin | áno + unlinked | Daily notes | MD, JSON Canvas, PDF | všetky | zdarma |
| Logseq | áno (outliner) | nie | [[ ]], ((bloky)), properties, portály | DB: tag = trieda s properties | áno | Journals (domov) | MD/Org, EDN, OPML | všetky | zdarma AGPL |
| Heptabase | čiastočne | mind map na boarde | karta na N boardoch, šípky, tagy+properties | properties | áno | Journal | MD, JSON | všetky | 9–18 $ |
| Scrintal | nie | nie | backlinky = čiary | nie | áno | nie | MD | web | ~12 $ |
| Kinopio | nie | nie | connection types (meno+farba) + label, [[tagy]] | áno (typ spojenia) | nie | nie | JSON/text | web | free / 8 $ |
| Milanote | nie | nie | čiary, vnorené boardy | nie | nie | nie | PDF, DOCX, MD | všetky | free / 10–12,5 $ |
| TheBrain | nie (Plex) | dynamický Plex | parent/child/jump + Link Types (smer, meno, štýl), Thought Types | **áno, prvotriedne** | áno (plex) | čiastočne | .brz, HTML, API | všetky | free / 219 $ |
| Tana | áno (outliner) | nie | supertag fields = typ. referencie, Canvas | **áno (polia)** | áno | Daily notes | MD, JSON | všetky | free / 10–20 $ |
| Capacities | nie | nie | objekty + properties, lokálny graf | **áno (properties)** | áno | Daily notes | MD, JSON | všetky | free / 10–15 $ |

---

## 3. Zhrnutie

### (a) „Table stakes“ – čo musí mať každá mind mapa

1. **Klávesnicové vytváranie:** Tab = dieťa, Enter = súrodenec, Shift+Enter = súrodenec nad / viacriadkový text, Delete = zmazať vetvu, Esc = zrušiť edit, F2/dvojklik = editovať. Šípky = navigácia medzi uzlami.
2. **Automatický layout** (minimálne vľavo/vpravo vyvážený strom) + možnosť ručne presúvať vetvy a uzly medzi rodičmi drag&drop.
3. **Zbaľovanie vetiev** s indikátorom počtu skrytých uzlov (Miro, XMind).
4. **Vizuálne atribúty:** farba vetvy (dedená po vetve), ikona/emoji, obrázok v uzle, štítky/tagy.
5. **Poznámka k uzlu** (dlhší text mimo bubliny) – vo všetkých klasických editoroch.
6. **Voľné spojenie mimo stromu** (relationship/cross-connection) s popisom – dnes už nie je „nice to have“, má ho XMind, MindNode, Mindomo, Ayoa, MindMeister, Freeplane, Coggle.
7. **Plávajúce témy / viac koreňov** (XMind, Mindomo, Coggle).
8. **Export:** PNG/SVG, Markdown (nadpisy alebo odrážky), OPML; import OPML/Markdown/FreeMind .mm (najčastejšie podporovaný výmenný formát).
9. **Undo/redo, vyhľadávanie v mape, zoom/pan, outline pohľad** (MindNode Cmd+2, Mindomo, XMind).

### (b) Kto najlepšie rieši vzťahy mimo stromu a prepojenie s poznámkami/denníkom

- **TheBrain** – jediný, kde je graf s **typovanými, smerovanými väzbami** prvotriedny dátový model: každý uzol (thought) má zoznam `parents`, `children`, `jumps`; každá väzba má voliteľný **Link Type** (meno, smer, farba, hrúbka, znovupoužiteľný), uzol má **Thought Type**. UI: „Plex“ zobrazuje len okolie aktívneho uzla (rodičia hore, deti dole, jumps vľavo), strom je teda len *aktuálny pohľad na graf*, nie uložená štruktúra. Poznámka je priamo súčasťou uzla.
- **Tana / Capacities** – typované vzťahy cez **polia/vlastnosti**: uzol so supertagom `#kniha` má pole `autor → #osoba`. Vzťah je teda trojica (zdroj, názov poľa, cieľ) a UI ho ukazuje ako formulárové pole + backlink na druhej strane. Daily notes sú vstupný bod: čokoľvek otagované v denníku sa automaticky objaví v pohľade daného typu. Capacities navyše robí z dátumu objekt (date linking), takže „spomenuté v denníku 2026-11-03“ je samo o sebe vzťah.
- **Heptabase** – najlepší „most“ mind map ↔ poznámky: uzol mind mapy **je** karta (poznámka), tá istá karta môže byť na viacerých whiteboardoch/mapách; Journal sa dá „vyťahovať“ do kariet a na boardy. Dátový model: karty, boardy a väzby „karta je umiestnená na boarde na x,y“ sú oddelené.
- **Obsidian (JSON Canvas)** – otvorený, jednoduchý grafový formát: `nodes[]` + `edges[]{fromNode,toNode,fromSide,toSide,label,color}`, uzol typu `file` ukazuje na poznámku. Typ vzťahu sa dá zakódovať do `label`/`color`. Daily notes + backlinky a lokálny graf s hĺbkou sú vzor pre „okolie uzla“.
- **Kinopio** – najjednoduchší UX pre typy spojení: **connection type = meno + farba**, zdieľaný v priestore, nové spojenie dedí posledný typ, paint-select na hromadnú zmenu typu, label na čiare voliteľný.
- **Logseq** – denník ako domov, portály (živé bloky na plátne), blokové referencie; v DB verzii tag = trieda s typovanými vlastnosťami.
- **Freeplane** – ukazuje, že aj klasická mapa unesie typovanie: atribúty (key/value) na uzloch + podmienené štýly + filtre podľa atribútov + hyperlinky na uzly.

### (c) Odporúčania pre náš nástroj (UX vzory hodné prevzatia)

1. **Graf ako dátový model, strom ako pohľad (TheBrain).** Ukladať `nodes` + `edges`, kde hrana má `type` (z malého, používateľom rozšíriteľného číselníka: `child`, `related`, `supports`, `contradicts`, `mentioned-in`, `source`…), `direction` a voliteľný `label`. Stromový layout sa vypočíta z hrán typu `child` od zvoleného koreňa; ostatné typy sa kreslia ako krivky/prerušované čiary s farbou typu. Zapísať to ako **JSON Canvas-kompatibilný** formát (rozšírené `edges[].label/color` + vlastné `type`), aby sa mapa dala otvoriť v Obsidiane.
2. **Typ spojenia = meno + farba + smer, s dedením posledného typu (Kinopio).** Pri ťahaní novej čiary sa použije posledný typ; jedným klikom na čiaru sa prepne typ z paletky; legenda typov v rohu plátna. Žiadne modálne okná.
3. **Uzol = poznámka, poznámka môže byť na viacerých mapách (Heptabase).** Uzol mapy je len „umiestnenie“ poznámky (`placement {noteId, x, y, collapsed}`); kliknutím na uzol sa otvorí poznámka v bočnom paneli (split view), nie modál. Jedna poznámka → N máp, úprava sa prejaví všade.
4. **Denník ako vstupný bod + automatické vzťahy (Logseq/Tana/Capacities).** Denný záznam je poznámka typu `journal`; `[[odkaz]]` z denníka na uzol vytvorí hranu typu `mentioned-in` s dátumom; v paneli uzla sa zobrazia backlinky zoskupené podľa dňa („Spomenuté: 3. 11. 2026, 28. 10. 2026“). Z denníka sa dá blok „vytiahnuť“ na mapu (drag → nový uzol prepojený hranou `from-journal`).
5. **Lokálny graf s hĺbkou (Obsidian/TheBrain Plex).** Okrem celej mapy ponúknuť pohľad „okolie uzla“ (hĺbka 1–2) s filtrovaním podľa typu hrany – to je presne to, čo robí Plex, a stačí na navigáciu bez obrovského globálneho grafu.
6. **Tagy ako zvýraznenie, nie ako priečinky (MindNode Visual Tags, XMind labels).** Kliknutie na tag v legende zvýrazní všetky uzly s tagom naprieč mapou a ostatné vybledne (Focus/tag-highlight). Lacné, veľmi účinné.
7. **Podmienené štýlovanie podľa typu/atribútu (Freeplane).** Uzol s tagom `#todo` má checkbox, uzol typu `osoba` má ikonu – pravidlá „ak property X, tak štýl Y“ namiesto ručného formátovania.
8. **Sekcie čitateľné pri oddialení + zbaľovanie s počítadlom (Heptabase, Miro).** Semantic zoom: pri malom zoome sa zobrazia len názvy sekcií/koreňových vetiev; zbalená vetva ukáže „+12“.
9. **Export od prvého dňa:** Markdown (nadpisy = úrovne, odrážky = listy, poznámka uzla pod nadpisom, hrany mimo stromu ako `- súvisí s: [[X]]`), OPML (strom), PNG/SVG (vizuál), JSON Canvas (vizuál + graf). Import OPML/Markdown/FreeMind .mm (najrozšírenejší formát z klasických nástrojov).

### (d) De-facto štandardné klávesové skratky

| Akcia | Štandard | Poznámka |
|---|---|---|
| Nový podradený uzol | **Tab** (Insert vo Freeplane/MindMeister) | XMind, MindNode, Mindomo, Whimsical, Miro, Logseq |
| Nový súrodenec pod | **Enter** | takmer všade; Miro ho nemá (častá sťažnosť) |
| Nový súrodenec nad | **Shift+Enter** | MindMeister, Excalidraw-mindmap; v XMind/Miro = nový riadok v texte |
| Nový rodič nad uzlom | Ctrl/Cmd+Shift+Enter | Mindomo; XMind Shift+Enter (nejednotné) |
| Editovať text | **F2** / dvojklik / začať písať | F2 = Mindomo, FreeMind, Syncfusion; Space = edit v Excalidraw-mindmap |
| Zbaliť/rozbaliť | **Space** (Freeplane, Syncfusion) alebo Ctrl+/ (XMind), Ctrl+Space (Mindomo) | pre náš nástroj odporúčame Space = toggle, Ctrl+Space = celá vetva |
| Zmazať uzol (s deťmi) | **Delete / Backspace** | všade |
| Zrušiť úpravu | **Esc** | všade |
| Navigácia | **šípky** medzi rodič/dieťa/súrodenec | XMind, MindNode, Freeplane, Mindomo |
| Presun uzla hore/dole | Ctrl/Cmd+šípka | Freeplane, XMind; v Miro chýba (žiadané) |
| Vzťah mimo stromu | **Ctrl/Cmd+L** | MindNode Cmd+L, XMind Ctrl+Shift+L; Freeplane Ctrl+L = hyperlink |
| Prepnúť mapa / outline | Cmd+1 / Cmd+2 | MindNode |
| Focus mode | Shift+Cmd+F | MindNode |
| Hranica/skupina | Ctrl+B | XMind |
| Undo/Redo, Find | Ctrl+Z/Y, Ctrl+F | všade |
| Nový mind map / rýchly zápis | M (Whimsical), Quick Entry (MindNode) | |

Odporúčaná minimálna sada pre náš nástroj: Tab, Enter, Shift+Enter, F2, Space, Delete, Esc, šípky, Ctrl+šípky, Ctrl+L (typované spojenie – otvorí paletku typov), Ctrl+K (vložiť `[[odkaz]]` na poznámku), Ctrl+D (otvoriť dnešný denník), Ctrl+F.

---

## 4. Zoznam zdrojov (súhrnne)

- XMind: https://xmind.app/features/ , https://xmind.com/blog/shortcuts-in-xmind-that-improve-mapping-efficiency , https://toolradar.com/tools/xmind/pricing
- MindNode: https://www.mindnode.com/article/shortcuts-ios , https://mindnode.com/article/shortcuts-mac , https://apps.apple.com/hu/app/mindnode-next/id6446116532
- MindMeister: https://workspace.google.com/marketplace/app/mindmeister/119415359491 , https://community.meister.co/discussion/comment/876/ , https://www.stork.ai/en/mindmeister
- Coggle: https://www.techjockey.com/us/detail/coggle , https://toolradar.com/tools/coggle , https://alternativeto.net/software/coggle/about
- Whimsical: https://whimsical.com/learn/get-started/mind-maps , https://help.whimsical.com/article/594-pricing-and-discounts , https://whimsical.com/learn/imports-exports/exporting-from-whimsical
- Miro: https://help.miro.com/hc/articles/360017730753 , https://developers.miro.com/docs/mind-maps , https://community.miro.com/ideas/shortcut-key-for-adding-new-child-and-sibling-nodes-3081
- Freeplane/FreeMind: https://docs.freeplane.org/user-documentation/user-documentation.html , https://docs.freeplane.org/user-documentation/hot-keys-and-beyond.html , https://freemind.sourceforge.io/wiki/index.php/Keyboard , https://en.wikipedia.org/wiki/Freeplane
- Obsidian: https://obsidian.md/blog/json-canvas/ , https://jsoncanvas.org/spec/1.0/ , https://obsidian.md/help/plugins/graph , https://publish.obsidian.md/hub/05+-+Concepts/Obsidian+Core+Plugins
- Logseq: https://raw.githubusercontent.com/logseq/docs/master/pages/Whiteboard.md , https://discuss.logseq.com/t/whats-new-with-logseq-db-may-16th-2026/35020 , https://raw.githubusercontent.com/logseq/docs/master/db-version.md
- Heptabase: https://wiki.heptabase.com/fundamental-elements , https://wiki.heptabase.com/mindmap , https://wiki.heptabase.com/section , https://usagepricing.com/blueprint/heptabase
- Scrintal: https://blog.scrintal.com/scrintal-releases-the-private-beta-combine-visuality-with-knowledge-management-61b06de17554 , https://www.capterra.com/p/216983/Scrintal/
- Kinopio: https://help.kinopio.club/posts/editing-connections , https://help.kinopio.club/posts/creating-cards-and-connections/ , https://help.kinopio.club/posts/how-much-does-kinopio-cost
- Excalidraw: https://github.com/excalidraw/excalidraw/ , https://plus.excalidraw.com/changelog , https://costbench.com/changelog/excalidraw-price-decrease-2026-06/
- Mindomo: https://help.exswap.com/basics/export-mind-maps , https://help.exswap.com/basics/import-mind-maps/ , https://frontdeskreview.com/software/mind-mapping/mindomo/
- Ayoa: https://www.techradar.com/pro/ayoa-review , https://frontdeskreview.com/software/mind-mapping/ayoa/ , https://support.ayoa.com/relationship-arrows-in-mind-maps
- TheBrain: https://help.thebrain.com/androidphone/thoughtrelationships.html , https://www.pcworld.com/article/478088/thebrain.html , https://www.thebrain.com/store/compare-editions , https://en.wikipedia.org/wiki/TheBrain
- Tana: https://tana.inc/docs/tana-at-a-glance-glossary , https://tana.inc/learn/features/canvas , https://ideas.tana.inc/posts/114-visual-graph-visualize-and-manipulate-my-nodes-via-a-graph-view , https://costbench.com/software/note-taking/tana/free-plan/
- Capacities: https://capacities.io/product , https://docs.capacities.io/tutorials/networked-note-taking , https://capacities.io/whats-new/release-10 , https://frontdeskreview.com/software/note-taking-apps/capacities/
- Milanote: https://www.capterra.com/p/165790/Milanote/pricing/ , https://www.macstories.net/reviews/free-form-card-based-note-taking-with-milanote/
- Skratky naprieč nástrojmi: https://www.mindmup.com/help/guides/keyboard/ , https://mind42.com/guide/shortcuts , https://community.obsidian.md/plugins/excalidraw-mindmap , https://help.exswap.com/basics/shortcuts/
