import { query, Router } from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";
import multer from "multer";
import { v4 as uniqid } from "uuid";
import { checkSchema, validationResult, check } from "express-validator";
import checkFileType from "../middlewares/checkfiletype.js";
import { getBooksReadStream } from "../lib/fs-tools.js";
import { pipeline } from "stream";
import { Transform } from "json2csv";
const route = Router();
const upload = multer();

const currentWorkingFile = fileURLToPath(import.meta.url);
const currentWorkingDirectory = dirname(currentWorkingFile);

const publicFolderDirectory = join(currentWorkingDirectory, "../../public");

const productsDB = join(currentWorkingDirectory, "../db/products.json");
const reviewsDB = join(currentWorkingDirectory, "../db/reviews.json");

route.get("/", async (req, res, next) => {
  const filterProducts = await fs.readJSON(productsDB);
  if ((req.query && req.query.name) || req.query.category) {
    const filteringProducts = filterProducts.filter(
      (e) =>
        e.category.toLowerCase() === req.query.category.toLowerCase() ||
        e.name.toLowerCase() === req.query.name.toLowerCase()
    );
    res.send(filteringProducts);
  } else {
    res.send(filterProducts);
  }
});

route.get("/:id/reviews", async (req, res, next) => {
  try {
    const gettingReviews = await fs.readJSON(reviewsDB);
    console.log("sadsa: ", gettingReviews);
    const reqId = req.params.id;
    const grabbingTheReviews = gettingReviews.filter(
      (e) => e.productId === reqId
    );
    if (grabbingTheReviews) {
      res.send(grabbingTheReviews);
    } else {
      res.send({ message: "No reviews" });
    }
  } catch (error) {
    console.log(error);
  }
});

route.get("/:exportToCSV", async (req, res, next) => {
  try {
    const fields = ["id", "description", "name", "brand", "category"]; //fields from the data
    const opts = { fields }; //creates field objects
    const json2csv = new Transform(opts);

    //Content-Disposition is so that it saves the file on disc
    res.setHeader("Content-Disposition", `attachment; filename=export.csv`);

    const fileStream = getBooksReadStream();
    pipeline(fileStream, json2csv, res, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
});

route.put("/:id", async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const productsToEdit = await fs.readJSON(productsDB);
    const existenArrayOfProducts = productsToEdit.filter(
      (e) => e._id !== reqId
    );

    const newArrayOfProducts = { ...req.body, id: reqId };
    existenArrayOfProducts.push(newArrayOfProducts);

    await fs.writeJSON(productsDB, newArrayOfProducts);
    res.status(201).send({ message: "successfully modified" });
  } catch (error) {
    console.log(error);
  }
});

route.delete("/:id", async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const gettingProducts = await fs.readJSON(productsDB);
    const deleteProducts = gettingProducts.filter((e) => e.id !== reqId);

    await fs.writeJSON(productsDB, deleteProducts);

    res.status(201).send({ message: "Successfully deleted" });
  } catch (error) {
    console.log(error);
  }
});
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

route.post(
  "/:id/upload",
  upload.single("image"),
  checkFileType(["image/jpeg", "image/png", "image/jpg"]),
  async (req, res, next) => {
    try {
      const { originalname, buffer, size } = req.file;
      const finalDestination = join(publicFolderDirectory, originalname);
      await fs.writeFile(finalDestination, buffer);
      const link = `${req.protocol}://${req.hostname}:${process.env.PORT}/${originalname}`;
      const products = await fs.readJSON(productsDB);
      const product = products.find((product) => product.id === req.params.id);
      const oldProducts = products.filter(
        (product) => product.id !== req.params.id
      );
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
  }
);

route.post(
  "/",
  [
    check("name").exists().notEmpty().withMessage("Name is mandatory field"),
    check("description")
      .exists()
      .notEmpty()
      .withMessage("description is mandatory field"),
    check("brand").exists().notEmpty().withMessage("brand is mandatory field"),
    check("price").exists().notEmpty().withMessage("price is mandatory field"),
    check("category")
      .exists()
      .notEmpty()
      .withMessage("category is mandatory field"),
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
        res.status(201).send({
          id: newProduct.id,
          message: "New product successfully created",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default route;
