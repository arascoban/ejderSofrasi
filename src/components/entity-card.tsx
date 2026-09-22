import Link from "next/link";

import { entityTypeLabel, periodLabels } from "@/lib/domain/labels";
import type { EntitySummary } from "@/lib/domain/types";
import { entityHref } from "@/lib/routing/entity";

export function EntityCard({ entity }: { entity: EntitySummary }) {
  return (
    <article className="entity-card">
      <div className="entity-card__meta">
        <span>{entityTypeLabel(entity.type)}</span>
        <span>{entity.id}</span>
      </div>
      <h2>
        <Link href={entityHref(entity.slug)}>{entity.name}</Link>
      </h2>
      <p>{periodLabels(entity.periods)}</p>
      <Link className="text-link" href={entityHref(entity.slug)}>
        Kaydı incele <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
