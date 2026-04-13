// Game State
let dragon = {
    type: null,
    name: "Meu Dragão",
    level: 1,
    health: 100,
    hunger: 100,
    energy: 100,
    happiness: 100,
    avatar: '🐲',
    color: '#fb923c'
};

let enemy = {
    name: "Dragão Selvagem",
    hp: 100,
    maxHp: 100,
    avatar: '🐉'
};

// Intervals and Time Tracking
let decayInterval;
let lastLoginTime = null;

// Select elements
const screens = {
    selection: document.getElementById('selection-screen'),
    main: document.getElementById('main-screen'),
    battle: document.getElementById('battle-screen')
};

// Initialize
function init() {
    const saved = localStorage.getItem('dragonMaster_State');
    if (saved) {
        // Load existing game
        dragon = JSON.parse(saved);
        calculateOfflineDecay();
        showScreen('main');
        updateUI();
        startDecay();
    } else {
        // New Game
        showScreen('selection');
    }
}

// Calculate how much stats decayed while the user was away
function calculateOfflineDecay() {
    const savedTime = localStorage.getItem('dragonMaster_LastTime');
    if (savedTime) {
        const now = Date.now();
        const diffMs = now - parseInt(savedTime);
        const hoursPassed = diffMs / (1000 * 60 * 60);

        if (hoursPassed > 0.1) { // If away for more than 6 minutes
            const decayAmount = Math.floor(hoursPassed * 5); // 5% decay per hour
            
            dragon.hunger = Math.max(0, dragon.hunger - decayAmount);
            dragon.energy = Math.max(0, dragon.energy - decayAmount);
            dragon.happiness = Math.max(0, dragon.happiness - decayAmount);
            
            // Health only decays if hunger or energy hit 0
            if (dragon.hunger === 0 || dragon.energy === 0) {
                dragon.health = Math.max(0, dragon.health - Math.floor(decayAmount / 2));
            }
        }
    }
}

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

let selectedElementType = 'Fogo';

function chooseElement(type) {
    selectedElementType = type;
    
    // update grid selection visual
    const cards = document.querySelectorAll('#element-selection .dragon-card');
    cards.forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // update preview
    const preview = document.getElementById('preview-avatar');
    if(type === 'Fogo') preview.innerText = '🔥';
    if(type === 'Água') preview.innerText = '💧';
    if(type === 'Terra') preview.innerText = '🌿';
    
    // recommend a color change depending on element if user hasn't chosen one
    const colorInput = document.getElementById('new-dragon-color');
    if (type === 'Fogo') colorInput.value = '#fb923c';
    if (type === 'Água') colorInput.value = '#60a5fa';
    if (type === 'Terra') colorInput.value = '#34d399';
    preview.style.textShadow = `0 0 25px ${colorInput.value}`;
}

// color picker listener
document.addEventListener('DOMContentLoaded', () => {
    const colorInput = document.getElementById('new-dragon-color');
    if(colorInput) {
        colorInput.addEventListener('input', (e) => {
            document.getElementById('preview-avatar').style.textShadow = `0 0 25px ${e.target.value}`;
        });
    }

    const editColorInput = document.getElementById('edit-dragon-color');
    if(editColorInput) {
        editColorInput.addEventListener('input', (e) => {
            document.getElementById('edit-preview-avatar').style.textShadow = `0 0 25px ${e.target.value}`;
        });
    }
});

function createDragon() {
    const nameInput = document.getElementById('new-dragon-name').value.trim();
    const colorInput = document.getElementById('new-dragon-color').value;
    
    if(!nameInput) {
        alert("Por favor, dê um nome ao seu dragão!");
        return;
    }

    dragon = {
        type: selectedElementType,
        name: nameInput,
        level: 1,
        health: 100,
        hunger: 100,
        energy: 100,
        happiness: 100,
        avatar: selectedElementType === 'Fogo' ? '🔥' : selectedElementType === 'Água' ? '💧' : '🌿',
        color: colorInput
    };
    
    showScreen('main');
    updateUI();
    startDecay();
    saveState();
}

function resetGame() {
    if(confirm("Tem certeza que quer abandonar seu dragão e começar de novo?")) {
        localStorage.removeItem('dragonMaster_State');
        localStorage.removeItem('dragonMaster_LastTime');
        clearInterval(decayInterval);
        showScreen('selection');
    }
}

// Edit Modal Functions
function openEditModal() {
    document.getElementById('edit-dragon-name').value = dragon.name;
    document.getElementById('edit-dragon-color').value = dragon.color || '#ffffff';
    document.getElementById('edit-preview-avatar').innerText = dragon.avatar;
    document.getElementById('edit-preview-avatar').style.textShadow = `0 0 25px ${dragon.color}`;
    
    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

function saveEdit() {
    const newName = document.getElementById('edit-dragon-name').value.trim();
    const newColor = document.getElementById('edit-dragon-color').value;
    
    if(!newName) {
        alert("O dragão precisa de um nome!");
        return;
    }
    
    dragon.name = newName;
    dragon.color = newColor;
    
    closeEditModal();
    updateUI();
    saveState();
}

function updateUI() {
    // Top Info
    document.getElementById('dragon-name-display').innerText = dragon.name;
    document.getElementById('dragon-type-display').innerText = `Dragão de ${dragon.type}`;
    document.getElementById('dragon-level').innerText = dragon.level;
    
    const displayAvatar = dragon.level > 5 ? '🐉' : dragon.avatar; // Evolves at level 6
    document.getElementById('main-dragon-avatar').innerText = displayAvatar;
    document.getElementById('battle-my-avatar').innerText = displayAvatar;

    // Avatar Glow Class Customization
    const mainAvatar = document.getElementById('main-dragon-avatar');
    mainAvatar.className = 'dragon-avatar main-avatar'; // reset
    if (dragon.color) {
        mainAvatar.style.textShadow = `0 0 25px ${dragon.color}`;
    } else {
        if (dragon.type === 'Fogo') mainAvatar.classList.add('fire');
        if (dragon.type === 'Água') mainAvatar.classList.add('water');
        if (dragon.type === 'Terra') mainAvatar.classList.add('earth');
    }
    
    const battleMyAvatar = document.getElementById('battle-my-avatar');
    if (dragon.color) battleMyAvatar.style.textShadow = `0 0 20px ${dragon.color}`;

    // Bars
    updateBar('health', dragon.health);
    updateBar('hunger', dragon.hunger);
    updateBar('energy', dragon.energy);
    updateBar('happiness', dragon.happiness);

    updateMessage();
}

function updateBar(stat, value) {
    document.getElementById(`bar-${stat}`).style.width = `${value}%`;
    document.getElementById(`${stat}-val`).innerText = Math.floor(value);
    
    // Color change alert logic
    const bar = document.getElementById(`bar-${stat}`);
    if (value < 30) {
        bar.style.backgroundColor = '#ef4444'; // turn red universally on critically low
    } else {
        bar.style.backgroundColor = ''; // revert to var
    }
}

function updateMessage() {
    const msg = document.getElementById('status-message');
    if (dragon.health === 0) msg.innerText = "Seu dragão desmaiou de fraqueza. Alimente e descanse-o imediatamente.";
    else if (dragon.health < 30) msg.innerText = "Seu dragão está doente e muito fraco!";
    else if (dragon.hunger < 30) msg.innerText = "Sua barriga está roncando... Alimente-o!";
    else if (dragon.energy < 30) msg.innerText = "Ele está exausto. Precisa descansar.";
    else if (dragon.happiness < 30) msg.innerText = "Ele parece solitário. Brinque um pouco.";
    else {
        const happyMsgs = ["Seu dragão está feliz e forte!", "Pronto para qualquer batalha!", "Um belo dia para voar."];
        msg.innerText = happyMsgs[Math.floor(Math.random() * happyMsgs.length)];
    }
}

function saveState() {
    localStorage.setItem('dragonMaster_State', JSON.stringify(dragon));
    localStorage.setItem('dragonMaster_LastTime', Date.now().toString());
}

// Everyday behavior (Status decay over time)
function startDecay() {
    clearInterval(decayInterval);
    decayInterval = setInterval(() => {
        // Stats decay every real-world minute conceptually, configured to 15 secs for demo UX
        dragon.hunger = Math.max(0, dragon.hunger - 1);
        dragon.energy = Math.max(0, dragon.energy - 0.5);
        dragon.happiness = Math.max(0, dragon.happiness - 1);
        
        // Consequence of neglect
        if (dragon.hunger === 0 || dragon.energy === 0) {
            dragon.health = Math.max(0, dragon.health - 2);
        }

        // Natural healing if all stats are good
        if (dragon.hunger > 70 && dragon.energy > 70 && dragon.happiness > 70 && dragon.health > 0) {
            dragon.health = Math.min(100, dragon.health + 1);
        }

        updateUI();
        saveState();
    }, 15000); 
}

// Interactions
function playAnim(elementId, animClass) {
    const el = document.getElementById(elementId);
    el.classList.remove(animClass);
    void el.offsetWidth; // trigger reflow
    el.classList.add(animClass);
}

function feedDragon() {
    if(dragon.health === 0 && dragon.hunger > 50) return; // Prevent overfeeding a fainted dragon
    dragon.hunger = Math.min(100, dragon.hunger + 25);
    dragon.happiness = Math.min(100, dragon.happiness + 5);
    dragon.health = Math.min(100, dragon.health + 5); 
    playAnim('main-dragon-avatar', 'shake');
    logMessage("Você deu uma carne suculenta. Ele adorou!");
    updateUI();
    saveState();
}

function sleepDragon() {
    dragon.energy = Math.min(100, dragon.energy + 40);
    dragon.hunger = Math.max(0, dragon.hunger - 10); 
    dragon.health = Math.min(100, dragon.health + 15);
    logMessage("Zzz... O dragão está tirando uma soneca recuperadora.");
    updateUI();
    saveState();
}

function playDragon() {
    if(dragon.energy < 20) {
        logMessage("Ele está muito cansado para brincar agora.");
        return;
    }
    dragon.happiness = Math.min(100, dragon.happiness + 25);
    dragon.energy = Math.max(0, dragon.energy - 15);
    dragon.hunger = Math.max(0, dragon.hunger - 10);
    playAnim('main-dragon-avatar', 'shake');
    logMessage("Vocês correram juntos. Diversão pura!");
    updateUI();
    saveState();
}

// =======================
// BATTLE SYSTEM
// =======================
let battleActive = false;
const enemies = [
    { name: "Grifo Feroz", avatar: "🦅", baseHp: 80 },
    { name: "Golem Ancestral", avatar: "🪨", baseHp: 150 },
    { name: "Fênix Sombria", avatar: "🪶", baseHp: 120 },
    { name: "Serpente do Mar", avatar: "🐍", baseHp: 100 },
    { name: "Dragão Corrompido", avatar: "🐲", baseHp: 200 }
];

function openBattleScreen() {
    if (dragon.health < 40 || dragon.energy < 30) {
        alert("Seu dragão está muito fraco para lutar. Recupere a saúde (>40) e a energia (>30) primeiro!");
        return;
    }
    
    // Choose random enemy
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    const scalingHp = randomEnemy.baseHp + (dragon.level * 15);
    
    enemy = {
        name: `Nível ${Math.max(1, dragon.level + Math.floor(Math.random() * 3 - 1))} ${randomEnemy.name}`,
        hp: scalingHp,
        maxHp: scalingHp,
        avatar: randomEnemy.avatar
    };

    document.getElementById('enemy-name').innerText = enemy.name;
    document.getElementById('battle-enemy-avatar').innerText = enemy.avatar;
    
    battleActive = true;
    
    document.getElementById('battle-actions').classList.remove('hidden');
    document.getElementById('end-battle-btn').classList.add('hidden');
    document.getElementById('battle-log').innerHTML = "<p>O adversário te encara ferozmente! Preparar para a batalha...</p>";
    
    updateBattleUI();
    showScreen('battle');
}

function updateBattleUI() {
    document.getElementById('battle-my-hp').style.width = `${(dragon.health / 100) * 100}%`;
    document.getElementById('battle-enemy-hp').style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
}

function logBattle(msg) {
    const log = document.getElementById('battle-log');
    log.innerHTML = `<p>${msg}</p>` + log.innerHTML;
}

function logMessage(msg) {
    document.getElementById('status-message').innerText = msg;
}

function attack() {
    if(!battleActive) return;
    
    playAnim('battle-my-avatar', 'attack-anim');
    dragon.energy = Math.max(0, dragon.energy - 3); // Attacking costs energy
    
    setTimeout(() => {
        let baseDmg = 15 + Math.floor(Math.random() * 10);
        let levelMod = (dragon.level * 3);
        let dmg = baseDmg + levelMod;
        
        // Element strategy
        if (dragon.type === 'Fogo') dmg = Math.floor(dmg * 1.2); // Fogo dá 20% mais dano

        let isCrit = Math.random() > 0.8;
        if(isCrit) {
            dmg = Math.floor(dmg * 1.5);
        }
        
        enemy.hp = Math.max(0, enemy.hp - dmg);
        logBattle(`💥 ${isCrit ? 'CRÍTICO! ' : ''}Você atacou causando ${dmg} de dano!`);
        updateBattleUI();
        playAnim('battle-enemy-avatar', 'shake');
        
        checkBattleState();
        if(battleActive) enemyTurn();
    }, 400); // Wait for anim
}

function defend() {
    if(!battleActive) return;
    dragon.energy = Math.min(100, dragon.energy + 15);
    logBattle("🛡️ Você assumiu postura defensiva. Energia recuperada!");
    enemyTurn(true); 
}

function flee() {
    logBattle("🏃 Você fugiu da batalha com o rabo entre as pernas.");
    dragon.happiness = Math.max(0, dragon.happiness - 20); // Penalty for fleeing
    endBattle();
}

function enemyTurn(playerDefending = false) {
    // Disable buttons so player cant spam
    const btns = document.querySelectorAll('.battle-actions button');
    btns.forEach(b => b.disabled = true);

    setTimeout(() => {
        let dmg = 12 + Math.floor(Math.random() * 8) + (dragon.level * 2);
        
        if(playerDefending) {
            dmg = Math.floor(dmg * 0.3); // 70% damage reduction when defending
            logBattle("Seu escudo bloqueou grande parte do dano.");
        }
        
        if(!playerDefending && dragon.type === 'Terra') {
            dmg = Math.floor(dmg * 0.8); // Terra tem 20% de defesa passiva
        }
        
        dragon.health = Math.max(0, dragon.health - dmg);
        logBattle(`👾 O inimigo atacou sentando-lhe a mão! ${dmg} de dano!`);
        updateBattleUI();
        playAnim('battle-my-avatar', 'shake');
        
        updateUI(); // match health on main screen
        checkBattleState();
        
        btns.forEach(b => b.disabled = false);
    }, 1000); // 1 second delay for enemy turn
}

function checkBattleState() {
    if (enemy.hp <= 0) {
        logBattle("🏆 VOCÊ VENCEU A BATALHA!");
        winBattle();
    } else if (dragon.health <= 0) {
        logBattle("💀 Seu dragão desmaiou devido aos ferimentos...");
        loseBattle();
    }
}

function winBattle() {
    battleActive = false;
    dragon.level++;
    dragon.happiness = 100;
    
    // Heals a bit as reward
    dragon.health = Math.min(100, dragon.health + 30);
    
    logBattle(`🎉 SUBIU PARA O NÍVEL ${dragon.level}!`);
    saveState();
    updateUI();
    document.getElementById('battle-actions').classList.add('hidden');
    document.getElementById('end-battle-btn').classList.remove('hidden');
}

function loseBattle() {
    battleActive = false;
    dragon.happiness = Math.max(0, dragon.happiness - 30);
    saveState();
    updateUI();
    document.getElementById('battle-actions').classList.add('hidden');
    document.getElementById('end-battle-btn').classList.remove('hidden');
}

function endBattle() {
    battleActive = false;
    document.getElementById('battle-actions').classList.add('hidden');
    document.getElementById('end-battle-btn').classList.remove('hidden');
    saveState();
    updateUI();
}

function backToMain() {
    showScreen('main');
}

// Start
init();
