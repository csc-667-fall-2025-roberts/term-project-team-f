import express from "express";
import { Auth } from "../db";

const router = express.Router();

// SIGN UP

router.get("/signup", async (_request, response) => {
  response.render("auth/signup");
});

router.post("/signup", async (request, response) => {
  const { username, email, password } = request.body;

  try {
    const user = await Auth.signup(username, email, password);
    
    // Save user to session
    request.session.user = user;
    
    response.redirect("/lobby");
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    response.render("auth/signup", { error });
  }
});

// LOGIN

router.get("/login", async (_request, response) => {
  response.render("auth/login");
});

router.post("/login", async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await Auth.login(username, password);
    
    // Save user to session
    request.session.user = user;
    
    response.redirect("/lobby");
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    response.render("auth/login", { error });
  }
});

// LOGOUT

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
