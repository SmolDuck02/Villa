// FIX: Correct import path to same directory
import { CONFIG, VILLAGER_DATA, ANIMAL_DATA, ITEM_DATA } from './config.js';
import { UIManager } from './managers/UIManager.js';
import { InputManager } from './managers/InputManager.js';
import { WorldManager } from './managers/WorldManager.js';
import { NetworkManager } from './managers/NetworkManager.js';

export class Game3D {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.colors.sky);
        this.scene.fog = new THREE.Fog(CONFIG.colors.sky, 400, 1500);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
        this.camera.position.set(0, 300, 300);
        this.cameraAngle = 0;
        this.cameraPitch = 0.6;
        this.orbitRadius = 250; 

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // State
        this.player = null;
        this.playerName = "Player";
        this.playerAvatar = CONFIG.emojis.player; // Default
        this.isJoined = false;
        this.boat = null;
        this.isBoating = false;
        
        // Movement & Physics Flags
        this.isRunning = false;
        this.isCrouching = false;
        this.isFalling = false;
        this.fallStartTime = 0;
        
        this.isDialogueOpen = false;
        this.chatOpen = false;
        
        this.inventory = {};
        this.heldItem = null; // Track held item
        this.unlockedAnimals = new Set();
        this.health = 3;
        this.lastDamageTime = 0;
        this.moveState = 'walk';
        
        this.sensitivityIndex = 1;
        this.sensitivityValues = [0.004, 0.012, 0.024];
        this.sensitivityLabels = ["Sens: Low", "Sens: Med", "Sens: High"];

        // Init Managers
        this.ui = new UIManager(this);
        this.input = new InputManager(this);
        this.world = new WorldManager(this);
        this.network = new NetworkManager(this);
        
        this.initLights();
        
        this.animate = this.animate.bind(this);
        this.animate();
    }
    
    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 0.7);
        dir.position.set(300, 500, 200);
        dir.castShadow = true;
        this.scene.add(dir);
    }
    
    startGame(name) {
        this.playerName = name;
        this.isJoined = true;
        this.createLocalPlayer();
        this.network.init(); 
    }
    
    createLocalPlayer() {
        const pObj = this.world.createSprite(this.playerAvatar, 40, 0, -250);
        this.player = pObj.group;
        pObj.sprite.center.set(0.5, 0.5);
        
        // Add name tag
        const tag = this.createNameTag(this.playerName);
        tag.position.y = 65;
        this.player.add(tag);
        
        this.createChatBubble(this.player);
    }
    
    createNameTag(text) {
        const canvas = document.createElement('canvas'); canvas.width=256; canvas.height=64;
        const ctx = canvas.getContext('2d');
        ctx.font = "Bold 24px Arial"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.shadowColor="black"; ctx.shadowBlur=4; ctx.fillStyle="white";
        ctx.fillText(text, 128, 32);
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({map:tex});
        const sp = new THREE.Sprite(mat); sp.scale.set(80,20,1);
        return sp;
    }
    
    createChatBubble(parent) {
        const canvas = document.createElement('canvas'); canvas.width=256; canvas.height=64;
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({map:tex, visible:false});
        const sp = new THREE.Sprite(mat); sp.scale.set(80,20,1); sp.position.y=50;
        parent.add(sp);
    }
    
    showChatBubble(mesh, text) {
        const bubble = mesh.children.find(c => c.position.y===50 && c.material && c.material.map && c.material.map.image.width===256);
        if(!bubble) return;
        
        const ctx = bubble.material.map.image.getContext('2d');
        ctx.clearRect(0,0,256,64);
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(10,10,236,44,10); ctx.fill();
        ctx.fillStyle='white'; ctx.font='20px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(text, 128, 32);
        
        bubble.material.map.needsUpdate = true;
        bubble.visible = true;
        setTimeout(()=> bubble.visible=false, 4000);
    }

    createEmojiTexture(emoji, size=128) {
        const c = document.createElement('canvas'); c.width=size; c.height=size;
        const ctx = c.getContext('2d'); ctx.font=`${size*0.8}px Segoe UI Emoji, Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(emoji, size/2, size/2+size*0.1);
        const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t;
    }

    onSpacePressed() {
        if (this.isDialogueOpen) {
            this.ui.closeDialogue();
            return;
        }
        
        if (this.isBoating && this.boat) {
            this.attemptDismount();
            return;
        }

        let hit=false;
        this.world.animals.forEach(g => {
            if(g.position.distanceTo(this.player.position) < 80) {
                g.userData.hurtTimer=300; 
                g.position.y+=10; setTimeout(()=>g.position.y-=10, 100);
                this.world.createFloatingEmoji('💢', g.position.x, g.position.y+40, g.position.z);
                hit=true;
            }
        });
        
        if(hit) this.ui.showToast("Hit!");
    }
    
    attemptDismount() {
        const x = this.boat.position.x;
        const z = this.boat.position.z;
        
        let landFound = false;
        let landingPos = {x:0, z:0};
        
        // Scan around the boat for a valid land spot
        const angles = [0, Math.PI/2, Math.PI, -Math.PI/2, Math.PI/4, -Math.PI/4, 3*Math.PI/4, -3*Math.PI/4];
        for (let a of angles) {
            let tx = x + Math.cos(a) * 60;
            let tz = z + Math.sin(a) * 60;
            // Valid spot = NOT in water AND NOT a hard collision (rock/tree)
            if (!this.world.isPointInWater(tx, tz) && !this.world.checkCollision(tx, tz, 10)) {
                landFound = true;
                landingPos = {x: tx, z: tz};
                break;
            }
        }

        if (landFound) {
            this.isBoating = false;
            // Detach player from boat
            this.scene.add(this.player); 
            this.player.position.set(landingPos.x, 0, landingPos.z);
            this.player.rotation.set(0, 0, 0);
            this.player.scale.set(1, 1, 1);
            this.player.visible = true; 
            
            this.ui.showToast("Dismounted!");
        } else {
            this.ui.showToast("Water too deep! Go closer to shore.");
        }
    }
    
    takeDamage() {
        if (!this.isJoined || Date.now() - this.lastDamageTime < 1000) return;
        this.lastDamageTime = Date.now();
        this.health--;
        
        let hearts = "";
        for(let i=0; i<3; i++) hearts += (i < this.health ? "❤️" : "🖤");
        const el = document.getElementById('health-display');
        if(el) el.innerText = hearts;
        
        this.ui.showToast("Ouch! Taking damage!");
        this.world.createFloatingEmoji('💥', this.player.position.x, this.player.position.y+40, this.player.position.z);
        this.player.position.z += 40; 

        if (this.health <= 0) {
            this.ui.showToast("You fainted! Respawning...");
            this.player.position.set(0, 0, -250);
            this.health = 3;
            if(el) el.innerText = "❤️❤️❤️";
        }
    }

    getStringHash(str) { let h=0; for(let i=0;i<str.length;i++) h = Math.imul(31,h)+str.charCodeAt(i)|0; return Math.abs(h); }

    onClick(e) {
        if(this.ui.isAnyOpen()) return;
        
        this.input.mouse.x = (e.clientX/window.innerWidth)*2-1;
        this.input.mouse.y = -(e.clientY/window.innerHeight)*2+1;
        this.input.raycaster.setFromCamera(this.input.mouse, this.camera);
        const intersects = this.input.raycaster.intersectObjects(this.scene.children, true);
        
        if(intersects.length > 0) {
            // Boat Interaction
            const boatHit = intersects.find(i => i.object.parent && i.object.parent.userData.type === 'boat');
            if (boatHit) {
                const boat = boatHit.object.parent;
                if (this.isBoating) {
                    this.attemptDismount();
                } else {
                    if (this.player.position.distanceTo(boat.position) < 150) {
                        this.isBoating = true;
                        this.boat = boat;
                        // ATTACH
                        this.boat.add(this.player);
                        this.player.position.set(0, 10, 0); 
                        this.player.rotation.set(0, 0, 0); 
                        this.player.scale.set(0.8, 0.8, 0.8);
                        this.ui.showToast("You boarded the boat!");
                    } else {
                        this.ui.showToast("Too far from boat!");
                    }
                }
                return;
            }

            // Collectables
            const item = intersects.find(i => i.object.userData?.parentGroup?.userData.type === 'collectable');
            if(item) {
                const g = item.object.userData.parentGroup;
                if(this.player.position.distanceTo(g.position)<100) {
                    this.scene.remove(g);
                    this.addToInventory(g.userData.itemId);
                } else this.ui.showToast("Too far!");
                return;
            }
            
            // Interaction
            const ent = intersects.find(i => {
                 const g = i.object.userData?.parentGroup;
                 return g && (g.userData.type==='animal' || g.userData.type==='villager');
            });
            
            if(ent) {
                const g = ent.object.userData.parentGroup;
                const distLimit = this.isBoating ? 400 : 300;
                
                if(this.player.position.distanceTo(g.position) < distLimit || (this.isBoating && this.boat.position.distanceTo(g.position) < distLimit)) {
                     if (this.heldItem) {
                        if (g.userData.type === 'animal') this.giveItemToAnimal(g, this.heldItem);
                        else if (g.userData.type === 'villager') this.giveItemToVillager(g, this.heldItem);
                        return; 
                     }

                     if(g.userData.type==='animal') {
                         if(g.userData.state!=='idle') {
                             this.ui.showToast("It's busy/agitated!");
                         } else {
                             this.unlockedAnimals.add(g.userData.animalType);
                             this.ui.showToast(`Discovered: ${CONFIG.emojis[g.userData.animalType]}`);
                             this.showAnimalDialogue(g.userData.animalType);
                         }
                     } else {
                         this.showVillagerDialogue(g.userData.villagerType);
                     }
                } else this.ui.showToast("Get closer!");
            }
        }
    }
    
    // Inventory & Interaction methods (Simplified for brevity as they haven't changed much)
    addToInventory(itemId, amount = 1) {
        if (!this.inventory[itemId]) this.inventory[itemId] = 0;
        this.inventory[itemId] += amount;
        this.ui.showToast(`Picked up ${ITEM_DATA[itemId]?.name || itemId}`);
        this.ui.refreshAll();
    }

    consumeItem(itemId) {
        if (this.inventory[itemId] > 0) {
            this.inventory[itemId]--;
            if (this.inventory[itemId] <= 0) {
                delete this.inventory[itemId];
                this.heldItem = null;
            }
            this.ui.refreshAll();
        }
    }
    
    giveItemToAnimal(group, itemId) {
        const type = group.userData.animalType;
        const data = ANIMAL_DATA[type];
        this.consumeItem(itemId);
        if (data.likes && data.likes.includes(itemId)) {
            this.world.createFloatingEmoji(CONFIG.emojis.heart, group.position.x, group.position.y + 40, group.position.z);
            this.ui.showToast(`The ${type} loves it!`);
            this.unlockedAnimals.add(type);
        } else {
            this.world.createFloatingEmoji('❓', group.position.x, group.position.y + 40, group.position.z);
            this.ui.showToast(`The ${type} doesn't seem interested.`);
        }
    }

    giveItemToVillager(group, itemId) {
        const type = group.userData.villagerType;
        this.consumeItem(itemId);
        this.world.createFloatingEmoji(CONFIG.emojis.happy, group.position.x, group.position.y + 50, group.position.z);
        this.ui.showToast(`${VILLAGER_DATA[type].name}: "Oh! A ${ITEM_DATA[itemId].name}! Thank you!"`);
    }

    showVillagerDialogue(type) {
        const v = VILLAGER_DATA[type];
        document.getElementById('speaker-name').innerText = v.name;
        document.getElementById('dialogue-text').innerText = v.lines[Math.floor(Math.random()*v.lines.length)];
        document.getElementById('dialogue-overlay').style.display='flex';
        this.isDialogueOpen = true;
    }

    showAnimalDialogue(type) {
        const animal = ANIMAL_DATA[type];
        if (!animal) return;
        const fact = animal.facts[Math.floor(Math.random() * animal.facts.length)];
        document.getElementById('speaker-name').innerText = `${CONFIG.emojis[type]} ${animal.name}`;
        document.getElementById('dialogue-text').innerText = fact;
        document.getElementById('dialogue-overlay').style.display = 'flex';
        this.isDialogueOpen = true;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updatePlayer() {
        if (!this.isJoined) {
            this.cameraAngle += 0.002;
            this.updateCamera();
            return;
        }

        // --- FALLING LOGIC ---
        // If not boating, check world bounds for falling
        if (!this.isBoating && !this.isFalling) {
            if (Math.abs(this.player.position.x) > 800 || Math.abs(this.player.position.z) > 800) {
                this.isFalling = true;
                this.fallStartTime = Date.now();
                this.ui.showToast("Falling!");
            }
        }

        if (this.isFalling) {
            this.player.position.y -= 2.0; 
            this.player.rotation.z += 0.2; 
            this.updateCamera();
            if (Date.now() - this.fallStartTime > 3000) {
                this.isFalling = false;
                this.player.position.set(0, 0, -250);
                this.player.rotation.set(0, 0, 0);
                this.ui.showToast("Respawned!");
            }
            return; 
        }

        if (this.ui.isAnyOpen()) return;

        // Move State
        if (this.isRunning) this.moveState = 'run';
        else if (this.isCrouching) this.moveState = 'crouch';
        else this.moveState = 'walk';
        
        const indicator = document.getElementById('stance-display');
        if(indicator) indicator.innerText = this.isBoating ? 'BOATING' : this.moveState.toUpperCase();

        let speed = 4; 
        if (this.isBoating) speed = 8; 
        else if (this.moveState === 'run') speed = 8; 
        else if (this.moveState === 'crouch') speed = 2;
        
        const sin = Math.sin(this.cameraAngle); const cos = Math.cos(this.cameraAngle);
        let iz=0, ix=0;
        if(this.input.keys['KeyW'] || this.input.keys['ArrowUp']) iz=1; 
        if(this.input.keys['KeyS'] || this.input.keys['ArrowDown']) iz=-1;
        if(this.input.keys['KeyA'] || this.input.keys['ArrowLeft']) ix=-1; 
        if(this.input.keys['KeyD'] || this.input.keys['ArrowRight']) ix=1;
        
        if(ix!==0 || iz!==0) {
            let mx = (iz*-sin) + (ix*cos); let mz = (iz*-cos) + (ix*-sin);
            const len = Math.sqrt(mx*mx + mz*mz); 
            if(len>0) { mx=(mx/len)*speed; mz=(mz/len)*speed; }
            
            // Calculate NEXT position based on whether we are boating or walking
            const entity = this.isBoating ? this.boat : this.player;
            const nx = entity.position.x + mx; 
            const nz = entity.position.z + mz;
            
            let canMove = true;
            
            // --- COLLISION CHECKS ---
            if (this.isBoating) {
                // BOAT LOGIC:
                // 1. Must stay in water (isPointInWater == true)
                // 2. Must not hit hard obstacles (checkCollision == null)
                // 3. Must stay within world bounds (abs(x,z) < 800)
                
                const inWater = this.world.isPointInWater(nx, nz);
                const hitObstacle = this.world.checkCollision(nx, nz, 10);
                const inBounds = Math.abs(nx) < 800 && Math.abs(nz) < 800;

                if (!inWater || hitObstacle || !inBounds) {
                    canMove = false;
                    // Stop completely at the edge/obstacle, do NOT push back violently
                }
            } else {
                // PLAYER LOGIC:
                // 1. Must not hit hard obstacles
                // 2. Must not walk into water
                
                if(this.world.checkCollision(nx, nz, 5)) canMove = false;
                
                // Rim fix: If trying to walk INTO water, stop.
                if(this.world.isPointInWater(nx, nz)) {
                    canMove = false;
                }
            }
            
            if(canMove) {
                entity.position.x = nx;
                entity.position.z = nz;
            }
            
            // Update rotation for boat only
            if (this.isBoating) {
                this.boat.rotation.y = Math.atan2(mx, mz);
            }
            
            this.network.syncPosition();
        }
        
        if (!this.isBoating) {
            if (this.moveState === 'crouch') { 
                this.player.scale.y = 0.7; 
                this.player.position.y = -5; 
            } else { 
                this.player.scale.y = 1; 
                this.player.position.y = 0; 
            }
        }
        
        this.updateCamera();
    }
    
    updateCamera() {
        const yOff = Math.sin(this.cameraPitch) * this.orbitRadius;
        const hDist = Math.cos(this.cameraPitch) * this.orbitRadius;
        // If boating, target the boat
        const target = this.isBoating ? this.boat : this.player;
        // Careful: if player is child of boat, player.position is relative. 
        // We should always target the entity's WORLD position.
        const center = new THREE.Vector3();
        if (target) target.getWorldPosition(center);
        else center.set(0,0,0);
        
        const tx = center.x + Math.sin(this.cameraAngle) * hDist;
        const tz = center.z + Math.cos(this.cameraAngle) * hDist;
        const ty = center.y + yOff;
        
        this.camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.1);
        this.camera.lookAt(center.x, center.y + 20, center.z);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.updatePlayer();
        if (this.boat && this.boat.update) this.boat.update(); 
        this.world.animals.forEach(a => a.update && a.update());
        this.world.collectables.forEach(c => c.update && c.update());
        this.world.updateRain();
        
        for(const pid in this.network.remotePlayers) {
            const rp = this.network.remotePlayers[pid];
            rp.mesh.position.lerp(rp.targetPos, 0.1);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}