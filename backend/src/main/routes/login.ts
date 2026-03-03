import { Router } from "express";

const loginRouter = Router();


loginRouter.post("/", (req, res) => {
    return res.json({
      token: "mock-jwt-token-123",
      user: {
        name: "Trader",
        role: "demo"
      }
    });

});

export default loginRouter;