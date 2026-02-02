import { makeFindPostTypeByIdUseCase } from "@/infra/factories/application/find-post-type-by-id.use-case.factory";
import { t } from "@caffeine/models";
import Elysia from "elysia";

const IdObjectDTO = t.Object({
	id: t.String({
		format: "uuid",
		description: "Post Type's unique identifier",
	}),
});

export const GetPostTypeByIdController = new Elysia()
	.decorate("service", makeFindPostTypeByIdUseCase())
	.get(
		"/:id",
		({ params: { id }, service }) => {
			return service.run(id);
		},
		{
			params: IdObjectDTO,
			detail: {
				summary: "Find Post Type by ID",
				tags: ["Post Types"],
				description:
					"Retrieves the details of a specific post type identified by its unique ID.",
			},
		},
	);
