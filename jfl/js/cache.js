/**
 * Jellyfin Legacy Player - Image Cache (IndexedDB)
 */

App.Cache = {
    dbName: 'JFL_Cache',
    dbVersion: 1,
    storeName: 'images',
    db: null,

    init: function (callback) {
        var self = this;
        if (!window.indexedDB) {
            App.log('IndexedDB not supported. Caching disabled.');
            if (callback) callback(false);
            return;
        }

        var request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = function (event) {
            App.logError('IndexedDB error: ' + event.target.errorCode);
            if (callback) callback(false);
        };

        request.onsuccess = function (event) {
            self.db = event.target.result;
            App.log('Image Cache Initialized');
            if (callback) callback(true);
        };

        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            // Create an objectStore to hold blobs
            // Key Path: url
            if (!db.objectStoreNames.contains(self.storeName)) {
                db.createObjectStore(self.storeName, { keyPath: 'url' });
            }
        };
    },

    getImage: function (url, callback) {
        // If no DB support or disabled, just return URL (pass-through)
        if (!this.db) {
            callback(url);
            return;
        }

        var self = this;
        var transaction = this.db.transaction([this.storeName], 'readonly');
        var objectStore = transaction.objectStore(this.storeName);
        var request = objectStore.get(url);

        request.onerror = function (event) {
            App.log('Cache miss (error) for: ' + url);
            self.fetchAndCache(url, callback);
        };

        request.onsuccess = function (event) {
            if (request.result) {
                // Info: request.result.blob is the cached blob
                try {
                    var blobUrl = URL.createObjectURL(request.result.blob);
                    // App.log('Cache HIT: ' + url);
                    callback(blobUrl);
                } catch (e) {
                    App.logError('Blob URL ensure error: ' + e);
                    self.fetchAndCache(url, callback);
                }
            } else {
                // App.log('Cache MISS: ' + url);
                self.fetchAndCache(url, callback);
            }
        };
    },

    fetchAndCache: function (url, callback) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function () {
            if (xhr.status === 200) {
                var blob = xhr.response;
                // Store in DB
                self.storeInDb(url, blob);

                var blobUrl = URL.createObjectURL(blob);
                callback(blobUrl);
            } else {
                // Failed to load, just return original URL so browser can try standard load or fail gracefully
                callback(url);
            }
        };

        xhr.onerror = function () {
            callback(url);
        };

        xhr.send();
    },

    storeInDb: function (url, blob) {
        if (!this.db) return;
        var transaction = this.db.transaction([this.storeName], 'readwrite');
        var objectStore = transaction.objectStore(this.storeName);
        var request = objectStore.put({ url: url, blob: blob, timestamp: Date.now() });

        request.onsuccess = function (event) {
            // App.log('Cached: ' + url);
        };
        request.onerror = function (event) {
            App.logError('Failed to cache: ' + url);
        };
    },

    // Helper to set image src with cache
    loadImage: function (imgElement, url) {
        if (!url) {
            imgElement.src = ''; // Clear or set placeholder
            return;
        }

        // Add loading state?
        // imgElement.style.opacity = '0.5';

        this.getImage(url, function (finalUrl) {
            imgElement.src = finalUrl;
            // imgElement.style.opacity = '1';
        });
    },

    // Helper for background image
    loadBgImage: function (element, url) {
        if (!url) {
            element.style.backgroundImage = 'none';
            return;
        }

        this.getImage(url, function (finalUrl) {
            element.style.backgroundImage = 'url(' + finalUrl + ')';
        });
    }
};
