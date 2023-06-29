// Create new map with updated keys.
export function updateMapKeys<K, V>(
  mapWithKeysToUpdate: Map<K, V>,
  oldKey: K,
  newKey: K
): Map<K, V> {
  let newMap = new Map<K, V>();

  for (let [key, value] of mapWithKeysToUpdate) {
    if (key === oldKey) {
      newMap.set(newKey, value);
    } else {
      newMap.set(key, value);
    }
  }

  return newMap;
}
