/**
 * Jellyfin Legacy Player - Utilities
 */

App.log = function (msg) {
    console.log(msg);
    var dc = document.getElementById('debug-console');
    if (dc) {
        dc.innerHTML += '<div>[LOG] ' + msg + '</div>';
        dc.scrollTop = dc.scrollHeight;
    }
};

App.logError = function (msg) {
    console.error(msg);
    var dc = document.getElementById('debug-console');
    if (dc) {
        dc.innerHTML += '<div style="color:red">[ERR] ' + msg + '</div>';
        dc.scrollTop = dc.scrollHeight;
    }
};

/**
 * Standardized error handler
 * @param {Error|string} error - The error object or message
 * @param {string} userMessage - Optional user-friendly message to show
 * @param {boolean} showAlert - Whether to show an alert to the user
 */
App.handleError = function (error, userMessage, showAlert) {
    var errorMsg = error && error.message ? error.message : String(error);
    this.logError(errorMsg);

    if (showAlert && userMessage) {
        alert(userMessage);
    }

    return errorMsg;
};

/**
 * Safe function wrapper - catches errors and handles them gracefully
 * @param {Function} fn - Function to execute
 * @param {string} context - Context description for error logging
 * @returns {*} Result of function or undefined on error
 */
App.safeExecute = function (fn, context) {
    try {
        return fn();
    } catch (e) {
        this.handleError(e, null, false);
        this.logError('Error in ' + (context || 'unknown context') + ': ' + e.message);
        return undefined;
    }
};

/**
 * Show loading state on an element
 * @param {HTMLElement} element - Element to show loading on
 * @param {string} message - Optional loading message
 */
App.showLoading = function (element, message) {
    if (!element) return;
    element._originalContent = element.innerHTML;
    element._originalDisabled = element.disabled;
    element.innerHTML = message || 'Loading...';
    if (element.tagName === 'BUTTON') {
        element.disabled = true;
    }
    element.classList.add('loading');
};

/**
 * Hide loading state on an element
 * @param {HTMLElement} element - Element to restore
 */
App.hideLoading = function (element) {
    if (!element) return;
    if (element._originalContent !== undefined) {
        element.innerHTML = element._originalContent;
        delete element._originalContent;
    }
    if (element._originalDisabled !== undefined) {
        element.disabled = element._originalDisabled;
        delete element._originalDisabled;
    }
    element.classList.remove('loading');
};
App.shuffleArray = function (arr) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
};

App.formatTime = function (seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    var min = Math.floor(seconds / 60);
    var sec = Math.floor(seconds % 60);
    if (sec < 10) sec = '0' + sec;
    return min + ':' + sec;
};

// Constants to eliminate magic numbers
App.constants = {
    TICKS_PER_SECOND: 10000000,
    SYNC_DELAY_MS: 500,
    SWIPE_THRESHOLD_PX: 150,
    PREFETCH_COUNT: 3,
    CACHE_EXPIRY_DAYS: 7,
    IMAGE_SIZE_LQ: 120,
    IMAGE_SIZE_HQ: 512,
    IMAGE_SIZE_GRID: 300,
    IMAGE_QUALITY_LQ: 70,
    IMAGE_QUALITY_HQ: 90
};

/**
 * Convert Jellyfin ticks to seconds
 * @param {number} ticks - Duration in ticks (100-nanosecond intervals)
 * @returns {number} Duration in seconds
 */
App.ticksToSeconds = function (ticks) {
    if (!ticks || isNaN(ticks)) return 0;
    return Math.floor(ticks / this.constants.TICKS_PER_SECOND);
};

/**
 * Generate an image URL for a Jellyfin item
 * @param {string} itemId - The item ID
 * @param {string} size - Size preset: 'lq', 'hq', or 'grid'
 * @returns {string} The full image URL
 */
App.getImageUrl = function (itemId, size) {
    if (!itemId || !this.state.serverUrl) return '';

    var maxSize, quality;
    switch (size) {
        case 'lq':
            maxSize = this.constants.IMAGE_SIZE_LQ;
            quality = this.constants.IMAGE_QUALITY_LQ;
            break;
        case 'hq':
            maxSize = this.constants.IMAGE_SIZE_HQ;
            quality = this.constants.IMAGE_QUALITY_HQ;
            break;
        case 'grid':
        default:
            maxSize = this.constants.IMAGE_SIZE_GRID;
            quality = this.constants.IMAGE_QUALITY_HQ;
            break;
    }

    return this.state.serverUrl + '/Items/' + itemId + '/Images/Primary?maxHeight=' + maxSize + '&maxWidth=' + maxSize + '&quality=' + quality;
};

/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with auth token
 */
App.getAuthHeaders = function () {
    return { 'X-Emby-Token': this.state.accessToken };
};

App.setMarqueeText = function (el, text) {
    // Safe reset: remove marquee classes and structure
    el.classList.remove('marquee-container');
    el.title = text; // Tooltip for accessibility
    el.textContent = text;

    var checkMarquee = function () {
        // Force a reflow/measurement
        var sw = el.scrollWidth;
        var cw = el.clientWidth;

        // Ensure element is visible (cw > 0) and text overflows
        if (sw > cw && cw > 0) {
            // Text is too long, wrap in marquee structure
            // Duplicate text for seamless scrolling effect (iOS style)
            var spacing = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'; // 8 spaces

            // Calculate duration based on width to ensure consistent speed
            var duration = Math.max(8, sw / 30); // Min 8s

            el.innerHTML = '<span class="marquee-content" style="animation-duration:' + duration + 's">' + text + spacing + text + spacing + '</span>';
            el.classList.add('marquee-container');
        }
    };

    // Use double requestAnimationFrame to wait for layout paint
    // This fixes issues where scrollWidth is 0 immediately after removing .hidden class
    if (window.requestAnimationFrame) {
        requestAnimationFrame(function () {
            requestAnimationFrame(checkMarquee);
        });
    } else {
        setTimeout(checkMarquee, 100);
    }
};
