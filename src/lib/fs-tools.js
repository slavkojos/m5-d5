import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../db");

const publicProductDB = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public"
); // THIS SHOULD BE SPECIFIC TO THE FOLDER FOR PRODUCT IMAGES

// console.log(reviewsFolderPathLuca)
console.log(publicProductDB);

// CRUD FILE PATHS
export const getReviews = async () =>
  await readJSON(join(dataFolderPath, "reviews.json"));

export const writeReviews = async (content) =>
  await writeJSON(join(dataFolderPath, "reviews.json"), content);

export const getProducts = async () =>
  await readJSON(join(dataFolderPath, "products.json"));

export const getBooksReadStream = () =>
  fs.createReadStream(join(dataFolderPath, "products.json"));

export const writeProducts = async (content) =>
  await writeJSON(join(dataFolderPath, "products.json"), content);

export const writeProductPictures = async (fileName, content) =>
  await writeFile(join(publicProductDB, fileName), content);

export const getCurrentFolderPath = (currentFile) =>
  dirname(fileURLToPath(currentFile));

export const readProductPictures = (fileName) =>
  createReadStream(join(publicProductDB, fileName));
