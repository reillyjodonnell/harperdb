export const kelvinToFahrenheit = (k) =>
  (((k - 273.15) * 9) / 5 + 32).toFixed(1);

// the weather data is in 3 hour increments spread over 5 days w/ exactly 40 data obj in the list;
// beginning with 3 hours after the api is called
export function getNext5DayForecast(data) {
  const forecast = data.list;

  const dayChunks = {};

  forecast.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const day = date.toLocaleDateString('en-US', {
      weekday: 'short',
    });

    if (!dayChunks[day]) {
      dayChunks[day] = [];
    }

    dayChunks[day].push(entry);
  });

  // Claude came up with processing each day this way given the above data structure
  const processDay = ([day, chunk]) => {
    const highs = chunk.map((e) =>
      Math.round(kelvinToFahrenheit(e.main.temp_max))
    );
    const lows = chunk.map((e) =>
      Math.round(kelvinToFahrenheit(e.main.temp_min))
    );
    const statuses = chunk.map((e) => e.weather[0].main);

    return {
      high: Math.max(...highs),
      low: Math.min(...lows),
      status: mostFrequent(statuses),
      day,
    };
  };

  return Object.entries(dayChunks).map(processDay).slice(0, 5);
}

export function mostFrequent(arr) {
  const countMap = {};

  arr.forEach((item) => {
    if (countMap[item]) {
      countMap[item]++;
    } else {
      countMap[item] = 1;
    }
  });

  let max = 0;
  let mostFrequent = null;

  for (let key in countMap) {
    if (countMap[key] > max) {
      max = countMap[key];
      mostFrequent = key;
    }
  }

  return mostFrequent;
}
