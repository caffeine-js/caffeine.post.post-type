import { t } from "@caffeine/models";

export const UpdatePostTypeDTO = t.Object(
	{
		name: t.Optional(
			t.String({
				description:
					"The unique name of the post type (e.g., 'review', 'blog-post').",
				examples: ["review"],
				minLength: 1,
			}),
		),
		slug: t.Optional(
			t.String({
				description:
					"The unique slug identifier for the post type (e.g., 'my-adventures').",
				examples: ["my-adventures"],
				minLength: 1,
			}),
		),
		isHighlighted: t.Optional(
			t.Boolean({
				description:
					"Indicates if the post type should be highlighted in the UI.",
			}),
		),
	},
	{
		description: "Data transfer object for updating an existing post type.",
		minProperties: 1,
	},
);

export type UpdatePostTypeDTO = t.Static<typeof UpdatePostTypeDTO>;
