'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/dropdown';
import { Button } from './components/button';
import { ChevronDown, MapPin } from 'lucide-react';
import Link from 'next/link';

// In theory since harperdb apps are a monorepo we could import types directly from the server. It would require a bit of adjustment on the server.
// see https://github.com/reillyjodonnell/partykit-e2e-typesafety for an example of how this could work
type Cities = Array<{
  id: string;
  name: string;
  lat: number;
  lon: number;
}>;

export function CityDropdown({
  selectedCity,
  cities,
}: {
  selectedCity: string;
  cities: Cities;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className=" text-slate-500 rounded-full bg-white/90 p-2 shadow-sm gap-2 flex items-center"
        >
          <MapPin className="h-4 w-4" />
          {cities.find((city) => city.name === selectedCity)?.name}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {cities.map((city) => (
          <Link href={`/cities/${encodeURIComponent(city.name)}`}>
            <DropdownMenuItem className="text-slate-500" key={city.id}>
              {city.name}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
