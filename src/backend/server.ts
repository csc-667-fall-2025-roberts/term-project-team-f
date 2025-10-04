import * as path from "path";
import express from "express";
import createHttpError from "http-errors";

import rootRoutes from "./routes/root";
import testRoutes from "./routes/test";
// import requestTimestampMiddleware from "./middleware/requestTimestamp";

const app = express();

const PORT = process.env.PORT || 3000;

// ordering is important: top -> bottom execution
// app.use(requestTimestampMiddleware);

app.use(express.static(path.join("dist", "public")));
app.set("views", path.join(__dirname, "views")); // look for the view specified
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use("/test", testRoutes);

app.use((_request, _response, next) => {
  next(createHttpError(404));
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
