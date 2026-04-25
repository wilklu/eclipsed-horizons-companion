export function serializeReturnRoute(route) {
  if (!route || typeof route !== "object") return "";

  const name = typeof route.name === "string" ? route.name : "";
  if (!name) return "";

  return JSON.stringify({
    name,
    params: route.params && typeof route.params === "object" ? route.params : {},
    query: route.query && typeof route.query === "object" ? route.query : {},
  });
}

export function deserializeReturnRoute(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || typeof parsed.name !== "string" || !parsed.name.trim()) {
      return null;
    }

    return {
      name: parsed.name,
      params: parsed.params && typeof parsed.params === "object" ? parsed.params : {},
      query: parsed.query && typeof parsed.query === "object" ? parsed.query : {},
    };
  } catch {
    return null;
  }
}
