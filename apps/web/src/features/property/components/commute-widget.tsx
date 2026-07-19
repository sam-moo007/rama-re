"use client";

import React, { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CommuteMode = "driving" | "walking" | "cycling";

interface CommuteResult {
  durationMinutes: number;
  distanceKm: number;
  mode: CommuteMode;
}

export function CommuteWidget({ propertyAddress }: { propertyAddress?: string }) {
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [mode, setMode] = useState<CommuteMode>("driving");
  const [departureTime, setDepartureTime] = useState("");
  const [result, setResult] = useState<CommuteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const calculateCommute = () => {
    if (!destination.trim()) return;
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/commute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            origin: propertyAddress ?? "Dubai Marina, Dubai, UAE",
            destination: destination.trim(),
            stops: stops.filter(Boolean),
            mode,
            departureTime: departureTime || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 422) {
            setError("commute-no-route");
          } else if (res.status === 400) {
            setError("commute-invalid-address");
          } else {
            setError("commute-error");
          }
          console.error("Commute API error", data);
          return;
        }

        const data = await res.json();
        setResult({
          durationMinutes: Math.round((data.durationSeconds ?? 0) / 60),
          distanceKm: Math.round(((data.distanceMeters ?? 0) / 1000) * 10) / 10,
          mode,
        });
      } catch {
        setError("commute-error");
      }
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartureTime(e.target.value);
  };

  const addStop = () => {
    if (stops.length < 5) setStops([...stops, ""]);
  };

  const updateStop = (index: number, value: string) => {
    const updated = [...stops];
    updated[index] = value;
    setStops(updated);
  };

  const modeLabel: Record<CommuteMode, string> = {
    driving: "Driving",
    walking: "Walking",
    cycling: "Cycling",
  };

  return (
    <Card className="commute-widget p-4 flex flex-col gap-4 mt-4 mb-4">
      <h3 className="font-bold">Commute Routing Estimation</h3>

      {/* Transport mode selector */}
      <div className="flex gap-2" role="group" aria-label="Transport mode">
        {(["driving", "walking", "cycling"] as CommuteMode[]).map((m) => (
          <Button
            key={m}
            aria-label={modeLabel[m]}
            aria-pressed={mode === m}
            variant={mode === m ? "default" : "outline"}
            onClick={() => setMode(m)}
          >
            {modeLabel[m]}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label>
          Destination
          <Input
            name="commute-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Dubai International Airport"
          />
        </label>

        {stops.map((stop, i) => (
          <Input
            key={i}
            name={`commute-stop-${i}`}
            value={stop}
            onChange={(e) => updateStop(i, e.target.value)}
            placeholder={`Via stop ${i + 1}`}
          />
        ))}

        <Button
          aria-label="Add Stop"
          onClick={addStop}
          disabled={stops.length >= 5}
          variant="outline"
        >
          + Add stop
        </Button>

        <label>
          Departure Time
          <select
            name="departure-time"
            value={departureTime}
            onChange={handleTimeChange}
            className="border p-1 ml-2"
          >
            <option value="">Now</option>
            <option value="08:00">08:00 AM</option>
            <option value="09:00">09:00 AM</option>
            <option value="17:00">05:00 PM</option>
            <option value="18:00">06:00 PM</option>
          </select>
        </label>

        <Button
          aria-label="Calculate Commute"
          onClick={calculateCommute}
          disabled={isPending || !destination.trim()}
        >
          {isPending ? "Calculating…" : "Calculate"}
        </Button>
      </div>

      {/* Results */}
      <div className="results mt-2">
        {result && (
          <>
            <div className="commute-time font-bold text-lg">
              {result.durationMinutes} mins
            </div>
            <div className="commute-distance text-sm text-muted-foreground">
              {result.distanceKm} km · {modeLabel[result.mode]}
            </div>
            <div className="commute-destination-label text-sm mt-1">
              To: {destination}
            </div>
            {/* Google Maps Embed or Dummy */}
            <div className="commute-map-route mt-2 rounded overflow-hidden border border-border">
              {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                <iframe
                  title="Google Maps Route"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(propertyAddress ?? "Dubai Marina, Dubai, UAE")}&destination=${encodeURIComponent(destination)}&mode=${mode === 'driving' ? 'driving' : mode === 'walking' ? 'walking' : 'bicycling'}`}
                />
              ) : (
                <iframe
                  title="Dubai area map dummy"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  srcDoc={`<html><body style="margin:0;padding:0;background:linear-gradient(135deg,#1e3a5f,#0f2027);display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#94a3b8;flex-direction:column;gap:8px"><div style="font-size:1.5rem">📍</div><div>${result.durationMinutes} min · ${result.distanceKm} km</div><div style="font-size:0.75rem;opacity:0.6">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to see live map</div></body></html>`}
                />
              )}
            </div>
          </>
        )}

        {error === "commute-error" && (
          <div className="commute-error text-red-500">Could not calculate route. Please try again.</div>
        )}
        {error === "commute-no-route" && (
          <div className="commute-no-route text-red-500">No route found for this destination.</div>
        )}
        {error === "commute-invalid-address" && (
          <div className="commute-invalid-address text-red-500">Invalid or unrecognised address.</div>
        )}
      </div>
    </Card>
  );
}
