import { notFound, permanentRedirect } from "next/navigation";

import { getEntityById } from "@/lib/data/repository";
import { entityHref } from "@/lib/routing/entity";

interface StableEntityPageProps {
  params: Promise<{ id: string }>;
}

export default async function StableEntityPage({ params }: StableEntityPageProps) {
  const entity = await getEntityById((await params).id.toUpperCase());
  if (!entity) notFound();
  permanentRedirect(entityHref(entity.slug));
}
