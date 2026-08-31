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
                    return JSON.parse(saved);
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
                return this.init();
            } catch (e) {
                console.error('Failed to save cloud config:', e);
                throw e;
            }
        }

        clearConfig() {
            localStorage.removeItem(DEFAULT_CONFIG_STORAGE_KEY);
            if (this.auth) {
                this.auth.signOut().catch(() => {});
            }
            this.app = null;
            this.auth = null;
            this.db = null;
            this.currentUser = null;
            this.setStatus('guest');
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
                // Initialize or retrieve app
                if (!firebase.apps || firebase.apps.length === 0) {
                    this.app = firebase.initializeApp(config);
                } else {
                    this.app = firebase.app();
                }

                this.auth = firebase.auth();
                this.db = firebase.firestore();

                // Enable Firestore offline persistence if available
                try {
                    this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
                        if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
                            // Persistence already enabled or multiple tabs
                        }
                    });
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

                return true;
            } catch (err) {
                console.error('Firebase init error:', err);
                this.setStatus('error', err.message);
                return false;
            }
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
                if (err.code === 'auth/popup-blocked' || err.code === 'auth/unauthorized-domain') {
                    // Fallback to redirect if popup is blocked
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

            try {
                const docRef = this.db.collection('users').doc(uid).collection('data').doc('workspaces');

                this.unsubscribeSnapshot = docRef.onSnapshot(
                    doc => {
                        if (!doc.exists) {
                            this.setStatus('synced');
                            return;
                        }

                        const data = doc.data();
                        if (!data || !data.boards) {
                            this.setStatus('synced');
                            return;
                        }

                        // Check if this update came from another client
                        const remoteHash = this.computeHash(data.boards);
                        if (remoteHash !== this.lastSyncedHash) {
                            this.lastSyncedHash = remoteHash;
                            this.lastCloudUpdatedAt = data.updatedAt;
                            this.notifyRemoteDataListeners(data.boards, data.updatedAt);
                        }

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

        // Push local boards to cloud (Debounced)
        pushLocalStateToCloud(boards, delayMs = 600) {
            if (!this.currentUser || !this.db) return;

            if (this.pushTimer) {
                clearTimeout(this.pushTimer);
            }

            this.pushTimer = setTimeout(() => {
                this.executePush(boards);
            }, delayMs);
        }

        async executePush(boards) {
            if (!this.currentUser || !this.db || this.isPushing) return;
            if (!navigator.onLine) {
                this.setStatus('offline');
                return;
            }

            // Ensure every board has columns before saving to cloud
            if (boards && typeof boards === 'object') {
                Object.keys(boards).forEach(k => {
                    if (boards[k] && (!boards[k].columns || !Array.isArray(boards[k].columns) || boards[k].columns.length === 0)) {
                        boards[k].columns = ["To Do", "In Progress", "Done"];
                    }
                });
            }

            const currentHash = this.computeHash(boards);
            if (currentHash === this.lastSyncedHash) {
                this.setStatus('synced');
                return;
            }

            this.isPushing = true;
            this.setStatus('syncing');

            try {
                const uid = this.currentUser.uid;
                const docRef = this.db.collection('users').doc(uid).collection('data').doc('workspaces');

                const payload = {
                    boards: boards,
                    updatedAt: new Date().toISOString(),
                    clientVersion: '3.0.2',
                    userId: uid,
                    email: this.currentUser.email || ''
                };

                await docRef.set(payload, { merge: true });
                this.lastSyncedHash = currentHash;
                this.lastCloudUpdatedAt = payload.updatedAt;
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

        notifyRemoteDataListeners(remoteBoards, updatedAt) {
            this.listeners.remoteData.forEach(fn => {
                try { fn(remoteBoards, updatedAt); } catch (e) {}
            });
        }
    }

    // Export singleton
    global.cloudSyncManager = new CloudSyncManager();

})(typeof window !== 'undefined' ? window : this);
