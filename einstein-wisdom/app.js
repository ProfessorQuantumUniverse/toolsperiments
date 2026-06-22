// State management
let allQuotes = [];
let currentLanguage = 'de';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentFilter = 'all';
let quoteOfTheDayId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadQuotes();
    initializeEventListeners();
    setQuoteOfTheDay();
    displayQuotes();
    displayFavorites();
    createParticles();
});

// Load quotes from JSON file
async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        const data = await response.json();
        allQuotes = data.quotes;
    } catch (error) {
        console.error('Error loading quotes:', error);
        allQuotes = [];
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Random quote button
    document.getElementById('randomQuoteBtn').addEventListener('click', () => {
        showRandomQuote();
    });

    // Language toggle
    document.getElementById('languageToggle').addEventListener('click', () => {
        toggleLanguage();
    });

    // Theme filter
    document.getElementById('themeFilter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        displayQuotes();
    });

    // Quote of the day actions
    document.getElementById('shareQod').addEventListener('click', () => {
        shareQuote(quoteOfTheDayId);
    });

    document.getElementById('favoriteQod').addEventListener('click', () => {
        toggleFavorite(quoteOfTheDayId);
        updateFavoriteButton('favoriteQod', quoteOfTheDayId);
    });
}

// Set quote of the day (changes daily)
function setQuoteOfTheDay() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('qodDate');
    const storedQuoteId = localStorage.getItem('qodId');

    if (storedDate === today && storedQuoteId) {
        quoteOfTheDayId = parseInt(storedQuoteId);
    } else {
        // Select a random quote for today
        quoteOfTheDayId = allQuotes[Math.floor(Math.random() * allQuotes.length)].id;
        localStorage.setItem('qodDate', today);
        localStorage.setItem('qodId', quoteOfTheDayId);
    }

    displayQuoteOfTheDay();
}

// Display quote of the day
function displayQuoteOfTheDay() {
    const quote = allQuotes.find(q => q.id === quoteOfTheDayId);
    if (!quote) return;

    const text = currentLanguage === 'de' ? quote.textDE : quote.textEN;
    document.getElementById('qodText').textContent = text;
    document.getElementById('qodAuthor').textContent = quote.author;
    
    updateFavoriteButton('favoriteQod', quoteOfTheDayId);
}

// Display all quotes (filtered)
function displayQuotes() {
    const quotesGrid = document.getElementById('quotesGrid');
    quotesGrid.innerHTML = '';

    const filteredQuotes = currentFilter === 'all' 
        ? allQuotes 
        : allQuotes.filter(q => q.themes.includes(currentFilter));

    // Shuffle quotes for variety
    const shuffledQuotes = [...filteredQuotes].sort(() => Math.random() - 0.5);

    shuffledQuotes.forEach((quote, index) => {
        if (quote.id === quoteOfTheDayId) return; // Skip quote of the day

        const quoteElement = createQuoteElement(quote, index);
        quotesGrid.appendChild(quoteElement);
    });

    // Add scroll reveal animation
    observeElements();
}

// Create quote element
function createQuoteElement(quote, index) {
    const div = document.createElement('div');
    div.className = 'quote-item';
    div.style.animationDelay = `${index * 0.1}s`;

    const text = currentLanguage === 'de' ? quote.textDE : quote.textEN;
    
    div.innerHTML = `
        <div class="quote-card">
            <div class="quote-content">
                <p class="quote-text">${text}</p>
                <div class="quote-author">${quote.author}</div>
            </div>
            <div class="quote-actions">
                <button class="action-btn share-btn" onclick="shareQuote(${quote.id})" title="${currentLanguage === 'de' ? 'Teilen' : 'Share'}">
                    <span>📤</span>
                </button>
                <button class="action-btn favorite-btn ${isFavorite(quote.id) ? 'active' : ''}" 
                        onclick="toggleFavorite(${quote.id})" 
                        title="${currentLanguage === 'de' ? 'Zu Favoriten hinzufügen' : 'Add to favorites'}">
                    <span>❤️</span>
                </button>
            </div>
        </div>
    `;

    return div;
}

// Show random quote with animation
function showRandomQuote() {
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    const text = currentLanguage === 'de' ? randomQuote.textDE : randomQuote.textEN;
    
    // Create modal-like overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeInUp 0.3s ease-out;
    `;

    overlay.innerHTML = `
        <div style="
            max-width: 800px;
            padding: 3rem;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 2px solid var(--primary-color);
            box-shadow: 0 20px 60px rgba(99, 102, 241, 0.5);
            animation: fadeInUp 0.5s ease-out;
            position: relative;
        ">
            <p style="
                font-size: 1.8rem;
                line-height: 1.8;
                color: var(--text-primary);
                margin-bottom: 2rem;
                font-style: italic;
            ">"${text}"</p>
            <p style="
                text-align: right;
                font-size: 1.3rem;
                color: var(--accent-color);
                font-weight: 600;
            ">— ${randomQuote.author}</p>
            <button style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                ✕
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close on click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.tagName === 'BUTTON') {
            overlay.style.animation = 'fadeOutDown 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
        }
    });

    // Close on Escape key
    const closeHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.style.animation = 'fadeOutDown 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
            document.removeEventListener('keydown', closeHandler);
        }
    };
    document.addEventListener('keydown', closeHandler);
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'de' ? 'en' : 'de';
    document.getElementById('currentLang').textContent = currentLanguage.toUpperCase();
    
    // Update all text elements
    updateLanguage();
    displayQuoteOfTheDay();
    displayQuotes();
    displayFavorites();
}

// Update language for all elements
function updateLanguage() {
    document.querySelectorAll('[data-de][data-en]').forEach(element => {
        const text = currentLanguage === 'de' ? element.getAttribute('data-de') : element.getAttribute('data-en');
        if (element.tagName === 'OPTION') {
            element.textContent = text;
        } else {
            element.textContent = text;
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
}

// Share quote
function shareQuote(quoteId) {
    const quote = allQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    const text = currentLanguage === 'de' ? quote.textDE : quote.textEN;
    const shareText = `"${text}" — ${quote.author}`;

    if (navigator.share) {
        navigator.share({
            title: currentLanguage === 'de' ? 'Weisheit von Einstein' : 'Wisdom of Einstein',
            text: shareText,
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification(
                currentLanguage === 'de' 
                    ? 'Zitat in Zwischenablage kopiert!' 
                    : 'Quote copied to clipboard!'
            );
        });
    }
}

// Toggle favorite
function toggleFavorite(quoteId) {
    const index = favorites.indexOf(quoteId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(quoteId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    
    // Update all favorite buttons for this quote
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        if (btn.onclick.toString().includes(`toggleFavorite(${quoteId})`)) {
            btn.classList.toggle('active', isFavorite(quoteId));
        }
    });
}

// Check if quote is favorite
function isFavorite(quoteId) {
    return favorites.includes(quoteId);
}

// Update favorite button state
function updateFavoriteButton(buttonId, quoteId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.toggle('active', isFavorite(quoteId));
    }
}

// Display favorites
function displayFavorites() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <p class="empty-message" data-de="Keine Favoriten gespeichert" data-en="No favorites saved">
                ${currentLanguage === 'de' ? 'Keine Favoriten gespeichert' : 'No favorites saved'}
            </p>
        `;
        return;
    }

    favoritesGrid.innerHTML = '';
    
    favorites.forEach((quoteId, index) => {
        const quote = allQuotes.find(q => q.id === quoteId);
        if (quote) {
            const quoteElement = createQuoteElement(quote, index);
            favoritesGrid.appendChild(quoteElement);
        }
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: var(--gradient-1);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5);
        z-index: 2000;
        animation: slideInFromRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOutDown 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Create floating particles
function createParticles() {
    const container = document.querySelector('.particle-container');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Intersection Observer for scroll animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.quote-item').forEach(item => {
        observer.observe(item);
    });
}

// Make functions globally available
window.shareQuote = shareQuote;
window.toggleFavorite = toggleFavorite;
