import { DataProcesser } from "./dataProcesser";
import pino from "pino";
import uWS from "uWebSockets.js";

const logger = pino({ name: "webhook", transport: { target: "pino-pretty" } });
const webhookPort = Number(process.env.KOOK_WEBHOOK_PORT)

async function webhook() {
    uWS.App()
        .any("/*",async (res) => { res.end("Omni Bot API"); })
        .post("/webhook", async (res, req) => {
            handler(res, req)
            res.onAborted(() => {});
        })
        .listen(webhookPort, (token) => {
            if (token) {
              logger.info("Listening to port " + webhookPort);
            } else {
              logger.fatal("Failed to listen to port " + webhookPort);
            }
          });
}

async function handler(res: uWS.HttpResponse, req: uWS.HttpRequest) {
    try {
        new DataProcesser(res, req).readData((data: any) => {
            console.log(data)
            res.end()
        })
    } catch (error) {
        res.end(""+error)
    }
}

export { webhook }



