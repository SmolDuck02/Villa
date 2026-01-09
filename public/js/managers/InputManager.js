export class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.isRotating = false;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('mousedown', (e) => { if(e.button===1) { this.isRotating = true; e.preventDefault(); } });
        window.addEventListener('mouseup', (e) => { if(e.button===1) this.isRotating = false; });
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('wheel', (e) => this.onWheel(e));
        window.addEventListener('click', (e) => this.game.onClick(e));
        window.addEventListener('resize', () => this.game.onWindowResize());
    }

    onKeyDown(e) {
        if (this.game.chatOpen) {
            if (e.code === 'Enter') this.game.ui.submitChat();
            return;
        }
        this.keys[e.code] = true;
        
        // HOTBAR KEYS 1-9
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            this.game.ui.selectHotbarSlot(index);
        }

        if (e.key === 'Shift') this.game.isRunning = true;
        if (e.key === 'Control' || e.code === 'KeyC') this.game.isCrouching = true;
        if (e.code === 'KeyI') this.game.ui.toggleInventory();
        if (e.code === 'Space') this.game.onSpacePressed();
        if (e.code === 'Enter') this.game.ui.openChat();
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
        if (e.key === 'Shift') this.game.isRunning = false;
        if (e.key === 'Control' || e.code === 'KeyC') this.game.isCrouching = false;
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        if (this.game.ui.isAnyOpen()) return;
        
        if (this.isRotating || this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD']) {
            const sensitivity = this.game.sensitivityValues[this.game.sensitivityIndex];
            this.game.cameraAngle -= e.movementX * sensitivity;
            this.game.cameraPitch += e.movementY * sensitivity; 
            this.game.cameraPitch = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.game.cameraPitch));
        }
    }

    onWheel(e) {
        if (this.game.ui.isAnyOpen()) return;
        this.game.orbitRadius += e.deltaY * 0.5;
        this.game.orbitRadius = Math.max(50, Math.min(600, this.game.orbitRadius));
    }
}