// Strategic Transport Corridors, National Highways, and Railway Lifelines for Emergency Evacuation & Weather Tracking
// Highly vulnerable to landslides, cloudburst flash-floods, and monsoon washouts

export const TRANSPORT_CORRIDORS = [
  {
    id: 'nh-7-nh-58',
    name: 'NH-7 / NH-58 (Char Dham Badrinath Lifeline)',
    type: 'HIGHWAY',
    category: 'CRITICAL_HIMALAYAN_LIFELINE',
    status: 'VULNERABLE_TO_CLOUDBURST',
    dangerZoneRef: 'zone-1 (Garhwal)',
    color: '#f97316',
    description: 'Primary pilgrimage & civilian lifeline through Rishikesh, Devprayag, Srinagar (Garhwal), Rudraprayag, Karnaprayag, Chamoli, Joshimath to Badrinath.',
    coordinates: [
      [29.95, 78.16], // Haridwar
      [30.08, 78.29], // Rishikesh
      [30.14, 78.60], // Devprayag
      [30.22, 78.78], // Srinagar Garhwal
      [30.28, 78.98], // Rudraprayag
      [30.26, 79.22], // Karnaprayag
      [30.40, 79.33], // Chamoli
      [30.56, 79.57], // Joshimath
      [30.74, 79.49]  // Badrinath
    ]
  },
  {
    id: 'nh-10',
    name: 'NH-10 (Sikkim Lifeline Highway)',
    type: 'HIGHWAY',
    category: 'CRITICAL_HIMALAYAN_LIFELINE',
    status: 'ACTIVE_LANDSLIDE_WATCH',
    dangerZoneRef: 'zone-2 (Teesta)',
    color: '#ef4444',
    description: 'Only arterial road connecting Sikkim to the rest of India. Runs parallel to the raging Teesta River from Siliguri through Sevoke, Rangpo, Singtam to Gangtok.',
    coordinates: [
      [26.73, 88.40], // Siliguri
      [26.88, 88.47], // Sevoke Coronation Bridge
      [27.05, 88.50], // Melli
      [27.18, 88.53], // Rangpo (Border)
      [27.24, 88.50], // Singtam
      [27.30, 88.56], // Ranipool
      [27.34, 88.61]  // Gangtok
    ]
  },
  {
    id: 'nh-3-nh-21',
    name: 'NH-3 / NH-21 (Chandigarh - Manali - Leh Highway)',
    type: 'HIGHWAY',
    category: 'CRITICAL_HIMALAYAN_LIFELINE',
    status: 'HAIL_FLASH_FLOOD_WATCH',
    dangerZoneRef: 'zone-3 (Kullu)',
    color: '#f59e0b',
    description: 'Strategic corridor through Kiratpur, Bilaspur, Mandi, Pandoh, Aut Tunnel, Kullu, Manali, through Atal Tunnel to Keylong and Leh.',
    coordinates: [
      [30.73, 76.78], // Chandigarh
      [31.18, 76.60], // Kiratpur
      [31.33, 76.75], // Bilaspur
      [31.71, 76.93], // Mandi
      [31.67, 77.05], // Pandoh
      [31.75, 77.16], // Aut
      [31.96, 77.11], // Kullu
      [32.24, 77.19], // Manali
      [32.36, 77.16], // Atal Tunnel (Rohtang)
      [32.57, 77.03], // Keylong
      [33.15, 77.50], // Sarchu
      [34.15, 77.58]  // Leh
    ]
  },
  {
    id: 'nh-44-kashmir',
    name: 'NH-44 (Jammu - Srinagar National Highway)',
    type: 'HIGHWAY',
    category: 'NATIONAL_STRATEGIC_CORRIDOR',
    status: 'NORMAL_WATCH',
    color: '#3b82f6',
    description: 'Vital all-weather lifeline through Chenani-Nashri Tunnel, Ramban landslide zone, Banihal (Qazigund Tunnel), Anantnag to Srinagar.',
    coordinates: [
      [32.73, 74.86], // Jammu
      [32.92, 75.03], // Udhampur
      [33.05, 75.28], // Chenani-Nashri
      [33.24, 75.25], // Ramban
      [33.50, 75.20], // Banihal
      [33.73, 75.15], // Anantnag
      [33.95, 74.90], // Awantipora
      [34.08, 74.80]  // Srinagar
    ]
  },
  {
    id: 'nh-1-zojila',
    name: 'NH-1 (Srinagar - Zoji La - Kargil - Leh)',
    type: 'HIGHWAY',
    category: 'STRATEGIC_PASS_HIGHWAY',
    status: 'OROGRAPHIC_MONITORING',
    color: '#8b5cf6',
    description: 'Connects Kashmir with Ladakh through Sonamarg, Zoji La Pass (11,575 ft), Dras, Kargil to Leh.',
    coordinates: [
      [34.08, 74.80], // Srinagar
      [34.31, 75.30], // Sonamarg
      [34.28, 75.47], // Zoji La Pass
      [34.43, 75.76], // Dras
      [34.55, 76.13], // Kargil
      [34.30, 76.90], // Khalsi
      [34.15, 77.58]  // Leh
    ]
  },
  {
    id: 'nh-44-main',
    name: 'NH-44 (North-South National Highway Backbone)',
    type: 'HIGHWAY',
    category: 'INTERSTATE_EXPRESSWAY',
    status: 'OPEN',
    color: '#0284c7',
    description: 'Longest national highway connecting Punjab, Haryana, Delhi, Uttar Pradesh, Madhya Pradesh, Maharashtra, Telangana, Karnataka, and Tamil Nadu.',
    coordinates: [
      [30.73, 76.78], [29.98, 76.88], [28.61, 77.21], [27.18, 78.01],
      [26.22, 78.18], [24.88, 78.58], [22.80, 79.20], [21.15, 79.08],
      [18.50, 78.70], [17.38, 78.48], [15.82, 78.03], [12.97, 77.59],
      [11.66, 78.14], [8.18, 77.55]
    ]
  },
  {
    id: 'konkan-railway',
    name: 'Konkan Railway Coastal Corridor',
    type: 'RAILWAY',
    category: 'VULNERABLE_COASTAL_RAILWAY',
    status: 'MONSOON_FLOOD_MONITORING',
    color: '#a855f7',
    description: 'Engineering marvel traversed across Western Ghats gorges and viaducts through Roha, Ratnagiri, Madgaon (Goa), Karwar to Mangalore.',
    coordinates: [
      [18.44, 73.12], [17.70, 73.30], [16.99, 73.30], [15.80, 73.80],
      [15.28, 73.98], [14.82, 74.13], [14.28, 74.45], [13.34, 74.74],
      [12.87, 74.84]
    ]
  }
];
