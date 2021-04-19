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
  const filterProducts = await productsDB;
  if (req.query && req.query.name) {
    const filteringProducts = filterProducts.filter(
      (e) => e.name === req.query.name
    );
    res.send(filteringProducts);
  } else {
    res.send(filterProducts);
  }
  res.send("hello from products");
});

route.get("/:id/reviews", async (req, res, next) => {
  try {
    const gettingReviews = await reviewsDB;
    const reqId = req.params.id;
    const grabbingTheReviews = gettingReviews.filter((e) => e._id === reqId);
    if (grabbingTheReviews) {
      res.send(grabbingTheReviews);
    } else {
      res.send({ message: "No reviews" });
    }
  } catch (error) {
    console.log(error);
  }
});
route.put("/:id", async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const productsToEdit = await productsDB;
    const existenArrayOfProducts = productsToEdit.filter(
      (e) => e._id !== reqId
    );

    const newArrayOfProducts = { ...req.body, id: reqId };
    existenArrayOfProducts.push(newArrayOfProducts);

    await writeFile(existenArrayOfProducts);
    res.status(201).res.send({ message: "successfully modified" });
  } catch (error) {
    console.log(error);
  }
});

route.delete("/:id", async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const gettingProducts = await productsDB;
    const deleteProducts = gettingProducts.filter((e) => e._id !== reqId);

    gettingProducts.push(deleteProducts);
    await writeFile(gettingProducts);

    res.status(201).send({ message: "Successfully deleted" });
  } catch (error) {
    console.log(error);
  }
});

export default route;
