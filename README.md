# 🐾 Animal Village 3D: MMO Edition

A browser-based 3D multiplayer online game where players explore a vibrant animal village, complete quests, collect animals, and interact with other players in real-time.

![Animal Village 3D](https://img.shields.io/badge/status-active-success)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎮 Gameplay
- **3D Open World**: Explore a colorful 3D village environment with dynamic lighting and shadows
- **Multiple Characters**: Play as various animals with unique appearances
- **Quest System**: Complete engaging quests and track your progress
- **Multiplayer**: See other players in real-time with online player count
- **Combat System**: Engage in battles with health tracking and combat mechanics

### 📚 Collection & Progression
- **Animal Almanac**: Collect and catalog different animals you encounter
- **Inventory System**: Manage your items and resources
- **Character Progression**: Level up and unlock new content

### 💬 Social Features
- **Real-time Chat**: Communicate with other players using the in-game chat
- **Online Presence**: See how many players are currently online
- **Multiplayer Interactions**: Interact with other players in the shared world

### 🎨 Technical Features
- **3D Graphics**: Powered by Three.js for smooth 3D rendering
- **Responsive Design**: Works on desktop and mobile devices
- **Touch Controls**: Mobile-friendly touch and joystick controls
- **Smooth Animations**: Character movement with smooth transitions and physics

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- (Optional) Node.js and npm for local development
- (Optional) Firebase CLI for deployment

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vil.git
   cd vil
   ```

2. **Open the game**
   
   **Option 1: Using Firebase Local Emulator (Recommended)**
   ```bash
   # Install Firebase CLI if you haven't already
   npm install -g firebase-tools
   
   # Serve locally on port 5000
   firebase serve --only hosting
   ```
   Then open `http://localhost:5000` in your browser.

   **Option 2: Direct file access**
   Simply open `public/index.html` in your web browser:
   ```bash
   # On Windows
   start public/index.html
   
   # On macOS
   open public/index.html
   
   # On Linux
   xdg-open public/index.html
   ```

   **Option 3: Other local servers**
   ```bash
   # Using Python 3
   cd public
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server public -p 8000
   ```
   
   Then open `http://localhost:8000` in your browser.

### Firebase Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not already done)**
   ```bash
   firebase init
   ```

4. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy
   ```

## 🎮 Controls

### Desktop Controls
- **WASD** or **Arrow Keys**: Move your character
- **Mouse**: Look around / Rotate camera
- **Click**: Interact with objects and NPCs
- **Enter**: Open chat
- **ESC**: Close modals/dialogs
- **Tab**: Toggle inventory (if applicable)

### Mobile Controls
- **Virtual Joystick**: Move your character (appears on screen)
- **Touch & Drag**: Look around
- **Tap**: Interact with objects and NPCs
- **On-screen Buttons**: Access inventory, almanac, and other features

### Additional Controls
- **Sensitivity Button**: Adjust mouse/camera sensitivity
- **Stance Indicator**: Shows current player state

## 🏗️ Project Structure

```
vil/
├── public/
│   ├── index.html          # Main game page (primary version)
│   └── cop.html            # Alternative game version
├── firebase.json           # Firebase hosting configuration
├── package.json            # Project metadata
├── LICENSE                 # MIT License
└── README.md              # This file
```

## 🛠️ Technologies Used

- **[Three.js](https://threejs.org/)** (r128) - 3D graphics and rendering
- **Firebase Hosting** - Web hosting and deployment
- **HTML5** - Game structure
- **CSS3** - Styling and animations
- **JavaScript** - Game logic and interactions

## 🎯 Game Features

### Character System
- Multiple playable animal characters
- Smooth character movement and animations
- Health system with visual indicators
- Character customization options

### World & Environment
- Procedurally generated village layout
- Various buildings and structures
- Interactive NPCs
- Dynamic day/night cycle elements

### Quest System
- Story-driven quests
- Progress tracking
- Quest rewards
- Multiple quest lines

### Collection System
- Animal almanac with unlockable entries
- Inventory management
- Resource gathering
- Achievement tracking

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Jameel Marco C. Ursonal**

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Hosted on [Firebase](https://firebase.google.com/)
- Inspired by classic life simulation and MMO games

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

**Enjoy playing Animal Village 3D! 🎮🐾**

