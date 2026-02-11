const VERSION = "0.6"

document.getElementById("game-title").textContent = `Proto26 v${VERSION}`

var money = 0
var time = 420
var oldScene = ""
var currentScene = ""
var health = 10
var xp = 0
var title = "Unknown"
var travelInfo = {
    "destination": null,
    "distance": 0,
    "completed": 0,
    // "arrival": [0, 0]
}
var battleStats = {
    "str": 1,
    "def": 1,
    "spd": 1,
    "dex": 1
}
var combatData = {
    "enemy": null,
    "enemyHealth": 0,
    "enemyMaxHealth": 0,
    "enemyStats": {
        "str": 0,
        "def": 0,
        "spd": 0,
        "dex": 0
    },
    "enemyProperties": []
}
var checks = {}
var logAutoScroll = true
var skills = {}
var inventory = {}
var storage = {}
var storageAccess = false
var inventoryWeight = 0
var energy = 100
var noSleepTime = 0
var effects = {}
var quests = {}
var completedQuests = []
var stats = {
    "playtime": 0,
    "gametime": 0,
    "kills": {},
    "timeSlept": 0
}
var shopStorage = {}
var knownRecipes = ["strawBasket"]
var craftInfo = {
    "recipe": null,
    "goal": 0,
    "completed": 0
}
var team = "none"

const linkRegex = new RegExp(/\{([^|{}]+)\|([^|{}]+)\|?([^|{}]+)?\|?([^|{}]+)?}/g)
const textSplitter = new RegExp(/{[^}]{1,}}/g)
const imageRegex = new RegExp(/!\\[(.*?)\\]/g)
const enemyData = {
    "strawDummy": {
        "name": "Straw Dummy",
        "health": [40, 50],
        "str": 0,
        "def": [2.5, 3],
        "spd": 0,
        "dex": 0,
        "loot": [
            {"item": "straw", "chances": {
                0: 40,
                1: 50,
                2: 10
            }}
        ],
        "xp": [3, 5]
    },
    "mouse": {
        "name": "Mouse",
        "health": [12, 18],
        "str": [0.15, 0.2],
        "def": [0.2, 0.3],
        "spd": [1.5, 2],
        "dex": [1.5, 2],
        "xp": [5, 7]
    }
}
const skillData = {
    "walking": {
        "name": "Walking",
        "desc": "Allows you to travel faster while walking",
        "scaling": 1.3
    },
    "fighting": {
        "name": "Fighting",
        "desc": "Slightly increases damage dealt",
        "scaling": 1.3
    },
    "training": {
        "name": "Training",
        "desc": "Increases stat gains from training",
        "scaling": 1.3
    },
    "crafting": {
        "name": "Crafting",
        "desc": "Increases crafting speed",
        "scaling": 1.2
    }
}
const itemData = {
    "straw": {
        "name": "Strand of Straw",
        "desc": "A strand of straw that came from a training dummy",
        "weight": 0.5
    },
    "exercisePill": {
        "name": "Exercise Pill",
        "desc": "Increases stat gain from training by 50% for one hour",
        "weight": 1,
        "execute": function() {
            changeEffect("exercisePill", true, 60)
        }
    },
    "strawBasket": {
        "name": "Straw Basket",
        "desc": "A small basket made of straw",
        "weight": 10,
        "crafting": {
            "complexity": 60,
            "materials": {
                "straw": 20
            }
        }
    }
}
const effectData = {
    "sleepDeprived": {
        "name": "Sleep Deprived",
        "desc": "Due to a lack of sleep, your energy loss per minute has increased",
        "color": "#006666"
    },
    "exercisePill": {
        "name": "Exercise Pill",
        "desc": "Stat gain is increased by 50%",
        "color": "#cccc00"
    }
}
const questData = {
    "dojoIntro1": {
        "name": "Dojo Introduction 1",
        "desc": "You have been tasked by the instructor to defeat a total of 5 straw dummies and reach 1.5 strength",
        "repeatable": false,
        "goals": {
            "kills": {
                "strawDummy": {
                    "amount": 5,
                    "lifetime": false
                }
            },
            "stats": {
                "str": {
                    "amount": 1.5,
                    "lifetime": true
                }
            }
        }
    },
    "dojoIntro2": {
        "name": "Dojo Introduction 2",
        "desc": "You have been tasked by the instructor to reach 1.5 in every stat",
        "repeatable": false,
        "goals": {
            "stats": {
                "str": {
                    "amount": 1.5,
                    "lifetime": true
                },
                "def": {
                    "amount": 1.5,
                    "lifetime": true
                },
                "spd": {
                    "amount": 1.5,
                    "lifetime": true
                },
                "dex": {
                    "amount": 1.5,
                    "lifetime": true
                }
            }
        }
    },
    "dojoIntro3": {
        "name": "Pest Control",
        "desc": "You have been tasked by the instructor to defeat 10 mice in the alleys",
        "repeatable": false,
        "goals": {
            "kills": {
                "mouse": {
                    "amount": 10,
                    "lifetime": false
                }
            },
        }
    }
}
const shopData = {
    "merchant": [
        {"name": "exercisePill", "chance": 100, "quantity": [1, 3], "price": [5, 7]}
    ]
}

const gyms = {
    "none": {
        "str": 0.01,
        "def": 0.01,
        "spd": 0.01,
        "dex": 0.01
    },
    "nextLevel": {
        "str": 0.02,
        "def": 0.02,
        "spd": 0.02,
        "dex": 0.02
    }
}

function formatTime(time, timeOnly=false) {
    const baseDate = new Date(1900, 0, 1)

    baseDate.setMinutes(baseDate.getMinutes() + time)

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const dayName = dayNames[baseDate.getDay()]

    const year = baseDate.getFullYear()
    const month = String(baseDate.getMonth() + 1).padStart(2, "0")
    const date = String(baseDate.getDate()).padStart(2, "0")

    const hours = String(baseDate.getHours()).padStart(2, "0")
    const minutes = String(baseDate.getMinutes()).padStart(2, "0")

    const timeString = `${hours}:${String(Math.round(minutes)).padStart(2, "0")}`
    if (timeOnly) {
        return timeString
    }
    return `${dayName} ${year}/${month}/${date} ${timeString}`
}

function getDay(time) {
    return Math.ceil((time + 1) / 1440)
}

function xpToLevel(xp, decimals = false, r = 1.1) {
    let n = Math.log((xp * (r - 1)) / 50 + 1) / Math.log(r)
    return decimals ? n : Math.floor(n)
}

function levelToXp(level, r = 1.1) {
    return 50 * (Math.pow(r, level) - 1) / (r - 1)
}

function xpForLevel(level, r = 1.1) {
    return levelToXp(level + 1, r) - levelToXp(level, r)
}

function xpIntoLevel(xp, r = 1.1) {
    const level = xpToLevel(xp, false, r)
    const levelStartXp = levelToXp(level, r)
    return Math.max(0, xp - levelStartXp)
}

function calcMaxHp(level=xpToLevel(xp)) {
    return Math.round(2 * level ** 1.5 + level + 10)
}

const ranks = [
    {"rank": "G-", "max": 5},
    {"rank": "G", "max": 20},
    {"rank": "G+", "max": 100},
    {"rank": "E-", "max": 500},
    {"rank": "E", "max": 2000},
    {"rank": "E+", "max": 10_000},
    {"rank": "D-", "max": 40_000},
    {"rank": "D", "max": 200_000},
    {"rank": "D+", "max": 1_000_000},
    {"rank": "C-", "max": 5_000_000},
    {"rank": "C", "max": 25_000_000},
    {"rank": "C+", "max": 100_000_000},
    {"rank": "B-", "max": 500_000_000},
    {"rank": "B", "max": 2_500_000_000},
    {"rank": "B+", "max": 10_000_000_000},
    {"rank": "A-", "max": 1e11},
    {"rank": "A", "max": 1e12},
    {"rank": "A+", "max": Infinity},
]

function getRank() {
    return ranks.find(r => getTotalBattlestats() < r['max'])['rank']
}

function updateLevelText(currentXp=xp) {
    document.getElementById("level").textContent = `Level ${xpToLevel(currentXp)} ${getRank()}`
}

function updateBar(bar) {
    if (bar == "health") {
        document.getElementById("healthbar-text").textContent = `HP: ${health}/${calcMaxHp()}`
        document.getElementById("healthbar-fill").style.width = `${health / calcMaxHp() * 100}%`
    } else if (bar == "energy") {
        document.getElementById("energy-bar-text").textContent = `Energy: ${Math.round(energy)}/100`
        document.getElementById("energy-bar-fill").style.width = `${energy / 100 * 100}%`
    } else if (bar == "xp") {
        document.getElementById("xp-bar-text").textContent = `XP: ${Math.round(xpIntoLevel(xp))}/${Math.round(xpForLevel(xpToLevel(xp)))}`
        document.getElementById("xp-bar-fill").style.width = `${xpIntoLevel(xp) / xpForLevel(xpToLevel(xp)) * 100}%`
        updateLevelText(xp)
    } else if (bar == "enemyHealth") {
        document.getElementById("enemy-healthbar-text").textContent = `HP: ${combatData['enemyHealth']}/${combatData['enemyMaxHealth']}`
        document.getElementById("enemy-healthbar-fill").style.width = `${combatData['enemyHealth'] / combatData['enemyMaxHealth'] * 100}%`
    }
}

function updateBattlestats(statName=null) {
    for (const [stat, value] of Object.entries(battleStats)) {
        if (statName == null || stat == statName) {
            const effectiveStat = value * calcEnergyDebuff()
            const debuffPercentage = effectiveStat / value * 100 - 100
            document.getElementById(`stat-${stat}`).textContent = `${stat.charAt(0).toUpperCase()}${stat.slice(1)}: ${formatNumber(value)}${Math.round(debuffPercentage) != 0 ? ` (${debuffPercentage.toFixed(0)}%)` : ""}`
            document.getElementById(`stat-total`).textContent = `Ttl: ${formatNumber(getTotalBattlestats())}`
        }
    }
}

function colorGen(hex, text) {
    return "<span style=\"color: " + hex + "\">" + text + "</span>"
}

document.getElementById("log").addEventListener("scroll", function() {
    const {scrollTop, scrollHeight, clientHeight} = document.getElementById("log")
    logAutoScroll = scrollHeight - scrollTop - clientHeight < 24
})

function insertLog(content, tooltip=null) {
    let div = document.createElement("div")
    div.className = "log-entry"
    if (content.includes("<")) {
        div.innerHTML = content
    } else {
        div.textContent = content
    }

    if (tooltip != null) {
        div.setAttribute("data-tooltip-title", tooltip[0])
        div.setAttribute("data-tooltip-text", tooltip[1])
    }

    document.getElementById("log").appendChild(div)

    while (document.getElementById("log").children.length > 200) {
        const removed = document.getElementById("log").firstChild
        // const height = removed.offsetHeight
        document.getElementById("log").removeChild(removed)
        // if (!logAutoScroll) {
        //     document.getElementById("log").scrollTop += height
        // }
    }

    if (logAutoScroll) {document.getElementById("log").scrollTop = document.getElementById("log").scrollHeight}
}

// function getFuture(time, day, increase) {
//     const totalMinutes = time + increase

//     const newTime = ((totalMinutes % 1440) + 1440) % 1440
//     const newDay = day + Math.floor(totalMinutes / 1440)

//     return [newTime, newDay]
// }

function playTransition() {
    let transition = document.getElementById("main-transition")
    transition.style.zIndex = 2
    transition.style.opacity = 0
    setTimeout(function() {
        transition.style.zIndex = 0
        transition.style.opacity = 1
    }, 300)
}

function randomRange(min, max, round=false) {
    if (round == false) {
        return Math.random() * (max - min) + min
    } else {
        return Math.round(Math.random() * (max - min) + min)
    }
}

function generateEnemy(enemyName) {
    combatData['enemy'] = enemyName
    const enemy = enemyData[enemyName]
    combatData['enemyProperties'] = enemy['properties']
    if (Array.isArray(enemy['health'])) {
        combatData['enemyMaxHealth'] = Math.round(randomRange(enemy['health'][0], enemy['health'][1]))
    } else {
        combatData['enemyMaxHealth'] = enemy['health']
    }
    combatData['enemyHealth'] = combatData['enemyMaxHealth']

    const statTypes = ["str", "def", "spd", "dex"]
    for (const stat of statTypes) {
        if (Array.isArray(enemy[stat])) {
            combatData['enemyStats'][stat] = Number(randomRange(enemy[stat][0], enemy[stat][1]).toFixed(2))
        } else {
            combatData['enemyStats'][stat] = enemy[stat]
        }
        document.getElementById(`enemy-stat-${stat}`).textContent = `${stat.charAt(0).toUpperCase()}${stat.slice(1)}: ${formatNumber(combatData['enemyStats'][stat])}`
    }

    document.getElementById("enemy-name").textContent = enemy['name']
    updateBar("enemyHealth")

    document.getElementById("attack-info-left").style.display = ""
    document.getElementById("attack-info-divider").style.display = ""
    document.getElementById("attack-info-right").style.display = ""
}

function endFight() {
    combatData['enemy'] = null
    combatData['enemyHealth'] = 0
    combatData['enemyMaxHealth'] = 0
    combatData['enemyProperties'] = []
    combatData['enemyStats'] = {
        "str": 0,
        "def": 0,
        "spd": 0,
        "dex": 0
    }

    document.getElementById("enemy-name").textContent = ""
    updateBar("enemyHealth")

    document.getElementById("attack-info-left").style.display = "none"
    document.getElementById("attack-info-divider").style.display = "none"
    document.getElementById("attack-info-right").style.display = "none"
}

function killEnemy() {
    insertLog(colorGen("#aaaaaa", `${enemyData[combatData['enemy']]['name']} died`))

    if (enemyData[combatData['enemy']]['loot'] != undefined) {
        for (const drop of enemyData[combatData['enemy']]['loot']) {
            changeInventory(drop['item'], getRandomLoot(drop['chances']))
        }
    }

    if (enemyData[combatData['enemy']]['xp'] != undefined) {
        let xpGain = Math.round(randomRange(enemyData[combatData['enemy']]['xp'][0], enemyData[combatData['enemy']]['xp'][1]))
        changeXp(xpGain)
    }

    if (combatData['enemy'] == "strawDummy" && checks['firstDummy'] != true) {
        playTransition()
        sceneManager("dojoQuestIntro")
    }

    changeQuestProgress("kills", combatData['enemy'], 1)
    stats['kills'][combatData['enemy']] = (stats['kills'][combatData['enemy']] ?? 0) + 1

    endFight()
}

function getBaseDamage(strength) {
    const x = Math.log10(strength)
    return 7 * x ** 2 + x * 2 + 5
}

function calcDamageMitigation(strength, defense) {
    const ratio = defense / strength

    if (ratio >= 14) {return 1}
    if (ratio >= 1 && ratio < 14) {return (50 + (50 / Math.log(14)) * Math.log(ratio)) / 100}
    if (ratio > 1 / 32 && ratio < 1) {return (50 + (50 / Math.log(32)) * Math.log(ratio)) / 100}

    return 0
}

function calcHitChance(speed, dexterity) {
    const ratio = speed / dexterity

    if (ratio > 64) {return 100}
    if (ratio >= 1 && ratio < 64) {return 100 - (50 / 7) * (8 * Math.sqrt(1 / ratio) - 1)}
    if (ratio > 1 / 64 && ratio < 1) {return (50 / 7) * (8 * Math.sqrt(ratio) - 1)}

    return 0
}

function changeSkill(skill, skillXp) {
    const scaling = skillData[skill]['scaling']
    const currentLevel = xpToLevel(skills[skill] || 0, false, scaling)

    if (skills[skill] == undefined) {
        skills[skill] = skillXp
        const skillbarParent = document.createElement("div")
        skillbarParent.className = "skillbar-parent"
        skillbarParent.id = `skill-${skill}`
        skillbarParent.setAttribute("data-tooltip-title", skillData[skill]['name'])
        skillbarParent.setAttribute("data-tooltip-text", skillData[skill]['desc'])

        const skillbarFill = document.createElement("div")
        skillbarFill.className = "skillbar-fill"
        skillbarFill.style.width = `${xpIntoLevel(skills[skill], scaling) / xpForLevel(xpToLevel(skills[skill], false, scaling), scaling) * 100}%`

        const skillbarText = document.createElement("div")
        skillbarText.className = "skillbar-text"
        skillbarText.textContent = `${skillData[skill]['name']} ${xpToLevel(skills[skill], false, scaling)}: ${Math.round(xpIntoLevel(skills[skill], scaling))}/${Math.round(xpForLevel(xpToLevel(skills[skill], false, scaling), scaling))}`

        skillbarParent.appendChild(skillbarFill)
        skillbarParent.appendChild(skillbarText)
        document.getElementById("skill-table").appendChild(skillbarParent)
    } else {
        skills[skill] += skillXp
        const skillbarFill = document.getElementById(`skill-${skill}`).getElementsByClassName("skillbar-fill")[0]
        skillbarFill.style.width = `${xpIntoLevel(skills[skill], scaling) / xpForLevel(xpToLevel(skills[skill], false, scaling), scaling) * 100}%`

        const skillbarText = document.getElementById(`skill-${skill}`).getElementsByClassName("skillbar-text")[0]
        skillbarText.textContent = `${skillData[skill]['name']} ${xpToLevel(skills[skill], false, scaling)}: ${Math.round(xpIntoLevel(skills[skill], scaling))}/${Math.round(xpForLevel(xpToLevel(skills[skill], false, scaling), scaling))}`
    }

    if (currentLevel < xpToLevel(skills[skill], false, scaling)) {
        insertLog(colorGen("#bbbb44", `${skillData[skill]['name']} increased to to ${xpToLevel(skills[skill], false, scaling)}`))
    }
}

function formatNumber(num) {
    if (!isFinite(num)) return "inf"

    const sign = num < 0 ? "-" : ""
    num = Math.abs(num)

    const units = ["", "k", "M", "B", "T", "Qa", "Qt", "Sx", "Sp", "Oc", "No"]
    const exp = Math.max(0, Math.floor(Math.log10(num) / 3))

    if (exp >= units.length) {
        return sign + num.toExponential(2).replace("+", "")
    }

    const value = num / 1000 ** exp
    const decimals = value < 10 ? 2 : value < 100 ? 1 : 0

    return sign + value.toFixed(decimals).replace(/\.0+$/, "") + units[exp]
}

function getMovementSpeed() {
    let inventoryMulti = 1
    if (inventoryWeight > 0) {
        inventoryMulti = Math.min(getMaxWeight() / inventoryWeight, 1)
    }
    return (50 + getSkillLevel("walking") * 3) * inventoryMulti * calcEnergyDebuff()
}

function getRandomLoot(weightedDict) {
    const totalWeight = Object.values(weightedDict).reduce((sum, weight) => sum + weight, 0)
    
    let randomNum = Math.random() * totalWeight
    
    for (let item in weightedDict) {
        randomNum -= weightedDict[item]
        
        if (randomNum <= 0) {
            return Number(item)
        }
    }
}

function changeInventory(item, amount, announceReduction=false) {
    if (inventory[item] == undefined) {
        if (amount <= 0) {return false}
        inventory[item] = amount
        const itemParent = document.createElement("div")
        itemParent.className = "item-parent"
        itemParent.id = `item-${item}`
        itemParent.setAttribute("data-tooltip-title", itemData[item]['name'])
        itemParent.setAttribute("data-tooltip-text", itemData[item]['desc'])

        const itemText = document.createElement("span")
        itemText.className = "item-text"
        itemText.textContent = itemData[item]['name']

        const itemQuantity = document.createElement("span")
        itemQuantity.className = "item-quantity"
        itemQuantity.textContent = `x${inventory[item]}`

        itemParent.appendChild(itemText)
        itemParent.appendChild(itemQuantity)
        document.getElementById("inventory-table").appendChild(itemParent)
    } else {
        if (inventory[item] + amount < 0) {return false}
        inventory[item] += amount

        if (inventory[item] == 0) {
            delete inventory[item]
            document.getElementById(`item-${item}`).remove()
        } else {
            document.getElementById(`item-${item}`).getElementsByClassName("item-quantity")[0].textContent = `x${inventory[item]}`
        }
    }
    if (amount > 0) {
        insertLog(`Obtained ${colorGen("#ccccff", `x${amount}`)} ${itemData[item]['name']}`, [itemData[item]['name'], itemData[item]['desc']])
    } else if (announceReduction == true) {
        insertLog(`Used ${colorGen("#ccccff", `x${-amount}`)} ${itemData[item]['name']}`, [itemData[item]['name'], itemData[item]['desc']])
    }
    if (itemData[item]['weight']) {
        const maxWeight = getMaxWeight()
        inventoryWeight += itemData[item]['weight'] * amount
        document.getElementById("inventory-weight").textContent = `${formatNumber(inventoryWeight)}g / ${formatNumber(maxWeight)}g`
        if (inventoryWeight > maxWeight * 4) {
            document.getElementById("inventory-weight").style.color = "#ff0000"
        } else if (inventoryWeight > maxWeight * 2) {
            document.getElementById("inventory-weight").style.color = "#ff8800"
        } else if (inventoryWeight > maxWeight) {
            document.getElementById("inventory-weight").style.color = "#ffff00"
        } else {
            document.getElementById("inventory-weight").style.color = ""
        }
    }
}

function changeStorage(item, amount) {
    if (storage[item] == undefined) {
        if (amount <= 0) {return false}
        storage[item] = amount
        const itemParent = document.createElement("div")
        itemParent.className = "item-parent"
        itemParent.id = `storage-item-${item}`
        itemParent.setAttribute("data-tooltip-title", itemData[item]['name'])
        itemParent.setAttribute("data-tooltip-text", itemData[item]['desc'])

        const itemText = document.createElement("span")
        itemText.className = "item-text"
        itemText.textContent = itemData[item]['name']

        const itemQuantity = document.createElement("span")
        itemQuantity.className = "item-quantity"
        itemQuantity.textContent = `x${storage[item]}`

        itemParent.appendChild(itemText)
        itemParent.appendChild(itemQuantity)
        document.getElementById("storage-table").appendChild(itemParent)
    } else {
        if (storage[item] + amount < 0) {return false}
        storage[item] += amount

        if (storage[item] == 0) {
            delete storage[item]
            document.getElementById(`storage-item-${item}`).remove()
        } else {
            document.getElementById(`storage-item-${item}`).getElementsByClassName("item-quantity")[0].textContent = `x${storage[item]}`
        }
    }
    if (amount > 0) {
        insertLog(`Deposited ${colorGen("#ccccff", `x${amount}`)} ${itemData[item]['name']}`, [itemData[item]['name'], itemData[item]['desc']])
    }
}

function changeXp(amount) {
    const currentLevel = xpToLevel(xp)
    xp += amount
    updateBar("xp")
    updateLevelText(xp)
    insertLog(colorGen("#6666ff", `+${amount} XP`))
    if (currentLevel < xpToLevel(xp)) {
        changeHp(calcMaxHp() - calcMaxHp(currentLevel))
        updateBar("health")
        insertLog(colorGen("#88ccff", `Levelled up to ${xpToLevel(xp)}`))
    }
}

function getSkillLevel(skill) {
    if (skills[skill] == undefined) {
        return 0
    } else {
        return xpToLevel(skills[skill], false, skillData[skill]['scaling'])
    }
}

function itemClickDetector(e, storage=false) {
    let item = null
    if (storage == false) {
        if (e.target.id.startsWith("item-")) {
            item = e.target.id.replace("item-", "")
        } else if (e.target.parentElement.id.startsWith("item-")) {
            item = e.target.parentElement.id.replace("item-", "")
        }
    } else if (storage == true) {
        if (e.target.id.startsWith("storage-item-")) {
            item = e.target.id.replace("storage-item-", "")
        } else if (e.target.parentElement.id.startsWith("storage-item-")) {
            item = e.target.parentElement.id.replace("storage-item-", "")
        }
    }

    if (item != null) {
        if (storage == false) {
            changeInventory(item, -1)
            changeStorage(item, 1)
        } else if (storage == true) {
            changeStorage(item, -1)
            changeInventory(item, 1)
        }
    }
}

function storageClickDetector(e) {
    itemClickDetector(e, true)
}

function toggleStorageAccess(value) {
    if (value == true) {
        storageAccess = true
        document.getElementById("storage-button").style.display = ""
        document.getElementById("inventory-table").addEventListener("click", itemClickDetector)
        document.getElementById("storage-table").addEventListener("click", storageClickDetector)
    } else {
        storageAccess = false
        document.getElementById("storage-button").style.display = "none"
        if (document.getElementById("sidebar-menu-storage").style.display != "none") {
            document.getElementById("sidebar-menu-storage").style.display = "none"
            document.getElementById("sidebar-menu-inventory").style.display = ""
            document.getElementById("inventory-button").style.borderColor = "#7777cc"
            document.getElementById("storage-button").style.borderColor = ""
        }
        document.getElementById("inventory-table").removeEventListener("click", itemClickDetector)
        document.getElementById("storage-table").removeEventListener("click", storageClickDetector)
    }
}

function getMaxWeight() {
    return 5000
}

function changeEnergy(amount) {
    let oldenergy = energy
    energy = Math.min(Math.max(energy + amount, 0), 100)
    if (amount < 0 && oldenergy > 35 && energy < 35) {
        insertLog(colorGen("#aaaaaa", "You start to feel tired"))
    }

    for (const [stat, value] of Object.entries(battleStats)) {
        const effectiveStat = value * calcEnergyDebuff()
        const debuffPercentage = effectiveStat / value * 100 - 100
        document.getElementById(`stat-${stat}`).textContent = `${stat.charAt(0).toUpperCase()}${stat.slice(1)}: ${formatNumber(value)}${Math.round(debuffPercentage) != 0 ? ` (${debuffPercentage.toFixed(0)}%)` : ""}`
    }
    document.getElementById(`stat-total`).textContent = `Ttl: ${formatNumber(getTotalBattlestats())}`

    updateBar("energy")
}

function changeTime(amount) {
    time += amount
    stats['gametime'] += amount
    if (currentScene != "sleep") {
        noSleepTime = Math.min(noSleepTime + amount, 1440)
    } else {
        stats['timeSlept'] += amount
    }
    // if (time >= 1440) {
    //     time -= 1440
    //     day += 1
    // }
}

function changeEffect(effect, enable=true, duration=0) {
    if (enable == true) {
        if (effects[effect] == undefined) {
            if (duration == 0) {
                effects[effect] = true
            } else {
                effects[effect] = duration + time
            }
            const div = document.createElement("div")
            div.className = "effect-icon"
            div.id = `effect-${effect}`
            div.style.backgroundColor = effectData[effect]['color']
            div.setAttribute("data-tooltip-title", effectData[effect]['name'])
            if (duration == 0) {
                div.setAttribute("data-tooltip-text", effectData[effect]['desc'])
            } else {
                div.setAttribute("data-tooltip-text", `${effectData[effect]['desc']}\nEnds: ${colorGen("#ccccff", formatTime(effects[effect], true))}`)
            }

            document.getElementById("effects-bar").appendChild(div)
        } else if (duration != 0) {
            effects[effect] += duration
            document.getElementById(`effect-${effect}`).setAttribute("data-tooltip-text", `${effectData[effect]['desc']}\nEnds: ${colorGen("#ccccff", formatTime(effects[effect], true))}`)
        }
    } else {
        if (effects[effect] != undefined) {
            delete effects[effect]
            if (document.getElementById(`effect-${effect}`)) {
                document.getElementById(`effect-${effect}`).remove()
            }
        }
    }
}

function calcEnergyDebuff() {
    if (energy >= 35) {
        return 1
    } else {
        return energy / 70 + 0.5
    }
}

function changeHp(amount) {
    health = Math.min(Math.max(health + amount, 0), calcMaxHp())

    if (health <= 0) {
        endFight()
        playTransition()
        sceneManager("sleep")
        insertLog(colorGen("#ff0000", "You died!"))
        health = 1
        insertLog(colorGen("#bb4444", `${(-energy / 2).toFixed(0)} Energy`))
        changeEnergy(-energy / 2)
    }

    updateBar("health")
}

function getQuestGoals(questName) {
    let output = {}
    for (const [type, values] of Object.entries(questData[questName]['goals'])) {
        for (const [stat, data] of Object.entries(values)) {
            if (output[type] == undefined) {
                output[type] = {}
            }
            if (data['lifetime'] == true) {
                let statValue
                if (type == "stats") {
                    statValue = battleStats[stat]
                }

                output[type][stat] = {
                    "amount": data['amount'],
                    "completion": statValue
                }
            } else if (data['lifetime'] == false) {
                let statValue
                if (!quests[questName]) {
                    statValue = 0
                } else {
                    statValue = quests[questName]['goals'][type][stat]['completion']
                }

                output[type][stat] = {
                    "amount": data['amount'],
                    "completion": statValue
                }
            }
        }
    }
    return output
}

function checkCompletion(questName) {
    if (quests[questName] == undefined) {
        return false
    }
    let goals = getQuestGoals(questName)
    for (const [type, values] of Object.entries(goals)) {
        for (const [stat, data] of Object.entries(values)) {
            if (data['amount'] > data['completion']) {
                return false
            }
        }
    }

    delete quests[questName]
    insertLog(`Completed Quest: ${colorGen("#ffff00", `"${questData[questName]['name']}"`)}`)
    if (questData[questName]['repeatable'] == false) {
        completedQuests.push(questName)
    }
    document.getElementById(`quest-${questName}`).remove()
}

function giveQuest(questName) {
    if (!quests[questName]) {
        nonLifetime = {}
        for (const [type, values] of Object.entries(questData[questName]['goals'])) {
            for (const [stat, data] of Object.entries(values)) {
                if (data['lifetime'] == false) {
                    if (nonLifetime[type] == undefined) {
                        nonLifetime[type] = {}
                    }
                    nonLifetime[type][stat] = {
                        "amount": data['amount'],
                        "completion": 0
                    }
                }
            }
        }
        quests[questName] = {
            "goals": nonLifetime
        }
        insertLog(`Received Quest: ${colorGen("#ffff00", `"${questData[questName]['name']}"`)}`)
        if (document.getElementById("quests-button").style.display == "none") {
            document.getElementById("quests-button").style.display = ""
        }
        const questParent = document.createElement("div")
        questParent.className = "quest-parent"
        questParent.id = `quest-${questName}`

        const questTitle = document.createElement("div")
        questTitle.className = "quest-title"
        questTitle.textContent = questData[questName]['name']

        const questDesc = document.createElement("div")
        questDesc.className = "quest-desc"
        questDesc.textContent = questData[questName]['desc']

        const questGoals = document.createElement("div")
        questGoals.className = "quest-goals"
        
        for (const [type, values] of Object.entries(getQuestGoals(questName))) {
            for (const [stat, data] of Object.entries(values)) {
                const goalParent = document.createElement("div")
                goalParent.className = "goal-parent"

                const goal = document.createElement("span")
                goal.className = "quest-goal"
                if (type == "kills") {
                    goal.textContent = `${enemyData[stat]['name']}: `
                } else if (type == "stats") {
                    goal.textContent = `${stat.replace("str", "Strength").replace("def", "Defense").replace("spd", "Speed").replace("dex", "Dexterity")}: ` // Kinda bad but it works for now
                } else {
                    goal.textContent = `${stat}: `
                }

                const goalProgress = document.createElement("span")
                goalProgress.className = "quest-goal-progress"
                goalProgress.style.color = data['completion'] < data['amount'] ? "#ff0000" : "#00ff00"
                goalProgress.id = `quest-${questName}-${stat}`
                goalProgress.textContent = `${formatNumber(data['completion'])}/${data['amount']}`
                
                questGoals.appendChild(goalParent)
                goalParent.appendChild(goal)
                goalParent.appendChild(goalProgress)
            }
        }
        
        questParent.appendChild(questTitle)
        questParent.appendChild(questDesc)
        questParent.appendChild(questGoals)
        document.getElementById("quests-table").appendChild(questParent)

        checkCompletion(questName)
    }
}

function changeQuestProgress(type, stat, value) {
    for (const quest in quests) {
        const questStatData = questData[quest]['goals']?.[type]?.[stat]
        if (questStatData) {
            let newValue
            if (questStatData['lifetime'] == true) {
                newValue = value
            } else {
                newValue = quests[quest]['goals'][type][stat]['completion'] + value
                quests[quest]['goals'][type][stat]['completion'] = newValue
            }
            const goalElem = document.getElementById(`quest-${quest}-${stat}`)
            goalElem.textContent = `${formatNumber(newValue)}/${questStatData['amount']}`
            if (newValue >= questStatData['amount']) {
                goalElem.style.color = "#00ff00"
                checkCompletion(quest)
            }
        }
    }
}

function changeBattlestat(stat, amount) {
    let multi = 1
    multi = multi * (1 + getSkillLevel("training") * 0.02)
    multi = multi * calcEnergyDebuff()
    if (effects['exercisePill']) {
        multi *= 1.5
    }
    battleStats[stat] += amount * multi
    updateBattlestats(stat)
    changeQuestProgress("stats", stat, battleStats[stat])
    updateLevelText()
}

function generateShop(shopName) {
    let shopItems = {}
    if (shopStorage[shopName] == null || shopStorage[shopName]['day'] < getDay(time)) {
        for (const item of shopData[shopName]) {
            if (Math.random() < item['chance'] / 100) {
                shopItems[item['name']] = {
                    "price": randomRange(item['price'][0], item['price'][1], true),
                    "quantity": randomRange(item['quantity'][0], item['quantity'][1], true)
                }
            }
        }
    } else {
        shopItems = shopStorage[shopName]['items']
    }
    shopStorage[shopName] = {
        "day": getDay(time),
        "items": shopItems
    }

    const shopHolder = document.createElement("div")
    shopHolder.className = "shop-holder"
    document.getElementById("main").appendChild(shopHolder)

    for (const [item, data] of Object.entries(shopItems)) {
        const itemParent = document.createElement("div")
        itemParent.className = "item-parent"
        itemParent.id = `shop-item-${item}`
        itemParent.setAttribute("data-tooltip-title", itemData[item]['name'])
        itemParent.setAttribute("data-tooltip-text", itemData[item]['desc'])

        const itemText = document.createElement("span")
        itemText.className = "item-text"
        itemText.textContent = itemData[item]['name']

        const itemQuantity = document.createElement("span")
        itemQuantity.className = "item-quantity"
        itemQuantity.textContent = `x${data['quantity']}`

        const itemPrice = document.createElement("span")
        itemPrice.className = "item-price"
        itemPrice.textContent = `$${data['price']}`

        itemParent.appendChild(itemText)
        itemParent.appendChild(itemQuantity)
        itemParent.appendChild(itemPrice)
        shopHolder.appendChild(itemParent)
    }

    shopHolder.addEventListener("click", function(e) {
        let item = null
        if (e.target.id.startsWith("shop-item-")) {
            item = e.target.id.replace("shop-item-", "")
        } else if (e.target.parentElement.id.startsWith("shop-item-")) {
            item = e.target.parentElement.id.replace("shop-item-", "")
        }

        if (item != null) {
            if (shopStorage[shopName]['items'][item]['quantity'] <= 0) {
                insertLog(colorGen("#aaaaaa", "Out of stock"))
            } else {
                if (money >= shopStorage[shopName]['items'][item]['price']) {
                    changeMoney(-shopStorage[shopName]['items'][item]['price'])
                    shopStorage[shopName]['items'][item]['quantity'] -= 1
                    document.getElementById(`shop-item-${item}`).getElementsByClassName("item-quantity")[0].textContent = `x${shopStorage[shopName]['items'][item]['quantity']}`
                    changeInventory(item, 1)
                } else {
                    insertLog(colorGen("#aaaaaa", "Not enough money"))
                }
            }
        }
    })
}

function generateCraftingMenu() {
    const craftingHolder = document.createElement("div")
    craftingHolder.className = "crafting-holder"
    document.getElementById("main").appendChild(craftingHolder)

    for (const item of knownRecipes) {
        const itemParent = document.createElement("div")
        itemParent.className = "crafting-item-parent"
        itemParent.id = `crafting-item-${item}`
        itemParent.setAttribute("data-tooltip-title", itemData[item]['name'])
        itemParent.setAttribute("data-tooltip-text", itemData[item]['desc'])

        const itemHolder = document.createElement("div")
        itemHolder.className = "crafting-item-holder"

        const itemText = document.createElement("span")
        itemText.className = "item-text"
        itemText.textContent = itemData[item]['name']

        const itemComplexity = document.createElement("span")
        itemComplexity.className = "item-complexity"
        itemComplexity.textContent = itemData[item]['crafting']['complexity']

        const requirementsHolder = document.createElement("div")
        requirementsHolder.className = "crafting-item-requirements"

        for (const [craftingItem, amount] of Object.entries(itemData[item]['crafting']['materials'])) {
            const materialElement = document.createElement("span")
            materialElement.textContent = `x${amount} ${itemData[craftingItem]['name']}`
            if (inventory[craftingItem] >= amount) {
                materialElement.style.color = "#aaffaa"
            }

            requirementsHolder.appendChild(materialElement)
        }

        itemHolder.appendChild(itemText)
        itemHolder.appendChild(itemComplexity)
        itemParent.appendChild(itemHolder)
        itemParent.appendChild(requirementsHolder)
        craftingHolder.appendChild(itemParent)
    }

    craftingHolder.addEventListener("click", function(e) {
        let item = e.target.closest("[id^=\"crafting-item-\"]").id.replace("crafting-item-", "")
        if (item != null) {
            for (const [craftingItem, amount] of Object.entries(itemData[item]['crafting']['materials'])) {
                if (inventory[craftingItem] < amount || inventory[craftingItem] == undefined) {
                    insertLog(colorGen("#aaaaaa", "Missing materials"))
                    return
                }
            }

            let arrival = Math.ceil(time + itemData[item]['crafting']['complexity'] / getCraftingSpeed())
            craftInfo['completed'] = 0
            craftInfo['goal'] = itemData[item]['crafting']['complexity']
            craftInfo['recipe'] = item
            processText(`You are crafting "${itemData[item]['name']}". You'll finish at ${colorGen("#CCCCFF", formatTime(arrival, true))}`)
            playTransition()
        }
    })
}

function changeMoney(amount) {
    money += amount
    if (amount > 0) {
        insertLog(`Obtained ${colorGen("#cccc55", `$${amount}`)}`)
    }
    document.getElementById("inventory-money").textContent = `$${money}`
}

function getCraftingSpeed() {
    return 1 + (0.05 * getSkillLevel("crafting"))
}

const sceneTicks = new Map([
    ["trainingGrounds_str", function() {
        changeBattlestat("str", gyms['none']['str'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_def", function() {
        changeBattlestat("def", gyms['none']['def'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_spd", function() {
        changeBattlestat("spd", gyms['none']['spd'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_dex", function() {
        changeBattlestat("dex", gyms['none']['dex'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
    ["dojo_trainingDummy", function() {
        if (combatData['enemy'] == null) {
            generateEnemy("strawDummy")
        }
    }],
    ["sleep", function() {
        changeEnergy(2.05)
        noSleepTime = Math.max(noSleepTime - 40, 0)
    }],
    ["hospital", function() {
        changeHp(2)
    }],
    ["alley", function() {
        if (!quests['dojoIntro3'] && !completedQuests.includes("dojoIntro3")) {
            return
        }
        if (combatData['enemy'] == null) {
            generateEnemy("mouse")
        }
    }],
    ["trainingGrounds_nextLevel_str", function() {
        changeBattlestat("str", gyms['nextLevel']['str'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_nextLevel_def", function() {
        changeBattlestat("def", gyms['nextLevel']['def'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_nextLevel_spd", function() {
        changeBattlestat("spd", gyms['nextLevel']['spd'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_nextLevel_dex", function() {
        changeBattlestat("dex", gyms['nextLevel']['dex'])
        changeSkill("training", 1)
        changeEnergy(-0.2)
    }],
])

const effectFunctions = new Map([
    ["sleepDeprived", function() {
        changeEnergy(-0.1)
    }]
])

function tick() {
    stats['playtime'] += 1
    changeTime(currentScene != "sleep" ? 1 : 10)

    if (travelInfo['destination'] != null) {
        // if ((travelInfo['arrival'][0] <= time && travelInfo['arrival'][1] <= day) || travelInfo['arrival'][1] < day) {
        //     sceneManager(travelInfo['destination'])
        //     playTransition()
        //     travelInfo['destination'] = null
        //     travelInfo['arrival'] = [0, 0]
        // }
        travelInfo['completed'] += getMovementSpeed()
        changeSkill("walking", 1)
        if (travelInfo['completed'] >= travelInfo['distance']) {
            sceneManager(travelInfo['destination'])
            playTransition()
            travelInfo['destination'] = null
            travelInfo['distance'] = 0
            travelInfo['completed'] = 0
        }
    }

    if (craftInfo['recipe'] != null) {
        craftInfo['completed'] += getCraftingSpeed()
        changeSkill("crafting", 1)
        if (craftInfo['completed'] >= craftInfo['goal']) {
            playTransition()
            for (const [craftingItem, amount] of Object.entries(itemData[craftInfo['recipe']]['crafting']['materials'])) {
                changeInventory(craftingItem, -amount)
            }
            changeInventory(craftInfo['recipe'], 1)
            craftInfo['recipe'] = null
            craftInfo['completed'] = 0
            craftInfo['goal'] = 0
            sceneManager("table")
        }
    }

    for (const [effect, value] of Object.entries(effects)) {
        if (Number.isInteger(value)) {
            if (value <= time) {
                changeEffect(effect, false)
            }
        }
    }

    // Combat
    if (combatData['enemy'] != null) {
        if (combatData['enemyHealth'] > 0) {
            const effectiveStats = {}
            for (const [stat, value] of Object.entries(battleStats)) {
                effectiveStats[stat] = value * calcEnergyDebuff()
            }
            const enemyStats = combatData['enemyStats']

            let turnDmg = getBaseDamage(effectiveStats['str']) * (Math.random() * 0.4 + 0.8)
            turnDmg = turnDmg * (1 + getSkillLevel("fighting") * 0.05)

            const turnDmgMitigation = calcDamageMitigation(effectiveStats['str'], enemyStats['def'])
            const turnHitChance = calcHitChance(effectiveStats['spd'], enemyStats['dex'])
            
            const turnActualDmg = Math.round(turnDmg * (1 - turnDmgMitigation))
            if (turnHitChance / 100 > Math.random()) {
                insertLog(`You -> ${colorGen("#ff3333", turnActualDmg)}`)
                combatData['enemyHealth'] -= turnActualDmg
            } else {
                insertLog(colorGen("#aaaaaa", "You missed"))
            }
            changeSkill("fighting", 1)

            if (combatData['enemyHealth'] <= 0) {
                killEnemy()
            } else {
                if (enemyStats['str'] > 0 && enemyStats['spd'] > 0) {
                    let turnDmg = getBaseDamage(enemyStats['str']) * (Math.random() * 0.4 + 0.8)

                    const turnDmgMitigation = calcDamageMitigation(enemyStats['str'], effectiveStats['def'])
                    const turnHitChance = calcHitChance(enemyStats['spd'], effectiveStats['dex'])
                    
                    const turnActualDmg = Math.round(turnDmg * (1 - turnDmgMitigation))

                    if (turnHitChance / 100 > Math.random()) {
                        insertLog(`${enemyData[combatData['enemy']]['name']} -> ${colorGen("#ff3333", turnActualDmg)}`)
                        changeHp(-turnActualDmg)
                    } else {
                        insertLog(colorGen("#aaaaaa", `${enemyData[combatData['enemy']]['name']} missed`))
                    }
                }

                updateBar("enemyHealth")
            }
        } else {
            killEnemy()
        }
    }

    changeEnergy(-0.05)

    if (noSleepTime >= 1200) {
        changeEffect("sleepDeprived")
    } else {
        changeEffect("sleepDeprived", false)
    }

    const handler = sceneTicks.get(currentScene)
    if (handler) {handler()}

    for (const effect in effects) {
        const handler = effectFunctions.get(effect)
        if (handler) {handler()}
    }

    // updateBar("health") No longer needed as changehp function updates it
    // updateBar("energy") No longer needed as changeenergy function updates it
    // updateBar("xp") No longer needed as changexp function updates it
    // updateStats() No longer needed as changestat function updates it

    document.getElementById("center-top").textContent = formatTime(time)
}

setInterval(tick, 1000)

for (const elem of document.getElementById("menu-buttons-holder").children) {
    elem.addEventListener("click", function() {
        for (const elem2 of document.getElementsByClassName("sidebar-menu")) {
            if (elem2.id.replace("sidebar-menu-", "") == elem.id.replace("-button", "")) {
                elem2.style.display = "block"
            } else {
                elem2.style.display = "none"
            }
        }
        for (const elem of document.getElementById("menu-buttons-holder").children) {
            elem.style.borderColor = ""
        }
        elem.style.borderColor = "#7777cc"
    })
}

let activeTarget = null

document.addEventListener("mouseover", function(e) {
    // if (tooltipTitle == undefined) {
    //     if (e.target.parentElement != undefined) {
    //         tooltipTitle = e.target.parentElement.getAttribute("data-tooltip-title")
    //         tooltipText = e.target.parentElement.getAttribute("data-tooltip-text")
    //     }
    //     if (tooltipTitle == undefined) {
    //         return
    //     }
    // }
    const elem = e.target.closest("[data-tooltip-title]")
    if (!elem) return
    const tooltipTitle = elem.getAttribute("data-tooltip-title")
    const tooltipText = elem.getAttribute("data-tooltip-text")
    activeTarget = elem
    document.getElementById("tooltip-title").textContent = tooltipTitle
    if (tooltipText != undefined && tooltipText.includes("<")) {
        document.getElementById("tooltip-text").innerHTML = tooltipText
    } else {
        document.getElementById("tooltip-text").textContent = tooltipText
    }
    const tooltip = document.getElementById("tooltip")
    const offset = 14

    const tooltipWidth = tooltip.offsetWidth
    const tooltipHeight = tooltip.offsetHeight

    let left = e.clientX + offset
    let top = e.clientY + offset

    if (left + tooltipWidth > window.innerWidth) {
        left = e.clientX - tooltipWidth - offset
    }

    if (top + tooltipHeight > window.innerHeight) {
        top = e.clientY - tooltipHeight - offset
    }

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
    tooltip.style.opacity = "1"
})

document.addEventListener("mouseout", function(e) {
    if (activeTarget != undefined) {
        activeTarget = null
        document.getElementById("tooltip").style.opacity = "0"
    }
})

document.addEventListener("mousemove", function (e) {
    if (!activeTarget) return

    const tooltip = document.getElementById("tooltip")
    const offset = 14

    const tooltipWidth = tooltip.offsetWidth
    const tooltipHeight = tooltip.offsetHeight

    let left = e.clientX + offset
    let top = e.clientY + offset

    if (left + tooltipWidth > window.innerWidth) {
        left = e.clientX - tooltipWidth - offset
    }

    if (top + tooltipHeight > window.innerHeight) {
        top = e.clientY - tooltipHeight - offset
    }

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
})

document.getElementById("inventory-table").addEventListener("click", function(e) {
    let item = e.target.closest("[id^=\"item-\"]").id.replace("item-", "")
    if (item != null) {
        if (itemData[item]['execute']) {
            itemData[item]['execute']()
            changeInventory(item, -1, true)
        }
    }
})

function getTotalBattlestats() {
    return battleStats['str'] + battleStats['def'] + battleStats['spd'] + battleStats['dex']
}

class scenes {
    static intro1() {
        return `"Hello?"\n\n{Next|intro2}`
    }

    static intro2() {
        return `"You all right?"\n\n{Get up|intro3}`
    }

    static intro3() {
        return `"Oh good, you're awake... You might feel a bit disorientated. That's expected."\n\n{Next|intro4}`
    }

    static intro4() {
        return `"There has been an incident occurring recently which caused humans from other dimensions to warp here. We haven't identified the cause yet and I'm afraid you're stuck here for now."\n\n{Next|intro5}`
    }

    static intro5() {
        return `"Not to worry as the leader of our town offers housing to all affected by this incident."\n\n{Next|intro6}`
    }

    static intro6() {
        return `"I have others to check on. Someone else will take you from here."\n\nThey gesture toward a man of average height in a gray coat.\n\n{Approach the man|intro7}`
    }

    static intro7() {
        return `You approach the man.\n\nHe gives a brief nod.\n\n"Name's Alan. I'll show you where you're staying."\n\n{Follow him|intro8}`
    }

    static intro8() {
        return `You follow Alan until he reaches a small wooden house. He gestures for you to head inside.\n\n{Enter|intro9}`
    }

    static intro9() {
        title = "Newcomer"
        document.getElementById("title").textContent = title
        insertLog(`Title Changed: ${colorGen("#dd8833", `"${title}"`)}`)
        return `The house is small.\n\nThin walls. Wooden floor. One bed. One table.\n\n"It's yours. Nothing much but it's better than nothing."\n\n{Next|intro10}`
    }

    static intro10() {
        return `"You can walk around town if you want. Just don't go past the outer fence. It's not safe."\n\nHe leaves without waiting.\n\n{Next|home}`
    }

    static home() {
        return `You are in your home. You can rest here.\n\n{Sleep|sleep}\n{Storage|storage}\n{Table|table}\n\n{Leave|housingArea}`
    }

    static sleep() {
        return `You are currently sleeping. Time passes faster...\n\n{Get up|home}`
    }

    static storage() {
        toggleStorageAccess(true)
        return `You can access your storage from the sidebar. Click an item in your inventory to deposit it and click an item in your storage to withdraw it.\n\n{Leave|home|0|leaveStorage}`
    }

    static table() {
        return `You are able to craft items here.\n\n{Leave|home}`
    }

    static housingArea() {
        return `You are in the housing area of the town. You can access your home or other areas from here.\n\n{Home|home}\n\n{Town Center|townCenter|250}`
    }

    static townCenter() {
        return `You are at the center of the town. Many people rush by hastily.\n\n{Notice Board|noticeBoard}\n{Training Grounds|trainingGrounds}\n{Dojo|dojo}\n\n{Hospital|hospital}\n{Merchant|merchant}\n\n{Alley|alley}\n\n{Housing Area|housingArea|250}`
    }

    static noticeBoard() {
        return `There is nothing of interest to you here.\n\n{Return|townCenter}`
    }

    static trainingGrounds() {
        if (!checks['trainingGroundsTeamIntro'] && getTotalBattlestats() >= 10) {
            checks['trainingGroundsTeamIntro'] = true
            return `"Hi! we're an up-and-coming fighting team for matches in The Arena. If you're willing to represent our team, we'll give you various supplies and equipment to help you improve your stats quickly. Sounds good?"\n\n{Yes|trainingGroundsTeamIntro1}\n\n{Maybe Later|trainingGrounds}`
        }

        let r = `You are in the training grounds. You are able to improve your strength, defense, speed or dexterity here.\n\n{Training Instructor|trainingGroundsInstructor}`
        if (checks['trainingGroundsTeamIntro'] && team != "nextLevel") {
            r += `\n\n{Join Team|trainingGroundsTeamIntro1}`
        }
        
        if (team == "nextLevel") {
            r += `\n\n{Team Tent|trainingGrounds_nextLevel}`
        } else {
            r += `\n\n{Train Strength|trainingGrounds_str}\n{Train Defense|trainingGrounds_def}\n{Train Speed|trainingGrounds_spd}\n{Train Dexterity|trainingGrounds_dex}`
        }
        r += `\n\n{Leave|townCenter}`
        return r
    }

    static trainingGroundsInstructor() {
        return `{Ask about stats|trainingGroundsInstructorAskStats}\n\n{Return|trainingGrounds}`
    }

    static trainingGroundsInstructorAskStats() {
        return `"Everyone has four main stats. Strength increases the damage you deal, Defense reduces the damage you take, Speed increases your chances of hitting and Dexterity increases the chance of dodging attacks."\n\n{Return|trainingGroundsInstructor}`
    }

    static trainingGrounds_str() {
        return `You are doing push-ups in the training grounds.\n\n{Stop|trainingGrounds}`
    }

    static trainingGrounds_def() {
        return `You are practicing bracing in the training grounds.\n\n{Stop|trainingGrounds}`
    }

    static trainingGrounds_spd() {
        return `You are practicing speed punching in the training grounds.\n\n{Stop|trainingGrounds}`
    }

    static trainingGrounds_dex() {
        return `You are balancing on a beam in the training grounds.\n\n{Stop|trainingGrounds}`
    }

    static trainingGroundsTeamIntro1() {
        return `"Awesome! I'll tell you everything you need to know. Follow me"\n\n{Continue|trainingGroundsTeamIntro2}`
    }

    static trainingGroundsTeamIntro2() {
        return `You follow the young man in to a large tent on the field\n\n"This is the tent with all our special training equipment and staff. Training here would be 2x as effective than the public equipment."\n\n{Continue|trainingGroundsTeamIntro3}`
    }

    static trainingGroundsTeamIntro3() {
        return `"We give rewards like exercise pills depending on how well you place in the weekly arena matches. On top of that, you also gain money from the competition organisers themselves."\n\n{Continue|trainingGroundsTeamIntro4}`
    }

    static trainingGroundsTeamIntro4() {
        changeInventory("exercisePill", 4)
        team = "nextLevel"
        return `"Arena matches always run on a Sunday, I suggest beginning your training now. Here are 4 exercise pills as a thanks for joining us."\n\n{Continue|trainingGrounds_nextLevel}`
    }

    static trainingGrounds_nextLevel() {
        return `You are inside your team's tent.\n\n{Train Strength|trainingGrounds_nextLevel_str}\n{Train Defense|trainingGrounds_nextLevel_def}\n{Train Speed|trainingGrounds_nextLevel_spd}\n{Train Dexterity|trainingGrounds_nextLevel_dex}\n\n{Leave|trainingGrounds}`
    }

    static trainingGrounds_nextLevel_str() {
        return `You are lifting weights in your team's tent.\n\n{Stop|trainingGrounds_nextLevel}`
    }

    static trainingGrounds_nextLevel_def() {
        return `You are practicing sparring against a team member.\n\n{Stop|trainingGrounds_nextLevel}`
    }

    static trainingGrounds_nextLevel_spd() {
        return `You are practicing spot jogging in your team's tent.\n\n{Stop|trainingGrounds_nextLevel}`
    }

    static trainingGrounds_nextLevel_dex() {
        return `You are practicing dodging punches from a team member.\n\n{Stop|trainingGrounds_nextLevel}`
    }

    static dojo() {
        if (checks['dojo'] == undefined) {
            checks['dojo'] = true
            return `As you walk into the dojo, an old man greets you.\n\n"Welcome to the dojo. This is the main place in town where fighters of all classes come to train their fighting skills."\n\n{Next|dojo}`
        } else {
            // if (completedQuests.includes("dojoIntro1") && !checks['dojoIntro1Talked']) {r += `{Dojo Instructor|dojoInstructor}\n`}
            return `You are in the dojo.\n\n{Dojo Instructor|dojoInstructor}\n{Practice fighting a training dummy|dojo_trainingDummy}\n\n{Leave|townCenter}`
        }
    }

    static dojo_trainingDummy() {
        generateEnemy("strawDummy")
        return `You are practicing fighting against training dummies.\n\n{Stop|dojo|0|endFight}`
    }

    static dojoQuestIntro() {
        checks['firstDummy'] = true
        return `As you defeat your first training dummy, the instructor walks towards you.\n\n"You're not from around here are you? You seem like you're from another world but I can see potential."\n\n{Next|dojoQuestIntro2}`
    }

    static dojoQuestIntro2() {
        giveQuest("dojoIntro1")
        if (battleStats['str'] < 1.5) {
            return `"I'm willing to guide you in order to become stronger. But first, you need to reach the goal of 1.5 strength and destroy 5 straw dummies. Come talk to me again once you're done."\n\n{Return|dojo}`
        } else {
            return `"I'm willing to guide you in order to become stronger. But first, you need to destroy 5 straw dummies. Come talk to me again once you're done."\n\n{Return|dojo}`
        }
    }

    static dojoInstructor() {
        return `"Need something?"\n\n{Quest Completion|dojoInstructorQuest}\n\n{Return|dojo}`
    }

    static dojoInstructorQuest() {
        if (completedQuests.includes("dojoIntro1") && !checks['dojoIntro1Talked']) {
            checks['dojoIntro1Talked'] = true
            giveQuest("dojoIntro2")
            changeInventory("exercisePill", 1)
            return `"Good job, you've proven that you're able to do some basic fighting. Unlike real enemies, these dummies don't fight back or move. For your next task: get all your battle stats to 1.5. Then I can give you some real enemies to fight."\n\n{Return|dojo}`
        } else if (completedQuests.includes("dojoIntro2") && !checks['dojoIntro2Talked']) {
            checks['dojoIntro2Talked'] = true
            giveQuest("dojoIntro3")
            changeInventory("exercisePill", 1)
            return `"You now have some decent stats, still below the average human in this world but you should now be able do my next quest without issue. Your goal is to defeat 10 mice in the alleys. Visit the hospital if your health drops too low. If you struggle to defeat the mice, I suggest training a bit more."\n\n{Return|dojo}`
        } else if (completedQuests.includes("dojoIntro3")) {
            return `"Congratulations on completing all my quests. This is the end of my questline for now, you can still continue training and levelling up your skills. Good luck."\n\n{Return|dojo}`
        }
        return `"You don't seem to have completed any new quests."\n\n{Return|dojo}`
    }

    static hospital() {
        if (health < calcMaxHp()) {
            return `You are getting healed by a doctor...\n\n{Leave|townCenter}`
        } else {
            return `You are already at maximum health.\n\n{Leave|townCenter}`
        }
    }

    static alley() {
        if (!quests['dojoIntro3'] && !completedQuests.includes("dojoIntro3")) {
            return `"Sorry, no civilians allowed here. We have an infestation problem."\n\n{Leave|townCenter}`
        } else {
            generateEnemy("mouse")
            return `You are in the alley. There are mice and rats everywhere.\n\n{Leave|townCenter|0|endFight}`
        }
    }

    static merchant() {
        return `"Welcome! I'm the main supplier of various goods in this town. I can also buy any straw baskets that you may have. Feel free to look around."\n\n{Sell|merchantSell}\n\n{Leave|townCenter}`
    }

    static merchantSell() {
        if (inventory['strawBasket'] == undefined) {
            return `"It appears that you don't have any straw baskets to sell. Come back when you get some, I pay $5 for each."\n\n{Return|merchant}`
        } else {
            return `"Would you like to sell all your straw baskets for a total of ${colorGen("#cccc55", `$${inventory['strawBasket'] * 5}`)}?"\n\n{Yes|merchant|0|merchantSell}\n\n{Return|merchant}`
        }
    }
}

class sceneFunctions {
    static endFight() {
        endFight()
    }

    static leaveStorage() {
        toggleStorageAccess(false)
    }

    static merchantSell() {
        changeMoney(inventory['strawBasket'] * 5)
        changeInventory("strawBasket", -inventory['strawBasket'])
    }
}

class sceneEndFunctions {
    static merchant() {
        generateShop("merchant")
    }

    static table() {
        generateCraftingMenu()
    }
}

function processText(text) {
    while (document.getElementById("main").lastChild) {
        document.getElementById("main").removeChild(document.getElementById("main").lastChild)
    }
    const splitText = text.split(textSplitter)
    const splitLinks = [...text.matchAll(linkRegex)]
    
    splitText.forEach(function(item, num) {
        let div = document.createElement("div")
        div.className = "main-text"
        div.style.color = "white"
        
        let parts = item.split(imageRegex)
        parts.forEach(function(part, index) {
            if (index % 2 == 0) {
                let span = document.createElement("span")
                span.innerHTML = part
                div.appendChild(span)
            } else {
                let img = document.createElement("img")
                img.src = "img/" + part
                img.style.display = "inline-block"
                img.style.width = "1.5em"
                img.style.height = "1.5em"
                img.style.verticalAlign = "middle"
                div.appendChild(img)
            }
        })
        
        document.getElementById("main").appendChild(div)
        
        if (num < splitLinks.length) {
            let button = document.createElement("button")
            button.innerHTML = splitLinks[num][1]
            button.className = "main-link"
            button.id = "button" + num
            button.addEventListener("click", function() {
                if (splitLinks[num][3] == undefined || splitLinks[num][3] == 0) {
                    if (splitLinks[num][4] != undefined) {
                        sceneFunctions[splitLinks[num][4]]()
                    }
                    sceneManager(splitLinks[num][2])
                } else {
                    let arrival = Math.ceil(time + Number(splitLinks[num][3]) / getMovementSpeed())
                    processText(`You are walking towards the ${splitLinks[num][1]}. You'll arrive at ${colorGen("#CCCCFF", formatTime(arrival, true))}`)
                    travelInfo['destination'] = splitLinks[num][2]
                    travelInfo['distance'] = Number(splitLinks[num][3])
                }
                playTransition()
            })
            document.getElementById("main").appendChild(button)
        }
    })
}

function sceneManager(selected) {
    var selectedScene = scenes[selected]()
    processText(selectedScene)
    if (sceneEndFunctions[selected]) {sceneEndFunctions[selected]()}
    oldScene = currentScene
    currentScene = selected
}

sceneManager("intro1")
updateBar("health")
updateBar("xp")
updateBattlestats()