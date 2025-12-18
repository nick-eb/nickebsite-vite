/**
 * Jellyfin Legacy Player - Image Cache (IndexedDB)
 * Optimized version with:
 * - Blob URL lifecycle management (prevents memory leaks)
 * - In-flight request deduplication (prevents duplicate fetches)
 * - In-memory LRU cache layer (reduces IndexedDB reads)
 * - Cache expiration (7 days)
 */

App.Cache = {
    dbName: 'JFL_Cache',
    dbVersion: 1,
    storeName: 'images',
    db: null,

    // Memory management
    blobUrlMap: null, // WeakMap: element -> blobUrl (for cleanup)

    // In-memory LRU cache
    memoryCache: {},      // url -> blobUrl
    memoryCacheOrder: [], // LRU order (oldest first)
    memoryCacheLimit: 50,

    // In-flight request deduplication
    pendingFetches: {}, // url -> [callback, callback, ...]

    // Cache expiration (7 days in ms)
    maxAgeMs: 7 * 24 * 60 * 60 * 1000,

    init: function (callback) {
        var self = this;

        // Initialize WeakMap for blob URL tracking (if supported)
        if (typeof WeakMap !== 'undefined') {
            this.blobUrlMap = new WeakMap();
        }

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

            // Run cleanup sweep for expired entries
            self.cleanupExpired();

            if (callback) callback(true);
        };

        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains(self.storeName)) {
                db.createObjectStore(self.storeName, { keyPath: 'url' });
            }
        };
    },

    /**
     * Get image with all optimizations
     */
    getImage: function (url, callback) {
        var self = this;

        // If no DB support, pass through
        if (!this.db) {
            callback(url);
            return;
        }

        // 1. Check in-memory LRU cache first (fastest)
        if (this.memoryCache[url]) {
            this.touchMemoryCache(url);
            callback(this.memoryCache[url]);
            return;
        }

        // 2. Check if there's already a pending fetch for this URL
        if (this.pendingFetches[url]) {
            this.pendingFetches[url].push(callback);
            return;
        }

        // 3. Check IndexedDB
        var transaction = this.db.transaction([this.storeName], 'readonly');
        var objectStore = transaction.objectStore(this.storeName);
        var request = objectStore.get(url);

        request.onerror = function (event) {
            App.log('Cache miss (error) for: ' + url);
            self.fetchAndCache(url, callback);
        };

        request.onsuccess = function (event) {
            if (request.result) {
                var record = request.result;

                // Check expiration
                if (record.timestamp && (Date.now() - record.timestamp > self.maxAgeMs)) {
                    // Expired - delete and refetch
                    self.deleteFromDb(url);
                    self.fetchAndCache(url, callback);
                    return;
                }

                // Valid cache hit
                try {
                    var blobUrl = URL.createObjectURL(record.blob);
                    self.addToMemoryCache(url, blobUrl);
                    callback(blobUrl);
                } catch (e) {
                    App.logError('Blob URL error: ' + e);
                    self.fetchAndCache(url, callback);
                }
            } else {
                // Cache miss
                self.fetchAndCache(url, callback);
            }
        };
    },

    /**
     * Fetch image and cache it, with request deduplication
     */
    fetchAndCache: function (url, callback) {
        var self = this;

        // Initialize pending fetch queue for this URL
        if (!this.pendingFetches[url]) {
            this.pendingFetches[url] = [];
        }
        this.pendingFetches[url].push(callback);

        // If we already have more than one callback, the fetch is in progress
        if (this.pendingFetches[url].length > 1) {
            return;
        }

        // Start the actual fetch
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function () {
            var callbacks = self.pendingFetches[url] || [];
            delete self.pendingFetches[url];

            if (xhr.status === 200) {
                var blob = xhr.response;

                // Store in IndexedDB
                self.storeInDb(url, blob);

                // Create blob URL and add to memory cache
                var blobUrl = URL.createObjectURL(blob);
                self.addToMemoryCache(url, blobUrl);

                // Notify all waiting callbacks
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](blobUrl);
                }
            } else {
                // Failed - return original URL for all callbacks
                for (var j = 0; j < callbacks.length; j++) {
                    callbacks[j](url);
                }
            }
        };

        xhr.onerror = function () {
            var callbacks = self.pendingFetches[url] || [];
            delete self.pendingFetches[url];

            // Return original URL for all callbacks
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](url);
            }
        };

        xhr.send();
    },

    /**
     * Store blob in IndexedDB with timestamp
     */
    storeInDb: function (url, blob) {
        if (!this.db) return;

        var transaction = this.db.transaction([this.storeName], 'readwrite');
        var objectStore = transaction.objectStore(this.storeName);
        var request = objectStore.put({
            url: url,
            blob: blob,
            timestamp: Date.now()
        });

        request.onerror = function (event) {
            App.logError('Failed to cache: ' + url);
        };
    },

    /**
     * Delete entry from IndexedDB
     */
    deleteFromDb: function (url) {
        if (!this.db) return;

        var transaction = this.db.transaction([this.storeName], 'readwrite');
        var objectStore = transaction.objectStore(this.storeName);
        objectStore.delete(url);
    },

    /**
     * Add to in-memory LRU cache
     */
    addToMemoryCache: function (url, blobUrl) {
        // If already in cache, just touch it
        if (this.memoryCache[url]) {
            this.touchMemoryCache(url);
            return;
        }

        // Evict oldest if at capacity
        while (this.memoryCacheOrder.length >= this.memoryCacheLimit) {
            var oldestUrl = this.memoryCacheOrder.shift();
            var oldBlobUrl = this.memoryCache[oldestUrl];
            if (oldBlobUrl) {
                URL.revokeObjectURL(oldBlobUrl);
            }
            delete this.memoryCache[oldestUrl];
        }

        // Add new entry
        this.memoryCache[url] = blobUrl;
        this.memoryCacheOrder.push(url);
    },

    /**
     * Touch entry in LRU cache (move to end = most recently used)
     */
    touchMemoryCache: function (url) {
        var idx = this.memoryCacheOrder.indexOf(url);
        if (idx > -1) {
            this.memoryCacheOrder.splice(idx, 1);
            this.memoryCacheOrder.push(url);
        }
    },

    /**
     * Cleanup expired entries from IndexedDB (runs on init)
     */
    cleanupExpired: function () {
        if (!this.db) return;

        var self = this;
        var transaction = this.db.transaction([this.storeName], 'readwrite');
        var objectStore = transaction.objectStore(this.storeName);
        var request = objectStore.openCursor();
        var deletedCount = 0;
        var now = Date.now();

        request.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                var record = cursor.value;
                if (record.timestamp && (now - record.timestamp > self.maxAgeMs)) {
                    cursor.delete();
                    deletedCount++;
                }
                cursor.continue();
            } else {
                if (deletedCount > 0) {
                    App.log('Cache cleanup: removed ' + deletedCount + ' expired entries');
                }
            }
        };
    },

    /**
     * Helper to set image src with cache and blob URL lifecycle management
     */
    loadImage: function (imgElement, url) {
        var self = this;

        if (!url) {
            this.cleanupElement(imgElement);
            imgElement.src = '';
            return;
        }

        this.getImage(url, function (finalUrl) {
            // Cleanup old blob URL if we're tracking this element
            self.cleanupElement(imgElement);

            imgElement.src = finalUrl;

            // Track the blob URL for this element (if it's a blob URL)
            if (self.blobUrlMap && finalUrl.indexOf('blob:') === 0) {
                self.blobUrlMap.set(imgElement, finalUrl);
            }
        });
    },

    /**
     * Helper for background image with blob URL lifecycle management
     */
    loadBgImage: function (element, url) {
        var self = this;

        if (!url) {
            this.cleanupElement(element);
            element.style.backgroundImage = 'none';
            return;
        }

        this.getImage(url, function (finalUrl) {
            // Cleanup old blob URL if we're tracking this element
            self.cleanupElement(element);

            element.style.backgroundImage = 'url(' + finalUrl + ')';

            // Track the blob URL for this element (if it's a blob URL)
            if (self.blobUrlMap && finalUrl.indexOf('blob:') === 0) {
                self.blobUrlMap.set(element, finalUrl);
            }
        });
    },

    /**
     * Progressive background image loading: show LQ placeholder, then swap to HQ
     * This provides instant visual feedback while high-quality loads
     */
    loadBgImageProgressive: function (element, lqUrl, hqUrl) {
        var self = this;

        if (!lqUrl && !hqUrl) {
            this.cleanupElement(element);
            element.style.backgroundImage = 'none';
            return;
        }

        // Track which load request this is (to prevent stale swaps on fast skipping)
        var loadVersion = (element._cacheLoadVersion || 0) + 1;
        element._cacheLoadVersion = loadVersion;

        // Start loading HQ immediately (in parallel)
        var hqLoaded = false;
        if (hqUrl) {
            this.getImage(hqUrl, function (finalHqUrl) {
                // Only swap if this is still the current request
                if (element._cacheLoadVersion !== loadVersion) return;

                hqLoaded = true;
                self.cleanupElement(element);
                element.style.backgroundImage = 'url(' + finalHqUrl + ')';

                if (self.blobUrlMap && finalHqUrl.indexOf('blob:') === 0) {
                    self.blobUrlMap.set(element, finalHqUrl);
                }
            });
        }

        // Load LQ and display immediately (unless HQ already loaded)
        if (lqUrl) {
            this.getImage(lqUrl, function (finalLqUrl) {
                // Only show LQ if this is still current AND HQ hasn't loaded yet
                if (element._cacheLoadVersion !== loadVersion) return;
                if (hqLoaded) return;

                self.cleanupElement(element);
                element.style.backgroundImage = 'url(' + finalLqUrl + ')';

                if (self.blobUrlMap && finalLqUrl.indexOf('blob:') === 0) {
                    self.blobUrlMap.set(element, finalLqUrl);
                }
            });
        }
    },

    /**
     * Cleanup blob URL associated with an element
     * Note: We don't revoke here because the blob URL may be in memory cache
     * The memory cache LRU eviction handles revocation
     */
    cleanupElement: function (element) {
        if (this.blobUrlMap && this.blobUrlMap.has(element)) {
            // Just remove the tracking, don't revoke (memory cache manages lifecycle)
            this.blobUrlMap.delete(element);
        }
    },

    /**
     * Prefetch an image into cache without displaying it
     * Used for background preloading of upcoming track artwork
     */
    prefetch: function (url) {
        if (!url) return;

        // Already in memory cache - nothing to do
        if (this.memoryCache[url]) return;

        // Already fetching - nothing to do
        if (this.pendingFetches[url]) return;

        // Trigger fetch and cache (callback just ignores the result)
        this.getImage(url, function () {
            // Prefetch complete - image is now in cache
        });
    },

    /**
     * Get cache statistics (for debugging)
     */
    getStats: function () {
        return {
            memoryCacheSize: this.memoryCacheOrder.length,
            memoryCacheLimit: this.memoryCacheLimit,
            pendingFetches: Object.keys(this.pendingFetches).length
        };
    }
};
