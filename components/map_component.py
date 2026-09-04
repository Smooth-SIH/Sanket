"""
SANKET Interactive Geospatial Map Component
Powered by Folium + streamlit-folium
Renders multi-layered severe weather risk zones, atmospheric contours,
elevation hillshades, and critical asset markers.
"""
import folium
from folium.plugins import HeatMap
from streamlit_folium import st_folium
import config


def render_interactive_map(
    risk_zones_geojson: dict,
    assets_list: list,
    weather_grid: list,
    selected_asset_types: list = None,
    show_risk_zones: bool = True,
    show_iwv_overlay: bool = True,
    show_cape_overlay: bool = True,
    show_ctt_overlay: bool = True,
    show_dem_hillshade: bool = True,
    map_center: list = None,
    zoom_level: int = None
):
    """Constructs and renders the primary Folium geospatial map."""
    if map_center is None:
        map_center = config.MAP_DEFAULT_CENTER
    if zoom_level is None:
        zoom_level = config.MAP_DEFAULT_ZOOM

    # 1. Base Map Initialization
    m = folium.Map(
        location=map_center,
        zoom_start=zoom_level,
        tiles=None,
        control_scale=True
    )

    folium.TileLayer(
        tiles="CartoDB dark_matter",
        name="Dark Mode Canvas (Default)",
        attr="CartoDB",
        overlay=False,
        control=True
    ).add_to(m)

    folium.TileLayer(
        tiles="OpenStreetMap",
        name="OpenStreetMap Standard",
        attr="OSM",
        overlay=False,
        control=True
    ).add_to(m)

    if show_dem_hillshade:
        hillshade_url = (
            "https://server.arcgisonline.com/ArcGIS/rest/services/"
            "World_Hillshade/MapServer/tile/{z}/{y}/{x}"
        )
        folium.TileLayer(
            tiles=hillshade_url,
            name="DEM Elevation Hillshade",
            attr="Esri World Hillshade",
            overlay=True,
            control=True,
            opacity=0.45
        ).add_to(m)

    # 2. Risk Zone Polygons Layer
    if show_risk_zones and risk_zones_geojson:
        risk_group = folium.FeatureGroup(
            name="⚠️ Weather Risk Zones", show=True
        )

        def style_function(feature):
            risk_level = feature["properties"].get("risk_level", "SAFE")
            color = config.RISK_COLORS.get(risk_level, "#10B981")
            return {
                "fillColor": color,
                "color": color,
                "weight": 2.5,
                "fillOpacity": 0.35,
                "dashArray": "4, 4" if risk_level == "MODERATE" else None
            }

        def highlight_function(_):
            return {
                "weight": 4,
                "fillOpacity": 0.65,
                "color": "#FFFFFF"
            }

        geojson_layer = folium.GeoJson(
            risk_zones_geojson,
            style_function=style_function,
            highlight_function=highlight_function,
            tooltip=folium.GeoJsonTooltip(
                fields=[
                    "zone_name", "risk_level", "overall_risk_pct",
                    "lead_time", "rainfall_rate"
                ],
                aliases=[
                    "Zone:", "Risk Level:", "Risk Score (%):",
                    "Nowcast Lead Time:", "Rainfall Rate (mm/h):"
                ],
                style=(
                    "background-color: #1E293B; color: #F8FAFC; "
                    "font-family: monospace; font-size: 12px; "
                    "padding: 8px; border-radius: 4px;"
                )
            )
        )

        geojson_layer.add_to(risk_group)
        risk_group.add_to(m)

    # 3. Weather Overlays
    if weather_grid:
        if show_iwv_overlay:
            iwv_group = folium.FeatureGroup(
                name="💧 IWV Vapor Heatmap (kg/m²)", show=False
            )
            iwv_data = [
                [p["lat"], p["lon"], p["iwv"]] for p in weather_grid
            ]
            HeatMap(
                iwv_data, name="IWV Heatmap", min_opacity=0.3,
                max_zoom=10, radius=22, blur=18,
                gradient={0.3: 'blue', 0.6: 'lime', 1.0: 'magenta'}
            ).add_to(iwv_group)
            iwv_group.add_to(m)

        if show_cape_overlay:
            cape_group = folium.FeatureGroup(
                name="⚡ CAPE Instability (J/kg)", show=False
            )
            for p in weather_grid:
                if p["cape"] > 1500:
                    folium.CircleMarker(
                        location=[p["lat"], p["lon"]],
                        radius=p["cape"] / 400.0,
                        color="#F59E0B",
                        fill=True,
                        fill_color="#F59E0B",
                        fill_opacity=0.4,
                        popup=f"CAPE: {p['cape']} J/kg"
                    ).add_to(cape_group)
            cape_group.add_to(m)

        if show_ctt_overlay:
            ctt_group = folium.FeatureGroup(
                name="❄️ CTT Drop Rate (°C/hr)", show=False
            )
            ctt_data = [
                [p["lat"], p["lon"], p["ctt_drop"]] for p in weather_grid
            ]
            HeatMap(
                ctt_data, name="CTT Drop Heatmap", min_opacity=0.35,
                max_zoom=10, radius=20, blur=15,
                gradient={0.4: 'cyan', 0.8: 'purple', 1.0: 'red'}
            ).add_to(ctt_group)
            ctt_group.add_to(m)

    # 4. Critical Infrastructure Asset Markers Layer
    if assets_list:
        asset_group = folium.FeatureGroup(
            name="🏢 Monitored Critical Assets", show=True
        )

        category_colors = {
            "Power Substations": "red",
            "Construction Sites": "orange",
            "Telecom Towers": "blue",
            "Flood-Prone Areas": "purple"
        }

        for asset in assets_list:
            if selected_asset_types and (
                asset["category"] not in selected_asset_types
            ):
                continue

            risk_hex = config.RISK_COLORS.get(
                asset["current_risk"], "#10B981"
            )
            marker_color = category_colors.get(asset["category"], "gray")

            popup_html = (
                f'<div style="font-family: Arial, sans-serif; '
                f'width: 250px; color: #0F172A;">'
                f'<div style="background-color: #1E293B; color: #F8FAFC; '
                f'padding: 6px; font-weight: bold; '
                f'border-radius: 4px 4px 0 0;">'
                f'{asset["name"]}'
                f'</div>'
                f'<div style="padding: 8px; border: 1px solid #CBD5E1; '
                f'border-radius: 0 0 4px 4px; background-color: #FFFFFF;">'
                f'<p style="margin: 2px 0;">'
                f'<b>Category:</b> {asset["category"]}'
                f'</p>'
                f'<p style="margin: 2px 0;">'
                f'<b>Status Threat:</b> '
                f'<span style="color: {risk_hex}; font-weight: bold;">'
                f'{asset["current_risk"]} ({asset["risk_pct"]}%)'
                f'</span>'
                f'</p>'
                f'<p style="margin: 2px 0;">'
                f'<b>Vulnerability Index:</b> '
                f'{asset["vulnerability_score"]} / 10'
                f'</p>'
                f'<p style="margin: 2px 0;">'
                f'<b>Est. Flood Depth:</b> '
                f'{asset["submerge_depth_est_m"]} m'
                f'</p>'
                f'<hr style="margin: 4px 0; border: 0; '
                f'border-top: 1px solid #E2E8F0;">'
                f'<p style="margin: 2px 0; font-size: 11px; '
                f'color: #475569;">'
                f'<b>Action:</b> {asset["action"]}'
                f'</p>'
                f'</div>'
                f'</div>'
            )

            folium.Marker(
                location=[asset["lat"], asset["lon"]],
                popup=folium.Popup(popup_html, max_width=280),
                tooltip=f"{asset['name']} [{asset['current_risk']}]",
                icon=folium.Icon(
                    color=marker_color,
                    icon="info-sign",
                    prefix="glyphicon"
                   )
            ).add_to(asset_group)

        asset_group.add_to(m)

    # 5. Add Layer Control & Render
    folium.LayerControl(position="topright", collapsed=False).add_to(m)

    st_data = st_folium(
        m,
        width="100%",
        height=580,
        returned_objects=["last_active_drawing", "last_clicked"]
    )

    return st_data
