import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.render("root", { currentDate: new Date().toLocaleDateString() });
});

export default router;
