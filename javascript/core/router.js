//
// Správa URL (#mistnost a ?start=X&cil=Y) pro GitHub Pages.
//

export function createRouter({ scenes, defaultSceneId, onRouteChange }) {
  let lastState = {
    sceneId: null,
    startId: null,
    targetId: null
  };
  
  //Přečte a ověří aktuální stav z adresního řádku proti scenes.json.
  function parseCurrentUrl() {
    const url = new URL(window.location.href);
    const rawHash = decodeURIComponent(url.hash.replace(/^#/, ''));
    const rawStart = url.searchParams.get('start');
    const rawTarget = url.searchParams.get('target');

    const startId = rawStart && scenes[rawStart] ? rawStart : null;
    const targetId = rawTarget && scenes[rawTarget] ? rawTarget : null;

    // Priorita zobrazení: 1. #hash, 2. ?start= parametr, 3. výchozí pohled před školou
    let sceneId = defaultSceneId;
    if (rawHash && scenes[rawHash]) {
      sceneId = rawHash;
    } else if (startId) {
      sceneId = startId;
    }

    return { sceneId, startId, targetId };
  }


  // Zapíše aktuální místnost do #hash (zachová ?start= a ?target=).
  function setCurrentScene(sceneId, { replace = false } = {}) {
    if (!scenes[sceneId]) return;

    const url = new URL(window.location.href);
    url.hash = `#${encodeURIComponent(sceneId)}`;

    lastState = { ...lastState, sceneId };

    if (replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
  }


  // Zapíše nebo vymaže parametry trasy (?start=X&cil=Y) + zachování aktuálního #hash.
  function setRouteParams(startId, targetId) {
    const url = new URL(window.location.href);

    if (startId && targetId && scenes[startId] && scenes[targetId]) {
      url.searchParams.set('start', startId);
      url.searchParams.set('target', targetId);
      lastState = { ...lastState, startId, targetId };
    } else {
      url.searchParams.delete('start');
      url.searchParams.delete('target');
      lastState = { ...lastState, startId: null, targetId: null };
    }

    window.history.pushState(null, '', url);
  }

  // Zkopírování do schránky.
  function getShareableUrl() {
    return window.location.href;
  }


   // funkce Zpět/Vpřed v prohlížeči + <a href="#jidelna">.
  function handleBrowserNavigation() {
    const nextState = parseCurrentUrl();

    const isUnchanged =
      nextState.sceneId === lastState.sceneId &&
      nextState.startId === lastState.startId &&
      nextState.targetId === lastState.targetId;

    if (isUnchanged) return;

    lastState = nextState;
    if (typeof onRouteChange === 'function') {
      onRouteChange(nextState);
    }
  }

  // Inicializace při prvním načtení stránky
  const initialState = parseCurrentUrl();
  setCurrentScene(initialState.sceneId, { replace: true });
  lastState = initialState;

  window.addEventListener('popstate', handleBrowserNavigation);
  window.addEventListener('hashchange', handleBrowserNavigation);

  return {
    getInitialState: () => initialState,
    setCurrentScene,
    setRouteParams,
    getShareableUrl
  };
}
