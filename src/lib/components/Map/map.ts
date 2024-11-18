import maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import mapStyle from '../../assets/styles.json';
import { Protocol, PMTiles } from 'pmtiles';
import pois from '../../data/pois.json';
import { MarkerPill } from './marker';
import { writable } from 'svelte/store';
import chroma from 'chroma-js';

// Constants moved to top and grouped
const MAP_CONSTANTS = {
  DARKEST_FLOOD_COLOR: '#519EA2',
  PMTILES_URL: 'tiles.pmtiles',
  CONFIG: {
    center: [77.5777, 12.9776] as [number, number],
    maxZoom: 15,
    hash: true,
    minZoom: 12,
    pitch: 45,
    antialias: true,
    zoom: 12.7,
    maxBounds: [
      [77.199861111, 12.600138889],
      [77.899861111, 13.400138889]
    ] as [[number, number], [number, number]]
  }
} as const;

export const generateFloodColors = () => {
  const scale = chroma
    .scale(['#abced0', MAP_CONSTANTS.DARKEST_FLOOD_COLOR])
    .mode('lab')
    .colors(4);

  return {
    colors: scale,
    stops: [3, 4, 5]
  };
};

const initializePMTiles = () => {
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  const p = new PMTiles(MAP_CONSTANTS.PMTILES_URL);
  protocol.add(p);
  return p;
};

const pmTiles = initializePMTiles();

type POIFeature = (typeof pois.features)[0];
type Marker = { name: string; coordinates: [number, number] };

export const selectedPOI = writable<string | null>(null);

export default class Map {
  private map?: maplibregl.Map;
  private markers: Marker[] = [];

  private initializeLayers(): void {
    if (!this.map) return;

    this.map.addSource('pmtiles-source', {
      type: 'vector',
      url: `pmtiles://${MAP_CONSTANTS.PMTILES_URL}`,
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
    });

    this.map.addLayer(
      {
        id: 'pmtiles-layer',
        type: 'fill',
        source: 'pmtiles-source',
        'source-layer': 'stream_influence_water_difference',

        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'VALUE'],
            2,
            '#C4CDD020',
            3,
            '#abced0',
            4,
            '#519ea2'
          ],
          'fill-opacity': 0.8
        }
      },
      'landcover_grass'
    );
  }

  private setupEventListeners(): void {
    if (!this.map) return;

    this.map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    this.map.on('click', () => selectedPOI.set(null));

    selectedPOI.subscribe(poi => {
      if (poi && this.map) {
        const marker = this.markers.find(m => m.name === poi);
        if (marker) {
          this.map.flyTo({
            center: marker.coordinates,
            zoom: 14,
            duration: 2000
          });
        }
      }
    });
  }

  private createMarker(feature: POIFeature): void {
    if (!this.map) return;

    const coordinates = feature.geometry.coordinates as [number, number];
    const name = feature.properties.name;
    this.markers.push({ name, coordinates });

    const markerPill = new MarkerPill(this.map);
    const markerEl = markerPill.onAdd();

    markerEl.addEventListener('click', e => {
      e.stopPropagation();
      selectedPOI.set(name);
    });

    new maplibregl.Marker({
      element: markerEl,
      anchor: 'left',
      offset: [0, -10],
      clickTolerance: 10,
      pitchAlignment: 'viewport',
      rotationAlignment: 'viewport'
    })
      .setLngLat(coordinates)
      .addTo(this.map);

    markerPill.render(name);
  }

  private initializeMarkers(): void {
    const uniquePOIs = pois.features.reduce((acc: POIFeature[], current) => {
      const index = acc.findIndex(
        item => item.properties.name === current.properties.name
      );
      if (index === -1) {
        acc.push(current);
      } else if (
        parseInt(current.properties.date) > parseInt(acc[index].properties.date)
      ) {
        acc[index] = current;
      }
      return acc;
    }, []);

    uniquePOIs.forEach(feature => this.createMarker(feature));
  }

  private addBlinkingCircle(coordinates: [number, number]): void {
    if (!this.map) return;

    // Add a source for the pulsating circle
    this.map.addSource('pulse-point', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: {}
      }
    });

    // Add two layers - one for the pulse effect and one for the solid center
    this.map.addLayer({
      id: 'pulse-point-outer',
      type: 'circle',
      source: 'pulse-point',
      paint: {
        'circle-radius': 15,
        'circle-color': MAP_CONSTANTS.DARKEST_FLOOD_COLOR,
        'circle-opacity': 0.2
      }
    });

    this.map.addLayer({
      id: 'pulse-point-inner',
      type: 'circle',
      source: 'pulse-point',
      paint: {
        'circle-radius': 8,
        'circle-color': MAP_CONSTANTS.DARKEST_FLOOD_COLOR,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Animation variables
    const duration = 3000;
    const startTime = performance.now();
    const maxRadius = 30;
    const minRadius = 15;

    // Animation function
    const animate = (currentTime: number) => {
      if (!this.map) return;

      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;

      // Calculate current radius using sine wave
      const radiusOffset = (maxRadius - minRadius) / 2;
      const baseRadius = minRadius + radiusOffset;
      const currentRadius =
        baseRadius + radiusOffset * Math.sin(progress * Math.PI * 6);

      this.map.setPaintProperty(
        'pulse-point-outer',
        'circle-radius',
        currentRadius
      );

      // Continue animation if within duration
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        // Clean up layers and source after animation
        if (this.map.getLayer('pulse-point-outer')) {
          this.map.removeLayer('pulse-point-outer');
        }
        if (this.map.getLayer('pulse-point-inner')) {
          this.map.removeLayer('pulse-point-inner');
        }
        if (this.map.getSource('pulse-point')) {
          this.map.removeSource('pulse-point');
        }
      }
    };

    // Start animation
    requestAnimationFrame(animate);
  }

  init(container: string | HTMLElement): void {
    pmTiles.getHeader().then(() => {
      this.map = new maplibregl.Map({
        container,
        style: mapStyle as StyleSpecification,
        ...MAP_CONSTANTS.CONFIG
      });

      this.map.on('load', () => {
        this.initializeLayers();
        this.setupEventListeners();
        this.initializeMarkers();
      });
    });
  }

  cleanup() {
    if (this.map) {
      this.map.remove();
    }
  }

  setLayerOpacity(opacity: number): void {
    if (this.map) {
      this.map.setPaintProperty('pmtiles-layer', 'fill-opacity', opacity);
    }
  }

  locate(): Promise<{ type: 'success' | 'error'; message?: string }> {
    if (!this.map) {
      return Promise.resolve({ type: 'error', message: 'Map not initialized' });
    }

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<{ type: 'error'; message: string }>(
      resolve => {
        setTimeout(() => {
          resolve({
            type: 'error',
            message: 'Location request timed out. Please try again.'
          });
        }, 5000);
      }
    );

    const locationPromise = new Promise<{
      type: 'success' | 'error';
      message?: string;
    }>(resolve => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { longitude, latitude } = position.coords;
            const coordinates: [number, number] = [longitude, latitude];

            if (
              longitude >= MAP_CONSTANTS.CONFIG.maxBounds[0][0] &&
              longitude <= MAP_CONSTANTS.CONFIG.maxBounds[1][0] &&
              latitude >= MAP_CONSTANTS.CONFIG.maxBounds[0][1] &&
              latitude <= MAP_CONSTANTS.CONFIG.maxBounds[1][1]
            ) {
              this.map?.flyTo({
                center: coordinates,
                zoom: 15,
                pitch: 0,
                duration: 2000
              });
              this.addBlinkingCircle(coordinates);
              resolve({ type: 'success' });
            } else {
              resolve({
                type: 'error',
                message: `We couldn't locate you, you seem to be outside the map bounds of Bangalore. Bet the traffic is better.`
              });
            }
          },
          error => {
            console.error('Error getting location:', error);
            resolve({
              type: 'error',
              message:
                'Unable to get your location. Please check your browser permissions.'
            });
          },
          // Add options object with timeout
          {
            enableHighAccuracy: true,
            timeout: 8000, // 8 second timeout
            maximumAge: 0
          }
        );
      } else {
        resolve({
          type: 'error',
          message: 'Geolocation is not supported by your browser'
        });
      }
    });

    // Race between timeout and location request
    return Promise.race([locationPromise, timeoutPromise]);
  }
}
