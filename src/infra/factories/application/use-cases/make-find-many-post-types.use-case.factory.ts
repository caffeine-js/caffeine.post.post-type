import { FindManyPostTypesUseCase } from "@/application/use-cases/find-many-post-types.use-case";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";

export function makeFindManyPostTypesUseCase(): FindManyPostTypesUseCase {
	const repository = makePostTypeRepository();
	return new FindManyPostTypesUseCase(repository);
}
