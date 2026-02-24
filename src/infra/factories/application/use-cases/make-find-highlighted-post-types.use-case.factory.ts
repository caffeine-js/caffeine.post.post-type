import { FindHighlightedPostTypesUseCase } from "@/application/use-cases/find-highlighted-post-types.use-case";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";

export function makeFindHighlightedPostTypesUseCase(): FindHighlightedPostTypesUseCase {
	const repository = makePostTypeRepository();
	return new FindHighlightedPostTypesUseCase(repository);
}
