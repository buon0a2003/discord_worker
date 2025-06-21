function getNextLunarNewYear() {
  const currentYear = new Date().getFullYear();

  const lunarNewYearDates = {
    2024: new Date('2024-02-10'),
    2025: new Date('2025-01-29'),
    2026: new Date('2026-02-17'),
    2027: new Date('2027-02-06'),
    2028: new Date('2028-01-26'),
    2029: new Date('2029-02-13'),
    2030: new Date('2030-02-03'),
  };

  const now = new Date();

  if (lunarNewYearDates[currentYear] && now < lunarNewYearDates[currentYear]) {
    return lunarNewYearDates[currentYear];
  }

  return (
    lunarNewYearDates[currentYear + 1] || new Date(`${currentYear + 1}-02-10`)
  );
}

function getDaysUntilLunarNewYear() {
  const lunarNewYear = getNextLunarNewYear();
  const now = new Date();
  const timeDiff = lunarNewYear.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
}

function getLunarNewYearInfo() {
  const lunarNewYear = getNextLunarNewYear();
  const year = lunarNewYear.getFullYear();

  const zodiacAnimals = [
    'Chuột',
    'Trâu',
    'Hổ',
    'Mèo',
    'Rồng',
    'Rắn',
    'Ngựa',
    'Dê',
    'Khỉ',
    'Gà',
    'Chó',
    'Lợn',
  ];

  // 2020 was the Year of the Rat (index 0)
  const zodiacIndex = (year - 2020) % 12;
  const animal = zodiacAnimals[zodiacIndex];

  return { year, animal };
}

async function updateChannelName(discordToken, channelId) {
  try {
    const daysLeft = getDaysUntilLunarNewYear();
    const { animal } = getLunarNewYearInfo();

    let channelName;

    if (daysLeft <= 0) {
      channelName = `🎊 Happy Lunar New Year! 🎊`;
    } else if (daysLeft === 1) {
      channelName = `🎉 Mai là năm con ${animal}! 🎉`;
    } else {
      channelName = `🧧 ${daysLeft} day to Tết 🧧`;
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${discordToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: channelName,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Discord API error: ${response.status} ${response.statusText}`,
      );
    }

    console.log(`✅ Channel name updated: "${channelName}"`);
  } catch (error) {
    console.error('❌ Error updating channel name:', error);
  }
}

export {
  getNextLunarNewYear,
  getDaysUntilLunarNewYear,
  getLunarNewYearInfo,
  updateChannelName,
};
