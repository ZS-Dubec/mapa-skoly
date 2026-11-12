export function initViewer(containerId, initialSceneId, scenesData, onSceneChange) {
    const sceneConfig = scenesData[initialSceneId];
    if (!sceneConfig) {
        console.error(`Scéna "${initialSceneId}" nebyla v JSON nalezena.`);
        return null;
    }

    viewerInstance = pannellum.viewer(containerId, {
        "default": {
            "firstScene": initialSceneId,
            "sceneFadeDuration": 1000,
            "autoLoad": true
        },
        "scenes": formatScenesForPannellum(scenesData)
    });

    // Odchytí změnu scény po kliknutí na šipku a aktualizuje URL (#hash)
    viewerInstance.on('scenechange', (newSceneId) => {
        if (onSceneChange) {
            onSceneChange(newSceneId);
        }
    });

    return viewerInstance;
}

function formatScenesForPannellum(scenesData) {
    const pannellumScenes = {};

    for (const [key, data] of Object.entries(scenesData)) {
        pannellumScenes[key] = {
            title: data.title,
            type: "equirectangular",
            panorama: data.panorama,
            hotSpots: (data.hotSpots || []).map(spot => ({
                pitch: spot.pitch,
                yaw: spot.yaw,
                type: spot.type || "scene",
                text: spot.text,
                sceneId: spot.sceneId
            }))
        };
    }

    return pannellumScenes;
}
