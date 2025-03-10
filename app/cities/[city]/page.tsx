import { getCities, getMessages, getUser } from '@/actions';
import { Chat } from '@/chat';
import { CityDropdown } from '@/city-dropdown';
import { WeatherIcon } from '@/page';
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const { city } = params;

  const user = await getUser();
  const messages = await getMessages();
  const cities = await getCities();

  // not a fan of the extra network hop but it's to make the /Weather endpoint relevant per the exercise.
  // In a normal scenario I'd resolve the lat and long in a db call (fast) and then make the public api call instead of using the abstracted /Weather route
  const data = await fetch(`http://localhost:9926/Weather?city=${city}`);

  const parsedData = await data.json();

  if (data.status === 500 || data.status === 404) {
    notFound();
  }

  const current = parsedData.res.current;
  const fiveDayForecast = parsedData.res.next5;

  const formattedCity = decodeURIComponent(city);

  return (
    <section className="flex flex-col h-full p-4 gap-2 flex-1 min-h-0 ">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-slate-500 backdrop-blur-2xl">
          Weather Chat App
        </h2>
        <CityDropdown
          selectedCity={cities.find((city) => city.name === formattedCity).name}
          cities={cities}
        />
      </div>

      <div className="mb-8 flex justify-center items-center flex-col">
        <div className="flex items-center gap-2">
          <WeatherIcon weather="sunny" />
          <p className="text-7xl font-extralight text-slate-800">
            {current.temperature}°
          </p>
        </div>
        <p className="text-slate-600 mt-1 text-lg font-medium">
          {current.status}
        </p>
        <p className="text-slate-500 text-sm">
          H:{current.high}° L:{current.low}°
        </p>
      </div>
      <div className="mb-6 flex flex-col  bg-white/90 rounded-md shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-500">5 day forecast</p>
        </div>
        <div className="flex flex-1 px-2 py-4 gap-4 overflow-x-auto">
          {fiveDayForecast.map((forecast, index) => {
            console.log(forecast);
            return (
              <div
                key={forecast.day}
                className="flex flex-1 flex-col justify-center items-center space-y-2 min-w-[50px]"
              >
                <p className="text-sm text-slate-500">
                  {index === 0 ? 'Today' : forecast.day}
                </p>
                <WeatherIcon weather={forecast.status} className="w-6 h-6" />
                <div className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">{forecast.high}°</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-500">{forecast.low}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Chat user={user} initialMessages={messages} />
    </section>
  );
}
