import { describe, it, beforeEach, expect } from "bun:test";
import { bootstrap } from "../dev/bootstrap";
import { t } from "@caffeine/models";
import { faker } from "@faker-js/faker";
import { Schema } from "@caffeine/schema";
import { treaty } from "@elysiajs/eden";

const PostTypeDTO = t.Object({
    name: t.String({ description: "testing post type features" }),
});

const PostTypeSchema = Schema.make(PostTypeDTO);

type App = Awaited<ReturnType<typeof bootstrap>>;

describe("FindHighlightedPostTypesController", () => {
    let server: App;
    let api: ReturnType<typeof treaty<App>>;
    let env: App["decorator"]["env"];

    beforeEach(async () => {
        server = await bootstrap();
        await (
            server.decorator.cache as unknown as {
                flushall: () => Promise<void>;
            }
        ).flushall();
        api = treaty<typeof server>(server);
        env = server.decorator.env;
    });

    async function authenticate() {
        const { AUTH_EMAIL: email, AUTH_PASSWORD: password } = env;
        const auth = await api.auth.login.post({ email, password });
        const cookies = auth.response.headers.getSetCookie();
        return { headers: { cookie: cookies.join("; ") } };
    }

    async function createPostType(
        options: Awaited<ReturnType<typeof authenticate>>,
        highlight: boolean = false,
    ) {
        const name = faker.book.title();
        const { data } = await api["post-types"].post(
            { name, schema: PostTypeSchema.toString() },
            options,
        );

        if (highlight) {
            await api["post-types"]({ "id-or-slug": data!.slug }).patch(
                { isHighlighted: true },
                options,
            );
        }

        return data!;
    }

    it("should return an empty list when no highlighted post types exist", async () => {
        const { status, data } = await api["post-types"].highlights.get({
            query: { page: 1 },
        });

        expect(status).toBe(200);
        expect(data).toEqual([]);
    });

    it("should return only highlighted post types", async () => {
        const options = await authenticate();
        await createPostType(options, true);
        await createPostType(options, true);
        await createPostType(options, false);

        const { status, data } = await api["post-types"].highlights.get({
            query: { page: 1 },
        });

        expect(status).toBe(200);
        expect(data).toHaveLength(2);
        expect(data!.every((item) => item.isHighlighted === true)).toBe(true);
    });

    it("should not include non-highlighted post types", async () => {
        const options = await authenticate();
        await createPostType(options, false);
        await createPostType(options, false);

        const { status, data } = await api["post-types"].highlights.get({
            query: { page: 1 },
        });

        expect(status).toBe(200);
        expect(data).toEqual([]);
    });

    it("should not require authentication", async () => {
        const { status } = await api["post-types"].highlights.get({
            query: { page: 1 },
        });

        expect(status).toBe(200);
    });

    it("should return post type objects with expected fields", async () => {
        const options = await authenticate();
        await createPostType(options, true);

        const { data } = await api["post-types"].highlights.get({
            query: { page: 1 },
        });

        expect(data).toHaveLength(1);

        const item = data![0]!;
        expect(item.name).toBeDefined();
        expect(item.slug).toBeDefined();
        expect(item.schema).toBeDefined();
        expect(item.isHighlighted).toBe(true);
        expect(item.id).toBeDefined();
        expect(item.createdAt).toBeDefined();
    });

    it("should return pagination headers", async () => {
        const options = await authenticate();
        await createPostType(options, true);
        await createPostType(options, true);
        await createPostType(options, false);

        const { response } = await api["post-types"].highlights.get({
            query: { page: 1 },
        });

        expect(response.headers.get("x-total-count")).toBe("2");
        expect(response.headers.get("x-total-pages")).toBe("1");
    });

    it("should return an empty list for a page beyond available data", async () => {
        const options = await authenticate();
        await createPostType(options, true);

        const { status, data } = await api["post-types"].highlights.get({
            query: { page: 999 },
        });

        expect(status).toBe(200);
        expect(data).toEqual([]);
    });
});
