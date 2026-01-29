import { t } from "@caffeine/models";

export const CreatePostTypeDTO = t.Object({
	name: t.String({ description: "PostType name. example: review" }),
	schema: t.String({
		description:
			"Post t typebox's schema. It must be builded in `SchemaManager`",
	}),
});

export type CreatePostTypeDTO = t.Static<typeof CreatePostTypeDTO>;
