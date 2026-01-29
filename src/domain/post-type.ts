import { Entity, Schema } from "@caffeine/models";
import type { IPostType } from "./types/post-type.interface";
import type { EntityDTO } from "@caffeine/models/dtos";
import { BuildPostTypeDTO } from "./dtos/build-post-type.dto";
import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { makeEntityFactory } from "@caffeine/models/factories";
import type { IUnmountedPostType } from "./types/unmounted-post-type.interface";

export class PostType extends Entity<IUnmountedPostType> implements IPostType {
	public name: string;
	public slug: string;
	public readonly schema: Schema;
	public isHighlighted: boolean;

	private constructor(
		{ name, isHighlighted, schema, slug }: IPostType,
		entityData: EntityDTO,
	) {
		super(Entity.prepare(entityData));

		this.name = name;
		this.schema = schema;
		this.isHighlighted = isHighlighted;
		this.slug = slug;
	}

	public static make(
		initialProperties: BuildPostTypeDTO,
		schema: Schema,
		entityProps?: EntityDTO,
	): PostType {
		if (!Schema.make(BuildPostTypeDTO).match(initialProperties))
			throw new InvalidDomainDataException("post@post-type");

		if (!(schema instanceof Schema))
			throw new InvalidDomainDataException("post@post-type:schema");

		entityProps = entityProps ?? makeEntityFactory();

		return new PostType(
			{
				isHighlighted: initialProperties.isHighlighted ?? false,
				name: initialProperties.name,
				schema,
				slug: initialProperties.slug,
			},
			entityProps,
		);
	}

	public override unpack(): IUnmountedPostType {
		const { unpack: _, schema: _schema, ...content } = this;
		const schema = _schema.toString();

		return { ...content, schema };
	}
}
