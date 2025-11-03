import "express-session";

declare module "express-session" {
  // definint the information that will be stored in the session object
  interface SessionData {
    user?: User;
  }
}
