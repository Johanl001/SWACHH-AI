/**
 * SWACHH-AI — Gamification Logic & Utilities
 * ============================================
 *
 * Rank System:
 *   Bronze Scavenger  →  0 credits
 *   Silver Sorter     →  500 credits
 *   Gold Guardian     →  2000 credits
 *   Platinum Protector → 5000 credits
 *   Diamond Champion  →  10000 credits
 *
 * Impact Conversions (approximate):
 *   1 kg recycled waste ≈ 50 liters of water saved
 *   20 kg recycled waste ≈ 1 tree equivalent
 *   1 kg waste diverted from landfill ≈ 2.5 kg CO₂ prevented
 */

// ── Rank Definitions ──────────────────────────────────────────
export const RANKS = [
    {
        level: 1,
        nameKey: 'rank_bronze',
        name: 'Bronze Scavenger',
        emoji: '🥉',
        minCredits: 0,
        color: '#CD7F32',
    },
    {
        level: 2,
        nameKey: 'rank_silver',
        name: 'Silver Sorter',
        emoji: '🥈',
        minCredits: 500,
        color: '#C0C0C0',
    },
    {
        level: 3,
        nameKey: 'rank_gold',
        name: 'Gold Guardian',
        emoji: '🥇',
        minCredits: 2000,
        color: '#FFD700',
    },
    {
        level: 4,
        nameKey: 'rank_platinum',
        name: 'Platinum Protector',
        emoji: '💎',
        minCredits: 5000,
        color: '#E5E4E2',
    },
    {
        level: 5,
        nameKey: 'rank_diamond',
        name: 'Diamond Champion',
        emoji: '👑',
        minCredits: 10000,
        color: '#B9F2FF',
    },
];

/**
 * Get user's current rank based on total credits.
 */
export const getUserRank = (totalCredits) => {
    let currentRank = RANKS[0];
    for (const rank of RANKS) {
        if (totalCredits >= rank.minCredits) {
            currentRank = rank;
        }
    }
    return currentRank;
};

/**
 * Get progress toward next rank.
 * Returns { current, needed, percentage, nextRank }
 */
export const getProgressToNextRank = (totalCredits) => {
    const currentRank = getUserRank(totalCredits);
    const currentIdx = RANKS.indexOf(currentRank);
    const nextRank = RANKS[currentIdx + 1] || null;

    if (!nextRank) {
        // Max rank reached
        return {
            current: totalCredits,
            needed: totalCredits,
            percentage: 100,
            nextRank: null,
        };
    }

    const rangeStart = currentRank.minCredits;
    const rangeEnd = nextRank.minCredits;
    const progress = totalCredits - rangeStart;
    const total = rangeEnd - rangeStart;

    return {
        current: progress,
        needed: total,
        percentage: Math.min((progress / total) * 100, 100),
        nextRank,
    };
};

// ── Impact Conversion Functions ───────────────────────────────

/**
 * Convert kg of recycled waste to liters of water saved.
 * Approximate: 1 kg ≈ 50 liters water saved through recycling.
 */
export const kgToWaterSaved = (kgWaste) => {
    return kgWaste * 50;
};

/**
 * Convert kg of recycled waste to trees-planted equivalent.
 * Approximate: 20 kg ≈ 1 tree equivalent (carbon sequestration).
 */
export const kgToTreesPlanted = (kgWaste) => {
    return kgWaste / 20;
};

/**
 * Convert kg of waste diverted from landfill to CO₂ prevented.
 * Approximate: 1 kg waste ≈ 2.5 kg CO₂ prevented.
 */
export const kgToCO2Saved = (kgWaste) => {
    return kgWaste * 2.5;
};

// ── Daily Quest Generation ────────────────────────────────────

/**
 * Generate daily quests based on user level.
 * Higher levels get harder quests with better rewards.
 */
export const generateDailyQuests = (userLevel = 1) => {
    const baseQuests = [
        {
            type: 'dispose_plastic',
            titleKey: 'quest_plastic_title',
            descKey: 'quest_plastic_desc',
            baseTarget: 3,
            baseReward: 50,
            icon: '♻️',
        },
        {
            type: 'dispose_organic',
            titleKey: 'quest_organic_title',
            descKey: 'quest_organic_desc',
            baseTarget: 5,
            baseReward: 30,
            icon: '🌱',
        },
        {
            type: 'streak',
            titleKey: 'quest_streak_title',
            descKey: 'quest_streak_desc',
            baseTarget: 7,
            baseReward: 100,
            icon: '🔥',
        },
        {
            type: 'dispose_metal',
            titleKey: 'quest_metal_title',
            descKey: 'quest_metal_desc',
            baseTarget: 2,
            baseReward: 60,
            icon: '🔩',
        },
        {
            type: 'total_items',
            titleKey: 'quest_total_title',
            descKey: 'quest_total_desc',
            baseTarget: 10,
            baseReward: 75,
            icon: '🎯',
        },
    ];

    // Scale difficulty with level
    const levelMultiplier = 1 + (userLevel - 1) * 0.1;

    // Pick 3 random quests per day
    const shuffled = baseQuests.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    return selected.map((quest, idx) => ({
        id: `quest_${Date.now()}_${idx}`,
        title: quest.titleKey,
        description: quest.descKey,
        target: Math.ceil(quest.baseTarget * levelMultiplier),
        reward: Math.round(quest.baseReward * levelMultiplier),
        progress: 0,
        icon: quest.icon,
        type: quest.type,
    }));
};

// ── Streak & Bonus Logic ──────────────────────────────────────

/**
 * Calculate streak bonus multiplier.
 */
export const getStreakMultiplier = (streakDays) => {
    if (streakDays >= 30) return 2.0;  // 2× credits
    if (streakDays >= 14) return 1.5;  // 1.5× credits
    if (streakDays >= 7) return 1.25;  // 1.25× credits
    if (streakDays >= 3) return 1.1;   // 1.1× credits
    return 1.0;
};
