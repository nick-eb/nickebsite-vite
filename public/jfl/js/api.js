/**
 * Jellyfin Legacy Player - API & Networking
 */

// --- XMLHttpRequest wrapper ---
App.request = function (method, url, headers, body, callback) {
    var self = this;

    // Mixed Content Check (HTTPS -> HTTP)
    if (window.location.protocol === 'https:' && url.indexOf('http:') === 0) {
        var msg = 'Security Error: Cannot connect to HTTP server from HTTPS site (Mixed Content). Please use HTTPS for your Jellyfin server or load this player over HTTP.';
        console.error(msg);
        if (self.logError) self.logError(msg);
        callback(msg, null);
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    // Ensure callback is called only once
    var cbCalled = false;
    var done = function (err, data) {
        if (cbCalled) return;
        cbCalled = true;
        callback(err, data);
    };

    for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
        }
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // Debug logging
            if (self.log) self.log('XHR ' + method + ' ' + url + ' finished. Status: ' + xhr.status);

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    done(null, data);
                } catch (e) {
                    done('JSON parse error: ' + e.message, null);
                }
            } else if (xhr.status === 0) {
                // Expanded error for 0 status
                var msg = 'Network Error (HTTP 0). Possible causes:\n1. Mixed Content (HTTPS -> HTTP)\n2. CORS (Server blocking request)\n3. Invalid SSL/Self-signed cert\n4. Server offline';
                if (self.logError) self.logError(msg);
                done(msg, null);
            } else {
                done('HTTP ' + xhr.status + ': ' + xhr.statusText, null);
            }
        }
    };

    xhr.onerror = function () {
        if (self.logError) self.logError('XHR onerror event fired');
        done('Connection Failed. If using HTTPS, your device might not trust the server certificate (common on iOS 8). Try opening the Server URL in Safari to accept the certificate, or use HTTP.', null);
    };

    if (body) {
        xhr.send(body);
    } else {
        xhr.send();
    }
};

App.handleLogin = function () {
    var self = this;
    var url = this.dom.serverUrl.value.replace(/\/$/, '');
    var username = this.dom.username.value;
    var password = this.dom.password.value;

    this.log('handleLogin called');
    this.log('URL: ' + url);

    if (!url) {
        alert('Server URL is required');
        return;
    }

    var btn = this.dom.loginBtn;
    var origText = btn.textContent;
    btn.textContent = 'Connecting...';
    btn.disabled = true;

    var headers = {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': 'MediaBrowser Client="Jellyfin Legacy", Device="Web", DeviceId="' + Date.now() + '", Version="1.0.0"'
    };

    var body = JSON.stringify({
        Username: username,
        Pw: password
    });

    this.request('POST', url + '/Users/AuthenticateByName', headers, body, function (err, data) {
        if (err) {
            self.logError('Login failed: ' + err);
            // Show formatted alert
            alert('Login Failed:\n' + err);
            btn.textContent = origText;
            btn.disabled = false;
            return;
        }

        self.log('Login success!');
        self.state.serverUrl = url;
        self.state.accessToken = data.AccessToken;
        self.state.userId = data.User.Id;
        self.state.userName = data.User.Name;

        localStorage.setItem('jf_server_url', url);
        localStorage.setItem('jf_access_token', self.state.accessToken);
        localStorage.setItem('jf_user_id', self.state.userId);
        localStorage.setItem('jf_user_name', self.state.userName);

        self.showView('view-library');
        self.getMusicLibrary();
    });
};

App.handleLogout = function () {
    // Only clear JFL-specific keys, not all localStorage
    var jflKeys = [
        'jf_server_url',
        'jf_access_token',
        'jf_user_id',
        'jf_user_name',
        'jf_music_view_id',
        'jf_library_cache',
        'jf_albums_cache',
        'jf_playlists_cache'
    ];
    for (var i = 0; i < jflKeys.length; i++) {
        localStorage.removeItem(jflKeys[i]);
    }
    location.reload();
};

App.getMusicLibrary = function () {
    var self = this;
    var userId = this.state.userId;
    var server = this.state.serverUrl;
    var headers = this.getAuthHeaders();

    this.log('Getting music library...');

    var fetchAlbums = function (viewId) {
        // FAST PATH: Try cache first
        var cachedAlbums = self.loadAlbumsCache();
        if (cachedAlbums && cachedAlbums.length > 0) {
            self.log('Rendering albums from cache (instant)');
            self.renderLibrary(cachedAlbums);
        }

        // Background: Fetch fresh albums from server
        var albumUrl = server + '/Users/' + userId + '/Items?ParentId=' + viewId + '&Recursive=true&IncludeItemTypes=MusicAlbum&SortBy=SortName';
        self.request('GET', albumUrl, headers, null, function (err2, data2) {
            if (err2) {
                self.logError('Albums error: ' + err2);
                return;
            }
            self.log('Got ' + data2.Items.length + ' albums from server');
            self.state.albums = data2.Items;

            // Only save cache if count changed (avoid unnecessary writes)
            if (!cachedAlbums || cachedAlbums.length !== data2.Items.length) {
                self.saveAlbumsCache(data2.Items);
                self.renderLibrary(data2.Items);
            } else {
                self.log('Album cache is up to date, no save needed');
            }
        });

        // Trigger background sync to keep track cache fresh
        setTimeout(function () {
            self.syncLibrary();
        }, self.constants.SYNC_DELAY_MS);
    };

    // FAST PATH: If we have cached View ID
    if (this.state.musicViewId) {
        this.log('Using cached Music View ID: ' + this.state.musicViewId);
        fetchAlbums(this.state.musicViewId);
        return;
    }

    // Step 1: Get Views (SLOW PATH)
    this.request('GET', server + '/Users/' + userId + '/Views', headers, null, function (err, data) {
        if (err) {
            self.logError('Views error: ' + err);
            alert('Failed to load views: ' + err);
            return;
        }

        var musicView = null;
        for (var i = 0; i < data.Items.length; i++) {
            if (data.Items[i].CollectionType === 'music') {
                musicView = data.Items[i];
                break;
            }
        }

        if (!musicView) {
            self.logError('No music library found');
            alert('No Music Library found');
            return;
        }

        self.log('Found music view: ' + musicView.Id);
        self.state.musicViewId = musicView.Id; // Store music view ID
        localStorage.setItem('jf_music_view_id', musicView.Id); // Persist it

        fetchAlbums(musicView.Id);
    });
};

App.getPlaylists = function (callback) {
    var self = this;
    var userId = this.state.userId;
    var server = this.state.serverUrl;
    var headers = this.getAuthHeaders();

    this.log('Getting playlists...');

    // FAST PATH: Try cache first
    var cachedPlaylists = this.loadPlaylistsCache();
    if (cachedPlaylists && cachedPlaylists.length > 0) {
        this.log('Rendering playlists from cache (instant)');
        if (callback) callback(cachedPlaylists);
    }

    // Background: Fetch fresh playlists from server
    var url = server + '/Users/' + userId + '/Items?Recursive=true&IncludeItemTypes=Playlist&SortBy=SortName';
    this.request('GET', url, headers, null, function (err, data) {
        if (err) {
            self.logError('Playlists error: ' + err);
            // If we had cache, we already called callback, so don't call again with empty
            if (!cachedPlaylists && callback) callback([]);
            return;
        }
        self.log('Got ' + data.Items.length + ' playlists from server');
        self.state.playlists = data.Items;

        // Only save cache and callback if count changed (avoid unnecessary writes)
        if (!cachedPlaylists || cachedPlaylists.length !== data.Items.length) {
            self.savePlaylistsCache(data.Items);
            if (callback) callback(data.Items);
        } else {
            self.log('Playlist cache is up to date, no save needed');
        }
    });
};
