import { NextRequest, NextResponse } from "next/server";
import { Client, TravelMode as GoogleTravelMode } from "@googlemaps/google-maps-services-js";

// ── Types ────────────────────────────────────────────────────────────────────

type TravelMode = "driving" | "transit" | "walking" | "bicycling" | "cycling";

interface CommuteRequest {
  origin: string;
  destination: string;
  mode?: TravelMode;
  /** ISO 8601 datetime string, e.g. "2026-07-18T07:30:00" */
  departureTime?: string;
  waypoints?: string[];
}

interface CommuteResult {
  durationText: string;
  durationSeconds: number;
  distanceText: string;
  distanceMeters: number;
  status: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGoogleTravelMode(mode: TravelMode): GoogleTravelMode {
  switch (mode) {
    case "driving": return GoogleTravelMode.driving;
    case "transit": return GoogleTravelMode.transit;
    case "walking": return GoogleTravelMode.walking;
    case "bicycling": 
    case "cycling": return GoogleTravelMode.bicycling;
    default: return GoogleTravelMode.driving;
  }
}

const client = new Client({});

// ── Route Handler ─────────────────────────────────────────────────────────────

/**
 * POST /api/commute
 *
 * Server-side proxy for the Google Maps Directions API.
 * The API key is read from GOOGLE_MAPS_API_KEY — never sent to the browser.
 *
 * When GOOGLE_MAPS_API_KEY is not set, returns a mock response so the
 * CommuteWidget degrades gracefully in local dev without a key.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as CommuteRequest;
  const { origin, destination, mode = "driving", departureTime, waypoints = [] } = body;

  if (!origin || !destination) {
    return NextResponse.json({ error: "origin and destination are required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // ── No API key: return a deterministic mock so dev still works ──────────────
  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API key is not configured" }, { status: 503 });
  }

  // ── Google Maps Directions API ──────────────────────────────────────────────
  try {
    let departureTimeDate: Date | undefined;
    if (departureTime) {
      departureTimeDate = new Date(departureTime);
    } else {
      departureTimeDate = new Date(); // default to now for traffic estimation
    }

    const response = await client.directions({
      params: {
        origin,
        destination,
        mode: getGoogleTravelMode(mode),
        departure_time: departureTimeDate,
        waypoints,
        key: apiKey,
      },
    });

    if (response.data.status !== "OK" || !response.data.routes || !response.data.routes[0]) {
      return NextResponse.json({
        durationText: "",
        durationSeconds: 0,
        distanceText: "",
        distanceMeters: 0,
        status: response.data.status,
      } as CommuteResult);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0]; // Assuming no waypoints for simplicity of the main summary

    if (!leg) {
      return NextResponse.json({
        durationText: "",
        durationSeconds: 0,
        distanceText: "",
        distanceMeters: 0,
        status: "ZERO_RESULTS",
      } as CommuteResult);
    }

    // If departure time is specified, prefer duration_in_traffic
    const duration = leg.duration_in_traffic || leg.duration;

    const result: CommuteResult = {
      durationText: duration.text,
      durationSeconds: duration.value,
      distanceText: leg.distance.text,
      distanceMeters: leg.distance.value,
      status: "OK",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Google Maps API error:", error);
    return NextResponse.json({ error: "Failed to reach Google Maps API" }, { status: 503 });
  }
}
