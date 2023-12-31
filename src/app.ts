import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import pino from "pino";
import uWS, { HttpResponse } from "uWebSockets.js";
import * as zlib from "zlib";
import { Context } from "cordis";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import { join } from "path";
import { webhook } from "./bot/webhook";
//import { Data, IBaseResponse } from "./kook/types/base";
//import { IBaseSystemExtra } from "./kook/types/system";

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const logger = pino({ name: "webhook", transport: { target: "pino-pretty" } });

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  
  webhook()

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app, options };

function readJson(res: HttpResponse): Promise<any> {
  return new Promise((resolve, reject) => {
    let compressedData = Buffer.alloc(0);

    // 监听数据传输事件
    res.onData((chunk, isLast) => {
      let chunkBuffer = Buffer.from(chunk);
      compressedData = Buffer.concat([compressedData, chunkBuffer]);

      // 如果是最后一块数据，则进行解压缩
      if (isLast) {
        zlib.inflate(compressedData, (err, result) => {
          if (err) {
            logger.error("解压缩失败:", err);
            reject("解压缩失败");
          } else {
            const decodedData = result.toString("utf8");
            logger.info("解压缩后的数据:", decodedData);

            let jsonData;
            try {
              jsonData = JSON.parse(decodedData);
              logger.info("解析后的JSON对象:", jsonData);
              resolve(jsonData); // 解析成功，返回解析后的JSON对象
            } catch (err) {
              logger.error("JSON解析失败:", err);
              reject("JSON解析失败");
            }
          }
        });
      }
    });

    // 注册错误回调函数
    res.onAborted(() => {
      reject("请求中止");
    });
  });
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      KOOK_WEBHOOK_PORT: number;
      KOOK_VERIFY_TOKEN: string;
      DAEMON_PORT: number;
      LOGGER: boolean;
    }
  }
}