export const getMapRiskZones = async (req, res) => {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "zone-uttarakhand",
          state: "Uttarakhand",
          capital: "Dehradun",
          name: "Garhwal Himalayan Cloudburst High Danger Zone",
          hazard: "Cloudburst",
          severity: "CRITICAL",
          iwv: 64.2,
          ctt: 204.1,
          cape: 3840,
          riskScore: 96,
          color: "#ef4444"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[78.20, 30.10], [79.60, 30.10], [79.80, 31.40], [78.10, 31.30], [78.20, 30.10]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-sikkim",
          state: "Sikkim",
          capital: "Gangtok",
          name: "Teesta Basin Flash Flood & Glacial Outburst Contour",
          hazard: "Flash Flood",
          severity: "CRITICAL",
          iwv: 61.5,
          ctt: 209.8,
          cape: 3100,
          riskScore: 91,
          color: "#ff6b35"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[88.10, 27.20], [88.90, 27.20], [88.85, 28.10], [88.05, 28.00], [88.10, 27.20]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-himachal",
          state: "Himachal Pradesh",
          capital: "Shimla",
          name: "Kullu-Beas Convective Hailstorm Cell",
          hazard: "Hailstorm",
          severity: "WARNING",
          iwv: 53.8,
          ctt: 216.0,
          cape: 2950,
          riskScore: 78,
          color: "#f59e0b"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[76.40, 31.20], [77.90, 31.20], [78.10, 32.70], [76.20, 32.50], [76.40, 31.20]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-jk",
          state: "Jammu & Kashmir",
          capital: "Srinagar & Jammu",
          name: "Chenab Valley Landslide & Convection Band",
          hazard: "Severe Thunderstorm",
          severity: "WARNING",
          iwv: 51.2,
          ctt: 219.5,
          cape: 2700,
          riskScore: 74,
          color: "#f59e0b"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[74.10, 32.70], [76.20, 32.70], [75.90, 34.60], [73.80, 34.40], [74.10, 32.70]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-ladakh",
          state: "Ladakh",
          capital: "Leh",
          name: "Indus High Elevation Flash Outflow Watch Zone",
          hazard: "Flash Flood",
          severity: "WATCH",
          iwv: 42.0,
          ctt: 232.0,
          cape: 1850,
          riskScore: 58,
          color: "#3b82f6"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[76.50, 33.50], [79.20, 33.20], [79.00, 35.80], [76.00, 35.50], [76.50, 33.50]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-kerala",
          state: "Kerala",
          capital: "Thiruvananthapuram",
          name: "Western Ghats Wayanad High Intensity Monsoon Squall",
          hazard: "Severe Thunderstorm",
          severity: "WARNING",
          iwv: 58.4,
          ctt: 212.0,
          cape: 3200,
          riskScore: 82,
          color: "#ff6b35"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[75.80, 8.30], [77.40, 8.30], [77.10, 12.80], [75.20, 12.50], [75.80, 8.30]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-assam",
          state: "Assam",
          capital: "Dispur",
          name: "Brahmaputra Flood Plain Heavy Downpour Zone",
          hazard: "Flash Flood",
          severity: "CRITICAL",
          iwv: 63.1,
          ctt: 206.4,
          cape: 3600,
          riskScore: 92,
          color: "#ef4444"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[89.80, 25.80], [95.80, 26.50], [95.50, 27.90], [89.90, 27.10], [89.80, 25.80]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-odisha",
          state: "Odisha",
          capital: "Bhubaneswar",
          name: "Bay of Bengal Coastal Cyclone Convection Front",
          hazard: "Cyclone",
          severity: "WARNING",
          iwv: 59.8,
          ctt: 210.5,
          cape: 3450,
          riskScore: 84,
          color: "#ff6b35"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[81.40, 17.80], [87.40, 19.50], [87.10, 22.50], [81.30, 22.10], [81.40, 17.80]]
          ]
        }
      },
      {
        type: "Feature",
        properties: {
          id: "zone-maharashtra",
          state: "Maharashtra",
          capital: "Mumbai",
          name: "Konkan Coast Heavy Convective Cloud Band",
          hazard: "Severe Thunderstorm",
          severity: "WATCH",
          iwv: 49.6,
          ctt: 224.0,
          cape: 2400,
          riskScore: 62,
          color: "#3b82f6"
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [[72.60, 15.60], [80.80, 18.20], [80.20, 22.00], [72.70, 20.20], [72.60, 15.60]]
          ]
        }
      }
    ]
  };

  return res.json(geojson);
};

export const getMapOverlays = async (req, res) => {
  return res.json({
    layers: [
      { id: 'iwv_vapor', name: 'MOSDAC INSAT-3D Integrated Water Vapor (IWV)', type: 'heatmap', opacity: 0.75, active: true },
      { id: 'ctt_radar', name: 'Cloud Top Temperature (CTT Radar IR)', type: 'tile', opacity: 0.65, active: true },
      { id: 'gpm_rainfall', name: 'GPM 3-Hour Cumulative Rainfall (mm)', type: 'tile', opacity: 0.70, active: false },
      { id: 'assets_layer', name: 'Critical Infrastructure Assets', type: 'markers', active: true }
    ],
    satelliteTimestamp: new Date().toISOString()
  });
};

