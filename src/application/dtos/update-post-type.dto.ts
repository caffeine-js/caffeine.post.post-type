import { t } from "@caffeine/models";

export const UpdatePostTypeDTO = t.Object({
	name: t.Optional(t.String({ description: "PostType name. example: review" })),
	isHighlighted: t.Optional(
		t.Boolean({
			description:
				"Determines whether the post type is highlighted in the application.",
		}),
	),
});

export type UpdatePostTypeDTO = t.Static<typeof UpdatePostTypeDTO>;
