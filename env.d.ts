declare namespace NodeJS {
	export interface ProcessEnv {
		POSTGRESQL_USERNAME: string;
		POSTGRESQL_PASSWORD: string;
		POSTGRESQL_DATABASE: string;
		DATABASE_URL: string;
	}
}
