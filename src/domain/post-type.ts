import type { IPostType } from "./types/post-type.interface";
import type { Schema } from "@caffeine/schema";
import { Entity } from "@caffeine/entity";
import {
	EntityContext,
	EntitySchema,
	EntitySource,
} from "@caffeine/entity/symbols";
import { UnpackedPostTypeSchema } from "./schemas";
import { AutoUpdate } from "@caffeine/entity/decorators";
import type { SchemaDTO } from "./dtos";
import type { IMakePostType } from "./types";
import { BooleanVO, DefinedStringVO, SlugVO } from "@caffeine/value-objects";
import { SchemaVO } from "./value-objects";
import type { EntityDTO } from "@caffeine/entity/dtos";
import { makeEntity } from "@caffeine/entity/factories";

export class PostType
	extends Entity<UnpackedPostTypeSchema>
	implements IPostType
{
	public override readonly [EntitySource]: string = "post@post-type";
	public static readonly [EntitySource]: string = "post@post-type";
	public override readonly [EntitySchema]: Schema<UnpackedPostTypeSchema> =
		UnpackedPostTypeSchema;

	private _name: DefinedStringVO;
	private _slug: SlugVO;
	private _schema: SchemaVO;
	private _isHighlighted: BooleanVO;

	private constructor(
		{ isHighlighted, name, schema, slug }: IMakePostType,
		entityProps: EntityDTO,
	) {
		super(entityProps);

		this._name = DefinedStringVO.make(name, this[EntityContext]("name"));
		this._slug = SlugVO.make(slug ?? name, this[EntityContext]("slug"));
		this._schema = SchemaVO.make(schema, this[EntityContext]("schema"));
		this._isHighlighted =
			isHighlighted !== undefined
				? BooleanVO.make(isHighlighted, this[EntityContext]("isHighlighted"))
				: BooleanVO.falsy(this[EntityContext]("isHighlighted"));
	}

	public static make(
		initialProps: IMakePostType,
		entityProps?: EntityDTO,
	): IPostType {
		return new PostType(initialProps, entityProps ?? makeEntity());
	}

	@AutoUpdate
	rename(value: string): void {
		this._name = DefinedStringVO.make(value, this[EntityContext]("name"));
	}

	@AutoUpdate
	reslug(value: string): void {
		this._slug = SlugVO.make(value, this[EntityContext]("slug"));
	}

	@AutoUpdate
	setHighlightTo(value: boolean): void {
		this._isHighlighted = BooleanVO.make(
			value,
			this[EntityContext]("isHighlighted"),
		);
	}

	get name(): string {
		return this._name.value;
	}

	get slug(): string {
		return this._slug.value;
	}

	get schema(): Schema<typeof SchemaDTO> {
		return this._schema.value;
	}

	get isHighlighted(): boolean {
		return this._isHighlighted.value;
	}
}
