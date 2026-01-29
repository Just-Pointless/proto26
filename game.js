const VERSION = "0.1.1"

document.getElementById("game-title").textContent = `Proto26 v${VERSION}`

var money = 0
var time = 420
var day = 0
var oldScene = ""
var currentScene = ""
var health = 10
var maxHealth = 10
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
        "properties": ["noAttack"],
        "loot": [
            {"item": "straw", "chances": {
                0: 60,
                1: 35,
                2: 5
            }}
        ],
        "xp": [3, 5]
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
    }
}
const itemData = {
    "straw": {
        "name": "Strand of Straw",
        "desc": "A strand of straw that came from a training dummy",
        "weight": 0.5
    }
}

function formatTime(time, day, timeOnly=false) {
    const baseDate = new Date(1900, 0, 1)

    baseDate.setDate(baseDate.getDate() + day)

    const hours = Math.floor(time / 60)
    const minutes = time % 60

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const dayName = dayNames[baseDate.getDay()]

    const year = baseDate.getFullYear()
    const month = String(baseDate.getMonth() + 1).padStart(2, "0")
    const date = String(baseDate.getDate()).padStart(2, "0")

    const timeString = `${hours}:${String(minutes).padStart(2, "0")}`
    if (timeOnly) {
        return timeString
    }
    return `${dayName} ${year}/${month}/${date} ${timeString}`
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

function updateLevelText(xp) {
    document.getElementById("level").textContent = `Level ${xpToLevel(xp)} G-`
}

function updateBar(bar) {
    if (bar == "health") {
        document.getElementById("healthbar-text").textContent = `HP: ${health}/${maxHealth}`
        document.getElementById("healthbar-fill").style.width = `${health / maxHealth * 100}%`
    } else if (bar == "xp") {
        document.getElementById("xp-bar-text").textContent = `XP: ${Math.round(xpIntoLevel(xp))}/${Math.round(xpForLevel(xpToLevel(xp)))}`
        document.getElementById("xp-bar-fill").style.width = `${xpIntoLevel(xp) / xpForLevel(xpToLevel(xp)) * 100}%`
        updateLevelText(xp)
    } else if (bar == "enemyHealth") {
        document.getElementById("enemy-healthbar-text").textContent = `HP: ${combatData['enemyHealth']}/${combatData['enemyMaxHealth']}`
        document.getElementById("enemy-healthbar-fill").style.width = `${combatData['enemyHealth'] / combatData['enemyMaxHealth'] * 100}%`
    }
}

function updateStats() {
    document.getElementById("stat-str").textContent = `Str: ${battleStats['str'].toFixed(2)}`
    document.getElementById("stat-def").textContent = `Def: ${battleStats['def'].toFixed(2)}`
    document.getElementById("stat-spd").textContent = `Spd: ${battleStats['spd'].toFixed(2)}`
    document.getElementById("stat-dex").textContent = `Dex: ${battleStats['dex'].toFixed(2)}`
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

function getFuture(time, day, increase) {
    const totalMinutes = time + increase

    const newTime = ((totalMinutes % 1440) + 1440) % 1440
    const newDay = day + Math.floor(totalMinutes / 1440)

    return [newTime, newDay]
}

function playTransition() {
    let transition = document.getElementById("main-transition")
    transition.style.zIndex = 2
    transition.style.opacity = 0
    setTimeout(function() {
        transition.style.zIndex = 0
        transition.style.opacity = 1
    }, 300)
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min
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
        document.getElementById(`enemy-stat-${stat}`).textContent = `${stat.charAt(0).toUpperCase()}${stat.slice(1)}: ${combatData['enemyStats'][stat].toFixed(2)}`
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
        increaseXp(xpGain)
    }

    endFight()
}

function getBaseDamage(strength) {
    const x = Math.log10(strength)
    return 7 * x ** 2 + x * 2 + 5
}

function damageMitigation(strength, defense) {
    const ratio = defense / strength

    if (ratio >= 14) {return 1}
    if (ratio >= 1 && ratio < 14) {return (50 + (50 / Math.log(14)) * Math.log(ratio)) / 100}
    if (ratio > 1 / 32 && ratio < 1) {return (50 + (50 / Math.log(32)) * Math.log(ratio)) / 100}

    return 0
}

function hitChance(speed, dex) {
    const ratio = speed / dex

    if (ratio > 64) {return 100}
    if (ratio >= 1 && ratio < 64) {return 100 - (50 / 7) * (8 * Math.sqrt(1 / ratio) - 1)}
    if (ratio > 1 / 64 && ratio < 1) {return (50 / 7) * (8 * Math.sqrt(ratio) - 1)}

    return 0
}

function increaseSkill(skill, skillXp) {
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
    if (num < 1000) {return num.toFixed(2)}

    const units = ["k", "M", "B", "T", "Qa", "Qt", "Sx", "Sp", "Oc", "No"]
    const exp = Math.floor(Math.log10(num) / 3)
    if (exp > units.length) {
        return num.toExponential(2).replace("+", "")
    }
    const value = num / 1000 ** exp

    const decimals = value < 10 ? 2 : value < 100 ? 1 : 0

    return value.toFixed(decimals).replace(/\.0+$/, "") + units[exp - 1]
}

function getMovementSpeed() {
    return 50 + getSkillLevel("walking") * 3
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

function changeInventory(item, amount) {
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
    }
}

function increaseXp(amount) {
    const currentLevel = xpToLevel(xp)
    xp += amount
    updateBar("xp")
    updateLevelText()
    insertLog(colorGen("#6666ff", `+${amount} XP`))
    if (currentLevel < xpToLevel(xp)) {
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

const sceneTicks = new Map([
    ['trainingGrounds_str', function() {
        battleStats['str'] += 0.01 * (1 + getSkillLevel("training") * 0.02)
        increaseSkill("training", 1)
    }],
    ['trainingGrounds_def', function() {
        battleStats['def'] += 0.01 * (1 + getSkillLevel("training") * 0.02)
        increaseSkill("training", 1)
    }],
    ['trainingGrounds_spd', function() {
        battleStats['spd'] += 0.01 * (1 + getSkillLevel("training") * 0.02)
        increaseSkill("training", 1)
    }],
    ['trainingGrounds_dex', function() {
        battleStats['dex'] += 0.01 * (1 + getSkillLevel("training") * 0.02)
        increaseSkill("training", 1)
    }],
    ['dojo_trainingDummy', function() {
        if (combatData['enemy'] == null) {
            generateEnemy("strawDummy")
        }
    }]
])

setInterval(function() {
    time += currentScene != "sleep" ? 1 : 10
    if (time >= 1440) {
        time -= 1440
        day += 1
    }

    if (travelInfo['destination'] != null) {
        // if ((travelInfo['arrival'][0] <= time && travelInfo['arrival'][1] <= day) || travelInfo['arrival'][1] < day) {
        //     sceneManager(travelInfo['destination'])
        //     playTransition()
        //     travelInfo['destination'] = null
        //     travelInfo['arrival'] = [0, 0]
        // }
        travelInfo['completed'] += getMovementSpeed()
        increaseSkill("walking", 1)
        if (travelInfo['completed'] >= travelInfo['distance']) {
            sceneManager(travelInfo['destination'])
            playTransition()
            travelInfo['destination'] = null
            travelInfo['distance'] = 0
            travelInfo['completed'] = 0
        }
    }

    // Combat
    if (combatData['enemy'] != null) {
        if (combatData['enemyHealth'] > 0) {
            let turnDmg = getBaseDamage(battleStats['str']) * (Math.random() * 0.4 + 0.8)
            const turnDmgMitigation = damageMitigation(battleStats['str'], combatData['enemyStats']['def'])
            const turnHitChance = hitChance(battleStats['spd'], combatData['enemyStats']['dex'])

            const turnActualDmg = Math.round(turnDmg * (1 - turnDmgMitigation))

            insertLog(`You -> ${colorGen("#ff3333", turnActualDmg)}`)
            combatData['enemyHealth'] -= turnActualDmg
            increaseSkill("fighting", 1)

            updateBar("enemyHealth")
            if (combatData['enemyHealth'] <= 0) {
                killEnemy()
            }
        } else {
            killEnemy()
        }
    }

    const handler = sceneTicks.get(currentScene)
    if (handler) {handler()}
    updateBar("health")
    updateBar("xp")
    updateStats()

    document.getElementById("center-top").textContent = formatTime(time, day)
}, 1000)

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
    let tooltipTitle = e.target.getAttribute("data-tooltip-title")
    let tooltipText = e.target.getAttribute("data-tooltip-text")
    if (tooltipTitle == undefined) {
        if (e.target.parentElement != undefined) {
            tooltipTitle = e.target.parentElement.getAttribute("data-tooltip-title")
            tooltipText = e.target.parentElement.getAttribute("data-tooltip-text")
        }
        if (tooltipTitle == undefined) {
            return
        }
    }
    activeTarget = e.target
    document.getElementById("tooltip-title").textContent = tooltipTitle
    document.getElementById("tooltip-text").textContent = tooltipText
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
        return `You are in your home. You can rest here.\n\n{Sleep|sleep}\n\n{Leave|housingArea}`
    }

    static sleep() {
        return `You are currently sleeping. Time passes faster...\n\n{Get up|home}`
    }

    static housingArea() {
        return `You are in the housing area of the town. You can access your home or other areas from here.\n\n{Home|home}\n\n{Town Center|townCenter|250}`
    }

    static townCenter() {
        return `You are at the center of the town. Many people rush by hastily.\n\n{Notice Board|noticeBoard}\n{Training Grounds|trainingGrounds}\n{Dojo|dojo}\n\n{Housing Area|housingArea|250}`
    }

    static noticeBoard() {
        return `There is nothing of interest to you here.\n\n{Return|townCenter}`
    }

    static trainingGrounds() {
        return `You are in the training grounds. You are able to improve your strength, defense, speed or dexterity here.\n\n{Training Instructor|trainingGroundsInstructor}\n\n{Train Strength|trainingGrounds_str}\n{Train Defense|trainingGrounds_def}\n{Train Speed|trainingGrounds_spd}\n{Train Dexterity|trainingGrounds_dex}\n\n{Leave|townCenter}`
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

    static dojo() {
        if (checks['dojo'] == undefined) {
            checks['dojo'] = true
            return `As you walk into the dojo, a man greets you.\n\n"Welcome to the dojo. This is the main place in town where fighters of all classes come to train their fighting skills."\n\n{Next|dojo}`
        } else {
            return `You are in the dojo.\n\n{Practice fighting a training dummy|dojo_trainingDummy}\n\n{Leave|townCenter}`
        }
    }

    static dojo_trainingDummy() {
        if (combatData['enemyHealth'] <= 0) {
            generateEnemy("strawDummy")
        }
        return `You are practicing fighting against training dummies.\n\n{Stop|dojo|0|endFight}`
    }
}

class sceneFunctions {
    static endFight() {
        endFight()
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
                    let arrival = getFuture(time, day, Number(splitLinks[num][3]) / getMovementSpeed())
                    processText(`You are walking towards the ${splitLinks[num][1]}. You'll arrive at ${colorGen("#CCCCFF", formatTime(arrival[0], arrival[1], true))}`)
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
    oldScene = currentScene
    currentScene = selected
}

sceneManager("intro1")
updateBar("health")
updateBar("xp")
updateStats()