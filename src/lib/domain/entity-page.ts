import { emptyEditorialRepository, type EditorialRepository } from "@/lib/editorial/contracts";
import { getEntityById, getEntityFacts, getEntityRelations } from "@/lib/data/repository";

export async function getEntityPage(
  id: string,
  editorialRepository: EditorialRepository = emptyEditorialRepository,
) {
  const entity = await getEntityById(id);
  if (!entity) return null;
  const [facts, relations, editorial] = await Promise.all([
    getEntityFacts(entity.id),
    getEntityRelations(entity.id),
    editorialRepository.getPublishedContent(entity.id),
  ]);
  return {
    entity,
    facts,
    relations,
    editorial,
    article: editorial?.revision ?? null,
    media: editorial?.media ?? [],
  };
}
