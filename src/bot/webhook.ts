import { DataProcesser } from "./dataProcesser";
import * as Kook from "./types";
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
        new DataProcesser(res, req).readData((payload: Kook.PayLoad) => {
            if (payload.d.verify_token !== process.env.KOOK_VERIFY_TOKEN) {
                res.writeStatus("401 Unauthorized").end()
                return
            }
            if (payload.d.channel_type == "WEBHOOK_CHALLENGE") {
                res.end(JSON.stringify({
                    challenge: payload.d.challenge
                }))
                return
            }
            res.end()
            return
        })
    } catch (error) {
        res.end(""+error)
    }
}

export { webhook }



