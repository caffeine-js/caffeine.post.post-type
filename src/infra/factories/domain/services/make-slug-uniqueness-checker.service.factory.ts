import type { IPostTypeUniquenessCheckerService } from "@/domain/types/services";
import { SlugUniquenessCheckerService } from "@caffeine/domain/services";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";

export function makeSlugUniquenessCheckerService(): IPostTypeUniquenessCheckerService {
	const repository = makePostTypeRepository();
	return new SlugUniquenessCheckerService(repository);
}
