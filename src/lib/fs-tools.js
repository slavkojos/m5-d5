import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const reviewsDB = join(
  dirname(fileURLToPath(import.meta.url)),
  "../db/reviews.json"
);

const publicDB = join(dirname(fileURLToPath(import.meta.url)), "../../public"); // Flynn's version

// console.log(reviewsFolderPathLuca)
console.log(reviewsFolderPath);

// CRUD FILE PATHS
export const getReviews = async () =>
  await readJSON(join(reviewsDB, "reviews.json"));

export const writeReviews = async (content) =>
  await writeJSON(join(reviewsDB, "reviews.json"), content);

export const writeReviewsPictures = async (fileName, content) =>
  await writeFile(join(publicDB, fileName), content);

export const getCurrentFolderPath = (currentFile) =>
  dirname(fileURLToPath(currentFile));

export const readReviewsPictures = (fileName) =>
  createReadStream(join(reviewsFolderPath, fileName));
