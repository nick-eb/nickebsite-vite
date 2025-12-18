/**
 * Jellyfin Legacy Player - Data & Caching
 */

App.loadLibraryCache = function () {
    try {
        var cached = localStorage.getItem('jf_library_cache');
        if (cached) {
            var data = JSON.parse(cached);
            // Check if data is valid
            if (Array.isArray(data) && data.length > 0) {
                this.state.allLibraryTracks = data;
                this.log('Loaded ' + data.length + ' tracks from cache.');
            }
        }
    } catch (e) {
        this.logError('Failed to load library cache: ' + e.message);
    }
};

App.saveLibraryCache = function (tracks) {
    try {
        // Minify: Store only essential properties to save space
        var miniTracks = tracks.map(function (t) {
            return {
                Id: t.Id,
                Name: t.Name,
                Artists: t.Artists,
                AlbumArtist: t.AlbumArtist,
                AlbumId: t.AlbumId,
                ImageTags: t.ImageTags,
                RunTimeTicks: t.RunTimeTicks,
                Type: 'Audio' // Ensure type presence if checked elsewhere
            };
        });
        localStorage.setItem('jf_library_cache', JSON.stringify(miniTracks));
        this.log('Saved ' + miniTracks.length + ' tracks to cache.');
    } catch (e) {
        this.logError('Failed to save library cache (quota exceeded?): ' + e.message);
    }
};

// Background sync of library
App.syncLibrary = function (callback) {
    var self = this;
    var userId = this.state.userId;
    var server = this.state.serverUrl;
    var headers = this.getAuthHeaders();

    if (!userId || !server) return;

    // If we don't know the Music View ID yet, we have to find it
    if (!this.state.musicViewId) {
        this.request('GET', server + '/Users/' + userId + '/Views', headers, null, function (err, data) {
            if (!err && data && data.Items) {
                for (var i = 0; i < data.Items.length; i++) {
                    if (data.Items[i].CollectionType === 'music') {
                        self.state.musicViewId = data.Items[i].Id;
                        self.syncLibrary(callback); // retry
                        return;
                    }
                }
            }
            if (callback) callback([]);
        });
        return;
    }

    this.log('Background Sync: Fetching all tracks...');
    var url = server + '/Users/' + userId + '/Items?ParentId=' + this.state.musicViewId + '&Recursive=true&IncludeItemTypes=Audio&SortBy=DateCreated&SortOrder=Descending&Limit=10000';

    this.request('GET', url, headers, null, function (err, data) {
        if (err) {
            self.logError('Sync error: ' + err);
            if (callback) callback([]);
            return;
        }

        var remoteTracks = data.Items || [];
        self.log('Background Sync: Got ' + remoteTracks.length + ' tracks from server.');

        // Check for updates
        var currentCount = self.state.allLibraryTracks ? self.state.allLibraryTracks.length : 0;
        var hasChanges = remoteTracks.length !== currentCount;

        if (hasChanges) {
            self.log('Library update detected (Old: ' + currentCount + ', New: ' + remoteTracks.length + ')');

            // Update Cache only when there are changes
            self.state.allLibraryTracks = remoteTracks;
            self.saveLibraryCache(remoteTracks);

            // Silent Shuffle Update
            if (self.state.player.shuffleEnabled) {
                self.updateShuffleQueueSilently(remoteTracks);
            }
        } else {
            self.log('Library is up to date, no save needed.');
            // Still update in-memory state without saving
            self.state.allLibraryTracks = remoteTracks;
        }

        // Callback with current data regardless of changes
        if (callback) {
            callback(remoteTracks);
        }
    });
};

// Albums Cache
App.loadAlbumsCache = function () {
    try {
        var cached = localStorage.getItem('jf_albums_cache');
        if (cached) {
            var data = JSON.parse(cached);
            if (Array.isArray(data) && data.length > 0) {
                this.state.albums = data;
                this.log('Loaded ' + data.length + ' albums from cache.');
                return data;
            }
        }
    } catch (e) {
        this.logError('Failed to load albums cache: ' + e.message);
    }
    return null;
};

App.saveAlbumsCache = function (albums) {
    try {
        var miniAlbums = albums.map(function (a) {
            return {
                Id: a.Id,
                Name: a.Name,
                AlbumArtist: a.AlbumArtist,
                ImageTags: a.ImageTags
            };
        });
        localStorage.setItem('jf_albums_cache', JSON.stringify(miniAlbums));
        this.log('Saved ' + miniAlbums.length + ' albums to cache.');
    } catch (e) {
        this.logError('Failed to save albums cache: ' + e.message);
    }
};

// Playlists Cache
App.loadPlaylistsCache = function () {
    try {
        var cached = localStorage.getItem('jf_playlists_cache');
        if (cached) {
            var data = JSON.parse(cached);
            if (Array.isArray(data) && data.length > 0) {
                this.state.playlists = data;
                this.log('Loaded ' + data.length + ' playlists from cache.');
                return data;
            }
        }
    } catch (e) {
        this.logError('Failed to load playlists cache: ' + e.message);
    }
    return null;
};

App.savePlaylistsCache = function (playlists) {
    try {
        var miniPlaylists = playlists.map(function (p) {
            return {
                Id: p.Id,
                Name: p.Name,
                ImageTags: p.ImageTags
            };
        });
        localStorage.setItem('jf_playlists_cache', JSON.stringify(miniPlaylists));
        this.log('Saved ' + miniPlaylists.length + ' playlists to cache.');
    } catch (e) {
        this.logError('Failed to save playlists cache: ' + e.message);
    }
};
