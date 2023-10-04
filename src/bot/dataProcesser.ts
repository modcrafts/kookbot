import uWS from "uWebSockets.js";
import * as zlib from "zlib";

export class DataProcesser {
    private callback!: Function;
    private type!: string;
    constructor(private res: uWS.HttpResponse, private req: uWS.HttpRequest) {
        this.type = req.getHeader("content-encoding")
    }

    readData(callback: any) {
        this.callback = callback
        let buffer: Buffer
        this.res.onData(async (ab, isLast) => {
            let chunk = Buffer.from(ab)
            if (isLast) {
              if (buffer) {
                this.processData(Buffer.concat([buffer, chunk]));
              } else {
                this.processData(chunk);
              }
            } else {
              if (buffer) {
                buffer = Buffer.concat([buffer, chunk]);
              } else {
                buffer = Buffer.concat([chunk]);
              }
            }
          });
    }

    processData(buffer: Buffer) {
        try {
            if ( this.type == "" ) {
                    this.callback(JSON.parse(buffer.toString()))
            } else if (this.type == "deflate") {
                zlib.inflate(buffer, (err, result) => {
                    if (err) {
                        throw "解压缩失败"
                    }
                    this.callback(JSON.parse(result.toString()))
                })
            }
        } catch (error) {
            this.res.end(""+error)
        }
    }
}