import Tesseract from "tesseract.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import os from "os";

export async function runOCR(filePath) {
    const preprocessed = path.join(os.tmpdir(), `ocr_${Date.now()}.png`);
    await sharp(filePath)
        .greyscale()
        .normalise()
        .sharpen()
        .resize({ width: 1800, withoutEnlargement: true })
        .png()
        .toFile(preprocessed);

    const result = await Tesseract.recognize(preprocessed, "eng", {
        tessedit_pageseg_mode: "6",
        preserve_interword_spaces: "1",
    });
    fs.unlink(preprocessed, () => {});
    return result.data.text;
}