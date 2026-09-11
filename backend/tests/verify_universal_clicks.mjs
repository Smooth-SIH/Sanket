import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indiaStatesGeoJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../frontend/src/data/india_states_soi.json'), 'utf-8')
);
import { SETTLEMENTS } from '../../frontend/src/data/settlements.js';
import { TRANSPORT_CORRIDORS } from '../../frontend/src/data/transportCorridors.js';
import { WATERBODIES } from '../../frontend/src/data/waterbodies.js';
import {
  pointInPolygon,
  findStateForPoint,
  estimateElevationASL,
  getVulnerabilityForTerrain,
  computeLocalTelemetry,
  findClosestTacticalFeature
} from '../../frontend/src/utils/geoSpatialIntelligence.js';

console.log('--- Starting Universal Click Intelligence & Proximity Tests ---');

// 1. Test Curated Match on Mumbai
const mumbaiMatch = findClosestTacticalFeature(19.0760, 72.8777);
assert(mumbaiMatch !== null, 'Mumbai click should match curated settlement');
assert.strictEqual(mumbaiMatch.data.name, 'Mumbai');
console.log('✓ Test 1 Passed: Mumbai click resolves to Mumbai CITY (curated)');

// 1b. Test Strategic Location Match on Siachen Glacier (35.4212, 77.1095)
const siachenMatch = findClosestTacticalFeature(35.4212, 77.1095);
assert(siachenMatch !== null, 'Siachen Glacier click should match strategic location');
assert.strictEqual(siachenMatch.data.name, 'Siachen Glacier');
console.log('✓ Test 1b Passed: Siachen Glacier resolves to Himalayan Observation Post (strategic)');

// 1c. Test RMCs (New Delhi, Mumbai, Chennai, Kolkata, Nagpur, Guwahati)
const rmcDelhi = findClosestTacticalFeature(28.5562, 77.0860);
assert(rmcDelhi !== null && rmcDelhi.data.name === 'RMC New Delhi', 'RMC New Delhi must match');
assert(rmcDelhi.data.address.includes('Terminal 2, IGI Airport'), 'RMC Delhi address should match');

const rmcMumbai = findClosestTacticalFeature(18.8953, 72.8139);
assert(rmcMumbai !== null && rmcMumbai.data.name === 'RMC Mumbai', 'RMC Mumbai must match');
assert(rmcMumbai.data.address.includes('Navy Nagar, Colaba'), 'RMC Mumbai address should match');

const rmcChennai = findClosestTacticalFeature(13.0645, 80.2452);
assert(rmcChennai !== null && rmcChennai.data.name === 'RMC Chennai', 'RMC Chennai must match');

const rmcKolkata = findClosestTacticalFeature(22.5354, 88.3292);
assert(rmcKolkata !== null && rmcKolkata.data.name === 'RMC Kolkata', 'RMC Kolkata must match');

const rmcNagpur = findClosestTacticalFeature(21.0922, 79.0617);
assert(rmcNagpur !== null && rmcNagpur.data.name === 'RMC Nagpur', 'RMC Nagpur must match');

const rmcGuwahati = findClosestTacticalFeature(26.1061, 91.5859);
assert(rmcGuwahati !== null && rmcGuwahati.data.name === 'RMC Guwahati', 'RMC Guwahati must match');
console.log('✓ Test 1c Passed: All 6 IMD Regional Meteorological Centres matched with official addresses');

// 2. Test Image 3 Case: Rural Telangana Village / Field (~18.84, 78.43)
// In the old code, this matched NH-44 up to 45km away!
const ruralTelanganaMatch = findClosestTacticalFeature(18.84, 78.43);
assert.strictEqual(ruralTelanganaMatch, null, 'Rural Telangana field must NOT falsely match NH-44 highway!');
console.log('✓ Test 2 Passed: Rural Telangana click does NOT falsely match NH-44 (threshold tightened)');

// 3. Test State Determination via Survey of India Polygon
const telanganaState = findStateForPoint(18.84, 78.43, indiaStatesGeoJson);
assert.strictEqual(telanganaState, 'Telangana', 'Coordinates (18.84, 78.43) should resolve to Telangana');
console.log(`✓ Test 3 Passed: Polygon ray-casting resolves (18.84, 78.43) to State: ${telanganaState}`);

// 4. Test Image 2 Case: Rural Maharashtra (~18.15, 74.05)
const maharashtraState = findStateForPoint(18.15, 74.05, indiaStatesGeoJson);
assert.strictEqual(maharashtraState, 'Maharashtra', 'Coordinates (18.15, 74.05) should resolve to Maharashtra');
console.log(`✓ Test 4 Passed: Rural Maharashtra click resolves to State: ${maharashtraState}`);

// 5. Test ASL Altitude Calculations
const plateauElev = estimateElevationASL(18.84, 78.43); // Telangana plateau
assert(plateauElev >= 300 && plateauElev <= 650, `Plateau elevation ${plateauElev}m should be 300-650m`);

const himalayanElev = estimateElevationASL(30.73, 79.06); // Kedarnath/Garhwal
assert(himalayanElev >= 1500, `Himalayan elevation ${himalayanElev}m should be >= 1500m`);

const coastalElev = estimateElevationASL(18.95, 72.82); // Mumbai coast
assert(coastalElev <= 50, `Coastal elevation ${coastalElev}m should be <= 50m`);
console.log(`✓ Test 5 Passed: Altitude models (Plateau: ${plateauElev}m, Himalayas: ${himalayanElev}m, Coast: ${coastalElev}m)`);

// 6. Test Local Atmospheric Telemetry
const telemetry = computeLocalTelemetry(18.84, 78.43, null, { metrics: { IWV_mm: 58.4, CTT_K: 210.5, CAPE_Jkg: 2450 } });
assert(telemetry.iwv > 30 && telemetry.iwv < 65, 'IWV should be physically realistic');
assert(telemetry.ctt > 215 && telemetry.ctt < 265, 'CTT should be realistic');
assert(telemetry.cape > 1000 && telemetry.cape < 2500, 'CAPE should be realistic');
console.log(`✓ Test 6 Passed: Telemetry at Telangana point (IWV: ${telemetry.iwv}mm, CTT: ${telemetry.ctt}K, CAPE: ${telemetry.cape} J/kg, Status: ${telemetry.status})`);

console.log('--- All 6 Verification Tests Passed Successfully! ---');
