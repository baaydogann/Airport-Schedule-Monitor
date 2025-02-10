import { Flight, FlightData, SkyscannerResponse } from '../types';

interface CacheItem {
  data: FlightData;
  timestamp: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 dakika
let cache: CacheItem | null = null;

const headers = new Headers({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
  "Accept": "*/*",
  "Accept-Language": "en-GB,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Referer": "https://www.skyscanner.net/flights/arrivals-departures/kya/konya-arrivals-departures",
  "Sec-GPC": "1",
  "Connection": "keep-alive",
  "Cookie": "_pxhd=M4BK3d7LnoOoLJTqCqTf16eKMgR/qFhIJpGDpclFTSTY8vA7DB0nLtJrP7ZI2equUjBemNQ842bXJabyPz6Lug==:ZkVNGwK3zxDLzM1igbeq6WYSW0ad8cr73QkXwde4JHBYgvj2862wpI5mAS04mimtjvsDEZWlbJCnmJNfnhqyrRsbRaepaIdgu-pR2LIP3Xg=",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "DNT": "1",
  "TE": "trailers"
});

const isCacheValid = (): boolean => {
  return cache !== null && Date.now() - cache.timestamp < CACHE_DURATION;
};

const getFlightStatus = (status: string): string => {
  switch (status) {
    case 'SCHEDULED':
      return 'Planlandı';
    case 'CANCELLED':
      return 'İptal';
    case 'DELAYED':
      return 'Gecikti';
    case 'IN_AIR':
      return 'Uçuşta';
    case 'LANDED':
      return 'İndi';
    default:
      return 'Planlandı';
  }
};

const formatFlightTime = (timeStr: string): { date: string; time: string } => {
  const date = new Date(timeStr);
  return {
    date: date.toLocaleDateString('tr-TR'),
    time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false })
  };
};

const formatLastUpdated = (): string => {
  return new Date().toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

const formatFlights = (flights: SkyscannerResponse['arrivals'], isDeparture: boolean = false): Flight[] => {
  if (!flights) return [];
  
  return flights
    .map(flight => {
      const { date, time } = formatFlightTime(
        isDeparture 
          ? flight.localisedScheduledDepartureTime 
          : flight.localisedScheduledArrivalTime
      );
      
      return {
        date,
        time,
        flight: flight.flightNumber,
        destination: isDeparture ? flight.arrivalAirportName : flight.departureAirportName,
        airline: flight.airlineName,
        airlineId: flight.airlineId,
        status: getFlightStatus(flight.status)
      };
    })
    .filter(flight => flight !== null) as Flight[];
};

export const fetchFlights = async (): Promise<FlightData> => {
  if (isCacheValid() && cache) {
    return cache.data;
  }

  try {
    const [arrivalsResponse, departuresResponse] = await Promise.all([
      fetch("https://www.skyscanner.net/g/arrival-departure-svc/api/airports/kya/arrivals?locale=tr-TR", {
        method: "GET",
        headers,
        redirect: "follow"
      }),
      fetch("https://www.skyscanner.net/g/arrival-departure-svc/api/airports/kya/departures?locale=tr-TR", {
        method: "GET",
        headers,
        redirect: "follow"
      })
    ]);

    const [arrivalsData, departuresData] = await Promise.all([
      arrivalsResponse.json() as Promise<SkyscannerResponse>,
      departuresResponse.json() as Promise<SkyscannerResponse>
    ]);

    const flightData: FlightData = {
      arrivals: formatFlights(arrivalsData.arrivals),
      departures: formatFlights(departuresData.departures || [], true),
      lastUpdated: formatLastUpdated()
    };

    cache = {
      data: flightData,
      timestamp: Date.now()
    };

    return flightData;
  } catch (error) {
    console.error('Uçuş verileri alınırken hata:', error);
    throw new Error('Uçuş verileri alınamadı');
  }
};