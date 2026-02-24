import { CreatePostTypeUseCase } from "@/application/use-cases/create-post-type.use-case";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";
import { makeSlugUniquenessCheckerService } from "@/infra/factories/domain/services/make-slug-uniqueness-checker.service.factory";

export function makeCreatePostTypeUseCase(): CreatePostTypeUseCase {
	const repository = makePostTypeRepository();
	const uniquenessChecker = makeSlugUniquenessCheckerService();
	return new CreatePostTypeUseCase(repository, uniquenessChecker);
}
