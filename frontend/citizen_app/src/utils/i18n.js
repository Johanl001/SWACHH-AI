// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

const translations = {
  en: {
    welcome: "Welcome back",
    credits: "Green Credits",
    rank: "Current Rank",
    quests: "Daily Quests",
    map: "Live Map",
    redeem: "Redemption Store",
    history: "My History",
    profile: "My Profile",
    organic: "Organic",
    paper: "Paper",
    plastic: "Plastic",
    metal: "Metal",
    binFull: "Bin Full",
    binOk: "Available",
    navigateToBin: "Navigate",
    reportProblem: "Report Problem",
    confirmRedeem: "Confirm Redemption",
    insufficientCredits: "Insufficient Credits",
    logout: "Log Out"
  },
  hi: {
    welcome: "वापसी पर स्वागत है",
    credits: "ग्रीन क्रेडिट्स",
    rank: "वर्तमान रैंक",
    quests: "दैनिक कार्य",
    map: "लाइव मैप",
    redeem: "रिडेम्पशन स्टोर",
    history: "मेरा इतिहास",
    profile: "मेरी प्रोफ़ाइल",
    organic: "जैविक",
    paper: "कागज़",
    plastic: "प्लास्टिक",
    metal: "धातु",
    binFull: "डिब्बा भर गया",
    binOk: "उपलब्ध",
    navigateToBin: "रास्ता दिखाएं",
    reportProblem: "समस्या रिपोर्ट करें",
    confirmRedeem: "रिडेम्पशन की पुष्टि करें",
    insufficientCredits: "अपर्याप्त क्रेडिट्स",
    logout: "लॉग आउट"
  },
  mr: {
    welcome: "परत आल्याबद्दल स्वागत",
    credits: "ग्रीन क्रेडिट्स",
    rank: "सध्याची रँक",
    quests: "दैनंदिन कामे",
    map: "लाइव्ह नकाशा",
    redeem: "रिडेम्प्शन स्टोअर",
    history: "माझा इतिहास",
    profile: "माझी प्रोफाइल",
    organic: "सेंद्रिय",
    paper: "कागद",
    plastic: "प्लास्टिक",
    metal: "धातू",
    binFull: "कचराकुंडी भरली",
    binOk: "उपलब्ध",
    navigateToBin: "मार्गस्थ करा",
    reportProblem: "समस्या नोंदवा",
    confirmRedeem: "रिडेम्प्शनची पुष्टी करा",
    insufficientCredits: "अपुरे क्रेडिट्स",
    logout: "लॉग आउट"
  }
};

export const t = (key, language = 'en') => {
  return translations[language][key] || key;
};
