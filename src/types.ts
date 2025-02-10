export interface Flight {
  date: string;
  time: string;
  flight: string;
  destination: string;
  origin: string;
  airline: string;
  airlineId: string;
  status: string;
}

export interface FlightData {
  arrivals: Flight[];
  departures: Flight[];
  lastUpdated: string;
}

// Skyscanner API Tipleri
export interface SkyscannerFlight {
  airlineId: string;
  airlineName: string;
  arrivalAirportCode: string;
  departureAirportCode: string;
  arrivalAirportName: string;
  departureAirportName: string;
  flightNumber: string;
  scheduledArrivalTime: string;
  localisedScheduledArrivalTime: string;
  estimatedArrivalTime: string | null;
  localisedEstimatedArrivalTime: string | null;
  scheduledDepartureTime: string;
  localisedScheduledDepartureTime: string;
  estimatedDepartureTime: string | null;
  localisedEstimatedDepartureTime: string | null;
  status: string;
  statusLocalised: string | null;
  arrivalGate: string | null;
  boardingGate: string | null;
  codeShare: boolean;
}

export interface SkyscannerResponse {
  airportInfo: {
    commercial: boolean;
    iataCode: string;
    id: string;
    location: Array<{
      type: string;
      name: string;
      id: string;
    }>;
  };
  arrivals: SkyscannerFlight[];
  departures: SkyscannerFlight[] | null;
}