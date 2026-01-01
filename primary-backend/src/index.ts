import express  from "express";
import { userRouter } from "./router/user";
import { zapRouter } from "./router/zap";
import { triggerRoute } from "./router/trigger";
import { actionRoute } from "./router/action";

import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user" , userRouter);

app.use("/api/v1/zap" , zapRouter);

app.use("/api/v1/trigger" , triggerRoute)

app.use("/api/v1/action" , actionRoute)

app.listen(3000);