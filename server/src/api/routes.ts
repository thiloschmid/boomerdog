import { Router } from "express";

const router = Router();

export default router;

router.ws("/echo", async (ws: any, req: any) => {
    console.log("Client connected");
    ws.on("message", async (msg: string) => {
        console.log("Message received");
        console.log(msg);
    })
})
