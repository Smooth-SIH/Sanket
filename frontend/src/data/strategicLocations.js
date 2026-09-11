// Official Strategic Locations and Observation Posts across India
// Specifying sovereign territories in Ladakh, Jammu & Kashmir, and Northern India

export const STRATEGIC_LOCATIONS = [
  // --- Ladakh (Union Territory, India) ---
  {
    id: 'gilgit',
    name: 'Gilgit',
    region: 'Ladakh (UT), India',
    lat: 35.9208,
    lon: 74.3144,
    type: 'ADMINISTRATIVE_OUTPOST',
    align: 'left',
    description: 'Northern Frontier Sector, Ladakh'
  },
  {
    id: 'baltistan',
    name: 'Baltistan',
    region: 'Ladakh (UT), India',
    lat: 35.3247,
    lon: 75.6218,
    type: 'ADMINISTRATIVE_OUTPOST',
    align: 'top',
    description: 'Baltistan Valley, Ladakh'
  },
  {
    id: 'siachen',
    name: 'Siachen Glacier',
    region: 'Ladakh (UT), India',
    lat: 35.4212,
    lon: 77.1095,
    type: 'HIMALAYAN_OBSERVATION_POST',
    align: 'top',
    description: 'Highest Meteorological & Observation Sector, Karakoram'
  },
  {
    id: 'aksai_chin',
    name: 'Aksai Chin',
    region: 'Ladakh (UT), India',
    lat: 35.1500,
    lon: 79.5000,
    type: 'STRATEGIC_TERRITORY',
    align: 'right',
    description: 'Eastern Plateau Sector, Ladakh'
  },
  {
    id: 'leh',
    name: 'Leh',
    region: 'Ladakh (UT), India',
    lat: 34.1526,
    lon: 77.5771,
    type: 'UT_HEADQUARTERS',
    align: 'bottom-right',
    description: 'Headquarters of Ladakh Union Territory'
  },
  {
    id: 'kargil',
    name: 'Kargil',
    region: 'Ladakh (UT), India',
    lat: 34.5539,
    lon: 76.1349,
    type: 'DISTRICT_HEADQUARTERS',
    align: 'bottom',
    description: 'District Headquarters, Ladakh'
  },

  // --- Jammu & Kashmir (Union Territory, India) ---
  {
    id: 'muzaffarabad',
    name: 'Muzaffarabad',
    region: 'Jammu & Kashmir (UT), India',
    lat: 34.3700,
    lon: 73.4711,
    type: 'ADMINISTRATIVE_OUTPOST',
    align: 'left',
    description: 'Western Sector, Jammu & Kashmir'
  },
  {
    id: 'srinagar',
    name: 'Srinagar',
    region: 'Jammu & Kashmir (UT), India',
    lat: 34.0837,
    lon: 74.7973,
    type: 'CAPITAL',
    align: 'left',
    description: 'Summer Capital, Jammu & Kashmir'
  },
  {
    id: 'mirpur',
    name: 'Mirpur',
    region: 'Jammu & Kashmir (UT), India',
    lat: 33.1484,
    lon: 73.7519,
    type: 'ADMINISTRATIVE_OUTPOST',
    align: 'left',
    description: 'Southern Sector, Jammu & Kashmir'
  },
  {
    id: 'jammu',
    name: 'Jammu',
    region: 'Jammu & Kashmir (UT), India',
    lat: 32.7266,
    lon: 74.8570,
    type: 'CAPITAL',
    align: 'bottom',
    description: 'Winter Capital, Jammu & Kashmir'
  },

  // --- Northern & National Capitals ---
  {
    id: 'shimla',
    name: 'Shimla',
    region: 'Himachal Pradesh, India',
    lat: 31.1048,
    lon: 77.1734,
    type: 'STATE_CAPITAL',
    align: 'right',
    description: 'Capital of Himachal Pradesh'
  },
  {
    id: 'dehradun',
    name: 'Dehradun',
    region: 'Uttarakhand, India',
    lat: 30.3165,
    lon: 78.0322,
    type: 'STATE_CAPITAL',
    align: 'right',
    description: 'Capital of Uttarakhand • Himalayan Nowcasting Base'
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    region: 'Punjab & Haryana, India',
    lat: 30.7333,
    lon: 76.7794,
    type: 'STATE_CAPITAL',
    align: 'left',
    description: 'Joint Capital, Punjab & Haryana'
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    region: 'National Capital Territory, India',
    lat: 28.6139,
    lon: 77.2090,
    type: 'NATIONAL_CAPITAL',
    align: 'right',
    description: 'National Capital of India • IMD / MoES HQ'
  },

  // --- India Meteorological Department (IMD) Regional Meteorological Centres (RMCs) ---
  {
    id: 'rmc-new-delhi',
    name: 'RMC New Delhi',
    region: 'Delhi (NCT), India',
    lat: 28.5562,
    lon: 77.0860,
    type: 'RMC',
    align: 'top',
    address: 'Terminal 2, IGI Airport, New Delhi 110037',
    description: 'Regional Meteorological Centre, New Delhi • Aviation & Northwest India Forecasting Command'
  },
  {
    id: 'rmc-mumbai',
    name: 'RMC Mumbai',
    region: 'Maharashtra, India',
    lat: 18.8953,
    lon: 72.8139,
    type: 'RMC',
    align: 'left',
    address: 'Near R. C. Church, Next to Ashwini Naval Hospital, Nananbhai Moosai Marg, Navy Nagar, Colaba, Mumbai 400005',
    description: 'Regional Meteorological Centre, Mumbai • Western Region & Arabian Sea Cyclone Warning Centre (CWC)'
  },
  {
    id: 'rmc-chennai',
    name: 'RMC Chennai',
    region: 'Tamil Nadu, India',
    lat: 13.0645,
    lon: 80.2452,
    type: 'RMC',
    align: 'right',
    address: '50 (New No. 6) College Road, Nungambakkam, Chennai 600006',
    description: 'Regional Meteorological Centre, Chennai • Southern Peninsula & Bay of Bengal Cyclone Warning Centre (ACWC)'
  },
  {
    id: 'rmc-kolkata',
    name: 'RMC Kolkata',
    region: 'West Bengal, India',
    lat: 22.5354,
    lon: 88.3292,
    type: 'RMC',
    align: 'right',
    address: '4, Duel Avenue, Alipore, Kolkata 700027',
    description: 'Regional Meteorological Centre, Kolkata • Eastern Region & Area Cyclone Warning Centre (ACWC)'
  },
  {
    id: 'rmc-nagpur',
    name: 'RMC Nagpur',
    region: 'Maharashtra, India',
    lat: 21.0922,
    lon: 79.0617,
    type: 'RMC',
    align: 'bottom',
    address: 'Sonegaon Airport, Nagpur 440005',
    description: 'Regional Meteorological Centre, Nagpur • Central India Atmospheric & Radar Operations Node'
  },
  {
    id: 'rmc-guwahati',
    name: 'RMC Guwahati',
    region: 'Assam, India',
    lat: 26.1061,
    lon: 91.5859,
    type: 'RMC',
    align: 'top',
    address: 'LGB International Airport, Borjhar, Guwahati, Assam 781015',
    description: 'Regional Meteorological Centre, Guwahati • Northeast Frontier Weather & Flood Meteorological Office'
  }
];
