import Elysia from "elysia";
import { CreatePostTypeController } from "./controllers/create-post-type.controller";
import { DeletePostTypeController } from "./controllers/delete-post-type.controller";
import { GetPostTypeByPageController } from "./controllers/get-post-type-by-page.controller";
import { GetPostTypeBySlugController } from "./controllers/get-post-type-by-slug.controller";
import { GetPostTypeHighlightsController } from "./controllers/get-post-type-highlights.controller";
import { GetPostTypeNumberOfPagesController } from "./controllers/get-post-type-number-of-pages.controller";
import { UpdatePostTypeController } from "./controllers/update-post-type.controller";
import { GetPostTypeByIdController } from "./controllers/get-post-type-by-id.controller";

export const PostTypeRoutes = new Elysia({ prefix: "/post-type" })
	.use(CreatePostTypeController)
	.use(DeletePostTypeController)
	.use(GetPostTypeByIdController)
	.use(GetPostTypeByPageController)
	.use(GetPostTypeBySlugController)
	.use(GetPostTypeHighlightsController)
	.use(GetPostTypeNumberOfPagesController)
	.use(UpdatePostTypeController);

export type PostTypeRoutes = typeof PostTypeRoutes;
