const VERSION = "0.14"

document.getElementById("game-title").textContent = `Proto26 v${VERSION}`

var money = 0
var time = 420
var oldScene = ""
var currentScene = ""
var sceneText = ""
var prependText = ""
var health = 10
var xp = 0
var playerTitle = "Unknown"
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
var inventoryNonStackable = {}
var inventoryNonStackableIncrement = 0
var storage = {}
var storageNonStackable = {}
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
var knownRecipes = ["strawBasket", "woodenSpear"]
var craftInfo = {
    "recipe": null,
    "goal": 0,
    "completed": 0,
    "required": {},
    "using": [],
    "selected": null
}
var team = "none"
var equipment = {
    "weapon": null,
    "shield": null,
    "head": null,
    "chest": null,
    "arms": null,
    "legs": null,
    "accessory1": null,
    "accessory2": null
}
var exploreData = {
    "area": null,
    "goal": 0,
    "completed": 0
}
var saveEnabled = true
var craftingSelection = false
var titleScores = {}
var arenaData = {}

const linkRegex = new RegExp(/\{([^|{}]+)\|([^|{}]+)\|?([^|{}]+)?\|?([^|{}(]+)?\(?([^(){}|]+)?\)?}/g)
const textSplitter = new RegExp(/{[^}]{1,}}/g)
const imageRegex = new RegExp(/!\[(.*?)\]/g)
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
        "xp": [3, 5]
    },
    "strawGolem": {
        "name": "Straw Golem",
        "health": 150,
        "str": 1,
        "def": 2,
        "spd": 1,
        "dex": 0.5,
        "loot": [
            {"item": "straw", "chances": {
                1: 25,
                2: 25,
                3: 25,
                4: 25,
            }}
        ],
        "xp": 20
    },
    "woodGolem": {
        "name": "Wood Golem",
        "health": 400,
        "str": 10,
        "def": 10,
        "spd": 5,
        "dex": 2,
        "xp": 60
    },
    "human": {
        "name": "Human"
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
    },
    "exploration": {
        "name": "Exploration",
        "desc": "Increases speed of exploring",
        "scaling": 1.3
    },
    "unarmedMastery": {
        "name": "Unarmed Mastery",
        "shortName": "Unarmed M",
        "desc": "Increases damage dealt when unarmed",
        "scaling": 1.3,
    },
    "clubMastery": {
        "name": "Club Mastery",
        "shortName": "Club M",
        "desc": "Increases damage dealt with clubbing weapons",
        "scaling": 1.3,
    },
    "spearMastery": {
        "name": "Spear Mastery",
        "shortName": "Spear M",
        "desc": "Increases damage dealt with spear weapons",
        "scaling": 1.3,
    },
    "knifeMastery": {
        "name": "Knife Mastery",
        "shortName": "Knife M",
        "desc": "Increases damage dealt with knife weapons",
        "scaling": 1.3,
    }
}
const itemData = {
    "straw": {
        "name": "Strand of Straw",
        "desc": "A strand of straw that came from a training dummy",
        "class": "misc",
        "weight": 0.5
    },
    "exercisePill": {
        "name": "Exercise Pill",
        "desc": "Increases stat gain from training by 50% for one hour",
        "class": "consumable",
        "weight": 1,
        "execute": function() {
            changeEffect("exercisePill", true, 60)
        }
    },
    "strawBasket": {
        "name": "Straw Basket",
        "desc": "A small basket made of straw",
        "class": "misc",
        "weight": 10,
        "crafting": {
            "complexity": 60,
            "materials": {
                "straw": 20
            }
        }
    },
    "woodenStick": {
        "name": "Wooden Stick",
        "desc": "A blunt wooden stick. Barely better than your fists",
        "class": "gear",
        "subclass": "club",
        "weight": 120,
        "durability": [80, 120],
        "stackable": false,
        "combat": {
            "class": "weapon",
            "damage": [1.2, 1.4]
        }
    },
    "grass": {
        "name": "Blade of Grass",
        "desc": "Can be used to make healing potions",
        "class": "misc",
        "weight": 0.2
    },
    "woodenSpear": {
        "name": "Wooden Spear",
        "desc": "A pointy wooden stick, more durable and does more damage",
        "class": "gear",
        "subclass": "spear",
        "weight": 100,
        "durability": [200, 300],
        "stackable": false,
        "combat": {
            "class": "weapon",
            "damage": [1.4, 1.5]
        },
        "crafting": {
            "complexity": 30,
            "materials": {
                "woodenStick": 1,
                "knife": 0
            }
        }
    },
    "knife": {
        "name": "Knife",
        "desc": "A basic knife made out of stone",
        "class": "gear",
        "subclass": "knife",
        "weight": 300,
        "durability": [800, 1200],
        "stackable": false,
        "combat": {
            "class": "weapon",
            "damage": [1.5, 1.7]
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
    },
    "dojoIntro4": {
        "name": "Dojo Introduction 4",
        "desc": "You have been tasked by the instructor to defeat the golem in the dojo yard",
        "repeatable": false,
        "goals": {
            "kills": {
                "strawGolem": {
                    "amount": 1,
                    "lifetime": false
                }
            },
        }
    },
    "dojoIntro5": {
        "name": "Dojo Introduction 5",
        "desc": "You have been tasked by the instructor to reach 10 in every stat",
        "repeatable": false,
        "goals": {
            "stats": {
                "str": {
                    "amount": 10,
                    "lifetime": true
                },
                "def": {
                    "amount": 10,
                    "lifetime": true
                },
                "spd": {
                    "amount": 10,
                    "lifetime": true
                },
                "dex": {
                    "amount": 10,
                    "lifetime": true
                }
            }
        }
    }
}
const shopData = {
    "merchant": [
        {"name": "exercisePill", "chance": 100, "quantity": [1, 3], "price": [5, 7]},
        {"name": "knife", "chance": 50, "quantity": [1, 1], "price": [19, 25]}
    ],
    "weaponShop": []
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
const itemClasses = {
    "misc": "#cccccc",
    "consumable": "#ffcc22",
    "gear": "#ff8888"
}
const titleData = {
    "athlete": {"name": "Athlete"},
    "fighter": {"name": "Fighter"},
    "disciple": {"name": "Disciple"},
    "seeker": {"name": "Seeker"},
    "crafter": {"name": "Crafter"},
    "sleeper": {"name": "Sleeper"}
}
const arenaStatData = [
    {"health": [30, 40], "stats": [4,6], "reward": 10},
    {"health": [60, 80], "stats": [10,15], "reward": 20},
    {"health": [120, 150], "stats": [20,30], "reward": 30},
    {"health": [200, 300], "stats": [50,100], "reward": 50},
    {"health": [400, 600], "stats": [200,300], "reward": 70},
    {"health": [800, 1_000], "stats": [600,800], "reward": 100}
]

function getDayName(date=null) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    if (date == null) {
        return getDayName(minutesToDate(time))
    }
    return dayNames[date.getDay()]
}

function minutesToDate(time) {
    const baseDate = new Date(1900, 0, 1)
    baseDate.setMinutes(baseDate.getMinutes() + time)
    return baseDate
}

function formatTime(time, timeOnly=false) {
    const baseDate = minutesToDate(time)

    const dayName = getDayName(baseDate)

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

function getDay(timeNow=time) {
    return Math.ceil((timeNow + 1) / 1440)
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

function randomRange(min, max, decimals=-1) {
    const value = Math.random() * (max - min) + min
    if (decimals == -1) {return value}
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
}

function generateEnemy(enemyName, stats=null) {
    combatData['enemy'] = enemyName
    const enemy = stats || enemyData[enemyName]
    combatData['enemyProperties'] = enemy['properties']
    if (Array.isArray(enemy['health'])) {
        combatData['enemyMaxHealth'] = randomRange(enemy['health'][0], enemy['health'][1], 0)
    } else {
        combatData['enemyMaxHealth'] = enemy['health']
    }
    combatData['enemyHealth'] = combatData['enemyMaxHealth']

    const statTypes = ["str", "def", "spd", "dex"]
    for (const stat of statTypes) {
        if (Array.isArray(enemy[stat])) {
            combatData['enemyStats'][stat] = randomRange(enemy[stat][0], enemy[stat][1], 2)
        } else {
            combatData['enemyStats'][stat] = enemy[stat]
        }
        document.getElementById(`enemy-stat-${stat}`).textContent = `${stat.charAt(0).toUpperCase()}${stat.slice(1)}: ${formatNumber(combatData['enemyStats'][stat])}`
    }

    document.getElementById("enemy-name").textContent = enemy['name'] || enemyData[enemyName]['name']
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
    combatData['onDeath'] = undefined

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
        let xpGain = 0
        if (Array.isArray(enemyData[combatData['enemy']]['xp'])) {
            xpGain = Math.round(randomRange(enemyData[combatData['enemy']]['xp'][0], enemyData[combatData['enemy']]['xp'][1], 2))
        } else {
            xpGain = enemyData[combatData['enemy']]['xp']
        }
        changeXp(xpGain)
    }

    changeQuestProgress("kills", combatData['enemy'], 1)
    stats['kills'][combatData['enemy']] = (stats['kills'][combatData['enemy']] ?? 0) + 1

    if (combatData['onDeath']) {
        onDeathFunctions(combatData['onDeath'])
    }

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
        skillbarText.textContent = `${skillData[skill]['shortName'] || skillData[skill]['name']} ${xpToLevel(skills[skill], false, scaling)}: ${formatNumber(xpIntoLevel(skills[skill], scaling), true)}/${formatNumber(xpForLevel(xpToLevel(skills[skill], false, scaling), scaling), true)}`

        skillbarParent.appendChild(skillbarFill)
        skillbarParent.appendChild(skillbarText)
        document.getElementById("skill-table").appendChild(skillbarParent)
    } else {
        skills[skill] += skillXp
        const skillbarFill = document.getElementById(`skill-${skill}`).getElementsByClassName("skillbar-fill")[0]
        skillbarFill.style.width = `${xpIntoLevel(skills[skill], scaling) / xpForLevel(xpToLevel(skills[skill], false, scaling), scaling) * 100}%`

        const skillbarText = document.getElementById(`skill-${skill}`).getElementsByClassName("skillbar-text")[0]
        skillbarText.textContent = `${skillData[skill]['shortName'] || skillData[skill]['name']} ${xpToLevel(skills[skill], false, scaling)}: ${formatNumber(xpIntoLevel(skills[skill], scaling), true)}/${formatNumber(xpForLevel(xpToLevel(skills[skill], false, scaling), scaling), true)}`
    }

    if (currentLevel < xpToLevel(skills[skill], false, scaling)) {
        insertLog(colorGen("#bbbb44", `${skillData[skill]['name']} increased to ${xpToLevel(skills[skill], false, scaling)}`))
    }
}

function formatNumber(num, round=false) {
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
    if (round == false || num >= 1000) {
        return sign + value.toFixed(decimals).replace(/\.0+$/, "") + units[exp]
    } else {
        return value.toFixed()
    }
}

function englishifyNumber(n) {
    var special = ["zeroth","first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"]
    var deca = ["twent", "thirt", "fort", "fift", "sixt", "sevent", "eight", "ninet"]
    if (n < 20) return special[n]
    if (n%10 === 0) return deca[Math.floor(n/10)-2] + "ieth"
    return deca[Math.floor(n/10)-2] + "y-" + special[n%10]
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
            return isFinite(item) ? Number(item) : item
        }
    }
}

function createItemDiv(item, type = "inventory", stackable = true, increment = null) {
    const isInventory = type === "inventory"

    const idPrefix = isInventory ? "item" : "storage-item"
    const quantitySource = isInventory ? inventory : storage

    const itemParent = document.createElement("div")
    itemParent.className = "item-parent"
    itemParent.id = stackable ? `${idPrefix}-${item}` : `${idPrefix}-${item}_${increment}`
    itemParent.setAttribute("data-tooltip-title", itemData[item]['name'])
    itemParent.setAttribute("data-tooltip-text", itemData[item]['desc'])
    if (itemData[item]['combat']) {itemParent.setAttribute("data-tooltip-special", "equipment")}

    const itemText = document.createElement("span")
    itemText.className = "item-text"
    itemText.textContent = itemData[item]['name']
    itemText.style.color = itemClasses[itemData[item]['class']]

    itemParent.appendChild(itemText)

    if (stackable) {
        const itemQuantity = document.createElement("span")
        itemQuantity.className = "item-quantity"
        itemQuantity.textContent = `x${quantitySource[item]}`
        itemParent.appendChild(itemQuantity)
    }

    document.getElementById(isInventory ? "inventory-table" : "storage-table").appendChild(itemParent)
}

function genItemLogText(item, amount) {
    return `${amount != null ? colorGen("#ccccff", `x${Math.abs(amount)} `) : ""}${colorGen(itemClasses[itemData[item]['class']], itemData[item]['name'])}`
}

function changeInventory(item, amount, announceReduction=false, itemId=null, newItemData=null) {
    if (itemData[item]['stackable'] !== false) {
        if (inventory[item] == undefined) {
            if (amount <= 0) {return false}
            inventory[item] = amount
            createItemDiv(item)
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
    } else {
        if (amount == 1) {
            if (newItemData == null) {
                newItemData = {"name": item}
                const itemCombatData = itemData[item]['combat']
                if (itemCombatData) {
                    newItemData['durability'] = randomRange(itemData[item]['durability'][0], itemData[item]['durability'][1], 0)
                    newItemData['maxDurability'] = newItemData['durability']
                    if (itemCombatData['class'] == "weapon") {
                        newItemData['damage'] = randomRange(itemCombatData['damage'][0], itemCombatData['damage'][1], 2)
                    }
                }
            }

            if (itemId == null) {
                inventoryNonStackable[inventoryNonStackableIncrement] = newItemData
                inventoryNonStackableIncrement += 1
                createItemDiv(item, "inventory", false, inventoryNonStackableIncrement - 1)
            } else {
                inventoryNonStackable[itemId] = newItemData
                createItemDiv(item, "inventory", false, itemId)
            }
        } else {
            if (itemData[item]['combat']) {
                const itemClass = itemData[item]['combat']['class']
                if (equipment[itemClass] != null && itemId == equipment[itemClass][1]) {
                    changeEquipment(itemId)
                }
            }
            delete inventoryNonStackable[itemId]
            document.getElementById(`item-${item}_${itemId}`).remove()
        }
    }

    if (amount > 0) {
        insertLog(`Obtained ${genItemLogText(item, amount)}`, [itemData[item]['name'], itemData[item]['desc']])
    } else if (announceReduction == true) {
        insertLog(`Used ${genItemLogText(item, amount)}`, [itemData[item]['name'], itemData[item]['desc']])
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

function changeStorage(item, amount, itemId=null, newItemData=null, announce=true) {
    if (itemData[item]['stackable'] !== false) {
        if (storage[item] == undefined) {
            if (amount <= 0) {return false}
            storage[item] = amount
            createItemDiv(item, "storage")
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
    } else {
        if (amount == 1) {
            storageNonStackable[itemId] = newItemData
            createItemDiv(item, "storage", false, itemId)
        } else {
            delete storageNonStackable[itemId]
            document.getElementById(`storage-item-${item}_${itemId}`).remove()
        }
    }
    if (amount > 0 && announce == true) {
        insertLog(`Deposited ${genItemLogText(item, amount)}`, [itemData[item]['name'], itemData[item]['desc']])
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
    let itemId = null
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

    if (item.split("_").length == 2) {
        [item, itemId] = item.split("_")
    }

    if (item != null) {
        if (storage == false) {
            const newItemData = inventoryNonStackable[itemId]
            changeInventory(item, -1, false, itemId)
            changeStorage(item, 1, itemId, newItemData)
        } else if (storage == true) {
            const newItemData = storageNonStackable[itemId]
            changeStorage(item, -1, itemId)
            changeInventory(item, 1, false, itemId, newItemData)
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

    if (Math.floor((time - amount) / 1440) < Math.floor(time / 1440)) {
        delete checks['arenaParticipated']
    }
    document.getElementById("center-top").textContent = formatTime(time)
}

function changeEffect(effect, enable=true, duration=0, absolute=false) {
    if (enable == true) {
        if (effects[effect] == undefined) {
            if (duration == 0) {
                effects[effect] = true
            } else {
                if (absolute == false) {
                    effects[effect] = duration + time
                } else {
                    effects[effect] = duration
                }
            }
            const div = document.createElement("div")
            div.className = "effect-icon"
            div.id = `effect-${effect}`
            div.style.backgroundColor = effectData[effect]['color']
            div.setAttribute("data-tooltip-title", effectData[effect]['name'])
            if (duration == 0 || duration == true) {
                div.setAttribute("data-tooltip-text", effectData[effect]['desc'])
            } else {
                div.setAttribute("data-tooltip-text", `${effectData[effect]['desc']}<hr>Ends: ${colorGen("#ccccff", formatTime(effects[effect], true))}`)
            }

            document.getElementById("effects-bar").appendChild(div)
        } else if (duration != 0) {
            if (absolute == false) {
                effects[effect] += duration
            } else {
                effects[effect] = duration
            }
            document.getElementById(`effect-${effect}`).setAttribute("data-tooltip-text", `${effectData[effect]['desc']}<hr>Ends: ${colorGen("#ccccff", formatTime(effects[effect], true))}`)
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
        if (currentScene == "theArenaFight") {
            if (arenaData['round'] >= 2) {
                prependText = `${colorGen("#ffee00", `You received $${arenaStatData[arenaData['round'] - 2]['reward']} for participating`)}\n\n`
                changeMoney(arenaStatData[arenaData['round'] - 2]['reward'])
                if (team == "nextLevel") {
                    checks['nextLevelExercisePills'] = Math.round(arenaStatData[arenaData['round'] - 2]['reward'] / 10)
                }
            }
            arenaData = {}
        }
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
    document.getElementById("completed-quests-table").appendChild(document.getElementById(`quest-${questName}`))
    document.getElementById(`quest-${questName}`).getElementsByClassName("quest-title")[0].style.color = "#ffff00"
    document.getElementById("completed-quests-table").style.display = ""
    document.getElementById("completed-quests-header").style.display = ""
}

function giveQuest(questName, complete=false) {
    if (!quests[questName] && complete == false) {
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
    }
    if (document.getElementById(`quest-${questName}`) == undefined) {
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
                goalProgress.id = `quest-${questName}-${stat}`
                if (complete == false) {
                    goalProgress.style.color = data['completion'] < data['amount'] ? "#ff0000" : "#00ff00"
                    goalProgress.textContent = `${formatNumber(data['completion'])}/${data['amount']}`
                } else {
                    goalProgress.style.color = "#00ff00"
                    goalProgress.textContent = `${formatNumber(data['amount'])}/${data['amount']}`
                }
                
                questGoals.appendChild(goalParent)
                goalParent.appendChild(goal)
                goalParent.appendChild(goalProgress)
            }
        }
        
        questParent.appendChild(questTitle)
        questParent.appendChild(questDesc)
        questParent.appendChild(questGoals)
        document.getElementById("quests-table").appendChild(questParent)

        if (complete == false) {
            checkCompletion(questName)
        } else {
            document.getElementById("completed-quests-table").appendChild(document.getElementById(`quest-${questName}`))
            document.getElementById(`quest-${questName}`).getElementsByClassName("quest-title")[0].style.color = "#ffff00"
            document.getElementById("completed-quests-table").style.display = ""
            document.getElementById("completed-quests-header").style.display = ""
        }
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
                    "price": randomRange(item['price'][0], item['price'][1], 0),
                    "quantity": randomRange(item['quantity'][0], item['quantity'][1], 0)
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

    let nonstackableCounts = {}
    for (const item of Object.values(inventoryNonStackable)) {
        nonstackableCounts[item['name']] = (nonstackableCounts[item['name']] ?? 0) + 1
    }

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

        let i = 0
        const totalItems = Object.keys(itemData[item]['crafting']['materials']).length
        for (const [craftingItem, amount] of Object.entries(itemData[item]['crafting']['materials'])) {
            const materialElement = document.createElement("span")
            if (amount >= 1) {
                materialElement.textContent = `x${amount} ${itemData[craftingItem]['name']}`
            } else {
                materialElement.textContent = `${itemData[craftingItem]['name']} Required`
            }
            if (inventory[craftingItem] >= amount || nonstackableCounts[craftingItem] >= amount) {
                materialElement.style.color = "#aaffaa"
            }

            requirementsHolder.appendChild(materialElement)

            if (i < totalItems - 1) {
                const dividerElement = document.createElement("span")
                dividerElement.textContent = `, `
                requirementsHolder.appendChild(dividerElement)
            }

            i += 1
        }

        itemHolder.appendChild(itemText)
        itemHolder.appendChild(itemComplexity)
        itemParent.appendChild(itemHolder)
        itemParent.appendChild(requirementsHolder)
        craftingHolder.appendChild(itemParent)
    }

    craftingHolder.addEventListener("click", function(e) {
        let item = e.target.closest("[id^=\"crafting-item-\"]")?.id?.replace("crafting-item-", "")
        if (item != null) {
            let nonstackablesRequired = {}
            for (const [craftingItem, amount] of Object.entries(itemData[item]['crafting']['materials'])) {
                if (itemData[craftingItem]['stackable'] !== false) {
                    if (inventory[craftingItem] < amount || inventory[craftingItem] == undefined) {
                        insertLog(colorGen("#aaaaaa", "Missing materials"))
                        return
                    }
                } else {
                    if (nonstackableCounts[craftingItem] < amount || nonstackableCounts[craftingItem] == undefined) {
                        insertLog(colorGen("#aaaaaa", "Missing materials"))
                        return
                    }
                    if (amount >= 1) {
                        nonstackablesRequired[craftingItem] = amount
                    }
                }
            }

            let outputString = Object.entries(nonstackablesRequired).map(([item, amount]) => `- x${amount} ${itemData[item]['name']}`).join("\n")
            if (Object.keys(nonstackablesRequired).length == 0) {
                let arrival = Math.ceil(time + itemData[item]['crafting']['complexity'] / getCraftingSpeed())
                craftInfo['completed'] = 0
                craftInfo['goal'] = itemData[item]['crafting']['complexity']
                craftInfo['recipe'] = item
                sceneManager("empty")
                processText(`You are crafting "${itemData[item]['name']}". You'll finish at ${colorGen("#ccccff", formatTime(arrival, true))}\n\n{Cancel|table|0|cancelCrafting}`)
                playTransition()
            } else {
                sceneManager("empty")
                processText(`Choose\n${outputString}\nfrom your inventory\n\n{Cancel|table|0|cancelCrafting}`)
                craftingSelection = true
                craftInfo['required'] = nonstackablesRequired
                craftInfo['selected'] = item
                playTransition()
            }
        }
    })
}

function changeMoney(amount) {
    money += amount
    if (amount > 0) {
        insertLog(`Obtained ${colorGen("#cccc55", `$${formatNumber(amount)}`)}`)
    }
    document.getElementById("inventory-money").textContent = `$${formatNumber(money)}`
}

function getCraftingSpeed() {
    return 1 + (0.05 * getSkillLevel("crafting"))
}

function getExploreSpeed() {
    return 1 + (0.05 * getSkillLevel("exploration"))
}

function getEquipmentStats(type) {
    return inventoryNonStackable[equipment[type][1]]
}

function changeTitleXp(selectedTitle, amount) {
    titleScores[selectedTitle] = (titleScores[selectedTitle] ?? 0) + amount

    if (amount > 0) {
        for (const title of Object.keys(titleScores)) {
            if (title != selectedTitle) {
                titleScores[title] *= 0.9999
            }
        }
    }

    const highest = Object.entries(titleScores).reduce((max, current) => current[1] > max[1] ? current : max)
    if (highest[1] >= 50 && playerTitle != titleData[highest[0]]['name']) {
        changeTitle(titleData[highest[0]]['name'])
    }
}

function onDeathFunctions(name) {
    if (name == "firstTrainingDummy") {
        playTransition()
        sceneManager("dojoQuestIntro")
    } else if (name == "strawGolem") {
        playTransition()
        sceneManager("dojoYard")
        checks['golemMax'] = Math.max(checks['golemMax'] || 0, 1)
    } else if (name == "woodGolem") {
        playTransition()
        sceneManager("dojoYard")
        //checks['golemMax'] = Math.max(checks['golemMax'] || 0, 2)
    } else if (name == "arenaWinMatch") {
        playTransition()
        sceneManager("theArenaWinMatch")
    }
}

const sceneTicks = new Map([
    ["trainingGrounds_str", function() {
        changeBattlestat("str", gyms['none']['str'])
        changeSkill("training", 1)
        changeTitleXp("athlete", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_def", function() {
        changeBattlestat("def", gyms['none']['def'])
        changeSkill("training", 1)
        changeTitleXp("athlete", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_spd", function() {
        changeBattlestat("spd", gyms['none']['spd'])
        changeSkill("training", 1)
        changeTitleXp("athlete", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_dex", function() {
        changeBattlestat("dex", gyms['none']['dex'])
        changeSkill("training", 1)
        changeTitleXp("athlete", 1)
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
        changeTitleXp("sleeper", 1)
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
        changeTitleXp("athlete", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_nextLevel_def", function() {
        changeBattlestat("def", gyms['nextLevel']['def'])
        changeSkill("training", 1)
        changeTitleXp("athlete", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_nextLevel_spd", function() {
        changeBattlestat("spd", gyms['nextLevel']['spd'])
        changeSkill("training", 1)
        changeTitleXp("athlete", 1)
        changeEnergy(-0.2)
    }],
    ["trainingGrounds_nextLevel_dex", function() {
        changeBattlestat("dex", gyms['nextLevel']['dex'])
        changeSkill("training", 1)
        changeTitleXp("athlete", 1)
        changeEnergy(-0.2)
    }],
    ["theArenaWinMatch", function() {
        if (time >= arenaData['endTime']) {
            delete arenaData['endTime']
            playTransition()
            sceneManager("theArenaWalkIn")
        }
    }],
    ["theArenaMedbay", function() {
        changeHp(2)
        if (time >= arenaData['endTime']) {
            delete arenaData['endTime']
            playTransition()
            sceneManager("theArenaWalkIn")
        }
    }]
])

const effectFunctions = new Map([
    ["sleepDeprived", function() {
        changeEnergy(-0.1)
    }]
])

const explorePools = {
    "parkExplore": {
        "difficulty": [10, 15],
        "loot": {
            "grass": 4,
            "woodenStick": 1
        }
    }
}

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
        changeTitleXp("crafter", 2)
        craftInfo['skillXp'] += 1
        if (craftInfo['completed'] >= craftInfo['goal']) {
            playTransition()
            for (const [craftingItem, amount] of Object.entries(itemData[craftInfo['recipe']]['crafting']['materials'])) {
                if (itemData[craftingItem]['stackable'] != false) {
                    changeInventory(craftingItem, -amount)
                }
            }

            for (const item of craftInfo['using']) {
                changeInventory(inventoryNonStackable[item]['name'], -1, false, item)
            }

            changeInventory(craftInfo['recipe'], 1)
            craftInfo['recipe'] = null
            craftInfo['completed'] = 0
            craftInfo['goal'] = 0
            craftInfo['using'] = []
            craftInfo['skillXp'] = 0
            sceneManager("table")
        }
    }

    if (explorePools[currentScene] != null) {
        if (exploreData['area'] == null || exploreData['area'] != currentScene) {
            exploreData['area'] = currentScene
            exploreData['goal'] = randomRange(explorePools[currentScene]['difficulty'][0], explorePools[currentScene]['difficulty'][1], 0)
        }
        exploreData['completed'] += getExploreSpeed()
        changeSkill("exploration", 1)
        changeTitleXp("seeker", 1)
        if (exploreData['completed'] >= exploreData['goal']) {
            exploreData['completed'] = 0
            exploreData['goal'] = randomRange(explorePools[currentScene]['difficulty'][0], explorePools[currentScene]['difficulty'][1], 0)
            changeInventory(getRandomLoot(explorePools[currentScene]['loot']), 1)
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
            if (equipment['weapon']) {
                turnDmg = turnDmg * getEquipmentStats("weapon")['damage'] * (1 + getSkillLevel(`${itemData[equipment['weapon'][0]]['subclass']}Mastery`) * 0.03)
            } else {
                turnDmg = turnDmg * (1 + getSkillLevel("unarmedMastery") * 0.03)
            }

            const turnDmgMitigation = calcDamageMitigation(effectiveStats['str'], enemyStats['def'])
            const turnHitChance = calcHitChance(effectiveStats['spd'], enemyStats['dex'])
            
            const turnActualDmg = Math.round(turnDmg * (1 - turnDmgMitigation))
            if (turnHitChance / 100 > Math.random()) {
                insertLog(`You -> ${colorGen("#ff3333", turnActualDmg)}`)
                combatData['enemyHealth'] -= turnActualDmg
                if (equipment['weapon']) {
                    const item = equipment['weapon'][0]
                    const itemId = equipment['weapon'][1]
                    getEquipmentStats("weapon")['durability'] -= 1
                    document.getElementById("equipment-weapon").querySelector(".bar-fill").style.width = `${getEquipmentStats("weapon")['durability'] / getEquipmentStats("weapon")['maxDurability'] * 100}%`
                    if (getEquipmentStats("weapon")['durability'] <= 0) {
                        insertLog(`${genItemLogText(item, null)} broke`, [itemData[item]['name'], itemData[item]['desc']])
                        changeEquipment(itemId)
                        changeInventory(item, -1, false, itemId)
                    }

                    if (skillData[`${itemData[item]['subclass']}Mastery`]) {
                        changeSkill(`${itemData[item]['subclass']}Mastery`, 1)
                    }
                } else {
                    changeSkill("unarmedMastery", 1)
                }
            } else {
                insertLog(colorGen("#aaaaaa", "You missed"))
            }
            changeSkill("fighting", 1)
            if (combatData['enemy'] == "strawDummy") {
                changeTitleXp("disciple", 1)
            } else {
                changeTitleXp("fighter", 1)
            }

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

    updateTooltip()
}

setInterval(tick, 1000)
setInterval(function() {
    if (currentScene != "intro1") {
        saveToLocal(makeSave())
        document.getElementById("last-save").textContent = `Last Save: ${new Date().toLocaleTimeString()}`
    }
}, 10000)

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

function updateTooltip() {
    if (activeTarget) {
        const tooltipTitle = activeTarget.getAttribute("data-tooltip-title")
        let tooltipText = activeTarget.getAttribute("data-tooltip-text")
        const tooltipSpecial = activeTarget.getAttribute("data-tooltip-special")
        if (tooltipSpecial == "equipment") {
            const [item, itemId] = activeTarget.id.replace("item-", "").split("_")
            const tooltipItemData = inventoryNonStackable[itemId] || storageNonStackable[itemId]
            if (tooltipItemData != undefined) {
                tooltipText += `<hr>Dmg: ${colorGen("#ff0000", tooltipItemData['damage'])}`
                tooltipText += `\nDurability: ${colorGen("#ffff00", tooltipItemData['durability'])}`
            }
        }

        document.getElementById("tooltip-title").textContent = tooltipTitle

        if (tooltipText != undefined && tooltipText.includes("<")) {
            document.getElementById("tooltip-text").innerHTML = tooltipText
        } else {
            document.getElementById("tooltip-text").textContent = tooltipText
        }
    }
}

document.addEventListener("mouseover", function(e) {
    const elem = e.target.closest("[data-tooltip-title]")
    if (!elem) return
    
    activeTarget = elem
    updateTooltip()

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

function changeEquipment(itemId) {
    const item = inventoryNonStackable[itemId]['name']
    const equipmentElem = document.getElementById(`equipment-${itemData[item]['combat']['class']}`)
    const itemClass = itemData[item]['combat']['class']
    if (equipment[itemClass] == null || itemId != equipment[itemClass][1]) {
        if (equipment[itemClass] != null && itemId != equipment[itemClass][1]) {
            document.getElementById(`item-${equipment[itemClass][0]}_${equipment[itemClass][1]}`).querySelector(".item-equipped").remove()
        }
        equipment[itemClass] = [item, itemId]
        equipmentElem.querySelector(".equipment-item-text").textContent = itemData[item]['name']
        equipmentElem.querySelector(".equipment-item-text").style.color = "#ffffff"
        equipmentElem.querySelector(".bar-fill").style.width = `${inventoryNonStackable[itemId]['durability'] / inventoryNonStackable[itemId]['maxDurability'] * 100}%`
        const inventorySlot = document.getElementById(`item-${item}_${itemId}`)
        if (inventorySlot) {
            const itemEquipped = document.createElement("span")
            itemEquipped.className = "item-equipped"
            itemEquipped.textContent = "E"

            inventorySlot.appendChild(itemEquipped)
        }
    } else {
        equipment[itemData[item]['combat']['class']] = null
        equipmentElem.querySelector(".equipment-item-text").textContent = equipmentElem.getAttribute("data-tooltip-title")
        equipmentElem.querySelector(".equipment-item-text").style.color = ""
        equipmentElem.querySelector(".bar-fill").style.width = "0"

        document.getElementById(`item-${item}_${itemId}`).querySelector(".item-equipped").remove()
    }
}

document.getElementById("inventory-table").addEventListener("click", function(e) {
    if (storageAccess) {return}
    let [item, itemId] = e.target.closest("[id^=\"item-\"]").id.replace("item-", "").split("_")
    if (craftingSelection == true) {
        if (craftInfo['required'][item] != undefined) {
            const inventorySlot = document.getElementById(`item-${item}_${itemId}`)
            if (!craftInfo['using'].includes(itemId)) {
                if (craftInfo['required'][item] > 0) {
                    if (itemData[item]['combat']) {
                        if (equipment[itemData[item]['combat']['class']] != undefined && equipment[itemData[item]['combat']['class']][1] == itemId) {
                            return
                        }
                    }

                    if (inventorySlot) {
                        const itemSelected = document.createElement("span")
                        itemSelected.className = "item-selected"
                        itemSelected.textContent = "S"

                        inventorySlot.appendChild(itemSelected)
                    }
                    craftInfo['using'].push(itemId)
                    craftInfo['required'][item] -= 1
                }
            } else {
                craftInfo['using'].splice(craftInfo['using'].indexOf(itemId), 1)
                craftInfo['required'][item] += 1
                inventorySlot.getElementsByClassName("item-selected")[0].remove()
            }
            let outputString = Object.entries(craftInfo['required']).filter(([item, amount]) => amount > 0).map(([item, amount]) => `- x${amount} ${itemData[item]['name']}`).join("\n")
            if (outputString != "") {
                processText(`Choose\n${outputString}\nfrom your inventory\n\n{Cancel|table|0|cancelCrafting}`)
            } else {
                processText(`{Confirm|craftConfirm}\n\n{Cancel|table|0|cancelCrafting}`)
            }
        }
        return
    }

    if (item != null) {
        if (itemData[item]['execute']) {
            itemData[item]['execute']()
            changeInventory(item, -1, true)
        } else if (itemData[item]['combat']) {
            changeEquipment(itemId)
        }
    }
})

function getTotalBattlestats() {
    return battleStats['str'] + battleStats['def'] + battleStats['spd'] + battleStats['dex']
}

function changeTitle(newTitle) {
    playerTitle = newTitle
    document.getElementById("title").textContent = playerTitle
    insertLog(`Title Changed: ${colorGen("#dd8833", `"${playerTitle}"`)}`)
}

function genTrainingAreaText(target) {
    return `{![dumbbells.png]Train Strength|${target}_str}\n{![shield.png]Train Defense|${target}_def}\n{![treadmill.png]Train Speed|${target}_spd}\n{![dexterity.png]Train Dexterity|${target}_dex}`
}

class scenes {
    static empty() {
        return ``
    }

    static craftConfirm() {
        const item = craftInfo['selected']
        craftInfo['selected'] = null
        craftingSelection = false
        let arrival = Math.ceil(time + itemData[item]['crafting']['complexity'] / getCraftingSpeed())
        craftInfo['completed'] = 0
        craftInfo['goal'] = itemData[item]['crafting']['complexity']
        craftInfo['recipe'] = item
        return `You are crafting "${itemData[item]['name']}". You'll finish at ${colorGen("#ccccff", formatTime(arrival, true))}\n\n{Cancel|table|0|cancelCrafting}`
    }

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
        return `You follow Alan until he reaches a small wooden house. He gestures for you to head inside.\n\n{![enter.png]Enter|intro9}`
    }

    static intro9() {
        changeTitle("Newcomer")
        return `The house is small.\n\nThin walls. Wooden floor. One bed. One table.\n\n"It's yours. Nothing much but it's better than nothing."\n\n{Next|intro10}`
    }

    static intro10() {
        return `"You can walk around town if you want. Just don't go past the outer fence. It's not safe."\n\nHe leaves without waiting.\n\n{Next|home}`
    }

    static home() {
        return `You are in your home. You can rest here.\n\n{![bed.png]Sleep|sleep}\n{![storage.png]Storage|storage}\n{![table.png]Table|table}\n\n{![leave.png]Leave|housingArea}`
    }

    static sleep() {
        return `You are currently sleeping. Time passes faster...\n\n{![leave.png]Get up|home}`
    }

    static storage() {
        toggleStorageAccess(true)
        return `You can access your storage from the sidebar. Click an item in your inventory to deposit it and click an item in your storage to withdraw it.\n\n{![leave.png]Leave|home|0|leaveStorage}`
    }

    static table() {
        return `You are able to craft items here.\n\n{![leave.png]Leave|home}`
    }

    static housingArea() {
        return `You are in the housing area of the town. You can access your home or other areas from here.\n\n{![enter.png]Home|home}\n\n{![town_center.png]Town Center|townCenter|250}`
    }

    static townCenter() {
        return `You are at the center of the town. Many people rush by hastily.\n\n{![poster.png]Notice Board|noticeBoard}\n{![dumbbells.png]Training Grounds|trainingGrounds}\n{![training_dummy.png]Dojo|dojo}\n\n{![hospital.png]Hospital|hospital}\n{![dollar.png]Merchant|merchant}\n\n{![alley.png]Alley|alley}\n\n{![wood_door.png]Housing Area|housingArea|250}\n{![arrow_up.png]Town North|townNorth|250}`
    }

    static noticeBoard() {
        return `There is nothing of interest to you here.\n\n{![leave.png]Return|townCenter}`
    }

    static trainingGrounds() {
        if (!checks['trainingGroundsTeamIntro'] && getTotalBattlestats() >= 10) {
            checks['trainingGroundsTeamIntro'] = true
            return `"Hi! we're an up-and-coming fighting team for matches in The Arena. If you're willing to represent our team, we'll give you various supplies and equipment to help you improve your stats quickly. Sounds good?"\n\n{![tick.png]Yes|trainingGroundsTeamIntro1}\n\n{![cross.png]Maybe Later|trainingGrounds}`
        }

        let r = `You are in the training grounds. You are able to improve your strength, defense, speed or dexterity here.\n\n{![chat.png]Training Instructor|trainingGroundsInstructor}`
        if (checks['trainingGroundsTeamIntro'] && team != "nextLevel") {
            r += `\n\n{![tick.png]Join Team|trainingGroundsTeamIntro1}`
        }
        
        if (team == "nextLevel") {
            r += `\n\n{Team Tent|trainingGrounds_nextLevel}`
        } else {
            r += `\n\n${genTrainingAreaText("trainingGrounds")}`
        }
        r += `\n\n{![leave.png]Leave|townCenter}`
        return r
    }

    static trainingGroundsInstructor() {
        return `{![chat.png]Ask about stats|trainingGroundsInstructorAskStats}\n\n{![leave.png]Return|trainingGrounds}`
    }

    static trainingGroundsInstructorAskStats() {
        return `"Everyone has four main stats. Strength increases the damage you deal, Defense reduces the damage you take, Speed increases your chances of hitting and Dexterity increases the chance of dodging attacks."\n\n{![leave.png]Return|trainingGroundsInstructor}`
    }

    static trainingGrounds_str() {
        return `You are doing push-ups in the training grounds.\n\n{![stop.png]Stop|trainingGrounds}`
    }

    static trainingGrounds_def() {
        return `You are practicing bracing in the training grounds.\n\n{![stop.png]Stop|trainingGrounds}`
    }

    static trainingGrounds_spd() {
        return `You are practicing speed punching in the training grounds.\n\n{![stop.png]Stop|trainingGrounds}`
    }

    static trainingGrounds_dex() {
        return `You are balancing on a beam in the training grounds.\n\n{![stop.png]Stop|trainingGrounds}`
    }

    static trainingGroundsTeamIntro1() {
        return `"Awesome! I'll tell you everything you need to know. Follow me."\n\n{Continue|trainingGroundsTeamIntro2}`
    }

    static trainingGroundsTeamIntro2() {
        return `You follow the young man in to a large tent on the field.\n\n"This is the tent with all our special training equipment and staff. Training here would be 2x as effective than the public equipment."\n\n{Continue|trainingGroundsTeamIntro3}`
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
        let r = `You are inside your team's tent.`
        if (checks['nextLevelExercisePills']) {r += `\n\n{Claim Exercise Pills|trainingGrounds_nextLevel|0|nextLevelClaimExercisePill}`}
        r += `\n\n${genTrainingAreaText("trainingGrounds_nextLevel")}\n\n{![leave.png]Leave|trainingGrounds}`
        return r
    }

    static trainingGrounds_nextLevel_str() {
        return `You are lifting weights in your team's tent.\n\n{![stop.png]Stop|trainingGrounds_nextLevel}`
    }

    static trainingGrounds_nextLevel_def() {
        return `You are practicing sparring against a team member.\n\n{![stop.png]Stop|trainingGrounds_nextLevel}`
    }

    static trainingGrounds_nextLevel_spd() {
        return `You are practicing spot jogging in your team's tent.\n\n{![stop.png]Stop|trainingGrounds_nextLevel}`
    }

    static trainingGrounds_nextLevel_dex() {
        return `You are practicing dodging punches from a team member.\n\n{![stop.png]Stop|trainingGrounds_nextLevel}`
    }

    static dojo() {
        if (checks['dojo'] == undefined) {
            checks['dojo'] = true
            return `As you walk into the dojo, an old man greets you.\n\n"Welcome to the dojo. This is the main place in town where fighters of all classes come to train their fighting skills."\n\n{Next|dojo}`
        } else {
            let r = `You are in the dojo.\n\n{![chat.png]Dojo Instructor|dojoInstructor}\n{![sword.png]Practice fighting a training dummy|dojo_trainingDummy}\n\n` 
            if (quests['dojoIntro4'] || completedQuests.includes("dojoIntro4")) {r += `{![park.png]Yard|dojoYard}`}
            r += `\n{![leave.png]Leave|townCenter}`
            return r
        }
    }

    static dojo_trainingDummy() {
        generateEnemy("strawDummy")
        if (checks['firstDummy'] != true) {combatData['onDeath'] = "firstTrainingDummy"}
        return `You are practicing fighting against training dummies.\n\n{![stop.png]Stop|dojo|0|endFight}`
    }

    static dojoQuestIntro() {
        checks['firstDummy'] = true
        return `As you defeat your first training dummy, the instructor walks towards you.\n\n"You're not from around here are you? You seem like you're from another world but I can see potential."\n\n{Next|dojoQuestIntro2}`
    }

    static dojoQuestIntro2() {
        giveQuest("dojoIntro1")
        if (battleStats['str'] < 1.5) {
            return `"I'm willing to guide you in order to become stronger. But first, you need to reach the goal of 1.5 strength and destroy 5 straw dummies. Come talk to me again once you're done."\n\n{![leave.png]Return|dojo}`
        } else {
            return `"I'm willing to guide you in order to become stronger. But first, you need to destroy 5 straw dummies. Come talk to me again once you're done."\n\n{![leave.png]Return|dojo}`
        }
    }

    static dojoInstructor() {
        return `"Need something?"\n\n{![tick.png]Quest Completion|dojoInstructorQuest}\n\n{![leave.png]Return|dojo}`
    }

    static dojoInstructorQuest() {
        const dojoQuests = [
            {
                "quest": "dojoIntro1",
                "pillReward": 1,
                "message": "Good job, you've proven that you're able to do some basic fighting. Unlike real enemies, these dummies don't fight back or move. For your next task: get all your battle stats to 1.5. Then I can give you some real enemies to fight."
            },
            {
                "quest": "dojoIntro2",
                "pillReward": 1,
                "message": "You now have some decent stats, still below the average human in this world but you should now be able do my next quest without issue. Your goal is to defeat 10 mice in the alleys. Visit the hospital if your health drops too low. If you struggle to defeat the mice, I suggest training a bit more."
            },
            {
                "quest": "dojoIntro3",
                "pillReward": 2,
                "message": "Good job, you've proven that you're able to fight real enemies now. Although only small ones, it's still progress. Your next task is to defeat the wooden golem located in the dojo yard. This is significantly harder than the mice but you'll only have to defeat one of them."
            },
            {
                "quest": "dojoIntro4",
                "pillReward": 5,
                "message": "Congratulations on beating the golem, there are more available for you to fight if you wish. For my final quest: I want you to reach 10 in every stat. Upon completion you'll gain permission to explore outside of the city. This may take you a while and I wouldn't expect you to complete it quickly. You can continue exploring other areas inside the city while working your way towards completion."
            },
            {
                "quest": "dojoIntro5",
                "pillReward": 7,
                "message": "This is the end of my questline for now, you are free to explore outside the city but be careful as there are stronger enemies around."
            }
        ]
        for (let i = 0; i < dojoQuests.length; i++) {
            if (completedQuests.includes(dojoQuests[i]['quest']) && (checks['dojoQuestIndex'] == undefined || checks['dojoQuestIndex'] < i)) {
                const quest = dojoQuests[i]

                checks['dojoQuestIndex'] = i
                if (dojoQuests[i + 1] != undefined) {
                    giveQuest(dojoQuests[i + 1]['quest'])
                }
                changeInventory("exercisePill", quest['pillReward'])

                return `"${quest['message']}"\n\n{![leave.png]Return|dojo}`
            }
        }

        return `"You don't seem to have completed any new quests."\n\n{![leave.png]Return|dojo}`
    }

    static dojoYard() {
        return `You are in the yard of the dojo.\n\n{![training_dummy.png]Golems|dojoGolems}\n\n{![leave.png]Return|dojo}`
    }

    static dojoGolems() {
        const golemText = [
            `{Wood Golem|dojo_golemFight|0|generateEnemy(woodGolem,woodGolem)}\n`
        ]
        let r = `{Straw Golem|dojo_golemFight|0|generateEnemy(strawGolem,strawGolem)}\n`
        for (let i = 0; i < checks['golemMax'] || 0; i++) {
            r += golemText[i]
        }
        r += `\n{![leave.png]Return|dojoYard}`
        return r
    }

    static dojo_golemFight() {
        return `You are fighting a golem.\n\n{![leave.png]Return|dojoYard|0|endFight}`
    }

    static hospital() {
        if (health < calcMaxHp()) {
            return `You are getting healed by a doctor...\n\n{![leave.png]Leave|townCenter}`
        } else {
            return `You are already at maximum health.\n\n{![leave.png]Leave|townCenter}`
        }
    }

    static alley() {
        if (!quests['dojoIntro3'] && !completedQuests.includes("dojoIntro3")) {
            return `"Sorry, no civilians allowed here. We have an infestation problem."\n\n{![leave.png]Leave|townCenter}`
        } else {
            generateEnemy("mouse")
            return `You are in the alley. There are mice and rats everywhere.\n\n{![leave.png]Leave|townCenter|0|endFight}`
        }
    }

    static merchant() {
        return `"Welcome! I'm the main supplier of various goods in this town. I can also buy any straw baskets that you may have. Feel free to look around."\n\n{![dollar.png]Sell|merchantSell}\n\n{![leave.png]Leave|townCenter}`
    }

    static merchantSell() {
        if (inventory['strawBasket'] == undefined) {
            return `"It appears that you don't have any straw baskets to sell. Come back when you get some, I pay $5 for each."\n\n{![leave.png]Return|merchant}`
        } else {
            return `"Would you like to sell all your straw baskets for a total of ${colorGen("#cccc55", `$${inventory['strawBasket'] * 5}`)}?"\n\n{![tick.png]Yes|merchant|0|merchantSell}\n\n{![leave.png]Return|merchant}`
        }
    }

    static townNorth() {
        return `You are at the north of the town. This area is commonly used for entertainment activites.\n\n{![park.png]Park|park}\n{![sword.png]Weapon Shop|weaponShop}\n{![sword.png]The Arena|theArenaEntrance}\n\n{![town_center.png]Town Center|townCenter|250}`
    }

    static park() {
        return `You are in the park. Various trees and plants are scattered around.\n\n{![search.png]Explore|parkExplore}\n\n{![leave.png]Leave|townNorth}`
    }

    static parkExplore() {
        return `You are searching for valuable objects in the park.\n\n{![stop.png]Stop|park}`
    }

    static weaponShop() {
        return `"Welcome to my weapon shop, I craft and import weapons from various places. Don't think about stealing, you are in a weapon shop after all."\n\n{![leave.png]Leave|townNorth}`
    }

    static theArenaEntrance() {
        arenaData = {}
        let r = `You are in the entrance of the arena.`
        r += getDayName() == "Sunday" ? `It's quite crowded with many people rushing to join the queue for tickets.${checks['arenaParticipated'] == undefined ? "\n\n{![sword.png]Participate|theArenaSignup}" : ""}` : " It's quite empty, more people would be here on a Sunday."
        r += `\n\n{![leave.png]Leave|townNorth}`
        return r
    }

    static theArenaSignup() {
        let r = `You join the signup queue and patiently wait for your turn.\n\n`
        r += getTotalBattlestats() >= 20 ? `"Hello, would you like to participate in the matches?"\n\n{![tick.png]Yes|theArenaSignupIntro1}\n{![cross.png]No|theArenaEntrance}` : `"Unfortunately you do not meet the minimum requirements. Come back when you have a rank of ${colorGen("#88bb00", "G-")} or higher."\n\n{![leave.png]Leave|theArenaEntrance}`
        return r
    }

    static theArenaSignupIntro1() {
        return `"Great, please head towards the doors over there."\n\n{![enter.png]Enter|theArenaSignupIntro2}`
    }

    static theArenaSignupIntro2() {
        arenaData['round'] = 1
        checks['arenaParticipated'] = true
        return `"Welcome to The Arena, fighter. You will be participating in a series of matches against opponents that get increasingly stronger with one loss resulting in elimination. This is the biggest event in this town with hundreds of participants and thousands of spectators. You get up to a 60 minute break after every match. Best of luck, you can begin when you're ready."\n\n{![enter.png]Begin|theArenaWalkIn}`
    }

    static theArenaWalkIn() {
        delete arenaData['endTime']
        return `You walk into the arena and prepare to fight your opponent.\n\nThe organiser shouts, "This is round ${arenaData['round']}, get ready."\n\n{![sword.png]Fight|theArenaFight}`
    }

    static theArenaFight() {
        const newStats = arenaStatData[arenaData['round'] - 1]
        generateEnemy("human", {
            "health": newStats['health'],
            "str": newStats['stats'],
            "def": newStats['stats'],
            "spd": newStats['stats'],
            "dex": newStats['stats']
        })
        combatData['onDeath'] = "arenaWinMatch"
        return `You are currently fighting your opponent in The Arena.`
    }

    static theArenaWinMatch() {
        let r = ""
        if (team == "nextLevel" && checks['nextLevelCongrats'] == false) {
            r += `A member of your team runs towards you\n\n"Congrats on winning your first match, you did great in there"\n\n`
            checks['nextLevelCongrats'] = true
        } else {
            r += `"Good job contestant on winning your ${englishifyNumber(arenaData['round'])} round, the next round will begin shortly."`
        }
        r += `\n\n{![enter.png]Begin Immediately|theArenaWalkIn}\n\n{![hospital.png]Medbay|theArenaMedbay}\n\n{![leave.png]Resign|theArenaEntrance|0|theArenaResign}`
        arenaData['endTime'] = time + 60
        arenaData['round'] += 1
        return r
    }

    static theArenaMedbay() {
        let r = ""
        if (health < calcMaxHp()) {
            r += `You are getting healed by a doctor...`
        } else {
            r += `You are already at maximum health.`
        }
        r += `\n\n{![leave.png]Leave|theArenaWinMatch}`
        return r
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

    static cancelCrafting() {
        craftingSelection = false
        changeSkill("crafting", -craftInfo['skillXp'])
        changeTitleXp("crafter", -craftInfo['skillXp'] * 2)
        craftInfo['recipe'] = null
        craftInfo['completed'] = 0
        craftInfo['goal'] = 0
        craftInfo['using'] = []
        craftInfo['skillXp'] = 0

        for (const elem of document.querySelectorAll(".item-selected")) {
            elem.remove()
        }
    }

    static generateEnemy(args) {
        let enemy, onDeath
        if (typeof args == "string") {
            enemy = args
        } else {
            [enemy, onDeath] = args
        }
        generateEnemy(enemy)
        if (onDeath) {
            combatData['onDeath'] = onDeath
        }
    }

    static theArenaResign() {
        prependText = `You resigned from The Arena\n\n${colorGen("#ffee00", `You received $${arenaStatData[arenaData['round'] - 2]['reward']} for participating`)}\n\n`
        changeMoney(arenaStatData[arenaData['round'] - 2]['reward'])
        if (team == "nextLevel") {
            checks['nextLevelExercisePills'] = Math.round(arenaStatData[arenaData['round'] - 2]['reward'] / 10)
        }
        arenaData = {}
    }

    static nextLevelClaimExercisePill() {
        changeInventory("exercisePill", checks['nextLevelExercisePills'])
        delete checks['nextLevelExercisePills']
    }
}

class sceneEndFunctions {
    static merchant() {
        generateShop("merchant")
    }

    static table() {
        generateCraftingMenu()
    }

    static weaponShop() {
        generateShop("weaponShop")
    }
}

function processText(text) {
    sceneText = text
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
                img.style.marginRight = "6px"
                img.style.verticalAlign = "middle"
                div.appendChild(img)
            }
        })
        
        document.getElementById("main").appendChild(div)
        
        if (num < splitLinks.length) {
            let button = document.createElement("button")
            let labelParts = splitLinks[num][1].split(imageRegex)
            if (labelParts.length > 1) {
                labelParts.forEach(function(part, index) {
                    if (index % 2 == 0) {
                        let span = document.createElement("span")
                        span.innerHTML = part
                        button.appendChild(span)
                    } else {
                        let img = document.createElement("img")
                        img.src = "img/" + part
                        img.style.display = "inline-block"
                        img.style.width = "1.5em"
                        img.style.height = "1.5em"
                        img.style.marginRight = "6px"
                        img.style.verticalAlign = "middle"
                        button.appendChild(img)
                    }
                })
            } else {
                button.innerHTML = splitLinks[num][1]
            }
            
            button.className = "main-link"
            button.id = "button" + num
            button.addEventListener("click", function() {
                if (splitLinks[num][3] == undefined || splitLinks[num][3] == 0) {
                    if (splitLinks[num][4] != undefined) {
                        let params = splitLinks[num][5] ? (splitLinks[num][5].includes(",") ? splitLinks[num][5].split(",") : splitLinks[num][5]) : undefined
                        sceneFunctions[splitLinks[num][4]](params)
                    }
                    sceneManager(splitLinks[num][2])
                } else {
                    let arrival = Math.ceil(time + Number(splitLinks[num][3]) / getMovementSpeed())
                    processText(`You are walking towards the ${splitLinks[num][1].replace(imageRegex, "")}. You'll arrive at ${colorGen("#ccccff", formatTime(arrival, true))}`)
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
    const selectedScene = scenes[selected]()
    processText((prependText || "") + selectedScene)
    prependText = ""
    if (sceneEndFunctions[selected]) {sceneEndFunctions[selected]()}
    oldScene = currentScene
    currentScene = selected
}

function objectEmpty(obj) {
    return Object.keys(obj).length === 0
}

function makeSave() { // Optimisation at all costs
    function removeEmpty(key, obj) {
        if (objectEmpty(obj[key])) {obj[key] = undefined}
    }

    let base = {
        money, time, health, xp, playerTitle, battleStats, skills, energy, noSleepTime, effects, titleScores, // Stats
        inventory, inventoryNonStackable, inventoryNonStackableIncrement, storage, storageNonStackable, storageAccess, shopStorage, // Inventory
        combatData, equipment, team, arenaData, // Combat
        oldScene, currentScene, sceneText, // Scenes
        quests, completedQuests, checks, // Quests
        stats, // Stats
        knownRecipes, craftInfo, craftingSelection, // Crafting
        exploreData, travelInfo, // Exploration
    }
    base['version'] = VERSION
    // Stats
    if (base['money'] == 0) {delete base['money']}
    for (const [stat, value] of Object.entries(base['battleStats'])) {
        base['battleStats'][stat] = Math.round(value * 1000) / 1000
    }
    base['energy'] = Math.round(base['energy'] * 1000) / 1000
    removeEmpty("skills", base)
    removeEmpty("effects", base)
    for (const [title, value] of Object.entries(base['titleScores'])) {
        base['titleScores'][title] = Math.round(value * 1000) / 1000
    }
    removeEmpty("titleScores", base)

    // Combat
    if (base['combatData']['enemy'] == null) {base['combatData'] = undefined}
    base['equipment'] = Object.fromEntries(Object.entries(base['equipment']).filter(([key, value]) => value !== null))
    removeEmpty("equipment", base)
    if (base['team'] == "none") {base['team'] = undefined}
    removeEmpty("arenaData", base)
    
    // Inventory
    removeEmpty("inventory", base)
    removeEmpty("inventoryNonStackable", base)
    removeEmpty("storage", base)
    removeEmpty("storageNonStackable", base)
    if (base['storageAccess'] == false) {base['storageAccess'] = undefined}
    removeEmpty("shopStorage", base)

    // Quests
    removeEmpty("quests", base)
    removeEmpty("completedQuests", base)
    removeEmpty("checks", base)

    // Crafting
    if (base['craftInfo']['recipe'] == null && base['craftInfo']['selected'] == null) {base['craftInfo'] = undefined}
    if (base['craftingSelection'] == false) {base['craftingSelection'] = undefined}

    // Exploration
    if (base['exploreData']['area'] == null) {base['exploreData'] = undefined}
    if (base['travelInfo']['destination'] == null) {base['travelInfo'] = undefined}

    base = Object.fromEntries(Object.entries(base).filter(([key, value]) => value !== undefined))
    return base
}

function saveToLocal(dict, slot="save1") {
    const msgpackData = MessagePack.encode(dict)
    const packed = LZString.compressToBase64(String.fromCharCode.apply(null, msgpackData))
    window.localStorage.setItem(slot, packed)
}

function exportDict(dict, filename="proto26.sav") {
    const msgpackData = MessagePack.encode(dict)
    const packed = LZString.compressToUint8Array(String.fromCharCode.apply(null, msgpackData))
    const blob = new Blob([packed], {type: "application/octet-stream"})

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

async function importDict() {
    const [fileHandle] = await window.showOpenFilePicker({
        types: [{description: "Proto26 Save", accept: {"application/octet-stream": [".sav"]}}]
    })
    const file = await fileHandle.getFile()
    const arrayBuffer = await file.arrayBuffer()
    const compressed = new Uint8Array(arrayBuffer)
    const str = LZString.decompressFromUint8Array(compressed)
    const bytes = new Uint8Array(str.split("").map(c => c.charCodeAt(0)))
    const dict = MessagePack.decode(bytes)
    return dict
}

function loadFromLocal(slot="save1") {
    const save = window.localStorage.getItem(slot)
    const decompressed = LZString.decompressFromBase64(save)
    const bytes = new Uint8Array(decompressed.split('').map(char => char.charCodeAt(0)))
    const dict = MessagePack.decode(bytes)
    return dict
}

function loadSave(dict) {
    // Stats
    time = dict['time'] ?? time
    battleStats = dict['battleStats'] ?? battleStats
    energy = dict['energy'] ?? energy
    noSleepTime = dict['noSleepTime'] ?? noSleepTime
    titleScores = dict['titleScores'] ?? titleScores
    
    // Inventory
    inventoryNonStackableIncrement = dict['inventoryNonStackableIncrement'] ?? inventoryNonStackableIncrement
    shopStorage = dict['shopStorage'] ?? shopStorage
    
    // Combat
    combatData = dict['combatData'] ?? combatData
    team = dict['team'] ?? team
    arenaData = dict['arenaData'] ?? arenaData

    // Scenes
    oldScene = dict['oldScene'] ?? oldScene
    currentScene = dict['currentScene'] ?? currentScene
    sceneText = dict['sceneText'] ?? sceneText

    // Quests
    quests = dict['quests'] ?? quests
    completedQuests = dict['completedQuests'] ?? completedQuests
    checks = dict['checks'] ?? checks

    // Stats
    stats = dict['stats'] ?? stats

    // Crafting
    knownRecipes = dict['knownRecipes'] ?? knownRecipes
    craftInfo = dict['craftInfo'] ?? craftInfo
    craftingSelection = dict['craftingSelection'] ?? craftingSelection

    // Exploration
    exploreData = dict['exploreData'] ?? exploreData
    travelInfo = dict['travelInfo'] ?? travelInfo

    if (dict['inventory']) {
        for (const [item, amount] of Object.entries(dict['inventory'])) {
            changeInventory(item, amount)
        }
    }
    if (dict['storage']) {
        for (const [item, amount] of Object.entries(dict['storage'])) {
            changeStorage(item, amount)
        }
    }

    if (dict['inventoryNonStackable']) {
        for (const [id, data] of Object.entries(dict['inventoryNonStackable'])) {
            const item = data['name']
            changeInventory(item, 1, false, id, data)
        }
    }
    if (dict['storageNonStackable']) {
        for (const [id, data] of Object.entries(dict['storageNonStackable'])) {
            const item = data['name']
            changeStorage(item, 1, id, data)
        }
    }

    if (dict['equipment']) {
        for (const [item, data] of Object.entries(dict['equipment'])) {
            if (data != null) {
                changeEquipment(data[1])
            }
        }
    }
    
    if (dict['skills']) {
        for (const [skill, xp] of Object.entries(dict['skills'])) {
            changeSkill(skill, xp)
        }
    }

    if (dict['effects']) {
        for (const [effect, time] of Object.entries(dict['effects'])) {
            changeEffect(effect, true, time, true)
        }
    }

    if (dict['craftInfo']) {
        for (const itemId of dict['craftInfo']['using']) {
            const inventorySlot = document.getElementById(`item-${inventoryNonStackable[itemId]['name']}_${itemId}`)
            if (inventorySlot) {
                const itemSelected = document.createElement("span")
                itemSelected.className = "item-selected"
                itemSelected.textContent = "S"

                inventorySlot.appendChild(itemSelected)
            }
        }
    }

    // Enemy loading
    if (combatData['enemy'] != null) {
        const statTypes = ["str", "def", "spd", "dex"]
        for (const stat of statTypes) {
            document.getElementById(`enemy-stat-${stat}`).textContent = `${stat.charAt(0).toUpperCase()}${stat.slice(1)}: ${formatNumber(combatData['enemyStats'][stat])}`
        }

        document.getElementById("enemy-name").textContent = enemyData[combatData['enemy']]['name']
        updateBar("enemyHealth")

        document.getElementById("attack-info-left").style.display = ""
        document.getElementById("attack-info-divider").style.display = ""
        document.getElementById("attack-info-right").style.display = ""
    }

    if (dict['quests']) {
        for (const quest in dict['quests']) {
            giveQuest(quest)
        }
    }

    if (dict['completedQuests']) {
        for (const quest of dict['completedQuests']) {
            giveQuest(quest, complete=true)
        }
    }

    changeXp(dict['xp'])
    changeMoney(dict['money'] || 0)
    health = dict['health']
    updateBar("health")
    updateBar("energy")
    document.getElementById("center-top").textContent = formatTime(time)

    if (dict['storageAccess'] == true) {toggleStorageAccess(true)}
    if (dict['playerTitle'] != "Unknown") {changeTitle(dict['playerTitle'])}

    processText(sceneText)
    if (sceneEndFunctions[currentScene]) {sceneEndFunctions[currentScene]()}

    document.getElementById("log").replaceChildren()
}

document.getElementById("delete-save").addEventListener("click", function() {
    let confirm = prompt("THIS WILL DELETE YOUR SAVE. TYPE CONFIRM TO CONFIRM")
    if (confirm.toLowerCase() == "confirm") {
        saveEnabled = false
        localStorage.removeItem("save1")
        window.location.reload()
    }
})

document.getElementById("export").addEventListener("click", function() {
    exportDict(makeSave())
})

document.getElementById("import").addEventListener("click", function() {
    importDict().then(dict => {
        saveToLocal(dict, "savetemp")
        window.location.reload()
    })
})
if (localStorage.getItem("savetemp") == undefined) {
    if (localStorage.getItem("save1") == undefined) {
        sceneManager("intro1")
    } else {
        loadSave(loadFromLocal())
    }
} else {
    loadSave(loadFromLocal("savetemp"))
    localStorage.removeItem("savetemp")
}

window.addEventListener("beforeunload", function() {
    if (saveEnabled == true) {
        saveToLocal(makeSave())
    }
})

updateBar("health")
updateBar("xp")
updateBattlestats()