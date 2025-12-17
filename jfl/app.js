/**
 * Jellyfin Legacy Player
 * Compatible with iOS 10.0+ (ES5 + XMLHttpRequest)
 * NO: fetch, async/await, rest params, spread, template literals in critical paths
 */

var App = {
    state: {
        serverUrl: localStorage.getItem('jf_server_url') || '',
        accessToken: localStorage.getItem('jf_access_token') || '',
        userId: localStorage.getItem('jf_user_id') || '',
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
        allLibraryTracks: null  // Cache for all tracks to avoid repeated API calls
    },

    dom: {},

    init: function () {
        this.initDebug();
        this.log('App Initializing...');
        this.cacheDOM();
        this.bindEvents();

        if (this.state.accessToken && this.state.serverUrl) {
            this.showView('view-library');
            this.getMusicLibrary();
        } else {
            this.showView('view-login');
            if (this.state.serverUrl) {
                this.dom.serverUrl.value = this.state.serverUrl;
            }
        }
    },

    log: function (msg) {
        console.log(msg);
        var dc = document.getElementById('debug-console');
        if (dc) {
            dc.innerHTML += '<div>[LOG] ' + msg + '</div>';
            dc.scrollTop = dc.scrollHeight;
        }
    },

    logError: function (msg) {
        console.error(msg);
        var dc = document.getElementById('debug-console');
        if (dc) {
            dc.innerHTML += '<div style="color:red">[ERR] ' + msg + '</div>';
            dc.scrollTop = dc.scrollHeight;
        }
    },

    initDebug: function () {
        // Debug console is now toggled via floating button in HTML
        // This function is kept for compatibility
    },

    cacheDOM: function () {
        this.dom = {
            loginForm: document.getElementById('login-form'),
            serverUrl: document.getElementById('server-url'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            loginBtn: document.querySelector('#login-form button'),

            views: {
                login: document.getElementById('view-login'),
                library: document.getElementById('view-library'),
                album: document.getElementById('view-album'),
                player: document.getElementById('view-player')
            },

            libraryContent: document.getElementById('library-content'),
            logoutBtn: document.getElementById('logout-btn'),

            audio: document.getElementById('audio-element'),
            playerArt: document.getElementById('player-art'),
            playerTitle: document.getElementById('player-title'),
            playerArtist: document.getElementById('player-artist'),
            playerArtist: document.getElementById('player-artist'),
            btnPlayPause: document.getElementById('btn-playpause'),
            seekBar: document.getElementById('seek-bar'),
            currentTime: document.getElementById('current-time'),
            duration: document.getElementById('duration')
        };
    },

    bindEvents: function () {
        var self = this;

        this.dom.loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            self.handleLogin();
        });

        this.dom.logoutBtn.addEventListener('click', function () {
            self.handleLogout();
        });

        this.dom.btnPlayPause.addEventListener('click', function () {
            self.togglePlay();
        });

        document.getElementById('btn-prev').addEventListener('click', function () {
            self.playTrack(self.state.player.currentTrack - 1);
        });

        document.getElementById('btn-next').addEventListener('click', function () {
            self.playTrack(self.state.player.currentTrack + 1);
        });

        this.dom.audio.addEventListener('ended', function () {
            self.playTrack(self.state.player.currentTrack + 1);
        });

        document.getElementById('back-to-library').addEventListener('click', function () {
            self.showView('view-library');
        });

        document.getElementById('back-to-albums').addEventListener('click', function () {
            self.showView('view-library');
        });

        document.getElementById('play-album-btn').addEventListener('click', function () {
            if (self.state.currentAlbumTracks && self.state.currentAlbumTracks.length > 0) {
                self.startPlayback(self.state.currentAlbumTracks, 0, self.state.currentAlbumId);
            }
        });

        document.getElementById('btn-shuffle').addEventListener('click', function () {
            self.toggleShuffle();
        });

        // Seek Bar Events
        this.dom.seekBar.addEventListener('input', function () {
            var time = parseFloat(this.value);
            self.dom.audio.currentTime = time;
            self.dom.currentTime.textContent = self.formatTime(time);
        });

        this.dom.audio.addEventListener('timeupdate', function () {
            var currentTime = this.currentTime;
            var audioDuration = this.duration;

            self.dom.seekBar.value = currentTime;
            self.dom.currentTime.textContent = self.formatTime(currentTime);

            // Only update duration if audio provides a valid value AND we don't have metadata duration
            // Prefer metadata duration as it's more reliable
            if (!self.state.player.metadataDuration) {
                if (audioDuration && !isNaN(audioDuration) && isFinite(audioDuration) && audioDuration > 1) {
                    self.dom.seekBar.max = audioDuration;
                    self.dom.duration.textContent = self.formatTime(audioDuration);
                }
            }
        });

        this.dom.audio.addEventListener('loadedmetadata', function () {
            // Only update from audio element if we don't already have metadata duration
            if (!self.state.player.metadataDuration && !isNaN(this.duration) && isFinite(this.duration) && this.duration > 1) {
                self.dom.seekBar.max = this.duration;
                self.dom.duration.textContent = self.formatTime(this.duration);
            }
        });
    },

    showView: function (viewId) {
        var views = this.dom.views;
        for (var key in views) {
            if (views.hasOwnProperty(key)) {
                views[key].classList.add('hidden');
            }
        }
        var target = document.getElementById(viewId);
        if (target) target.classList.remove('hidden');
        this.state.currentView = viewId;
    },

    // --- XMLHttpRequest wrapper ---
    request: function (method, url, headers, body, callback) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        callback(null, data);
                    } catch (e) {
                        callback('JSON parse error: ' + e.message, null);
                    }
                } else {
                    callback('HTTP ' + xhr.status + ': ' + xhr.statusText, null);
                }
            }
        };

        xhr.onerror = function () {
            callback('Network error (CORS or offline?)', null);
        };

        if (body) {
            xhr.send(body);
        } else {
            xhr.send();
        }
    },

    handleLogin: function () {
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
                alert('Login Failed: ' + err);
                btn.textContent = origText;
                btn.disabled = false;
                return;
            }

            self.log('Login success!');
            self.state.serverUrl = url;
            self.state.accessToken = data.AccessToken;
            self.state.userId = data.User.Id;

            localStorage.setItem('jf_server_url', url);
            localStorage.setItem('jf_access_token', self.state.accessToken);
            localStorage.setItem('jf_user_id', self.state.userId);

            self.showView('view-library');
            self.getMusicLibrary();
        });
    },

    handleLogout: function () {
        localStorage.clear();
        location.reload();
    },

    togglePlay: function () {
        if (this.dom.audio.paused) {
            this.dom.audio.play();
            this.dom.btnPlayPause.textContent = '⏸';
        } else {
            this.dom.audio.pause();
            this.dom.btnPlayPause.textContent = '▶';
        }
    },

    getMusicLibrary: function () {
        var self = this;
        var userId = this.state.userId;
        var server = this.state.serverUrl;
        var headers = { 'X-Emby-Token': this.state.accessToken };

        this.log('Getting music library...');

        // Step 1: Get Views
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

            // Step 2: Get Albums
            var albumUrl = server + '/Users/' + userId + '/Items?ParentId=' + musicView.Id + '&Recursive=true&IncludeItemTypes=MusicAlbum&SortBy=SortName';
            self.request('GET', albumUrl, headers, null, function (err2, data2) {
                if (err2) {
                    self.logError('Albums error: ' + err2);
                    return;
                }
                self.log('Got ' + data2.Items.length + ' albums');
                self.renderLibrary(data2.Items);
            });
        });
    },

    renderLibrary: function (items) {
        var self = this;
        var container = this.dom.libraryContent;
        container.innerHTML = '';

        // Store albums for shuffle
        this.state.albums = items;

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

        if (items.length === 0) {
            container.innerHTML += '<p style="padding:20px;">No music found.</p>';
            return;
        }

        for (var i = 0; i < items.length; i++) {
            (function (item) {
                var card = document.createElement('div');
                card.className = 'card';
                card.onclick = function () {
                    self.showAlbumDetails(item);
                };

                var imgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                if (item.ImageTags && item.ImageTags.Primary) {
                    imgUrl = self.state.serverUrl + '/Items/' + item.Id + '/Images/Primary?maxHeight=300&maxWidth=300&quality=90';
                }

                // Wrapper div for aspect ratio (iOS 10 doesn't support aspect-ratio CSS)
                var imgWrapper = document.createElement('div');
                imgWrapper.className = 'card-img-wrapper';

                var img = document.createElement('img');
                img.src = imgUrl;
                imgWrapper.appendChild(img);

                var title = document.createElement('div');
                title.className = 'title';
                title.textContent = item.Name;

                card.appendChild(imgWrapper);
                card.appendChild(title);
                container.appendChild(card);
            })(items[i]);
        }
    },

    showAlbumDetails: function (album) {
        var self = this;
        var userId = this.state.userId;
        var server = this.state.serverUrl;
        var headers = { 'X-Emby-Token': this.state.accessToken };

        // Set album header info
        document.getElementById('album-detail-title').textContent = album.Name;
        document.getElementById('album-detail-artist').textContent = album.AlbumArtist || 'Unknown Artist';

        var artEl = document.getElementById('album-header-art');
        if (album.ImageTags && album.ImageTags.Primary) {
            artEl.style.backgroundImage = 'url(' + server + '/Items/' + album.Id + '/Images/Primary?maxHeight=200&maxWidth=200)';
        } else {
            artEl.style.backgroundImage = 'none';
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
            self.state.currentAlbumId = album.Id;

            var container = document.getElementById('album-song-list');
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
                        duration.textContent = self.formatTime(Math.floor(track.RunTimeTicks / 10000000));
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
    },

    playAlbum: function (albumId) {
        var self = this;
        var userId = this.state.userId;
        var server = this.state.serverUrl;
        var headers = { 'X-Emby-Token': this.state.accessToken };

        var url = server + '/Users/' + userId + '/Items?ParentId=' + albumId + '&Recursive=true&IncludeItemTypes=Audio&SortBy=ParentIndexNumber,IndexNumber';
        this.request('GET', url, headers, null, function (err, data) {
            if (err) {
                self.logError('Tracks error: ' + err);
                return;
            }
            if (data.Items.length > 0) {
                self.startPlayback(data.Items, 0);
            }
        });
    },

    startPlayback: function (tracks, startIndex, albumId) {
        this.state.player.originalPlaylist = tracks.slice();
        this.state.player.playlist = tracks;
        this.state.player.shuffleEnabled = false;
        this.state.player.currentAlbumId = albumId || null;
        this.updateShuffleButton();
        this.showView('view-player');
        // Use playTrack to auto-play the selected song
        this.playTrack(startIndex);
    },

    // Shuffle helper
    shuffleArray: function (arr) {
        var shuffled = arr.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    },

    toggleShuffle: function () {
        var player = this.state.player;

        // Safety checks
        if (!player.playlist || player.playlist.length === 0) {
            this.log('Cannot toggle shuffle: no playlist');
            return;
        }
        if (!player.originalPlaylist || player.originalPlaylist.length === 0) {
            // If no original playlist saved, use current playlist as original
            player.originalPlaylist = player.playlist.slice();
        }
        if (player.currentTrack < 0 || player.currentTrack >= player.playlist.length) {
            player.currentTrack = 0;
        }

        player.shuffleEnabled = !player.shuffleEnabled;
        this.updateShuffleButton();

        var currentTrack = player.playlist[player.currentTrack];
        if (!currentTrack) {
            this.log('Cannot toggle shuffle: invalid current track');
            return;
        }

        if (player.shuffleEnabled) {
            // Shuffle ON: use cached tracks if available, otherwise fetch
            var self = this;

            var doShuffle = function (allTracks) {
                // Remove current track from list, then shuffle and prepend current
                var remaining = [];
                for (var j = 0; j < allTracks.length; j++) {
                    if (allTracks[j].Id !== currentTrack.Id) {
                        remaining.push(allTracks[j]);
                    }
                }

                var shuffled = self.shuffleArray(remaining);
                player.originalPlaylist = allTracks.slice();
                player.playlist = [currentTrack].concat(shuffled);
                player.currentTrack = 0;
                player.currentAlbumId = null;

                self.log('Shuffle ON - ' + player.playlist.length + ' tracks in shuffled queue');
            };

            // Use cache if available
            if (this.state.allLibraryTracks && this.state.allLibraryTracks.length > 0) {
                this.log('Using cached tracks for shuffle...');
                doShuffle(this.state.allLibraryTracks);
            } else {
                // Fetch from server
                var userId = this.state.userId;
                var server = this.state.serverUrl;
                var headers = { 'X-Emby-Token': this.state.accessToken };

                this.log('Shuffle ON - fetching all tracks...');

                this.request('GET', server + '/Users/' + userId + '/Views', headers, null, function (err, data) {
                    if (err) {
                        self.logError('Views error: ' + err);
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
                        return;
                    }

                    var url = server + '/Users/' + userId + '/Items?ParentId=' + musicView.Id + '&Recursive=true&IncludeItemTypes=Audio&Limit=10000';
                    self.request('GET', url, headers, null, function (err2, data2) {
                        if (err2) {
                            self.logError('Tracks error: ' + err2);
                            return;
                        }

                        var allTracks = data2.Items || [];
                        if (allTracks.length === 0) {
                            self.log('No tracks found');
                            return;
                        }

                        // Cache the tracks for future use
                        self.state.allLibraryTracks = allTracks;
                        doShuffle(allTracks);
                    });
                });
            }
        } else {
            // Unshuffle: load the current track's album and continue from there
            var albumId = currentTrack.AlbumId;
            if (!albumId) {
                // No album context, just keep current track playing
                player.playlist = [currentTrack];
                player.currentTrack = 0;
                player.currentAlbumId = null;
                this.log('Shuffle OFF - no album context, single track mode');
                return;
            }

            // Fetch the album's tracks
            var self = this;
            var userId = this.state.userId;
            var server = this.state.serverUrl;
            var headers = { 'X-Emby-Token': this.state.accessToken };

            var url = server + '/Users/' + userId + '/Items?ParentId=' + albumId + '&Recursive=true&IncludeItemTypes=Audio&SortBy=ParentIndexNumber,IndexNumber';
            this.log('Shuffle OFF - fetching album tracks...');

            this.request('GET', url, headers, null, function (err, data) {
                if (err) {
                    self.logError('Error fetching album: ' + err);
                    // Fallback: just play current track
                    player.playlist = [currentTrack];
                    player.currentTrack = 0;
                    return;
                }

                var albumTracks = data.Items || [];
                if (albumTracks.length === 0) {
                    player.playlist = [currentTrack];
                    player.currentTrack = 0;
                    return;
                }

                // Find current track position in album
                var trackPosition = 0;
                for (var k = 0; k < albumTracks.length; k++) {
                    if (albumTracks[k].Id === currentTrack.Id) {
                        trackPosition = k;
                        break;
                    }
                }

                // Set playlist to album tracks, starting from current
                player.originalPlaylist = albumTracks.slice();
                player.playlist = albumTracks;
                player.currentTrack = trackPosition;
                player.currentAlbumId = albumId;

                self.log('Shuffle OFF - now playing album, track ' + (trackPosition + 1) + '/' + albumTracks.length);
            });
        }
    },

    updateShuffleButton: function () {
        var btn = document.getElementById('btn-shuffle');
        if (btn) {
            if (this.state.player.shuffleEnabled) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    },

    shuffleAll: function () {
        var self = this;
        var userId = this.state.userId;
        var server = this.state.serverUrl;
        var headers = { 'X-Emby-Token': this.state.accessToken };

        // Immediate visual feedback
        var shuffleBtn = document.getElementById('shuffle-all-btn');
        if (shuffleBtn) {
            shuffleBtn.textContent = 'Shuffling...';
            shuffleBtn.disabled = true;
            shuffleBtn.style.opacity = '0.7';
        }

        this.log('Fetching all songs for shuffle...');

        // Get music library view ID
        this.request('GET', server + '/Users/' + userId + '/Views', headers, null, function (err, data) {
            if (err) {
                self.logError('Views error: ' + err);
                self.resetShuffleBtn();
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
                self.resetShuffleBtn();
                return;
            }

            // Fetch ALL audio tracks in one request (no per-album fetching)
            var url = server + '/Users/' + userId + '/Items?ParentId=' + musicView.Id + '&Recursive=true&IncludeItemTypes=Audio&SortBy=Random&Limit=10000';
            self.request('GET', url, headers, null, function (err2, data2) {
                self.resetShuffleBtn();
                if (err2) {
                    self.logError('Tracks error: ' + err2);
                    return;
                }

                self.log('Got ' + data2.Items.length + ' total tracks');
                if (data2.Items.length === 0) {
                    alert('No songs found');
                    return;
                }

                var shuffled = self.shuffleArray(data2.Items);
                // Cache tracks for faster future reshuffles
                self.state.allLibraryTracks = data2.Items.slice();
                // Set up player state properly for shuffle toggle to work
                self.state.player.originalPlaylist = data2.Items.slice();
                self.state.player.playlist = shuffled;
                self.state.player.shuffleEnabled = true;
                self.state.player.currentAlbumId = null; // Shuffling all, not album-specific
                self.updateShuffleButton();
                self.showView('view-player');
                // Use playTrack instead of loadTrack so first song auto-plays
                self.playTrack(0);
            });
        });
    },

    resetShuffleBtn: function () {
        var shuffleBtn = document.getElementById('shuffle-all-btn');
        if (shuffleBtn) {
            shuffleBtn.textContent = 'Shuffle All';
            shuffleBtn.disabled = false;
            shuffleBtn.style.opacity = '1';
        }
    },

    loadTrack: function (index) {
        // Load track metadata and URL but don't auto-play (for iOS)
        if (index < 0 || index >= this.state.player.playlist.length) return;

        var track = this.state.player.playlist[index];
        this.state.player.currentTrack = index;

        var track = this.state.player.playlist[index];
        this.state.player.currentTrack = index;

        this.setTextFit(this.dom.playerTitle, track.Name);
        var artist = track.AlbumArtist || (track.Artists && track.Artists[0]) || 'Unknown Artist';
        this.setTextFit(this.dom.playerArtist, artist);

        // Reset seek bar
        this.dom.seekBar.value = 0;
        this.dom.currentTime.textContent = '0:00';

        // Set duration from metadata if available (ticks -> seconds)
        // Store this so timeupdate/loadedmetadata don't overwrite with bad values
        if (track.RunTimeTicks) {
            var durationSec = Math.floor(track.RunTimeTicks / 10000000);
            this.state.player.metadataDuration = durationSec;
            this.dom.seekBar.max = durationSec;
            this.dom.duration.textContent = this.formatTime(durationSec);
        } else {
            this.state.player.metadataDuration = null;
            this.dom.duration.textContent = '-:--';
        }

        if (track.AlbumId) {
            var imgUrl = this.state.serverUrl + '/Items/' + track.AlbumId + '/Images/Primary?maxHeight=600&maxWidth=600';
            this.dom.playerArt.style.backgroundImage = 'url(' + imgUrl + ')';
        } else {
            this.dom.playerArt.style.backgroundImage = 'none';
        }
        // Use /universal endpoint for automatic transcoding, or force transcode
        // Remove static=true, add AudioCodec=aac to force server-side transcoding for FLAC/etc
        var streamUrl = this.state.serverUrl + '/Audio/' + track.Id + '/universal?UserId=' + this.state.userId + '&AudioCodec=aac&TranscodingContainer=ts&TranscodingProtocol=hls&MaxStreamingBitrate=320000&api_key=' + this.state.accessToken;

        // Fallback: simple stream with transcoding
        // Some Jellyfin versions prefer this simpler approach
        streamUrl = this.state.serverUrl + '/Audio/' + track.Id + '/stream?AudioCodec=aac&MaxStreamingBitrate=320000&api_key=' + this.state.accessToken;

        this.log('Stream URL: ' + streamUrl);
        this.dom.audio.src = streamUrl;

        // Don't auto-play. User taps Play.
        this.state.player.isPlaying = false;
        this.dom.btnPlayPause.textContent = '▶';
        this.log('Loaded: ' + track.Name);

        // Update page title (helps some contexts)
        document.title = track.Name + ' - ' + (track.AlbumArtist || 'Jellyfin');

        // Try Media Session API if available (iOS 15+, Chrome 57+, but doesn't hurt to try)
        if ('mediaSession' in navigator) {
            var self = this;
            try {
                var artworkUrl = track.AlbumId ?
                    this.state.serverUrl + '/Items/' + track.AlbumId + '/Images/Primary?maxHeight=512&maxWidth=512' : '';
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.Name,
                    artist: track.AlbumArtist || (track.Artists && track.Artists[0]) || 'Unknown',
                    album: track.Album || '',
                    artwork: artworkUrl ? [
                        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }
                    ] : []
                });

                // Action handlers for lock screen / notification controls
                navigator.mediaSession.setActionHandler('play', function () {
                    self.dom.audio.play();
                    self.state.player.isPlaying = true;
                    self.dom.btnPlayPause.textContent = '⏸';
                });
                navigator.mediaSession.setActionHandler('pause', function () {
                    self.dom.audio.pause();
                    self.state.player.isPlaying = false;
                    self.dom.btnPlayPause.textContent = '▶';
                });
                navigator.mediaSession.setActionHandler('previoustrack', function () {
                    self.playTrack(self.state.player.currentTrack - 1);
                });
                navigator.mediaSession.setActionHandler('nexttrack', function () {
                    self.playTrack(self.state.player.currentTrack + 1);
                });
                navigator.mediaSession.setActionHandler('seekbackward', function (details) {
                    var skipTime = details.seekOffset || 10;
                    self.dom.audio.currentTime = Math.max(self.dom.audio.currentTime - skipTime, 0);
                });
                navigator.mediaSession.setActionHandler('seekforward', function (details) {
                    var skipTime = details.seekOffset || 10;
                    self.dom.audio.currentTime = Math.min(self.dom.audio.currentTime + skipTime, self.dom.audio.duration);
                });

                this.log('MediaSession set with handlers');
            } catch (e) {
                this.log('MediaSession error: ' + e.message);
            }
        }
    },

    playTrack: function (index) {
        // Handle playlist boundaries
        if (index < 0) {
            index = 0; // Go to start
        }

        // If we've gone past end of playlist
        if (index >= this.state.player.playlist.length) {
            // If shuffle is off, try to play next album
            if (!this.state.player.shuffleEnabled && this.state.player.currentAlbumId) {
                this.playNextAlbum();
                return;
            }
            // Otherwise loop to start or stop
            index = 0;
        }

        this.loadTrack(index);
        // Try to play - user already interacted once
        var self = this;
        var playPromise = this.dom.audio.play();
        // Handle both Promise and non-Promise returns (iOS 10 may not return promise)
        if (playPromise !== undefined) {
            // nothing, but we can't use .then
        }
        this.state.player.isPlaying = true;
        this.dom.btnPlayPause.textContent = '⏸';
    },

    playNextAlbum: function () {
        var self = this;
        var albums = this.state.albums || [];
        var currentAlbumId = this.state.player.currentAlbumId;

        if (albums.length === 0 || !currentAlbumId) {
            this.log('No albums to continue to');
            return;
        }

        // Find current album index
        var currentIndex = -1;
        for (var i = 0; i < albums.length; i++) {
            if (albums[i].Id === currentAlbumId) {
                currentIndex = i;
                break;
            }
        }

        // Get next album (wrap around to first if at end)
        var nextIndex = (currentIndex + 1) % albums.length;
        var nextAlbum = albums[nextIndex];

        this.log('Playing next album: ' + nextAlbum.Name);

        // Fetch and play next album
        var userId = this.state.userId;
        var server = this.state.serverUrl;
        var headers = { 'X-Emby-Token': this.state.accessToken };

        var url = server + '/Users/' + userId + '/Items?ParentId=' + nextAlbum.Id + '&Recursive=true&IncludeItemTypes=Audio&SortBy=ParentIndexNumber,IndexNumber';
        this.request('GET', url, headers, null, function (err, data) {
            if (err) {
                self.logError('Next album error: ' + err);
                return;
            }
            if (data.Items && data.Items.length > 0) {
                self.state.player.currentAlbumId = nextAlbum.Id;
                self.state.player.originalPlaylist = data.Items.slice();
                self.state.player.playlist = data.Items;
                self.playTrack(0);
            }
        });
    },

    formatTime: function (seconds) {
        if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
        var min = Math.floor(seconds / 60);
        var sec = Math.floor(seconds % 60);
        if (sec < 10) sec = '0' + sec;
        return min + ':' + sec;
    },

    setTextFit: function (el, text) {
        // Reset styles
        el.style.fontSize = '';
        el.textContent = text;

        // Simple scale down logic
        // Start from base size (defined in CSS) and shrink until it fits or hits limit
        // Since we don't know exact CSS px, we'll try percentages relative to base

        // Safety break
        if (el.scrollWidth <= el.clientWidth) return;

        var percent = 100;
        var minPercent = 85; // Less aggressive: don't go below 85%

        while (el.scrollWidth > el.clientWidth && percent > minPercent) {
            percent -= 2; // Slower reduction (was 5)
            el.style.fontSize = percent + '%';
        }
    },

    setMarqueeText: function (el, text) {
        // Reset
        el.className = el.id === 'player-title' ? '' : ''; // Keep existing classes if any, though currently none
        el.innerHTML = '';
        el.textContent = text;

        // Check overflow
        if (el.scrollWidth > el.clientWidth) {
            el.innerHTML = '<div class="marquee"><span>' + text + '</span></div>';
        }
    }
};

// Start App
document.addEventListener('DOMContentLoaded', function () {
    App.init();
});
