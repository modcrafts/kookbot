import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import pino from 'pino'
import uWS, {HttpResponse} from 'uWebSockets.js';
import config from "./config";
import * as zlib from "zlib";
import {Context} from "cordis";

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const logger = pino({ name: "webhook"})

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  // uWS 注册监听路由
  uWS.App().post('/kook', async (res, req) => {
    const jsonData = await readJson(res);
    const data = jsonData.d;
    // 检查 verify_token 避免恶意请求
    if (data.verify_token !== config.verifyToken) {
      res.writeHeader("Status", "403 FORBIDDEN").end()
    }
    // 处理 Kook Challenge
    if (data.channel_type == "WEBHOOK_CHALLENGE") {
      const body = {challenge: data.challenge}
      res.writeHeader("Status", "200 OK").end(JSON.stringify(body));
      return;
    }
    res.writeHeader("Status", "200 OK");
  }, ).listen(8787, (token) => {
    if (token) {
      logger.info('Listening to port ' + config.kook_port);
    } else {
      logger.fatal('Failed to listen to port ' + config.kook_port);
    }
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })

};

export default app;
export { app, options }

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
            logger.error('解压缩失败:', err);
            reject('解压缩失败');
          } else {
            const decodedData = result.toString('utf8');
            logger.info('解压缩后的数据:', decodedData);

            let jsonData;
            try {
              jsonData = JSON.parse(decodedData);
              logger.info('解析后的JSON对象:', jsonData);
              resolve(jsonData); // 解析成功，返回解析后的JSON对象
            } catch (err) {
              logger.error('JSON解析失败:', err);
              reject('JSON解析失败');
            }
          }
        });
      }
    });

    // 注册错误回调函数
    res.onAborted(() => {
      reject('请求中止');
    });
  });
}

