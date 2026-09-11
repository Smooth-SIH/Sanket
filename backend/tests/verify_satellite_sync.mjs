import { fetchAndProcessSatelliteData } from '../src/services/satelliteService.js';
import { getAlerts } from '../src/controllers/alertController.js';
import { getMapRiskZones } from '../src/controllers/mapController.js';
import { getAssets, assessAssetRisk } from '../src/controllers/assetController.js';

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.data = data; return res; };
  return res;
};

async function runVerification() {
  console.log('================================================================');
  console.log('       SANKET - Live Satellite Telemetry Synchronization Test   ');
  console.log('================================================================\n');

  console.log('[1/4] Ingesting latest satellite scan via satelliteService...');
  const scanData = await fetchAndProcessSatelliteData();
  console.log(`✓ Scan Ingested: ${scanData.scan_id}`);
  console.log(`  Satellite: ${scanData.satellite}`);
  console.log(`  Data Mode: ${scanData.data_source_mode || 'Auto'}`);
  console.log(`  Hotspots: ${scanData.regional_hotspots?.length || 0} regions identified`);

  console.log('\n[2/4] Testing GET /api/alerts dynamic synchronization...');
  const alertRes = mockRes();
  await getAlerts({ query: {} }, alertRes);
  const alerts = alertRes.data.alerts;
  const satAlerts = alerts.filter(a => a.id.startsWith('ALT-SAT-'));
  console.log(`✓ Total Active Alerts: ${alertRes.data.total}`);
  console.log(`✓ Dynamic Satellite Alerts Generated: ${satAlerts.length}`);
  satAlerts.forEach(a => {
    console.log(`   • [${a.severity}] ${a.title}`);
    console.log(`     Location: ${a.affectedRegion} (${a.coordinates[1]}°N, ${a.coordinates[0]}°E)`);
    console.log(`     Parameters: IWV=${a.parameters.IWV_mm}mm, CTT=${a.parameters.CTT_K}K, Rain=${a.parameters.rain_rate_mmh}mm/h`);
  });

  if (satAlerts.length === 0) {
    throw new Error('FAILED: No dynamic satellite alerts generated!');
  }

  console.log('\n[3/4] Testing GET /api/map/risk-zones dynamic GeoJSON...');
  const mapRes = mockRes();
  await getMapRiskZones({}, mapRes);
  const geojson = mapRes.data;
  console.log(`✓ Map Risk Features: ${geojson.features.length} GeoJSON polygons`);
  geojson.features.forEach(f => {
    console.log(`   • Feature: ${f.properties.name}`);
    console.log(`     Center: ${f.properties.center} | Severity: ${f.properties.severity} | Color: ${f.properties.color}`);
    console.log(`     Telemetry: IWV=${f.properties.iwv}mm, CTT=${f.properties.ctt}K`);
  });

  if (geojson.features.length === 0) {
    throw new Error('FAILED: Map GeoJSON risk features empty!');
  }

  console.log('\n[4/4] Testing GET /api/assets dynamic proximity & threat scoring...');
  const assetRes = mockRes();
  await getAssets({ query: {} }, assetRes);
  const assets = assetRes.data.assets;
  console.log(`✓ Assets Evaluated: ${assets.length} critical infrastructure targets`);
  assets.forEach(a => {
    console.log(`   • [${a.currentRiskStatus}] ${a.name} (${a.region})`);
    console.log(`     Distance to severe storm: ${a.distanceToHazardKm} km (Sector: ${a.nearestHazardRegion || 'N/A'})`);
  });

  // Test single asset risk assessment
  const singleRes = mockRes();
  await assessAssetRisk({ params: { id: assets[0].id } }, singleRes);
  console.log(`\n✓ Individual Assessment for ${assets[0].name}:`);
  console.log(`   • Risk Level: ${singleRes.data.riskLevel}`);
  console.log(`   • Risk Score: ${singleRes.data.riskScore}%`);
  console.log(`   • Mitigation: ${singleRes.data.recommendedMitigation}`);

  console.log('\n================================================================');
  console.log('  ALL INTEGRATION CHECKS PASSED: Live Satellite Telemetry Synced! ');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
