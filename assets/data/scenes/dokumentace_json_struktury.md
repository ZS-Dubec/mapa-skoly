# Dokumentace JSON struktury pro 360° prohlídku (ZŠ Dubeč)

## Kritická analýza původního návrhu

Při navrhování datového modelu pro JSON je třeba vyvarovat se následujících syntaktických a architektonických chyb:

1. **Chybějící podpora komentářů (`#`)**: V platném JSON souboru nesmí být znak `#`.
2. **Použití Python f-stringů (`f"assets/..."`)**: JSON je čistě datový statický formát bez podpory proměnných nebo dynamických řetězců. Cesta musí být zapsána jako přímý řetězec (např. `"assets/photos/chodba_vstup.jpg"`).
3. **Chybějící čárka a překlep**: U klíče `naberos` chybí oddělovací čárka. Správný název pro BFS algoritmus je `neighbors`.
4. **Číslování s počáteční nulou (`001`)**: JSON parser vyhodnotí číslo `001` jako syntaktickou chybu (čísla nesmí začínat nulou).

---

## Identifikace místností: `id` vs. `roomName` vs. Klíč objektu

Pro SPA aplikaci s URL Hash routingem (`/#chodba_vstup`) **je nejlepší použít unikátní textový klíč v objektu**, nikoliv pole s číselným `id`.

* **Proč NEPOUŽÍVAT číselné `id` (1, 2, 3):** Při volání URL adresy `/#15` z odkazu nikdo neví, o jakou místnost jde. Pokud navíc v budoucnu přidáte novou fotku uprostřed chodby, číselná řada se rozpadne nebo bude nelogická.
* **Proč POUŽÍT textový klíč objektu (`"chodba_vstup"`):** 
  * V JavaScriptu načtete data místnosti okamžitě přes `scenesData["chodba_vstup"]` s časovou složitostí $O(1)$ bez nutnosti prohledávat pole pomocí funkce `.find()`.
  * Uživatel dostane přehledný odkaz: `zs-dubec.github.io/mapa-skoly/#chodba_vstup`.
  * Seznam sousedů pro BFS algoritmus je přímý a čitelný: `"neighbors": ["jidelna", "chodba_1p"]`.

---

## Schválená struktura JSON (`assets/data/scenes.json`)

```json
{
  "chodba_vstup": {
    "title": "Hlavní vchod",
    "floor": 0,
    "panorama": "assets/photos/chodba_vstup.jpg",
    "mapCoords": {
      "x": 25.5,
      "y": 60.0
    },
    "neighbors": [
      "jidelna",
      "chodba_1p"
    ],
    "hotSpots": [
      {
        "pitch": -2.5,
        "yaw": 85.0,
        "type": "scene",
        "text": "Vstoupit do jídelny",
        "sceneId": "jidelna"
      }
    ]
  },
  "jidelna": {
    "title": "Školní jídelna",
    "floor": 0,
    "panorama": "assets/photos/jidelna.jpg",
    "mapCoords": {
      "x": 40.0,
      "y": 80.0
    },
    "neighbors": [
      "chodba_vstup"
    ],
    "hotSpots": [
      {
        "pitch": 0.0,
        "yaw": 180.0,
        "type": "scene",
        "text": "Zpět k hlavnímu vchodu",
        "sceneId": "chodba_vstup"
      }
    ]
  }
}
```

---

## Přehled polí a jejich funkce

| Pole | Typ | Povinné | Účel a funkce |
| :--- | :--- | :--- | :--- |
| **Klíč objektu** (např. `chodba_vstup`) | `String` | **Ano** | Unikátní identifikátor místnosti pro URL Hash (`/#chodba_vstup`) a pro propojování v navigaci. |
| **`title`** | `String` | **Ano** | Název místnosti zobrazený uživateli v hlavičce prohlížeče a ve vyhledávání. |
| **`floor`** | `Number` | **Ano** | Číslo patra (`0` = přízemí, `1` = 1. patro). Nutné pro automatické přepínání správného podkladu 2D mapy. |
| **`panorama`** | `String` | **Ano** | Přímá relativní cesta ke zkomprimovanému 360° obrázku. |
| **`mapCoords`** | `Object` | **Ano** | Souřadnice `x` a `y` v procentech ($0–100\%$) pro umístění bodu na 2D mapě. |
| **`neighbors`** | `Array[String]` | **Ano** | Seznam klíčů sousedních místností. Vstupní data pro BFS algoritmus vyhledávání trasy. |
| **`hotSpots`** | `Array[Object]` | Ne | Pole šipek pro Pannellum.js. Obsahuje úhly (`pitch`, `yaw`), popisek a cílovou místnost (`sceneId`). |