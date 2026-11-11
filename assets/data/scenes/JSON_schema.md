# JSON struktura pro 360° prohlídku ZŠ Dubeč

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
