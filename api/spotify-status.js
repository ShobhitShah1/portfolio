const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

const json = (res, statusCode, payload) => {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.end(JSON.stringify(payload));
};

const joinArtists = (artists = []) => artists
    .map((artist) => artist?.name || "")
    .filter(Boolean)
    .join(", ");

const normalizeTrack = (track, extra = {}) => {
    if (!track || track.type !== "track") {
        return null;
    }

    return {
        title: track.name || "Spotify",
        artist: extra.artistLabel || joinArtists(track.artists) || "Spotify",
        albumArt: track.album?.images?.[0]?.url || extra.fallbackArt || "",
        songUrl: track.external_urls?.spotify || extra.fallbackUrl || "",
        isPlaying: Boolean(extra.isPlaying),
        source: extra.source || "spotify"
    };
};

const getAccessToken = async () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Missing Spotify credentials.");
    }

    const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basicToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken
        })
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Spotify token refresh failed: ${response.status} ${message}`);
    }

    const payload = await response.json();
    return payload.access_token;
};

const fetchSpotify = async (path, accessToken) => {
    const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (response.status === 204) {
        return { status: 204, data: null };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { status: response.status, data };
};

const getCurrentTrack = async (accessToken) => {
    const current = await fetchSpotify("/me/player/currently-playing", accessToken);

    if (current.status === 204 || !current.data?.item) {
        return null;
    }

    if (current.status >= 400) {
        throw new Error(`Spotify currently playing failed: ${current.status}`);
    }

    return normalizeTrack(current.data.item, {
        isPlaying: current.data.is_playing !== false,
        source: "currently-playing"
    });
};

const getPlaylistFallback = async (accessToken) => {
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

    if (!playlistId) {
        return null;
    }

    const [playlistMeta, playlistTracks] = await Promise.all([
        fetchSpotify(`/playlists/${playlistId}?fields=name,external_urls.spotify,images`, accessToken),
        fetchSpotify(`/playlists/${playlistId}/tracks?limit=50&fields=items(track(type,name,artists(name),external_urls.spotify,album(images),is_local))`, accessToken)
    ]);

    if (playlistMeta.status >= 400) {
        throw new Error(`Spotify playlist meta failed: ${playlistMeta.status}`);
    }

    if (playlistTracks.status >= 400) {
        throw new Error(`Spotify playlist tracks failed: ${playlistTracks.status}`);
    }

    const tracks = (playlistTracks.data?.items || [])
        .map((item) => item?.track)
        .filter((track) => track && track.type === "track" && track.is_local !== true);

    if (tracks.length === 0) {
        return null;
    }

    const playlistName = playlistMeta.data?.name || "Playlist";
    const playlistUrl = playlistMeta.data?.external_urls?.spotify || "https://open.spotify.com/";
    const playlistArt = playlistMeta.data?.images?.[0]?.url || "";
    const bucket = Math.floor(Date.now() / (1000 * 60 * 20));
    const index = Math.abs((bucket * 131 + playlistId.length * 17) % tracks.length);
    const track = tracks[index];

    return normalizeTrack(track, {
        isPlaying: false,
        source: "playlist-fallback",
        artistLabel: `${joinArtists(track.artists)} - ${playlistName}`,
        fallbackArt: playlistArt,
        fallbackUrl: playlistUrl
    });
};

module.exports = async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return json(res, 405, { error: "Method not allowed." });
    }

    try {
        const accessToken = await getAccessToken();
        const currentTrack = await getCurrentTrack(accessToken);

        if (currentTrack) {
            return json(res, 200, currentTrack);
        }

        const playlistTrack = await getPlaylistFallback(accessToken);

        if (playlistTrack) {
            return json(res, 200, playlistTrack);
        }

        return json(res, 200, {
            title: "Spotify",
            artist: "Nothing playing right now",
            albumArt: "",
            songUrl: "https://open.spotify.com/",
            isPlaying: false,
            source: "empty"
        });
    } catch (error) {
        return json(res, 500, {
            error: "Spotify status unavailable.",
            details: error.message
        });
    }
};
