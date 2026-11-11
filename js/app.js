// Testovací ověření, že JS běží
console.log("JavaScript app.js byl úspěšně načten!");

// Inicializace 360° prohlížeče s veřejnou testovací fotkou
document.addEventListener('DOMContentLoaded', () => {
    const viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": "https://pannellum.org/images/alma.jpg", // Testovací fotka z oficiálního webu
        "autoLoad": true,
        "hotSpotDebug": true // Zapnutý debug režim pro testování souřadnic
    });

    console.log("Pannellum 360° prohlížeč spuštěn.");
});
