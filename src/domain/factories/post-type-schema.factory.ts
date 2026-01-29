import { InvalidDomainDataException } from "@caffeine/errors/domain";
import { SchemaManager, type Schema } from "@caffeine/models";

export class PostTypeSchemaFactory {
	public static make(schema: string): Schema {
		if (!SchemaManager.isSchema(schema))
			throw new InvalidDomainDataException(
				"post@post-type:schema",
				"The provided schema is invalid.",
			);

		return SchemaManager.build(schema);
	}
}
