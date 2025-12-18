/**
 * Jellyfin Legacy Player - Player Logic
 */

App.togglePlay = function () {
    if (this.dom.audio.paused) {
        this.dom.audio.play();
        this.dom.btnPlayPause.textContent = '⏸';
        if (this.dom.miniBtnPlayPause) this.dom.miniBtnPlayPause.textContent = '⏸';
        this.state.player.isPlaying = true;
    } else {
        this.dom.audio.pause();
        this.dom.btnPlayPause.textContent = '▶';
        if (this.dom.miniBtnPlayPause) this.dom.miniBtnPlayPause.textContent = '▶';
        this.state.player.isPlaying = false;
    }
};

App.playAlbum = function (albumId) {
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
};

App.startPlayback = function (tracks, startIndex, albumId) {
    this.state.player.originalPlaylist = tracks.slice();
    this.state.player.playlist = tracks;
    this.state.player.shuffleEnabled = false;
    this.state.player.currentAlbumId = albumId || null;
    this.updateShuffleButton();
    this.showView('view-player');
    // Use playTrack to auto-play the selected song
    this.playTrack(startIndex);
};

App.toggleShuffle = function () {
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
        // Shuffle ON - Use CONTEXT (album/playlist) first
        var self = this;

        // Use originalPlaylist (the album/playlist the user started from)
        var contextTracks = player.originalPlaylist && player.originalPlaylist.length > 0
            ? player.originalPlaylist
            : player.playlist;

        // Remove current track from list, then shuffle and prepend current
        var remaining = [];
        for (var j = 0; j < contextTracks.length; j++) {
            if (contextTracks[j].Id !== currentTrack.Id) {
                remaining.push(contextTracks[j]);
            }
        }

        var shuffled = self.shuffleArray(remaining);
        player.playlist = [currentTrack].concat(shuffled);
        player.currentTrack = 0;
        // Keep currentAlbumId so we know the context
        // player.currentAlbumId = null; // Don't clear - we want to track context

        self.log('Shuffle ON (context-aware) - ' + player.playlist.length + ' tracks from album/playlist');
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
};

App.updateShuffleQueueSilently = function (allTracks) {
    // Find tracks that are NOT in the current playlist
    // This is a naive diff based on ID
    var player = this.state.player;
    var currentIds = {};
    for (var i = 0; i < player.originalPlaylist.length; i++) {
        currentIds[player.originalPlaylist[i].Id] = true;
    }

    var newTracks = [];
    for (var j = 0; j < allTracks.length; j++) {
        if (!currentIds[allTracks[j].Id]) {
            newTracks.push(allTracks[j]);
        }
    }

    if (newTracks.length > 0) {
        this.log('Adding ' + newTracks.length + ' new tracks to shuffle queue');

        // Add to original playlist
        player.originalPlaylist = player.originalPlaylist.concat(newTracks);

        // Shuffle new tracks and insert randomly into current playlist (after current track)
        var shuffledNew = this.shuffleArray(newTracks);

        // Insert into playlist after current playing track
        // We want to avoid disrupting the history (before current track)
        var insertIndex = player.currentTrack + 1 + Math.floor(Math.random() * (player.playlist.length - player.currentTrack));

        // Construct new playlist
        var before = player.playlist.slice(0, insertIndex);
        var after = player.playlist.slice(insertIndex);

        player.playlist = before.concat(shuffledNew).concat(after);

    }
};

App.updateShuffleButton = function () {
    var btn = document.getElementById('btn-shuffle');
    if (btn) {
        if (this.state.player.shuffleEnabled) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
};

App.shuffleAll = function () {
    var self = this;

    // Immediate visual feedback
    var shuffleBtn = document.getElementById('shuffle-all-btn');
    if (shuffleBtn) {
        shuffleBtn.textContent = 'Shuffling...';
        shuffleBtn.disabled = true;
        shuffleBtn.style.opacity = '0.7';
    }

    var startShuffle = function (tracks) {
        self.resetShuffleBtn();
        if (!tracks || tracks.length === 0) {
            alert('No songs found');
            return;
        }

        var shuffled = self.shuffleArray(tracks);

        // Set up player state
        self.state.player.originalPlaylist = tracks.slice();
        self.state.player.playlist = shuffled;
        self.state.player.shuffleEnabled = true;
        self.state.player.currentAlbumId = null;
        self.updateShuffleButton();
        self.showView('view-player');
        self.playTrack(0);
    };

    // FAST PATH: Use cache if available
    if (this.state.allLibraryTracks && this.state.allLibraryTracks.length > 0) {
        this.log('Instant Shuffle from cache!');
        startShuffle(this.state.allLibraryTracks);

        // Background sync to catch up if needed
        setTimeout(function () {
            self.syncLibrary();
        }, 500);

    } else {
        // SLOW PATH: Fetch first
        this.log('No cache, fetching for shuffle...');
        this.syncLibrary(function (tracks) {
            startShuffle(tracks);
        });
    }
};

App.resetShuffleBtn = function () {
    var shuffleBtn = document.getElementById('shuffle-all-btn');
    if (shuffleBtn) {
        shuffleBtn.textContent = 'Shuffle All';
        shuffleBtn.disabled = false;
        shuffleBtn.style.opacity = '1';
    }
};

App.loadTrack = function (index) {
    // Load track metadata and URL but don't auto-play (for iOS)
    if (index < 0 || index >= this.state.player.playlist.length) return;

    var track = this.state.player.playlist[index];
    this.state.player.currentTrack = index;

    this.setMarqueeText(this.dom.playerTitle, track.Name);
    var artist = track.AlbumArtist || (track.Artists && track.Artists[0]) || 'Unknown Artist';
    this.setMarqueeText(this.dom.playerArtist, artist);

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

    // Update Mini Player
    this.dom.miniTitle.textContent = track.Name;
    // Don't marquee the mini player to keep it performing well, or use basic text
    // (User asked for marquee on long text earlier, maybe implement later if requested)
    this.dom.miniArtist.textContent = artist;

    // Use same image logic
    if (track.AlbumId) {
        // High Quality for Main Player (512x512 matches Media Session artwork)
        var hdUrl = this.state.serverUrl + '/Items/' + track.AlbumId + '/Images/Primary?maxHeight=512&maxWidth=512&quality=90';
        App.Cache.loadBgImage(this.dom.playerArt, hdUrl);

        // Low Quality for Mini Player (120x120)
        var lqUrl = this.state.serverUrl + '/Items/' + track.AlbumId + '/Images/Primary?maxHeight=120&maxWidth=120&quality=70';
        App.Cache.loadBgImage(this.dom.miniArt, lqUrl);
    } else {
        this.dom.playerArt.style.backgroundImage = 'none';
        this.dom.miniArt.style.backgroundImage = 'none';
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
};

App.playTrack = function (index) {
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
    if (this.dom.miniBtnPlayPause) this.dom.miniBtnPlayPause.textContent = '⏸';
};

App.playNextAlbum = function () {
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
};
