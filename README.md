# HarperDB Weather app

## How to run

1. Generate api token and place as `WEATHER_API_KEY` in `.env` [url here](https://home.openweathermap.org/)
2. have harperdb installed globally: `npm i -g harperdb`
3. install deps with `npm i`
4. Run with `npm run dev`
5. Seed with `curl -X POST http://localhost:9926/Seed -H "Content-Type: application/json"` in terminal (be sure harperdb server is running from step 3)
6. Check it out on http://localhost:3000

### How to open studio

http://localhost:9925
