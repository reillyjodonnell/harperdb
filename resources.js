/* 
	A few notes - 
	1. This is insanely bare bones - there's no routing, no auth, no validation, no error handling, no testing, no validation. A normal production app would have all of these things and more
	2. We're not exposing the retrieval of messages via ws bc normal react apps would fetch the messages via SSR or in a loader type thing (a la remix)
	3. also we're not sending messages every time the ws connects bc ws connections drop and reconnect fairly often (wasteful)
	4. There's no auth bc this is a super simple poc - in a real app we'd derive the user id / validate using jwt or cookie
	5. I initally had a separate Chat table but decided to keep it extremely simple. The separate table would have allowed individual chat rooms on a per major city area basis. Happy to chat about how to adjust it to make that happen :D
	
*/

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

export class Weather extends Resource {
  async get(searchParams, ...rest) {
    const id = searchParams.get('id');
    if (!id) {
      throw new Error('Missing id');
    }
    const user = await tables.User.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const weather = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${user.location}&appid=${process.env.WEATHER_API_KEY}`
    );
    const json = await weather.json();

    return { res: json };
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

          outgoingMessages.send(JSON.stringify(newMessage));
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
