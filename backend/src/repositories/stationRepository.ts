import { Station, STATIONS } from "./dataStore.js";

export class StationRepository {
  async getAll(): Promise<Station[]> {
    return STATIONS;
  }

  async getById(id: string): Promise<Station | null> {
    const station = STATIONS.find((s) => s.id === id);
    return station || null;
  }

  async getByCity(city: string): Promise<Station[]> {
    return STATIONS.filter(
      (s) => s.city.toLowerCase() === city.toLowerCase()
    );
  }

  async addStation(station: Station): Promise<Station> {
    const existing = STATIONS.find((s) => s.id === station.id);
    if (!existing) {
      STATIONS.unshift(station);
    }
    return station;
  }
}

export const stationRepository = new StationRepository();
