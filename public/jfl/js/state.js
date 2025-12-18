/**
 * Jellyfin Legacy Player - State & Core
 */
var App = {
    state: {
        serverUrl: localStorage.getItem('jf_server_url') || '',
        accessToken: localStorage.getItem('jf_access_token') || '',
        userId: localStorage.getItem('jf_user_id') || '',
        userName: localStorage.getItem('jf_user_name') || '',
        musicViewId: localStorage.getItem('jf_music_view_id') || null,
        currentView: 'view-login',
        player: {
            currentTrack: null,
            playlist: [],
            originalPlaylist: [],
            playlistTrackIds: {},  // Track ID -> true for O(1) lookup
            isPlaying: false,
            shuffleEnabled: false,
            metadataDuration: null,
            playingAlbumId: null
        },
        allLibraryTracks: null, // Cache for all tracks
        albums: [],             // Store albums for shuffle
        albumIndexMap: {},      // Map of album ID -> array index for O(1) lookups
        playlists: [],
        currentLibraryTab: 'albums', // 'albums' or 'playlists'
        // Album detail view state (separate from player.playingAlbumId which tracks playing album)
        viewingAlbumId: null,      // Album being viewed in detail view
        currentAlbumTracks: []     // Tracks of album being viewed
    },

    dom: {}
};
