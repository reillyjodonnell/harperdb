export const kelvinToFahrenheit = (k) =>
  (((k - 273.15) * 9) / 5 + 32).toFixed(1);

// the weather data is in 3 hour increments spread over 5 days w/ exactly 40 data obj in the list;
export function getNext5DayForecast(data) {
  const forecast = data.list;

  const dayChunks = [];

  // split each item in the list into 8 - 3 hour chunks
  for (let i = 0; i < forecast.length; i += 8) {
    dayChunks.push(forecast.slice(i, i + 8));
  }

  // Claude came up with processing each day this way given the above data structure
  const processDay = (chunk) => {
    const highs = chunk.map((e) =>
      Math.round(kelvinToFahrenheit(e.main.temp_max))
    );
    const lows = chunk.map((e) =>
      Math.round(kelvinToFahrenheit(e.main.temp_min))
    );
    const statuses = chunk.map((e) => e.weather[0].main);
    const day = new Date(chunk[0].dt * 1000).toLocaleString('en-US', {
      weekday: 'short',
    });

    return {
      high: Math.max(...highs),
      low: Math.min(...lows),
      status: mostFrequent(statuses),
      day,
    };
  };

  return dayChunks.map(processDay);
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
