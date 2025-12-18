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
