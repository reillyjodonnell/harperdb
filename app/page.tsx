import { getCities, getMessages, getUser } from '@/actions';
import { Chat } from '@/chat';
import { CityDropdown } from '@/city-dropdown';
import { notFound } from 'next/navigation';
import { cn } from './lib/utils';

export default async function Page({ params }) {
  const city = encodeURIComponent('New York, NY');

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
          <WeatherIcon weather={current.status} />
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
          {fiveDayForecast.map((forecast, index) => (
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
          ))}
        </div>
      </div>

      <Chat user={user} initialMessages={messages} />
    </section>
  );
}

export function WeatherIcon({
  weather,
  className,
}: {
  weather: 'Clear' | 'Clouds' | 'fog' | 'lightning' | 'Rain' | 'Snow';
  className?: string;
}) {
  switch (weather) {
    case 'Clear': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(` text-amber-400`, className)}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    }
    case 'Clouds': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-400 ${className}`}
        >
          <path d="M17.5 21H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          <path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5" />
        </svg>
      );
    }
    case 'fog': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M16 17H7" />
          <path d="M17 21H9" />
        </svg>
      );
    }
    case 'lightning': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
          <path d="m13 12-3 5h4l-3 5" />
        </svg>
      );
    }
    case 'Rain': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-400 ${className}`}
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M16 14v6" />
          <path d="M8 14v6" />
          <path d="M12 16v6" />
        </svg>
      );
    }
    case 'Snow': {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-400 ${className}`}
        >
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M8 15h.01" />
          <path d="M8 19h.01" />
          <path d="M12 17h.01" />
          <path d="M12 21h.01" />
          <path d="M16 15h.01" />
          <path d="M16 19h.01" />
        </svg>
      );
    }
    default: {
      return null;
    }
  }
}
