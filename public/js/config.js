export const USER_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB08cbhz70iS1seJOfRWkiKQMKeFh2WtYw",
    authDomain: "villa-5b3c0.firebaseapp.com",
    projectId: "villa-5b3c0",
    storageBucket: "villa-5b3c0.firebasestorage.app",
    messagingSenderId: "666633719020",
    appId: "1:666633719020:web:df1570c4bea10cfb3669c9",
    measurementId: "G-KHBRVW3NHZ"
  }; 
  
  export const CONFIG = {
      worldSize: 1600,
      colors: {
          sky: 0x87CEEB,
          grass: 0x8fb358,
          grassDark: 0x769446,
          path: 0xd4b483,
          water: 0x4FB0E8,
          rock: 0x888888,
          fence: 0x8B4513,
          boat: 0x8B4513
      },
      emojis: {
          player: '🧙‍♂️',
          farmer: '👨‍🌾', grandma: '👵', boy: '👦', girl: '👧',
          cow: '🐄', pig: '🐖', chicken: '🐓', dog: '🐕', cat: '🐈',
          horse: '🐎', sheep: '🐑', goat: '🐐', duck: '🦆', rabbit: '🐇', mouse: '🐁',
          deer: '🦌', fox: '🦊', wolf: '🐺', bear: '🐻', squirrel: '🐿️', raccoon: '🦝',
          owl: '🦉', frog: '🐸', turtle: '🐢', eagle: '🦅',
          lion: '🦁', tiger: '🐅', elephant: '🐘', zebra: '🦓', giraffe: '🦒',
          monkey: '🐒', panda: '🐼', kangaroo: '🦘', koala: '🐨',
          tree: '🌳', pine: '🌲', flower: '🌻', mushroom: '🍄', rock: '🪨', cloud: '☁️',
          flee: '💨', attack: '💢', heart: '❤️', happy: '✨',
          // ITEMS
          apple: '🍎', carrot: '🥕', corn: '🌽', fish: '🐟', seed: '🌱', flower_item: '🌼'
      },
      avatars: ['🧙‍♂️', '👨‍🌾', '👵', '👦', '👧', '🦁', '🦊', '🐼', '🐺', '🐸']
  };
  
  export const ITEM_DATA = {
      apple: { name: "Red Apple", desc: "A sweet treat. Loved by Horses, Pigs, and Elephants.", type: 'food' },
      carrot: { name: "Carrot", desc: "Crunchy vegetable. Rabbits, Goats, and Zebras love these.", type: 'food' },
      corn: { name: "Corn", desc: "Golden grains. Favorites of Chickens, Cows, and Sheep.", type: 'food' },
      fish: { name: "Fresh Fish", desc: "Caught from the lake. Cats, Bears, Foxes, and Lions love it.", type: 'food' },
      seed: { name: "Seeds", desc: "Small seeds. Ducks, Squirrels, and Kangaroos enjoy them.", type: 'food' },
      flower_item: { name: "Wild Flower", desc: "Beautiful bloom. Turtles, Pandas, Giraffes, and Koalas like them.", type: 'gift' }
  };
  
  export const VILLAGER_DATA = {
      farmer: { name: "Farmer Joe", lines: ["A seed today becomes a tree tomorrow.", "Have you fed the cows?", "Corn is gold around here."] },
      grandma: { name: "Grandma May", lines: ["Such a lovely day.", "Would you like some pie?", "Be careful near the woods."] },
      boy: { name: "Timmy", lines: ["I want to see a wolf!", "Do you have any shiny rocks?", "Race you to the lake!"] },
      girl: { name: "Sarah", lines: ["Flowers make me happy.", "Have you seen the butterflies?", "The forest is magical."] }
  };
  
  export const ANIMAL_DATA = {
      cow: { name: "Daisy the Cow", temperament: "passive", likes: ['corn', 'apple'], imageKeyword: "cow", native: "Global", population: "1.5 Billion", discovered: "~10,500 yrs ago", ancestor: "Aurochs", family: "Bovidae", lifestyle: "Diurnal herd animals.", habits: "Chewing cud.", facts: ["Cows have best friends.", "4 stomachs.", "Dream lying down."], society: "Agriculture cornerstone." },
      pig: { name: "Porkchop the Pig", temperament: "passive", likes: ['apple', 'carrot'], imageKeyword: "pig", native: "Eurasia", population: "1 Billion", discovered: "13,000 BC", ancestor: "Wild Boar", family: "Suidae", lifestyle: "Social.", habits: "Wallows in mud.", facts: ["Smarter than dogs.", "Don't sweat.", "20 sounds."], society: "Intelligent pets." },
      chicken: { name: "Cluck the Chicken", temperament: "passive", likes: ['seed', 'corn'], imageKeyword: "chicken", native: "SE Asia", population: "33 Billion", discovered: "8,000 yrs ago", ancestor: "Red Junglefowl", family: "Phasianidae", lifestyle: "Flocks.", habits: "Dust bathing.", facts: ["Relative to T-Rex.", "Dream in color.", "Talk to eggs."], society: "Food security." },
      dog: { name: "Barnaby the Dog", temperament: "passive", likes: ['fish'], imageKeyword: "dog", native: "Global", population: "900 Million", discovered: "20,000 yrs ago", ancestor: "Gray Wolf", family: "Canidae", lifestyle: "Pack animals.", habits: "Circles before sleeping.", facts: ["Unique nose print.", "Smell feelings.", "First domesticated."], society: "Man's best friend." },
      cat: { name: "Luna the Cat", temperament: "passive", likes: ['fish'], imageKeyword: "cat", native: "Near East", population: "600 Million", discovered: "7,500 BC", ancestor: "African Wildcat", family: "Felidae", lifestyle: "Crepuscular.", habits: "Kneading.", facts: ["Sleeps 70% of life.", "Purr heals bones.", "Meow for humans."], society: "Internet stars." },
      horse: { name: "Spirit the Horse", temperament: "passive", likes: ['apple', 'carrot'], imageKeyword: "horse", native: "Eurasia", population: "60 Million", discovered: "3,500 BC", ancestor: "Eohippus", family: "Equidae", lifestyle: "Herds.", habits: "Sleep standing up.", facts: ["Sleep standing up.", "360 vision.", "Ear communication."], society: "Transport." },
      sheep: { name: "Woolly the Sheep", temperament: "passive", likes: ['corn'], imageKeyword: "sheep", native: "Europe/Asia", population: "1.2 Billion", discovered: "11,000 BC", ancestor: "Mouflon", family: "Bovidae", lifestyle: "Flocking.", habits: "Rectangular pupils.", facts: ["Rectangular pupils.", "Remember faces.", "Self-medicate."], society: "Wool." },
      goat: { name: "Billy the Goat", temperament: "passive", likes: ['corn', 'carrot'], imageKeyword: "goat", native: "SW Asia", population: "1 Billion", discovered: "10k years ago", ancestor: "Bezoar Ibex", family: "Bovidae", lifestyle: "Curious.", habits: "Climbing.", facts: ["Discovered coffee.", "Climbs trees.", "Accents."], society: "Eco-mowers." },
      duck: { name: "Quackers the Duck", temperament: "passive", likes: ['seed'], imageKeyword: "duck", native: "Worldwide", population: "Unknown", discovered: "25m years", ancestor: "Waterfowl", family: "Anatidae", lifestyle: "Aquatic.", habits: "Preening.", facts: ["Waterproof.", "3 eyelids.", "Females quack."], society: "Wetlands." },
      rabbit: { name: "Thumper the Rabbit", temperament: "skittish", likes: ['carrot'], imageKeyword: "rabbit", native: "Global", population: "700 Million", discovered: "600 AD", ancestor: "European Rabbit", family: "Leporidae", lifestyle: "Crepuscular.", habits: "Binkying.", facts: ["Teeth grow forever.", "Jumps 3ft.", "Ears regulate heat."], society: "Popular pets." },
      deer: { name: "Bambi the Deer", temperament: "skittish", likes: ['apple'], imageKeyword: "deer", native: "Global", population: "Stable", discovered: "30m years ago", ancestor: "Syndyoceras", family: "Cervidae", lifestyle: "Browsers.", habits: "Tail flick.", facts: ["Sheds antlers.", "Fast runner.", "Night vision."], society: "Forest symbol." },
      fox: { name: "Rusty the Fox", temperament: "skittish", likes: ['fish'], imageKeyword: "fox", native: "Northern Hemisphere", population: "Widespread", discovered: "10m years ago", ancestor: "Vulpes riffautae", family: "Canidae", lifestyle: "Solitary.", habits: "Caches food.", facts: ["Magnetic hunting.", "Leg whiskers.", "Warm tail."], society: "Folklore." },
      wolf: { name: "Alpha the Wolf", temperament: "aggressive", likes: ['fish'], imageKeyword: "wolf", native: "North America", population: "300k", discovered: "800k years ago", ancestor: "Canis etruscus", family: "Canidae", lifestyle: "Packs.", habits: "Howling.", facts: ["Howls to pack.", "Devoted parents.", "Strong bite."], society: "Keystone species." },
      bear: { name: "Baloo the Bear", temperament: "aggressive", likes: ['fish', 'apple'], imageKeyword: "bear", native: "Northern Hemisphere", population: "200k", discovered: "30m years ago", ancestor: "Ursavus", family: "Ursidae", lifestyle: "Solitary.", habits: "Hibernation.", facts: ["Great smell.", "Hibernates.", "Intelligent."], society: "Strength symbol." },
      squirrel: { name: "Nutty the Squirrel", temperament: "skittish", likes: ['seed'], imageKeyword: "squirrel", native: "Global", population: "Abundant", discovered: "36m years ago", ancestor: "Douglassciurus", family: "Sciuridae", lifestyle: "Arboreal.", habits: "Hoarding.", facts: ["Plants trees.", "Teeth grow.", "Rotate ankles."], society: "City dwellers." },
      frog: { name: "Hoppy the Frog", temperament: "passive", likes: ['seed'], imageKeyword: "frog", native: "Worldwide", population: "Declining", discovered: "250m years ago", ancestor: "Triadobatrachus", family: "Anura", lifestyle: "Amphibious.", habits: "Absorb water.", facts: ["Drink via skin.", "Freeze solid.", "Eat shed skin."], society: "Bio-indicators." },
      turtle: { name: "Sheldon the Turtle", temperament: "passive", likes: ['flower_item'], imageKeyword: "turtle", native: "Worldwide", population: "Endangered", discovered: "220m years ago", ancestor: "Odontochelys", family: "Testudines", lifestyle: "Reptile.", habits: "Basking.", facts: ["Shell is bone.", "Live 100+ years.", "No teeth."], society: "Longevity." },
      lion: { name: "Simba the Lion", temperament: "aggressive", likes: ['fish'], imageKeyword: "lion", native: "Africa", population: "20k", discovered: "1m years ago", ancestor: "Panthera leo", family: "Felidae", lifestyle: "Prides.", habits: "Sleep 20h.", facts: ["Loud roar.", "Females hunt.", "Social cats."], society: "King of beasts." },
      elephant: { name: "Dumbo the Elephant", temperament: "passive", likes: ['apple'], imageKeyword: "elephant", native: "Africa/Asia", population: "400k", discovered: "5m years ago", ancestor: "Mastodon", family: "Elephantidae", lifestyle: "Matriarchal.", habits: "Trunk use.", facts: ["Largest land animal.", "Good memory.", "Infrasound."], society: "Ecosystem engineers." },
      giraffe: { name: "Melman the Giraffe", temperament: "passive", likes: ['flower_item'], imageKeyword: "giraffe", native: "Africa", population: "117k", discovered: "1m years ago", ancestor: "Samotherium", family: "Giraffidae", lifestyle: "Towers.", habits: "Hum at night.", facts: ["Purple tongue.", "Short sleep.", "Unique spots."], society: "Tallest animal." },
      panda: { name: "Po the Panda", temperament: "passive", likes: ['flower_item'], imageKeyword: "giant panda", native: "China", population: "1800", discovered: "1869", ancestor: "Kretzoiarctos", family: "Ursidae", lifestyle: "Solitary.", habits: "Handstands.", facts: ["Eats bamboo.", "Tiny cubs.", "False thumb."], society: "Conservation icon." },
      monkey: { name: "George the Monkey", temperament: "skittish", likes: ['apple'], imageKeyword: "monkey", native: "Tropics", population: "Varies", discovered: "60m years ago", ancestor: "Simiiformes", family: "Primates", lifestyle: "Social.", habits: "Tools.", facts: ["Peels bananas.", "Fingerprints.", "Expressions."], society: "Close relatives." },
      zebra: { name: "Marty the Zebra", temperament: "skittish", likes: ['carrot'], imageKeyword: "zebra", native: "Africa", population: "500k", discovered: "4m years ago", ancestor: "Equids", family: "Equidae", lifestyle: "Herds.", habits: "Defense.", facts: ["Unique stripes.", "Black skin.", "Zig-zag run."], society: "Migration icon." },
      kangaroo: { name: "Jack the Kangaroo", temperament: "skittish", likes: ['seed'], imageKeyword: "kangaroo", native: "Australia", population: "50m", discovered: "15m years ago", ancestor: "Macropodidae", family: "Macropodidae", lifestyle: "Mobs.", habits: "Licking.", facts: ["Forward only.", "Tiny baby.", "Fast hop."], society: "Aus symbol." },
      koala: { name: "Koko the Koala", temperament: "passive", likes: ['flower_item'], imageKeyword: "koala", native: "Australia", population: "300k", discovered: "1816", ancestor: "Diprotodon", family: "Phascolarctidae", lifestyle: "Solitary.", habits: "Tree hugging.", facts: ["Fingerprints.", "Sleeps 20h.", "Toxic diet."], society: "Conservation icon." }
  };