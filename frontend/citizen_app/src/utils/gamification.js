// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

export const RANKS = [
  { name: 'Bronze Scavenger', minExp: 0,    multiplier: 1.0, color: '#CD7F32' },
  { name: 'Silver Sorter',    minExp: 500,  multiplier: 1.2, color: '#C0C0C0' },
  { name: 'Gold Guardian',    minExp: 1500, multiplier: 1.5, color: '#FFD700' },
  { name: 'Platinum Pioneer', minExp: 3500, multiplier: 1.8, color: '#00CED1' },
  { name: 'Diamond Defender', minExp: 7000, multiplier: 2.5, color: '#B9F2FF' },
];

export const getRank = (totalExp) => {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (totalExp >= rank.minExp) {
      currentRank = rank;
    } else {
      break;
    }
  }
  return currentRank;
};

export const getProgressToNextRank = (totalExp) => {
  let current = RANKS[0];
  let next = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (totalExp >= RANKS[i].minExp) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }

  if (!next) return { current, next: null, progressPct: 100 };

  const expInLevel = totalExp - current.minExp;
  const levelExpRequired = next.minExp - current.minExp;
  const progressPct = (expInLevel / levelExpRequired) * 100;

  return { current, next, progressPct };
};

export const calculateCredits = (wasteType, rankMultiplier) => {
  const CREDIT_TABLE = { "Organic": 10, "Paper": 15, "Plastic": 25, "Metal": 30 };
  const base = CREDIT_TABLE[wasteType] || 0;
  return Math.floor(base * rankMultiplier);
};

export const calculateImpact = (wasteHistory) => {
  const kgRecycled = wasteHistory.length * 0.2; // 0.2kg per item avg
  const waterLitres = kgRecycled * 5.0; // 5L per kg
  const treeEquiv = kgRecycled * 0.05;
  const co2Kg = kgRecycled * 2.5;
  
  return { kgRecycled, waterLitres, treeEquiv, co2Kg };
};

export const generateDailyQuests = (dateTimestamp) => {
  return [
    { id: 'q1', type: 'scan', target: 3, reward: 50, title: 'Recycle 3 Items' },
    { id: 'q2', type: 'plastic', target: 2, reward: 80, title: 'Recycle 2 Plastics' },
    { id: 'q3', type: 'map', target: 1, reward: 20, title: 'Check the Live Map' }
  ];
};

export const isQuestComplete = (quest, todayHistory) => {
  // Mock implementation
  return false;
};
