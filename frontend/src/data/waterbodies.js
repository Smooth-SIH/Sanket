// Official Waterbodies, River Networks, and Reservoirs for Weather Nowcasting & Hydrological Tracking
// High-precision coordinates for primary runoff drainage channels and reservoirs across India

export const WATERBODIES = [
  // --- HIMALAYAN & NORTHERN RIVER SYSTEMS (Critical Cloudburst & Flash Flood Channels) ---
  {
    id: 'alaknanda',
    name: 'Alaknanda River',
    type: 'RIVER',
    basin: 'Upper Ganga Basin',
    riskZoneRef: 'zone-1 (Garhwal Cloudburst)',
    status: 'SURGE_WARNING',
    flowRate: '1,420 m³/s (Rapid Inflow)',
    description: 'Primary drainage channel for Garhwal Himalayas. Originates from Satopanth Glacier past Badrinath and Joshimath.',
    coordinates: [
      [30.98, 79.50], [30.74, 79.49], [30.56, 79.57], [30.55, 79.56],
      [30.40, 79.33], [30.28, 79.22], [30.26, 78.98], [30.14, 78.60]
    ]
  },
  {
    id: 'mandakini',
    name: 'Mandakini River',
    type: 'RIVER',
    basin: 'Upper Ganga Basin',
    riskZoneRef: 'Kedarnath Valley',
    status: 'WATCH_LEVEL',
    flowRate: '860 m³/s',
    description: 'Drains Chorabari Glacier past Kedarnath, Sonprayag, Guptkashi, meeting Alaknanda at Rudraprayag.',
    coordinates: [
      [30.73, 79.06], [30.63, 79.02], [30.53, 79.07], [30.43, 79.05],
      [30.29, 78.98]
    ]
  },
  {
    id: 'bhagirathi',
    name: 'Bhagirathi River',
    type: 'RIVER',
    basin: 'Upper Ganga Basin',
    riskZoneRef: 'Tehri Catchment',
    status: 'ELEVATED',
    flowRate: '1,150 m³/s',
    description: 'Originates at Gaumukh (Gangotri Glacier), flows past Uttarkashi into Tehri Reservoir, meeting Alaknanda at Devprayag.',
    coordinates: [
      [30.92, 79.08], [30.85, 78.85], [30.73, 78.44], [30.45, 78.48],
      [30.38, 78.48], [30.14, 78.60]
    ]
  },
  {
    id: 'ganga_main',
    name: 'Ganga River (Main Stem)',
    type: 'RIVER',
    basin: 'Indo-Gangetic Basin',
    riskZoneRef: 'National Flood Plain',
    status: 'NORMAL',
    flowRate: '12,500 m³/s',
    description: 'Formed at Devprayag, emerges at Rishikesh & Haridwar, flowing eastward through Uttar Pradesh, Bihar, and West Bengal.',
    coordinates: [
      [30.14, 78.60], [30.08, 78.29], [29.95, 78.16], [29.58, 78.03],
      [28.98, 78.18], [28.25, 79.01], [27.15, 80.05], [26.47, 80.35],
      [25.44, 81.85], [25.32, 83.01], [25.61, 85.14], [25.30, 87.27],
      [24.80, 88.00], [22.57, 88.36]
    ]
  },
  {
    id: 'yamuna',
    name: 'Yamuna River',
    type: 'RIVER',
    basin: 'Indo-Gangetic Basin',
    riskZoneRef: 'Delhi / NCR Flood Watch',
    status: 'NORMAL',
    flowRate: '3,800 m³/s',
    description: 'Originates from Yamunotri, flows through Himachal, Haryana, Delhi, Mathura, Agra, merging with Ganga at Prayagraj.',
    coordinates: [
      [31.01, 78.46], [30.50, 77.62], [30.01, 77.29], [28.70, 77.22],
      [28.53, 77.30], [27.50, 77.68], [27.18, 78.01], [26.45, 79.25],
      [25.44, 81.85]
    ]
  },
  {
    id: 'teesta',
    name: 'Teesta River',
    type: 'RIVER',
    basin: 'Brahmaputra Basin',
    riskZoneRef: 'zone-2 (Teesta Flash Flood)',
    status: 'HIGH_FLOOD_ALERT',
    flowRate: '2,890 m³/s (Glacial Lake Outburst / Flash Surge)',
    description: 'Originates from Tso Lhamo Lake, cuts through North Sikkim, Chungthang, Mangan, Singtam, Rangpo into Siliguri plains.',
    coordinates: [
      [28.02, 88.75], [27.60, 88.65], [27.50, 88.52], [27.35, 88.50],
      [27.18, 88.50], [26.88, 88.48], [26.55, 88.72], [25.90, 89.60]
    ]
  },
  {
    id: 'beas',
    name: 'Beas River',
    type: 'RIVER',
    basin: 'Indus Basin',
    riskZoneRef: 'zone-3 (Kullu Valley Hail/Rain)',
    status: 'SURGE_WARNING',
    flowRate: '980 m³/s',
    description: 'Originates at Rohtang Pass, flows through Manali, Kullu, Mandi into Pong Reservoir, crucial for Himachal nowcasting.',
    coordinates: [
      [32.37, 77.25], [32.24, 77.19], [31.96, 77.11], [31.71, 76.93],
      [31.85, 76.32], [32.00, 75.95]
    ]
  },
  {
    id: 'jhelum',
    name: 'Jhelum River',
    type: 'RIVER',
    basin: 'Indus Basin',
    riskZoneRef: 'Kashmir Valley Flood Basin',
    status: 'WATCH_LEVEL',
    flowRate: '1,320 m³/s',
    description: 'Meanders through Kashmir Valley past Anantnag, Srinagar, Wular Lake, and Baramulla into Uri gorge.',
    coordinates: [
      [33.53, 75.24], [33.73, 75.15], [34.08, 74.80], [34.34, 74.58],
      [34.20, 74.34], [34.15, 73.95]
    ]
  },
  {
    id: 'indus',
    name: 'Indus River (Sindhu)',
    type: 'RIVER',
    basin: 'Indus Basin',
    riskZoneRef: 'Ladakh High Altitude Drainage',
    status: 'NORMAL',
    flowRate: '2,400 m³/s',
    description: 'Cuts through Ladakh past Demchok, Upshi, Leh, Nimmu, Kargil, and Skardu (Baltistan) through the Karakoram gorge.',
    coordinates: [
      [33.10, 79.10], [33.80, 77.90], [34.15, 77.58], [34.30, 76.90],
      [34.60, 76.20], [35.32, 75.62], [35.80, 74.60]
    ]
  },
  {
    id: 'brahmaputra',
    name: 'Brahmaputra River',
    type: 'RIVER',
    basin: 'Brahmaputra Basin',
    riskZoneRef: 'Assam Monsoonal Flood Plains',
    status: 'HIGH_DISCHARGE',
    flowRate: '28,500 m³/s',
    description: 'Enters Arunachal Pradesh as Siang, widens across Assam through Dibrugarh, Kaziranga, Guwahati, and Dhubri.',
    coordinates: [
      [28.10, 95.30], [27.50, 94.90], [26.75, 93.80], [26.18, 91.75],
      [26.02, 90.50], [25.75, 89.80]
    ]
  },
  {
    id: 'narmada',
    name: 'Narmada River',
    type: 'RIVER',
    basin: 'Narmada Basin',
    riskZoneRef: 'Central India Flood Corridor',
    status: 'NORMAL',
    flowRate: '4,500 m³/s',
    description: 'Rift valley drainage across Madhya Pradesh, Gujarat into Arabian Sea.',
    coordinates: [
      [22.67, 81.75], [23.18, 79.95], [22.80, 78.50], [22.18, 75.80],
      [21.75, 73.00]
    ]
  },
  {
    id: 'godavari',
    name: 'Godavari River',
    type: 'RIVER',
    basin: 'Godavari Basin',
    riskZoneRef: 'Peninsular Basin',
    status: 'NORMAL',
    flowRate: '6,200 m³/s',
    description: 'Dakshin Ganga flowing from Nashik through Maharashtra, Telangana, and Andhra Pradesh to Bay of Bengal.',
    coordinates: [
      [19.99, 73.78], [19.00, 76.50], [18.80, 78.80], [18.20, 80.50],
      [16.98, 81.78]
    ]
  },

  // --- MAJOR RESERVOIRS & LAKES (Critical Hydro Infrastructure & Flood Buffers) ---
  {
    id: 'tehri_reservoir',
    name: 'Tehri Dam Reservoir',
    type: 'RESERVOIR',
    basin: 'Upper Ganga',
    status: '84% CAPACITY',
    lat: 30.378,
    lon: 78.480,
    storageMcm: 3540,
    description: 'Massive reservoir on Bhagirathi. Major flood cushion for Rishikesh and Haridwar.'
  },
  {
    id: 'gobind_sagar',
    name: 'Gobind Sagar (Bhakra Dam)',
    type: 'RESERVOIR',
    basin: 'Sutlej Basin',
    status: '78% CAPACITY',
    lat: 31.411,
    lon: 76.438,
    storageMcm: 9620,
    description: 'Huge multipurpose reservoir across Himachal & Punjab controlling Sutlej monsoon floods.'
  },
  {
    id: 'pong_dam',
    name: 'Maharana Pratap Sagar (Pong Dam)',
    type: 'RESERVOIR',
    basin: 'Beas Basin',
    status: '72% CAPACITY',
    lat: 31.968,
    lon: 75.962,
    storageMcm: 8570,
    description: 'Beas river flood regulation reservoir in Kangra, Himachal Pradesh.'
  },
  {
    id: 'wular_lake',
    name: 'Wular Lake',
    type: 'LAKE',
    basin: 'Jhelum Basin',
    status: 'NORMAL RETENTION',
    lat: 34.341,
    lon: 74.558,
    storageMcm: 180,
    description: 'Largest natural freshwater lake in India, acts as natural flood absorption basin for Kashmir.'
  },
  {
    id: 'dal_lake',
    name: 'Dal Lake',
    type: 'LAKE',
    basin: 'Jhelum Catchment',
    status: 'NORMAL',
    lat: 34.110,
    lon: 74.868,
    description: 'Iconic urban lake in Srinagar, monitored for urban runoff & cloudburst drainage.'
  },
  {
    id: 'pangong_tso',
    name: 'Pangong Tso Lake',
    type: 'LAKE',
    basin: 'Endorheic High Altitude Lake',
    status: 'FROZEN / CLEAR',
    lat: 33.759,
    lon: 78.650,
    description: 'High-altitude saline lake in eastern Ladakh (14,270 ft).'
  },
  {
    id: 'sardar_sarovar',
    name: 'Sardar Sarovar Reservoir',
    type: 'RESERVOIR',
    basin: 'Narmada Basin',
    status: '89% CAPACITY',
    lat: 21.829,
    lon: 73.748,
    storageMcm: 9500,
    description: 'Terminal reservoir on Narmada regulating west-coast monsoon inflows.'
  },
  {
    id: 'hirakud_reservoir',
    name: 'Hirakud Reservoir',
    type: 'RESERVOIR',
    basin: 'Mahanadi Basin',
    status: '76% CAPACITY',
    lat: 21.570,
    lon: 83.870,
    storageMcm: 5896,
    description: 'Longest earthen dam reservoir in the world, regulating Odisha delta flood peaks.'
  },
  {
    id: 'chilika_lake',
    name: 'Chilika Lake',
    type: 'LAKE',
    basin: 'Coastal Wetland Catchment',
    status: 'MONSOON TIDAL SURGE WATCH',
    lat: 19.716,
    lon: 85.321,
    description: 'Asia largest brackish water lagoon, key storm surge & cyclone drainage zone.'
  }
];
