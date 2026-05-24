function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function compactSong(song: Record<string, unknown>) {
  const album = asRecord(song.al);
  const artists = asArray(song.ar).map((artist) => ({
    id: artist.id,
    name: artist.name,
  }));

  return {
    id: song.id,
    name: song.name,
    alias: Array.isArray(song.alia) ? song.alia : [],
    duration: song.dt,
    artists,
    album: album
      ? {
          id: album.id,
          name: album.name,
        }
      : null,
  };
}

function compactTrack(track: Record<string, unknown>) {
  const album = asRecord(track.al ?? track.album);
  const artists = asArray(track.ar ?? track.artists).map((artist) => ({
    id: artist.id,
    name: artist.name,
  }));

  return {
    id: track.id,
    name: track.name,
    duration: track.dt,
    artists,
    album: album
      ? {
          id: album.id,
          name: album.name,
        }
      : null,
  };
}

function compactPlaylist(playlist: Record<string, unknown>) {
  const creator = asRecord(playlist.creator);
  return {
    id: playlist.id,
    name: playlist.name,
    trackCount: playlist.trackCount,
    playCount: playlist.playCount,
    creator: creator
      ? {
          userId: creator.userId,
          nickname: creator.nickname,
        }
      : null,
  };
}

function compactAlbum(album: Record<string, unknown>) {
  return {
    id: album.id,
    name: album.name,
    size: album.size,
    publishTime: album.publishTime,
    artist: asArray(album.artists).map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
  };
}

function compactArtist(artist: Record<string, unknown>) {
  return {
    id: artist.id,
    name: artist.name,
    alias: Array.isArray(artist.alias) ? artist.alias : [],
    albumSize: artist.albumSize,
    musicSize: artist.musicSize,
    mvSize: artist.mvSize,
  };
}

function compactVideo(video: Record<string, unknown>) {
  const creator = asArray(video.creator);
  const artists = asArray(video.artists ?? video.artistsInfo ?? video.artistInfos);

  return {
    vid: video.vid ?? video.id,
    title: video.title,
    type: video.type,
    durationms: video.durationms,
    playTime: video.playTime,
    coverUrl: video.coverUrl,
    creator: creator.map((creator) => ({
      userId: creator.userId,
      userName: creator.userName,
    })),
    artists: artists.map((artist) => ({
      id: artist.id,
      name: artist.name ?? artist.artistName,
    })),
  };
}

function compactMv(mv: Record<string, unknown>) {
  return {
    id: mv.id,
    name: mv.name,
    artistName: mv.artistName,
    duration: mv.duration,
    playCount: mv.playCount,
    publishTime: mv.publishTime,
  };
}

function compactUser(user: Record<string, unknown>) {
  return {
    userId: user.userId ?? user.uid,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    signature: user.signature,
    follows: user.follows,
    followeds: user.followeds,
  };
}

export function mapLikelistSummary(body: Record<string, unknown>) {
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id): id is string | number => typeof id === "string" || typeof id === "number")
    : [];

  return {
    code: body.code,
    count: ids.length,
    ids,
  };
}

export function mapSongDetailSummary(body: Record<string, unknown>) {
  const songs = asArray(body.songs).map(compactSong);

  return {
    code: body.code,
    count: songs.length,
    songs,
  };
}

export function mapSongListSummary(body: Record<string, unknown>) {
  const songs = asArray(body.data).length
    ? asArray(body.data).map(compactSong)
    : asArray(body.songs).map(compactSong);

  return {
    code: body.code,
    more: body.more ?? body.hasMore,
    total: body.total,
    count: songs.length,
    songs,
  };
}

export function mapPlaylistDetailSummary(body: Record<string, unknown>) {
  const playlist = asRecord(body.playlist);
  const tracks = asArray(playlist?.tracks).map(compactTrack);

  return {
    code: body.code,
    playlist: playlist
      ? {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          trackCount: playlist.trackCount,
          playCount: playlist.playCount,
          subscribedCount: playlist.subscribedCount,
          commentCount: playlist.commentCount,
          shareCount: playlist.shareCount,
          tracks,
        }
      : null,
  };
}

export function mapPlaylistTrackAllSummary(body: Record<string, unknown>) {
  const songs = asArray(body.songs).map(compactTrack);

  return {
    code: body.code,
    count: songs.length,
    total: body.total,
    more: body.more,
    songs,
  };
}

export function mapSearchSummary(body: Record<string, unknown>) {
  const result = asRecord(body.result);
  const songs = asArray(result?.songs).map(compactSong);
  const playlists = asArray(result?.playlists).map(compactPlaylist);
  const artists = asArray(result?.artists).map((artist) => ({
    id: artist.id,
    name: artist.name,
    albumSize: artist.albumSize,
    musicSize: artist.musicSize,
  }));
  const albums = asArray(result?.albums).map((album) => ({
    id: album.id,
    name: album.name,
    size: album.size,
    artist: asArray(album.artists).map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
  }));

  return {
    code: body.code,
    result: {
      songCount: result?.songCount,
      playlistCount: result?.playlistCount,
      artistCount: result?.artistCount,
      albumCount: result?.albumCount,
      songs,
      playlists,
      artists,
      albums,
    },
  };
}

export function mapSearchSuggestSummary(body: Record<string, unknown>) {
  const result = asRecord(body.result);
  const songs = asArray(result?.songs).map(compactSong);
  const artists = asArray(result?.artists).map(compactArtist);
  const albums = asArray(result?.albums).map(compactAlbum);
  const playlists = asArray(result?.playlists).map(compactPlaylist);
  const mv = asArray(result?.mvs).map(compactMv);

  return {
    code: body.code,
    result: {
      songs,
      artists,
      albums,
      playlists,
      mvs: mv,
    },
  };
}

export function mapSearchHotSummary(body: Record<string, unknown>) {
  const result = asRecord(body.result);
  const hots = asArray(result?.hots ?? body.data).map((item) => ({
    keyword: item.first ?? item.searchWord,
    score: item.second ?? item.score,
    content: item.content,
    iconType: item.iconType,
  }));

  return {
    code: body.code,
    count: hots.length,
    hots,
  };
}

export function mapSearchDefaultSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);

  return {
    code: body.code,
    showKeyword: data?.showKeyword,
    realkeyword: data?.realkeyword,
    searchType: data?.searchType,
    action: data?.action,
  };
}

export function mapUserPlaylistsSummary(body: Record<string, unknown>) {
  const playlist = asArray(body.playlist).map(compactPlaylist);

  return {
    code: body.code,
    more: body.more,
    version: body.version,
    count: playlist.length,
    playlist,
  };
}

export function mapWriteActionSummary(body: Record<string, unknown>) {
  return {
    code: body.code,
    id: body.id,
    playlistId: body.playlistId,
    trackIds: body.trackIds,
  };
}

export function mapUserInfoSummary(body: Record<string, unknown>) {
  const account = asRecord(body.account);
  const profile = asRecord(body.profile);

  return {
    code: body.code,
    account: account
      ? {
          id: account.id,
          userName: account.userName,
          vipType: account.vipType,
        }
      : null,
    profile: profile
      ? {
          userId: profile.userId,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          signature: profile.signature,
          follows: profile.follows,
          followeds: profile.followeds,
        }
      : null,
  };
}

export function mapUserDetailSummary(body: Record<string, unknown>) {
  const profile = asRecord(body.profile);

  return {
    code: body.code,
    level: body.level,
    listenSongs: body.listenSongs,
    createDays: body.createDays,
    profile: profile ? compactUser(profile) : null,
  };
}

export function mapUserFollowListSummary(body: Record<string, unknown>) {
  const follow = asArray(body.follow).map(compactUser);
  const data = asArray(body.data).map(compactUser);

  return {
    code: body.code,
    more: body.more,
    count: follow.length || data.length,
    follow: follow.length ? follow : undefined,
    data: data.length ? data : undefined,
  };
}

export function mapUserLevelSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);

  return {
    code: body.code,
    level: data?.level ?? body.level,
    nowPlayCount: data?.nowPlayCount,
    nextPlayCount: data?.nextPlayCount,
    nowLoginCount: data?.nowLoginCount,
    nextLoginCount: data?.nextLoginCount,
  };
}

export function mapUserSubcountSummary(body: Record<string, unknown>) {
  return {
    code: body.code,
    createdPlaylistCount: body.createdPlaylistCount,
    subPlaylistCount: body.subPlaylistCount,
    mvCount: body.mvCount,
    djRadioCount: body.djRadioCount,
    artistCount: body.artistCount,
    albumCount: body.albumCount,
    videoCount: body.videoCount,
  };
}

export function mapUserRecordSummary(body: Record<string, unknown>) {
  const weekData = asArray(body.weekData).map((song) => ({
    ...compactSong(song),
    score: song.score,
    playCount: song.playCount,
  }));
  const allData = asArray(body.allData).map((song) => ({
    ...compactSong(song),
    score: song.score,
    playCount: song.playCount,
  }));

  return {
    code: body.code,
    weekData,
    allData,
  };
}

export function mapUserEventSummary(body: Record<string, unknown>) {
  const events = asArray(body.events).map((event) => {
    const user = asRecord(event.user);
    return {
      id: event.id,
      eventType: event.eventType ?? event.type,
      showTime: event.showTime,
      user: user ? compactUser(user) : null,
    };
  });

  return {
    code: body.code,
    more: body.more,
    lasttime: body.lasttime,
    count: events.length,
    events,
  };
}

export function mapRecommendSongsSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);
  const dailySongs = asArray(data?.dailySongs ?? body.dailySongs).map(compactSong);

  return {
    code: body.code,
    count: dailySongs.length,
    dailySongs,
  };
}

export function mapRecommendResourceSummary(body: Record<string, unknown>) {
  const recommend = asArray(body.recommend).map(compactPlaylist);

  return {
    code: body.code,
    count: recommend.length,
    recommend,
  };
}

export function mapPersonalizedPlaylistSummary(body: Record<string, unknown>) {
  const result = asArray(body.result).map(compactPlaylist);

  return {
    code: body.code,
    category: body.category,
    count: result.length,
    result,
  };
}

export function mapPersonalizedMvSummary(body: Record<string, unknown>) {
  const result = asArray(body.result).map(compactMv);

  return {
    code: body.code,
    count: result.length,
    result,
  };
}

export function mapTopPlaylistSummary(body: Record<string, unknown>) {
  const playlists = asArray(body.playlists).map(compactPlaylist);

  return {
    code: body.code,
    more: body.more,
    total: body.total,
    count: playlists.length,
    playlists,
  };
}

export function mapPlaylistListSummary(body: Record<string, unknown>) {
  const playlists = asArray(body.playlists).length
    ? asArray(body.playlists).map(compactPlaylist)
    : asArray(body.data).map(compactPlaylist);

  return {
    code: body.code,
    more: body.more ?? body.hasMore,
    total: body.total,
    count: playlists.length,
    playlists,
  };
}

export function mapPlaylistDynamicSummary(body: Record<string, unknown>) {
  return {
    code: body.code,
    commentCount: body.commentCount,
    shareCount: body.shareCount,
    subscribedCount: body.subscribedCount ?? body.bookedCount,
    playCount: body.playCount,
  };
}

export function mapPlaylistTagSummary(body: Record<string, unknown>) {
  const tags = asArray(body.tags ?? body.sub).map((tag) => ({
    id: tag.id,
    name: tag.name,
    category: tag.category,
    hot: tag.hot,
    usedCount: tag.usedCount,
  }));

  return {
    code: body.code,
    count: tags.length,
    tags,
  };
}

export function mapPlaylistCategorySummary(body: Record<string, unknown>) {
  const categories = asRecord(body.categories);
  const all = asRecord(body.all);
  const sub = asArray(body.sub).map((item) => ({
    category: item.category,
    name: item.name,
    hot: item.hot,
  }));

  return {
    code: body.code,
    categories,
    all: all
      ? {
          name: all.name,
          category: all.category,
        }
      : null,
    subCount: sub.length,
    sub,
  };
}

export function mapToplistDetailSummary(body: Record<string, unknown>) {
  const list = asArray(body.list).map((item) => ({
    id: item.id,
    name: item.name,
    updateFrequency: item.updateFrequency,
    trackCount: item.trackCount,
    playCount: item.playCount,
    tracks: asArray(item.tracks).slice(0, 5).map((track) => ({
      first: track.first,
      second: track.second,
    })),
  }));

  return {
    code: body.code,
    count: list.length,
    list,
  };
}

export function mapToplistSummary(body: Record<string, unknown>) {
  const list = asArray(body.list).map((item) => ({
    id: item.id,
    name: item.name,
    updateFrequency: item.updateFrequency,
    trackCount: item.trackCount,
    coverImgUrl: item.coverImgUrl,
  }));

  return {
    code: body.code,
    count: list.length,
    list,
  };
}

export function mapArtistListSummary(body: Record<string, unknown>) {
  const artists = asArray(body.artists).map(compactArtist);

  return {
    code: body.code,
    more: body.more,
    count: artists.length,
    artists,
  };
}

export function mapArtistSongsSummary(body: Record<string, unknown>) {
  const songs = asArray(body.songs).map(compactSong);

  return {
    code: body.code,
    more: body.more,
    count: songs.length,
    songs,
  };
}

export function mapArtistAlbumsSummary(body: Record<string, unknown>) {
  const artist = asRecord(body.artist);
  const hotAlbums = asArray(body.hotAlbums ?? artist?.hotAlbums).map(compactAlbum);

  return {
    code: body.code,
    more: body.more,
    count: hotAlbums.length,
    hotAlbums,
  };
}

export function mapArtistMvsSummary(body: Record<string, unknown>) {
  const mvs = asArray(body.mvs).map(compactMv);

  return {
    code: body.code,
    more: body.hasMore ?? body.more,
    count: mvs.length,
    mvs,
  };
}

export function mapArtistSublistSummary(body: Record<string, unknown>) {
  const data = asArray(body.data).map(compactArtist);

  return {
    code: body.code,
    count: data.length,
    data,
  };
}

export function mapArtistFansSummary(body: Record<string, unknown>) {
  const fans = asArray(body.data ?? body.fans).map(compactUser);

  return {
    code: body.code,
    more: body.more,
    count: fans.length,
    fans,
  };
}

export function mapArtistInfoSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);
  const artist = asRecord(data?.artist ?? body.artist);
  const user = asRecord(data?.user ?? body.user);

  return {
    code: body.code,
    artist: artist
      ? {
          id: artist.id,
          name: artist.name,
          cover: artist.cover,
          briefDesc: artist.briefDesc,
          aliases: Array.isArray(artist.alias) ? artist.alias : [],
          albumSize: artist.albumSize,
          musicSize: artist.musicSize,
          mvSize: artist.mvSize,
        }
      : null,
    user: user ? compactUser(user) : null,
  };
}

export function mapArtistDetailDynamicSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);

  return {
    code: body.code,
    onSaleCount: data?.onSaleCount,
    albumCount: data?.albumCount,
    musicCount: data?.musicCount,
    mvCount: data?.mvCount,
    followCount: data?.followCount,
  };
}

export function mapAlbumListSummary(body: Record<string, unknown>) {
  const albums = asArray(body.albums).map(compactAlbum);

  return {
    code: body.code,
    total: body.total,
    count: albums.length,
    albums,
  };
}

export function mapAlbumSublistSummary(body: Record<string, unknown>) {
  const data = asArray(body.data).map(compactAlbum);

  return {
    code: body.code,
    hasMore: body.hasMore,
    count: data.length,
    data,
  };
}

export function mapAlbumDetailSummary(body: Record<string, unknown>) {
  const album = asRecord(body.album);
  const songs = asArray(body.songs).map(compactSong);

  return {
    code: body.code,
    resourceState: body.resourceState,
    album: album
      ? {
          id: album.id,
          name: album.name,
          alias: Array.isArray(album.alias) ? album.alias : [],
          size: album.size,
          publishTime: album.publishTime,
          description: album.description,
          artist: compactAlbum(album).artist,
        }
      : null,
    count: songs.length,
    songs,
  };
}

export function mapAlbumDetailDynamicSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);

  return {
    code: body.code,
    subCount: data?.subCount,
    shareCount: data?.shareCount,
    commentCount: data?.commentCount,
    likedCount: data?.likedCount,
    onSaleCount: data?.onSaleCount,
  };
}

export function mapMvListSummary(body: Record<string, unknown>) {
  const data = asArray(body.data).map(compactMv);

  return {
    code: body.code,
    hasMore: body.hasMore,
    count: data.length,
    data,
  };
}

export function mapMvDetailSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);
  const brs = asRecord(data?.brs);
  const artists = asArray(data?.artists);

  return {
    code: body.code,
    data: data
      ? {
          id: data.id,
          name: data.name,
          desc: data.desc,
          briefDesc: data.briefDesc,
          artistName: data.artistName,
          publishTime: data.publishTime,
          playCount: data.playCount,
          subCount: data.subCount,
          shareCount: data.shareCount,
          commentCount: data.commentCount,
          duration: data.duration,
          cover: data.cover,
          artists: artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
          })),
          brs: brs
            ? Object.fromEntries(
                Object.entries(brs).filter(([, value]) => typeof value === "string"),
              )
            : null,
        }
      : null,
  };
}

export function mapMvDetailInfoSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);

  return {
    code: body.code,
    likedCount: data?.likedCount,
    shareCount: data?.shareCount,
    commentCount: data?.commentCount,
    liked: data?.liked,
  };
}

export function mapVideoListSummary(body: Record<string, unknown>) {
  const datas = asArray(body.datas).map(compactVideo);
  const data = asArray(body.data).map(compactVideo);

  return {
    code: body.code,
    hasMore: body.hasMore,
    count: datas.length || data.length,
    datas: datas.length ? datas : undefined,
    data: data.length ? data : undefined,
  };
}

export function mapVideoDetailSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);

  return {
    code: body.code,
    data: data
      ? {
          vid: data.vid ?? data.id,
          title: data.title,
          description: data.description,
          durationms: data.durationms,
          playTime: data.playTime,
          praisedCount: data.praisedCount,
          commentCount: data.commentCount,
          shareCount: data.shareCount,
          subscribeCount: data.subscribeCount,
          coverUrl: data.coverUrl,
          creators: asArray(data.creator).map((creator) => ({
            userId: creator.userId,
            userName: creator.userName,
          })),
          resolutions: asArray(data.resolutions).map((item) => ({
            resolution: item.resolution,
            size: item.size,
          })),
        }
      : null,
  };
}

export function mapVideoDetailInfoSummary(body: Record<string, unknown>) {
  const data = asRecord(body.data);

  return {
    code: body.code,
    likedCount: data?.likedCount,
    shareCount: data?.shareCount,
    commentCount: data?.commentCount,
    liked: data?.liked,
  };
}

export function mapBannerSummary(body: Record<string, unknown>) {
  const banners = asArray(body.banners).map((banner) => ({
    targetId: banner.targetId,
    targetType: banner.targetType,
    typeTitle: banner.typeTitle,
    imageUrl: banner.imageUrl,
    titleColor: banner.titleColor,
  }));

  return {
    code: body.code,
    count: banners.length,
    banners,
  };
}

export function mapPlaylistSubscribersSummary(body: Record<string, unknown>) {
  const subscribers = asArray(body.subscribers).map((user) => ({
    userId: user.userId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    signature: user.signature,
  }));

  return {
    code: body.code,
    total: body.total,
    more: body.more,
    count: subscribers.length,
    subscribers,
  };
}

export function mapPlaylistMyLikeSummary(body: Record<string, unknown>) {
  const data = asArray(body.data).map(compactPlaylist);

  return {
    code: body.code,
    count: data.length,
    data,
  };
}
