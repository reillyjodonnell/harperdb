/* 
	A few notes - 
	1. This is insanely bare bones - there's no routing, no auth, no validation, no error handling, no testing, no validation. A normal production app would have all of these things and more
	2. We're not exposing the retrieval of messages via ws bc normal react apps would fetch the messages via SSR or in a loader type thing (a la remix)
	3. also we're not sending messages every time the ws connects bc ws connections drop and reconnect fairly often (wasteful)
	4. There's no auth bc this is a super simple poc - in a real app we'd derive the user id / validate using jwt or cookie
	5. I initally had a separate Chat table but decided to keep it extremely simple. The separate table would have allowed individual chat rooms on a per major city area basis. Happy to chat about how to adjust it to make that happen :D
	
*/
import { cityCoordinates } from './seed.js';
import { getNext5DayForecast, kelvinToFahrenheit } from './weather/utils.js';
import dotenv from 'dotenv';
dotenv.config();

export class User extends tables.User {
  // we can define our own custom POST handler
  post(content) {
    // do something with the incoming content;
    return super.post(content);
  }
  // or custom GET handler
  get() {
    // we can modify this resource before returning
    return super.get();
  }
}

// Todo - get autocomplete working

// In a real prod app I'd seed with a command i.e. `node seed.js` but I couldn't find out how to run a script with the harperdb environment
// i.e. harperdb run ____.js or harperdb run tsx __.ts was my intuition
export class Seed extends Resource {
  async post() {
    const doesExist = await tables.City.search({
      operation: 'sql',
      sql: 'SELECT 1 FROM * LIMIT 1',
    });

    if ([...doesExist].length) {
      throw new Error('Data already seeded');
    }

    try {
      // the type is wrong. operation does exist
      const response = await tables.City.operation({
        operation: 'insert',
        records: cityCoordinates,
      });

      await tables.User.operation({
        operation: 'insert',
        records: [
          {
            id: '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c74',
            name: 'Reilly',
            email: 'Reilly@harperdb.com',
            messages: [],
          },
          {
            id: '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c75',
            name: 'John',
            email: 'john@gmail.com',
            messages: [],
          },
          {
            id: '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c76',
            name: 'Beth',
            email: 'beth@yahoo.com',
            messages: [],
          },
        ],
      });

      // again I don't know why sql conditionals aren't working for me :/
      const users = await tables.User.search({
        operation: 'sql',
        sql: 'SELECT * FROM User',
      });

      const allUsers = [...users];

      await tables.Message.operation({
        operation: 'insert',
        records: [
          {
            content:
              'Heads up everyone! The plains is getting a lot of wind right now.',
            senderId: '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c75',
            timestamp: new Date().toISOString(),
            sender: allUsers.filter(
              (user) => user.id === '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c75'
            )[0],
          },
          {
            content:
              'Thanks for the heads up John! We have spots of rain here in the valley. Must be working our way!',
            senderId: '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c76',
            timestamp: new Date().toISOString(),
            sender: allUsers.filter(
              (user) => user.id === '9cf6450a-68b5-4afd-a31b-bfdb7f9e2c76'
            )[0],
          },
        ],
      });

      // Todo - connect the 2 generated messages to the users

      console.log('Data seeded successfully:', response);
    } catch (error) {
      console.error('Error seeding database:', error);
    }

    return {
      res: 'Data seeded successfully',
    };
  }
}

export class Weather extends Resource {
  async get(searchParams) {
    const cityParam = searchParams.get('city');
    if (!cityParam) {
      throw new Error('Missing name');
    }

    const name = decodeURIComponent(cityParam);

    try {
      const found = await tables.City.search({
        operation: 'sql',
        sql: `SELECT * FROM City WHERE name = 'San Francisco, CA'`,
      });

      // temp hack until I find out why my sql above isn't working
      const resolved = [...found].filter((city) => city.name === name)[0];

      if (!resolved) {
        throw new Error('City not found');
      }

      const next5Url = `https://api.openweathermap.org/data/2.5/forecast?lat=${resolved.lat}&lon=${resolved.lon}&appid=${process.env.WEATHER_API_KEY}`;
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${resolved.lat}&lon=${resolved.lon}&appid=${process.env.WEATHER_API_KEY}`;

      const [currentWeatherResponse, next5Response] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(next5Url),
      ]);

      const [currentWeatherJson, next5Json] = await Promise.all([
        currentWeatherResponse.json(),
        next5Response.json(),
      ]);

      const weatherData = {
        current: {
          temperature: Math.round(
            kelvinToFahrenheit(currentWeatherJson.main.temp)
          ),
          high: Math.round(
            kelvinToFahrenheit(currentWeatherJson.main.temp_max)
          ),
          low: Math.round(kelvinToFahrenheit(currentWeatherJson.main.temp_min)),
          status: currentWeatherJson.weather[0].main,
        },
        next5: getNext5DayForecast(next5Json),
      };

      return {
        res: weatherData,
      };
    } catch (err) {
      console.error('Error fetching weather:', err);
      throw new Error('Error fetching weather: ', err);
    }
  }
}

/* WS client usage example (again very barebones):

let ws = new WebSocket('ws://localhost:9926/Chat');

 ws.send(JSON.stringify({
  content: "WOW",
  senderId: "user-123" 
}))
 */

export class Chat extends Resource {
  async connect(incoming, ...rest) {
    const outgoingMessages = super.connect();

    if (incoming) {
      incoming.on('data', async (data) => {
        // really interesting... we get the raw stream when it's a raw string i.e.
        //data { contentType: 'application/octet-stream', data: <Buffer 57 4f 57> }

        // otherwise if I send a stringified obj I get what appears to be the parsed

        try {
          // the ws is sending:
          // content: content,
          // senderId: 'user-123'
          // but in a real app we'd have auth and use that id instead of allowing the client to pass whatever they want
          const newMessage = {
            ...data,
            timestamp: new Date().toISOString(),
          };

          await tables.Message.operation(
            {
              operation: 'insert',
              records: [newMessage],
            },
            false
          );

          outgoingMessages.send(newMessage);
        } catch (error) {
          console.log('error:', error);
          outgoingMessages.send(
            JSON.stringify({ type: 'error', message: error.message })
          );
        }
      });
    }
    return outgoingMessages;
  }
}
