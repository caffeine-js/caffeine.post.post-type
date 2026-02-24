import { DeletePostTypeBySlugUseCase } from "@/application/use-cases/delete-post-type-by-slug.use-case";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";
import { makeFindPostTypeUseCase } from "./make-find-post-type.use-case.factory";

export function makeDeletePostTypeBySlugUseCase(): DeletePostTypeBySlugUseCase {
	const repository = makePostTypeRepository();
	const findPostType = makeFindPostTypeUseCase();
	return new DeletePostTypeBySlugUseCase(repository, findPostType);
}
