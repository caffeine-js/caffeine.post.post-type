import { t } from "@caffeine/models";
import { BooleanDTO } from "@caffeine/models/dtos/primitives";

export const UpdatePostTypeQueryParamsDTO = t.Object({
	"update-slug": t.Optional(BooleanDTO),
});

export type UpdatePostTypeQueryParamsDTO = t.Static<
	typeof UpdatePostTypeQueryParamsDTO
>;
