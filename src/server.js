import "dotenv/config";
import express, { json } from "express";
import pkg from "jsonwebtoken";
const Jwt = pkg;

import { authMiddleware } from "./middlewares/authMidleware.js";
import { UserService } from "./services/user-services.js";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", async (req, res) => {
  return res.status(200).json({ message: "Imagineshop" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userService = new UserService();
  const userLogged = await userService.login(email, password);
  if (userLogged) {
    const secretKey = process.env.SECRET_KEY;
    const token = Jwt.sign({ user: userLogged }, secretKey, {
      expiresIn: "3600s",
    });
    return res.status(200).json({ token });
  }
  return res.status(400).json({ message: "e-mail ou senha inválidos" });
});

app.use(authMiddleware);

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  const user = { name, email, password };
  const userService = new UserService();
  await userService.create(user);

  return res.status(201).json(user);
});

app.get("/users", async (req, res) => {
  const userService = new UserService();
  const users = await userService.findAll();
  return res.status(200).json(users);
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const userService = new UserService();
  const users = await userService.findById(id);
  if (users) {
    return res.status(200).json(users);
  }
  return res.status(404).json({ message: "Usuário não encontrado" });
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const userService = new UserService();
  const user = await userService.findById(id);
  if (user) {
    await userService.delete(id);
    return res.status(200).json({ message: "Usuário deletado." });
  }
  return res.status(404).json({ message: "Usuário não encontrado." });
});

app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;
  const user = { name, email, password };
  const userService = new UserService();
  const findUser = await userService.findById(id);
  if (findUser) {
    const userUpdated = await userService.update(id);
    return res.status(200).json(userUpdated);
  }
  return res.status(404).json({ message: "Usuário não encontrado." });
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
