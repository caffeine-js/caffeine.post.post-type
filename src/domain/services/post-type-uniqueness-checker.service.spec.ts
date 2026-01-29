import { describe, it, expect, vi } from "vitest";
import { PostTypeUniquenessChecker } from "./post-type-uniqueness-checker.service";
import type { IPostTypeRepository } from "../types/post-type-repository.interface";

describe("PostTypeUniquenessChecker", () => {
	it("should return true if slug exists (repo returns object)", async () => {
		const repository = {
			findBySlug: vi.fn().mockResolvedValue({ id: "1" }), // Mock object
		} as unknown as IPostTypeRepository;

		const service = new PostTypeUniquenessChecker(repository);
		const result = await service.run("existing-slug");

		expect(result).toBe(true);
		expect(repository.findBySlug).toHaveBeenCalledWith("existing-slug");
	});

	it("should return false if slug does not exist (repo returns null)", async () => {
		const repository = {
			findBySlug: vi.fn().mockResolvedValue(null),
		} as unknown as IPostTypeRepository;

		const service = new PostTypeUniquenessChecker(repository);
		const result = await service.run("non-existing-slug");

		expect(result).toBe(false);
		expect(repository.findBySlug).toHaveBeenCalledWith("non-existing-slug");
	});
});
