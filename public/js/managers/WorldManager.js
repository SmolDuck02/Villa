import { CONFIG, ANIMAL_DATA } from '../config.js';

export class WorldManager {
    constructor(game) {
        this.game = game;
        this.colliders = [];
        this.sceneryColliders = []; // Trees, rocks (hard obstacles)
        this.waterZones = [];       // Lakes (soft obstacles / zones)
        this.animals = [];
        this.villagers = [];
        this.collectables = [];
        this.floatingEffects = []; 
        
        // Rain System
        this.rainSystem = null;
        this.isRaining = false;
        
        this.initTerrain();
        this.initScenery();
        
        // Check for rain every 10 seconds
        setInterval(() => this.updateWeather(), 10000);
    }

    createSprite(emoji, scale, x, z) {
        const map = this.game.createEmojiTexture(emoji);
        const material = new THREE.SpriteMaterial({ map: map });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(scale, scale, 1);
        
        const shadowGeo = new THREE.CircleGeometry(scale * 0.3, 16);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 1;

        const group = new THREE.Group();
        group.add(sprite);
        group.add(shadow);
        group.position.set(x, 0, z);
        sprite.position.set(0, scale/2, 0); 
        
        this.game.scene.add(group);
        return { group, sprite };
    }
    
    createFloatingEmoji(emoji, x, y, z) {
        const map = this.game.createEmojiTexture(emoji, 64);
        const mat = new THREE.SpriteMaterial({ map: map });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(20, 20, 1);
        sprite.position.set(x, y, z);
        this.game.scene.add(sprite);
        
        let life = 0;
        const animate = () => {
            life += 0.02;
            sprite.position.y += 0.5;
            sprite.material.opacity = 1 - life;
            if (life < 1) requestAnimationFrame(animate);
            else this.game.scene.remove(sprite);
        };
        animate();
    }
    
    createStatusSprite(type) {
        const emoji = CONFIG.emojis[type];
        const map = this.game.createEmojiTexture(emoji, 64);
        const mat = new THREE.SpriteMaterial({ map: map });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(20, 20, 1);
        sprite.visible = false;
        return sprite;
    }

    initTerrain() {
        const groundGeo = new THREE.PlaneGeometry(CONFIG.worldSize, CONFIG.worldSize);
        const groundMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.grass });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.game.scene.add(ground);

        // Lakes (Registered as waterZones)
        this.createLake(-400, -400, 350); 
        this.createLake(500, 300, 100);
        
        // Fences (Removed fences that collided with the lake at -200, -200)
        this.createFence(-200, 200, 200, 200); 
        // this.createFence(-200, -40, -200, -200); // Removed: In Lake
        this.createFence(40, 200, -200, -200);   
        // this.createFence(-200, -200, -200, 200); // Removed: In Lake
        
        // Paths
        const path1Geo = new THREE.PlaneGeometry(30, 200);
        const pathMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.path });
        const path1 = new THREE.Mesh(path1Geo, pathMat);
        path1.position.set(0, 0.2, -275); 
        path1.rotation.x = -Math.PI / 2;
        this.game.scene.add(path1);

        const path2Geo = new THREE.PlaneGeometry(160, 30);
        const path2 = new THREE.Mesh(path2Geo, pathMat);
        path2.position.set(0, 0.2, -350); 
        path2.rotation.x = -Math.PI / 2;
        this.game.scene.add(path2);
        
        this.createHouse(80, -350);
        this.createPort(-80, -350, Math.PI / 2); 
        // Moved boat closer to shore/port (-140 -> -100)
        this.createBoat(-100, -350, Math.PI / 2);
    }
    
    initScenery() {
        // Rocks
        for(let i=0; i<30; i++) {
            const r = 200 + Math.random() * 600; 
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            
            // Check overlaps + check water
            if(this.checkGenerationOverlap(x, z, 50) && !this.isPointInWater(x, z)) {
                this.createRock(x, z, 20 + Math.random()*30);
            }
        }
        
        // Trees
        for (let i = 0; i < 120; i++) {
            const x = (Math.random() - 0.5) * CONFIG.worldSize;
            const z = (Math.random() - 0.5) * CONFIG.worldSize;
            
            // FIX: Ensure trees don't spawn in water
            if (this.checkGenerationOverlap(x, z, 30) && !this.isPointInWater(x, z)) {
                const isTree = Math.random() > 0.4;
                const emoji = isTree ? (Math.random() > 0.5 ? CONFIG.emojis.tree : CONFIG.emojis.pine) : CONFIG.emojis.flower;
                const scale = isTree ? 80 + Math.random() * 40 : 25;
                if(isTree) this.colliders.push({ type: 'tree', x: x, z: z, radius: 10 });
                else this.sceneryColliders.push({ type: 'flower', x: x, z: z, radius: 20 });
                this.createSprite(emoji, scale, x, z);
            }
        }
        this.spawnVillagers();
        this.spawnAnimals();
        this.spawnCollectables();
        this.createClouds();
    }
    
    createHouse(x, z) { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.BoxGeometry(80, 60, 80), new THREE.MeshStandardMaterial({color:0xf5f5dc})); w.position.y=30; g.add(w); const r = new THREE.Mesh(new THREE.ConeGeometry(70,40,4), new THREE.MeshStandardMaterial({color:0x8B4513})); r.position.y=80; r.rotation.y=Math.PI/4; g.add(r); g.position.set(x,0,z); this.game.scene.add(g); this.colliders.push({type:'house',x,z,radius:55}); }
    createPort(x, z, a) { const g = new THREE.Group(); const d = new THREE.Mesh(new THREE.BoxGeometry(40,2,100), new THREE.MeshStandardMaterial({color:0x8B4513})); d.position.y=0.5; g.add(d); g.position.set(x,0,z); g.rotation.y=a; this.game.scene.add(g); this.sceneryColliders.push({type:'port',x,z,radius:60}); }
    
    createBoat(x, z, r) { 
        const g = new THREE.Group(); 
        const h = new THREE.Mesh(new THREE.BoxGeometry(40,10,60), new THREE.MeshStandardMaterial({color:CONFIG.colors.boat})); 
        h.position.y=5; g.add(h); 
        g.position.set(x,0,z); g.rotation.y=r; 
        g.userData={type:'boat', originalY: 0}; 
        
        // Bobbing animation for boat
        g.update = () => {
            if (!this.game.isBoating) { // Only bob when player isn't controlling it
                g.position.y = Math.sin(Date.now() * 0.003) * 2;
            }
        };
        
        this.game.scene.add(g); 
        this.game.boat = g; // Register boat in game
    }
    
    createLake(x, z, r) { 
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,5,32), new THREE.MeshStandardMaterial({color:CONFIG.colors.water})); 
        m.position.set(x,-2,z); 
        this.game.scene.add(m); 
        // Important: Add to waterZones, NOT hard colliders
        this.waterZones.push({type:'water', x, z, radius:r}); 
    }
    
    createRock(x, z, s) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s), new THREE.MeshStandardMaterial({color:CONFIG.colors.rock})); m.position.set(x,s/2,z); this.game.scene.add(m); this.colliders.push({type:'rock',x,z,radius:s}); }
    createFence(x1, x2, z1, z2) { const m = new THREE.Mesh(new THREE.BoxGeometry(10,30,10), new THREE.MeshStandardMaterial({color:CONFIG.colors.fence})); m.position.set(x1,15,z1); this.game.scene.add(m); this.colliders.push({type:'fence',x:x1,z:z1,radius:8}); }

    spawnVillagers() {
        // Use safe spawn logic instead of hardcoded coordinates
        this.spawnSafeVillager('farmer', -150, 0);
        this.spawnSafeVillager('grandma', 180, -300);
        this.spawnSafeVillager('boy', 100, 50);
        this.spawnSafeVillager('girl', 100, 150);
    }
    
    // NEW: Tries to spawn a villager near x,z but checks for collisions first
    spawnSafeVillager(type, targetX, targetZ) {
        let x = targetX, z = targetZ;
        // Try up to 10 times to find a non-overlapping spot nearby
        for(let k=0; k<10; k++) {
            if(this.checkGenerationOverlap(x, z, 20) && !this.isPointInWater(x, z)) {
                break; // Found good spot
            }
            // Jitter position if collision found
            x = targetX + (Math.random() - 0.5) * 50;
            z = targetZ + (Math.random() - 0.5) * 50;
        }
        
        const obj = this.createSprite(CONFIG.emojis[type], 40, x, z);
        obj.group.userData = { type: 'villager', villagerType: type };
        obj.sprite.userData = { parentGroup: obj.group };
        this.colliders.push({ type: 'villager', x, z, radius: 15 });
        this.villagers.push(obj.group);
    }
    
    spawnAnimals() {
         const aquaticTypes = ['duck', 'frog', 'turtle'];
         const landTypes = Object.keys(ANIMAL_DATA).filter(t => !aquaticTypes.includes(t));

         for(let i=0; i<50; i++) {
             let x, z, valid=false;
             for(let k=0; k<10; k++) {
                 x=(Math.random()-0.5)*1400; 
                 z=(Math.random()-0.5)*1400;
                 if(this.checkGenerationOverlap(x,z,30)) { valid=true; break; }
             }
             if(valid) {
                 const inWater = this.isPointInWater(x, z);
                 
                 // If water, spawn aquatic. If land, spawn land animal.
                 const type = inWater 
                    ? aquaticTypes[Math.floor(Math.random() * aquaticTypes.length)]
                    : landTypes[Math.floor(Math.random() * landTypes.length)];
                 
                 this.spawnAnimalEntity(type, x, z, inWater);
             }
         }
    }
    
    spawnAnimalEntity(type, x, z, isAquatic) {
        const obj = this.createSprite(CONFIG.emojis[type], 35, x, z);
        const data = ANIMAL_DATA[type];
        obj.group.userData = { 
            type: 'animal', 
            animalType: type, 
            temperament: data.temperament, 
            state: 'idle', 
            hurtTimer: 0,
            isAquatic: isAquatic, // Flag for movement logic
            dx: 0, dz: 0
        };
        obj.sprite.userData = { parentGroup: obj.group };
        
        const fleeStatus = this.createStatusSprite('flee'); fleeStatus.position.y = 45; obj.group.add(fleeStatus);
        const attackStatus = this.createStatusSprite('attack'); attackStatus.position.y = 45; obj.group.add(attackStatus);
        obj.group.userData.statusSprites = { flee: fleeStatus, attack: attackStatus };

        obj.group.update = () => {
             const u = obj.group.userData;
             const playerPos = this.game.player ? this.game.player.position : new THREE.Vector3(0,1000,0);
             const dist = obj.group.position.distanceTo(playerPos);
             const distToSpawn = obj.group.position.distanceTo(new THREE.Vector3(0,0,0));
             
             u.statusSprites.flee.visible = false;
             u.statusSprites.attack.visible = false;

             if(Math.abs(obj.group.position.x) > 800 || Math.abs(obj.group.position.z) > 800) { 
                 // Reset if out of bounds
                 obj.group.position.set(0,0,0);
                 return; 
             }
             
             let speed = 0.5;
             let dx = 0, dz = 0;

             // Detection Logic
             let detectionMult = 1.0;
             if (this.game.moveState === 'run') detectionMult = 2.0; 
             else if (this.game.moveState === 'crouch') detectionMult = 0.4; 

             // AI States
             // 0. SAFE ZONE LOGIC (New)
             // If animal is aggressive and near spawn (0,0, -250 is roughly player start), force it to flee
             // Player start is 0, -250. Let's make a safe circle around it.
             const distToPlayerStart = obj.group.position.distanceTo(new THREE.Vector3(0, 0, -250));
             
             if (u.temperament === 'aggressive' && distToPlayerStart < 150) {
                 // Force flee from safe zone
                 u.statusSprites.flee.visible = true; // Show they are scared of safe zone
                 speed = 2.0;
                 const angle = Math.atan2(obj.group.position.z - (-250), obj.group.position.x - 0);
                 dx = Math.cos(angle);
                 dz = Math.sin(angle);
             }
             else if (u.hurtTimer > 0) {
                 u.hurtTimer--;
                 u.statusSprites.flee.visible = true;
                 speed = 4.0; 
                 const angle = Math.atan2(obj.group.position.z - playerPos.z, obj.group.position.x - playerPos.x);
                 dx = Math.cos(angle);
                 dz = Math.sin(angle);
             }
             else if (u.temperament === 'aggressive' && dist < (250 * detectionMult) && this.game.isJoined) {
                 u.statusSprites.attack.visible = true;
                 speed = 3.0; 
                 const angle = Math.atan2(playerPos.z - obj.group.position.z, playerPos.x - obj.group.position.x);
                 dx = Math.cos(angle);
                 dz = Math.sin(angle);
                 if (dist < 30) this.game.takeDamage();
             }
             else if (u.temperament === 'skittish' && dist < (150 * detectionMult) && this.game.isJoined) {
                 u.statusSprites.flee.visible = true;
                 speed = 3.5; 
                 const angle = Math.atan2(obj.group.position.z - playerPos.z, obj.group.position.x - playerPos.x);
                 dx = Math.cos(angle);
                 dz = Math.sin(angle);
             }
             else {
                 if (Math.random() < 0.02) { u.dx = (Math.random() - 0.5); u.dz = (Math.random() - 0.5); }
                 dx = u.dx || 0;
                 dz = u.dz || 0;
             }
             
             const nx = obj.group.position.x + dx * speed;
             const nz = obj.group.position.z + dz * speed;
             
             // --- TERRAIN LOGIC ---
             let canMove = true;
             
             // 1. Check hard collisions (fences, trees)
             if (this.checkCollision(nx, nz, 20)) canMove = false;
             
             // 2. Check Water Constraints
             const nextIsWater = this.isPointInWater(nx, nz);
             
             if (u.isAquatic) {
                 // Aquatic animals stay IN water
                 if (!nextIsWater) canMove = false; 
             } else {
                 // Land animals stay OUT of water (unless being aggressive/hurt, maybe?)
                 // Strict mode: Land animals never enter water idly
                 if (nextIsWater && u.state === 'idle' && u.hurtTimer === 0 && !u.statusSprites.attack.visible) {
                     canMove = false;
                     // Bounce back
                     u.dx = -u.dx; 
                     u.dz = -u.dz;
                 }
                 // If aggressive, they CAN enter water (swimming chase)
                 if (nextIsWater) {
                     // Visual bob for swimming
                     obj.group.position.y = Math.sin(Date.now() * 0.01) * 2 - 2;
                 } else {
                     obj.group.position.y = 0;
                 }
             }

             if (canMove) {
                 obj.group.position.x = nx;
                 obj.group.position.z = nz;
             }
        };
        
        this.animals.push(obj.group);
    }
    
    spawnCollectables() {
        for(let i=0; i<40; i++) {
             const x = (Math.random()-0.5)*1400; const z = (Math.random()-0.5)*1400;
             // Items only on land
             if(!this.isPointInWater(x, z) && this.checkGenerationOverlap(x, z, 10)) {
                 const item = Math.random()>0.5 ? 'apple' : 'flower_item';
                 const obj = this.createSprite(CONFIG.emojis[item], 20, x, z);
                 obj.group.position.y = 5;
                 obj.group.userData = { type: 'collectable', itemId: item };
                 obj.sprite.userData = { parentGroup: obj.group };
                 obj.group.update = () => { obj.group.position.y = 5 + Math.sin(Date.now() * 0.005) * 2; };
                 this.collectables.push(obj.group);
             }
        }
    }

    createClouds() {
        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * CONFIG.worldSize;
            const z = (Math.random() - 0.5) * CONFIG.worldSize;
            const y = 300 + Math.random() * 200;
            const s = 100 + Math.random() * 100;
            const map = this.game.createEmojiTexture(CONFIG.emojis.cloud, 128);
            const mat = new THREE.SpriteMaterial({ map: map, transparent: true, opacity: 0.7 });
            const sp = new THREE.Sprite(mat);
            sp.scale.set(s,s,1); sp.position.set(x,y,z);
            this.game.scene.add(sp);
        }
    }
    
    updateWeather() {
        if (Math.random() < 0.2) {
            this.isRaining = !this.isRaining;
            if (this.isRaining) {
                this.startRain();
                this.game.ui.showToast("It started raining!");
            } else {
                this.stopRain();
                this.game.ui.showToast("The rain stopped.");
            }
            
            // RAIN LOGIC: Hiding animals
            this.animals.forEach(anim => {
                const u = anim.userData;
                // Skittish animals hide in rain (unless aquatic)
                if (this.isRaining && u.temperament === 'skittish' && !u.isAquatic) {
                    anim.visible = false;
                } else {
                    anim.visible = true;
                }
            });
        }
    }

    startRain() {
        if (this.rainSystem) return;
        const rainCount = 1500;
        const rainGeo = new THREE.BufferGeometry();
        const rainPos = [];
        for(let i=0; i<rainCount; i++) {
            rainPos.push((Math.random()-0.5)*CONFIG.worldSize*1.5, Math.random()*400, (Math.random()-0.5)*CONFIG.worldSize*1.5);
        }
        rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(rainPos, 3));
        const rainMat = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 1.5, transparent: true, opacity: 0.6 });
        this.rainSystem = new THREE.Points(rainGeo, rainMat);
        this.game.scene.add(this.rainSystem);
        this.game.scene.background = new THREE.Color(0x506070);
        this.game.scene.fog.color = new THREE.Color(0x506070);
    }

    stopRain() {
        if (this.rainSystem) {
            this.game.scene.remove(this.rainSystem);
            this.rainSystem.geometry.dispose();
            this.rainSystem.material.dispose();
            this.rainSystem = null;
        }
        this.game.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.game.scene.fog.color = new THREE.Color(CONFIG.colors.sky);
    }
    
    updateRain() {
        if (!this.rainSystem) return;
        const positions = this.rainSystem.geometry.attributes.position.array;
        for(let i=1; i<positions.length; i+=3) {
            positions[i] -= 4; 
            if (positions[i] < 0) positions[i] = 400;
        }
        this.rainSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Helper: Check if a point is inside any water zone
    isPointInWater(x, z) {
        for(let w of this.waterZones) {
            const dist = Math.sqrt((x-w.x)**2 + (z-w.z)**2);
            if(dist < w.radius) return true;
        }
        return false;
    }

    checkGenerationOverlap(x, z, r) { 
        if (this.checkCollision(x, z, r)) return false; 
        for(let s of this.sceneryColliders) { 
            const d = Math.sqrt((x-s.x)**2 + (z-s.z)**2); 
            if(d < (s.radius + r)) return false; 
        } 
        if (this.checkPathOverlap(x, z, r)) return false; 
        // Note: We don't check water here because we WANT overlaps for aquatic spawns
        return true; 
    }
    
    checkPathOverlap(x, z, p) { if (x > -15-p && x < 15+p && z > -375-p && z < -175+p) return true; if (x > -80-p && x < 80+p && z > -365-p && z < -335+p) return true; return false; }
    
    checkCollision(x, z, r) { 
        for(let c of this.colliders) { 
            const d = Math.sqrt((x-c.x)**2 + (z-c.z)**2); 
            if(d < (c.radius + r)) return c; 
        } 
        return null; 
    }
}