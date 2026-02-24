import type { IPostType, IPostTypeReader } from "@/domain/types";
import type { UnpackedPostTypeDTO } from "@/domain/dtos";
import { FindPostTypeUseCase } from "@/application/use-cases/find-post-type.use-case";
import { makePostTypeRepository } from "@/infra/factories/repositories/post-type.repository.factory";
import { FindEntityByTypeUseCase } from "@caffeine/application/use-cases";

export function makeFindPostTypeUseCase(): FindPostTypeUseCase {
	const repository = makePostTypeRepository();
	const findEntityByType = new FindEntityByTypeUseCase<
		typeof UnpackedPostTypeDTO,
		IPostType,
		IPostTypeReader
	>(repository);
	return new FindPostTypeUseCase(findEntityByType);
}
