// Helper function useful in the (loose) equality checking of ParityGame
export function deepEquals(a: any, b: any): boolean {
  if (a === null || b === null) {
    throw new Error("deepEquals does not support null values")
  }
  if (a === b) {
    return true;
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (const key in a) {
    if (!deepEquals(a[key], b[key])) {
      return false;
    }
  }
  return true;
}