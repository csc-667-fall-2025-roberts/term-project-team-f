import express from "express";

const router = express.Router();

router.post("/", (request, response) => {
  const { user } = request.session;
});

export default router;
