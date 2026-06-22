// --- Global State ---
let bananaCount = 0;
let currentFactIndex = 0;
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

// --- Data ---
const characters = {
    kevin: { name: "Kevin", description: "Der Anführer. Groß, verantwortungsbewusst und immer bereit für ein Abenteuer.", trait: "Mutig", quote: "Bello! Kevin da boss!", avatar: "kevin.png" },
    stuart: { name: "Stuart", description: "Der Rebell. Liebt Musik, seine Ukulele und ist immer für einen Scherz zu haben.", trait: "Musikalisch", quote: "La-la-la! Music time!", avatar: "stuart.png" },
    bob: { name: "Bob", description: "Der Süße. Klein, unschuldig und liebt seinen Teddybär Tim über alles.", trait: "Liebenswert", quote: "Bob love banana! And Tim!", avatar: "bob.png" },
    gru: { name: "Gru", description: "Der Boss. Ehemals Superschurke, jetzt liebevoller Vater und Anführer der Minions.", trait: "Genial", quote: "Light bulb! I have an idea!", avatar: "gru.png" },
};

const minionSounds = {
    "Bello!": "bello.mp3",
    "Poopaye!": "poopaye.mp3",
    "Banana!": "banana.mp3",
    "Bee-do": "bee-do.mp3",
    "Haha!": "haha.mp3",
    "Whaaat?": "what.mp3",
};

const minionFacts = [
    { icon: "🤓", text: "Die Minions sprechen 'Minionese', eine Mischung aus vielen echten Sprachen." },
    { icon: "🍌", text: "Minions sind genetisch darauf programmiert, Bananen zu lieben." },
    { icon: "👁️", text: "Es gibt Minions mit einem oder zwei Augen, aber niemals mit drei." },
    { icon: "🎬", text: "Die Minions waren ursprünglich nur Nebencharaktere, wurden aber zu Stars." },
    { icon: "🧬", text: "Minions existieren seit Anbeginn der Zeit und haben schon Dinosauriern gedient." },
];

const galleryItems = [
    { id: 'lab', title: "Labor-Chaos", description: "Wenn die Minions versuchen, bei der Arbeit zu 'helfen'.", image: "lab.jpg" },
    { id: 'party', title: "Bananen-Party", description: "Die ultimative Feier mit der Lieblingsfrucht aller.", image: "party.jpg" },
    { id: 'band', title: "Minion Rockband", description: "Stuart und seine Freunde rocken die Bühne.", image: "band.jpg" },
    { id: 'superhero', title: "Super-Minions", description: "Bereit, die Welt zu retten... oder zumindest für Chaos zu sorgen.", image: "superhero.jpg" },
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    populateCharacters();
    populateSoundboard();
    populateGallery();
    populateFacts();
    setMinionOfTheDay();
    startMemoryGame();
    setupEventListeners();
    animateHeroMinions();
    startBananaRain();

    const logo = document.getElementById('logo');
    const bananaSound = new Audio('banana.mp3');
    logo.addEventListener('click', () => {
        bananaSound.play();
    });
});

// --- Population Functions ---
function populateCharacters() {
    const grid = document.querySelector('.character-grid');
    grid.innerHTML = Object.keys(characters).map(key => {
        const char = characters[key];
        return `
            <div class="character-card" onclick="showCharacterInfo('${key}')">
                <div class="character-avatar" style="background-image: url('${char.avatar}')"></div>
                <h3>${char.name}</h3>
                <p>${char.description.split('.')[0]}.</p>
            </div>
        `;
    }).join('');
}

function populateSoundboard() {
    const grid = document.getElementById('soundboard-grid');
    grid.innerHTML = Object.keys(minionSounds).map(sound => `
        <button class="sound-button" onclick="playSound('${minionSounds[sound]}')">${sound}</button>
    `).join('');
}

function populateGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = galleryItems.map(item => `
        <div class="gallery-item" onclick="openModal('${item.id}')">
            <img src="${item.image}" alt="${item.title}">
            <div class="overlay"><h3>${item.title}</h3></div>
        </div>
    `).join('');
}

function populateFacts() {
    const container = document.getElementById('fact-card-container');
    container.innerHTML = minionFacts.map(fact => `
        <div class="fact-card">
            <div class="fact-icon">${fact.icon}</div>
            <p>${fact.text}</p>
        </div>
    `).join('');
    showFact(0);
}

// --- Core Functionality ---

// Minion of the Day
function setMinionOfTheDay() {
    const today = new Date().getDay();
    const minionKeys = Object.keys(characters);
    const motdKey = minionKeys[today % minionKeys.length];
    const motd = characters[motdKey];

    document.getElementById('motd-avatar').style.backgroundImage = `url('${motd.avatar}')`;
    document.getElementById('motd-name').textContent = motd.name;
    document.getElementById('motd-description').textContent = motd.description;
    document.getElementById('motd-trait').textContent = `Eigenschaft: ${motd.trait}`;
    document.getElementById('motd-quote').textContent = `Zitat: "${motd.quote}"`;
}

// Banana Clicker Game
function clickBanana() {
    bananaCount++;
    document.getElementById('banana-count').textContent = bananaCount;
    createFloatingText('+1', document.querySelector('.banana-click'));
    if (bananaCount % 25 === 0) {
        triggerConfetti();
        showNotification(`🍌 Wow! ${bananaCount} Bananen! 🍌`);
    }
}

// Minion Translator
function translateToMinion() {
    const input = document.getElementById('human-text').value;
    const resultDiv = document.getElementById('minion-result');
    const words = input.toLowerCase().split(' ');
    const minionDictionary = { "hallo": "bello", "banane": "banana", "danke": "tank yu", "ich": "me", "liebe": "tiamo" };
    const translation = words.map(word => minionDictionary[word] || 'babo').join(' ') + '!';
    resultDiv.textContent = translation;
}

// Memory Game
function startMemoryGame() {
    const symbols = ['🍌', '👁️', '💙', '💛', '🎵', '🎯', '🎉', '⭐'];
    memoryCards = [...symbols, ...symbols];
    shuffleArray(memoryCards);

    const gameContainer = document.getElementById('memory-game');
    gameContainer.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;

    memoryCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.innerHTML = `<div class="card-face card-front">?</div><div class="card-face card-back">${symbol}</div>`;
        card.addEventListener('click', () => flipCard(card));
        gameContainer.appendChild(card);
    });
}

function flipCard(card) {
    if (card.classList.contains('flipped') || flippedCards.length >= 2) return;
    card.classList.add('flipped');
    flippedCards.push(card);
    if (flippedCards.length === 2) setTimeout(checkMatch, 1000);
}

function checkMatch() {
    const [firstCard, secondCard] = flippedCards;
    const firstSymbol = memoryCards[firstCard.dataset.index];
    const secondSymbol = memoryCards[secondCard.dataset.index];

    if (firstSymbol === secondSymbol) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedPairs++;
        if (matchedPairs === 8) showNotification('🎉 Memory-Meister!');
    } else {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
    }
    flippedCards = [];
}

// Facts Carousel
function nextFact() {
    currentFactIndex = (currentFactIndex + 1) % minionFacts.length;
    showFact(currentFactIndex);
}

function previousFact() {
    currentFactIndex = (currentFactIndex - 1 + minionFacts.length) % minionFacts.length;
    showFact(currentFactIndex);
}

function showFact(index) {
    const container = document.getElementById('fact-card-container');
    container.style.transform = `translateX(-${index * 100}%)`;
}

// --- UI & Effects ---

// Modal
function openModal(id) {
    const item = galleryItems.find(i => i.id === id) || characters[id];
    if (!item) return;

    const modal = document.getElementById('gallery-modal');
    document.getElementById('modal-image-container').innerHTML = `<img src="${item.image || item.avatar}" alt="${item.title || item.name}">`;
    document.getElementById('modal-title').textContent = item.title || item.name;
    document.getElementById('modal-description').textContent = item.description;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('gallery-modal').style.display = 'none';
}

// Animations
function animateHeroMinions() {
    const container = document.querySelector('.hero-minions');
    for (let i = 0; i < 5; i++) {
        const minion = document.createElement('div');
        minion.className = 'animated-minion';
        minion.style.left = `${Math.random() * 90}%`;
        minion.style.animationDuration = `${Math.random() * 5 + 5}s`;
        container.appendChild(minion);
    }
}

function startBananaRain() {
    const container = document.getElementById('banana-rain');

    window.addEventListener('scroll', () => {
        for (let i = 0; i < 5; i++) {
            const banana = document.createElement('div');
            banana.className = 'banana';
            banana.textContent = '🍌';
            banana.style.left = `${Math.random() * 100}vw`;
            banana.style.animationDuration = `${Math.random() * 3 + 2}s`;
            container.appendChild(banana);

            setTimeout(() => {
                banana.remove();
            }, 5000);
        }
    });
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDelay = `${Math.random() * 0.1}s`;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
    }
}

function createFloatingText(text, element) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    document.body.appendChild(floatingText);

    const rect = element.getBoundingClientRect();
    floatingText.style.left = `${rect.left + rect.width / 2}px`;
    floatingText.style.top = `${rect.top}px`;

    setTimeout(() => floatingText.remove(), 1000);
}

// --- Utilities ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function playSound(soundFile) {
    // In a real application, this would use the Web Audio API
    console.log(`Playing sound: ${soundFile}`);
    showNotification(`🔊 Sound: ${soundFile.split('.')[0]}`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// --- Minion Generator ---
function setupMinionGenerator() {
    const randomNameButton = document.getElementById('random-name');
    const minionNameInput = document.getElementById('minion-name');
    const eyesSelect = document.getElementById('eyes');
    const hairSelect = document.getElementById('hair');
    const colorInput = document.getElementById('minion-color');
    const minionOutput = document.getElementById('minion-output');
    const downloadButton = document.getElementById('download-minion');
    const soundButton = document.getElementById('minion-sound');

    const names1 = ["Dave", "Carl", "Paul", "Jerry", "Tim"];
    const names2 = ["inator", "-o-matic", "tron", "-o-rama", "zilla"];

    function generateRandomName() {
        const name1 = names1[Math.floor(Math.random() * names1.length)];
        const name2 = names2[Math.floor(Math.random() * names2.length)];
        const number = Math.floor(Math.random() * 1000);
        return `${name1}${name2}${number}`;
    }

    function renderMinion() {
        const eyes = eyesSelect.value;
        const hair = hairSelect.value;
        const color = colorInput.value;

        minionOutput.innerHTML = `
            <div style="background-color:${color}; position:relative; width:100%; height:100%; border-radius: 20px;">
                ${hair === 'spiky' ? '<div style="position:absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-bottom: 40px solid black;"></div>' : ''}
                ${hair === 'parted' ? '<div style="position:absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 10px; background: black; border-radius: 5px;"></div>' : ''}
                <div style="position:absolute; top:100px; left:50%; transform:translateX(-50%); display:flex; gap:10px;">
                    <div style="width:50px; height:50px; background:white; border-radius:50%; border:2px solid black; display:flex; justify-content:center; align-items:center;"><div style="width:20px; height:20px; background:black; border-radius:50%;"></div></div>
                    ${eyes === 'two' ? '<div style="width:50px; height:50px; background:white; border-radius:50%; border:2px solid black; display:flex; justify-content:center; align-items:center;"><div style="width:20px; height:20px; background:black; border-radius:50%;"></div></div>' : ''}
                </div>
                <div style="position:absolute; bottom:100px; left:50%; transform:translateX(-50%); width:80px; height:30px; border:2px solid black; border-top:none; border-radius:0 0 40px 40px; background:white;"></div>
            </div>
        `;
    }

    randomNameButton.addEventListener('click', () => {
        minionNameInput.value = generateRandomName();
    });

    downloadButton.addEventListener('click', () => {
        html2canvas(minionOutput).then(canvas => {
            const link = document.createElement('a');
            link.download = `${minionNameInput.value || 'minion'}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    soundButton.addEventListener('click', () => {
        const sound = new Audio('bee-do.mp3');
        sound.play();
    });

    eyesSelect.addEventListener('change', renderMinion);
    hairSelect.addEventListener('change', renderMinion);
    colorInput.addEventListener('input', renderMinion);

    // Initial render
    minionNameInput.value = generateRandomName();
    renderMinion();
}


// --- Banana Catch Game ---
function setupBananaCatchGame() {
    const gameArea = document.getElementById('banana-catch-game');
    const scoreElement = document.getElementById('banana-catch-score');
    const highscoreElement = document.getElementById('banana-catch-highscore');
    let score = 0;
    let highscore = localStorage.getItem('bananaCatchHighscore') || 0;
    highscoreElement.textContent = highscore;

    function createBanana() {
        const banana = document.createElement('div');
        banana.textContent = '🍌';
        banana.className = 'falling-banana';
        banana.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
        banana.style.top = '-30px';

        banana.addEventListener('click', () => {
            score++;
            scoreElement.textContent = score;
            banana.remove();
            if (score > highscore) {
                highscore = score;
                highscoreElement.textContent = highscore;
                localStorage.setItem('bananaCatchHighscore', highscore);
            }
        });

        gameArea.appendChild(banana);

        let top = -30;
        const fallInterval = setInterval(() => {
            top += 5;
            banana.style.top = top + 'px';
            if (top > gameArea.offsetHeight) {
                banana.remove();
                clearInterval(fallInterval);
            }
        }, 50);
    }

    setInterval(createBanana, 1000);
}


// --- Gru's Escape Game ---
function setupGrusEscapeGame() {
    const canvas = document.getElementById('grus-escape-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('grus-escape-score');
    const highscoreElement = document.getElementById('grus-escape-highscore');

    let score = 0;
    let highscore = localStorage.getItem('grusEscapeHighscore') || 0;
    highscoreElement.textContent = highscore;

    const player = {
        x: 50,
        y: 100,
        width: 20,
        height: 30,
        velocityY: 0,
        isJumping: false
    };

    const obstacles = [];

    function drawPlayer() {
        ctx.fillStyle = '#FEE440';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = '#333';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    function update() {
        // Update player
        player.y += player.velocityY;
        player.velocityY += 1; // Gravity

        if (player.y > canvas.height - player.height) {
            player.y = canvas.height - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }

        // Update obstacles
        obstacles.forEach(obstacle => {
            obstacle.x -= 3;
        });

        // Remove off-screen obstacles
        if (obstacles.length > 0 && obstacles[0].x < -obstacles[0].width) {
            obstacles.shift();
            score++;
            scoreElement.textContent = score;
            if (score > highscore) {
                highscore = score;
                highscoreElement.textContent = highscore;
                localStorage.setItem('grusEscapeHighscore', highscore);
            }
        }

        // Collision detection
        obstacles.forEach(obstacle => {
            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                // Game over
                alert('Game Over!');
                score = 0;
                scoreElement.textContent = score;
                obstacles.length = 0;
            }
        });


        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawPlayer();
        drawObstacles();

        requestAnimationFrame(update);
    }

    function jump() {
        if (!player.isJumping) {
            player.velocityY = -15;
            player.isJumping = true;
        }
    }

    setInterval(() => {
        const height = Math.random() * 50 + 20;
        obstacles.push({
            x: canvas.width,
            y: canvas.height - height,
            width: 20,
            height: height
        });
    }, 1500);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            jump();
        }
    });

    update();
}


// --- Fan Art Gallery ---
function setupFanArtGallery() {
    const uploadButton = document.getElementById('upload-button');
    const fanArtUpload = document.getElementById('fan-art-upload');
    const galleryGrid = document.getElementById('gallery-grid');
    const topFanArt = document.getElementById('top-fan-art');
    let fanArtItems = JSON.parse(localStorage.getItem('fanArtItems')) || [];

    function renderGallery() {
        galleryGrid.innerHTML = '';
        fanArtItems.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${item.image}" alt="Fan Art">
                <div class="overlay">
                    <button class="like-button" data-index="${index}">❤️ ${item.likes}</button>
                </div>
            `;
            galleryGrid.appendChild(galleryItem);
        });
        updateTopFanArt();
    }

    function updateTopFanArt() {
        if (fanArtItems.length === 0) return;
        const topItem = fanArtItems.reduce((prev, current) => (prev.likes > current.likes) ? prev : current);
        topFanArt.innerHTML = `<img src="${topItem.image}" alt="Top Fan Art" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
    }

    uploadButton.addEventListener('click', () => {
        const file = fanArtUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                fanArtItems.push({
                    image: e.target.result,
                    likes: 0
                });
                localStorage.setItem('fanArtItems', JSON.stringify(fanArtItems));
                renderGallery();
            };
            reader.readAsDataURL(file);
        }
    });

    galleryGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('like-button')) {
            const index = e.target.dataset.index;
            fanArtItems[index].likes++;
            localStorage.setItem('fanArtItems', JSON.stringify(fanArtItems));
            renderGallery();
        } else if (e.target.tagName === 'IMG') {
            const item = fanArtItems.find(i => i.image === e.target.src);
            const minionComments = ["Bello!", "Poopaye!", "Banana!", "Bee-do Bee-do!"];
            const randomComment = minionComments[Math.floor(Math.random() * minionComments.length)];
            openModalWithComment(item.image, "Fan Art", randomComment);
        }
    });

    function openModalWithComment(image, title, comment) {
        const modal = document.getElementById('gallery-modal');
        document.getElementById('modal-image-container').innerHTML = `<img src="${image}" alt="${title}">`;
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-description').textContent = comment;

        modal.style.display = 'block';
    }

    renderGallery();
}


// --- Event Listeners ---
function setupEventListeners() {
    // Smooth scrolling
    document.querySelectorAll('.nav-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Hide navbar on scroll
    let lastScrollTop = 0;
    window.addEventListener("scroll", function() {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop) {
            document.querySelector('.navbar').style.top = "-80px";
        } else {
            document.querySelector('.navbar').style.top = "0";
        }
        lastScrollTop = st <= 0 ? 0 : st;
    }, false);

    setupMinionGenerator();
    setupBananaCatchGame();
    setupGrusEscapeGame();
    setupFanArtGallery();
}