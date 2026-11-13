
/**
 * Obal nad Pannellum.js pro 360° prohlížeč (blok View) včetně debug módu (Ctrl + Shift + D).
 */
export function createViewer({ containerId, scenes, initialSceneId, onSceneChange }) {
  const titleEl = document.getElementById('currentRoomTitle');
  const floorEl = document.getElementById('currentRoomFloor');
  const debugBadgeEl = document.getElementById('debugBadge');
  const fullscreenBtn = document.getElementById('btnFullscreen');
  const hintEl = document.getElementById('viewHint');

  let currentSceneId = initialSceneId;
  let isDebug = false;

  function formatFloorLabel(floor) {
    if (floor === 0) return 'Přízemí';
    if (floor < 0) return `${Math.abs(floor)}. PP (suterén)`;
    return `${floor}. patro`;
  }

  function updateRoomBadge(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) return;

    if (titleEl) titleEl.textContent = scene.title || sceneId;
    if (floorEl) floorEl.textContent = formatFloorLabel(scene.floor ?? 0);
  }

  // Převod formátu ze scenes.json na konfiguraci Pannellum
  const pannellumScenes = {};
  for (const [id, data] of Object.entries(scenes)) {
    pannellumScenes[id] = {
      title: data.title,
      type: 'equirectangular',
      panorama: data.panorama,
      autoLoad: true,
      hotSpots: (data.hotSpots || []).map((spot) => ({
        pitch: spot.pitch,
        yaw: spot.yaw,
        type: spot.type || 'scene',
        text: spot.text || scenes[spot.sceneId]?.title || '',
        sceneId: spot.sceneId
      }))
    };
  }

  // eslint-disable-next-line no-undef
  const viewer = pannellum.viewer(containerId, {
    default: {
      firstScene: initialSceneId,
      sceneFadeDuration: 500,
      autoLoad: true,
      showControls: false,
      mouseZoom: true
    },
    scenes: pannellumScenes
  });

  updateRoomBadge(initialSceneId);

  // Skrytí úvodní nápovědy při prvním pohybu v panoramatu
  const containerEl = document.getElementById(containerId);
  if (containerEl && hintEl) {
    const hideHint = () => hintEl.classList.add('fade-out');
    containerEl.addEventListener('pointerdown', hideHint, { once: true });
  }

  // Reakce na kliknutí na šipku uvnitř 360° panoramatu
  viewer.on('scenechange', (nextSceneId) => {
    if (!nextSceneId || nextSceneId === currentSceneId) return;

    currentSceneId = nextSceneId;
    updateRoomBadge(nextSceneId);

    if (typeof onSceneChange === 'function') {
      onSceneChange(nextSceneId);
    }
  });

  // Debug mód na zkratku Ctrl + Shift + D
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
      e.preventDefault();
      isDebug = !isDebug;
      viewer.setHotSpotDebug(isDebug);
      if (debugBadgeEl) {
        debugBadgeEl.classList.toggle('hidden', !isDebug);
      }
    }
  });

  // Přepínání celé obrazovky
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      viewer.toggleFullscreen();
    });
  }

  function loadScene(sceneId) {
    if (!scenes[sceneId] || sceneId === currentSceneId) return;
    currentSceneId = sceneId;
    updateRoomBadge(sceneId);
    viewer.loadScene(sceneId);
  }

  return {
    loadScene,
    getCurrentSceneId: () => currentSceneId
  };
}
