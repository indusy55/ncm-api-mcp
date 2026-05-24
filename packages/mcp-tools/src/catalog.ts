export type ToolAudience = "guest" | "user" | "both";

export interface ToolDefinition {
  name: string;
  module: string;
  moduleLabel: string;
  action: string;
  actionLabel: string;
  description: string;
  audience: ToolAudience;
  destructive: boolean;
}

export const allToolDefinitions: ToolDefinition[] = [
  { name: "netease_search", module: "search", moduleLabel: "搜索", action: "search", actionLabel: "综合搜索", description: "搜索歌曲、歌单、专辑、歌手，并支持联想、热搜、匹配等模式", audience: "both", destructive: false },
  { name: "netease_search_hot_detail", module: "search", moduleLabel: "搜索", action: "hot_detail", actionLabel: "热搜详情", description: "查看热搜榜详情", audience: "both", destructive: false },
  { name: "netease_personalized", module: "search", moduleLabel: "搜索", action: "personalized", actionLabel: "推荐歌单", description: "获取个性化推荐歌单", audience: "user", destructive: false },
  { name: "netease_personalized_newsong", module: "search", moduleLabel: "搜索", action: "personalized_newsong", actionLabel: "推荐新歌", description: "获取个性化新歌推荐", audience: "user", destructive: false },
  { name: "netease_personalized_mv", module: "search", moduleLabel: "搜索", action: "personalized_mv", actionLabel: "推荐 MV", description: "获取个性化 MV 推荐", audience: "user", destructive: false },

  { name: "netease_user", module: "user", moduleLabel: "用户", action: "read", actionLabel: "用户读取", description: "读取当前账号信息、用户详情、歌单、动态、关注和听歌记录", audience: "both", destructive: false },

  { name: "netease_song_read", module: "song", moduleLabel: "歌曲", action: "read", actionLabel: "歌曲读取", description: "读取歌曲详情、相似歌曲、创作者、版权推荐等信息", audience: "both", destructive: false },
  { name: "netease_song_media", module: "song", moduleLabel: "歌曲", action: "media", actionLabel: "歌曲媒体", description: "获取歌曲播放地址、下载地址、歌词和可用性信息", audience: "both", destructive: false },
  { name: "netease_song_library", module: "song", moduleLabel: "歌曲", action: "library", actionLabel: "歌曲库", description: "获取每日推荐、私人 FM、喜欢列表等个人歌曲资源", audience: "user", destructive: false },
  { name: "netease_song_like_check", module: "song", moduleLabel: "歌曲", action: "like_check", actionLabel: "喜欢状态", description: "检查歌曲是否已喜欢", audience: "user", destructive: false },
  { name: "netease_song_like", module: "song", moduleLabel: "歌曲", action: "like", actionLabel: "喜欢歌曲", description: "喜欢或取消喜欢歌曲", audience: "user", destructive: true },
  { name: "netease_song_lyrics_mark", module: "song", moduleLabel: "歌曲", action: "lyrics_mark", actionLabel: "歌词标记", description: "读取歌曲歌词标记", audience: "both", destructive: false },
  { name: "netease_song_lyrics_mark_user_page", module: "song", moduleLabel: "歌曲", action: "lyrics_mark_user_page", actionLabel: "我的歌词标记", description: "读取当前账号的歌词标记列表", audience: "user", destructive: false },
  { name: "netease_song_lyrics_mark_add", module: "song", moduleLabel: "歌曲", action: "lyrics_mark_add", actionLabel: "添加歌词标记", description: "为歌曲添加歌词标记", audience: "user", destructive: true },
  { name: "netease_song_lyrics_mark_del", module: "song", moduleLabel: "歌曲", action: "lyrics_mark_del", actionLabel: "删除歌词标记", description: "删除歌曲歌词标记", audience: "user", destructive: true },
  { name: "netease_song_purchase_history", module: "song", moduleLabel: "歌曲", action: "purchase_history", actionLabel: "购买历史", description: "查看已购或已下载歌曲记录", audience: "user", destructive: false },

  { name: "netease_playlist_read", module: "playlist", moduleLabel: "歌单", action: "read", actionLabel: "歌单读取", description: "读取歌单详情、动态、歌曲、订阅者等信息", audience: "both", destructive: false },
  { name: "netease_playlist_discover", module: "playlist", moduleLabel: "歌单", action: "discover", actionLabel: "歌单发现", description: "发现歌单分类、热门标签、榜单与精品歌单", audience: "both", destructive: false },
  { name: "netease_playlist_mylike", module: "playlist", moduleLabel: "歌单", action: "mylike", actionLabel: "我喜欢的歌单", description: "查看当前账号喜欢的歌单", audience: "user", destructive: false },
  { name: "netease_playlist_create", module: "playlist", moduleLabel: "歌单", action: "create", actionLabel: "创建歌单", description: "创建新的歌单", audience: "user", destructive: true },
  { name: "netease_playlist_delete", module: "playlist", moduleLabel: "歌单", action: "delete", actionLabel: "删除歌单", description: "删除已有歌单", audience: "user", destructive: true },
  { name: "netease_playlist_name_update", module: "playlist", moduleLabel: "歌单", action: "name_update", actionLabel: "修改名称", description: "修改歌单名称", audience: "user", destructive: true },
  { name: "netease_playlist_desc_update", module: "playlist", moduleLabel: "歌单", action: "desc_update", actionLabel: "修改描述", description: "修改歌单描述", audience: "user", destructive: true },
  { name: "netease_playlist_tags_update", module: "playlist", moduleLabel: "歌单", action: "tags_update", actionLabel: "修改标签", description: "修改歌单标签", audience: "user", destructive: true },
  { name: "netease_playlist_update", module: "playlist", moduleLabel: "歌单", action: "update", actionLabel: "更新歌单", description: "统一更新歌单名称、描述和标签", audience: "user", destructive: true },
  { name: "netease_playlist_subscribe", module: "playlist", moduleLabel: "歌单", action: "subscribe", actionLabel: "收藏歌单", description: "收藏或取消收藏歌单", audience: "user", destructive: true },
  { name: "netease_playlist_track_add", module: "playlist", moduleLabel: "歌单", action: "track_add", actionLabel: "添加歌曲", description: "向歌单添加歌曲", audience: "user", destructive: true },
  { name: "netease_playlist_track_delete", module: "playlist", moduleLabel: "歌单", action: "track_delete", actionLabel: "删除歌曲", description: "从歌单删除歌曲", audience: "user", destructive: true },
  { name: "netease_playlist_import_name_task_create", module: "playlist", moduleLabel: "歌单", action: "import_task_create", actionLabel: "创建导入任务", description: "基于名称创建歌单导入任务", audience: "user", destructive: true },
  { name: "netease_playlist_import_task_status", module: "playlist", moduleLabel: "歌单", action: "import_task_status", actionLabel: "导入任务状态", description: "查看歌单导入任务状态", audience: "user", destructive: false },
  { name: "netease_playlist_order_update", module: "playlist", moduleLabel: "歌单", action: "order_update", actionLabel: "更新排序", description: "更新歌单排序", audience: "user", destructive: true },
  { name: "netease_playlist_update_playcount", module: "playlist", moduleLabel: "歌单", action: "update_playcount", actionLabel: "更新播放量", description: "更新歌单播放量", audience: "user", destructive: true },

  { name: "netease_album_read", module: "album", moduleLabel: "专辑", action: "read", actionLabel: "专辑读取", description: "读取专辑详情、榜单、列表、权限、销量和收藏列表", audience: "both", destructive: false },
  { name: "netease_album_sub", module: "album", moduleLabel: "专辑", action: "subscribe", actionLabel: "收藏专辑", description: "收藏或取消收藏专辑", audience: "user", destructive: true },

  { name: "netease_artist_catalog", module: "artist", moduleLabel: "歌手", action: "catalog", actionLabel: "歌手目录", description: "查看歌手列表、热门歌手和已收藏歌手", audience: "both", destructive: false },
  { name: "netease_artist_read", module: "artist", moduleLabel: "歌手", action: "read", actionLabel: "歌手读取", description: "读取歌手信息、介绍、粉丝和动态", audience: "both", destructive: false },
  { name: "netease_artist_content", module: "artist", moduleLabel: "歌手", action: "content", actionLabel: "歌手内容", description: "读取歌手歌曲、专辑、MV、视频等内容", audience: "both", destructive: false },
  { name: "netease_top_list", module: "artist", moduleLabel: "歌手", action: "top_list", actionLabel: "排行榜", description: "查看榜单详情", audience: "both", destructive: false },
  { name: "netease_artist_sub", module: "artist", moduleLabel: "歌手", action: "subscribe", actionLabel: "收藏歌手", description: "收藏或取消收藏歌手", audience: "user", destructive: true },

  { name: "netease_mv", module: "video", moduleLabel: "视频", action: "mv", actionLabel: "MV", description: "查看 MV 列表、详情、地址和独家推荐", audience: "both", destructive: false },
  { name: "netease_video", module: "video", moduleLabel: "视频", action: "video", actionLabel: "视频", description: "查看视频详情、地址和相关视频", audience: "both", destructive: false },
  { name: "netease_video_feed", module: "video", moduleLabel: "视频", action: "feed", actionLabel: "视频流", description: "查看视频分类、分组和时间线内容", audience: "both", destructive: false },
  { name: "netease_banner", module: "video", moduleLabel: "视频", action: "banner", actionLabel: "Banner", description: "获取 banner 数据", audience: "both", destructive: false },

  { name: "netease_comment_list", module: "comments", moduleLabel: "评论", action: "list", actionLabel: "评论列表", description: "查看评论列表或热评", audience: "both", destructive: false },
  { name: "netease_comment_floor", module: "comments", moduleLabel: "评论", action: "floor", actionLabel: "楼层评论", description: "查看楼层评论详情", audience: "both", destructive: false },
];

export const toolDefinitionMap = new Map(
  allToolDefinitions.map((definition) => [definition.name, definition]),
);

export function getToolDefinition(name: string) {
  return toolDefinitionMap.get(name) ?? null;
}
