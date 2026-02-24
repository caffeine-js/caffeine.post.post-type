import { CountPostTypesUseCase } from "@/application/use-cases/count-post-types.use-case";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";

export function makeCountPostTypesUseCase(): CountPostTypesUseCase {
	const repository = makePostTypeRepository();
	return new CountPostTypesUseCase(repository);
}
