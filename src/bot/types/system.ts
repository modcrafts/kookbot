import { Emoji, MessageMeta } from "./message";
import { Channel, GuildRole } from "./base";

export interface IBaseSystemExtra {
  type: NoticeType;
  body: AddedRoleBody | { a: string };
}

export interface Notice {
  type: NoticeType
  body: NoticeBody
}
export interface NoticeBody extends Channel, MessageMeta, GuildRole {
  value: string
  msg_id: string
  target_id: string
  channel_id: string
  operator_id: string
  emoji: Emoji
  content: string
  icon: string
  notify_type: number
  region: string
  enable_open: number
  openId: number
  default_channel_id: string
  welcome_channel_id: string
  updated_at: number
  joined_at: number
  exited_at: number
  deleted_at: number
  nickname: string
  chat_code: string
  event_time: number
  guilds: string[]
}

export type NoticeType =
  | "user_updated"
  | "message_btn_click"
  | "added_reaction"
  | "deleted_reaction"
  | "updated_message"
  | "deleted_message"
  | "pinned_message"
  | "unpinned_message"
  | "joined_guild"
  | "exited_guild"
  | "updated_guild_member"
  | "updated_guild"
  | "deleted_guild"
  | "self_joined_guild"
  | "self_exited_guild"
  | "added_role"
  | "deleted_role"
  | "updated_role"
  | "added_block_list"
  | "deleted_block_list"
  | "added_emoji"
  | "updated_emoji"
  | "added_channel"
  | "updated_channel"
  | "deleted_channel"
  | "updated_private_message"
  | "deleted_private_message"
  | "private_added_reaction"
  | "private_deleted_reaction"
  | "joined_channel"
  | "exited_channel"
  | "guild_member_online"
  | "guild_member_offline";

export interface AddedRoleBody {
  role_id: number;
  name: string;
  color: number;
  position: number;
  hoist: number;
  mentionable: number;
  permissions: number;
}
