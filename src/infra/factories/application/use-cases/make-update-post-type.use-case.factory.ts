import { UpdatePostTypeUseCase } from "@/application/use-cases/update-post-type.use-case";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";
import { makeFindPostTypeUseCase } from "./make-find-post-type.use-case.factory";
import { makeSlugUniquenessCheckerService } from "@/infra/factories/domain/services/make-slug-uniqueness-checker.service.factory";

export function makeUpdatePostTypeUseCase(): UpdatePostTypeUseCase {
	const repository = makePostTypeRepository();
	const findPostType = makeFindPostTypeUseCase();
	const uniquenessChecker = makeSlugUniquenessCheckerService();
	return new UpdatePostTypeUseCase(repository, findPostType, uniquenessChecker);
}
