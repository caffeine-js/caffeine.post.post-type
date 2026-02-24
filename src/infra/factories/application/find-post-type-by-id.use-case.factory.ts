import { FindPostTypeByIdUseCase } from "@/application/use-cases/find-post-type.use-case";
import { makePostTypeRepository } from "../repositories/post-type.repository.factory";

export function makeFindPostTypeByIdUseCase() {
	return new FindPostTypeByIdUseCase(makePostTypeRepository());
}
