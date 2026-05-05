"use client";

// Leaflet's CSS — Next.js processes these as static asset imports.
// Keeping them at module level (not inside the dynamic `await import`)
// avoids the TS "cannot find module" error during production builds.
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Pencil, Trash2 } from "lucide-react";

/**
 * Leaflet-based satellite map + polygon-drawing tool. Customer types an address,
 * we geocode via OpenStreetMap (Nominatim, free), drop a satellite tile layer
 * (Esri World Imagery, free), and let them draw polygons over driveway / beds /
 * lawn / etc. Each polygon's area in sqft is computed via the spherical excess
 * formula and bubbled up via onPolygonsChange.
 *
 * No paid APIs, no API keys.
 */

export interface MeasuredPolygon {
  id: number;
  label: string;
  /** Service slug this polygon contributes sqft toward. "" = unassigned. */
  serviceSlug: string;
  sqft: number;
}

export type MeasureLabel =
  | "House / Roof"
  | "Driveway"
  | "Sidewalk"
  | "Mulch bed"
  | "Lawn"
  | "Other";

const LABEL_OPTIONS: MeasureLabel[] = [
  "House / Roof",
  "Driveway",
  "Sidewalk",
  "Mulch bed",
  "Lawn",
  "Other",
];

interface Props {
  address: string;
  city: string;
  /** [{ slug, name }] — what the customer can tag a polygon as contributing to. */
  serviceOptions: { slug: string; name: string }[];
  onPolygonsChange: (polys: MeasuredPolygon[]) => void;
}

interface MapApi {
  L: typeof import("leaflet");
  map: import("leaflet").Map;
  drawnLayer: import("leaflet").FeatureGroup;
}

export default function PropertyMeasure({
  address,
  city,
  serviceOptions,
  onPolygonsChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<MapApi | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string>("");
  const [polys, setPolys] = useState<MeasuredPolygon[]>([]);

  // Bubble polys changes up to the parent AFTER commit (not during render).
  // Using a ref so the parent's onPolygonsChange ref doesn't churn this effect.
  const onChangeRef = useRef(onPolygonsChange);
  useEffect(() => {
    onChangeRef.current = onPolygonsChange;
  }, [onPolygonsChange]);
  useEffect(() => {
    onChangeRef.current(polys);
  }, [polys]);

  // Lazy-load Leaflet on the client (it can't SSR).
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const L = (await import("leaflet")).default ?? (await import("leaflet"));
      await import("leaflet-draw");

      if (cancelled || !containerRef.current) return;

      // Default OSM marker icons reference assets via relative paths that
      // break under a bundler — point to the CDN copies instead.
      type IconDefaultWithGetUrl = {
        prototype: { _getIconUrl?: unknown };
      };
      const iconDefault = L.Icon.Default as unknown as IconDefaultWithGetUrl;
      delete iconDefault.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([41.026, -81.731], 12); // default Wadsworth-ish

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 22,
          attribution:
            "Imagery © Esri, Maxar, Earthstar Geographics — © OpenStreetMap contributors",
        },
      ).addTo(map);

      const drawnLayer = new L.FeatureGroup();
      map.addLayer(drawnLayer);

      type DrawConstructor = new (options: unknown) => unknown;
      const ControlWithDraw = L.Control as unknown as { Draw: DrawConstructor };
      const drawControl = new ControlWithDraw.Draw({
        position: "topleft",
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: { color: "#2D7DD2", weight: 2, fillOpacity: 0.25 },
          },
          rectangle: {
            shapeOptions: { color: "#2D7DD2", weight: 2, fillOpacity: 0.25 },
          },
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: { featureGroup: drawnLayer, remove: true },
      });
      map.addControl(drawControl as import("leaflet").Control);

      let nextId = 1;

      type DrawEvent = {
        layer: import("leaflet").Layer & {
          getLatLngs?: () => unknown;
          _otrId?: number;
        };
      };

      map.on("draw:created", (e: unknown) => {
        const ev = e as DrawEvent;
        const layer = ev.layer;
        layer._otrId = nextId++;
        drawnLayer.addLayer(layer);
        const sqft = polygonAreaSqft(layer);
        setPolys((prev) => [
          ...prev,
          {
            id: layer._otrId!,
            label: defaultLabel(prev.length),
            serviceSlug: "",
            sqft,
          },
        ]);
      });

      map.on("draw:edited", (e: unknown) => {
        const ev = e as { layers: import("leaflet").FeatureGroup };
        const updates: Array<{ id: number; sqft: number }> = [];
        ev.layers.eachLayer((layer) => {
          const id = (layer as { _otrId?: number })._otrId;
          if (!id) return;
          updates.push({ id, sqft: polygonAreaSqft(layer) });
        });
        if (updates.length === 0) return;
        setPolys((prev) =>
          prev.map((p) => {
            const u = updates.find((x) => x.id === p.id);
            return u ? { ...p, sqft: u.sqft } : p;
          }),
        );
      });

      map.on("draw:deleted", (e: unknown) => {
        const ev = e as { layers: import("leaflet").FeatureGroup };
        const removed = new Set<number>();
        ev.layers.eachLayer((layer) => {
          const id = (layer as { _otrId?: number })._otrId;
          if (id) removed.add(id);
        });
        setPolys((prev) => prev.filter((p) => !removed.has(p.id)));
      });

      apiRef.current = { L, map, drawnLayer };
      setReady(true);
    }
    init();
    return () => {
      cancelled = true;
      apiRef.current?.map.remove();
      apiRef.current = null;
    };
    // onPolygonsChange is bubbled via the dedicated effect above; this init
    // only needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookupAddress() {
    const full = [address, city].filter((s) => s.trim()).join(", ");
    if (!full) {
      setGeoError("Type the address first.");
      return;
    }
    setLoading(true);
    setGeoError("");
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", full);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "us");
      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "en-US" },
      });
      if (!res.ok) throw new Error(`Geocode ${res.status}`);
      const arr = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      if (arr.length === 0) {
        setGeoError(
          "Couldn't find that exact address. Try a nearby cross-street.",
        );
        return;
      }
      const lat = Number(arr[0].lat);
      const lon = Number(arr[0].lon);
      const api = apiRef.current;
      if (!api) return;
      api.map.setView([lat, lon], 20);
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  function updatePoly(id: number, patch: Partial<MeasuredPolygon>) {
    setPolys((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function deletePoly(id: number) {
    const api = apiRef.current;
    if (api) {
      api.drawnLayer.eachLayer((layer) => {
        if ((layer as { _otrId?: number })._otrId === id) {
          api.drawnLayer.removeLayer(layer);
        }
      });
    }
    setPolys((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 text-xs text-otr-stone/65">
          Drop a satellite view of your property and trace polygons over what
          you want serviced. We'll measure each polygon in square feet.
        </div>
        <button
          type="button"
          onClick={lookupAddress}
          disabled={loading || !ready}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-otr-blue px-5 py-2.5 text-sm font-semibold text-otr-stone transition-all hover:bg-otr-blue-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <MapPin size={14} />
          )}
          Show my address
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-otr-slate/60"
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-otr-stone/55">
            <Loader2 size={14} className="mr-2 animate-spin" />
            Loading map…
          </div>
        )}
      </div>

      {geoError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          {geoError}
        </div>
      )}

      {polys.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-otr-slate/30 p-3 text-xs text-otr-stone/55">
          <Pencil size={12} />
          Use the polygon or rectangle tool on the top-left of the map to outline
          driveway / mulch beds / lawn / etc.
        </div>
      ) : (
        <div className="space-y-2">
          {polys.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-white/5 bg-otr-slate/40 p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center"
            >
              <select
                value={p.label}
                onChange={(e) => updatePoly(p.id, { label: e.target.value })}
                className="rounded-lg border border-white/10 bg-otr-ink px-3 py-2 text-xs text-otr-stone focus:border-otr-blue-bright focus:outline-none"
              >
                {LABEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                value={p.serviceSlug}
                onChange={(e) =>
                  updatePoly(p.id, { serviceSlug: e.target.value })
                }
                className="rounded-lg border border-white/10 bg-otr-ink px-3 py-2 text-xs text-otr-stone focus:border-otr-blue-bright focus:outline-none"
              >
                <option value="">Apply to which service?</option>
                {serviceOptions.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="rounded-md bg-otr-ink px-2.5 py-1 text-center text-xs font-semibold text-otr-sky">
                {Math.round(p.sqft).toLocaleString()} sqft
              </span>
              <button
                type="button"
                onClick={() => deletePoly(p.id)}
                className="inline-flex items-center justify-center rounded-md border border-white/5 p-2 text-otr-stone/55 hover:bg-white/5 hover:text-red-300"
                aria-label="Delete polygon"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function defaultLabel(idx: number): MeasureLabel {
  const order: MeasureLabel[] = [
    "House / Roof",
    "Driveway",
    "Mulch bed",
    "Lawn",
    "Sidewalk",
    "Other",
  ];
  return order[idx] ?? "Other";
}

/**
 * Compute polygon area in square feet using the spherical excess (geodesic)
 * formula. Accurate within < 0.5 % for typical residential property scales.
 */
function polygonAreaSqft(layer: import("leaflet").Layer): number {
  const withLatLngs = layer as { getLatLngs?: () => unknown };
  const raw = withLatLngs.getLatLngs?.();
  if (!raw) return 0;

  // For polygons, getLatLngs() returns LatLng[][] (rings); for rectangles,
  // also LatLng[][]. Take the outer ring.
  const outer = (Array.isArray(raw) && Array.isArray(raw[0])
    ? raw[0]
    : raw) as Array<{ lat: number; lng: number }>;
  if (!outer || outer.length < 3) return 0;

  const m2 = geodesicAreaM2(outer);
  return m2 * 10.7639; // m² → sqft
}

function geodesicAreaM2(latlngs: Array<{ lat: number; lng: number }>): number {
  // Adapted from Leaflet's GeometryUtil. Earth radius in meters.
  const R = 6378137;
  const d2r = Math.PI / 180;
  let area = 0;
  const len = latlngs.length;
  if (len < 3) return 0;
  for (let i = 0, j = len - 1; i < len; j = i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[j];
    area +=
      (p2.lng - p1.lng) *
      d2r *
      (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
  }
  return Math.abs((area * R * R) / 2);
}
