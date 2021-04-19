import { Router } from "express";

import { fileURLToPath } from "url";

import { dirname, join } from "path";

import fs from "fs-extra";

import multer from "multer";

import { v4 as uniqid } from "uuid";

import { checkSchema, validationResult } from "express-validator";

const route = Router();

const currentWorkingFile = fileURLToPath(import.meta.url);

const currentWorkingDirectory = dirname(currentWorkingFile);

const publicFolderDirectory = join(currentWorkingDirectory, "../../../public");

const productsDB = join(currentWorkingDirectory, "../db/products.json");
const reviewsDB = join(currentWorkingDirectory, "../db/reviews.json");

route.get("/", async (req, res, next) => {
  res.send("hello from products");
});

export default route;
