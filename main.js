// Состояние игры
const gameState = {
    totalPoints: 3000,
    currentSkin: 'blue',
    equippedAbility: null,
    abilities: {},
    skins: {blue: true},
    achievements: {},
    ballXP: 0,
    gameStats: {
        gamesPlayed: 0,
        totalScore: 0,
        ballsCollected: 0,
        timeSurvived: 0
    }
};
totalPoints += 10000;
// Сохранение и загрузка состояния
function saveGameState() {
    localStorage.setItem('ballGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('ballGameState');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Сохраняем достижения
        if (parsed.achievements) {
            Object.keys(parsed.achievements).forEach(key => {
                if (gameState.achievements[key]) {
                    gameState.achievements[key].unlocked = parsed.achievements[key].unlocked;
                }
            });
        }
        // Сохраняем остальные данные
        Object.keys(parsed).forEach(key => {
            if (key !== 'achievements') {
                gameState[key] = parsed[key];
            }
        });
    }
    updateTotalPointsDisplay();
}

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    loadGameState();
    initAchievements();
    updateInventory();
    startMenuBalls();
    
    // Предотвращение стандартного поведения касания
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) {
        if (e.touches.length > 0) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Элементы DOM
const mainMenu = document.getElementById('mainMenu');
const gameScreen = document.getElementById('gameScreen');
const shopScreen = document.getElementById('shopScreen');
const inventoryScreen = document.getElementById('inventoryScreen');
const achievementsScreen = document.getElementById('achievementsScreen');
const gameOverScreen = document.getElementById('gameOver');
const notification = document.getElementById('notification');

// Кнопки меню
document.getElementById('playBtn').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    gameScreen.style.display = 'flex';
    startGame();
});

document.getElementById('shopBtn').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    shopScreen.style.display = 'flex';
    updateTotalPointsDisplay();
});

document.getElementById('inventoryBtn').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    inventoryScreen.style.display = 'flex';
    updateInventory();
});

document.getElementById('achievementsBtn').addEventListener('click', () => {
    mainMenu.style.display = 'none';
    achievementsScreen.style.display = 'flex';
    updateAchievementsDisplay();
});

// Кнопки назад
document.getElementById('backBtn').addEventListener('click', goToMainMenu);
document.getElementById('shopBackBtn').addEventListener('click', goToMainMenu);
document.getElementById('inventoryBackBtn').addEventListener('click', goToMainMenu);
document.getElementById('achievementsBackBtn').addEventListener('click', goToMainMenu);
document.getElementById('menuBtn').addEventListener('click', goToMainMenu);

function goToMainMenu() {
    gameScreen.style.display = 'none';
    shopScreen.style.display = 'none';
    inventoryScreen.style.display = 'none';
    achievementsScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    mainMenu.style.display = 'flex';
}

// Обновление отображения очков
function updateTotalPointsDisplay() {
    document.getElementById('totalPoints').textContent = gameState.totalPoints;
}

// Магазин - покупка коробки
document.getElementById('buyBox').addEventListener('click', () => {
    if (gameState.totalPoints >= 1) {
        gameState.totalPoints -= 0;
        updateTotalPointsDisplay();
        saveGameState();
        
        // Открытие коробки
        openBox();
    } else {
        showNotification('Недостаточно очков!');
    }
});

// Магазин - покупка скинов
document.querySelectorAll('.shopItem[data-skin]').forEach(item => {
    item.addEventListener('click', () => {
        const skin = item.getAttribute('data-skin');
        const price = parseInt(item.querySelector('.itemPrice').textContent);
        
        if (gameState.totalPoints >= price) {
            if (!gameState.skins[skin]) {
                gameState.totalPoints -= price;
                gameState.skins[skin] = true;
                updateTotalPointsDisplay();
                saveGameState();
                showNotification(`Скин "${item.querySelector('.itemName').textContent}" куплен!`);
                
                // Проверка достижения "Радуга!"
                if (skin === 'rainbow') {
                    checkAchievement('rainbow');
                }
            } else {
                showNotification('Этот скин уже куплен!');
            }
        } else {
            showNotification('Недостаточно очков!');
        }
    });
});

// Открытие коробки
function openBox() {
    
    const xp = 10 + Math.floor(Math.random() * 11); // 10-20 XP
    gameState.ballXP += xp;
    // 25% - бонусные очки
    let bonusPoints = 0;
    if (Math.random() < 0.25) {
        bonusPoints = 100 + Math.floor(Math.random() * 101); // 100-200 очков
        gameState.totalPoints += bonusPoints;
    }
    
    // 5% - способность
    let ability = null;
    if (Math.random() < 0.15) {
        const abilityRoll = Math.random();
        if (abilityRoll < 0.6) {
            ability = 'wide';
        } else if (abilityRoll < 0.9) {
            ability = 'delete';
        } else if (abilityRoll < 0.96) {
            ability = 'gold';
        } else if (abilityRoll < 0.995) {
            ability = 'immortal';
        } else {
            ability = 'resurrection';
        }
        
        if (!gameState.abilities[ability]) {
            gameState.abilities[ability] = { level: 1 };
            // Проверка достижения "ДА! Я ПОЛУЧИЛ ЭТО!"
            checkAchievement('firstAbility');
        } else {
            gameState.abilities[ability].level++;
        }
    }
    
    // Показать результат
    let message = `Вы получили: ${xp} XP шаров`;
    if (bonusPoints > 0) {
        message += `, ${bonusPoints} бонусных очков`;
    }
    if (ability) {
        const abilityNames = {
            wide: 'Широкий',
            delete: 'Удаление',
            gold: 'Золото',
            immortal: 'Бессмертие',
            resurrection: 'Воскрешение'
        };
        message += `, способность "${abilityNames[ability]}"`;
    }
    
    showNotification(message);
    saveGameState();
}

// Инвентарь
function updateInventory() {
    updateSkinsInventory();
    updateAbilitiesInventory();
}

function updateSkinsInventory() {
    const skinsGrid = document.getElementById('skinsGrid');
    skinsGrid.innerHTML = '';
    
    const skins = [
        { id: 'blue', name: 'Синий' },
        { id: 'red', name: 'Красный' },
        { id: 'green', name: 'Зелёный' },
        { id: 'purple', name: 'Фиолетовый' },
        { id: 'yellow', name: 'Жёлтый' },
        { id: 'rainbow', name: 'Радужный' }
    ];
    
    skins.forEach(skin => {
        if (gameState.skins[skin.id]) {
            const item = document.createElement('div');
            item.className = `inventoryItem ${gameState.currentSkin === skin.id ? 'equipped' : ''}`;
            item.innerHTML = `
                <div class="itemName">${skin.name}</div>
            `;
            item.style.background = getSkinColor(skin.id);
            
            // Добавляем обработчики для touch устройств
            item.addEventListener('click', () => {
                gameState.currentSkin = skin.id;
                saveGameState();
                updateInventory();
            });
            
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                gameState.currentSkin = skin.id;
                saveGameState();
                updateInventory();
            });
            
            skinsGrid.appendChild(item);
        }
    });
}

function updateAbilitiesInventory() {
    const abilitiesGrid = document.getElementById('abilitiesGrid');
    abilitiesGrid.innerHTML = '';
    
    const abilities = [
        { id: 'wide', name: 'Широкий' },
        { id: 'delete', name: 'Удаление' },
        { id: 'gold', name: 'Золото' },
        { id: 'immortal', name: 'Бессмертие' },
        { id: 'resurrection', name: 'Воскрешение' }
    ];
    
    abilities.forEach(ability => {
        if (gameState.abilities[ability.id]) {
            const item = document.createElement('div');
            item.className = `inventoryItem ${gameState.equippedAbility === ability.id ? 'equipped' : ''}`;
            const level = gameState.abilities[ability.id].level;
            item.innerHTML = `
                <div class="itemName">${ability.name}</div>
                <div class="itemLevel">${level}</div>
            `;
            
            // Обработчик клика для экипировки
            item.addEventListener('click', (e) => {
                if (!e.shiftKey) {
                    gameState.equippedAbility = gameState.equippedAbility === ability.id ? null : ability.id;
                    saveGameState();
                    updateInventory();
                }
            });
            
            // Обработчик touch для экипировки
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                gameState.equippedAbility = gameState.equippedAbility === ability.id ? null : ability.id;
                saveGameState();
                updateInventory();
            });
            
            // Обработчик зажатия для улучшения
            let pressTimer;
            const startPress = () => {
                pressTimer = setTimeout(() => {
                    upgradeAbility(ability.id);
                }, 1500);
            };
            
            const endPress = () => {
                clearTimeout(pressTimer);
            };
            
            item.addEventListener('mousedown', startPress);
            item.addEventListener('mouseup', endPress);
            item.addEventListener('mouseleave', endPress);
            
            // Touch события для улучшения
            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startPress();
            });
            
            item.addEventListener('touchend', endPress);
            item.addEventListener('touchcancel', endPress);
            
            abilitiesGrid.appendChild(item);
        }
    });
}

function upgradeAbility(abilityId) {
    const ability = gameState.abilities[abilityId];
    const upgradeCost = 10 + (ability.level - 1) * 10;
    
    if (ability.level < 20 && gameState.ballXP >= upgradeCost) {
        gameState.ballXP -= upgradeCost;
        ability.level++;
        saveGameState();
        updateInventory();
        showNotification(`Способность улучшена до уровня ${ability.level}!`);
        
        // Проверка достижения "Обычное дело"
        if (ability.level >= 20) {
            checkAchievement('usual');
        }
    } else if (ability.level >= 20) {
        showNotification('Максимальный уровень достигнут!');
    } else {
        showNotification(`Недостаточно XP шаров! Нужно: ${upgradeCost}`);
    }
}

function getSkinColor(skinId) {
    const colors = {
        blue: '#4a8cff',
        red: '#ff6b6b',
        green: '#51cf66',
        purple: '#cc5de8',
        yellow: '#ffd43b',
        rainbow: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
    };
    return colors[skinId] || colors.blue;
}

// Достижения
function initAchievements() {
    const achievements = [
        { id: 'danger', name: 'ОПАСНОСТЬ!', description: 'Выжить 30 секунд', condition: (stats) => stats.timeSurvived >= 30 },
        { id: 'scary', name: 'Это страшно', description: 'Выжить 75 секунд', condition: (stats) => stats.timeSurvived >= 75 },
        { id: 'end', name: 'Конец?', description: 'Выжить 150 секунд', condition: (stats) => stats.timeSurvived >= 150 },
        { id: 'rainbow', name: 'Радуга!', description: 'Получить скин радуга', condition: () => gameState.skins.rainbow },
        { id: 'thanks', name: 'Спасибо...', description: 'Забрать шар с помощью воскрешения', condition: (stats) => stats.resurrectionUsed },
        { id: 'redacted', name: '[REDACTED]', description: 'Использовать способность "Удаление" 5 раз за игру', condition: (stats) => stats.deleteUsed >= 5 },
        { id: 'firstAbility', name: 'ДА! Я ПОЛУЧИЛ ЭТО!', description: 'Получить первую способность', condition: () => Object.keys(gameState.abilities).length > 0 },
        { id: 'rich', name: 'Я БОГАТЫЙ!!', description: 'Забрать золотой шар', condition: (stats) => stats.goldBallsCollected > 0 },
        { id: 'hell', name: 'Это было адом...', description: 'Собрать 1000 шаров за одну игру', condition: (stats) => stats.ballsCollected >= 1000 },
        { id: 'usual', name: 'Обычное дело', description: 'Прокачать любую способность до 20 уровня', condition: () => Object.values(gameState.abilities).some(a => a.level >= 20) }
    ];
    
    // Инициализируем только если еще не были инициализированы
    if (Object.keys(gameState.achievements).length === 0) {
        gameState.achievements = achievements.reduce((acc, ach) => {
            acc[ach.id] = { ...ach, unlocked: false };
            return acc;
        }, {});
    }
}

function updateAchievementsDisplay() {
    const achievementsList = document.getElementById('achievementsList');
    achievementsList.innerHTML = '';
    
    Object.values(gameState.achievements).forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement ${achievement.unlocked ? '' : 'locked'}`;
        achievementEl.innerHTML = `
            <div class="achievementIcon">${achievement.unlocked ? '✓' : '?'}</div>
            <div class="achievementInfo">
                <div class="achievementName">${achievement.name}</div>
                <div class="achievementDescription">${achievement.description}</div>
            </div>
        `;
        achievementsList.appendChild(achievementEl);
    });
}

function checkAchievement(achievementId) {
    if (gameState.achievements[achievementId] && !gameState.achievements[achievementId].unlocked) {
        gameState.achievements[achievementId].unlocked = true;
        showNotification(`Достижение разблокировано: ${gameState.achievements[achievementId].name}`);
        saveGameState();
    }
}

function checkAchievements(stats) {
    Object.values(gameState.achievements).forEach(achievement => {
        if (!achievement.unlocked && achievement.condition(stats)) {
            achievement.unlocked = true;
            showNotification(`Достижение разблокировано: ${achievement.name}`);
        }
    });
    saveGameState();
}

// Уведомления
function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Шары в меню
function startMenuBalls() {
    setInterval(() => {
        if (mainMenu.style.display !== 'none') {
            createMenuBall();
        }
    }, 800);
}

function createMenuBall() {
    const ball = document.createElement('div');
    ball.className = 'menu-ball';
    
    const size = 30 + Math.random() * 40;
    const colors = ['#ff6b6b', '#51cf66', '#cc5de8', '#ffd43b', '#4a8cff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    ball.style.background = color;
    ball.style.width = size + 'px';
    ball.style.height = size + 'px';
    
    const x = Math.random() * window.innerWidth;
    ball.style.left = x + 'px';
    ball.style.top = '-' + size + 'px';
    
    document.body.appendChild(ball);
    
    // Анимация падения
    let y = -size;
    const speed = 1 + Math.random() * 2;
    const fallInterval = setInterval(() => {
        y += speed;
        ball.style.top = y + 'px';
        
        if (y > window.innerHeight) {
            clearInterval(fallInterval);
            ball.remove();
        }
    }, 30);
}

// Игровой код
let gameActive = false;
let score = 0;
let lives = 3;
let gameTime = 0;
let fallingBalls = [];
let player;
let abilityBtn;
let abilityCooldown = 0;
let gameStats = {
    ballsCollected: 0,
    resurrectionUsed: false,
    deleteUsed: 0,
    goldBallsCollected: 0
};
let lastMeteorTime = 0;
let explosionRadius = 150; // Радиус взрыва бомбы
let speedMultiplier = 1.0; // Множитель скорости шаров

// Интервалы для очистки
let ballCreationInterval;
let gameTimerInterval;
let gameLoopId;

// Переменные для управления касанием
let isTouching = false;
let touchId = null;

function startGame() {
    // Останавливаем все предыдущие интервалы
    stopAllIntervals();
    
    // Полный сброс игрового состояния
    gameActive = true;
    score = 0;
    lives = 3;
    gameTime = 0;
    fallingBalls = [];
    abilityCooldown = 0;
    speedMultiplier = 1.0; // Сбрасываем скорость
    gameStats = {
        ballsCollected: 0,
        resurrectionUsed: false,
        deleteUsed: 0,
        goldBallsCollected: 0
    };
    lastMeteorTime = 0;
    
    // Сброс состояния касания
    isTouching = false;
    touchId = null;
    
    player = document.getElementById('player');
    abilityBtn = document.getElementById('abilityBtn');
    
    // Очищаем игровую область от всех шаров
    const gameArea = document.getElementById('gameArea');
    const balls = gameArea.querySelectorAll('.fallingBall, .explosion-effect');
    balls.forEach(ball => {
        ball.remove();
    });
    
    // Установка скина игрока
    player.style.background = getSkinColor(gameState.currentSkin);
    player.style.transform = 'scale(1)';
    player.style.opacity = '1';
    
    // Позиционирование игрока
    player.style.left = '50%';
    player.style.top = '80%';
    
    // Обновление UI
    document.getElementById('score').textContent = `Очки: ${score}`;
    document.getElementById('lives').textContent = `Жизни: ${lives}`;
    document.getElementById('time').textContent = `Время: ${gameTime}`;
    document.getElementById('speed').textContent = `Скорость: ${Math.round(speedMultiplier * 100)}%`;
    
    // Скрытие кнопки способности
    abilityBtn.style.display = 'none';
    
    // Добавляем обработчики событий для управления
    setupControls();
    
    // Запуск игрового цикла
    gameLoopId = requestAnimationFrame(gameLoop);
    
    // Создание шариков
    ballCreationInterval = setInterval(createFallingBall, 500);
    
    // Таймер
    gameTimerInterval = setInterval(() => {
        if (gameActive) {
            gameTime++;
            document.getElementById('time').textContent = `Время: ${gameTime}`;
            
            // Увеличиваем скорость на 1% каждую секунду
            speedMultiplier *= 1.01;
            document.getElementById('speed').textContent = `Скорость: ${Math.round(speedMultiplier * 100)}%`;
            
            // Проверка достижений по времени
            if (gameTime === 30) checkAchievement('danger');
            if (gameTime === 75) checkAchievement('scary');
            if (gameTime === 150) checkAchievement('end');
            
            // Обновление перезарядки способности
            if (abilityCooldown > 0) {
                abilityCooldown--;
                if (abilityCooldown === 0 && gameState.equippedAbility) {
                    abilityBtn.style.display = 'block';
                    abilityBtn.classList.add('pulse');
                }
            }
            
            // Метеоры после 30 секунд каждые 6 секунд
            if (gameTime > 30 && gameTime - lastMeteorTime >= 6) {
                createMeteor();
                lastMeteorTime = gameTime;
            }
        }
    }, 1000);
}

// Настройка управления для десктопа и мобильных устройств
function setupControls() {
    const gameArea = document.getElementById('gameArea');
    
    // Очищаем предыдущие обработчики
    gameArea.removeEventListener('mousemove', handleMouseMove);
    gameArea.removeEventListener('touchmove', handleTouchMove);
    gameArea.removeEventListener('touchstart', handleTouchStart);
    gameArea.removeEventListener('touchend', handleTouchEnd);
    
    // Обработчики для мыши
    gameArea.addEventListener('mousemove', handleMouseMove);
    
    // Обработчики для касаний
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameArea.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Обработчик для кнопки способности
    abilityBtn.addEventListener('click', useAbility);
    abilityBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        useAbility();
    }, { passive: false });
}

function handleMouseMove(e) {
    if (!gameActive) return;
    
    const playerSize = player.offsetWidth;
    let x = e.clientX - playerSize / 2;
    let y = e.clientY - playerSize / 2;
    
    // Ограничиваем движение в пределах экрана
    if (x < 0) x = 0;
    if (x > window.innerWidth - playerSize) x = window.innerWidth - playerSize;
    if (y < 0) y = 0;
    if (y > window.innerHeight - playerSize) y = window.innerHeight - playerSize;
    
    player.style.left = x + 'px';
    player.style.top = y + 'px';
}

function handleTouchStart(e) {
    if (!gameActive) return;
    
    e.preventDefault();
    if (!isTouching) {
        isTouching = true;
        touchId = e.changedTouches[0].identifier;
        handleTouchMove(e);
    }
}

function handleTouchMove(e) {
    if (!gameActive || !isTouching) return;
    
    e.preventDefault();
    
    // Находим касание с нашим ID
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
            const playerSize = player.offsetWidth;
            const rect = gameArea.getBoundingClientRect();
            let x = touch.clientX - rect.left - playerSize / 2;
            let y = touch.clientY - rect.top - playerSize / 2;
            
            // Ограничиваем движение в пределах игровой области
            if (x < 0) x = 0;
            if (x > gameArea.offsetWidth - playerSize) x = gameArea.offsetWidth - playerSize;
            if (y < 0) y = 0;
            if (y > gameArea.offsetHeight - playerSize) y = gameArea.offsetHeight - playerSize;
            
            player.style.left = x + 'px';
            player.style.top = y + 'px';
            break;
        }
    }
}

function handleTouchEnd(e) {
    if (!gameActive) return;
    
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
            isTouching = false;
            touchId = null;
            break;
        }
    }
}

function stopAllIntervals() {
    // Останавливаем все интервалы
    if (ballCreationInterval) clearInterval(ballCreationInterval);
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    // Очищаем все шары
    const gameArea = document.getElementById('gameArea');
    const balls = gameArea.querySelectorAll('.fallingBall, .explosion-effect');
    balls.forEach(ball => {
        ball.remove();
    });
    
    fallingBalls = [];
}

function gameLoop() {
    if (!gameActive) return;
    
    updateFallingBalls();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function createFallingBall() {
    if (!gameActive) return;
    
    const ball = document.createElement('div');
    ball.className = 'fallingBall';
    
    // Определение типа шара
    let type = 'normal';
    let color = 'hsl(' + Math.floor(Math.random() * 360) + ', 70%, 60%)';
    let size = 30 + Math.random() * 30; // Увеличили размер
    
    // 1% шанс золотого шара
    if (Math.random() < 0.01) {
        type = 'gold';
        color = 'gold';
        size = 35;
    }
    // 15% шанс черного шара (увеличили вероятность)
    else if (Math.random() < 0.15) {
        type = 'enemy';
        color = 'black';
        // Случайный бомба-шар
        if (Math.random() < 0.3) {
            type = 'bomb';
            const fuse = document.createElement('div');
            fuse.className = 'bomb-fuse';
            ball.appendChild(fuse);
        }
    }
    
    ball.style.background = color;
    ball.style.width = size + 'px';
    ball.style.height = size + 'px';
    
    const x = Math.random() * (window.innerWidth - size);
    ball.style.left = x + 'px';
    ball.style.top = '-' + size + 'px';
    
    document.getElementById('gameArea').appendChild(ball);
    
    fallingBalls.push({
        element: ball,
        x: x,
        y: -size,
        speed: (1 + Math.random() * 2) * speedMultiplier, // Уменьшили скорость и умножаем на множитель
        type: type,
        size: size,
        isBomb: type === 'bomb',
        bombTimer: type === 'bomb' ? Math.random() * 5 + 2 : 0, // Взрыв через 2-7 секунд
        frozen: false, // Флаг заморозки от взрыва
        exploded: false // Флаг, что бомба уже взорвалась
    });
}

function createMeteor() {
    if (!gameActive) return;
    
    const ball = document.createElement('div');
    ball.className = 'fallingBall';
    
    ball.style.background = 'red';
    const size = 80; // Увеличили размер метеора
    ball.style.width = size + 'px';
    ball.style.height = size + 'px';
    
    // Добавляем черные полосы
    for (let i = 0; i < 3; i++) {
        const stripe = document.createElement('div');
        stripe.className = 'meteor-stripe';
        stripe.style.transform = `translateY(-50%) rotate(${i * 60}deg)`;
        ball.appendChild(stripe);
    }
    
    const x = Math.random() * (window.innerWidth - size);
    ball.style.left = x + 'px';
    ball.style.top = '-' + size + 'px';
    
    document.getElementById('gameArea').appendChild(ball);
    
    fallingBalls.push({
        element: ball,
        x: x,
        y: -size,
        speed: 3 * speedMultiplier, // Метеоры быстрее и умножаем на множитель
        type: 'meteor',
        size: size,
        frozen: false
    });
}

function updateFallingBalls() {
    if (!gameActive) return;
    
    for (let i = fallingBalls.length - 1; i >= 0; i--) {
        const ball = fallingBalls[i];
        
        // Если шар не заморожен, обновляем его позицию
        if (!ball.frozen) {
            ball.y += ball.speed;
            ball.element.style.top = ball.y + 'px';
        }
        
        // Обработка бомб
        if (ball.isBomb && !ball.exploded) {
            ball.bombTimer -= 0.016; // Примерно 60 FPS
            if (ball.bombTimer <= 0) {
                // Взрыв бомбы
                explodeBomb(ball, i);
                continue;
            }
        }
        
        // Проверка столкновения с игроком
        if (checkCollision(player, ball.element)) {
            handleBallCollision(ball, i);
            continue;
        }
        
        // Удаляем шары, которые упали за пределы экрана
        if (ball.y > window.innerHeight) {
            ball.element.remove();
            fallingBalls.splice(i, 1);
        }
    }
}

function explodeBomb(bomb, bombIndex) {
    // Помечаем бомбу как взорванную
    bomb.exploded = true;
    
    // Создаем эффект взрыва
    const explosion = document.createElement('div');
    explosion.className = 'explosion-effect';
    explosion.style.width = explosionRadius * 2 + 'px';
    explosion.style.height = explosionRadius * 2 + 'px';
    explosion.style.left = (bomb.x + bomb.size / 2 - explosionRadius) + 'px';
    explosion.style.top = (bomb.y + bomb.size / 2 - explosionRadius) + 'px';
    
    document.getElementById('gameArea').appendChild(explosion);
    
    // Анимация взрыва
    setTimeout(() => {
        explosion.style.transition = 'transform 0.5s, opacity 0.5s';
        explosion.style.transform = 'scale(1)';
        explosion.style.opacity = '0.7';
        
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.remove();
            }
        }, 500);
    }, 10);
    
    // Взрывная волна - замораживаем шары в радиусе
    fallingBalls.forEach((ball, index) => {
        if (index !== bombIndex && !ball.frozen && !ball.exploded) {
            const distance = Math.sqrt(
                Math.pow(ball.x + ball.size/2 - (bomb.x + bomb.size/2), 2) +
                Math.pow(ball.y + ball.size/2 - (bomb.y + bomb.size/2), 2)
            );
            
            if (distance < explosionRadius) {
                // Замораживаем шар на 2 секунды
                ball.frozen = true;
                ball.element.style.opacity = '0.5';
                
                setTimeout(() => {
                    if (ball.element && ball.element.parentNode && gameActive) {
                        ball.frozen = false;
                        ball.element.style.opacity = '1';
                    }
                }, 2000);
            }
        }
    });
    
    // Удаляем бомбу
    bomb.element.classList.add('explode');
    setTimeout(() => {
        if (bomb.element.parentNode) {
            bomb.element.remove();
        }
        if (gameActive && fallingBalls[bombIndex] === bomb) {
            fallingBalls.splice(bombIndex, 1);
        }
    }, 500);
}

function handleBallCollision(ball, ballIndex) {
    if (ball.type === 'normal' || ball.type === 'gold') {
        // Собрали обычный или золотой шар
        score += ball.type === 'gold' ? 10 : 1;
        // После 100 секунд удваиваем очки
        if (gameTime > 100) score += ball.type === 'gold' ? 10 : 1;
        document.getElementById('score').textContent = `Очки: ${score}`;
        gameStats.ballsCollected++;
        
        if (ball.type === 'gold') {
            gameStats.goldBallsCollected++;
            checkAchievement('rich');
        }
    } else if (ball.type === 'enemy' || ball.type === 'bomb') {
        // Столкнулись с черным шаром или бомбой
        lives--;
        document.getElementById('lives').textContent = `Жизни: ${lives}`;
        
        // Анимация тряски
        player.classList.add('shake');
        setTimeout(() => {
            player.classList.remove('shake');
        }, 200);
        
        if (lives <= 0) {
            gameOver();
            return; // Важно: выходим из функции, чтобы не удалять шар
        }
    } else if (ball.type === 'meteor') {
        // Столкнулись с метеором
        const damage = gameTime > 150 ? 3 : 2;
        lives -= damage;
        document.getElementById('lives').textContent = `Жизни: ${lives}`;
        
        if (lives <= 0) {
            gameOver();
            return; // Важно: выходим из функции, чтобы не удалять шар
        }
    } else if (ball.type === 'resurrection') {
        // Шар воскрешения
        lives++;
        score += 20;
        document.getElementById('lives').textContent = `Жизни: ${lives}`;
        document.getElementById('score').textContent = `Очки: ${score}`;
        gameStats.resurrectionUsed = true;
        checkAchievement('thanks');
    }
    
    // Удаляем шар (только если игра продолжается)
    if (!ball.isBomb && gameActive) {
        ball.element.remove();
        fallingBalls.splice(ballIndex, 1);
    }
}

function checkCollision(obj1, obj2) {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();
    
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

// Использование способности
function useAbility() {
    if (!gameActive || !gameState.equippedAbility || abilityCooldown > 0) return;
    
    const ability = gameState.equippedAbility;
    const level = gameState.abilities[ability].level;
    
    // Установка перезарядки в зависимости от уровня способности
    const baseCooldowns = {
        wide: 20,
        delete: 40,
        gold: 25,
        immortal: 50,
        resurrection: 60
    };
    
    abilityCooldown = baseCooldowns[ability] - (level - 1) * 0.5;
    abilityBtn.style.display = 'none';
    abilityBtn.classList.remove('pulse');
    
    // Применение способности
    switch (ability) {
        case 'wide':
            player.style.transform = 'scale(2)';
            setTimeout(() => {
                if (gameActive) player.style.transform = 'scale(1)';
            }, 5000);
            break;
            
        case 'delete':
            gameStats.deleteUsed++;
            fallingBalls.forEach(ball => {
                if (ball.type !== 'meteor') {
                    ball.element.remove();
                }
            });
            fallingBalls = fallingBalls.filter(ball => ball.type === 'meteor');
            if (gameStats.deleteUsed >= 5) {
                checkAchievement('redacted');
            }
            break;
            
        case 'gold':
            // Создание золотого шара рядом с игроком
            const goldBall = document.createElement('div');
            goldBall.className = 'fallingBall';
            goldBall.style.background = 'gold';
            goldBall.style.width = '35px';
            goldBall.style.height = '35px';
            
            const playerRect = player.getBoundingClientRect();
            goldBall.style.left = (playerRect.left + playerRect.width / 2 - 17.5) + 'px';
            goldBall.style.top = (playerRect.top - 35) + 'px';
            
            document.getElementById('gameArea').appendChild(goldBall);
            
            fallingBalls.push({
                element: goldBall,
                x: playerRect.left + playerRect.width / 2 - 17.5,
                y: playerRect.top - 35,
                speed: 2 * speedMultiplier,
                type: 'gold',
                size: 35,
                frozen: false
            });
            break;
            
        case 'immortal':
            player.style.opacity = '0.5';
            const originalLives = lives;
            setTimeout(() => {
                if (gameActive) {
                    player.style.opacity = '1';
                    // Восстанавливаем жизни, если они были потеряны во время бессмертия
                    if (lives < originalLives) {
                        lives = originalLives;
                        document.getElementById('lives').textContent = `Жизни: ${lives}`;
                    }
                }
            }, 5000);
            break;
            
        case 'resurrection':
            // Создание зеленого шара воскрешения
            const resBall = document.createElement('div');
            resBall.className = 'fallingBall';
            resBall.style.background = 'lime';
            resBall.style.width = '30px';
            resBall.style.height = '30px';
            
            const x = Math.random() * (window.innerWidth - 30);
            resBall.style.left = x + 'px';
            resBall.style.top = '-30px';
            
            document.getElementById('gameArea').appendChild(resBall);
            
            fallingBalls.push({
                element: resBall,
                x: x,
                y: -30,
                speed: 2 * speedMultiplier,
                type: 'resurrection',
                size: 30,
                frozen: false
            });
            break;
    }
}

function gameOver() {
    gameActive = false;
    
    // Останавливаем все интервалы
    stopAllIntervals();
    
    // Добавление очков к общему счету
    gameState.totalPoints += score;
    gameState.gameStats.totalScore += score;
    gameState.gameStats.gamesPlayed++;
    if (gameTime > gameState.gameStats.timeSurvived) {
        gameState.gameStats.timeSurvived = gameTime;
    }
    
    // Проверка достижения "Это было адом..."
    if (gameStats.ballsCollected >= 1000) {
        checkAchievement('hell');
    }
    
    saveGameState();
    
    // Показ экрана окончания игры
    document.getElementById('finalScore').textContent = score;
    document.getElementById('ballsCollected').textContent = gameStats.ballsCollected;
    gameOverScreen.style.display = 'flex';
}

// Рестарт игры
document.getElementById('restartBtn').addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startGame();
});

// Добавляем обработчики touch для кнопок меню
document.querySelectorAll('.menuBtn, .gameOverBtn, #backBtn, #shopBackBtn, #inventoryBackBtn, #achievementsBackBtn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.click();
    }, { passive: false });
});
