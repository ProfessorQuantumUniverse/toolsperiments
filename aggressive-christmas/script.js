// Christmas Countdown - Main JavaScript

// Global Variables
let audioContext;
let musicPlaying = false;
let popupsEnabled = true;
let snowEnabled = true;
let ornamentsEnabled = true;
let lightsEnabled = true;
let currentDisplayMode = 'normal';
let lastMinuteSpoken = -1;
let wakeLock = null;
let isFullscreen = false;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initSnow();
    initOrnaments();
    initLights();
    initSantaTracker();
    initChristmasFacts();
    initWishlist();
    initNaughtyNiceMeter();
    initMusicPlayer();
    initMessages();
    initEffectButtons();
    initStatistics();
    initSettings();
    initPopupNotifications();
    initTimeDisplayMode();
    initFullscreenMode();
    
    // Auto-music if enabled
    if (localStorage.getItem('autoMusic') === 'true') {
        setTimeout(() => playBackgroundMusic(), 2000);
    }
});

// Countdown Timer
function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const christmas = new Date(currentYear, 11, 25); // December 25
    
    // If Christmas has passed this year, count to next year
    if (now > christmas) {
        christmas.setFullYear(currentYear + 1);
    }
    
    const diff = christmas - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Display based on current mode
    displayTimeInMode(days, hours, minutes, seconds, diff);
    
    // Update progress bar
    const startOfYear = new Date(currentYear, 0, 1);
    const totalYearTime = christmas - startOfYear;
    const elapsedTime = now - startOfYear;
    const progress = Math.min((elapsedTime / totalYearTime) * 100, 100);
    
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = Math.round(progress) + '% to Christmas!';
    
    // Update sleeps left
    document.getElementById('sleepsLeft').textContent = days;
    
    // Play beep every second
    playBeep();
    
    // Text-to-speech once per minute
    speakTimeOncePerMinute(days, hours, minutes, seconds);
}

// Time Display Mode Functions
function displayTimeInMode(days, hours, minutes, seconds, totalMilliseconds) {
    const mode = currentDisplayMode;
    
    switch(mode) {
        case 'normal':
            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
            updateLabels('Days', 'Hours', 'Minutes', 'Seconds');
            break;
            
        case 'binary':
            document.getElementById('days').textContent = days.toString(2);
            document.getElementById('hours').textContent = hours.toString(2).padStart(5, '0');
            document.getElementById('minutes').textContent = minutes.toString(2).padStart(6, '0');
            document.getElementById('seconds').textContent = seconds.toString(2).padStart(6, '0');
            updateLabels('Days (bin)', 'Hours (bin)', 'Minutes (bin)', 'Seconds (bin)');
            break;
            
        case 'milliseconds':
            const ms = totalMilliseconds;
            document.getElementById('days').textContent = ms.toLocaleString();
            document.getElementById('hours').textContent = '';
            document.getElementById('minutes').textContent = '';
            document.getElementById('seconds').textContent = (ms % 1000).toString().padStart(3, '0');
            updateLabels('Total Milliseconds', '', '', 'ms');
            break;
            
        case 'years':
            const totalYears = totalMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
            document.getElementById('days').textContent = totalYears.toFixed(8);
            document.getElementById('hours').textContent = '';
            document.getElementById('minutes').textContent = '';
            document.getElementById('seconds').textContent = '';
            updateLabels('Years (with 8 decimals)', '', '', '');
            break;
            
        case 'unix':
            const unixTime = Math.floor(Date.now() / 1000);
            const christmasUnix = Math.floor(new Date(new Date().getFullYear(), 11, 25).getTime() / 1000);
            const unixDiff = christmasUnix - unixTime;
            document.getElementById('days').textContent = christmasUnix.toLocaleString();
            document.getElementById('hours').textContent = unixDiff.toLocaleString();
            document.getElementById('minutes').textContent = '';
            document.getElementById('seconds').textContent = '';
            updateLabels('Christmas Unix', 'Seconds Until', '', '');
            break;
            
        case 'hex':
            document.getElementById('days').textContent = '0x' + days.toString(16).toUpperCase();
            document.getElementById('hours').textContent = '0x' + hours.toString(16).toUpperCase().padStart(2, '0');
            document.getElementById('minutes').textContent = '0x' + minutes.toString(16).toUpperCase().padStart(2, '0');
            document.getElementById('seconds').textContent = '0x' + seconds.toString(16).toUpperCase().padStart(2, '0');
            updateLabels('Days (hex)', 'Hours (hex)', 'Minutes (hex)', 'Seconds (hex)');
            break;
            
        case 'percentage':
            const now = new Date();
            const currentYear = now.getFullYear();
            const startOfYear = new Date(currentYear, 0, 1);
            const christmas = new Date(currentYear, 11, 25);
            if (now > christmas) {
                christmas.setFullYear(currentYear + 1);
            }
            const totalTimeToChristmas = christmas - startOfYear;
            const timeRemaining = totalMilliseconds;
            const percentageRemaining = (timeRemaining / totalTimeToChristmas) * 100;
            const percentageElapsed = 100 - percentageRemaining;
            document.getElementById('days').textContent = percentageRemaining.toFixed(6);
            document.getElementById('hours').textContent = percentageElapsed.toFixed(6);
            document.getElementById('minutes').textContent = '';
            document.getElementById('seconds').textContent = '';
            updateLabels('% Until Christmas', '% of Journey Done', '', '');
            break;
            
        case 'seconds':
            const totalSeconds = Math.floor(totalMilliseconds / 1000);
            document.getElementById('days').textContent = totalSeconds.toLocaleString();
            document.getElementById('hours').textContent = '';
            document.getElementById('minutes').textContent = '';
            document.getElementById('seconds').textContent = '';
            updateLabels('Total Seconds', '', '', '');
            break;
            
        case 'scientific':
            const sciDays = days.toExponential(4);
            const sciHours = hours.toExponential(2);
            const sciMinutes = minutes.toExponential(2);
            const sciSeconds = seconds.toExponential(2);
            document.getElementById('days').textContent = sciDays;
            document.getElementById('hours').textContent = sciHours;
            document.getElementById('minutes').textContent = sciMinutes;
            document.getElementById('seconds').textContent = sciSeconds;
            updateLabels('Days (sci)', 'Hours (sci)', 'Minutes (sci)', 'Seconds (sci)');
            break;
            
        case 'octal':
            document.getElementById('days').textContent = '0o' + days.toString(8);
            document.getElementById('hours').textContent = '0o' + hours.toString(8).padStart(2, '0');
            document.getElementById('minutes').textContent = '0o' + minutes.toString(8).padStart(2, '0');
            document.getElementById('seconds').textContent = '0o' + seconds.toString(8).padStart(2, '0');
            updateLabels('Days (oct)', 'Hours (oct)', 'Minutes (oct)', 'Seconds (oct)');
            break;
    }
}

function updateLabels(label1, label2, label3, label4) {
    const labels = document.querySelectorAll('.countdown-label');
    if (labels[0]) labels[0].textContent = label1;
    if (labels[1]) labels[1].textContent = label2;
    if (labels[2]) labels[2].textContent = label3;
    if (labels[3]) labels[3].textContent = label4;
}

// Time Display Mode Initialization
function initTimeDisplayMode() {
    const selector = document.getElementById('timeDisplayMode');
    
    // Load saved mode
    const savedMode = localStorage.getItem('timeDisplayMode') || 'normal';
    currentDisplayMode = savedMode;
    selector.value = savedMode;
    
    // Listen for changes
    selector.addEventListener('change', (e) => {
        currentDisplayMode = e.target.value;
        localStorage.setItem('timeDisplayMode', currentDisplayMode);
        playSound('jingle');
        showPopup('🎄 Display mode changed to ' + e.target.options[e.target.selectedIndex].text + '!');
    });
}

// Beep sound every second
function playBeep() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            return; // Silently fail if audio context can't be created
        }
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.value = 0.05; // Very quiet beep
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05); // Very short beep
}

// Text-to-speech once per minute
function speakTimeOncePerMinute(days, hours, minutes, seconds) {
    // Only speak once per minute, when seconds == 0
    if (seconds === 0 && minutes !== lastMinuteSpoken) {
        lastMinuteSpoken = minutes;
        
        // Check if browser supports speech synthesis
        if ('speechSynthesis' in window) {
            const text = `It is ${hours} hours and ${minutes} minutes. ${days} days until Christmas.`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.7; // Slower speech for more annoyance
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            // Cancel any ongoing speech first
            window.speechSynthesis.cancel();
            
            // Speak after a small delay to ensure previous speech is cancelled
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 100);
        }
    }
}

// Snow Effect
function initSnow() {
    const canvas = document.getElementById('snowCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const snowflakes = [];
    const snowflakeCount = 150;
    
    for (let i = 0; i < snowflakeCount; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5,
            wind: Math.random() * 0.5 - 0.25
        });
    }
    
    function drawSnow() {
        if (!snowEnabled) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        
        for (let flake of snowflakes) {
            ctx.moveTo(flake.x, flake.y);
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        }
        
        ctx.fill();
        updateSnow();
    }
    
    function updateSnow() {
        for (let flake of snowflakes) {
            flake.y += flake.speed;
            flake.x += flake.wind;
            
            if (flake.y > canvas.height) {
                flake.y = 0;
                flake.x = Math.random() * canvas.width;
            }
            
            if (flake.x > canvas.width) {
                flake.x = 0;
            } else if (flake.x < 0) {
                flake.x = canvas.width;
            }
        }
    }
    
    function animateSnow() {
        drawSnow();
        requestAnimationFrame(animateSnow);
    }
    
    animateSnow();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Floating Ornaments
function initOrnaments() {
    const container = document.getElementById('ornaments-container');
    const ornaments = ['🎄', '🎅', '⛄', '🎁', '🔔', '⭐', '🕯️', '🦌'];
    
    for (let i = 0; i < 15; i++) {
        const ornament = document.createElement('div');
        ornament.className = 'ornament';
        ornament.textContent = ornaments[Math.floor(Math.random() * ornaments.length)];
        ornament.style.left = Math.random() * 100 + '%';
        ornament.style.top = Math.random() * 100 + '%';
        ornament.style.animationDelay = Math.random() * 3 + 's';
        ornament.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(ornament);
    }
}

// Twinkling Lights
function initLights() {
    const container = document.getElementById('lights-container');
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 30; i++) {
        const light = document.createElement('div');
        light.className = 'light';
        light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        light.style.animationDelay = Math.random() * 1 + 's';
        light.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
        container.appendChild(light);
    }
}

// Santa Tracker
function initSantaTracker() {
    let giftsCount = 0;
    const locations = [
        'North Pole', 'Workshop', 'Feeding Reindeer', 'Checking List Twice',
        'Loading Sleigh', 'Training Reindeer', 'Reading Letters', 'Making Toys'
    ];
    
    function updateSanta() {
        const location = locations[Math.floor(Math.random() * locations.length)];
        document.querySelector('.location-text').textContent = `Currently at: ${location}`;
        
        giftsCount += Math.floor(Math.random() * 1000) + 500;
        document.getElementById('giftsPrepared').textContent = giftsCount.toLocaleString() + ' gifts ready!';
        
        const progress = Math.min((giftsCount / 1000000) * 100, 100);
        document.getElementById('santaProgress').style.width = progress + '%';
    }
    
    updateSanta();
    setInterval(updateSanta, 5000);
}

// Christmas Facts
function initChristmasFacts() {
    const facts = [
        "🎄 The tradition of Christmas trees originated in Germany in the 16th century!",
        "🎅 Santa Claus is based on the real-life St. Nicholas, a monk from the 3rd century!",
        "⛄ The largest snowman ever built was 122 feet tall!",
        "🎁 Americans spend an average of $1000 on Christmas gifts each year!",
        "🔔 'Jingle Bells' was originally written for Thanksgiving!",
        "🦌 Rudolph the Red-Nosed Reindeer was created in 1939 as a marketing gimmick!",
        "🎄 The first artificial Christmas tree was made in Germany using goose feathers!",
        "🎅 NORAD has been tracking Santa since 1955!",
        "⭐ The star on top of Christmas trees represents the Star of Bethlehem!",
        "🍪 Leaving cookies and milk for Santa is an American tradition that started in the 1930s!",
        "🎁 The world's largest gift ever given was the Statue of Liberty!",
        "🎄 Norway donates a Christmas tree to London every year to thank them for WWII support!",
        "🎅 In Japan, KFC is a traditional Christmas meal!",
        "⛄ The record for most snowmen built in one hour is 2,036!",
        "🔔 Caroling dates back to medieval times in Europe!"
    ];
    
    let currentFact = 0;
    
    function showRandomFact() {
        currentFact = Math.floor(Math.random() * facts.length);
        document.getElementById('factContent').innerHTML = `<p>${facts[currentFact]}</p>`;
    }
    
    showRandomFact();
    
    document.getElementById('newFactBtn').addEventListener('click', () => {
        showRandomFact();
        playSound('jingle');
    });
    
    // Auto-rotate facts
    setInterval(showRandomFact, 15000);
}

// Wishlist
function initWishlist() {
    loadWishlist();
    
    document.getElementById('addWishBtn').addEventListener('click', addWish);
    document.getElementById('wishInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addWish();
    });
}

function addWish() {
    const input = document.getElementById('wishInput');
    const wish = input.value.trim();
    
    if (wish) {
        const wishlist = getWishlist();
        wishlist.push(wish);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        input.value = '';
        loadWishlist();
        playSound('jingle');
        showPopup('🎁 Added to wishlist!');
    }
}

function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function loadWishlist() {
    const wishlist = getWishlist();
    const listElement = document.getElementById('wishList');
    listElement.innerHTML = '';
    
    wishlist.forEach((wish, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>🎁 ${wish}</span>
            <button class="delete-wish" onclick="deleteWish(${index})">✕</button>
        `;
        listElement.appendChild(li);
    });
}

function deleteWish(index) {
    const wishlist = getWishlist();
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    loadWishlist();
}

// Naughty or Nice Meter
function initNaughtyNiceMeter() {
    let score = parseInt(localStorage.getItem('niceScore') || '50');
    updateMeter(score);
    
    document.getElementById('beNiceBtn').addEventListener('click', () => {
        score = Math.min(score + Math.floor(Math.random() * 10) + 5, 100);
        localStorage.setItem('niceScore', score);
        updateMeter(score);
        playSound('hohoho');
        showPopup('😇 You\'re being nice!');
    });
    
    // Randomly decrease score
    setInterval(() => {
        if (Math.random() < 0.3) {
            score = Math.max(score - Math.floor(Math.random() * 5), 0);
            localStorage.setItem('niceScore', score);
            updateMeter(score);
        }
    }, 10000);
}

function updateMeter(score) {
    document.getElementById('meterFill').style.width = score + '%';
    document.getElementById('scoreValue').textContent = score + '%';
    
    if (score >= 75) {
        document.getElementById('scoreValue').style.color = '#0f7d3e';
    } else if (score >= 50) {
        document.getElementById('scoreValue').style.color = '#ffd700';
    } else {
        document.getElementById('scoreValue').style.color = '#c41e3a';
    }
}

// Music Player
function initMusicPlayer() {
    document.getElementById('playMusicBtn').addEventListener('click', playBackgroundMusic);
    document.getElementById('stopMusicBtn').addEventListener('click', stopBackgroundMusic);
    
    const volumeSlider = document.getElementById('volumeSlider');
    document.getElementById('volumeValue').textContent = volumeSlider.value;
    
    volumeSlider.addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value;
    });
    
    // Sound effect buttons
    document.querySelectorAll('.btn-effect[data-sound]').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(btn.dataset.sound);
        });
    });
}

function playBackgroundMusic() {
    // Create Web Audio API context for synthesized music
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            showPopup('⚠️ Audio not supported in this browser');
            return;
        }
    }
    
    if (musicPlaying) return;
    musicPlaying = true;
    
    showPopup('🎵 Christmas music playing!');
    
    // Simple melody loop (synthesized)
    playMelody();
}

function playMelody() {
    if (!musicPlaying) return;
    
    const volume = document.getElementById('volumeSlider').value / 100;
    const frequencies = [
        523, 587, 659, 698, 784, 880, 988, 1047 // C major scale
    ];
    
    const melody = [
        { note: 4, duration: 400 }, // G
        { note: 4, duration: 400 }, // G
        { note: 5, duration: 400 }, // A
        { note: 4, duration: 400 }, // G
        { note: 2, duration: 400 }, // E
        { note: 3, duration: 800 }, // F
    ];
    
    let time = audioContext.currentTime;
    
    melody.forEach(({ note, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequencies[note];
        oscillator.type = 'sine';
        
        gainNode.gain.value = volume * 0.1;
        
        oscillator.start(time);
        oscillator.stop(time + duration / 1000);
        
        time += duration / 1000;
    });
    
    if (musicPlaying) {
        setTimeout(playMelody, 3000);
    }
}

function stopBackgroundMusic() {
    musicPlaying = false;
    showPopup('🔇 Music stopped');
}

function playSound(type) {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            return;
        }
    }
    
    const volume = document.getElementById('volumeSlider').value / 100;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = volume * 0.2;
    
    switch(type) {
        case 'jingle':
            // Bell sound
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1000;
                osc2.type = 'sine';
                gain2.gain.value = volume * 0.2;
                osc2.start();
                osc2.stop(audioContext.currentTime + 0.3);
            }, 150);
            break;
            
        case 'hohoho':
            // Ho ho ho sound (low pitched notes)
            [200, 200, 200].forEach((freq, i) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'square';
                    gain.gain.value = volume * 0.3;
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.3);
                }, i * 300);
            });
            break;
            
        case 'bells':
            // Multiple bells
            [600, 800, 1000, 1200].forEach((freq, i) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.value = volume * 0.15;
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.4);
                }, i * 100);
            });
            break;
    }
}

// Christmas Messages
function initMessages() {
    const messages = [
        "🎅 Ho Ho Ho! Christmas is coming!",
        "⛄ Let it snow, let it snow, let it snow!",
        "🎄 Have yourself a merry little Christmas!",
        "🎁 'Tis the season to be jolly!",
        "⭐ May your days be merry and bright!",
        "🔔 Jingle all the way!",
        "🎅 Santa Claus is coming to town!",
        "❄️ Walking in a winter wonderland!",
        "🦌 Rudolph the red-nosed reindeer!",
        "🎄 Deck the halls with boughs of holly!",
        "🍪 Don't forget cookies for Santa!",
        "🎁 All I want for Christmas is you!",
        "⛄ Do you want to build a snowman?",
        "🎅 Believe in the magic of Christmas!",
        "✨ Christmas magic is in the air!"
    ];
    
    function showRandomMessage() {
        const message = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('messageDisplay').textContent = message;
    }
    
    showRandomMessage();
    
    document.getElementById('randomMessageBtn').addEventListener('click', () => {
        showRandomMessage();
        playSound('jingle');
    });
    
    // Auto-rotate messages
    setInterval(showRandomMessage, 10000);
}

// Effect Buttons
function initEffectButtons() {
    document.getElementById('confettiBtn').addEventListener('click', () => {
        createConfetti();
        playSound('bells');
        showPopup('🎊 Confetti blast!');
    });
    
    document.getElementById('fireworksBtn').addEventListener('click', () => {
        createFireworks();
        playSound('bells');
        showPopup('🎆 Fireworks!');
    });
    
    document.getElementById('snowstormBtn').addEventListener('click', () => {
        createSnowstorm();
        playSound('bells');
        showPopup('❄️ Snowstorm activated!');
    });
}

function createConfetti() {
    const container = document.getElementById('particles-container');
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffd700'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'particle confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 20);
    }
}

function createFireworks() {
    const container = document.getElementById('particles-container');
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffd700'];
    
    for (let burst = 0; burst < 5; burst++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight / 2);
            
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle firework';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                const angle = (Math.PI * 2 * i) / 30;
                const velocity = 50 + Math.random() * 100;
                const dx = Math.cos(angle) * velocity;
                const dy = Math.sin(angle) * velocity;
                
                particle.style.setProperty('--x', dx + 'px');
                particle.style.setProperty('--y', dy + 'px');
                
                container.appendChild(particle);
                
                setTimeout(() => particle.remove(), 1000);
            }
        }, burst * 500);
    }
}

function createSnowstorm() {
    const container = document.getElementById('particles-container');
    
    for (let i = 0; i < 200; i++) {
        setTimeout(() => {
            const snowflake = document.createElement('div');
            snowflake.className = 'particle confetti';
            snowflake.textContent = '❄️';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.top = '-50px';
            snowflake.style.fontSize = (Math.random() * 20 + 10) + 'px';
            snowflake.style.background = 'none';
            container.appendChild(snowflake);
            
            setTimeout(() => snowflake.remove(), 3000);
        }, i * 15);
    }
}

// Statistics
function initStatistics() {
    // Visit count
    let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    visitCount++;
    localStorage.setItem('visitCount', visitCount);
    document.getElementById('visitCount').textContent = visitCount;
    
    // Days since last Christmas
    const now = new Date();
    const lastChristmas = new Date(now.getFullYear(), 11, 25);
    if (now < lastChristmas) {
        lastChristmas.setFullYear(now.getFullYear() - 1);
    }
    const daysSince = Math.floor((now - lastChristmas) / (1000 * 60 * 60 * 24));
    document.getElementById('daysElapsed').textContent = daysSince;
    
    // Year complete percentage
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    const yearProgress = ((now - startOfYear) / (endOfYear - startOfYear)) * 100;
    document.getElementById('percentComplete').textContent = Math.round(yearProgress) + '%';
}

// Settings
function initSettings() {
    document.getElementById('settingsToggle').addEventListener('click', () => {
        document.getElementById('settingsPanel').classList.toggle('active');
    });
    
    // Load settings
    document.getElementById('snowToggle').checked = localStorage.getItem('snow') !== 'false';
    document.getElementById('popupsToggle').checked = localStorage.getItem('popups') !== 'false';
    document.getElementById('ornamentsToggle').checked = localStorage.getItem('ornaments') !== 'false';
    document.getElementById('lightsToggle').checked = localStorage.getItem('lights') !== 'false';
    document.getElementById('autoMusicToggle').checked = localStorage.getItem('autoMusic') === 'true';
    
    snowEnabled = document.getElementById('snowToggle').checked;
    popupsEnabled = document.getElementById('popupsToggle').checked;
    ornamentsEnabled = document.getElementById('ornamentsToggle').checked;
    lightsEnabled = document.getElementById('lightsToggle').checked;
    
    // Apply ornament and lights settings
    document.getElementById('ornaments-container').style.display = ornamentsEnabled ? 'block' : 'none';
    document.getElementById('lights-container').style.display = lightsEnabled ? 'flex' : 'none';
    
    // Event listeners
    document.getElementById('snowToggle').addEventListener('change', (e) => {
        snowEnabled = e.target.checked;
        localStorage.setItem('snow', snowEnabled);
    });
    
    document.getElementById('popupsToggle').addEventListener('change', (e) => {
        popupsEnabled = e.target.checked;
        localStorage.setItem('popups', popupsEnabled);
    });
    
    document.getElementById('ornamentsToggle').addEventListener('change', (e) => {
        ornamentsEnabled = e.target.checked;
        localStorage.setItem('ornaments', ornamentsEnabled);
        document.getElementById('ornaments-container').style.display = ornamentsEnabled ? 'block' : 'none';
    });
    
    document.getElementById('lightsToggle').addEventListener('change', (e) => {
        lightsEnabled = e.target.checked;
        localStorage.setItem('lights', lightsEnabled);
        document.getElementById('lights-container').style.display = lightsEnabled ? 'flex' : 'none';
    });
    
    document.getElementById('autoMusicToggle').addEventListener('change', (e) => {
        localStorage.setItem('autoMusic', e.target.checked);
    });
}

// Popup Notifications
function initPopupNotifications() {
    const messages = [
        "🎅 Santa is watching!",
        "❄️ It's beginning to look a lot like Christmas!",
        "🎄 Have you decorated your tree yet?",
        "🎁 Don't forget to wrap your gifts!",
        "🔔 Can you hear the sleigh bells?",
        "⛄ Frosty says hello!",
        "🦌 Rudolph is ready to fly!",
        "🍪 Time to bake cookies!",
        "🎅 Have you been naughty or nice?",
        "✨ Christmas magic is real!"
    ];
    
    function showRandomPopup() {
        if (!popupsEnabled) return;
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        showPopup(message);
        
        // Schedule next popup with random delay
        const nextDelay = Math.random() * 30000 + 30000; // 30-60 seconds
        setTimeout(showRandomPopup, nextDelay);
    }
    
    // Show initial popup after 5 seconds, then random intervals
    setTimeout(showRandomPopup, 5000);
}

function showPopup(message) {
    if (!popupsEnabled) return;
    
    const container = document.getElementById('popup-container');
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;
    container.appendChild(popup);
    
    // Remove after 5 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    }, 5000);
}

// Additional intrusive features
setInterval(() => {
    // Random screen shake
    if (Math.random() < 0.1) {
        document.body.style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
}, 60000);

// Prevent leaving the page (intrusive!)
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = "🎅 Are you sure you want to leave? Christmas is coming!";
    return e.returnValue;
});

// Change page title periodically
const titles = [
    "🎄 CHRISTMAS IS COMING! 🎅",
    "🎁 DON'T FORGET TO CHECK! 🎁",
    "⛄ WINTER WONDERLAND! ❄️",
    "🔔 JINGLE ALL THE WAY! 🔔",
    "🎅 HO HO HO! 🎅"
];

let titleIndex = 0;
setInterval(() => {
    document.title = titles[titleIndex];
    titleIndex = (titleIndex + 1) % titles.length;
}, 3000);

// Fullscreen Mode
function initFullscreenMode() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const exitBtn = document.getElementById('exitFullscreenBtn');
    
    fullscreenBtn.addEventListener('click', enterFullscreenMode);
    exitBtn.addEventListener('click', exitFullscreenMode);
    
    // Handle ESC key to exit fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isFullscreen) {
            exitFullscreenMode();
        }
    });
    
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

async function enterFullscreenMode() {
    isFullscreen = true;
    document.body.classList.add('fullscreen-mode');
    
    // Request browser fullscreen
    try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
        }
    } catch (err) {
        console.log('Fullscreen request failed:', err);
    }
    
    // Request wake lock to prevent screen sleep
    await requestWakeLock();
}

async function exitFullscreenMode() {
    isFullscreen = false;
    document.body.classList.remove('fullscreen-mode');
    
    // Exit browser fullscreen
    try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
        }
    } catch (err) {
        console.log('Exit fullscreen failed:', err);
    }
    
    // Release wake lock
    await releaseWakeLock();
}

function handleFullscreenChange() {
    // If browser fullscreen is exited manually, update our state
    const isInFullscreen = !!(document.fullscreenElement || 
                             document.webkitFullscreenElement || 
                             document.mozFullScreenElement || 
                             document.msFullscreenElement);
    
    if (!isInFullscreen && isFullscreen) {
        // Browser exited fullscreen (e.g., user pressed ESC)
        // Just update our state without calling document.exitFullscreen again
        isFullscreen = false;
        document.body.classList.remove('fullscreen-mode');
        releaseWakeLock();
        showPopup('🎅 Fullscreen mode exited');
    }
}

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock acquired');
            
            // Re-request wake lock if it's released (e.g., when tab becomes inactive)
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock released');
                wakeLock = null;
            });
        } catch (err) {
            console.log('Wake Lock request failed:', err);
        }
    } else {
        console.log('Wake Lock API not supported');
    }
}

async function releaseWakeLock() {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log('Wake Lock released manually');
        } catch (err) {
            console.log('Wake Lock release failed:', err);
        }
    }
}

// Re-request wake lock when page becomes visible (in case it was released)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isFullscreen && wakeLock === null) {
        await requestWakeLock();
    }
});
