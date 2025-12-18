/**
 * Jellyfin Legacy Player - Main Entry Point
 */

App.init = function () {
    // initDebug is effectively empty or not needed if doing inline below
    // this.initDebug();

    // Debug console is toggled via floating button in HTML, but we can ensure it's hidden here if needed
    this.log('App Initializing...');

    // Initialize Cache
    App.Cache.init();

    this.cacheDOM();
    this.bindEvents();

    // Load cached library immediately
    this.loadLibraryCache();

    if (this.state.accessToken && this.state.serverUrl) {
        this.showView('view-library');
        this.getMusicLibrary();
    } else {
        this.showView('view-login');
        if (this.state.serverUrl) {
            this.dom.serverUrl.value = this.state.serverUrl;
        }
    }
};

// Start App
document.addEventListener('DOMContentLoaded', function () {
    App.init();
});
