//
//  Najde nejkratší cestu mezi dvěma místnostmi pomocí algoritmu Breadth-First Search.
//

export function findShortestPath(scenes, startId, targetId) {
  // Ujistí parametry.
  if (!scenes || !scenes[startId] || !scenes[targetId]) {
    return null;
  }

  // Když se Start = Cíly.
  if (startId === targetId) {
    return [startId];
  }

  const queue = [[startId]];
  const visited = new Set([startId]);
  let head = 0;
  
  // Main loop.
  while (head < queue.length) {
    const path = queue[head++];
    const currentId = path[path.length - 1];
    const neighbors = scenes[currentId]?.neighbors || [];

    for (const neighborId of neighbors) {    // Ochrana proti překlepu v poli neighbors v scenes.json.
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

//
// Vypočet info o nalezené trase (počet kroků, změny pater).
//

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
