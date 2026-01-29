import { Schema, SchemaManager } from "@caffeine/models";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import type { IUnmountedPostType } from "../types/unmounted-post-type.interface";
import { PostType } from "../post-type";
import { UnmountedPostTypeDTO } from "../dtos/unmounted-post-type.dto";

export class BuildPostType {
	public static run(unmountedPostType: IUnmountedPostType): PostType {
		if (!Schema.make(UnmountedPostTypeDTO).match(unmountedPostType))
			throw new InvalidDomainDataException("post@post-type::unmount");

		const {
			id,
			createdAt,
			updatedAt,
			schema: _schema,
			...postTypeProperties
		} = unmountedPostType;

		const schema = SchemaManager.build(_schema);

		return PostType.make(postTypeProperties, schema, {
			id,
			createdAt,
			updatedAt,
		});
	}
}
