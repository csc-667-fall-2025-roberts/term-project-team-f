import express from "express";
import db from "../db/connection";
import { Auth } from "../db";
import { error } from "console";

const router = express.Router();

// SIGN UP

router.get("/signup", async (_request, response) => {
  response.render("auth/signup");
});

// will receive the information
router.post("/signup", async (request, response) => {
  const { username, email, password } = request.body;

  try {
    const user = await Auth.signup(username, email, password);
    // hook up to sessions
    response.redirect("/lobby");
  } catch (e: any) {
    response.render("auth/signup", { error: e });
  }
});

// LOGIN

router.get("/login", async (_request, response) => {
  response.render("/auth/signin");
});

// will receive the information
router.post("/login", async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await Auth.login(username, password);

    // hook up to session
  } catch (e: any) {
    response.render("auth/login", { error: e });
  }
});

router.get("/logout", async (request, response) => {
  await new Promise((resolve, reject) => {
    request.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve("");
      }
    });
  }).catch((error) => console.error(error));

  response.redirect("/");
});

export default router;
