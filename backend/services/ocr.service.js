import Tesseract from "tesseract.js";

export async function runOCR(filePath) {

    const result = await Tesseract.recognize(filePath, "eng");

    return result.data.text;
}