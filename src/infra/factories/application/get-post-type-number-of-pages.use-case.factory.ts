import { CountPostTypesUseCase } from "@/application/use-cases/count-post-types.use-case";
import { makePostTypeRepository } from "../repositories/post-type.repository.factory";

export function makeGetPostTypeNumberOfPagesUseCase() {
	return new CountPostTypesUseCase(makePostTypeRepository());
}
