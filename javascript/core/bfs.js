/**
 * Najde nejkratší cestu mezi dvěma místnostmi pomocí algoritmu Breadth-First Search (BFS).
 *
 * @param {Object} scenes - Databáze scén ze scenes.json
 * @param {string} startId - ID počáteční místnosti
 * @param {string} targetId - ID cílové místnosti
 * @returns {string[] | null} Pole ID scén od startu do cíle, nebo null pokud cesta neexistuje
 */
export function findShortestPath(scenes, startId, targetId) {
  if (!scenes || !scenes[startId] || !scenes[targetId]) {
    return null;
  }

  if (startId === targetId) {
    return [startId];
  }

  const queue = [[startId]];
  const visited = new Set([startId]);
  let head = 0;

  while (head < queue.length) {
    const path = queue[head++];
    const currentId = path[path.length - 1];
    const neighbors = scenes[currentId]?.neighbors || [];

    for (const neighborId of neighbors) {
      // Ochrana proti překlepu v poli neighbors v scenes.json
      if (!scenes[neighborId] || visited.has(neighborId)) {
        continue;
      }

      const nextPath = [...path, neighborId];

      if (neighborId === targetId) {
        return nextPath;
      }

      visited.add(neighborId);
      queue.push(nextPath);
    }
  }

  return null;
}

/**
 * Vypočítá základní přehled o nalezené trase (počet kroků a změny pater).
 *
 * @param {Object} scenes - Databáze scén ze scenes.json
 * @param {string[]} path - Pole ID scén vrácené funkcí findShortestPath
 * @returns {{ steps: number, startFloor: number, endFloor: number, floorChanges: number } | null}
 */
export function getRouteSummary(scenes, path) {
  if (!Array.isArray(path) || path.length === 0) {
    return null;
  }

  let floorChanges = 0;
  let prevFloor = scenes[path[0]]?.floor ?? 0;

  for (let i = 1; i < path.length; i++) {
    const currentFloor = scenes[path[i]]?.floor ?? prevFloor;
    if (currentFloor !== prevFloor) {
      floorChanges++;
      prevFloor = currentFloor;
    }
  }

  return {
    steps: Math.max(0, path.length - 1),
    startFloor: scenes[path[0]]?.floor ?? 0,
    endFloor: scenes[path[path.length - 1]]?.floor ?? 0,
    floorChanges
  };
}
