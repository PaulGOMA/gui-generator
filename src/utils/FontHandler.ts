import { FileHandler } from "./FileHandler";
import type { FontStorageData } from "../core/types";
import path from "node:path";

const fontsPath: string = path.resolve("../asset/fonts/font-storage.json");

export const FontHandler = () => {

    const defaultFont = {
        family: "inter",
        weight: "regular",
        style: "normal"
    };

    // Loading the JSON file 
    const fontDataPromise = FileHandler(fontsPath).readJSON<FontStorageData>();

    const isFontLoaded = async (
        family: string,
        weight: string,
        style: string
    ): Promise<boolean> => {
        try {
            const isLoaded = await fontDataPromise;
            return !!isLoaded[family]?.[weight]?.[style];
        } catch(err) {
            console.error(`Error checking font "${family}/${weight}/${style}"`, err); 
            throw err;
        }
    };

    const fontResolver = async (
        family: string,
        weight: string,
        style: string
    ): Promise<string> => {
        try {
            const fontLoaded = await fontDataPromise;
            const pathLoaded = fontLoaded[family]?.[weight]?.[style];

            if(!pathLoaded){
                throw new Error(`Font not found: ${family}/${weight}/${style}`);
            }

            return pathLoaded;
        } catch(err) {
            console.error(`Error resolving font "${family}/${weight}/${style}"`, err); 
            throw err;
        }
    };

    const getDefaultFont = async (): Promise<string> => {
        try {
            return fontResolver(defaultFont.family, defaultFont.weight, defaultFont.style);
        } catch(err) {
            console.error("Error default font not found", err);
            throw err;
        }
    }

    return {
        isFontLoaded,
        fontResolver,
        getDefaultFont
    };
}