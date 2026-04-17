import { WarRoomData, defaultWarRoomData } from "./types";

const WAR_ROOM_KEY = "trh_warroom_v1";

export function saveWarRoomData(data: WarRoomData): void {
  if (typeof window === "undefined") return;
  try {
    const payload = { ...data, lastUpdated: new Date().toISOString() };
    localStorage.setItem(WAR_ROOM_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("War room save failed:", e);
  }
}

export function loadWarRoomData(): WarRoomData {
  if (typeof window === "undefined") return defaultWarRoomData;
  try {
    const stored = localStorage.getItem(WAR_ROOM_KEY);
    if (!stored) return defaultWarRoomData;
    const parsed = JSON.parse(stored) as Partial<WarRoomData>;
    return {
      ...defaultWarRoomData,
      ...parsed,
      scorecards: { ...defaultWarRoomData.scorecards, ...(parsed.scorecards || {}) },
      opponentMoves: parsed.opponentMoves || [],
      narrativeThreats: parsed.narrativeThreats || [],
      dailySnapshots: parsed.dailySnapshots || [],
    };
  } catch (e) {
    console.error("War room load failed:", e);
    return defaultWarRoomData;
  }
}

export function clearWarRoomData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WAR_ROOM_KEY);
}
