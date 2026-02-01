import { FileHandler } from "../src/utils/FileHandler";

// On mock fs/promises
jest.mock("node:fs/promises", () => ({
    readFile: jest.fn()
}));

import fs from "node:fs/promises";

describe("FileHandler", () => {

    it("should read a text file", async () => {
        // Arrange
        (fs.readFile as jest.Mock).mockResolvedValue("Hello World");

        const handler = FileHandler("test.txt");

        // Act
        const result = await handler.readFile();

        // Assert
        expect(result).toBe("Hello World");
        expect(fs.readFile).toHaveBeenCalledWith("test.txt", { encoding: "utf8" });
    });

    it("should read and parse JSON", async () => {
        // Arrange
        (fs.readFile as jest.Mock).mockResolvedValue(`{"name":"Paul","age":30}`);

        const handler = FileHandler("data.json");

        // Act
        const result = await handler.readJSON<{ name: string; age: number }>();

        // Assert
        expect(result).toEqual({ name: "Paul", age: 30 });
    });

    it("should throw an error if file cannot be read", async () => {
        // Arrange
        (fs.readFile as jest.Mock).mockRejectedValue(new Error("File not found"));

        const handler = FileHandler("missing.json");

        // Act + Assert
        await expect(handler.readFile()).rejects.toThrow("File not found");
    });

    it("should throw an error if file cannot be read", async () => {
        jest.spyOn(console, "error").mockImplementation(() => {});

        (fs.readFile as jest.Mock).mockRejectedValue(new Error("File not found"));

        const handler = FileHandler("missing.json");

        await expect(handler.readFile()).rejects.toThrow("File not found");
    });

});
