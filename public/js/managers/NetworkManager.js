import { initializeApp, deleteApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, setPersistence, inMemoryPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { USER_FIREBASE_CONFIG, CONFIG } from '../config.js';

export class NetworkManager {
    constructor(game) {
        this.game = game;
        this.db = null;
        this.auth = null;
        this.userId = null;
        this.isOffline = false;
        this.remotePlayers = {};
        this.lastPosUpdate = 0;
        this.appId = 'animal-village-global';

        // Run cleanup every 5 seconds
        setInterval(() => this.cleanupStalePlayers(), 5000); 
    }

    async init() {
        // No longer waiting for window.firebaseApp
        
        let firebaseConfig = USER_FIREBASE_CONFIG;
        
        // Fallback logic
        if (!firebaseConfig) {
            try {
                if (typeof __firebase_config !== 'undefined') {
                    firebaseConfig = JSON.parse(__firebase_config);
                }
            } catch (e) { }
        }
        
        // VALIDATION
        if (!firebaseConfig || !firebaseConfig.apiKey) {
            this.startOfflineMode("No Config Found");
            return;
        }

        console.log("[MMO] Initializing with config...", firebaseConfig.projectId);

        try {
            // 1. HARD RESET: Delete ALL existing apps to prevent duplicates
            const apps = getApps();
            if (apps.length > 0) {
                await Promise.all(apps.map(app => deleteApp(app)));
            }

            // 2. INITIALIZE FRESH APP 
            const uniqueAppName = `AnimalVillage_${Date.now()}`;
            const app = initializeApp(firebaseConfig, uniqueAppName);

            this.auth = getAuth(app);
            
            // Crucial: Set persistence to memory so sessions don't leak
            await setPersistence(this.auth, inMemoryPersistence);

            this.db = getFirestore(app);

            // 3. AUTHENTICATE
            await signInAnonymously(this.auth);

            if (!this.auth.currentUser) throw new Error("Auth failed: No user");
            
            this.userId = this.auth.currentUser.uid;
            this.isOffline = false;
            console.log("[MMO] Connected as:", this.userId);
            this.game.ui.showToast("Connected to Server!");
            
            // 4. START LISTENERS
            // Use a specific collection path for the game world
            const playersRef = collection(this.db, 'artifacts', this.appId, 'public', 'data', 'players');
            
            onSnapshot(playersRef, (snapshot) => this.onPlayerUpdate(snapshot), (error) => {
                console.warn("[MMO] Snapshot Error:", error.message);
            });

            // Cleanup on close
            window.addEventListener('beforeunload', () => {
                if(this.db && this.userId) {
                    const pRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'players', this.userId);
                    deleteDoc(pRef).catch(()=>{});
                }
            });

            // Start syncing position immediately
            this.syncPosition(true);
            setInterval(() => this.syncPosition(false), 100); // 10 ticks per second

        } catch (e) {
            console.error("[MMO] CRITICAL ERROR:", e);
            this.startOfflineMode("Connection Failed");
        }
    }

    onPlayerUpdate(snapshot) {
        // NOTE: We update the counter at the end of this function or in the game loop 
        // to reflect actual active players, not just DB entries.
        
        snapshot.docChanges().forEach((change) => {
            const pid = change.doc.id;
            if (pid === this.userId) return; // Ignore self
            
            const data = change.doc.data();
            
            if (change.type === "added") this.addRemotePlayer(pid, data);
            if (change.type === "modified") this.updateRemotePlayer(pid, data);
            if (change.type === "removed") this.removeRemotePlayer(pid);
        });
        
        this.updateOnlineCounter();
    }

    addRemotePlayer(id, data) {
        if (this.remotePlayers[id]) this.removeRemotePlayer(id);

        const avatar = data.avatar || CONFIG.emojis.player;
        const spriteObj = this.game.world.createSprite(avatar, 40, data.x, data.z);
        
        if (data.username) {
            const nameTag = this.game.createNameTag(data.username);
            nameTag.position.y = 65;
            spriteObj.group.add(nameTag);
        }
        
        this.game.createChatBubble(spriteObj.group);

        this.remotePlayers[id] = {
            mesh: spriteObj.group,
            targetPos: new THREE.Vector3(data.x, data.y || 0, data.z),
            lastUpdate: Date.now(), // Local timestamp of when WE last heard from them
            serverTimestamp: data.lastUpdate ? (data.lastUpdate.toMillis ? data.lastUpdate.toMillis() : Date.now()) : Date.now(),
            lastMsgTime: 0,
            avatar: avatar // Store avatar to check for changes
        };
    }

    updateRemotePlayer(id, data) {
        let rp = this.remotePlayers[id];
        
        if (!rp) {
            this.addRemotePlayer(id, data);
            return;
        }

        if (data.avatar && data.avatar !== rp.avatar) {
            this.removeRemotePlayer(id);
            this.addRemotePlayer(id, data);
            return;
        }

        rp.targetPos.set(data.x, data.y || 0, data.z);
        rp.lastUpdate = Date.now(); // We heard from them just now
        if (data.lastUpdate) rp.serverTimestamp = data.lastUpdate.toMillis ? data.lastUpdate.toMillis() : Date.now();
        
        if(data.msg && data.msgId > (rp.lastMsgTime || 0)) {
            rp.lastMsgTime = data.msgId;
            this.game.showChatBubble(rp.mesh, data.msg);
            this.game.ui.addChatLog(data.username || "Player", data.msg);
        }
    }

    removeRemotePlayer(id) {
        if (this.remotePlayers[id]) {
            this.game.scene.remove(this.remotePlayers[id].mesh);
            delete this.remotePlayers[id];
            this.updateOnlineCounter();
        }
    }

    cleanupStalePlayers() {
        if (!this.db) return;
        const now = Date.now();
        const STALE_THRESHOLD = 10000; // 10 seconds locally = visual remove
        const DELETE_THRESHOLD = 30000; // 30 seconds = delete from DB

        Object.keys(this.remotePlayers).forEach(pid => {
            const rp = this.remotePlayers[pid];
            
            // 1. Visual Cleanup
            if (now - rp.lastUpdate > STALE_THRESHOLD) {
                console.log(`[MMO] Hiding stale player: ${pid}`);
                this.removeRemotePlayer(pid);
                
                // 2. Database Cleanup (Garbage Collection)
                // Only try to delete if it's REALLY old to avoid fighting
                // Use the server timestamp for this check if possible
                const serverAge = now - (rp.serverTimestamp || 0);
                if (serverAge > DELETE_THRESHOLD) {
                     console.log(`[MMO] Deleting zombie player from DB: ${pid}`);
                     const pRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'players', pid);
                     deleteDoc(pRef).catch(()=>{});
                }
            }
        });
        
        this.updateOnlineCounter();
    }
    
    updateOnlineCounter() {
        const countEl = document.getElementById('online-count');
        // Count self (1) + active remote players
        const count = 1 + Object.keys(this.remotePlayers).length;
        if(countEl) countEl.innerHTML = `<span class="status-dot" style="background-color:#2ecc71"></span>Online: ${count}`;
    }

    syncPosition(force = false) {
        if (!this.userId || !this.db || this.isOffline || !this.game.isJoined) return;
        
        const now = Date.now();
        // Send update if forced OR 100ms has passed
        if (force || (now - this.lastPosUpdate > 100)) {
            this.lastPosUpdate = now;
            
            const pRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'players', this.userId);
            
            // Send essential data + serverTimestamp for heartbeat
            setDoc(pRef, {
                x: this.game.player.position.x,
                y: this.game.player.position.y,
                z: this.game.player.position.z,
                username: this.game.playerName,
                avatar: this.game.playerAvatar, 
                lastUpdate: serverTimestamp() 
            }, { merge: true }).catch(err => { });
        }
    }
    
    sendChat(msg) {
        if(!this.userId || !this.db) return;
        const pRef = doc(this.db, 'artifacts', this.appId, 'public', 'data', 'players', this.userId);
        setDoc(pRef, { msg: msg, msgId: Date.now() }, { merge: true });
    }

    startOfflineMode(reason = "Offline") {
        if (this.isOffline) return;
        this.isOffline = true;
        const countEl = document.getElementById('online-count');
        if (countEl) countEl.innerHTML = `<span class="status-dot" style="background-color:#e74c3c"></span>${reason}`;
        this.game.ui.showToast(reason);
    }
}