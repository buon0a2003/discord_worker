// UTC+7 timezone offset (Vietnam timezone)
const UTC_PLUS_7_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

function getCurrentTimeInUTCPlus7() {
  const now = new Date();
  return new Date(now.getTime() + UTC_PLUS_7_OFFSET);
}

function getDateAtMidnightUTCPlus7(date) {
  // Create a new date at midnight UTC+7 for the given date
  const utcPlus7Date = new Date(date.getTime() + UTC_PLUS_7_OFFSET);
  const year = utcPlus7Date.getUTCFullYear();
  const month = utcPlus7Date.getUTCMonth();
  const day = utcPlus7Date.getUTCDate();

  // Create midnight UTC+7 time and convert back to UTC for storage
  const midnightUTCPlus7 = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return new Date(midnightUTCPlus7.getTime() - UTC_PLUS_7_OFFSET);
}

function getNextLunarNewYear() {
  const currentTimeUTCPlus7 = getCurrentTimeInUTCPlus7();
  const currentYear = currentTimeUTCPlus7.getUTCFullYear();

  // Lunar New Year dates (these are the actual dates in UTC+7 timezone)
  const lunarNewYearDates = {
    2024: getDateAtMidnightUTCPlus7(new Date('2024-02-10T00:00:00Z')),
    2025: getDateAtMidnightUTCPlus7(new Date('2025-01-29T00:00:00Z')),
    2026: getDateAtMidnightUTCPlus7(new Date('2026-02-17T00:00:00Z')),
    2027: getDateAtMidnightUTCPlus7(new Date('2027-02-06T00:00:00Z')),
    2028: getDateAtMidnightUTCPlus7(new Date('2028-01-26T00:00:00Z')),
    2029: getDateAtMidnightUTCPlus7(new Date('2029-02-13T00:00:00Z')),
    2030: getDateAtMidnightUTCPlus7(new Date('2030-02-03T00:00:00Z')),
  };

  const nowUTC = new Date();

  if (
    lunarNewYearDates[currentYear] &&
    nowUTC < lunarNewYearDates[currentYear]
  ) {
    return lunarNewYearDates[currentYear];
  }

  return (
    lunarNewYearDates[currentYear + 1] ||
    getDateAtMidnightUTCPlus7(new Date(`${currentYear + 1}-02-10T00:00:00Z`))
  );
}

function getDaysUntilLunarNewYear() {
  const lunarNewYear = getNextLunarNewYear();
  const nowUTC = new Date();

  // Calculate the difference and round up to get full days remaining
  const timeDiff = lunarNewYear.getTime() - nowUTC.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysDiff;
}

function getLunarNewYearInfo() {
  const lunarNewYear = getNextLunarNewYear();
  const lunarNewYearUTCPlus7 = new Date(
    lunarNewYear.getTime() + UTC_PLUS_7_OFFSET,
  );
  const year = lunarNewYearUTCPlus7.getUTCFullYear();

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
    const currentTimeUTCPlus7 = getCurrentTimeInUTCPlus7();

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

    const currentTimeString =
      currentTimeUTCPlus7.toISOString().replace('T', ' ').substring(0, 19) +
      ' UTC+7';
    console.log(
      `✅ Channel name updated at ${currentTimeString}: "${channelName}" (${daysLeft} days left)`,
    );
  } catch (error) {
    console.error('❌ Error updating channel name:', error);
  }
}

export {
  getNextLunarNewYear,
  getDaysUntilLunarNewYear,
  getLunarNewYearInfo,
  updateChannelName,
  getCurrentTimeInUTCPlus7,
};
