let dragon = {
    species: 'Dragão',
    type: null,
    name: "Meu Dragão",
    level: 1,
    health: 100,
    hunger: 100,
    energy: 100,
    happiness: 100,
    hygiene: 100,
    extraHealth: 0,
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
        if (dragon.extraHealth === undefined) dragon.extraHealth = 0;
        if (dragon.hygiene === undefined) dragon.hygiene = 100;
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
            dragon.hygiene = Math.max(0, dragon.hygiene - decayAmount);
            
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
let selectedSpecies = 'Dragão';
let selectedAvatar = '🐲';

function chooseSpecies(species, avatar) {
    selectedSpecies = species;
    selectedAvatar = avatar;
    
    const cards = document.querySelectorAll('#species-selection .dragon-card');
    cards.forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    const preview = document.getElementById('preview-avatar');
    preview.innerText = avatar;
}

function setQuickColor(color) {
    const colorInput = document.getElementById('new-dragon-color');
    if (colorInput) {
        colorInput.value = color;
        document.getElementById('preview-avatar').style.textShadow = `0 0 25px ${color}`;
    }
}

function setQuickColorEdit(color) {
    const colorInput = document.getElementById('edit-dragon-color');
    if (colorInput) {
        colorInput.value = color;
        document.getElementById('edit-preview-avatar').style.textShadow = `0 0 25px ${color}`;
    }
}

function chooseElement(type) {
    selectedElementType = type;
    
    // update grid selection visual
    const cards = document.querySelectorAll('#element-selection .dragon-card');
    cards.forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // update preview (optional, elements usually have colors)
    // recommend a color change depending on element
    const colorInput = document.getElementById('new-dragon-color');
    const preview = document.getElementById('preview-avatar');

    if (type === 'Fogo') colorInput.value = '#fb923c';
    if (type === 'Água') colorInput.value = '#60a5fa';
    if (type === 'Terra') colorInput.value = '#34d399';
    if (type === 'Trovão') colorInput.value = '#facc15';
    if (type === 'Gelo') colorInput.value = '#93c5fd';
    if (type === 'Luz') colorInput.value = '#fde047';
    if (type === 'Sombra') colorInput.value = '#a855f7';
    
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
        species: selectedSpecies,
        type: selectedElementType,
        name: nameInput,
        level: 1,
        health: 100,
        hunger: 100,
        energy: 100,
        happiness: 100,
        hygiene: 100,
        extraHealth: 0,
        avatar: selectedAvatar,
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
    document.getElementById('dragon-type-display').innerText = `${dragon.species} de ${dragon.type}`;
    document.getElementById('dragon-level').innerText = dragon.level;
    
    const evolutions = {
        'Dragão': '🐉',
        'Grifo': '🦁',
        'Unicórnio': '🦄',
        'Fênix': '🦅',
        'Lobo': '🐺'
    };
    
    // For now, let's just use the base avatar if no evolution is defined, 
    // but Dragão still evolves to 🐉
    const displayAvatar = (dragon.level > 5 && dragon.species === 'Dragão') ? '🐉' : dragon.avatar;
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
    updateBar('hygiene', dragon.hygiene);
    
    // Extra Health UI (Main Screen)
    const extraVal = document.getElementById('extra-health-val');
    const extraContainer = document.getElementById('extra-health-container');
    if (dragon.extraHealth > 0) {
        extraContainer.classList.remove('hidden');
        extraVal.innerText = dragon.extraHealth;
        document.getElementById('bar-extra-health').style.width = `${Math.min(100, (dragon.extraHealth / 100) * 100)}%`;
    } else {
        extraContainer.classList.add('hidden');
    }

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
    else if (dragon.hygiene < 30) msg.innerText = "Ugh... Ele está bem sujo. Banho imediato!";
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
        dragon.hygiene = Math.max(0, dragon.hygiene - 1.5);
        
        // Consequence of neglect
        if (dragon.hunger === 0 || dragon.energy === 0 || dragon.hygiene === 0) {
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

function feedDragon(foodType) {
    if(dragon.health === 0 && dragon.hunger > 50) return;
    
    let stats = { hunger: 0, health: 0, happiness: 0, hygiene: 0, energy: 0 };
    let msg = "";

    switch(foodType) {
        case 'Carne':
            stats = { hunger: 30, health: 5, happiness: 5, hygiene: -5 };
            msg = "Você deu uma carne suculenta. Ele adorou!";
            break;
        case 'Maçã':
            stats = { hunger: 15, health: 10, happiness: 5, hygiene: 0 };
            msg = "Uma maçã fresquinha. Muito saudável!";
            break;
        case 'Pizza':
            stats = { hunger: 50, health: -5, happiness: 10, hygiene: -20 };
            msg = "Pizza! Muita energia, mas que sujeira ele fez!";
            break;
        case 'Sushi':
            stats = { hunger: 25, health: 5, happiness: 10, hygiene: 0, energy: 10 };
            msg = "Sushi premium! Ele se sente revigorado.";
            break;
        case 'Sorvete':
            stats = { hunger: 10, health: -2, happiness: 25, hygiene: -10 };
            msg = "Um sorvete geladinho. Felicidade pura!";
            break;
    }

    dragon.hunger = Math.min(100, dragon.hunger + (stats.hunger || 0));
    dragon.health = Math.min(100, dragon.health + (stats.health || 0));
    dragon.happiness = Math.min(100, dragon.happiness + (stats.happiness || 0));
    dragon.hygiene = Math.min(100, dragon.hygiene + (stats.hygiene || 0));
    dragon.energy = Math.min(100, dragon.energy + (stats.energy || 0));

    playAnim('main-dragon-avatar', 'shake');
    logMessage(msg);
    updateUI();
    saveState();
}

function bathDragon() {
    dragon.hygiene = 100;
    dragon.happiness = Math.min(100, dragon.happiness + 10);
    playAnim('main-dragon-avatar', 'floating'); // Reuse floating logic as "joy"
    logMessage("🛁 Hora do banho! Ele está limpinho e cheiroso.");
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
    { name: "Dragão Corrompido", avatar: "🐲", baseHp: 200 },
    { name: "Lorde de Gelo", avatar: "❄️", baseHp: 250 },
    { name: "Titã das Sombras", avatar: "🌑", baseHp: 300 },
    { name: "Hydra de Fogo", avatar: "☄️", baseHp: 180 },
    { name: "Viral de Código", avatar: "👾", baseHp: 100 },
    { name: "Mech-Rex", avatar: "🤖", baseHp: 220 },
    { name: "Kraken Abissal", avatar: "🐙", baseHp: 190 },
    { name: "Escorpião Rei", avatar: "🦂", baseHp: 140 },
    { name: "Quimera Real", avatar: "🦁", baseHp: 170 },
    { name: "Fantasma da Ópera", avatar: "👻", baseHp: 110 },
    { name: "Rei das Neves", avatar: "🏔️", baseHp: 240 },
    { name: "Magma Elemental", avatar: "🌋", baseHp: 210 },
    { name: "Morcego Vampiro", avatar: "🦇", baseHp: 130 },
    { name: "Tigre Raivoso", avatar: "🐯", baseHp: 160 },
    { name: "Zumbido Infernal", avatar: "🦟", baseHp: 90 },
    { name: "Nave-mãe Alien", avatar: "🛸", baseHp: 280 }
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
    
    // Extra Health (Battle Screen)
    const battleExtraContainer = document.getElementById('battle-extra-health-container');
    if (dragon.extraHealth > 0) {
        battleExtraContainer.classList.remove('hidden');
        document.getElementById('battle-my-extra-hp').style.width = `${Math.min(100, (dragon.extraHealth / 100) * 100)}%`;
    } else {
        battleExtraContainer.classList.add('hidden');
    }
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
        let levelMod = (dragon.level * 7); // Aumentado significativamente
        let dmg = baseDmg + levelMod;
        
        // Bônus de Evolução (Nível 6+)
        if (dragon.level >= 6) {
            dmg = Math.floor(dmg * 1.5);
        }
        
        // Element strategy
        if (dragon.type === 'Fogo') dmg = Math.floor(dmg * 1.2);
        if (dragon.type === 'Sombra') {
            dmg = Math.floor(dmg * 1.5);
            dragon.health = Math.max(5, dragon.health - 10);
            logBattle("🌑 Poder das Sombras! Dano massivo em troca de vida.");
        }
        if (dragon.type === 'Veneno') {
            let poisonDmg = Math.floor(dmg * 0.25);
            enemy.hp = Math.max(0, enemy.hp - poisonDmg);
            logBattle(`🤢 Tokina Venenosa! +${poisonDmg} de dano persistente.`);
        }
        if (dragon.type === 'Caos') {
            const chaosEffects = ['Fogo', 'Trovão', 'Luz', 'Veneno', 'Sombra'];
            const effect = chaosEffects[Math.floor(Math.random() * chaosEffects.length)];
            logBattle(`🌀 CAOS! Manifestando poder de ${effect}!`);
            if (effect === 'Fogo') dmg = Math.floor(dmg * 1.3);
            if (effect === 'Trovão') logBattle("⚡ Faísca Caótica detectada!"); // Extra luck handles it below
            if (effect === 'Luz') dragon.health = Math.min(100, dragon.health + 10);
            if (effect === 'Veneno') enemy.hp = Math.max(0, enemy.hp - 10);
            if (effect === 'Sombra') dmg = Math.floor(dmg * 1.4);
        }

        let isCrit = Math.random() > 0.8;
        if(isCrit) {
            dmg = Math.floor(dmg * 1.5);
        }
        
        enemy.hp = Math.max(0, enemy.hp - dmg);
        logBattle(`💥 ${isCrit ? 'CRÍTICO! ' : ''}Você atacou causando ${dmg} de dano!`);
        
        if (dragon.type === 'Luz') {
            let heal = Math.floor(dmg * 0.2);
            dragon.health = Math.min(100, dragon.health + heal);
            logBattle(`✨ Luz Curativa! Você regenerou ${heal} HP.`);
        }

        updateBattleUI();
        playAnim('battle-enemy-avatar', 'shake');
        
        checkBattleState();
        
        // Thunder logic: 20% chance for double attack
        if (battleActive && dragon.type === 'Trovão' && Math.random() < 0.2) {
            logBattle("⚡ VELOCIDADE DO TROVÃO! Ataque duplo!");
            setTimeout(attack, 1000);
            return; // Exit current attack flow to avoid overlapping
        }

        if(battleActive) enemyTurn();
    }, 400); // Wait for anim
}

function defend() {
    if(!battleActive) return;
    dragon.energy = Math.min(100, dragon.energy + 15);
    
    // Pequeno contra-ataque durante a defesa
    let counterDmg = 5 + Math.floor(dragon.level * 1.5);
    enemy.hp = Math.max(0, enemy.hp - counterDmg);
    
    logBattle(`🛡️ Postura defensiva! Energia +15 e causou ${counterDmg} de contra-ataque!`);
    updateBattleUI();
    enemyTurn(true); 
}

function flee() {
    logBattle("🏃 Você fugiu da batalha com o rabo entre as pernas.");
    dragon.happiness = Math.max(0, dragon.happiness - 20); // Penalty for fleeing
    endBattle();
}

function enemyTurn(playerDefending = false) {
    const btns = document.querySelectorAll('.battle-actions button');
    btns.forEach(b => b.disabled = true);

    // Ar: Evasão
    if (!playerDefending && dragon.type === 'Ar' && Math.random() < 0.20) {
        setTimeout(() => {
            logBattle("💨 VENTANIA! Você se moveu como o vento e DESVIOU do ataque!");
            btns.forEach(b => b.disabled = false);
            checkBattleState();
        }, 800);
        return;
    }

    // Gelo: Congelar
    if (!playerDefending && dragon.type === 'Gelo' && Math.random() < 0.15) {
        setTimeout(() => {
            logBattle("❄️ O inimigo está CONGELADO e perdeu o turno!");
            btns.forEach(b => b.disabled = false);
            checkBattleState();
        }, 1000);
        return;
    }

    // Psíquico: Confusão
    let enemyConfused = (!playerDefending && dragon.type === 'Psíquico' && Math.random() < 0.15);

    setTimeout(() => {
        let dmg = 15 + Math.floor(Math.random() * 12) + (dragon.level * 4);
        
        // Defesa Escalonada por Nível (O animal fica mais ríspido e resistente)
        let levelDefense = dragon.level * 2;
        dmg = Math.max(1, dmg - levelDefense);
        
        if(playerDefending) {
            dmg = Math.floor(dmg * 0.25); // 75% damage reduction when defending
            logBattle("Seu escudo bloqueou grande parte do dano.");
        }
        
        if(!playerDefending && dragon.type === 'Terra') {
            dmg = Math.floor(dmg * 0.7);
        }

        if(!playerDefending && dragon.type === 'Metal') {
            dmg = Math.floor(dmg * 0.6); // 40% de redução
            logBattle("🔩 Armadura de Metal! Dano recebido reduzido.");
        }

        // Cristal: Reflexão
        if (!playerDefending && dragon.type === 'Cristal') {
            let reflectDmg = Math.floor(dmg * 0.25);
            enemy.hp = Math.max(0, enemy.hp - reflectDmg);
            logBattle(`💎 Pele de Cristal! Refletiu ${reflectDmg} de dano ao inimigo.`);
        }

        // Psíquico: Efeito final
        if (enemyConfused) {
            enemy.hp = Math.max(0, enemy.hp - dmg);
            logBattle(`🧠 CONFUSÃO MENTAL! O inimigo ficou confuso e atacou a si mesmo por ${dmg} de dano!`);
            dmg = 0;
        }
        
        // Lógica de Vida Extra (Escudo)
        if (dragon.extraHealth > 0) {
            if (dragon.extraHealth >= dmg) {
                dragon.extraHealth -= dmg;
                logBattle(`🛡️ O Escudo de Alma absorveu ${dmg} de dano!`);
                dmg = 0;
            } else {
                let absorbed = dragon.extraHealth;
                dmg -= absorbed;
                dragon.extraHealth = 0;
                logBattle(`🛡️ O Escudo de Alma quebrou! Absorveu ${absorbed} de dano.`);
            }
        }
        
        if (dmg > 0) {
            dragon.health = Math.max(0, dragon.health - dmg);
            logBattle(`👾 O inimigo atacou ferozmente! ${dmg} de dano!`);
        }
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
    
    // Recompensas de Level Up melhoradas
    dragon.health = Math.min(100, dragon.health + 50); // Recupera 50% de HP
    
    // VIDA EXTRA ESCALONADA
    let extraGain = 50 + (dragon.level * 10);
    dragon.extraHealth += extraGain;
    
    logBattle(`🎉 LEVEL UP! NÍVEL ${dragon.level}!`);
    logBattle(`💪 Sua força aumentou! Ganhou +${extraGain} de Vida Extra.`);
    saveState();
    updateUI();
    document.getElementById('battle-actions').classList.add('hidden');
    
    // Volta automático após 2.5 segundos
    setTimeout(backToMain, 2500);
}

function loseBattle() {
    battleActive = false;
    dragon.happiness = Math.max(0, dragon.happiness - 30);
    saveState();
    updateUI();
    document.getElementById('battle-actions').classList.add('hidden');
    
    // Volta automático após 2 segundos
    setTimeout(backToMain, 2000);
}

function endBattle() {
    battleActive = false;
    document.getElementById('battle-actions').classList.add('hidden');
    saveState();
    updateUI();
    
    // Volta automático após 1.5 segundos
    setTimeout(backToMain, 1500);
}

function backToMain() {
    showScreen('main');
}

// Start
init();
