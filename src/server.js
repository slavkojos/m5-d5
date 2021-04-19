import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import productsRoute from "./services/products.js";
import reviewsRoute from "./services/reviews.js";
import listEndpoints from "express-list-endpoints";

const currentWorkingFile = fileURLToPath(import.meta.url);
const currentWorkingDirectory = dirname(currentWorkingFile);

const publicFolderDirectory = join(currentWorkingDirectory, "../public");

const app = express();

app.use(cors());

app.use(express.static(publicFolderDirectory));

app.use(express.json());

app.use("/products", productsRoute);
app.use("/reviews", reviewsRoute);

const PORT = process.env.PORT || 5000;
console.log(listEndpoints(app));
app.listen(PORT, () => console.log("🚀 Server is running on port ", PORT));

app.on("error", (error) => console.log("🚀 Server is not running due to ", error));
