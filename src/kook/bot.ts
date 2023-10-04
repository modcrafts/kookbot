import * as cordis from "cordis";
import { Awaitable, defineProperty, Dict } from "cosmokit";
import { Bot } from "./bot";
import { MessageExtra } from "./types/message";
import { Data } from "./types/base";

export * from "./bot";

export interface Events<C extends Context = Context> extends cordis.Events<C> {
  "message"(session: Session): void;
  "message-created"(session: Data<MessageExtra>): void;
  "message-deleted"(session: Data<MessageExtra>): void;
  "message-updated"(session: Data<MessageExtra>): void;
  "message-pinned"(session: Session): void;
  "message-unpinned"(session: Session): void;
  "guild-added"(session: Session): void;
  "guild-removed"(session: Session): void;
  "guild-updated"(session: Session): void;
  "guild-member-added"(session: Session): void;
  "guild-member-removed"(session: Session): void;
  "guild-member-updated"(session: Session): void;
  "guild-role-created"(session: Session): void;
  "guild-role-deleted"(session: Session): void;
  "guild-role-updated"(session: Session): void;
  "reaction-added"(session: Session): void;
  "reaction-removed"(session: Session): void;
  "login-added"(session: Session): void;
  "login-removed"(session: Session): void;
  "login-updated"(session: Session): void;
  "friend-request"(session: Session): void;
  "guild-request"(session: Session): void;
  "guild-member-request"(session: Session): void;
  "before-send": EventCallback<Awaitable<void | boolean>, [SendOptions]>;
  "send"(session: Session): void;
  /** @deprecated use `login-added` instead */
  "bot-added"(client: Bot): void;
  /** @deprecated use `login-removed` instead */
  "bot-removed"(client: Bot): void;
  /** @deprecated use `login-updated` instead */
  "bot-status-updated"(client: Bot): void;
  "bot-connect"(client: Bot): Awaitable<void>;
  "bot-disconnect"(client: Bot): Awaitable<void>;
}

export interface Context {
  [Context.config]: Context.Config;
  [Context.events]: Events<this>;
  bots: Bot[] & Dict<Bot>;
}

export class Context extends cordis.Context {
  static readonly session = Symbol("session");

  constructor(options?: Context.Config) {
    super(options);
  }
}

export namespace Context {
  export interface Config extends cordis.Context.Config {}

  export const Config: Config.Static = Schema.intersect([Schema.object({})]);

  namespace Config {
    export interface Static extends Schema<Config> {}
  }
}

Context.service("internal", Internal);

Context.service(
  "bots",
  class {
    constructor(root: Context) {
      const list: Bot[] = [];
      return new Proxy(list, {
        get(target, prop) {
          if (prop in target || typeof prop === "symbol") {
            // @ts-ignore
            return target[prop];
          }
          return list.find((bot) => bot.sid === prop);
        },
        deleteProperty(target, prop) {
          if (prop in target || typeof prop === "symbol") {
            // @ts-ignore
            return delete target[prop];
          }
          const bot = target.findIndex((bot) => bot.sid === prop);
          if (bot < 0) return true;
          target.splice(bot, 1);
          return true;
        },
      });
    }
  },
);
