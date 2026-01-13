import { CONFIG, ITEM_DATA, ANIMAL_DATA } from '../config.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.isInventoryOpen = false;
        this.isAlmanacOpen = false;
        
        // Event Listeners
        const sensBtn = document.getElementById('sens-toggle');
        if(sensBtn) sensBtn.onclick = () => this.toggleSensitivity();
        
        const closeDiag = document.getElementById('close-dialogue');
        if(closeDiag) closeDiag.onclick = () => this.closeDialogue();
        
        const openAlm = document.getElementById('open-almanac');
        if(openAlm) openAlm.onclick = () => this.openAlmanac();
        
        const closeAlm = document.getElementById('close-almanac');
        if(closeAlm) closeAlm.onclick = () => { document.getElementById('almanac-modal').style.display = 'none'; this.isAlmanacOpen = false; };
        
        const openInv = document.getElementById('open-inventory');
        if(openInv) openInv.onclick = () => this.toggleInventory();
        
        const closeInv = document.getElementById('close-inventory');
        if(closeInv) closeInv.onclick = () => this.toggleInventory();
        
        const startBtn = document.getElementById('start-game-btn');
        if(startBtn) startBtn.onclick = () => this.handleLogin();

        this.populateCharGrid();
        
        // Init Hotbar
        this.updateHotbarUI();
    }

    populateCharGrid() {
        const grid = document.getElementById('char-grid');
        if(!grid) return;
        CONFIG.avatars.forEach((emoji, index) => {
            const div = document.createElement('div');
            div.className = 'char-option' + (index === 0 ? ' selected' : '');
            div.textContent = emoji;
            div.onclick = () => {
                document.querySelectorAll('.char-option').forEach(e => e.classList.remove('selected'));
                div.classList.add('selected');
                this.game.playerAvatar = emoji;
            };
            grid.appendChild(div);
        });
    }

    handleLogin() {
        const nameInput = document.getElementById('username-input');
        const name = nameInput.value.trim().substring(0, 12) || "Player";
        document.getElementById('login-overlay').style.display = 'none';
        document.querySelector('.ui-layer').style.display = 'flex';
        this.game.startGame(name);
    }

    isAnyOpen() { return this.isInventoryOpen || this.isAlmanacOpen || this.game.chatOpen; }

    toggleInventory() {
        this.isInventoryOpen = !this.isInventoryOpen;
        const modal = document.getElementById('inventory-modal');
        modal.style.display = this.isInventoryOpen ? 'flex' : 'none';
        // Always refresh UI when opening
        if(this.isInventoryOpen) this.updateInventoryUI();
    }
    
    // Call this whenever inventory changes (pickup, use, etc.)
    refreshAll() {
        if(this.isInventoryOpen) this.updateInventoryUI();
        this.updateHotbarUI();
    }

    updateInventoryUI() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        
        // Guide Button
        const guideBtn = document.createElement('button');
        guideBtn.textContent = "📖 Item Guide";
        guideBtn.style.width = "100%";
        guideBtn.style.padding = "8px";
        guideBtn.style.marginBottom = "15px";
        guideBtn.style.background = "rgba(255,255,255,0.1)";
        guideBtn.style.border = "1px solid rgba(255,255,255,0.2)";
        guideBtn.style.color = "white";
        guideBtn.style.borderRadius = "8px";
        guideBtn.style.cursor = "pointer";
        guideBtn.onclick = () => this.toggleItemGuide(grid); 
        grid.appendChild(guideBtn);
        
        // Container for items (Vertical List)
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'inv-list-container'; // Changed from grid to list wrapper
        grid.appendChild(itemsContainer);

        const items = Object.keys(this.game.inventory);
        
        if (items.length === 0) {
            itemsContainer.innerHTML = '<div style="text-align:center; padding:20px; color:rgba(255,255,255,0.5); font-style:italic;">Backpack is empty.<br>Explore the world to find items!</div>';
            return;
        }

        items.forEach(id => {
            const count = this.game.inventory[id];
            if (count > 0) {
                const data = ITEM_DATA[id] || { name: id, desc: "" };
                const row = document.createElement('div');
                row.className = 'inv-item-row'; // New class for horizontal row style
                
                if (this.game.heldItem === id) {
                    row.classList.add('equipped');
                }

                // New Layout: Icon | Details | Count
                row.innerHTML = `
                    <div class="inv-icon-large">${CONFIG.emojis[id] || '❓'}</div>
                    <div class="inv-details">
                        <div class="inv-name">${data.name}</div>
                        <div class="inv-desc">${data.desc}</div>
                    </div>
                    <div class="inv-count-badge">x${count}</div>
                `;
                
                row.onclick = () => {
                    // Toggle selection
                    this.game.heldItem = (this.game.heldItem === id) ? null : id;
                    this.showToast(this.game.heldItem ? `Equipped: ${data.name}` : "Unequipped");
                    this.refreshAll(); // Update UI
                };
                itemsContainer.appendChild(row);
            }
        });
    }
    
    toggleItemGuide(container) {
        container.innerHTML = '';
        
        const backBtn = document.createElement('button');
        backBtn.textContent = "⬅ Back to Inventory";
        backBtn.style.width = "100%";
        backBtn.style.padding = "8px";
        backBtn.style.marginBottom = "15px";
        backBtn.style.background = "rgba(255,255,255,0.1)";
        backBtn.style.border = "1px solid rgba(255,255,255,0.2)";
        backBtn.style.color = "white";
        backBtn.style.borderRadius = "8px";
        backBtn.style.cursor = "pointer";
        backBtn.onclick = () => this.updateInventoryUI();
        container.appendChild(backBtn);
        
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '10px';
        
        Object.entries(ITEM_DATA).forEach(([key, data]) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.background = 'rgba(0,0,0,0.3)';
            itemDiv.style.padding = '10px';
            itemDiv.style.borderRadius = '8px';
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '15px';
            itemDiv.style.border = '1px solid rgba(255,255,255,0.1)';
            
            itemDiv.innerHTML = `
                <div style="font-size:30px;">${CONFIG.emojis[key] || '❓'}</div>
                <div>
                    <div style="font-weight:bold; color:#ffd700;">${data.name}</div>
                    <div style="font-size:12px; color:#ccc;">${data.desc}</div>
                </div>
            `;
            list.appendChild(itemDiv);
        });
        container.appendChild(list);
    }

    updateHotbarUI() {
        const hotbar = document.getElementById('hotbar');
        if(!hotbar) return;
        hotbar.innerHTML = '';
        
        const items = Object.keys(this.game.inventory);
        
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.dataset.key = i + 1;
            
            const itemId = items[i];
            
            if (itemId && this.game.inventory[itemId] > 0) {
                const count = this.game.inventory[itemId];
                slot.innerHTML = `
                    <div style="font-size:24px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.5));">${CONFIG.emojis[itemId]}</div>
                    <div class="slot-count">${count}</div>
                `;
                
                slot.onclick = () => this.selectHotbarSlot(i);
                
                if (this.game.heldItem === itemId) {
                    slot.classList.add('selected');
                }
            } else {
                slot.style.opacity = '0.3';
                slot.style.cursor = 'default';
            }
            
            hotbar.appendChild(slot);
        }
    }
    
    selectHotbarSlot(index) {
        const items = Object.keys(this.game.inventory);
        if (index < items.length) {
            const itemId = items[index];
            this.game.heldItem = (this.game.heldItem === itemId) ? null : itemId;
            
            const name = ITEM_DATA[itemId] ? ITEM_DATA[itemId].name : itemId;
            this.showToast(this.game.heldItem ? `Equipped: ${name}` : "Unequipped");
            
            this.refreshAll();
        }
    }

    openAlmanac() {
        this.isAlmanacOpen = true;
        const modal = document.getElementById('almanac-modal');
        const grid = document.getElementById('almanac-grid');
        const details = document.getElementById('almanac-details');
        modal.style.display = 'flex';
        grid.innerHTML = '';
        
        details.innerHTML = '<div class="placeholder-text">Select an unlocked animal to view details.</div>';

        Object.keys(ANIMAL_DATA).forEach(type => {
            const isUnlocked = this.game.unlockedAnimals.has(type);
            const slot = document.createElement('div');
            slot.className = `animal-slot ${isUnlocked ? '' : 'locked'}`;
            const icon = document.createElement('span');
            icon.textContent = CONFIG.emojis[type] || '❓';
            slot.appendChild(icon);
            if (isUnlocked) {
                slot.onclick = () => {
                    document.querySelectorAll('.animal-slot').forEach(s => s.classList.remove('active'));
                    slot.classList.add('active');
                    this.showAlmanacDetails(type, details);
                };
            }
            grid.appendChild(slot);
        });
    }

    showAlmanacDetails(type, container) {
        const data = ANIMAL_DATA[type];
        const lockId = this.game.getStringHash(type);
        const searchTerm = data.imageKeyword || type;
        const imageUrl = `https://loremflickr.com/600/350/${searchTerm}?lock=${lockId}`;
        
        container.innerHTML = `
            <img src="${imageUrl}" class="detail-banner" alt="${data.name} Sketch">
            <div class="detail-header"><div class="detail-emoji">${CONFIG.emojis[type]}</div><div><div class="detail-title">${data.name}</div><div style="color: #888;">Discovered</div></div></div>
            <div class="stats-grid"><div class="stat-item"><strong>Native</strong>${data.native || 'Unknown'}</div><div class="stat-item"><strong>Population</strong>${data.population || 'Unknown'}</div></div>
            <div class="detail-text" style="margin-top:10px;">${data.facts[0]}</div>
            <div class="detail-text" style="margin-top:10px;"><strong>Likes:</strong> ${(data.likes || []).map(l => ITEM_DATA[l]?.name || l).join(', ')}</div>
        `;
    }

    showToast(msg) {
        const toast = document.getElementById('toast');
        if(!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    closeDialogue() {
        document.getElementById('dialogue-overlay').style.display = 'none';
        this.game.isDialogueOpen = false;
    }

    openChat() {
        const container = document.getElementById('chat-container');
        if(container) container.style.display = 'block';
        
        const input = document.getElementById('chat-input');
        if(input) {
            this.game.chatOpen = true;
            setTimeout(() => input.focus(), 50);
        }
    }
    
    addChatLog(name, msg) {
        const history = document.getElementById('chat-history');
        if (!history) return;
        
        const el = document.createElement('div');
        el.className = 'chat-msg';
        el.innerHTML = `<strong style="color:#ffd700">${name}:</strong> ${msg}`;
        history.appendChild(el);
        history.scrollTop = history.scrollHeight;
    }

    submitChat() {
        const input = document.getElementById('chat-input');
        if(!input) return;
        
        const msg = input.value.trim();
        if(msg) {
            this.game.network.sendChat(msg);
            this.addChatLog("Me", msg); 
        }
        input.value = '';
        input.blur();
        
        const container = document.getElementById('chat-container');
        if(container) container.style.display = 'none';
        
        this.game.chatOpen = false;
    }
    
    toggleSensitivity() {
        this.game.sensitivityIndex = (this.game.sensitivityIndex + 1) % 3;
        document.getElementById('sens-toggle').innerText = this.game.sensitivityLabels[this.game.sensitivityIndex];
        this.showToast(`Sensitivity: ${['Low', 'Medium', 'High'][this.game.sensitivityIndex]}`);
    }
}