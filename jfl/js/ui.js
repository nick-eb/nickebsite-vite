/**
 * Jellyfin Legacy Player - UI & DOM
 */

App.cacheDOM = function () {
    this.dom = {
        // Login elements
        loginForm: document.getElementById('login-form'),
        serverUrl: document.getElementById('server-url'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        loginBtn: document.querySelector('#login-form button'),

        // View containers
        views: {
            login: document.getElementById('view-login'),
            library: document.getElementById('view-library'),
            album: document.getElementById('view-album'),
            player: document.getElementById('view-player')
        },

        // Library elements
        libraryContent: document.getElementById('library-content'),
        logoutBtn: document.getElementById('logout-btn'),
        tabAlbums: document.getElementById('tab-albums'),
        tabPlaylists: document.getElementById('tab-playlists'),

        // Player elements
        audio: document.getElementById('audio-element'),
        playerArt: document.getElementById('player-art'),
        playerTitle: document.getElementById('player-title'),
        playerArtist: document.getElementById('player-artist'),
        btnPlayPause: document.getElementById('btn-playpause'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
        btnShuffle: document.getElementById('btn-shuffle'),
        seekBar: document.getElementById('seek-bar'),
        currentTime: document.getElementById('current-time'),
        duration: document.getElementById('duration'),

        // Navigation buttons
        backToLibrary: document.getElementById('back-to-library'),
        backToAlbums: document.getElementById('back-to-albums'),
        playAlbumBtn: document.getElementById('play-album-btn'),

        // Album detail elements
        albumSongList: document.getElementById('album-song-list'),
        albumDetailTitle: document.getElementById('album-detail-title'),
        albumDetailArtist: document.getElementById('album-detail-artist'),
        albumHeaderArt: document.getElementById('album-header-art')
    };

    // Inject Handle if missing
    var pContent = document.querySelector('.player-content');
    if (pContent && !pContent.querySelector('.player-handle')) {
        var handle = document.createElement('div');
        handle.className = 'player-handle';
        pContent.insertBefore(handle, pContent.firstChild);
    }
    this.dom.playerContent = pContent;

    // Mini player elements
    this.dom.miniPlayer = document.getElementById('mini-player');
    this.dom.miniArt = document.getElementById('mini-art');
    this.dom.miniTitle = document.getElementById('mini-title');
    this.dom.miniArtist = document.getElementById('mini-artist');
    this.dom.miniProgressFill = document.getElementById('mini-progress-fill');
    this.dom.miniBtnPlayPause = document.getElementById('mini-btn-playpause');
    this.dom.miniBtnNext = document.getElementById('mini-btn-next');
    // Click on mini-bar (except controls)
    this.dom.miniContent = document.querySelector('.mini-content');
};

App.showView = function (viewId) {

    // Manage Mini Player Visibility
    // Show if: NOT in player view, AND we have a playlist loaded
    // Logic update: If we are just opening the app, view-player might be 'minimized' via transform.
    // Standard showView switches 'pages'. Player is now a 'modal' on top.

    // If we navigate TO view-player, we actually want to 'open' the modal
    if (viewId === 'view-player') {
        this.openPlayer();
        // Do NOT hide other views. The player is an overlay.
        return;
    }

    // Normal view switching
    var views = this.dom.views;
    for (var key in views) {
        if (views.hasOwnProperty(key)) {
            // view-player is special, don't just 'hidden' class it, we use transformed state
            if (key === 'view-player') continue;
            views[key].classList.add('hidden');
        }
    }

    var target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');

    if (this.state.player.playlist && this.state.player.playlist.length > 0) {
        this.dom.miniPlayer.classList.remove('hidden');
    } else {
        this.dom.miniPlayer.classList.add('hidden');
    }

    this.state.currentView = viewId;
};

App.openPlayer = function () {
    // Ensure player is visible (remove minimized state)
    var player = document.getElementById('view-player');

    // Ensure it's not 'display:none' (which we might use for init)
    player.classList.remove('hidden');

    // Small timeout to allow transition logic to pick up if it was display:none
    requestAnimationFrame(function () {
        player.classList.remove('minimized');
    });

    // Hide mini player
    this.dom.miniPlayer.classList.add('hidden');

    // Save scroll position of the current underlying view
    if (this.state.currentView) {
        var currentViewEl = document.getElementById(this.state.currentView);
        if (currentViewEl) {
            this.state.savedScrollTop = currentViewEl.scrollTop;
        }
    }

    this.state.isPlayerOpen = true;
};

App.minimizePlayer = function () {
    var player = document.getElementById('view-player');
    player.classList.add('minimized');

    // Show mini player
    if (this.state.player.playlist && this.state.player.playlist.length > 0) {
        this.dom.miniPlayer.classList.remove('hidden');
    }

    this.state.isPlayerOpen = false;

    // Safety check: When minimizing, ensure there is a visible underlying view.
    // If we minimized and everything else is hidden, the user sees a blank page.
    var views = this.dom.views;
    var hasVisibleView = false;
    for (var key in views) {
        if (key !== 'player' && !views[key].classList.contains('hidden')) {
            hasVisibleView = true;
            // Restore scroll position if we have it
            if (this.state.savedScrollTop !== undefined) {
                views[key].scrollTop = this.state.savedScrollTop;
            }
            break;
        }
    }

    if (!hasVisibleView) {
        // Fallback: Show Library if nothing else is visible
        if (this.dom.views.library) {
            this.dom.views.library.classList.remove('hidden');
        }
    }
};

App.renderLibrary = function (items) {
    var self = this;
    var container = this.dom.libraryContent;
    container.innerHTML = '';

    // Store albums for shuffle and build index map for O(1) lookups
    this.state.albums = items;
    this.state.albumIndexMap = {};
    for (var idx = 0; idx < items.length; idx++) {
        this.state.albumIndexMap[items[idx].Id] = idx;
    }

    // Shuffle All button
    var shuffleBtn = document.createElement('button');
    shuffleBtn.id = 'shuffle-all-btn';
    shuffleBtn.className = 'btn primary';
    shuffleBtn.textContent = 'Shuffle All';
    shuffleBtn.style.marginBottom = '16px';
    shuffleBtn.style.width = '100%';
    shuffleBtn.onclick = function () {
        self.shuffleAll();
    };
    container.appendChild(shuffleBtn);
    // Cache reference for later use
    this.dom.shuffleAllBtn = shuffleBtn;

    if (items.length === 0) {
        container.innerHTML += '<p style="padding:20px;">No music found.</p>';
        return;
    }

    // Use DocumentFragment for batch DOM insertion (fewer reflows)
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < items.length; i++) {
        (function (item) {
            var card = document.createElement('div');
            card.className = 'card';
            card.onclick = function () {
                self.showAlbumDetails(item);
            };

            var imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
            if (item.ImageTags && item.ImageTags.Primary) {
                imgUrl = self.getImageUrl(item.Id, 'grid');
            }

            // Wrapper div for aspect ratio (iOS 10 doesn't support aspect-ratio CSS)
            var imgWrapper = document.createElement('div');
            imgWrapper.className = 'card-img-wrapper';

            var img = document.createElement('img');
            // Use Cache
            App.Cache.loadImage(img, imgUrl);

            imgWrapper.appendChild(img);

            var title = document.createElement('div');
            title.className = 'title';
            title.textContent = item.Name;

            card.appendChild(imgWrapper);
            card.appendChild(title);
            fragment.appendChild(card);
        })(items[i]);
    }

    // Single DOM insertion for all cards
    container.appendChild(fragment);
};

App.showAlbumDetails = function (album) {
    var self = this;
    var userId = this.state.userId;
    var server = this.state.serverUrl;
    var headers = this.getAuthHeaders();

    // Set album header info using cached DOM elements
    this.dom.albumDetailTitle.textContent = album.Name;
    this.dom.albumDetailArtist.textContent = album.AlbumArtist || 'Unknown Artist';

    if (album.ImageTags && album.ImageTags.Primary) {
        App.Cache.loadBgImage(this.dom.albumHeaderArt, this.getImageUrl(album.Id, 'grid'));
    } else {
        this.dom.albumHeaderArt.style.backgroundImage = 'none';
    }

    // Fetch tracks
    var url = server + '/Users/' + userId + '/Items?ParentId=' + album.Id + '&Recursive=true&IncludeItemTypes=Audio&SortBy=ParentIndexNumber,IndexNumber';
    this.request('GET', url, headers, null, function (err, data) {
        if (err) {
            self.logError('Album tracks error: ' + err);
            return;
        }

        var tracks = data.Items || [];
        self.state.currentAlbumTracks = tracks;
        self.state.viewingAlbumId = album.Id;

        var container = self.dom.albumSongList;
        container.innerHTML = '';

        for (var i = 0; i < tracks.length; i++) {
            (function (track, index) {
                var item = document.createElement('div');
                item.className = 'song-item';

                var number = document.createElement('div');
                number.className = 'song-item-number';
                number.textContent = track.IndexNumber || (index + 1);

                var info = document.createElement('div');
                info.className = 'song-item-info';

                var name = document.createElement('div');
                name.className = 'song-item-name';
                name.textContent = track.Name;

                var artist = document.createElement('div');
                artist.className = 'song-item-artist';
                artist.textContent = track.Artists && track.Artists.length > 0 ? track.Artists.join(', ') : (track.AlbumArtist || '');

                info.appendChild(name);
                info.appendChild(artist);

                var duration = document.createElement('div');
                duration.className = 'song-item-duration';
                if (track.RunTimeTicks) {
                    duration.textContent = self.formatTime(self.ticksToSeconds(track.RunTimeTicks));
                } else {
                    duration.textContent = '--:--';
                }

                item.appendChild(number);
                item.appendChild(info);
                item.appendChild(duration);

                item.onclick = function () {
                    self.startPlayback(tracks, index, album.Id);
                };

                container.appendChild(item);
            })(tracks[i], i);
        }

        if (tracks.length === 0) {
            container.innerHTML = '<p style="padding:20px;color:var(--text-muted)">No songs found in this album.</p>';
        }
    });

    this.showView('view-album');
};

App.renderPlaylists = function (items) {
    var self = this;
    var container = this.dom.libraryContent;
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p style="padding:20px;">No playlists found.</p>';
        return;
    }

    // Use DocumentFragment for batch DOM insertion
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < items.length; i++) {
        (function (item) {
            var card = document.createElement('div');
            card.className = 'card';
            card.onclick = function () {
                self.showPlaylistDetails(item);
            };

            var imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
            if (item.ImageTags && item.ImageTags.Primary) {
                imgUrl = self.getImageUrl(item.Id, 'grid');
            }

            var imgWrapper = document.createElement('div');
            imgWrapper.className = 'card-img-wrapper';

            var img = document.createElement('img');
            App.Cache.loadImage(img, imgUrl);

            imgWrapper.appendChild(img);

            var title = document.createElement('div');
            title.className = 'title';
            title.textContent = item.Name;

            card.appendChild(imgWrapper);
            card.appendChild(title);
            fragment.appendChild(card);
        })(items[i]);
    }

    // Single DOM insertion
    container.appendChild(fragment);
};

App.showPlaylistDetails = function (playlist) {
    var self = this;
    var userId = this.state.userId;
    var server = this.state.serverUrl;
    var headers = this.getAuthHeaders();

    // Set header info using cached DOM elements
    this.dom.albumDetailTitle.textContent = playlist.Name;
    this.dom.albumDetailArtist.textContent = 'Playlist';

    if (playlist.ImageTags && playlist.ImageTags.Primary) {
        App.Cache.loadBgImage(this.dom.albumHeaderArt, this.getImageUrl(playlist.Id, 'grid'));
    } else {
        this.dom.albumHeaderArt.style.backgroundImage = 'none';
    }

    // Fetch playlist items
    var url = server + '/Playlists/' + playlist.Id + '/Items?UserId=' + userId;
    this.request('GET', url, headers, null, function (err, data) {
        if (err) {
            self.logError('Playlist items error: ' + err);
            return;
        }

        var tracks = data.Items || [];
        self.state.currentAlbumTracks = tracks;
        self.state.viewingAlbumId = null; // Not an album

        var container = self.dom.albumSongList;
        container.innerHTML = '';

        for (var i = 0; i < tracks.length; i++) {
            (function (track, index) {
                var item = document.createElement('div');
                item.className = 'song-item';

                var number = document.createElement('div');
                number.className = 'song-item-number';
                number.textContent = index + 1;

                var info = document.createElement('div');
                info.className = 'song-item-info';

                var name = document.createElement('div');
                name.className = 'song-item-name';
                name.textContent = track.Name;

                var artist = document.createElement('div');
                artist.className = 'song-item-artist';
                artist.textContent = track.Artists && track.Artists.length > 0 ? track.Artists.join(', ') : (track.AlbumArtist || '');

                info.appendChild(name);
                info.appendChild(artist);

                var duration = document.createElement('div');
                duration.className = 'song-item-duration';
                if (track.RunTimeTicks) {
                    duration.textContent = self.formatTime(self.ticksToSeconds(track.RunTimeTicks));
                } else {
                    duration.textContent = '--:--';
                }

                item.appendChild(number);
                item.appendChild(info);
                item.appendChild(duration);

                item.onclick = function () {
                    self.startPlayback(tracks, index, null); // No album context
                };

                container.appendChild(item);
            })(tracks[i], i);
        }

        if (tracks.length === 0) {
            container.innerHTML = '<p style="padding:20px;color:var(--text-muted)">No songs found in this playlist.</p>';
        }
    });

    this.showView('view-album');
};
