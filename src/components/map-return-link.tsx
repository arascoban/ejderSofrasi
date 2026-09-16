"use client";

import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function MapReturnLink() {
  const query = useSearchParams();
  if (query.get("from") !== "map") return null;
  const mapQuery = new URLSearchParams();
  const era = query.get("era");
  const entity = query.get("entity");
  if (era === "1300" || era === "1600") mapQuery.set("era", era);
  if (entity && /^[A-Z]{3}-[0-9]{4,}$/.test(entity)) mapQuery.set("entity", entity);
  const href = `/map${mapQuery.size ? `?${mapQuery.toString()}` : ""}` as Route;
  return <Link className="breadcrumb__return" href={href}>Haritaya dön</Link>;
}
