import fs from 'node:fs/promises';

export const FileHandler = (file: string) => {
    const readFile = async (): Promise<string> => {
        try {
            const data = await fs.readFile(file, {encoding: 'utf8'});
            return data;
        } catch (err) {
            console.error(`Error reading file ${file}:`, err);
            throw err;
        }
    };

    const readJSON = async <T = unknown>(): Promise<T> => {
        const data = await readFile();
        return JSON.parse(data) as T;
    };

    return {readFile, readJSON};
}