import type { Route } from "next";

export function entityHref(slug: string): Route {
  return `/wiki/${slug}` as Route;
}

export function episodeHref(id: string): Route {
  return `/episodes/${id}` as Route;
}

export function loreHref(id: string): Route {
  return `/lore/${id}` as Route;
}
