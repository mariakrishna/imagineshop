import pkg from "jsonwebtoken";
import { UserService } from "../services/user-services.js";
const Jwt = pkg;

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization ? authorization.split(" ")[1] : undefined;
  if (!token) {
    return res.status(401).json({ message: "Sem autorização. Faça o login" });
  }
  const secretKey = process.env.SECRET_KEY;
  Jwt.verify(
    token,
    secretKey,
    { ignoreExpiration: false },
    async (err, decodecToken) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Aconteceu um erro ao logar no sistema." });
      }
      const isValidToken = decodecToken && decodecToken.user;
      if (!isValidToken) {
        return res
          .status(401)
          .json({ message: "Aconteceu um erro ao logar no sistema" });
      }

      const userService = new UserService();
      const user = await userService.findByEmail(decodecToken.user.email);
      if (user) {
        next();
      }
    }
  );
};
