import type { t } from "@caffeine/models";
import { SchemaManager, type Schema } from "@caffeine/schema";
import { ValueObject } from "@caffeine/value-objects/core";
import type { SchemaDTO } from "../dtos/schema.dto";
import { SchemaSchema } from "../schemas/schema.schema";
import type { IValueObjectMetadata } from "@caffeine/value-objects/types";
import { InvalidPropertyException } from "@caffeine/errors/domain";

export class SchemaVO extends ValueObject<
	Schema<typeof SchemaDTO>,
	typeof SchemaDTO
> {
	protected override schema: Schema<t.TString>;

	private constructor(
		value: Schema<typeof SchemaDTO>,
		info: IValueObjectMetadata,
	) {
		super(value, info);
		this.schema = SchemaSchema;
	}

	public static make(value: string, info: IValueObjectMetadata): SchemaVO {
		const newVO = new SchemaVO(SchemaVO.tryBuildSchema(value, info), info);

		newVO.validate();

		return newVO;
	}

	private static tryBuildSchema(
		value: string,
		info: IValueObjectMetadata,
	): Schema<t.TString> {
		try {
			return SchemaManager.build(value);
		} catch (_) {
			throw new InvalidPropertyException(info.name, info.source);
		}
	}

	protected override validate(): void {
		if (!SchemaManager.isSchema(this.value.toJSON())) {
			throw new InvalidPropertyException(this.info.name, this.info.source);
		}
	}
}
