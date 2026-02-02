import { FindPostTypeByIdUseCase } from "@/application/use-cases/find-post-type-by-id.use-case";
import { makePostTypeRepository } from "../repositories/post-type.repository.factory";

export function makeFindPostTypeByIdUseCase() {
	return new FindPostTypeByIdUseCase(makePostTypeRepository());
}
