import { UpdatePostTypeUseCase } from "@/application/use-cases/update-post-type.use-case";
import { makePostTypeRepository } from "../repositories/post-type.repository.factory";

export function makeUpdatePostTypeBySlugUseCase() {
	return new UpdatePostTypeUseCase(makePostTypeRepository());
}
