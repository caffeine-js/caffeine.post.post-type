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
	protected override schema: Schema<t.TString> = SchemaSchema;

	public static make(value: string, info: IValueObjectMetadata): SchemaVO {
		const newVO = new SchemaVO(SchemaManager.build(value), info);

		newVO.validate();

		return newVO;
	}

	protected override validate(): void {
		if (!SchemaManager.isSchema(this.value.toJSON())) {
			throw new InvalidPropertyException(this.info.name, this.info.source);
		}
	}
}
