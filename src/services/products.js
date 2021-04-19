import { Router } from "express";

import { fileURLToPath } from "url";

import { dirname, join } from "path";

import fs from "fs-extra";

import multer from "multer";

import { v4 as uniqid } from "uuid";

import { checkSchema, validationResult, check } from "express-validator";
import checkFileType from "../middlewares/checkfiletype.js";
const route = Router();
const upload = multer();

const currentWorkingFile = fileURLToPath(import.meta.url);

const currentWorkingDirectory = dirname(currentWorkingFile);

const publicFolderDirectory = join(currentWorkingDirectory, "../../public");

const productsDB = join(currentWorkingDirectory, "../db/products.json");
const reviewsDB = join(currentWorkingDirectory, "../db/reviews.json");

route.get("/:id", async (req, res, next) => {
  try {
    const products = await fs.readJSON(productsDB);
    const product = products.find((product) => product.id === req.params.id);
    if (product) {
      res.send(product);
    } else {
      const err = new Error("Product not found");
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.post("/:id/upload", upload.single("image"), async (req, res, next) => {
  try {
    const { originalname, buffer, size } = req.file;
    const finalDestination = join(publicFolderDirectory, originalname);
    await fs.writeFile(finalDestination, buffer);
    const link = `${req.protocol}://${req.hostname}:${process.env.PORT}/${originalname}`;
    const products = await fs.readJSON(productsDB);
    const product = products.find((product) => product.id === req.params.id);
    const oldProducts = products.filter((product) => product.id !== req.params.id);
    product.imageURL = link;
    product.updatedAt = new Date();
    oldProducts.push(product);
    await fs.writeJSON(productsDB, products);
    res.send("ok");
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

route.post(
  "/",
  [
    check("name").exists().notEmpty().withMessage("Name is mandatory field"),
    check("description").exists().notEmpty().withMessage("description is mandatory field"),
    check("brand").exists().notEmpty().withMessage("brand is mandatory field"),
    check("price").exists().notEmpty().withMessage("price is mandatory field"),
    check("category").exists().notEmpty().withMessage("category is mandatory field"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.errorList = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const products = await fs.readJSON(productsDB);
        const newProduct = {
          id: uniqid(),
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        products.push(newProduct);
        await fs.writeJSON(productsDB, products);
        res.status(201).send({ id: newProduct.id, message: "New product successfully created" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default route;
