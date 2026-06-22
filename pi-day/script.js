/* ─────────────────────────────────────────────────────────
   Pi Day Website — Script
   Matrix rain, countdown, digits display, marquee, tools
   ───────────────────────────────────────────────────────── */

// First 1000 decimal digits of Pi (after "3.")
const PI_DIGITS =
    "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679" +
    "8214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196" +
    "4428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273" +
    "7245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094" +
    "3305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912" +
    "9833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132" +
    "0005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235" +
    "4201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859" +
    "5024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303" +
    "5982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";

const FULL_PI = "3." + PI_DIGITS;

// ─── Matrix Pi Rain ─────────────────────────────────────
(function initMatrix() {
    const canvas = document.getElementById("piMatrix");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 16;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = new Array(columns).fill(1);

    const chars = "3.141592653589793238462643383279502884197π∞∑∫√";

    function draw() {
        ctx.fillStyle = "rgba(10, 10, 15, 0.06)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff41";
        ctx.font = fontSize + "px monospace";

        const newCols = Math.floor(canvas.width / fontSize);
        if (newCols !== columns) {
            columns = newCols;
            drops = new Array(columns).fill(1);
        }

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            const brightness = Math.random();
            if (brightness > 0.95) {
                ctx.fillStyle = "#ffffff";
            } else if (brightness > 0.8) {
                ctx.fillStyle = "#00ff41";
            } else {
                ctx.fillStyle = "#00aa28";
            }

            ctx.fillText(char, x, y);

            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let lastTime = 0;
    const interval = 45;

    function animate(timestamp) {
        if (timestamp - lastTime >= interval) {
            draw();
            lastTime = timestamp;
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
})();

// ─── Countdown to Pi Day ────────────────────────────────
(function initCountdown() {
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const countdownEl = document.getElementById("countdown");
    const celebrationEl = document.getElementById("celebration");
    const titleEl = document.getElementById("countdownTitle");

    if (!daysEl) return;

    function getNextPiDay() {
        const now = new Date();
        let year = now.getFullYear();
        let piDay = new Date(year, 2, 14, 0, 0, 0, 0);

        if (now > new Date(year, 2, 14, 23, 59, 59, 999)) {
            piDay = new Date(year + 1, 2, 14, 0, 0, 0, 0);
        }
        return piDay;
    }

    function isPiDay() {
        const now = new Date();
        return now.getMonth() === 2 && now.getDate() === 14;
    }

    function update() {
        if (isPiDay()) {
            countdownEl.classList.add("hidden");
            celebrationEl.classList.remove("hidden");
            titleEl.textContent = "🥳 Happy Pi Day!";
            return;
        }

        const now = new Date();
        const target = getNextPiDay();
        const diff = target - now;

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        daysEl.textContent = String(days).padStart(3, "0");
        hoursEl.textContent = String(hours).padStart(2, "0");
        minutesEl.textContent = String(minutes).padStart(2, "0");
        secondsEl.textContent = String(seconds).padStart(2, "0");
    }

    update();
    setInterval(update, 1000);
})();

// ─── Pi Digits Marquee ──────────────────────────────────
(function initMarquee() {
    const el = document.getElementById("piMarquee");
    if (!el) return;

    const marqueeText = ("π = " + FULL_PI + "…    ").repeat(4);
    el.textContent = marqueeText;
})();

// ─── First 1000 Digits Display ──────────────────────────
(function initDigitsDisplay() {
    const container = document.getElementById("piDigits");
    if (!container) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < FULL_PI.length; i++) {
        const span = document.createElement("span");
        span.textContent = FULL_PI[i];

        if (i === 0) {
            span.className = "digit-3";
        } else if (FULL_PI[i] === ".") {
            span.className = "digit-dot";
        } else if (i % 10 === 0) {
            span.className = "digit-highlight";
        }
        fragment.appendChild(span);
    }

    container.appendChild(fragment);
})();

// ─── Einstein Age & Hawking Years ───────────────────────
(function initLegendAges() {
    const einsteinEl = document.getElementById("einsteinAge");
    const hawkingEl = document.getElementById("hawkingYears");
    if (!einsteinEl || !hawkingEl) return;

    const now = new Date();
    const thisYear = now.getFullYear();

    // Einstein was born March 14, 1879
    const einsteinBirth = new Date(1879, 2, 14);
    let einsteinAge = thisYear - 1879;
    // If before March 14 this year, subtract 1
    if (now < new Date(thisYear, 2, 14)) einsteinAge--;
    einsteinEl.textContent = "🎂 Albert Einstein would be " + einsteinAge + " years old today.";

    // Hawking died March 14, 2018
    let hawkingYears = thisYear - 2018;
    if (now < new Date(thisYear, 2, 14)) hawkingYears--;
    if (hawkingYears < 1) hawkingYears = 0;
    hawkingEl.textContent = "🕊️ Stephen Hawking passed away " + hawkingYears + " year" + (hawkingYears !== 1 ? "s" : "") + " ago.";
})();

// ─── Today's Pi Digit ───────────────────────────────────
(function initTodayDigit() {
    const dayOfYearEl = document.getElementById("dayOfYear");
    const digitIndexEl = document.getElementById("digitIndex");
    const digitValueEl = document.getElementById("todayDigitValue");
    if (!dayOfYearEl) return;

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 86400000;
    const dayOfYear = Math.floor(diff / oneDay);

    // Use modulo to map day to a digit in PI_DIGITS
    const digitIdx = (dayOfYear - 1) % PI_DIGITS.length;
    const digit = PI_DIGITS[digitIdx];

    dayOfYearEl.textContent = dayOfYear;
    digitIndexEl.textContent = digitIdx + 1;
    digitValueEl.textContent = digit;
})();

// ─── Pi Progress Bar ────────────────────────────────────
(function initProgressBar() {
    const fillEl = document.getElementById("piProgressFill");
    const percentEl = document.getElementById("piProgressPercent");
    if (!fillEl) return;

    function update() {
        const now = new Date();
        const year = now.getFullYear();
        const piDay = new Date(year, 2, 14);
        let lastPiDay, nextPiDay;

        if (now >= piDay) {
            lastPiDay = piDay;
            nextPiDay = new Date(year + 1, 2, 14);
        } else {
            lastPiDay = new Date(year - 1, 2, 14);
            nextPiDay = piDay;
        }

        const total = nextPiDay - lastPiDay;
        const elapsed = now - lastPiDay;
        const pct = Math.min(100, (elapsed / total) * 100);

        fillEl.style.width = pct.toFixed(2) + "%";
        percentEl.textContent = pct.toFixed(1) + "%";
    }

    update();
    setInterval(update, 60000);
})();

// ─── Pi Digit Search ────────────────────────────────────
(function initPiSearch() {
    const input = document.getElementById("piSearchInput");
    const btn = document.getElementById("piSearchBtn");
    const result = document.getElementById("piSearchResult");
    if (!input || !btn) return;

    function search() {
        const query = input.value.trim();
        if (!query || !/^\d+$/.test(query)) {
            result.textContent = "Please enter a valid number.";
            result.style.color = "#f44";
            return;
        }

        const idx = FULL_PI.replace(".", "").indexOf(query);
        if (idx === -1) {
            result.textContent = "\"" + query + "\" not found in the first 1,000 digits of π.";
            result.style.color = "#f44";
        } else {
            result.textContent = "Found \"" + query + "\" at position " + (idx + 1) + " in π!";
            result.style.color = "";
        }
    }

    btn.addEventListener("click", search);
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") search();
    });
})();

// ─── Age in Pi Years ────────────────────────────────────
(function initPiAge() {
    const input = document.getElementById("piAgeInput");
    const btn = document.getElementById("piAgeBtn");
    const result = document.getElementById("piAgeResult");
    if (!input || !btn) return;

    function calc() {
        const birthYear = parseInt(input.value, 10);
        if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) {
            result.textContent = "Please enter a valid birth year.";
            result.style.color = "#f44";
            return;
        }

        const age = new Date().getFullYear() - birthYear;
        const piAge = (age / Math.PI).toFixed(4);
        result.textContent = "You are ~" + age + " years old = " + piAge + " π years! 🥧";
        result.style.color = "";
    }

    btn.addEventListener("click", calc);
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") calc();
    });
})();

// ─── Pi Memory Challenge ────────────────────────────────
(function initMemoryChallenge() {
    const input = document.getElementById("memoryInput");
    const display = document.getElementById("memoryDisplay");
    const result = document.getElementById("memoryResult");
    if (!input) return;

    let correctCount = 0;
    let gameOver = false;

    input.addEventListener("input", function () {
        if (gameOver) return;

        const typed = input.value;
        const lastChar = typed[typed.length - 1];

        if (!lastChar || !/\d/.test(lastChar)) {
            input.value = typed.slice(0, -1);
            return;
        }

        const expectedDigit = PI_DIGITS[correctCount];

        if (lastChar === expectedDigit) {
            correctCount++;
            display.textContent = "3." + PI_DIGITS.substring(0, correctCount);
            result.textContent = correctCount + " digit" + (correctCount !== 1 ? "s" : "") + " correct!";
            result.style.color = "";
        } else {
            gameOver = true;
            input.disabled = true;
            result.textContent = "❌ Wrong! You got " + correctCount + " digit" + (correctCount !== 1 ? "s" : "") + " right. The next digit was " + expectedDigit + ". Click to retry.";
            result.style.color = "#f44";
            result.style.cursor = "pointer";
            result.addEventListener("click", function retry() {
                correctCount = 0;
                gameOver = false;
                input.disabled = false;
                input.value = "";
                display.textContent = "3.";
                result.textContent = "";
                result.style.cursor = "";
                result.removeEventListener("click", retry);
                input.focus();
            });
        }

        // Clear input so user types one digit at a time
        input.value = "";
    });
})();

// ─── Copy Pi Digits ─────────────────────────────────────
(function initCopyDigits() {
    const btn = document.getElementById("copyDigitsBtn");
    if (!btn) return;

    btn.addEventListener("click", function () {
        navigator.clipboard.writeText(FULL_PI).then(function () {
            btn.textContent = "✅ Copied!";
            setTimeout(function () { btn.textContent = "📋 Copy Digits"; }, 2000);
        }).catch(function () {
            // Fallback
            var ta = document.createElement("textarea");
            ta.value = FULL_PI;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            btn.textContent = "✅ Copied!";
            setTimeout(function () { btn.textContent = "📋 Copy Digits"; }, 2000);
        });
    });
})();

// ─── Calendar Links ─────────────────────────────────────
(function initCalendar() {
    const googleBtn = document.getElementById("googleCalBtn");
    const icalBtn = document.getElementById("icalBtn");
    if (!googleBtn || !icalBtn) return;

    const now = new Date();
    let year = now.getFullYear();
    // Target next Pi Day
    if (now > new Date(year, 2, 14, 23, 59, 59)) year++;

    const dateStr = year + "0314";

    // Google Calendar
    var gcUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent("🥧 Pi Day — 3.14") +
        "&dates=" + dateStr + "T000000Z/" + dateStr + "T235959Z" +
        "&details=" + encodeURIComponent("Happy Pi Day! π = 3.14159265358979323846… Celebrate the most irrational day of the year!") +
        "&location=" + encodeURIComponent("Everywhere 🌍");
    googleBtn.href = gcUrl;

    // iCal download
    icalBtn.addEventListener("click", function () {
        var ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Pi Day//EN",
            "BEGIN:VEVENT",
            "DTSTART;VALUE=DATE:" + dateStr,
            "DTEND;VALUE=DATE:" + dateStr,
            "SUMMARY:🥧 Pi Day — 3.14",
            "DESCRIPTION:Happy Pi Day! π = 3.14159265358979323846… Celebrate the most irrational day of the year!",
            "LOCATION:Everywhere 🌍",
            "STATUS:CONFIRMED",
            "BEGIN:VALARM",
            "TRIGGER:-PT1H",
            "DESCRIPTION:Pi Day is today!",
            "ACTION:DISPLAY",
            "END:VALARM",
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "pi-day-" + year + ".ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
})();

// ─── Share Buttons ──────────────────────────────────────
(function initShare() {
    var pageUrl = window.location.href || "https://professorquantumuniverse.github.io/Pi-Day/";
    var text = "🥧 Happy Pi Day! π = 3.14159… Check out this awesome Pi Day website! 🎉";

    var twitterBtn = document.getElementById("shareTwitter");
    var whatsappBtn = document.getElementById("shareWhatsApp");
    var facebookBtn = document.getElementById("shareFacebook");
    var linkedinBtn = document.getElementById("shareLinkedIn");
    var copyLinkBtn = document.getElementById("shareCopyLink");

    if (twitterBtn) {
        twitterBtn.addEventListener("click", function () {
            window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(pageUrl), "_blank", "noopener,noreferrer");
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", function () {
            window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + pageUrl), "_blank", "noopener,noreferrer");
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener("click", function () {
            window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl), "_blank", "noopener,noreferrer");
        });
    }

    if (linkedinBtn) {
        linkedinBtn.addEventListener("click", function () {
            window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(pageUrl), "_blank", "noopener,noreferrer");
        });
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", function () {
            navigator.clipboard.writeText(pageUrl).then(function () {
                copyLinkBtn.textContent = "✅ Copied!";
                setTimeout(function () { copyLinkBtn.textContent = "🔗 Copy Link"; }, 2000);
            }).catch(function () {
                var ta = document.createElement("textarea");
                ta.value = pageUrl;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                copyLinkBtn.textContent = "✅ Copied!";
                setTimeout(function () { copyLinkBtn.textContent = "🔗 Copy Link"; }, 2000);
            });
        });
    }
})();

// ─── Scroll-to-Top Button ───────────────────────────────
(function initScrollTop() {
    var btn = document.getElementById("scrollTop");
    if (!btn) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 400) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
    });

    btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();

// ─── Theme Toggle ───────────────────────────────────────
(function initTheme() {
    var btn = document.getElementById("themeToggle");
    var metaTheme = document.getElementById("themeColorMeta");
    if (!btn) return;

    // Restore saved theme
    var saved = localStorage.getItem("piday-theme");
    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
        btn.textContent = saved === "light" ? "☀️" : "🌙";
        if (metaTheme) metaTheme.content = saved === "light" ? "#f0f0f5" : "#0a0a0f";
    }

    btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("piday-theme", next);
        btn.textContent = next === "light" ? "☀️" : "🌙";
        if (metaTheme) metaTheme.content = next === "light" ? "#f0f0f5" : "#0a0a0f";
    });
})();

// ─── Mobile Nav Menu ────────────────────────────────────
(function initNavMenu() {
    var btn = document.getElementById("navMenuBtn");
    var links = document.querySelector(".nav-links");
    if (!btn || !links) return;

    btn.addEventListener("click", function () {
        links.classList.toggle("open");
        btn.textContent = links.classList.contains("open") ? "✕" : "☰";
    });

    // Close menu on link click
    links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
            links.classList.remove("open");
            btn.textContent = "☰";
        });
    });
})();

// ─── Visit Counter ──────────────────────────────────────
(function initVisitCounter() {
    var el = document.getElementById("visitCounter");
    if (!el) return;

    var count = parseInt(localStorage.getItem("piday-visits") || "0", 10) + 1;
    localStorage.setItem("piday-visits", String(count));
    el.textContent = "🔢 Visit #" + count;
})();

// ─── Hero Stats ─────────────────────────────────────────
(function initHeroStats() {
    var container = document.getElementById("heroStats");
    if (!container) return;

    var now = new Date();
    var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    var digitIdx = (dayOfYear - 1) % PI_DIGITS.length;

    var stats = [
        { label: "Today's π digit", value: "#" + (digitIdx + 1) + " = " + PI_DIGITS[digitIdx] },
        { label: "Digits computed", value: "100+ trillion" },
        { label: "Year discovered", value: "~1900 BC" }
    ];

    stats.forEach(function (s) {
        var el = document.createElement("div");
        el.className = "hero-stat";
        el.innerHTML = s.label + ": <strong>" + s.value + "</strong>";
        container.appendChild(el);
    });
})();

// ─── Confetti on Pi Day ─────────────────────────────────
(function initConfetti() {
    var now = new Date();
    if (now.getMonth() !== 2 || now.getDate() !== 14) return;

    var canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    var particles = [];
    var colors = ["#00ff41", "#f5c842", "#42a5f5", "#ff6b6b", "#c084fc", "#ffffff"];

    for (var i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 2 + 1,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.1,
            drift: (Math.random() - 0.5) * 0.5
        });
    }

    var running = true;
    // Stop confetti after 15 seconds
    setTimeout(function () { running = false; }, 15000);

    function draw() {
        if (!running && particles.every(function (p) { return p.y > canvas.height; })) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(function (p) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();

            if (running || p.y < canvas.height) {
                p.y += p.speed;
                p.x += p.drift;
                p.angle += p.spin;
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

// ─── Konami Code Easter Egg ─────────────────────────────
(function initKonami() {
    var code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    var pos = 0;

    document.addEventListener("keydown", function (e) {
        if (e.keyCode === code[pos]) {
            pos++;
            if (pos === code.length) {
                pos = 0;
                activateKonami();
            }
        } else {
            pos = 0;
        }
    });

    function activateKonami() {
        document.body.classList.add("konami-active");

        // Show toast
        var toast = document.createElement("div");
        toast.className = "konami-toast";
        toast.innerHTML = "<h2>🎮 Konami Code!</h2><p>You found the secret! π = 3.14159… forever! 🥧</p><p style='margin-top:0.5rem;font-size:1.5rem'>π π π π π π π</p>";
        document.body.appendChild(toast);

        setTimeout(function () {
            document.body.classList.remove("konami-active");
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 5000);
    }
})();
