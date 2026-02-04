import { FontHandler } from "../src/utils/FontHandler";
import { FileHandler } from "../src/utils/FileHandler";

// Mock complet de FileHandler
jest.mock("../src/utils/FileHandler", () => ({
    FileHandler: jest.fn()
}));

describe("FontHandler", () => {

    const mockFontData = {
        inter: {
            regular: {
                normal: "./inter/Inter_18pt-Regular.ttf",
                italic: "./inter/Inter_18pt-Italic.ttf"
            },
            bold: {
                normal: "./inter/Inter_18pt-Bold.ttf"
            }
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // readJSON() renvoie une Promise résolue avec mockFontData
        (FileHandler as jest.Mock).mockReturnValue({
            readJSON: jest.fn().mockResolvedValue(mockFontData)
        });
    });

    it("should detect an existing font", async () => {
        const handler = FontHandler();

        const result = await handler.isFontLoaded("inter", "regular", "normal");

        expect(result).toBe(true);
    });

    it("should detect a missing font", async () => {
        const handler = FontHandler();

        const result = await handler.isFontLoaded("inter", "regular", "unknown-style");

        expect(result).toBe(false);
    });

    it("should resolve a valid font path", async () => {
        const handler = FontHandler();

        const path = await handler.fontResolver("inter", "regular", "normal");

        expect(path).toBe("./inter/Inter_18pt-Regular.ttf");
    });

    it("should throw when resolving a missing font", async () => {
        const handler = FontHandler();

        await expect(
            handler.fontResolver("inter", "regular", "missing")
        ).rejects.toThrow("Font not found");
    });

    it("should resolve the default font", async () => {
        const handler = FontHandler();

        const path = await handler.getDefaultFont();

        expect(path).toBe("./inter/Inter_18pt-Regular.ttf");
    });

    it("should throw if JSON loading fails", async () => {
        // On force readJSON() à rejeter une erreur
        (FileHandler as jest.Mock).mockReturnValue({
            readJSON: jest.fn().mockRejectedValue(new Error("JSON error"))
        });

        const handler = FontHandler();

        await expect(handler.isFontLoaded("inter", "regular", "normal"))
            .rejects.toThrow("JSON error");
    });
});
