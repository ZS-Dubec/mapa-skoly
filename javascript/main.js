
import { findShortestPath } from './core/bfs.js';
import { createRouter } from './core/router.js';
import { createViewer } from './window/viewer.js';
import { createMap2D } from './window/map2d.js';
import { createNavigation } from './window/navigation.js';

async function initApp() {
  let scenes = {};

  try {
    const response = await fetch('assets/data/scenes.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    scenes = await response.json();
  } catch (err) {
    console.error('Nepodařilo se načíst assets/data/scenes.json:', err);
    const titleEl = document.getElementById('currentRoomTitle');
    if (titleEl) titleEl.textContent = 'Chyba při načítání dat školy';
    return;
  }

  const sceneIds = Object.keys(scenes);
  if (sceneIds.length === 0) {
    console.warn('Soubor scenes.json neobsahuje žádné místnosti.');
    return;
  }

  // Výchozí pohled při otevření bez hashe: pohled před školou, případně první scéna v JSONu
  const defaultSceneId = scenes.pred_skolou
    ? 'pred_skolou'
    : scenes.chodba_vstup
      ? 'chodba_vstup'
      : sceneIds[0];

  let viewer = null;
  let map2d = null;
  let navigation = null;

  // 1. Inicializace URL routeru
  const router = createRouter({
    scenes,
    defaultSceneId,
    onRouteChange: ({ sceneId, startId, targetId }) => {
      viewer?.loadScene(sceneId);
      map2d?.setActiveScene(sceneId);
      navigation?.syncCurrentLocation(sceneId);

      if (startId && targetId) {
        const path = findShortestPath(scenes, startId, targetId);
        map2d?.setRoute(path);
        navigation?.displayRoute(startId, targetId, path);
      } else {
        map2d?.setRoute([]);
      }
    }
  });

  const initialState = router.getInitialState();

  // 2. Inicializace 360° prohlížeče (blok View)
  viewer = createViewer({
    containerId: 'panorama',
    scenes,
    initialSceneId: initialState.sceneId,
    onSceneChange: (nextSceneId) => {
      router.setCurrentScene(nextSceneId);
      map2d?.setActiveScene(nextSceneId);
      navigation?.syncCurrentLocation(nextSceneId);
    }
  });

  // 3. Inicializace 2D půdorysu (blok Mapa)
  map2d = createMap2D({
    scenes,
    initialSceneId: initialState.sceneId,
    onSelectScene: (selectedSceneId) => {
      viewer.loadScene(selectedSceneId);
      router.setCurrentScene(selectedSceneId);
      map2d.setActiveScene(selectedSceneId);
      navigation?.syncCurrentLocation(selectedSceneId);
    }
  });

  // 4. Inicializace vyhledávání tras (blok Navigace)
  navigation = createNavigation({
    scenes,
    initialSceneId: initialState.sceneId,
    getShareUrl: () => router.getShareableUrl(),
    onRequestRoute: (startId, targetId) => {
      const path = findShortestPath(scenes, startId, targetId);
      router.setRouteParams(startId, targetId);
      map2d.setRoute(path);
      navigation.displayRoute(startId, targetId, path);

      // Přesun kamery na startovní bod zvolené trasy
      viewer.loadScene(startId);
      router.setCurrentScene(startId);
      map2d.setActiveScene(startId);
    },
    onClearRoute: () => {
      router.setRouteParams(null, null);
      map2d.setRoute([]);
    }
  });

  // 5. Pokud uživatel otevřel sdílený odkaz s parametry ?start=X&target=Y, rovnou vykresli trasu
  if (initialState.startId && initialState.targetId) {
    const initialPath = findShortestPath(scenes, initialState.startId, initialState.targetId);
    map2d.setRoute(initialPath);
    navigation.displayRoute(initialState.startId, initialState.targetId, initialPath);
  }
}

initApp();
