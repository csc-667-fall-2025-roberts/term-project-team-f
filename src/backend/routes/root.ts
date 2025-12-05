import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  // Redirect logged-in users to lobby
  if (request.session.user) {
    response.redirect("/lobby");
    return;
  }
  response.render("root");
});

export default router;
