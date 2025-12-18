/**
 * Jellyfin Legacy Player - Events
 */

App.bindEvents = function () {
    var self = this;

    // --- Mini Player Events ---
    if (this.dom.miniContent) {
        this.dom.miniContent.addEventListener('click', function (e) {
            // Prevent bubbling if user clicked controls (though structure separates them, safe check)
            if (e.target.tagName !== 'BUTTON') {
                self.showView('view-player');
            }
        });
    }
    if (this.dom.miniBtnPlayPause) {
        this.dom.miniBtnPlayPause.addEventListener('click', function (e) {
            e.stopPropagation(); // Don't open player
            if (self.state.player.isPlaying) {
                self.dom.audio.pause();
                self.state.player.isPlaying = false;
                self.dom.btnPlayPause.textContent = '▶';
                this.textContent = '▶';
            } else {
                self.dom.audio.play();
                self.state.player.isPlaying = true;
                self.dom.btnPlayPause.textContent = '⏸';
                this.textContent = '⏸';
            }
        });
    }
    if (this.dom.miniBtnNext) {
        this.dom.miniBtnNext.addEventListener('click', function (e) {
            e.stopPropagation();
            self.playTrack(self.state.player.currentTrack + 1);
        });
    }

    // Login
    this.dom.loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        self.handleLogin();
    });

    this.dom.logoutBtn.addEventListener('click', function () {
        self.handleLogout();
    });

    // Tab Buttons
    var tabAlbums = document.getElementById('tab-albums');
    var tabPlaylists = document.getElementById('tab-playlists');

    if (tabAlbums) {
        tabAlbums.addEventListener('click', function () {
            tabAlbums.classList.add('active');
            tabPlaylists.classList.remove('active');
            self.state.currentLibraryTab = 'albums';
            self.getMusicLibrary();
        });
    }

    if (tabPlaylists) {
        tabPlaylists.addEventListener('click', function () {
            tabPlaylists.classList.add('active');
            tabAlbums.classList.remove('active');
            self.state.currentLibraryTab = 'playlists';
            self.getPlaylists(function (items) {
                self.renderPlaylists(items);
            });
        });
    }

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

    // Unified Back Behavior: Minimize player (overlay)
    document.getElementById('back-to-library').addEventListener('click', function () {
        self.minimizePlayer();
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

        // Update mini-player progress bar
        if (self.dom.miniProgressFill && audioDuration && !isNaN(audioDuration) && isFinite(audioDuration) && audioDuration > 0) {
            self.dom.miniProgressFill.style.width = (currentTime / audioDuration * 100) + '%';
        }

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

    // Swipe to minimize Logic
    this.initSwipeGestures();
};

App.initSwipeGestures = function () {
    var self = this;
    var playerView = document.getElementById('view-player');
    var playerContent = document.querySelector('.player-content');

    var startY = 0;
    var currentY = 0;
    var isDragging = false;
    var isValidStart = false;

    playerView.addEventListener('touchstart', function (e) {
        // Only enable swipe if we are at the top of the scroll
        if (playerContent.scrollTop <= 0) {
            startY = e.touches[0].clientY;
            isValidStart = true;
            isDragging = false;
        } else {
            isValidStart = false;
        }
    }, { passive: true }); // passive true for better scroll perf

    playerView.addEventListener('touchmove', function (e) {
        if (!isValidStart) return;

        var y = e.touches[0].clientY;
        var deltaY = y - startY;

        // If pulling down
        if (deltaY > 0) {
            // Prevent default only if we are acting on it
            // We can't preventDefault on passive listener easily, 
            // but for 'touch-action: none' or similar css this helps.
            // Actually, if scrollTop is 0, pulling down usually triggers refresh or nothing.
            // We want to move the sheet.

            if (e.cancelable) e.preventDefault(); // Try to stop rubber banding if not passive

            isDragging = true;
            currentY = deltaY;

            playerView.classList.add('dragging');
            // resistance effect? linear for now
            playerView.style.transform = 'translate3d(0, ' + deltaY + 'px, 0)';
        }
    }, { passive: false }); // PASSIVE FALSE needed to prevent default scroll

    playerView.addEventListener('touchend', function (e) {
        if (!isValidStart) return;

        playerView.classList.remove('dragging');

        if (isDragging) {
            // Threshold to minimize: 150px
            if (currentY > 150) {
                // Minimize
                // We use style to animate, but switch to class logic handled in minimizePlayer
                // First clear manual style so class takes over (or set it to 100% to match)

                // Animate manually to bottom? Or just let class take over?
                // Class transition is 300ms. If we just add class, it will transition from currentY to 100%.
                // But we set transform inline. Inline overrides class.
                // We must clear inline.
                playerView.style.transform = '';
                self.minimizePlayer();
            } else {
                // Snap back
                playerView.style.transform = '';
            }
        }

        isDragging = false;
        isValidStart = false;
        currentY = 0;
    });
};
