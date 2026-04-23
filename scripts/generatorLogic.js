// Ключи боевых атрибутов
const COMBAT_ATTRIBUTES = ['strength', 'dexterity', 'vitality', 'special', 'insight'];

// Ключи социальных атрибутов
const SOCIAL_ATTRIBUTES = ['tough', 'cool', 'beauty', 'clever', 'cute'];

// Базовые боевые навыки, общие для всех боевых уклонов
const BASE_COMBAT_SKILLS = ['clash', 'evasion'];

function getRandomArrayItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Генерация типа "Wild" (Дикий) — полностью случайное распределение очков.
 */
export function assignWildStats(attributes, social, skills, attrPoints, socPoints, skillPoints, skillMax) {
    // Боевые атрибуты
    let remaining = attrPoints;
    while (remaining > 0) {
        const key = getRandomArrayItem(COMBAT_ATTRIBUTES);
        if (attributes[key] && attributes[key].value < 999) {
            attributes[key].value++;
            remaining--;
        } else if (COMBAT_ATTRIBUTES.every(k => !attributes[k] || attributes[k].value >= 999)) {
            break;
        }
    }

    // Социальные атрибуты
    remaining = socPoints;
    while (remaining > 0) {
        const key = getRandomArrayItem(SOCIAL_ATTRIBUTES);
        if (social[key] && social[key].value < 5) {
            social[key].value++;
            remaining--;
        } else if (SOCIAL_ATTRIBUTES.every(k => !social[k] || social[k].value >= 5)) {
            break;
        }
    }

    // Навыки
    remaining = skillPoints;
    const skillKeys = Object.keys(skills);
    while (remaining > 0) {
        const key = getRandomArrayItem(skillKeys);
        if (skills[key].value < skillMax) {
            skills[key].value++;
            remaining--;
        } else if (skillKeys.every(k => skills[k].value >= skillMax)) {
            break;
        }
    }
}

/**
 * Генерация типа "Battle" (Боевой) — упор на боевые характеристики с учётом уклона.
 * @param {string} combatBias - 'tank', 'physical', 'special'
 */
export function assignBattleStats(attributes, social, skills, attrPoints, socPoints, skillPoints, skillMax, combatBias) {
    // 1. Определяем приоритетные и исключаемые атрибуты
    let priorityAttrs = [];
    let excludedAttrs = [];
    if (combatBias === 'tank') {
        priorityAttrs = ['vitality', 'insight'];
        excludedAttrs = []; // танк качает всё, но с приоритетом на защитные
    } else if (combatBias === 'physical') {
        priorityAttrs = ['strength'];
        excludedAttrs = ['special']; // физический атакер не качает специальную атаку
    } else if (combatBias === 'special') {
        priorityAttrs = ['special'];
        excludedAttrs = ['strength']; // специальный атакер не качает силу
    } else {
        priorityAttrs = COMBAT_ATTRIBUTES;
        excludedAttrs = [];
    }

    // Создаём список атрибутов, доступных для распределения (исключая запрещённые)
    let availableAttrs = COMBAT_ATTRIBUTES.filter(attr => !excludedAttrs.includes(attr));
    if (availableAttrs.length === 0) availableAttrs = COMBAT_ATTRIBUTES;

    // Выделяем значительную часть очков приоритетным атрибутам (70%)
    let priorityPoints = Math.floor(attrPoints * 0.7);
    let remaining = attrPoints;

    // Распределяем приоритетные очки
    let tempRemaining = priorityPoints;
    while (tempRemaining > 0) {
        const key = getRandomArrayItem(priorityAttrs.filter(attr => !excludedAttrs.includes(attr)));
        if (attributes[key] && attributes[key].value < 999) {
            attributes[key].value++;
            tempRemaining--;
            remaining--;
        } else if (priorityAttrs.every(k => !attributes[k] || attributes[k].value >= 999 || excludedAttrs.includes(k))) {
            break;
        }
    }

    // Оставшиеся очки распределяем случайно по доступным атрибутам
    while (remaining > 0) {
        const key = getRandomArrayItem(availableAttrs);
        if (attributes[key] && attributes[key].value < 999) {
            attributes[key].value++;
            remaining--;
        } else if (availableAttrs.every(k => !attributes[k] || attributes[k].value >= 999)) {
            break;
        }
    }

    // Социальные атрибуты — случайно (без изменений)
    remaining = socPoints;
    while (remaining > 0) {
        const key = getRandomArrayItem(SOCIAL_ATTRIBUTES);
        if (social[key] && social[key].value < 5) {
            social[key].value++;
            remaining--;
        } else if (SOCIAL_ATTRIBUTES.every(k => !social[k] || social[k].value >= 5)) {
            break;
        }
    }

    // 2. Навыки: определяем приоритетные и исключаемые
    let prioritySkills = [...BASE_COMBAT_SKILLS];
    let excludedSkills = [];
    if (combatBias === 'tank') {
        prioritySkills.push('brawl', 'channel');
        excludedSkills = [];
    } else if (combatBias === 'physical') {
        prioritySkills.push('brawl');
        excludedSkills = ['channel']; // физик не качает специальный навык
    } else if (combatBias === 'special') {
        prioritySkills.push('channel');
        excludedSkills = ['brawl']; // специалист не качает физический навык
    }

    // Создаём список навыков, доступных для распределения
    const allSkillKeys = Object.keys(skills);
    let availableSkills = allSkillKeys.filter(skill => !excludedSkills.includes(skill));
    if (availableSkills.length === 0) availableSkills = allSkillKeys;

    // Выделяем большую часть очков навыков (70%) на приоритетные навыки
    const skillPriorityPoints = Math.floor(skillPoints * 0.7);
    let skillRemaining = skillPoints;
    let tempSkillRemaining = skillPriorityPoints;
    while (tempSkillRemaining > 0) {
        const key = getRandomArrayItem(prioritySkills.filter(skill => !excludedSkills.includes(skill) && skills[skill]));
        if (skills[key] && skills[key].value < skillMax) {
            skills[key].value++;
            tempSkillRemaining--;
            skillRemaining--;
        } else if (prioritySkills.every(k => !skills[k] || skills[k].value >= skillMax || excludedSkills.includes(k))) {
            break;
        }
    }

    // Оставшиеся очки навыков распределяем случайно по доступным навыкам
    while (skillRemaining > 0) {
        const key = getRandomArrayItem(availableSkills);
        if (skills[key] && skills[key].value < skillMax) {
            skills[key].value++;
            skillRemaining--;
        } else if (availableSkills.every(k => !skills[k] || skills[k].value >= skillMax)) {
            break;
        }
    }
}

/**
 * Генерация типа "Average" (Сбалансированный) — равномерное распределение.
 */
export function assignAverageStats(attributes, social, skills, attrPoints, socPoints, skillPoints, skillMax) {
    // Боевые атрибуты равномерно
    let remaining = attrPoints;
    let index = 0;
    while (remaining > 0) {
        const key = COMBAT_ATTRIBUTES[index % COMBAT_ATTRIBUTES.length];
        if (attributes[key] && attributes[key].value < 999) {
            attributes[key].value++;
            remaining--;
        }
        index++;
        if (index > 1000) break;
    }

    // Социальные атрибуты равномерно
    remaining = socPoints;
    index = 0;
    while (remaining > 0) {
        const key = SOCIAL_ATTRIBUTES[index % SOCIAL_ATTRIBUTES.length];
        if (social[key] && social[key].value < 5) {
            social[key].value++;
            remaining--;
        }
        index++;
        if (index > 1000) break;
    }

    // Навыки равномерно
    const skillKeys = Object.keys(skills);
    remaining = skillPoints;
    index = 0;
    while (remaining > 0) {
        const key = skillKeys[index % skillKeys.length];
        if (skills[key].value < skillMax) {
            skills[key].value++;
            remaining--;
        }
        index++;
        if (index > 1000) break;
    }
}