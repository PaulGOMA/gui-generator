import fs from "node:fs/promises";

export const FileHandler = (file: string) => {

    const readFile = async (): Promise<string> => {
        try {
            return await fs.readFile(file, { encoding: "utf8" });
        } catch (err) {
            console.error(`Error reading file ${file}:`, err);
            throw err;
        }
    };

    const readJSON = async <T = unknown>(): Promise<T> => {
        const data = await readFile();

        try {
            return JSON.parse(data) as T;
        } catch (err) {
            console.error(`Error parsing JSON from file ${file}:`, err);
            throw err;
        }
    };

    return { readFile, readJSON };
};
