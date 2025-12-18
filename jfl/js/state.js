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
            isPlaying: false,
            shuffleEnabled: false,
            metadataDuration: null,
            currentAlbumId: null
        },
        allLibraryTracks: null, // Cache for all tracks
        musicViewId: null,      // Store music view ID
        albums: [],             // Store albums for shuffle
        playlists: [],
        currentLibraryTab: 'albums', // 'albums' or 'playlists'
    },

    dom: {}
};
