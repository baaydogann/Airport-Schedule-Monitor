// Gerekli React hook'ları ve bileşenleri import edilir
import { useState, useEffect } from 'react';
import { Plane, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import type { FlightData } from './types';
import { fetchFlights } from './services/flightService';
import { ErrorAlert } from './components/ErrorAlert';

// Başlangıç uçuş verisi tanımlanır
const initialFlightData: FlightData = {
  arrivals: [],
  departures: [],
  lastUpdated: ''
};

function App() {
  // State tanımlamaları
  const [flightData, setFlightData] = useState<FlightData>(initialFlightData); // Uçuş verilerini tutar
  const [showDepartures, setShowDepartures] = useState(true); // Kalkış/Varış gösterim durumunu kontrol eder
  const [currentTime, setCurrentTime] = useState(''); // Güncel saati tutar
  const [isLoading, setIsLoading] = useState(true); // Yükleme durumunu kontrol eder
  const [error, setError] = useState<string | null>(null); // Hata mesajlarını tutar
  const [lastUpdate, setLastUpdate] = useState('');

  // Saat güncelleme efekti - Her saniye çalışır
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Kalkış/Varış otomatik geçiş efekti - Her 10 saniyede bir değişir
  useEffect(() => {
    const interval = setInterval(() => {
      setShowDepartures(prev => !prev);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Uçuş verilerini yükleme efekti - İlk yüklemede ve her 5 dakikada bir çalışır
  useEffect(() => {
    let mounted = true;

    const loadFlights = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const data = await fetchFlights();
        if (mounted) {
          setFlightData(data);
          setLastUpdate(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false }));
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Uçuş verileri yüklenirken bir hata oluştu.');
          setIsLoading(false);
        }
      }
    };

    loadFlights();
    const interval = setInterval(loadFlights, 300000); // 5 dakika (300000 ms)
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Uçuş durumuna göre renk belirleme fonksiyonu
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planlandı':
        return 'text-green-400';
      case 'Kapı Kapanıyor':
        return 'text-blue-400';
      case 'Uçuşta':
        return 'text-yellow-400';
      case 'Kalktı':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  };

  // Gösterilecek uçuşları belirle (kalkış veya varış)
  const currentFlights = showDepartures ? flightData.departures : flightData.arrivals;

  return (
    // Ana container - Gradient arka plan ve font ayarları
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white font-['Inter']">
      {/* Header bölümü - Logo, başlık ve saat bilgisi */}
      <header className="bg-[#1E293B]/50 backdrop-blur-lg p-8 border-b border-slate-700/50">
        <div className="flex justify-between items-center max-w-[1920px] mx-auto">
          {/* Sol taraf - Logo ve başlık */}
          <div className="flex items-center gap-6">
            <Plane className="w-14 h-14 text-blue-400" />
            <div>
              <h1 className="text-5xl font-bold tracking-tight">KONYA HAVALİMANI</h1>
              {/* Kalkış/Varış göstergesi */}
              <div className="flex items-center gap-3 text-2xl mt-3 font-medium">
                {showDepartures ? (
                  <>
                    <PlaneTakeoff className="w-6 h-6 text-blue-400" />
                    <span className="text-blue-400">KALKIŞLAR</span>
                  </>
                ) : (
                  <>
                    <PlaneLanding className="w-6 h-6 text-green-400" />
                    <span className="text-green-400">GELİŞLER</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Sağ taraf - Saat ve son güncelleme zamanı */}
          <div className="text-right">
            <div className="text-6xl font-semibold tracking-tight">{currentTime}</div>
            <div className="text-lg text-slate-400 mt-2">Son Güncelleme: {lastUpdate}</div>
          </div>
        </div>
      </header>

      {/* Hata mesajı gösterimi */}
      {error && <ErrorAlert message={error} />}

      {/* Ana içerik bölümü */}
      <div className="max-w-[1920px] mx-auto p-4">
        {/* Yükleme durumu gösterimi */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          // Uçuş tablosu
          <div className="overflow-auto rounded-xl border border-slate-700/50">
            <table className="w-full text-left">
              {/* Tablo başlığı */}
              <thead className="bg-[#1E293B]/50 backdrop-blur-lg text-4xl uppercase border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-8 font-semibold text-4xl">Tarih</th>
                  <th className="px-6 py-8 font-semibold text-4xl">Saat</th>
                  <th className="px-6 py-8 font-semibold text-4xl">Uçuş</th>
                  <th className="px-6 py-8 font-semibold text-4xl">{showDepartures ? 'Varış Noktası' : 'Kalkış Noktası'}</th>
                  <th className="px-6 py-8 font-semibold text-4xl">Havayolu</th>
                  <th className="px-6 py-8 font-semibold text-4xl">Durum</th>
                </tr>
              </thead>
              {/* Tablo içeriği - Uçuş listesi */}
              <tbody className="text-4xl divide-y-2 divide-slate-700/50">
                {currentFlights.map((flight) => (
                  <tr 
                    key={`${flight.flight}-${flight.time}`}
                    className="bg-[#1E293B]/10 backdrop-blur-sm transition-colors hover:bg-[#1E293B]/30"
                  >
                    <td className="px-6 py-8 text-slate-400">{flight.date}</td>
                    <td className="px-6 py-8 text-slate-100 font-medium">{flight.time}</td>
                    <td className="px-6 py-8 font-semibold text-sky-400">{flight.flight}</td>
                    <td className="px-6 py-8 text-slate-100">{flight.destination || flight.origin}</td>
                    <td className="px-6 py-8 text-slate-200">
                      {/* Havayolu logosu ve ismi */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://images.skyscnr.com/images/airlines/favicon/${flight.airlineId}.png`}
                          alt={flight.airline}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <span>{flight.airline}</span>
                      </div>
                    </td>
                    {/* Uçuş durumu - Duruma göre renk değişir */}
                    <td className={`px-6 py-8 font-medium ${getStatusColor(flight.status)}`}>
                      {flight.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;