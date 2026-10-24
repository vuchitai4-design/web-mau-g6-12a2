/* ==========================================
   G6 CASINO SCRIPT: VÒNG QUAY, MỞ RƯƠNG, SLOT, XỔ SỐ & AUTH
   ========================================== */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXVzcqTbJ40ITTVmPst5Nn-eLc09_z109ORKCcCgDUR2mLP9fSnaJPLrWbxwZBeYY/exec";

// HÀM HIỂN THỊ POPUP THÔNG BÁO TÙY CHỈNH
function showCustomAlert(message) {
    const overlay = document.getElementById('customAlertOverlay');
    const msgEl = document.getElementById('customAlertMessage');
    if (overlay && msgEl) {
        msgEl.innerText = message;
        overlay.classList.add('show');
    } else {
        alert(message);
    }
}

document.getElementById('customAlertBtn')?.addEventListener('click', () => {
    document.getElementById('customAlertOverlay')?.classList.remove('show');
});

document.getElementById('customAlertOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('customAlertOverlay')) {
        document.getElementById('customAlertOverlay').classList.remove('show');
    }
});

// SỬA LỖI NÚT XEM MẬT KHẨU (.toggle-pwd)
document.querySelectorAll('.toggle-pwd').forEach(icon => {
    icon.addEventListener('click', () => {
        const targetId = icon.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    });
});

// 1. CHẾ ĐỘ SÁNG / TỐI
const btnDark = document.getElementById('btn-dark');
const btnLight = document.getElementById('btn-light');
const jp88Container = document.getElementById('jp88-container');

btnDark?.addEventListener('click', () => {
    btnDark.classList.add('active');
    btnLight.classList.remove('active');
    jp88Container.classList.remove('light-mode');
});

btnLight?.addEventListener('click', () => {
    btnLight.classList.add('active');
    btnDark.classList.remove('active');
    jp88Container.classList.add('light-mode');
});

// 2. THU GỌN SIDEBAR & LOGO
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebar = document.getElementById('sidebar');
const logoHome = document.getElementById('logoHome');

menuToggleBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
});

logoHome?.addEventListener('click', () => {
    switchView('home');
    syncActiveMenu('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 3. ĐIỀU HƯỚNG VIEW
const topNavItems = document.querySelectorAll('#topNavLinks .nav-item');
const sidebarMenuItems = document.querySelectorAll('#sidebarMenu .menu-item');
const homeView = document.getElementById('homeView');
const wheel8View = document.getElementById('wheel8View');
const chestGameView = document.getElementById('chestGameView');
const slotView = document.getElementById('slotView');
const lotteryView = document.getElementById('lotteryView');
const otherView = document.getElementById('otherView');

function switchView(target) {
    if (!homeView || !wheel8View || !chestGameView || !slotView || !lotteryView || !otherView) return;
    homeView.style.display = 'none';
    wheel8View.style.display = 'none';
    chestGameView.style.display = 'none';
    slotView.style.display = 'none';
    lotteryView.style.display = 'none';
    otherView.style.display = 'none';

    if (target === 'home') {
        homeView.style.display = 'block';
    } else if (target === 'wheel8') {
        wheel8View.style.display = 'block';
    } else if (target === 'inventory') {
        chestGameView.style.display = 'block';
    } else if (target === 'slot') {
        slotView.style.display = 'block';
    } else if (target === 'lottery') {
        lotteryView.style.display = 'block';
    } else {
        otherView.style.display = 'block';
    }
}

function syncActiveMenu(target) {
    topNavItems.forEach(nav => {
        if (nav.getAttribute('data-target') === target) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    sidebarMenuItems.forEach(menu => {
        if (menu.getAttribute('data-target') === target) {
            menu.classList.add('active');
        } else {
            menu.classList.remove('active');
        }
    });
}

topNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target') || 'other';
        syncActiveMenu(target);
        switchView(target);
    });
});

sidebarMenuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target') || 'other';
        syncActiveMenu(target);
        switchView(target);
    });
});

// 4. VÒNG QUAY 8 Ô
function getStorageKeys() {
    const loggedUser = localStorage.getItem('g6_logged_user');
    const prefix = loggedUser ? `g6_${loggedUser}_` : 'g6_guest_';
    return {
        turn: prefix + 'cycle_turn',
        hits: prefix + 'hit_indices'
    };
}

const SPIN_COSTS = [3, 6, 9, 19, 29, 49, 69, 99];

function getCycleTurn() {
    let keys = getStorageKeys();
    return parseInt(localStorage.getItem(keys.turn) || '1');
}

function setCycleTurn(val) {
    let keys = getStorageKeys();
    localStorage.setItem(keys.turn, val);
}

function getHitIndices() {
    let keys = getStorageKeys();
    return JSON.parse(localStorage.getItem(keys.hits) || '[]');
}

function setHitIndices(arr) {
    let keys = getStorageKeys();
    localStorage.setItem(keys.hits, JSON.stringify(arr));
}

let userTokens = parseInt(localStorage.getItem('g6_user_tokens') || '0');

const btnWheelSpin = document.getElementById("btn-wheel-spin");
const wheelSpinCenter = document.getElementById("wheelSpinCenter");
const winPopup = document.getElementById("win-popup");
const winTier = document.getElementById("win-tier");
const winIcon = document.getElementById("win-icon");
const winAmount = document.getElementById("win-amount");
const wheelCells = document.querySelectorAll(".wheel-cell");

const wheelSlotMap = [
    { name: "Giấy vẽ bùa (x2)", prizeText: "Giấy vẽ bùa (x2)", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 2 },
    { name: "Giấy vẽ bùa", prizeText: "Giấy vẽ bùa", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 1 },
    { name: "Rương Vật Phẩm SS+", prizeText: "Rương SS+", icon: "RESOURCE/Rương SS+.png", targetKey: "Rương SS+", qty: 1 },
    { name: "Giấy vẽ bùa (x3)", prizeText: "Giấy vẽ bùa (x3)", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 3 },
    { name: "Giấy vẽ bùa (x2)", prizeText: "Giấy vẽ bùa (x2)", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 2 },
    { name: "Giấy vẽ bùa", prizeText: "Giấy vẽ bùa", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 1 },
    { name: "Giấy vẽ bùa (x5)", prizeText: "Giấy vẽ bùa (x5)", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 5 },
    { name: "Giấy vẽ bùa (x3)", prizeText: "Giấy vẽ bùa (x3)", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 3 }
];

function updateSpinButtonUI() {
    let turn = getCycleTurn();
    let cost = SPIN_COSTS[turn - 1] || 3;
    const centerText = document.querySelector('.center-text');
    if (centerText) {
        centerText.innerHTML = `QUAY<br><span class="token-inline">${cost} <span class="token-icon-mini"></span></span>`;
    }
    if (btnWheelSpin) {
        btnWheelSpin.innerHTML = `🎡 QUAY VÒNG QUAY (${cost} <span class="token-icon-btn"></span>)`;
    }
}

function updateWheelGridVisuals() {
    let hitIndices = getHitIndices();
    wheelCells.forEach(cell => {
        let idx = parseInt(cell.getAttribute('data-index'));
        if (hitIndices.includes(idx)) {
            cell.classList.add('hit-gray-cell');
        } else {
            cell.classList.remove('hit-gray-cell');
        }
    });
}

let isSpinningWheel = false;

function spinWheel8() {
    if (isSpinningWheel) return;
    
    let turn = getCycleTurn();
    let cost = SPIN_COSTS[turn - 1] || 3;

    if (userTokens < cost) {
        showCustomAlert(`⚠️ Bạn cần ${cost} Token để quay lượt này! Vui lòng tích lũy thêm.`);
        return;
    }

    userTokens -= cost;
    saveUserTokens();
    updateUI();

    const loggedUser = localStorage.getItem('g6_logged_user');
    if (loggedUser) {
        syncTokensToSheet(loggedUser, userTokens);
    }

    isSpinningWheel = true;

    let hitIndicesInCycle = getHitIndices();
    let targetIndex;
    if (turn === 8) {
        targetIndex = 2;
    } else {
        let availableIndices = [];
        for (let i = 0; i < 8; i++) {
            if (i === 2) continue;
            if (!hitIndicesInCycle.includes(i)) {
                availableIndices.push(i);
            }
        }
        if (availableIndices.length === 0) {
            availableIndices = [0, 1, 3, 4, 5, 6, 7];
        }
        targetIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    let currentStep = 0;
    let totalSteps = 24 + targetIndex;
    let speed = 40;

    function animateSpin() {
        wheelCells.forEach(c => c.classList.remove("active-slot"));
        let activeIdx = currentStep % 8;
        let cellToActivate = document.querySelector(`.wheel-cell[data-index="${activeIdx}"]`);
        if (cellToActivate) cellToActivate.classList.add("active-slot");

        currentStep++;
        if (currentStep <= totalSteps) {
            speed += 3;
            setTimeout(animateSpin, speed);
        } else {
            isSpinningWheel = false;

            hitIndicesInCycle.push(targetIndex);
            
            turn++;
            if (turn > 8) {
                turn = 1;
                hitIndicesInCycle = [];
            }
            setCycleTurn(turn);
            setHitIndices(hitIndicesInCycle);

            let wonItem = wheelSlotMap[targetIndex];
            addItemToInventory(wonItem);

            updateSpinButtonUI();
            updateUI();
            updateWheelGridVisuals();
            showWinPopup(wonItem);
        }
    }

    animateSpin();
}

// 5. MỞ RƯƠNG VẬT PHẨM (25 TOKEN)
const chestCards = document.querySelectorAll('.chest-card');

let chestBackdrop = document.querySelector('.chest-backdrop');
if (!chestBackdrop) {
    chestBackdrop = document.createElement('div');
    chestBackdrop.className = 'chest-backdrop';
    document.body.appendChild(chestBackdrop);
}

chestCards.forEach(card => {
    card.addEventListener('click', () => {
        let cost = 25;
        if (userTokens < cost) {
            showCustomAlert(`⚠️ Bạn cần ${cost} Token để mở rương! Vui lòng tích lũy thêm.`);
            return;
        }

        userTokens -= cost;
        saveUserTokens();
        updateUI();

        const loggedUser = localStorage.getItem('g6_logged_user');
        if (loggedUser) {
            syncTokensToSheet(loggedUser, userTokens);
        }

        chestBackdrop.classList.add('show');
        chestCards.forEach(c => {
            if (c !== card) {
                c.classList.add('fade-out');
            }
        });
        card.classList.add('opening-center');

        let rand = Math.random() * 100;
        let prize;

        if (rand < 75) {
            prize = { name: "Rương A", prizeText: "Rương A", icon: "RESOURCE/Rương A.png", targetKey: "Rương A", qty: 1 };
        } else if (rand < 84) {
            prize = { name: "Rương S", prizeText: "Rương S", icon: "RESOURCE/Rương S.png", targetKey: "Rương S", qty: 1 };
        } else if (rand < 85) {
            prize = { name: "Rương SS", prizeText: "Rương SS", icon: "RESOURCE/Rương SS.png", targetKey: "Rương SS", qty: 1 };
        } else {
            prize = { name: "Giấy vẽ bùa", prizeText: "Giấy vẽ bùa", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 1 };
        }

        setTimeout(() => {
            addItemToInventory(prize);
            showWinPopup(prize);

            winPopup.onclick = () => {
                winPopup.classList.remove("show");
                chestBackdrop.classList.remove('show');
                card.classList.remove('opening-center');
                chestCards.forEach(c => c.classList.remove('fade-out'));
                winPopup.onclick = null;
            };
        }, 800);
    });
});

// 6. SLOT MACHINE (25 TOKEN)
const btnSlotSpin = document.getElementById('btnSlotSpin');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');

const slotSymbolsList = [
    { name: "Giấy vẽ bùa", icon: "RESOURCE/Giấy vẽ bùa.png" },
    { name: "Rương A", icon: "RESOURCE/Rương A.png" },
    { name: "Rương S", icon: "RESOURCE/Rương S.png" },
    { name: "Rương SS", icon: "RESOURCE/Rương SS.png" },
    { name: "Rương SSS", icon: "RESOURCE/Rương SSS.png" },
    { name: "Rương SSS+", icon: "RESOURCE/Rương SSS+.png" }
];

let isSpinningSlot = false;

btnSlotSpin?.addEventListener('click', () => {
    if (isSpinningSlot) return;

    let cost = 25;
    if (userTokens < cost) {
        showCustomAlert(`⚠️ Bạn cần ${cost} Token để quay Slot Machine! Vui lòng tích lũy thêm.`);
        return;
    }

    userTokens -= cost;
    saveUserTokens();
    updateUI();

    const loggedUser = localStorage.getItem('g6_logged_user');
    if (loggedUser) {
        syncTokensToSheet(loggedUser, userTokens);
    }

    isSpinningSlot = true;
    btnSlotSpin.disabled = true;

    let rand = Math.random() * 100;
    let resultPrize = null;

    if (rand < 25) {
        resultPrize = null;
    } else if (rand < 35) {
        resultPrize = { name: "Giấy vẽ bùa", prizeText: "Giấy vẽ bùa", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 1 };
    } else if (rand < 90) {
        resultPrize = { name: "Rương A", prizeText: "Rương A", icon: "RESOURCE/Rương A.png", targetKey: "Rương A", qty: 1 };
    } else if (rand < 98) {
        resultPrize = { name: "Rương S", prizeText: "Rương S", icon: "RESOURCE/Rương S.png", targetKey: "Rương S", qty: 1 };
    } else if (rand < 99.5) {
        resultPrize = { name: "Rương SS", prizeText: "Rương SS", icon: "RESOURCE/Rương SS.png", targetKey: "Rương SS", qty: 1 };
    } else if (rand < 99.9) {
        resultPrize = { name: "Rương SSS", prizeText: "Nổ Hũ Rương SSS", icon: "RESOURCE/Rương SSS.png", targetKey: "Rương SSS", qty: 1 };
    } else {
        resultPrize = { name: "Rương SSS+", prizeText: "Nổ Hũ Siêu Cấp SSS+", icon: "RESOURCE/Rương SSS+.png", targetKey: "Rương SSS+", qty: 1 };
    }

    let spinInterval = setInterval(() => {
        if (reel1) reel1.innerHTML = `<div class="slot-symbol"><img src="${slotSymbolsList[Math.floor(Math.random() * slotSymbolsList.length)].icon}" class="symbol-img"></div>`;
        if (reel2) reel2.innerHTML = `<div class="slot-symbol"><img src="${slotSymbolsList[Math.floor(Math.random() * slotSymbolsList.length)].icon}" class="symbol-img"></div>`;
        if (reel3) reel3.innerHTML = `<div class="slot-symbol"><img src="${slotSymbolsList[Math.floor(Math.random() * slotSymbolsList.length)].icon}" class="symbol-img"></div>`;
    }, 80);

    setTimeout(() => {
        clearInterval(spinInterval);
        isSpinningSlot = false;
        btnSlotSpin.disabled = false;

        if (resultPrize) {
            if (reel1) reel1.innerHTML = `<div class="slot-symbol"><img src="${resultPrize.icon}" class="symbol-img"></div>`;
            if (reel2) reel2.innerHTML = `<div class="slot-symbol"><img src="${resultPrize.icon}" class="symbol-img"></div>`;
            if (reel3) reel3.innerHTML = `<div class="slot-symbol"><img src="${resultPrize.icon}" class="symbol-img"></div>`;

            addItemToInventory(resultPrize);
            showWinPopup(resultPrize);
        } else {
            if (reel1) reel1.innerHTML = `<div class="slot-symbol"><img src="${slotSymbolsList[0].icon}" class="symbol-img"></div>`;
            if (reel2) reel2.innerHTML = `<div class="slot-symbol"><img src="${slotSymbolsList[1].icon}" class="symbol-img"></div>`;
            if (reel3) reel3.innerHTML = `<div class="slot-symbol"><img src="${slotSymbolsList[2].icon}" class="symbol-img"></div>`;

            showCustomAlert('😢 Rất tiếc, bạn không trúng thưởng lần này. Hãy thử lại nhé!');
        }
    }, 1500);
});

// 7. XỔ SỐ (LOTTERY CÀO VÉ - 12 TOKEN / LƯỢT)
// 7. XỔ SỐ (LOTTERY CÀO VÉ - 12 TOKEN / LƯỢT)
const lotteryWrappers = document.querySelectorAll('.lottery-ticket-wrapper');
const btnResetLottery = document.getElementById('btnResetLottery');
let lotteryPlayedInRound = false;

function resetLotteryRound() {
    lotteryPlayedInRound = false;
    if (btnResetLottery) btnResetLottery.style.display = 'none';
    lotteryWrappers.forEach(w => {
        w.classList.remove('selected', 'flipped', 'inactive');
        const canvas = w.querySelector('.scratch-canvas');
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7f8c8d';
        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎫 CÀO TẠI ĐÂY 🎫', canvas.width / 2, canvas.height / 2 + 6);
        const prizeImg = w.querySelector('.lottery-prize-img');
        if (prizeImg) prizeImg.style.display = 'block';
    });
}

lotteryWrappers.forEach((wrapper, index) => {
    const canvas = wrapper.querySelector('.scratch-canvas');
    const ctx = canvas.getContext('2d');
    const prizeImg = wrapper.querySelector('.lottery-prize-img');
    const prizeTextEl = wrapper.querySelector('.lottery-prize-text');

    function initScratchCard(prizeData) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7f8c8d';
        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎫 CÀO TẠI ĐÂY 🎫', canvas.width / 2, canvas.height / 2 + 6);

        if (prizeData) {
            prizeImg.style.display = 'block';
            prizeImg.src = prizeData.icon;
            prizeTextEl.innerText = prizeData.prizeText;
        } else {
            prizeImg.style.display = 'none';
            prizeTextEl.innerText = '😢 Không trúng';
        }
    }

    wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        if (lotteryPlayedInRound) return;

        let cost = 12;
        if (userTokens < cost) {
            showCustomAlert(`⚠️ Bạn cần ${cost} Token để chơi Xổ Số! Vui lòng tích lũy thêm.`);
            return;
        }

        userTokens -= cost;
        saveUserTokens();
        updateUI();

        const loggedUser = localStorage.getItem('g6_logged_user');
        if (loggedUser) {
            syncTokensToSheet(loggedUser, userTokens);
        }

        lotteryPlayedInRound = true;

        // Tỷ lệ trúng thưởng Xổ Số
        let rand = Math.random() * 100;
        let prize = null;

        if (rand < 55) {
            prize = null; // Không trúng (55%)
        } else if (rand < 71) {
            prize = { name: "Giấy vẽ bùa", prizeText: "Giấy vẽ bùa", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 1 }; // 16%
        } else if (rand < 89) {
            prize = { name: "Rương A", prizeText: "Rương A", icon: "RESOURCE/Rương A.png", targetKey: "Rương A", qty: 1 }; // 18%
        } else if (rand < 98) {
            prize = { name: "Rương S", prizeText: "Rương S", icon: "RESOURCE/Rương S.png", targetKey: "Rương S", qty: 1 }; // 9%
        } else if (rand < 99) {
            prize = { name: "Rương SS", prizeText: "Rương SS", icon: "RESOURCE/Rương SS.png", targetKey: "Rương SS", qty: 1 }; // 1%
        } else if (rand < 99.75) {
            prize = { name: "Rương SS+", prizeText: "Rương SS+", icon: "RESOURCE/Rương SS+.png", targetKey: "Rương SS+", qty: 1 }; // 0.75%
        } else {
            prize = { name: "Rương SSS", prizeText: "Rương SSS", icon: "RESOURCE/Rương SSS.png", targetKey: "Rương SSS", qty: 1 }; // 0.25%
        }

        initScratchCard(prize);

        lotteryWrappers.forEach((w, idx) => {
            if (idx === index) {
                w.classList.add('selected');
                w.classList.add('flipped');
            } else {
                w.classList.add('inactive');
            }
        });

        if (btnResetLottery) btnResetLottery.style.display = 'block';

        let isDrawing = false;
        let scratchedTriggered = false;

        function scratch(ev) {
            if (!isDrawing || scratchedTriggered) return;
            const rect = canvas.getBoundingClientRect();
            const clientX = ev.clientX || (ev.touches && ev.touches[0].clientX);
            const clientY = ev.clientY || (ev.touches && ev.touches[0].clientY);
            if (!clientX || !clientY) return;

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2, false);
            ctx.fill();

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentCount = 0;
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] < 128) {
                    transparentCount++;
                }
            }
            let scratchedPercent = transparentCount / (pixels.length / 4);

            if (scratchedPercent > 0.35 && !scratchedTriggered) {
                scratchedTriggered = true;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                setTimeout(() => {
                    if (prize) {
                        addItemToInventory(prize);
                        showWinPopup(prize);
                    } else {
                        showCustomAlert('😢 Vé này không trúng thưởng. Chúc bạn may mắn lần sau!');
                    }
                }, 300);
            }
        }

        canvas.addEventListener('mousedown', (ev) => { isDrawing = true; scratch(ev); });
        canvas.addEventListener('mousemove', scratch);
        window.addEventListener('mouseup', () => { isDrawing = false; });

        canvas.addEventListener('touchstart', (ev) => { isDrawing = true; scratch(ev); });
        canvas.addEventListener('touchmove', scratch);
        window.addEventListener('touchend', () => { isDrawing = false; });
    });
});

// Bấm ra vùng bên ngoài (stage hoặc container) để thoát về dàn thẻ cào
const lotteryGameContainer = document.querySelector('.lottery-game-container');
lotteryGameContainer?.addEventListener('click', (e) => {
    const selectedWrapper = document.querySelector('.lottery-ticket-wrapper.selected');
    if (selectedWrapper && !e.target.closest('.lottery-ticket-wrapper.selected') && !e.target.closest('.win-popup') && !e.target.closest('.custom-alert-overlay')) {
        resetLotteryRound();
    }
});

btnResetLottery?.addEventListener('click', () => {
    resetLotteryRound();
});

// 8. TỦ ĐỒ (8 MÓN CỐ ĐỊNH)
function getDefaultInventory() {
    return {
        "Huy hiệu": { count: 0, icon: "RESOURCE/Huy hiệu.png", name: "Huy hiệu" },
        "Giấy vẽ bùa": { count: 0, icon: "RESOURCE/Giấy vẽ bùa.png", name: "Giấy vẽ bùa" },
        "Rương A": { count: 0, icon: "RESOURCE/Rương A.png", name: "Rương A" },
        "Rương S": { count: 0, icon: "RESOURCE/Rương S.png", name: "Rương S" },
        "Rương SS": { count: 0, icon: "RESOURCE/Rương SS.png", name: "Rương SS" },
        "Rương SS+": { count: 0, icon: "RESOURCE/Rương SS+.png", name: "Rương SS+" },
        "Rương SSS": { count: 0, icon: "RESOURCE/Rương SSS.png", name: "Rương SSS" },
        "Rương SSS+": { count: 0, icon: "RESOURCE/Rương SSS+.png", name: "Rương SSS+" }
    };
}

let userInventory = JSON.parse(localStorage.getItem('g6_user_inventory') || JSON.stringify(getDefaultInventory()));

function addItemToInventory(wonItem) {
    let key = wonItem.targetKey;
    let qty = wonItem.qty || 1;

    if (userInventory[key]) {
        userInventory[key].count += qty;
    }

    localStorage.setItem('g6_user_inventory', JSON.stringify(userInventory));
    renderInventory();

    const loggedUser = localStorage.getItem('g6_logged_user');
    if (loggedUser) {
        syncInventoryToSheet(loggedUser, userInventory);
    }
}

function renderInventory() {
    const invGrid = document.getElementById('inventoryGrid');
    if (!invGrid) return;
    invGrid.innerHTML = '';
    
    Object.keys(userInventory).forEach(key => {
        let item = userInventory[key];
        let card = document.createElement('div');
        card.className = 'inv-item-card';
        card.innerHTML = `
            <span class="inv-item-count">${item.count}</span>
            <img src="${item.icon}" alt="${key}" class="inv-item-img">
            <span class="inv-item-name">${item.name}</span>
        `;
        invGrid.appendChild(card);
    });
}

const backpackFloatBtn = document.getElementById('backpackFloatBtn');
const inventoryModalOverlay = document.getElementById('inventoryModalOverlay');
const closeInventoryModal = document.getElementById('closeInventoryModal');

backpackFloatBtn?.addEventListener('click', () => {
    renderInventory();
    inventoryModalOverlay?.classList.add('show');
});

closeInventoryModal?.addEventListener('click', () => {
    inventoryModalOverlay?.classList.remove('show');
});

inventoryModalOverlay?.addEventListener('click', (e) => {
    if (e.target === inventoryModalOverlay) {
        inventoryModalOverlay.classList.remove('show');
    }
});

function updateUI() {
    document.querySelectorAll('#user-token-count').forEach(el => {
        el.innerText = userTokens;
    });
}

function saveUserTokens() {
    localStorage.setItem('g6_user_tokens', userTokens);
}

function showWinPopup(result) {
    if (!winPopup) return;
    winTier.innerText = result.name;
    winIcon.innerHTML = `<img src="${result.icon}" style="width: 5vw; height: 5vw; object-fit: contain; filter: drop-shadow(0 0 0.8vw #f1c40f);">`;
    winAmount.innerText = result.prizeText;
    winPopup.classList.add("show");
}

winPopup?.addEventListener("click", () => {
    winPopup.classList.remove("show");
});

btnWheelSpin?.addEventListener("click", spinWheel8);
wheelSpinCenter?.addEventListener("click", spinWheel8);

// 9. CAROUSEL
const carouselContainer = document.getElementById('gameCarousel');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.querySelectorAll('#carouselDots .dot');
let currentSlide = 0;
const totalSlides = 2;

function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;
    if (carouselTrack) {
        carouselTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    carouselDots.forEach((dot, idx) => {
        if (idx === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

let autoSlideTimer = setInterval(() => {
    goToSlide(currentSlide + 1);
}, 10000);

function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 10000);
}

carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoSlide();
    });
});

let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

if (carouselContainer && carouselTrack) {
    carouselContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startPos = getPositionX(e);
        prevTranslate = -currentSlide * carouselContainer.offsetWidth;
        carouselTrack.style.transition = 'none';
        resetAutoSlide();
    });

    carouselContainer.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const movedBy = currentTranslate - (-currentSlide * carouselContainer.offsetWidth);
        
        if (movedBy < -50 && currentSlide < totalSlides - 1) {
            currentSlide++;
        } else if (movedBy > 50 && currentSlide > 0) {
            currentSlide--;
        }
        goToSlide(currentSlide);
        resetAutoSlide();
    });

    carouselContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + (currentPosition - startPos);
        carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
    });

    carouselContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startPos = getPositionX(e);
        prevTranslate = -currentSlide * carouselContainer.offsetWidth;
        carouselTrack.style.transition = 'none';
        resetAutoSlide();
        e.preventDefault();
    });

    carouselContainer.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        const movedBy = currentTranslate - (-currentSlide * carouselContainer.offsetWidth);
        
        if (movedBy < -50 && currentSlide < totalSlides - 1) {
            currentSlide++;
        } else if (movedBy > 50 && currentSlide > 0) {
            currentSlide--;
        }
        goToSlide(currentSlide);
        resetAutoSlide();
    });

    carouselContainer.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            goToSlide(currentSlide);
        }
    });

    carouselContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + (currentPosition - startPos);
        carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
    });
}

// 10. AUTH & GOOGLE SHEET SYNC
const authModalOverlay = document.getElementById('authModalOverlay');
const openLoginModalBtn = document.getElementById('openLoginModal');
const openRegisterModalBtn = document.getElementById('openRegisterModal');
const heroRegisterBtn = document.getElementById('heroRegisterBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const linkToRegister = document.getElementById('linkToRegister');
const linkToLogin = document.getElementById('linkToLogin');

function showModal(isRegister = false) {
    if (!authModalOverlay) return;
    authModalOverlay.classList.add('active');
    if (isRegister) {
        if (registerView) registerView.style.display = 'block';
        if (loginView) loginView.style.display = 'none';
    } else {
        if (loginView) loginView.style.display = 'block';
        if (registerView) registerView.style.display = 'none';
    }
}

function hideModal() {
    if (authModalOverlay) authModalOverlay.classList.remove('active');
}

openLoginModalBtn?.addEventListener('click', () => showModal(false));
openRegisterModalBtn?.addEventListener('click', () => showModal(true));
heroRegisterBtn?.addEventListener('click', () => showModal(true));
closeModalBtn?.addEventListener('click', hideModal);

authModalOverlay?.addEventListener('click', (e) => {
    if (e.target === authModalOverlay) hideModal();
});

linkToRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginView) loginView.style.display = 'none';
    if (registerView) registerView.style.display = 'block';
});

linkToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    if (registerView) registerView.style.display = 'none';
    if (loginView) loginView.style.display = 'block';
});

const authButtonsArea = document.getElementById('authButtonsArea');
const tokenDisplayArea = document.getElementById('tokenDisplayArea');

window.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    switchView('home');
    syncActiveMenu('home');
    updateSpinButtonUI();
    updateWheelGridVisuals();
    renderInventory();
});

async function syncTokensToSheet(email, newTokens) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'update_tokens', email: email, tokens: newTokens })
        });
    } catch (e) {
        console.log("Lỗi đồng bộ Token:", e);
    }
}

async function syncInventoryToSheet(email, inventory) {
    try {
        let invCounts = {};
        Object.keys(inventory).forEach(k => {
            invCounts[k] = inventory[k].count;
        });
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'update_inventory', email: email, inventory: invCounts })
        });
    } catch (e) {
        console.log("Lỗi đồng bộ Tủ đồ:", e);
    }
}

function checkAuthStatus() {
    const loggedUser = localStorage.getItem('g6_logged_user');
    if (loggedUser) {
        renderUserLogged(loggedUser);
    }
}

function renderUserLogged(email) {
    if (!authButtonsArea) return;
    if (tokenDisplayArea) tokenDisplayArea.style.display = 'flex';
    authButtonsArea.innerHTML = `
        <div class="token-display-badge" style="display: flex; align-items: center; gap: 0.4vw; background: rgba(241, 196, 15, 0.15); border: 0.05vw solid #f1c40f; padding: 0.25vw 0.6vw; border-radius: 0.4vw; margin-right: 0.6vw;">
            <span class="token-icon-mini"></span>
            <span id="user-token-count" style="font-family: 'Orbitron', sans-serif; font-size: 0.75vw; color: #f1c40f; font-weight: bold;">${userTokens}</span>
        </div>
        <div class="user-logged-badge" style="display: flex; align-items: center; gap: 0.5vw;">
            <span>👤 ${email}</span>
            <button class="btn-logout" id="logoutBtn" style="background: #e74c3c; color: #fff; border: none; padding: 0.2vw 0.5vw; border-radius: 4px; cursor: pointer;">Đăng xuất</button>
        </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('g6_logged_user');
        localStorage.removeItem('g6_user_tokens');
        localStorage.removeItem('g6_user_inventory');
        window.location.reload();
    });
}

const sendOtpBtn = document.getElementById('sendOtpBtn');
sendOtpBtn?.addEventListener('click', async () => {
    const email = document.getElementById('regEmailVal')?.value.trim();
    if (!email || !email.includes('@')) {
        showCustomAlert('⚠️ Vui lòng nhập địa chỉ E-Mail hợp lệ để nhận mã xác minh!');
        return;
    }

    sendOtpBtn.innerText = "Đang gửi...";
    sendOtpBtn.disabled = true;

    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'send_otp', email: email })
        });
        let result = await response.json();
        
        if (result.status === 'success') {
            showCustomAlert('✅ Đã gửi mã xác minh (OTP) tới email của bạn!');
        } else {
            showCustomAlert('❌ Lỗi: ' + result.message);
        }
    } catch (error) {
        showCustomAlert('💡 [Mô phỏng] Mã OTP của bạn là: 123456');
    } finally {
        sendOtpBtn.innerText = "Lấy Mã";
        sendOtpBtn.disabled = false;
    }
});

const submitRegisterBtn = document.getElementById('submitRegisterBtn');
submitRegisterBtn?.addEventListener('click', async () => {
    const email = document.getElementById('regEmailVal')?.value.trim();
    const otp = document.getElementById('regOtpVal')?.value.trim();
    const password = document.getElementById('regPasswordVal')?.value.trim();
    const termsCheck = document.getElementById('termsCheck');

    if (!email || !otp || !password) {
        showCustomAlert('⚠️ Vui lòng điền đầy đủ Email, Mã OTP và Mật khẩu!');
        return;
    }

    if (termsCheck && !termsCheck.checked) {
        showCustomAlert('⚠️ Bạn phải đồng ý với sự thỏa thuận của người dùng và trên 18 tuổi!');
        return;
    }

    submitRegisterBtn.innerText = "Đang xử lý...";
    submitRegisterBtn.disabled = true;

    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'register', email: email, otp: otp, password: password })
        });
        let result = await response.json();

        if (result.status === 'success') {
            localStorage.setItem('g6_' + email + '_cycle_turn', '1');
            localStorage.setItem('g6_' + email + '_hit_indices', JSON.stringify([]));

            userTokens = 10;
            saveUserTokens();

            userInventory = getDefaultInventory();
            localStorage.setItem('g6_user_inventory', JSON.stringify(userInventory));

            updateSpinButtonUI();
            updateUI();
            updateWheelGridVisuals();
            renderInventory();

            showCustomAlert('🎉 Đăng ký thành công! Bạn nhận được +10 Token và khởi tạo mới.');
            if (registerView) registerView.style.display = 'none';
            if (loginView) loginView.style.display = 'block';
            const loginEmailVal = document.getElementById('loginEmailVal');
            if (loginEmailVal) loginEmailVal.value = email;
        } else {
            showCustomAlert('❌ ' + result.message);
        }
    } catch (error) {
        showCustomAlert('❌ Lỗi kết nối đến máy chủ!');
    } finally {
        submitRegisterBtn.innerText = "Xác Thực & Đăng Ký";
        submitRegisterBtn.disabled = false;
    }
});

const submitLoginBtn = document.getElementById('submitLoginBtn');
submitLoginBtn?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmailVal')?.value.trim();
    const password = document.getElementById('loginPasswordVal')?.value.trim();

    if (!email || !password) {
        showCustomAlert('⚠️ Vui lòng nhập E-Mail và Mật khẩu!');
        return;
    }

    submitLoginBtn.innerText = "Đang kiểm tra...";
    submitLoginBtn.disabled = true;

    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', email: email, password: password })
        });
        let result = await response.json();

        if (result.status === 'success') {
            showCustomAlert('🔓 Đăng nhập thành công!');
            localStorage.setItem('g6_logged_user', email);
            
            userTokens = Number(result.tokens) || 0;
            saveUserTokens();

            if (result.inventory) {
                let defaultInv = getDefaultInventory();
                Object.keys(result.inventory).forEach(k => {
                    if (defaultInv[k]) {
                        defaultInv[k].count = Number(result.inventory[k]) || 0;
                    }
                });
                userInventory = defaultInv;
                localStorage.setItem('g6_user_inventory', JSON.stringify(userInventory));
            }

            hideModal();
            renderUserLogged(email);
            updateSpinButtonUI();
            updateUI();
            updateWheelGridVisuals();
            renderInventory();
        } else {
            showCustomAlert('❌ ' + result.message);
        }
    } catch (error) {
        showCustomAlert('❌ Lỗi kết nối đăng nhập!');
    } finally {
        submitLoginBtn.innerText = "Đăng Nhập Ngay";
        submitLoginBtn.disabled = false;
    }
});

document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
    });
});

/* ==========================================
   TÀI XỈU (SIC BO) GAME LOGIC - HOÀN CHỈNH
   ========================================== */
const taixiuView = document.getElementById('taixiuView');

// Thêm điều hướng vào switchView
const originalSwitchView = window.switchView || function(){};
// Cập nhật switchView xử lý taixiuView
function switchView(target) {
    if (!homeView || !wheel8View || !chestGameView || !slotView || !lotteryView || !taixiuView || !otherView) return;
    homeView.style.display = 'none';
    wheel8View.style.display = 'none';
    chestGameView.style.display = 'none';
    slotView.style.display = 'none';
    lotteryView.style.display = 'none';
    taixiuView.style.display = 'none';
    otherView.style.display = 'none';

    if (target === 'home') {
        homeView.style.display = 'block';
    } else if (target === 'wheel8') {
        wheel8View.style.display = 'block';
    } else if (target === 'inventory') {
        chestGameView.style.display = 'block';
    } else if (target === 'slot') {
        slotView.style.display = 'block';
    } else if (target === 'lottery') {
        lotteryView.style.display = 'block';
    } else if (target === 'taixiu') {
        taixiuView.style.display = 'block';
    } else {
        otherView.style.display = 'block';
    }
}

let txState = 'betting'; // 'betting', 'shaking', 'waiting_result', 'result'
let txTimerCountdown = 30;
let txUserChoice = null; // 'tai' hoặc 'xiu'
let txUserBetAmount = 0;
let txHistoryList = JSON.parse(localStorage.getItem('g6_tx_history') || '[]');

const txTimerEl = document.getElementById('txTimer');
const txSessionNumEl = document.getElementById('txSessionNum');
const txResultAnnouncement = document.getElementById('txResultAnnouncement');
const txBowl = document.getElementById('txBowl');
const txDice1 = document.getElementById('txDice1');
const txDice2 = document.getElementById('txDice2');
const txDice3 = document.getElementById('txDice3');
const btnTxTai = document.getElementById('btnTxTai');
const btnTxXiu = document.getElementById('btnTxXiu');
const btnTxCancel = document.getElementById('btnTxCancel');
const txTaiUser = document.getElementById('txTaiUser');
const txXiuUser = document.getElementById('txXiuUser');
const txBetInput = document.getElementById('txBetInput');
const txHistoryGrid = document.getElementById('txHistoryGrid');

// Chọn chip nhanh
document.querySelectorAll('.tx-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        let val = parseInt(chip.getAttribute('data-val'));
        if (txBetInput) txBetInput.value = val;
    });
});

// Hàm tạo hiệu ứng tiền bay
function animateFlyingCoin(fromEl, toEl, callback) {
    if (!fromEl || !toEl) {
        if (callback) callback();
        return;
    }
    const rect1 = fromEl.getBoundingClientRect();
    const rect2 = toEl.getBoundingClientRect();

    let coin = document.createElement('div');
    coin.className = 'flying-coin';
    coin.style.left = `${rect1.left + rect1.width / 2}px`;
    coin.style.top = `${rect1.top + rect1.height / 2}px`;
    document.body.appendChild(coin);

    setTimeout(() => {
        coin.style.left = `${rect2.left + rect2.width / 2}px`;
        coin.style.top = `${rect2.top + rect2.height / 2}px`;
    }, 20);

    setTimeout(() => {
        coin.remove();
        if (callback) callback();
    }, 800);
}

// Xử lý đặt cược chung (Giới hạn tổng cược tối đa 20 Token mỗi phiên)
function placeOrSwitchBet(choice) {
    if (txState !== 'betting') {
        showCustomAlert('⚠️ Đã qua thời gian đặt cược của phiên này!');
        return;
    }
    let betVal = parseInt(txBetInput?.value || '1');
    if (isNaN(betVal) || betVal < 1 || betVal > 20) {
        showCustomAlert('⚠️ Mức cược mỗi lần phải từ 1 đến 20 token!');
        return;
    }

    let sourceEl = document.querySelector('.token-display-badge') || document.getElementById('openLoginModal');
    let targetEl = choice === 'tai' ? document.getElementById('txTaiSide') : document.getElementById('txXiuSide');

    if (txUserChoice === choice) {
        // Cùng cửa -> Cược thêm, kiểm tra tổng không vượt quá 20 token
        if (txUserBetAmount + betVal > 20) {
            showCustomAlert('⚠️ Tổng số tiền cược tối đa trong 1 phiên cho phép là 20 Token!');
            return;
        }
        if (userTokens < betVal) {
            showCustomAlert('⚠️ Bạn không đủ Token để đặt thêm!');
            return;
        }
        userTokens -= betVal;
        txUserBetAmount += betVal;
        saveUserTokens();
        updateUI();

        animateFlyingCoin(sourceEl, targetEl);
    } else {
        // Đổi cửa: Kiểm tra mức cược cửa mới không vượt quá 20 token
        if (betVal > 20) {
            showCustomAlert('⚠️ Mức cược tối đa trong 1 phiên là 20 Token!');
            return;
        }
        let totalNeeded = betVal;
        if (userTokens + txUserBetAmount < totalNeeded) {
            showCustomAlert('⚠️ Bạn không đủ Token để chuyển cửa!');
            return;
        }

        userTokens += txUserBetAmount; // Hoàn cược cũ vào ví tạm thời
        userTokens -= totalNeeded;     // Trừ cược mới
        txUserBetAmount = betVal;
        txUserChoice = choice;
        saveUserTokens();
        updateUI();

        animateFlyingCoin(sourceEl, targetEl);
    }

    // Cập nhật giao diện hiển thị tiền cược
    if (txUserChoice === 'tai') {
        if (txTaiUser) txTaiUser.innerText = txUserBetAmount;
        if (txXiuUser) txXiuUser.innerText = '0';
        document.getElementById('txTaiSide')?.classList.add('selected-side');
        document.getElementById('txXiuSide')?.classList.remove('selected-side');
    } else if (txUserChoice === 'xiu') {
        if (txXiuUser) txXiuUser.innerText = txUserBetAmount;
        if (txTaiUser) txTaiUser.innerText = '0';
        document.getElementById('txXiuSide')?.classList.add('selected-side');
        document.getElementById('txTaiSide')?.classList.remove('selected-side');
    }
}

btnTxTai?.addEventListener('click', () => placeOrSwitchBet('tai'));
btnTxXiu?.addEventListener('click', () => placeOrSwitchBet('xiu'));

// Nút Hủy Cược (Rút toàn bộ tiền cược trong phiên)
btnTxCancel?.addEventListener('click', () => {
    if (txState !== 'betting') {
        showCustomAlert('⚠️ Không thể hủy cược khi đã qua thời gian đặt cược!');
        return;
    }
    if (txUserBetAmount <= 0) {
        showCustomAlert('⚠️ Bạn chưa đặt cược cửa nào trong phiên này!');
        return;
    }

    let targetEl = document.querySelector('.token-display-badge') || document.getElementById('openLoginModal');
    let sourceEl = txUserChoice === 'tai' ? document.getElementById('txTaiSide') : document.getElementById('txXiuSide');

    animateFlyingCoin(sourceEl, targetEl, () => {
        userTokens += txUserBetAmount;
        txUserBetAmount = 0;
        txUserChoice = null;
        saveUserTokens();
        updateUI();

        if (txTaiUser) txTaiUser.innerText = '0';
        if (txXiuUser) txXiuUser.innerText = '0';
        document.getElementById('txTaiSide')?.classList.remove('selected-side');
        document.getElementById('txXiuSide')?.classList.remove('selected-side');
        showCustomAlert('✅ Đã hủy cược và hoàn trả toàn bộ token về tài khoản.');
    });
});

function checkDailyCapStatus() {
    let records = JSON.parse(localStorage.getItem('g6_tx_winnings_log') || '[]');
    let now = Date.now();
    // Lọc các chiến thắng trong 24h qua
    records = records.filter(item => now - item.time < 24 * 3600 * 1000);
    localStorage.setItem('g6_tx_winnings_log', JSON.stringify(records));

    let totalWonIn24h = records.reduce((sum, item) => sum + item.amount, 0);

    if (totalWonIn24h >= 100) {
        // Tìm bản ghi cũ nhất trong danh sách 24h để tính thời gian mở khóa (sau 24h kể từ lúc đạt mốc)
        let oldestRecord = records.reduce((oldest, item) => item.time < oldest.time ? item : oldest, records[0]);
        let unlockTime = oldestRecord.time + 24 * 3600 * 1000;
        let diffMs = unlockTime - now;

        if (diffMs > 0) {
            let hours = Math.floor(diffMs / (1000 * 3600));
            let minutes = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));
            let seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            let timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            return { isLocked: true, remainingTimeStr: timeStr };
        }
    }
    return { isLocked: false, remainingTimeStr: "" };
}

// Xử lý đặt cược chung (Chặn ngay nếu đạt hạn mức 100 token/24h)
function placeOrSwitchBet(choice) {
    if (txState !== 'betting') {
        showCustomAlert('⚠️ Đã qua thời gian đặt cược của phiên này!');
        return;
    }

    // Kiểm tra chặn hạn mức 24h trước khi cho cược
    let capStatus = checkDailyCapStatus();
    if (capStatus.isLocked) {
        showCustomAlert(`🚫 Bạn đã đạt giới hạn nhận tối đa 100 Token trong vòng 24h qua!\nVui lòng đợi thêm [${capStatus.remainingTimeStr}] để tiếp tục đặt cược.`);
        return;
    }

    let betVal = parseInt(txBetInput?.value || '1');
    if (isNaN(betVal) || betVal < 1 || betVal > 20) {
        showCustomAlert('⚠️ Mức cược mỗi lần phải từ 1 đến 20 token!');
        return;
    }

    let sourceEl = document.querySelector('.token-display-badge') || document.getElementById('openLoginModal');
    let targetEl = choice === 'tai' ? document.getElementById('txTaiSide') : document.getElementById('txXiuSide');

    if (txUserChoice === choice) {
        if (txUserBetAmount + betVal > 20) {
            showCustomAlert('⚠️ Tổng số tiền cược tối đa trong 1 phiên cho phép là 20 Token!');
            return;
        }
        if (userTokens < betVal) {
            showCustomAlert('⚠️ Bạn không đủ Token để đặt thêm!');
            return;
        }
        userTokens -= betVal;
        txUserBetAmount += betVal;
        saveUserTokens();
        updateUI();

        animateFlyingCoin(sourceEl, targetEl);
    } else {
        if (betVal > 20) {
            showCustomAlert('⚠️ Mức cược tối đa trong 1 phiên là 20 Token!');
            return;
        }
        let totalNeeded = betVal;
        if (userTokens + txUserBetAmount < totalNeeded) {
            showCustomAlert('⚠️ Bạn không đủ Token để chuyển cửa!');
            return;
        }

        userTokens += txUserBetAmount; 
        userTokens -= totalNeeded;     
        txUserBetAmount = betVal;
        txUserChoice = choice;
        saveUserTokens();
        updateUI();

        animateFlyingCoin(sourceEl, targetEl);
    }

    if (txUserChoice === 'tai') {
        if (txTaiUser) txTaiUser.innerText = txUserBetAmount;
        if (txXiuUser) txXiuUser.innerText = '0';
        document.getElementById('txTaiSide')?.classList.add('selected-side');
        document.getElementById('txXiuSide')?.classList.remove('selected-side');
    } else if (txUserChoice === 'xiu') {
        if (txXiuUser) txXiuUser.innerText = txUserBetAmount;
        if (txTaiUser) txTaiUser.innerText = '0';
        document.getElementById('txXiuSide')?.classList.add('selected-side');
        document.getElementById('txTaiSide')?.classList.remove('selected-side');
    }
}

// Render bảng lịch sử cầu từ góc trái trên, hỗ trợ cuộn ngang
// Render bảng lịch sử cầu (Tối đa 30 cột, từ cột 31 sẽ tự động xóa cột đầu tiên)
function renderTxHistory() {
    if (!txHistoryGrid) return;
    txHistoryGrid.innerHTML = '';

    let columns = [];
    let currentCol = [];
    let lastType = null;

    txHistoryList.forEach((res) => {
        if (currentCol.length === 0) {
            currentCol.push(res);
            lastType = res;
        } else {
            if (res === lastType) {
                currentCol.push(res);
            } else {
                columns.push(currentCol);
                currentCol = [res];
                lastType = res;
            }
        }
    });
    if (currentCol.length > 0) {
        columns.push(currentCol);
    }

    // Giới hạn tối đa 30 cột, nếu vượt quá thì cắt bỏ các cột cũ phía đầu
    if (columns.length > 30) {
        columns = columns.slice(columns.length - 30);
    }

    columns.forEach(colData => {
        let colDiv = document.createElement('div');
        colDiv.className = 'tx-history-col';
        colData.forEach(val => {
            let cell = document.createElement('div');
            cell.className = `tx-history-cell ${val}`;
            cell.innerText = val === 'tai' ? 'T' : 'X';
            colDiv.appendChild(cell);
        });
        txHistoryGrid.appendChild(colDiv);
    });
}

// Vòng lặp Tài Xỉu
function startTxGameLoop() {
    let session = Math.floor(Math.random() * 9000) + 1000;
    if (txSessionNumEl) txSessionNumEl.innerText = session;

    txState = 'betting';
    txTimerCountdown = 30;
    txUserChoice = null;
    txUserBetAmount = 0;
    if (txTaiUser) txTaiUser.innerText = '0';
    if (txXiuUser) txXiuUser.innerText = '0';
    document.getElementById('txTaiSide')?.classList.remove('selected-side');
    document.getElementById('txXiuSide')?.classList.remove('selected-side');
    if (txBowl) txBowl.classList.remove('hidden-bowl', 'shaking');
    if (txResultAnnouncement) txResultAnnouncement.innerText = '⏳ Đang trong thời gian đặt cược...';

    let countdownInterval = setInterval(() => {
        txTimerCountdown--;
        if (txTimerEl) txTimerEl.innerText = txTimerCountdown;

        if (txTimerCountdown <= 0) {
            clearInterval(countdownInterval);
            runTxSpinPhase();
        }
    }, 1000);
}

function runTxSpinPhase() {
    txState = 'shaking';
    if (txResultAnnouncement) txResultAnnouncement.innerText = '🔄 Đĩa đang úp và lắc xúc xắc...';
    if (txBowl) txBowl.classList.add('shaking');

    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    let d3 = Math.floor(Math.random() * 6) + 1;
    let sum = d1 + d2 + d3;
    let finalResult = sum >= 11 ? 'tai' : 'xiu';

    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    if (txDice1) txDice1.innerText = diceFaces[d1 - 1];
    if (txDice2) txDice2.innerText = diceFaces[d2 - 1];
    if (txDice3) txDice3.innerText = diceFaces[d3 - 1];

    // Sau 3 giây lắc xong -> Mở đĩa (hiện xúc xắc trước)
    setTimeout(() => {
        txState = 'waiting_result';
        if (txBowl) {
            txBowl.classList.remove('shaking');
            txBowl.classList.add('hidden-bowl'); // Mở đĩa ra
        }

        let resultName = finalResult === 'tai' ? 'TÀI' : 'XỈU';
        if (txResultAnnouncement) {
            txResultAnnouncement.innerHTML = `🎲 Xúc xắc: <span style="color:#f1c40f">${d1} - ${d2} - ${d3}</span> (Chờ thông báo kết quả...)`;
        }

        // Đợi thêm 5 giây để người chơi nhìn thấy xúc xắc trước khi hiện thông báo kết quả
        setTimeout(() => {
            txState = 'result';
            if (txResultAnnouncement) {
                txResultAnnouncement.innerHTML = `🎉 Kết quả: <span style="color:#f1c40f">${d1} - ${d2} - ${d3} (Tổng: ${sum} điểm -> ${resultName})</span>`;
            }

            // Ghi nhận vào lịch sử cầu
            txHistoryList.push(finalResult);
            localStorage.setItem('g6_tx_history', JSON.stringify(txHistoryList));
            renderTxHistory();

            // Xử lý thắng thua & Hiệu ứng tiền bay ra nếu trúng
            if (txUserBetAmount > 0) {
                if (txUserChoice === finalResult) {
                    let rawWin = txUserBetAmount * 2;
                    let actualWin = checkDailyWinCap(rawWin);

                    let sourceEl = txUserChoice === 'tai' ? document.getElementById('txTaiSide') : document.getElementById('txXiuSide');
                    let targetEl = document.querySelector('.token-display-badge') || document.getElementById('openLoginModal');

                    animateFlyingCoin(sourceEl, targetEl, () => {
                        userTokens += actualWin;
                        saveUserTokens();
                        updateUI();
                    });

                    if (actualWin > 0) {
                        showCustomAlert(`🎉 Chúc mừng bạn đã thắng cược! Nhận được +${actualWin} Token.`);
                    } else {
                        showCustomAlert(`🎉 Bạn đoán đúng nhưng đã đạt giới hạn nhận tối đa 100 Token trong vòng 24h qua!`);
                    }
                } else {
                    showCustomAlert(`😢 Rất tiếc, bạn đã thua ${txUserBetAmount} Token ở phiên này.`);
                }
            }

            // Chờ 5 giây rồi bắt đầu phiên mới
            setTimeout(() => {
                startTxGameLoop();
            }, 5000);

        }, 5000); // Đợi 5s hiển thị xúc xắc

    }, 3000); // Lắc trong 3s
}

window.addEventListener('DOMContentLoaded', () => {
    renderTxHistory();
    startTxGameLoop();
});


/* ==========================================
   VỄ BÙA (AMULET GACHA) LOGIC
   ========================================== */
const amuletView = document.getElementById('amuletView');
const amuletLobbyBox = document.getElementById('amuletLobbyBox');
const amuletCanvasBox = document.getElementById('amuletCanvasBox');
const amuletCanvas = document.getElementById('amuletCanvas');
const amuletResultOverlay = document.getElementById('amuletResultOverlay');
const amuletRewardsGrid = document.getElementById('amuletRewardsGrid');
const btnDraw1 = document.getElementById('btnDraw1');
const btnDraw5 = document.getElementById('btnDraw5');
const btnAmuletOk = document.getElementById('btnAmuletOk');
const btnAmuletAgain = document.getElementById('btnAmuletAgain');

// Cập nhật switchView để hỗ trợ mở tab Vẽ Bùa ('amulet')
const superSwitchView = window.switchView || function(){};
function switchView(target) {
    if (!homeView || !wheel8View || !chestGameView || !slotView || !lotteryView || !taixiuView || !amuletView || !otherView) return;
    homeView.style.display = 'none';
    wheel8View.style.display = 'none';
    chestGameView.style.display = 'none';
    slotView.style.display = 'none';
    lotteryView.style.display = 'none';
    taixiuView.style.display = 'none';
    amuletView.style.display = 'none';
    otherView.style.display = 'none';

    if (target === 'home') {
        homeView.style.display = 'block';
    } else if (target === 'wheel8') {
        wheel8View.style.display = 'block';
    } else if (target === 'inventory') {
        chestGameView.style.display = 'block';
    } else if (target === 'slot') {
        slotView.style.display = 'block';
    } else if (target === 'lottery') {
        lotteryView.style.display = 'block';
    } else if (target === 'taixiu') {
        taixiuView.style.display = 'block';
    } else if (target === 'amulet') {
        amuletView.style.display = 'block';
        resetAmuletLobby();
    } else {
        otherView.style.display = 'block';
    }
}

let currentDrawCount = 1;

// Cập nhật số dư Giấy vẽ bùa hiển thị trong tab Vẽ Bùa
function updateAmuletPaperDisplay() {
    const paperCountEl = document.getElementById('amuletUserPaperCount');
    if (paperCountEl) {
        let paperItem = userInventory["Giấy vẽ bùa"];
        paperCountEl.innerText = paperItem ? paperItem.count : 0;
    }
}

// Bổ sung gọi hàm này vào trong hàm resetAmuletLobby() hiện tại của bạn:
function resetAmuletLobby() {
    updateAmuletPaperDisplay(); // Gọi cập nhật số dư giấy vẽ bùa
    if (amuletLobbyBox) amuletLobbyBox.style.display = 'flex';
    if (amuletCanvasBox) amuletCanvasBox.style.display = 'none';
    if (amuletResultOverlay) amuletResultOverlay.style.display = 'none';
}

// Kiểm tra và trừ Giấy vẽ bùa
function checkAndUseAmuletPaper(cost) {
    let paperItem = userInventory["Giấy vẽ bùa"];
    if (!paperItem || paperItem.count < cost) {
        showCustomAlert(`⚠️ Bạn cần ít nhất ${cost} Giấy vẽ bùa để thực hiện! Hãy kiểm tra lại Tủ đồ hoặc tham gia các trò chơi khác để nhận thêm.`);
        return false;
    }
    paperItem.count -= cost;
    localStorage.setItem('g6_user_inventory', JSON.stringify(userInventory));
    renderInventory();

    const loggedUser = localStorage.getItem('g6_logged_user');
    if (loggedUser) {
        syncInventoryToSheet(loggedUser, userInventory);
    }
    return true;
}

btnDraw1?.addEventListener('click', () => {
    if (!checkAndUseAmuletPaper(5)) return;
    currentDrawCount = 1;
    startAmuletDrawingSession();
});

btnDraw5?.addEventListener('click', () => {
    if (!checkAndUseAmuletPaper(25)) return;
    currentDrawCount = 5;
    startAmuletDrawingSession();
});

function startAmuletDrawingSession() {
    if (amuletLobbyBox) amuletLobbyBox.style.display = 'none';
    if (amuletCanvasBox) amuletCanvasBox.style.display = 'flex';
    initAmuletCanvas();
}

// KHỞI TẠO CANVAS VẼ 8 TRỤC ĐỐI XỨNG
function initAmuletCanvas() {
    if (!amuletCanvas) return;
    const ctx = amuletCanvas.getContext('2d');
    ctx.clearRect(0, 0, amuletCanvas.width, amuletCanvas.height);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const cx = amuletCanvas.width / 2;
    const cy = amuletCanvas.height / 2;

    function drawSymmetricLines(x1, y1, x2, y2) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#5dade2';

        // Tọa độ tương đối so với tâm vòng tròn
        let relX1 = x1 - cx;
        let relY1 = y1 - cy;
        let relX2 = x2 - cx;
        let relY2 = y2 - cy;

        // Vẽ qua 8 trục đối xứng (quay 45 độ mỗi lần)
        for (let i = 0; i < 8; i++) {
            let angle = (i * Math.PI) / 4;
            let cos = Math.cos(angle);
            let sin = Math.sin(angle);

            let rx1 = relX1 * cos - relY1 * sin + cx;
            let ry1 = relX1 * sin + relY1 * cos + cy;
            let rx2 = relX2 * cos - relY2 * sin + cx;
            let ry2 = relX2 * sin + relY2 * cos + cy;

            ctx.beginPath();
            ctx.moveTo(rx1, ry1);
            ctx.lineTo(rx2, ry2);
            ctx.stroke();
        }
    }

    function startDraw(e) {
        isDrawing = true;
        const rect = amuletCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        lastX = (clientX - rect.left) * (amuletCanvas.width / rect.width);
        lastY = (clientY - rect.top) * (amuletCanvas.height / rect.height);
    }

    function moveDraw(e) {
        if (!isDrawing) return;
        const rect = amuletCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        let currentX = (clientX - rect.left) * (amuletCanvas.width / rect.width);
        let currentY = (clientY - rect.top) * (amuletCanvas.height / rect.height);

        drawSymmetricLines(lastX, lastY, currentX, currentY);

        lastX = currentX;
        lastY = currentY;
    }

    function endDraw() {
        if (!isDrawing) return;
        isDrawing = false;
        // Vẽ xong nét bùa -> Chờ 0.6s hiệu ứng rồi hiển thị kết quả
        setTimeout(() => {
            processAmuletRewards(currentDrawCount);
        }, 600);
    }

    // Xóa sự kiện cũ tránh lặp
    amuletCanvas.onmousedown = startDraw;
    amuletCanvas.onmousemove = moveDraw;
    window.onmouseup = endDraw;

    amuletCanvas.ontouchstart = startDraw;
    amuletCanvas.ontouchmove = moveDraw;
    window.ontouchend = endDraw;
}

// TỶ LỆ TRÚNG THƯỞNG VẼ BÙA: 1 Huy hiệu (50%), 2 Huy hiệu (30%), 3 Huy hiệu (15%), 5 Huy hiệu (5%)
function getRandomAmuletReward() {
    let rand = Math.random() * 100;
    if (rand < 50) {
        return { count: 1, name: "1 Huy Hiệu", icon: "RESOURCE/Huy hiệu.png", targetKey: "Huy hiệu" };
    } else if (rand < 80) {
        return { count: 2, name: "2 Huy Hiệu", icon: "RESOURCE/Huy hiệu.png", targetKey: "Huy hiệu" };
    } else if (rand < 95) {
        return { count: 3, name: "3 Huy Hiệu", icon: "RESOURCE/Huy hiệu.png", targetKey: "Huy hiệu" };
    } else {
        return { count: 5, name: "5 Huy Hiệu", icon: "RESOURCE/Huy hiệu.png", targetKey: "Huy hiệu" };
    }
}

function processAmuletRewards(count) {
    let wonRewards = [];
    for (let i = 0; i < count; i++) {
        let reward = getRandomAmuletReward();
        wonRewards.push(reward);
        
        // Cộng vào tủ đồ
        let item = userInventory[reward.targetKey];
        if (item) {
            item.count += reward.count;
        }
    }

    localStorage.setItem('g6_user_inventory', JSON.stringify(userInventory));
    renderInventory();

    const loggedUser = localStorage.getItem('g6_logged_user');
    if (loggedUser) {
        syncInventoryToSheet(loggedUser, userInventory);
    }

    showAmuletResults(wonRewards);
}

function showAmuletResults(rewards) {
    if (!amuletRewardsGrid || !amuletResultOverlay) return;
    amuletRewardsGrid.innerHTML = '';

    rewards.forEach(rew => {
        let card = document.createElement('div');
        card.className = 'amulet-reward-card';
        card.innerHTML = `
            <img src="${rew.icon}" alt="Huy hiệu" class="amulet-reward-img">
            <span class="amulet-reward-name">${rew.name}</span>
        `;
        amuletRewardsGrid.appendChild(card);
    });

    amuletResultOverlay.style.display = 'flex';
}

btnAmuletOk?.addEventListener('click', () => {
    resetAmuletLobby();
});

btnAmuletAgain?.addEventListener('click', () => {
    let cost = currentDrawCount === 1 ? 5 : 25;
    if (!checkAndUseAmuletPaper(cost)) {
        resetAmuletLobby();
        return;
    }
    if (amuletResultOverlay) amuletResultOverlay.style.display = 'none';
    initAmuletCanvas();
});

/* ==========================================
   CỬA HÀNG QUY ĐỔI (CONVERSION) LOGIC
   ========================================== */
const conversionView = document.getElementById('conversionView');

// Cập nhật hàm switchView để hỗ trợ mở tab Quy Đổi ('conversion')
const originalSwitchViewForConv = window.switchView || function(){};
function switchView(target) {
    if (!homeView || !wheel8View || !chestGameView || !slotView || !lotteryView || !taixiuView || !amuletView || !conversionView || !otherView) return;
    homeView.style.display = 'none';
    wheel8View.style.display = 'none';
    chestGameView.style.display = 'none';
    slotView.style.display = 'none';
    lotteryView.style.display = 'none';
    taixiuView.style.display = 'none';
    amuletView.style.display = 'none';
    conversionView.style.display = 'none';
    otherView.style.display = 'none';

    if (target === 'home') {
        homeView.style.display = 'block';
    } else if (target === 'wheel8') {
        wheel8View.style.display = 'block';
    } else if (target === 'inventory') {
        chestGameView.style.display = 'block';
    } else if (target === 'slot') {
        slotView.style.display = 'block';
    } else if (target === 'lottery') {
        lotteryView.style.display = 'block';
    } else if (target === 'taixiu') {
        taixiuView.style.display = 'block';
    } else if (target === 'amulet') {
        amuletView.style.display = 'block';
        resetAmuletLobby();
    } else if (target === 'conversion') {
        conversionView.style.display = 'block';
        renderConversionItems();
    } else {
        otherView.style.display = 'block';
    }
}

// Danh sách 10 mục quy đổi theo yêu cầu
const conversionItemsList = [
    { id: 1, name: "Giấy vẽ bùa", icon: "RESOURCE/Giấy vẽ bùa.png", targetKey: "Giấy vẽ bùa", qty: 1, costType: "token", costVal: 25 },
    { id: 2, name: "Rương A", icon: "RESOURCE/Rương A.png", targetKey: "Rương A", qty: 1, costType: "token", costVal: 12 },
    { id: 3, name: "Rương S", icon: "RESOURCE/Rương S.png", targetKey: "Rương S", qty: 1, costType: "token", costVal: 49 },
    { id: 4, name: "Rương SS", icon: "RESOURCE/Rương SS.png", targetKey: "Rương SS", qty: 1, costType: "token", costVal: 119 },
    { id: 5, name: "Rương A", icon: "RESOURCE/Rương A.png", targetKey: "Rương A", qty: 1, costType: "badge", costVal: 10 },
    { id: 6, name: "Rương S", icon: "RESOURCE/Rương S.png", targetKey: "Rương S", qty: 1, costType: "badge", costVal: 20 },
    { id: 7, name: "Rương SS", icon: "RESOURCE/Rương SS.png", targetKey: "Rương SS", qty: 1, costType: "badge", costVal: 40 },
    { id: 8, name: "Rương SS+", icon: "RESOURCE/Rương SS+.png", targetKey: "Rương SS+", qty: 1, costType: "badge", costVal: 70 },
    { id: 9, name: "Rương SSS", icon: "RESOURCE/Rương SSS.png", targetKey: "Rương SSS", qty: 1, costType: "badge", costVal: 100 },
    { id: 10, name: "Rương SSS+", icon: "RESOURCE/Rương SSS+.png", targetKey: "Rương SSS+", qty: 1, costType: "badge", costVal: 150 }
];

function updateConversionBadgeDisplay() {
    const badgeCountEl = document.getElementById('convUserBadgeCount');
    if (badgeCountEl) {
        let badgeItem = userInventory["Huy hiệu"];
        badgeCountEl.innerText = badgeItem ? badgeItem.count : 0;
    }
}

function renderConversionItems() {

    updateConversionBadgeDisplay();

    const grid = document.getElementById('conversionGrid');
    if (!grid) return;
    grid.innerHTML = '';

    conversionItemsList.forEach(item => {
        let card = document.createElement('div');
        card.className = 'conversion-card';

        let priceHtml = '';
        if (item.costType === 'token') {
            priceHtml = `${item.costVal} <span class="conv-price-icon-token"></span>`;
        } else {
            priceHtml = `${item.costVal} <img src="RESOURCE/Huy hiệu.png" class="conv-price-icon-badge">`;
        }

        card.innerHTML = `
            <div class="conv-item-img-box">
                <img src="${item.icon}" alt="${item.name}" class="conv-item-img">
            </div>
            <span class="conv-item-name">${item.name}</span>
            <button class="btn-conv-buy" onclick="handleConversionBuy(${item.id})">
                Đổi: ${priceHtml}
            </button>
        `;
        grid.appendChild(card);
    });
}

let selectedConversionItem = null;
let currentConvQuantity = 1;

const convModalOverlay = document.getElementById('convModalOverlay');
const convConfirmOverlay = document.getElementById('convConfirmOverlay');
const convModalImg = document.getElementById('convModalImg');
const convModalItemName = document.getElementById('convModalItemName');
const convRangeInput = document.getElementById('convRangeInput');
const convNumInput = document.getElementById('convNumInput');
const convMinusBtn = document.getElementById('convMinusBtn');
const convPlusBtn = document.getElementById('convPlusBtn');
const convTotalCostVal = document.getElementById('convTotalCostVal');
const convCostIconContainer = document.getElementById('convCostIconContainer');
const convModalCancel = document.getElementById('convModalCancel');
const convModalNext = document.getElementById('convModalNext');
const convConfirmNo = document.getElementById('convConfirmNo');
const convConfirmYes = document.getElementById('convConfirmYes');
const convConfirmText = document.getElementById('convConfirmText');

function handleConversionBuy(itemId) {
    let itemConfig = conversionItemsList.find(i => i.id === itemId);
    if (!itemConfig) return;
    selectedConversionItem = itemConfig;
    currentConvQuantity = 1;

    // Tính toán số lượng tối đa có thể mua dựa theo số dư hiện có
    let maxAffordable = 1;
    if (itemConfig.costType === 'token') {
        maxAffordable = Math.floor(userTokens / itemConfig.costVal) || 1;
    } else {
        let badgeItem = userInventory["Huy hiệu"];
        let badgeCount = badgeItem ? badgeItem.count : 0;
        maxAffordable = Math.floor(badgeCount / itemConfig.costVal) || 1;
    }
    if (maxAffordable < 1) maxAffordable = 1;
    if (maxAffordable > 99) maxAffordable = 99;

    convRangeInput.max = maxAffordable;
    convRangeInput.value = 1;
    convNumInput.value = 1;

    convModalImg.src = itemConfig.icon;
    convModalItemName.innerText = itemConfig.name;

    updateConvModalUI();
    if (convModalOverlay) convModalOverlay.style.display = 'flex';
}

function updateConvModalUI() {
    if (!selectedConversionItem) return;
    let totalCost = currentConvQuantity * selectedConversionItem.costVal;
    convTotalCostVal.innerText = totalCost;

    if (selectedConversionItem.costType === 'token') {
        convCostIconContainer.innerHTML = `<span class="conv-price-icon-token" style="width:1.1vw;height:1.1vw;display:inline-block;vertical-align:middle;"></span>`;
    } else {
        convCostIconContainer.innerHTML = `<img src="RESOURCE/Huy hiệu.png" class="conv-price-icon-badge" style="width:1.3vw;height:1.3vw;vertical-align:middle;">`;
    }
}

convRangeInput?.addEventListener('input', (e) => {
    currentConvQuantity = parseInt(e.target.value) || 1;
    convNumInput.value = currentConvQuantity;
    updateConvModalUI();
});

convNumInput?.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 1;
    let max = parseInt(convRangeInput.max) || 50;
    if (val < 1) val = 1;
    if (val > max) val = max;
    currentConvQuantity = val;
    convRangeInput.value = val;
    convNumInput.value = val;
    updateConvModalUI();
});

convMinusBtn?.addEventListener('click', () => {
    if (currentConvQuantity > 1) {
        currentConvQuantity--;
        convRangeInput.value = currentConvQuantity;
        convNumInput.value = currentConvQuantity;
        updateConvModalUI();
    }
});

convPlusBtn?.addEventListener('click', () => {
    let max = parseInt(convRangeInput.max) || 50;
    if (currentConvQuantity < max) {
        currentConvQuantity++;
        convRangeInput.value = currentConvQuantity;
        convNumInput.value = currentConvQuantity;
        updateConvModalUI();
    }
});

convModalCancel?.addEventListener('click', () => {
    if (convModalOverlay) convModalOverlay.style.display = 'none';
});

// Bấm Tiếp tục -> Mở bảng xác nhận lần 2
convModalNext?.addEventListener('click', () => {
    if (!selectedConversionItem) return;
    let totalCost = currentConvQuantity * selectedConversionItem.costVal;
    let currencyName = selectedConversionItem.costType === 'token' ? 'Token' : 'Huy hiệu';

    convConfirmText.innerHTML = `Bạn có chắc chắn muốn đổi <strong>${currentConvQuantity}</strong> x [${selectedConversionItem.name}] với giá <strong>${totalCost} ${currencyName}</strong> không?`;
    if (convModalOverlay) convModalOverlay.style.display = 'none';
    if (convConfirmOverlay) convConfirmOverlay.style.display = 'flex';
});

convConfirmNo?.addEventListener('click', () => {
    if (convConfirmOverlay) convConfirmOverlay.style.display = 'none';
});

// Bấm Chắc chắn -> Thực hiện giao dịch đổi vật phẩm
convConfirmYes?.addEventListener('click', () => {
    if (!selectedConversionItem) return;
    let totalCost = currentConvQuantity * selectedConversionItem.costVal;

    if (selectedConversionItem.costType === 'token') {
        if (userTokens < totalCost) {
            showCustomAlert(`⚠️ Bạn không đủ Token để thực hiện giao dịch này!`);
            if (convConfirmOverlay) convConfirmOverlay.style.display = 'none';
            return;
        }
        userTokens -= totalCost;
        saveUserTokens();
        updateUI();

        const loggedUser = localStorage.getItem('g6_logged_user');
        if (loggedUser) {
            syncTokensToSheet(loggedUser, userTokens);
        }
    } else {
        let badgeItem = userInventory["Huy hiệu"];
        if (!badgeItem || badgeItem.count < totalCost) {
            showCustomAlert(`⚠️ Bạn không đủ Huy hiệu để thực hiện giao dịch này!`);
            if (convConfirmOverlay) convConfirmOverlay.style.display = 'none';
            return;
        }
        badgeItem.count -= totalCost;
        localStorage.setItem('g6_user_inventory', JSON.stringify(userInventory));
        renderInventory();

        const loggedUser = localStorage.getItem('g6_logged_user');
        if (loggedUser) {
            syncInventoryToSheet(loggedUser, userInventory);
        }
    }

    // Thêm vật phẩm vào Tủ đồ với số lượng đã chọn
    addItemToInventory({
        name: selectedConversionItem.name,
        targetKey: selectedConversionItem.targetKey,
        qty: currentConvQuantity,
        icon: selectedConversionItem.icon
    });

    if (convConfirmOverlay) convConfirmOverlay.style.display = 'none';
    showCustomAlert(`🎉 Đổi thành công ${currentConvQuantity} x [${selectedConversionItem.name}]! Đã thêm vào Tủ đồ.`);
});

