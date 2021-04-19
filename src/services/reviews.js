import { Router } from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";
import multer from "multer";
import { v4 as uniqid } from "uuid";
import { checkSchema, validationResult } from "express-validator";
import { writeFile } from "fs";
const route = Router();
const currentWorkingFile = fileURLToPath(import.meta.url);
const currentWorkingDirectory = dirname(currentWorkingFile);
const publicFolderDirectory = join(currentWorkingDirectory, "../../../public");
const productsDB = join(currentWorkingDirectory, "../db/products.json");
const reviewsDB = join(currentWorkingDirectory, "../db/reviews.json");

route.put("/:id", async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const reviewsToEdit = reviewsDB;
    const existenArrayOfReview = reviewsToEdit.filter((e) => e._id !== reqId);

    const newArrayOfReview = { ...req.body, id: reqId };
    existenArrayOfReview.push(newArrayOfReview);

    writeFile(existenArrayOfReview);
    res.status(201).res.send({ _id: existenArrayOfReview._id });
  } catch (error) {
    console.log(error);
  }
});
export default route;
