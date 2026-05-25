# 高层接口设计：netease_playlist_merge

## 目标

多个歌单合并为一个，自动去重。减少 AI 串行调用次数，节省 token。

当前 AI 需要串 N+2 步：

| 当前工具 | 操作 |
|----------|------|
| `netease_playlist_read` (tracks) | 读歌单 A、B、C... |
| `netease_playlist_create` | 新建目标歌单 |
| `netease_playlist_track_add` | 逐歌单添加歌曲 |

合并后 1 次调用完成全部操作。

## 接口

```json
{
  "source_ids": ["123", "456", "789"],
  "name": "精选合集",
  "dedup": true,
  "keep_sources": false,
  "sort_by": "popularity"
}
```

**参数：**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `source_ids` | string[] | — | 源歌单 ID 列表 |
| `name` | string | — | 新歌单名称 |
| `dedup` | bool | true | 是否跨歌单去重 |
| `keep_sources` | bool | false | 合并后是否保留源歌单 |
| `sort_by` | string | — | 排序方式：`popularity` 按歌曲热度、`time` 按添加时间、空不排序 |

## 内部逻辑

```
Promise.all 并行读取 source_ids 歌单的歌曲列表
  → 合并为一个数组
    → 如果 dedup 则按 song_id 去重
      → 如果 sort_by 则排序
        → 创建新歌单
          → 批量加歌（超过 100 首自动分批）
            → 如果 !keep_sources 则删除源歌单
              → 返回新歌单信息
```

## 实现位置

- 逻辑层：`packages/mcp-tools/src/domains/playlist.ts` 新增
- 或独立：`packages/mcp-tools/src/workflows/` 新目录
