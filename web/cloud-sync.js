/**
 * CloudSyncManager - Secure Local-First Cloud Sync & Authentication
 * Supports Firebase Authentication & Cloud Firestore with offline-first persistence.
 */
(function (global) {
    'use strict';

    const DEFAULT_CONFIG_STORAGE_KEY = 'todo_cloud_firebase_config';
    const DEFAULT_FIREBASE_CONFIG = {
        apiKey: "AIzaSyBr2CQhDsZALwwX4s4KSsbPEAFh2ucPwOk",
        authDomain: "todoboard-studio.firebaseapp.com",
        projectId: "todoboard-studio",
        storageBucket: "todoboard-studio.firebasestorage.app",
        messagingSenderId: "390031122905",
        appId: "1:390031122905:web:ad988b67a4e84274b2f9c8",
        measurementId: "G-D98FQLQ93K"
    };

    class CloudSyncManager {
        constructor() {
            this.app = null;
            this.auth = null;
            this.db = null;
            this.currentUser = null;
            this.unsubscribeSnapshot = null;
            this.syncStatus = 'guest'; // 'guest' | 'synced' | 'syncing' | 'offline' | 'error'
            this.lastError = null;
            this.isPushing = false;
            this.pushTimer = null;
            this.lastCloudUpdatedAt = null;
            this.lastSyncedHash = null;

            this.listeners = {
                status: [],
                auth: [],
                remoteData: []
            };

            // Network status listeners
            window.addEventListener('online', () => this.handleNetworkChange(true));
            window.addEventListener('offline', () => this.handleNetworkChange(false));
        }

        // Get saved or default Firebase config
        getConfig() {
            try {
                const saved = localStorage.getItem(DEFAULT_CONFIG_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && typeof parsed === 'object' && parsed.apiKey && parsed.apiKey.startsWith('AIza') && parsed.projectId) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.warn('Error reading saved cloud config:', e);
            }
            return DEFAULT_FIREBASE_CONFIG;
        }

        saveConfig(configObj) {
            try {
                if (!configObj || !configObj.apiKey || !configObj.projectId) {
                    throw new Error('Invalid Firebase configuration object.');
                }
                localStorage.setItem(DEFAULT_CONFIG_STORAGE_KEY, JSON.stringify(configObj));
                if (this.app) {
                    try { this.app.delete(); } catch (e) {}
                    this.app = null;
                }
                return this.init();
            } catch (e) {
                console.error('Failed to save cloud config:', e);
                throw e;
            }
        }

        async clearConfig() {
            localStorage.removeItem(DEFAULT_CONFIG_STORAGE_KEY);
            if (this.auth) {
                try { await this.auth.signOut(); } catch (e) {}
            }
            if (this.app) {
                try { await this.app.delete(); } catch (e) {}
                this.app = null;
            }
            this.setStatus('guest');
            this.init();
        }

        // Initialize Firebase
        init() {
            const config = this.getConfig();
            if (!config || !config.apiKey || !config.projectId) {
                this.setStatus('guest');
                return false;
            }

            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK not loaded.');
                this.setStatus('error', 'Firebase SDK not available.');
                return false;
            }

            try {
                // If existing app is already initialized, reuse or re-create if config changed
                if (firebase.apps && firebase.apps.length > 0) {
                    this.app = firebase.app();
                    if (this.app.options && (this.app.options.apiKey !== config.apiKey || this.app.options.projectId !== config.projectId)) {
                        this.app.delete().then(() => {
                            this.app = firebase.initializeApp(config);
                            this.setupAuthAndDb();
                        }).catch(() => {
                            this.setupAuthAndDb();
                        });
                        return true;
                    }
                } else {
                    this.app = firebase.initializeApp(config);
                }

                this.setupAuthAndDb();
                return true;
            } catch (err) {
                console.error('Firebase init error:', err);
                this.setStatus('error', err.message);
                return false;
            }
        }

        async setupAuthAndDb() {
            if (!this.app) return;
            this.auth = this.app.auth();
            this.db = this.app.firestore();

            // Set explicit local persistence to retain login session permanently
            try {
                if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
                    await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                }
            } catch (e) {
                console.warn('Could not set explicit auth persistence:', e);
            }

            // Enable Firestore offline persistence if available
            try {
                this.db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
            } catch (e) {}

            // Auth state listener
            this.auth.onAuthStateChanged(user => {
                this.currentUser = user;
                this.notifyAuthListeners(user);

                if (user) {
                    this.setStatus('syncing');
                    this.startRealtimeListener(user.uid);
                } else {
                    this.stopRealtimeListener();
                    this.setStatus('guest');
                }
            });
        }

        // --- Authentication Operations ---
        async signUpWithEmail(email, password, displayName = '') {
            if (!this.auth) throw new Error('Cloud services are not configured.');
            const userCred = await this.auth.createUserWithEmailAndPassword(email.trim(), password);
            if (displayName && userCred.user && userCred.user.updateProfile) {
                await userCred.user.updateProfile({ displayName: displayName.trim() });
            }
            return userCred.user;
        }

        async signInWithEmail(email, password) {
            if (!this.auth) throw new Error('Cloud services are not configured.');
            const userCred = await this.auth.signInWithEmailAndPassword(email.trim(), password);
            return userCred.user;
        }

        async signInWithGoogle() {
            if (!this.auth) throw new Error('Cloud services are not configured.');
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            try {
                const result = await this.auth.signInWithPopup(provider);
                return result.user;
            } catch (err) {
                if (typeof window !== 'undefined' && window.electronAPI && (err.code === 'auth/popup-blocked' || err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('disallowed_useragent')))) {
                    throw new Error('Google Sign-In requires browser verification. Please sign in with Email & Password in the desktop app, or use the Web App at todoboard-studio.web.app.');
                }
                if (err.code === 'auth/popup-blocked' || err.code === 'auth/unauthorized-domain') {
                    // Fallback to redirect in standard web browsers
                    await this.auth.signInWithRedirect(provider);
                    return null;
                }
                throw err;
            }
        }

        async sendPasswordReset(email) {
            if (!this.auth) throw new Error('Cloud services are not configured.');
            await this.auth.sendPasswordResetEmail(email.trim());
        }

        async signOut() {
            if (!this.auth) return;
            this.stopRealtimeListener();
            await this.auth.signOut();
            this.setStatus('guest');
        }

        // --- Realtime Firestore Sync ---
        startRealtimeListener(uid) {
            this.stopRealtimeListener();
            if (!this.db || !uid) return;

            let isInitialLoad = true;

            try {
                const docRef = this.db.collection('users').doc(uid).collection('data').doc('workspaces');

                this.unsubscribeSnapshot = docRef.onSnapshot(
                    { includeMetadataChanges: true },
                    doc => {
                        if (!doc.exists) {
                            this.setStatus('synced');
                            isInitialLoad = false;
                            return;
                        }

                        // Ignore local in-flight writes that have not been committed to server yet
                        if (doc.metadata && doc.metadata.hasPendingWrites) {
                            return;
                        }

                        const data = doc.data();
                        if (!data || !data.boards) {
                            this.setStatus('synced');
                            isInitialLoad = false;
                            return;
                        }

                        // Check if this update came from another client
                        const remoteHash = this.computeHash(data.boards);
                        if (remoteHash === this.lastSyncedHash || (this.pendingBoards && remoteHash === this.computeHash(this.pendingBoards))) {
                            this.setStatus('synced');
                            isInitialLoad = false;
                            return;
                        }

                        const isLiveUpdate = !isInitialLoad;
                        isInitialLoad = false;

                        this.lastSyncedHash = remoteHash;
                        this.lastCloudUpdatedAt = data.updatedAt;
                        this.notifyRemoteDataListeners(data.boards, data.updatedAt, isLiveUpdate);
                        this.setStatus('synced');
                    },
                    err => {
                        console.error('Firestore realtime sync error:', err);
                        if (!navigator.onLine) {
                            this.setStatus('offline');
                        } else {
                            this.setStatus('error', err.message);
                        }
                    }
                );
            } catch (err) {
                console.error('Failed to attach realtime listener:', err);
                this.setStatus('error', err.message);
            }
        }

        stopRealtimeListener() {
            if (this.unsubscribeSnapshot) {
                this.unsubscribeSnapshot();
                this.unsubscribeSnapshot = null;
            }
        }

        // Push local boards to cloud (Debounced with immediate hash registration)
        pushLocalStateToCloud(boards, delayMs = 300) {
            if (!this.currentUser || !this.db || !boards) return;

            // Deep clone local boards to isolate snapshot
            try {
                this.pendingBoards = JSON.parse(JSON.stringify(boards));
                this.lastSyncedHash = this.computeHash(this.pendingBoards);
            } catch (e) {
                this.pendingBoards = boards;
            }

            if (this.pushTimer) {
                clearTimeout(this.pushTimer);
            }

            this.pushTimer = setTimeout(() => {
                this.executePush(this.pendingBoards);
            }, delayMs);
        }

        async executePush(boards) {
            if (!this.currentUser || !this.db) return;
            if (!navigator.onLine) {
                this.setStatus('offline');
                return;
            }

            const payloadBoards = boards || this.pendingBoards;
            if (!payloadBoards) return;

            // Ensure every board has columns before saving to cloud
            if (payloadBoards && typeof payloadBoards === 'object') {
                Object.keys(payloadBoards).forEach(k => {
                    if (payloadBoards[k] && (!payloadBoards[k].columns || !Array.isArray(payloadBoards[k].columns) || payloadBoards[k].columns.length === 0)) {
                        payloadBoards[k].columns = ["To Do", "In Progress", "Done"];
                    }
                });
            }

            const currentHash = this.computeHash(payloadBoards);
            this.lastSyncedHash = currentHash;

            this.isPushing = true;
            this.setStatus('syncing');

            try {
                const uid = this.currentUser.uid;
                const docRef = this.db.collection('users').doc(uid).collection('data').doc('workspaces');

                const payload = {
                    boards: payloadBoards,
                    updatedAt: new Date().toISOString(),
                    clientVersion: '4.1.0',
                    userId: uid,
                    email: this.currentUser.email || ''
                };

                await docRef.set(payload);
                this.lastSyncedHash = currentHash;
                this.lastCloudUpdatedAt = payload.updatedAt;
                this.pendingBoards = null;
                this.setStatus('synced');
            } catch (err) {
                console.error('Cloud push failed:', err);
                if (!navigator.onLine) {
                    this.setStatus('offline');
                } else {
                    this.setStatus('error', err.message);
                }
            } finally {
                this.isPushing = false;
            }
        }

        // Fetch cloud state once
        async fetchCloudState() {
            if (!this.currentUser || !this.db) return null;
            const uid = this.currentUser.uid;
            const docRef = this.db.collection('users').doc(uid).collection('data').doc('workspaces');
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                return data ? data.boards : null;
            }
            return null;
        }

        handleNetworkChange(isOnline) {
            if (!isOnline) {
                this.setStatus('offline');
            } else if (this.currentUser) {
                this.setStatus('syncing');
                // Reconnect listener
                this.startRealtimeListener(this.currentUser.uid);
            } else {
                this.setStatus('guest');
            }
        }

        // Status Management
        setStatus(status, errorMsg = null) {
            this.syncStatus = status;
            this.lastError = errorMsg;
            this.notifyStatusListeners(status, errorMsg);
        }

        computeHash(obj) {
            try {
                return JSON.stringify(obj);
            } catch (e) {
                return String(Date.now());
            }
        }

        // Subscriptions
        onStatusChange(fn) {
            this.listeners.status.push(fn);
            fn(this.syncStatus, this.lastError);
        }

        onAuthChange(fn) {
            this.listeners.auth.push(fn);
            fn(this.currentUser);
        }

        onRemoteDataReceived(fn) {
            this.listeners.remoteData.push(fn);
        }

        notifyStatusListeners(status, error) {
            this.listeners.status.forEach(fn => {
                try { fn(status, error); } catch (e) {}
            });
        }

        notifyAuthListeners(user) {
            this.listeners.auth.forEach(fn => {
                try { fn(user); } catch (e) {}
            });
        }

        notifyRemoteDataListeners(remoteBoards, updatedAt, isLiveUpdate = false) {
            this.listeners.remoteData.forEach(fn => {
                try { fn(remoteBoards, updatedAt, isLiveUpdate); } catch (e) {}
            });
        }
    }

    // Export singleton
    global.cloudSyncManager = new CloudSyncManager();

})(typeof window !== 'undefined' ? window : this);
