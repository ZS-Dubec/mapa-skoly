import { getURLParams, updateNavigationURL, clearNavigationURL, updateHash, copyShareableLink } from './js/core/router.js';
import { findPath } from './js/core/bfs.js';
import { initViewer, loadScene, setDebugMode } from './js/core/viewer.js';
import { isAdminLoggedIn, registerAdminShortcut } from './js/core/admin.js';

let scenesData = {};
let currentSceneId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Načtení databáze místností ze JSONu
        const response = await fetch('./assets/data/scenes.json');
        if (!response.ok) throw new Error(`Chyba načítání JSON: ${response.status}`);
        scenesData = await response.json();

        // 2. Určení startovní místnosti (podle #hash v URL, ?start=, nebo první v JSONu)
        const { start, target, sceneId } = getURLParams();
        const availableScenes = Object.keys(scenesData);
        const initialScene = (sceneId && scenesData[sceneId]) ? sceneId 
                           : (start && scenesData[start]) ? start 
                           : availableScenes[0];

        currentSceneId = initialScene;
        updateHash(initialScene);

        // 3. Spuštění 360° prohlížeče přes viewer.js
        initViewer('panorama', initialScene, scenesData, (newSceneId) => {
            currentSceneId = newSceneId;
            updateHash(newSceneId);
        });

        // 4. Podpora tlačítek Zpět / Vpřed v prohlížeči
        window.addEventListener('hashchange', () => {
            const { sceneId: hashScene } = getURLParams();
            if (hashScene && hashScene !== currentSceneId && scenesData[hashScene]) {
                currentSceneId = hashScene;
                loadScene(hashScene);
            }
        });

        // 5. Spuštění navigace, pokud je v URL ?start=X&target=Y
        if (start && target) {
            handleNavigation(start, target);
        }

        // 6. Registrace Admin zkratky (Ctrl + Shift + D)
        registerAdminShortcut((debugActive) => {
            setDebugMode(debugActive);
        });

        if (isAdminLoggedIn()) {
            setDebugMode(true);
        }

        console.log("Mapa školy úspěšně spuštěna. Aktivní místnost:", initialScene);

    } catch (error) {
        console.error("Chyba při spouštění aplikace:", error);
    }
});

// Funkce pro přepnutí místnosti zvenčí (např. po kliknutí na 2D mapu)
export function goToScene(targetSceneId) {
    if (scenesData[targetSceneId]) {
        currentSceneId = targetSceneId;
        loadScene(targetSceneId);
        updateHash(targetSceneId);
    }
}

// Výpočet a spuštění trasy (BFS)
export function handleNavigation(startId, targetId) {
    const route = findPath(scenesData, startId, targetId);
    if (route) {
        console.log("Nalezená trasa:", route);
        updateNavigationURL(startId, targetId);
        return route;
    }
    return null;
}

// Zrušení navigace
export function cancelNavigation() {
    clearNavigationURL();
}
