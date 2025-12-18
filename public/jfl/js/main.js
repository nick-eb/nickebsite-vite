/**
 * Jellyfin Legacy Player - Main Entry Point
 */

App.init = function () {
    this.log('App Initializing...');

    // Initialize image cache (IndexedDB)
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
