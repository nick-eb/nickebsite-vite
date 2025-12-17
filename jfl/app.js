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
            isPlaying: false
        }
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

        // Seek Bar Events
        this.dom.seekBar.addEventListener('input', function () {
            var time = parseFloat(this.value);
            self.dom.audio.currentTime = time;
            self.dom.currentTime.textContent = self.formatTime(time);
        });

        this.dom.audio.addEventListener('timeupdate', function () {
            var currentTime = this.currentTime;
            var duration = this.duration;

            self.dom.seekBar.value = currentTime;
            self.dom.currentTime.textContent = self.formatTime(currentTime);

            // Only update max/duration from audio element if it's valid and finite
            // Otherwise keep the one we set from metadata
            if (duration && !isNaN(duration) && isFinite(duration) && duration > 1) {
                self.dom.seekBar.max = duration;
                self.dom.duration.textContent = self.formatTime(duration);
            }
        });

        this.dom.audio.addEventListener('loadedmetadata', function () {
            if (!isNaN(this.duration)) {
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
            var albumUrl = server + '/Users/' + userId + '/Items?ParentId=' + musicView.Id + '&Recursive=true&IncludeItemTypes=MusicAlbum&SortBy=SortName&Limit=50';
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
                    self.playAlbum(item.Id);
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

    startPlayback: function (tracks, startIndex) {
        this.state.player.playlist = tracks;
        this.loadTrack(startIndex); // Load but don't play yet
        this.showView('view-player');
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

    shuffleAll: function () {
        var self = this;
        var albums = this.state.albums || [];
        if (albums.length === 0) {
            alert('No albums to shuffle');
            return;
        }

        this.log('Shuffling all albums...');
        var userId = this.state.userId;
        var server = this.state.serverUrl;
        var headers = { 'X-Emby-Token': this.state.accessToken };

        // Get ALL tracks from ALL albums
        var allTracks = [];
        var completed = 0;
        var total = albums.length;

        for (var i = 0; i < albums.length; i++) {
            (function (album) {
                var url = server + '/Users/' + userId + '/Items?ParentId=' + album.Id + '&Recursive=true&IncludeItemTypes=Audio&SortBy=Random&Limit=100';
                self.request('GET', url, headers, null, function (err, data) {
                    completed++;
                    if (!err && data && data.Items) {
                        for (var j = 0; j < data.Items.length; j++) {
                            allTracks.push(data.Items[j]);
                        }
                    }
                    if (completed === total) {
                        // All albums loaded, shuffle and play
                        self.log('Got ' + allTracks.length + ' total tracks');
                        var shuffled = self.shuffleArray(allTracks);
                        self.startPlayback(shuffled, 0);
                    }
                });
            })(albums[i]);
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
        if (track.RunTimeTicks) {
            var durationSec = Math.floor(track.RunTimeTicks / 10000000);
            this.dom.seekBar.max = durationSec;
            this.dom.duration.textContent = this.formatTime(durationSec);
        } else {
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
        // For next/prev - load and attempt to play
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
        this.state.player.isPlaying = true;
        this.dom.btnPlayPause.textContent = '⏸';
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
