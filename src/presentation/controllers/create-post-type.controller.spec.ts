import { describe, it, beforeEach, expect } from "bun:test";
import { bootstrap } from "../dev/bootstrap";
import { t } from "@caffeine/models";
import { faker } from "@faker-js/faker";
import { Schema } from "@caffeine/schema";
import { treaty } from "@elysiajs/eden";
import { slugify } from "@caffeine/entity/helpers";

const PostTypeDTO = t.Object({
    name: t.String({ description: "testing post type features" }),
});

const PostTypeSchema = Schema.make(PostTypeDTO);

type App = Awaited<ReturnType<typeof bootstrap>>;

describe("CreatePostTypeController", () => {
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

    it("should create a post type", async () => {
        const options = await authenticate();
        const postTypeTitle = faker.book.title();

        const { status, data } = await api["post-types"].post(
            {
                name: postTypeTitle,
                schema: PostTypeSchema.toString(),
            },
            options,
        );

        expect(status).toBe(201);
        expect(data?.slug).toBe(slugify(postTypeTitle));
    });

    it("should return the full post type payload on creation", async () => {
        const options = await authenticate();
        const postTypeTitle = faker.book.title();

        const { data } = await api["post-types"].post(
            {
                name: postTypeTitle,
                schema: PostTypeSchema.toString(),
            },
            options,
        );

        expect(data).toMatchObject({
            name: postTypeTitle,
            slug: slugify(postTypeTitle),
            schema: PostTypeSchema.toString(),
            isHighlighted: false,
        });
        expect(data?.id).toBeDefined();
        expect(data?.createdAt).toBeDefined();
        expect(data?.updatedAt).toBeUndefined();
    });

    it("should default isHighlighted to false", async () => {
        const options = await authenticate();

        const { data } = await api["post-types"].post(
            {
                name: faker.book.title(),
                schema: PostTypeSchema.toString(),
            },
            options,
        );

        expect(data?.isHighlighted).toBe(false);
    });

    it("should reject unauthenticated requests", async () => {
        const { status } = await api["post-types"].post({
            name: faker.book.title(),
            schema: PostTypeSchema.toString(),
        });

        expect(status).not.toBe(201);
    });

    it("should reject a request with missing name", async () => {
        const options = await authenticate();

        const { status } = await api["post-types"].post(
            {
                name: "",
                schema: PostTypeSchema.toString(),
            } as never,
            options,
        );

        expect(status).toBe(422);
    });

    it("should reject a request with missing schema", async () => {
        const options = await authenticate();

        const { status } = await api["post-types"].post(
            { name: faker.book.title() } as never,
            options,
        );

        expect(status).toBe(422);
    });

    it("should not allow duplicate post types with the same slug", async () => {
        const options = await authenticate();
        const postTypeTitle = faker.book.title();
        const body = {
            name: postTypeTitle,
            schema: PostTypeSchema.toString(),
        };

        const first = await api["post-types"].post(body, options);
        expect(first.status).toBe(201);

        const second = await api["post-types"].post(body, options);
        expect(second.status).not.toBe(201);
    });

    it("should generate different slugs for different names", async () => {
        const options = await authenticate();

        const first = await api["post-types"].post(
            { name: "Alpha Post", schema: PostTypeSchema.toString() },
            options,
        );

        const second = await api["post-types"].post(
            { name: "Beta Post", schema: PostTypeSchema.toString() },
            options,
        );

        expect(first.status).toBe(201);
        expect(second.status).toBe(201);
        expect(first.data?.slug).not.toBe(second.data?.slug);
    });
});
