
/**
 * Ovládání 2D půdorysu (blok Mapa): patra, body místností, SVG trasa a zvětšení okna.
 */
export function createMap2D({ scenes, initialSceneId, onSelectScene }) {
  const tourWindowEl = document.getElementById('tourWindow');
  const floorTabsEl = document.getElementById('floorTabs');
  const floorImgEl = document.getElementById('floorPlanImg');
  const routeSvgEl = document.getElementById('mapRouteSvg');
  const pinsEl = document.getElementById('mapPins');
  const expandBtn = document.getElementById('btnToggleMapExpand');

  let activeSceneId = initialSceneId;
  let viewedFloor = scenes[initialSceneId]?.floor ?? 0;
  let currentRoute = [];

  // Zjištění všech dostupných pater ze scenes.json (seřazeno od nejnižšího)
  const floors = [...new Set(Object.values(scenes).map((s) => s.floor ?? 0))].sort((a, b) => a - b);

  function getFloorShortLabel(floor) {
    if (floor === 0) return 'Přízemí';
    if (floor < 0) return `${floor}. PP`;
    return `${floor}. patro`;
  }

  function getFloorImagePath(floor) {
    return `assets/map/floor_${floor}.png`;
  }

  // Záložní SVG půdorys, dokud nebudou nahrané finální obrázky v assets/map/
  if (floorImgEl) {
    floorImgEl.addEventListener('error', () => {
      const label = encodeURIComponent(`Půdorys: ${getFloorShortLabel(viewedFloor)}`);
      floorImgEl.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23e2e8f0"/><rect x="20" y="20" width="760" height="460" fill="none" stroke="%2394a3b8" stroke-width="4" stroke-dasharray="10 8"/><text x="400" y="255" font-family="sans-serif" font-size="24" fill="%23475569" text-anchor="middle">${label}</text></svg>`;
    });
  }

  function renderFloorTabs() {
    if (!floorTabsEl) return;
    floorTabsEl.innerHTML = '';

    for (const floor of floors) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `floor-tab ${floor === viewedFloor ? 'active' : ''}`;
      btn.textContent = getFloorShortLabel(floor);
      btn.addEventListener('click', () => {
        setViewedFloor(floor);
      });
      floorTabsEl.appendChild(btn);
    }
  }

  function renderRouteSvg() {
    if (!routeSvgEl) return;
    routeSvgEl.innerHTML = '';

    if (!Array.isArray(currentRoute) || currentRoute.length < 2) return;

    const svgNS = 'http://www.w3.org/2000/svg';

    for (let i = 0; i < currentRoute.length - 1; i++) {
      const fromScene = scenes[currentRoute[i]];
      const toScene = scenes[currentRoute[i + 1]];

      if (!fromScene?.mapCoords || !toScene?.mapCoords) continue;

      // Vykreslujeme pouze úseky, které leží na aktuálně zobrazeném patře
      if ((fromScene.floor ?? 0) !== viewedFloor || (toScene.floor ?? 0) !== viewedFloor) {
        continue;
      }

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', String(fromScene.mapCoords.x));
      line.setAttribute('y1', String(fromScene.mapCoords.y));
      line.setAttribute('x2', String(toScene.mapCoords.x));
      line.setAttribute('y2', String(toScene.mapCoords.y));
      line.setAttribute('stroke', '#ef4444');
      line.setAttribute('stroke-width', '1.4');
      line.setAttribute('stroke-linecap', 'round');
      routeSvgEl.appendChild(line);
    }
  }

  function renderPins() {
    if (!pinsEl) return;
    pinsEl.innerHTML = '';

    const routeSet = new Set(currentRoute);
    const startId = currentRoute[0];
    const endId = currentRoute[currentRoute.length - 1];

    for (const [id, scene] of Object.entries(scenes)) {
      if ((scene.floor ?? 0) !== viewedFloor || !scene.mapCoords) continue;

      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'map-pin';
      pin.style.left = `${scene.mapCoords.x}%`;
      pin.style.top = `${scene.mapCoords.y}%`;
      pin.title = scene.title || id;
      pin.setAttribute('aria-label', scene.title || id);

      if (routeSet.has(id)) pin.classList.add('on-route');
      if (id === startId) pin.classList.add('route-start');
      if (id === endId) pin.classList.add('route-end');
      if (id === activeSceneId) pin.classList.add('active');

      pin.addEventListener('click', () => {
        if (typeof onSelectScene === 'function') {
          onSelectScene(id);
        }
      });

      pinsEl.appendChild(pin);
    }
  }

  function setViewedFloor(floor) {
    viewedFloor = floor;
    if (floorImgEl) {
      floorImgEl.src = getFloorImagePath(floor);
    }
    renderFloorTabs();
    renderRouteSvg();
    renderPins();
  }

  function setActiveScene(sceneId) {
    if (!scenes[sceneId]) return;
    activeSceneId = sceneId;

    const sceneFloor = scenes[sceneId].floor ?? 0;
    if (sceneFloor !== viewedFloor) {
      setViewedFloor(sceneFloor);
    } else {
      renderPins();
    }
  }

  function setRoute(path) {
    currentRoute = Array.isArray(path) ? path : [];
    renderRouteSvg();
    renderPins();
  }

  // Prohození velikosti Mapa <-> View na desktopu
  if (expandBtn && tourWindowEl) {
    expandBtn.addEventListener('click', () => {
      const expanded = tourWindowEl.classList.toggle('map-expanded');
      expandBtn.textContent = expanded ? '⤡' : '⤢';
    });
  }

  // První vykreslení
  setViewedFloor(viewedFloor);

  return {
    setActiveScene,
    setRoute,
    setViewedFloor
  };
}
