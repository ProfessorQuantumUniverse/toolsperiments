html_content = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sci-Fi Global Monitor</title>
  
  <script src="https://unpkg.com/globe.gl"></script>
  
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background-color: #000; font-family: "Courier New", Courier, monospace; }
    #hud { position: absolute; top: 20px; left: 20px; color: #00ffcc; z-index: 10; background: rgba(0, 20, 20, 0.85); padding: 20px; border: 1px solid #00ffcc; border-radius: 8px; box-shadow: 0 0 15px #00ffcc; text-transform: uppercase; width: 320px; backdrop-filter: blur(5px); pointer-events: auto; }
    #hud h1 { margin: 0 0 15px 0; font-size: 1.3rem; text-shadow: 0 0 8px #00ffcc; border-bottom: 1px solid rgba(0,255,204,0.3); padding-bottom: 10px;}
    #hud p { margin: 5px 0; font-size: 0.9rem; }
    .toggle-container { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
    .toggle-row { display: flex; justify-content: space-between; align-items: center; }
    .toggle-label { font-size: 0.9rem; cursor: pointer; text-shadow: 0 0 3px #00ffcc; }
    .switch { position: relative; display: inline-block; width: 40px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 20px; border: 1px solid #00ffcc; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: #00ffcc; transition: .4s; border-radius: 50%; box-shadow: 0 0 8px #00ffcc; }
    input:checked + .slider { background-color: rgba(0, 255, 204, 0.2); }
    input:checked + .slider:before { transform: translateX(20px); background-color: #fff; box-shadow: 0 0 10px #fff; }
    .status-val { color: #00ff00; font-weight: bold; text-shadow: 0 0 5px #00ff00;}
    .stats-container { margin-top: 20px; font-size: 0.8rem; color: #aaa; border-top: 1px solid rgba(0,255,204,0.3); padding-top: 15px; display: flex; flex-direction: column; gap: 6px; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; }
    .stat-row span:nth-child(2) { color: #fff; font-weight: bold; }
    #hud::after { content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%); z-index: -1; background-size: 100% 4px; pointer-events: none; border-radius: 8px; }
  </style>
</head>
<body>
  <div id="hud">
    <h1>Global Operations</h1>
    <p>Network Link: <span class="status-val" id="net-status">ONLINE</span></p>
    <div class="toggle-container">
      <div class="toggle-row"><label class="toggle-label" for="toggle-arcs">Cyber-Traffic (Sim)</label><label class="switch"><input type="checkbox" id="toggle-arcs" checked><span class="slider"></span></label></div>
      <div class="toggle-row"><label class="toggle-label" for="toggle-eq">USGS Earthquakes</label><label class="switch"><input type="checkbox" id="toggle-eq" checked><span class="slider"></span></label></div>
      <div class="toggle-row"><label class="toggle-label" for="toggle-cables">Submarine Cables</label><label class="switch"><input type="checkbox" id="toggle-cables"><span class="slider"></span></label></div>
      <div class="toggle-row"><label class="toggle-label" for="toggle-iss">ISS Position</label><label class="switch"><input type="checkbox" id="toggle-iss" checked><span class="slider"></span></label></div>
      <div class="toggle-row"><label class="toggle-label" for="toggle-wiki">Wiki Edits (Live)</label><label class="switch"><input type="checkbox" id="toggle-wiki"><span class="slider"></span></label></div>
      <div class="toggle-row"><label class="toggle-label" for="toggle-nasa">NASA EONET Events</label><label class="switch"><input type="checkbox" id="toggle-nasa"><span class="slider"></span></label></div>
    </div>
    <div class="stats-container">
      <div class="stat-row"><span>Earthquakes (30d):</span> <span id="eq-count">...</span></div>
      <div class="stat-row"><span>Submarine Cables:</span> <span id="cable-count">...</span></div>
      <div class="stat-row"><span>ISS Altitude:</span> <span id="iss-alt">...</span></div>
      <div class="stat-row"><span>Wiki Edits (Live):</span> <span id="wiki-count">0</span></div>
      <div class="stat-row"><span>NASA Alerts:</span> <span id="nasa-count">...</span></div>
    </div>
  </div>
  <div id="globeViz"></div>

  <script>
    const state = { arcs: true, eq: true, cables: false, iss: true, wiki: false, nasa: false };
    const dataStore = { arcs: [], eqRings: [], eqPoints: [], cables: [], iss: [], wiki: [], nasa: [] };

    const world = Globe()(document.getElementById("globeViz"))
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-dark.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
      .pointOfView({ altitude: 2, lat: 20, lng: 10 }, 2000);

    world.controls().autoRotate = true; world.controls().autoRotateSpeed = 0.5;

    world
      .arcColor("color").arcDashLength(0.4).arcDashGap(0.2).arcDashInitialGap(()=>Math.random()*5).arcDashAnimateTime(2000).arcAltitudeAutoScale(0.3)
      .ringColor("color").ringMaxRadius("maxR").ringPropagationSpeed("speed").ringRepeatPeriod("period")
      .pointColor("color").pointAltitude("alt").pointRadius("radius").pointLabel("label")
      .pathPointLat(p => p[0]).pathPointLng(p => p[1]).pathColor("color").pathResolution(2)
      .htmlElement(d => {
        const el = document.createElement("div"); el.innerHTML = d.html; el.style.color = d.color; el.style.fontSize = d.size; el.style.textShadow = "0 0 10px " + d.color; el.style.pointerEvents = "none"; return el;
      });

    const updateLayers = () => {
      world.arcsData(state.arcs ? dataStore.arcs : []);
      world.ringsData((state.eq ? dataStore.eqRings : []).concat(state.wiki ? dataStore.wiki : []));
      world.pointsData((state.eq ? dataStore.eqPoints : []).concat(state.nasa ? dataStore.nasa : []));
      world.pathsData(state.cables ? dataStore.cables : []);
      world.htmlElementsData(state.iss ? dataStore.iss : []);
    };

    const ARC_COUNT = 40;
    dataStore.arcs = [...Array(ARC_COUNT).keys()].map(() => ({ startLat: (Math.random()-0.5)*180, startLng: (Math.random()-0.5)*360, endLat: (Math.random()-0.5)*180, endLng: (Math.random()-0.5)*360, color: ["#00ffcc", "#ff00ff"] }));

    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson").then(r=>r.json()).then(data => {
      document.getElementById("eq-count").innerText = data.features.length;
      data.features.forEach(f => {
        const lat = f.geometry.coordinates[1], lng = f.geometry.coordinates[0];
        dataStore.eqRings.push({ lat, lng, maxR: Math.pow(f.properties.mag, 2)*0.1, color: () => t => `rgba(255, 50, 50, ${1-t})`, speed: 3, period: 800 });
        dataStore.eqPoints.push({ lat, lng, alt: 0.01, radius: 0.1, color: "rgba(255, 50, 50, 0.8)", label: `<div style="background:#000;padding:4px;border:1px solid red;color:white;border-radius:4px;">Mag: ${f.properties.mag}<br/>${f.properties.place}</div>` });
      });
      updateLayers();
    });

    fetch("https://www.submarinecablemap.com/api/v3/cable/cable-geo.json").then(r=>r.json()).then(data => {
      const paths = [];
      data.features.forEach(f => {
        if(f.geometry.type === "LineString") paths.push({coords: f.geometry.coordinates.map(c => [c[1], c[0]]), color: f.properties.color || "rgba(0, 255, 204, 0.4)"});
        else if(f.geometry.type === "MultiLineString") f.geometry.coordinates.forEach(line => paths.push({coords: line.map(c => [c[1], c[0]]), color: f.properties.color || "rgba(0, 255, 204, 0.4)"}));
      });
      dataStore.cables = paths.map(p => { p.coords.color = p.color; return p.coords; });
      document.getElementById("cable-count").innerText = data.features.length + " links";
      updateLayers();
    }).catch(e => { document.getElementById("cable-count").innerText = "API CORS Error"; });

    const updateISS = async () => {
      try {
        const r = await fetch("https://api.wheretheiss.at/v1/satellites/25544"); const data = await r.json();
        dataStore.iss = [{ lat: data.latitude, lng: data.longitude, html: "🛰️ ISS", color: "#fff", size: "26px" }];
        if(state.iss) document.getElementById("iss-alt").innerText = Math.round(data.altitude) + " km";
        updateLayers();
      } catch(e) {}
    }; setInterval(updateISS, 3000); updateISS();

    fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open").then(r=>r.json()).then(data => {
      const v = data.events.filter(ev => ev.geometries && ev.geometries.length > 0);
      document.getElementById("nasa-count").innerText = v.length;
      dataStore.nasa = v.map(ev => {
        const g = ev.geometries[0]; let lat=0, lng=0;
        if(g.type === "Point") { lng = g.coordinates[0]; lat = g.coordinates[1]; }
        else if(g.type === "Polygon") { lng = g.coordinates[0][0][0]; lat = g.coordinates[0][0][1]; }
        let color = "rgba(255, 165, 0, 0.8)";
        if(ev.categories[0].id.includes("fire") || ev.categories[0].id.includes("volcano")) color = "rgba(255, 0, 0, 0.9)";
        if(ev.categories[0].id.includes("storm")) color = "rgba(0, 150, 255, 0.9)";
        return { lat, lng, color, alt: 0.03, radius: 0.3, label: `<div style="background:#000;padding:4px;border:1px solid orange;color:white;border-radius:4px;">${ev.categories[0].title}<br/>${ev.title}</div>` };
      });
      updateLayers();
    }).catch(e => document.getElementById("nasa-count").innerText = "API Error");

    let wikiEdits = 0; const ws = new EventSource("https://stream.wikimedia.org/v2/stream/recentchange");
    let pr = [];
    setInterval(() => {
      if(!state.wiki) return;
      if(pr.length > 0) { dataStore.wiki.push(...pr); if(dataStore.wiki.length > 40) dataStore.wiki = dataStore.wiki.slice(-40); updateLayers(); pr = []; }
    }, 1000);
    ws.onmessage = (e) => {
      if(!state.wiki) return;
      try {
        const p = JSON.parse(e.data); if(p.type !== "edit") return;
        wikiEdits++; document.getElementById("wiki-count").innerText = wikiEdits;
        pr.push({ lat: (Math.random()-0.5)*160, lng: (Math.random()-0.5)*360, maxR: 5, color: () => t => `rgba(200, 100, 255, ${1-t})`, speed: 2, period: 1000 });
      } catch(err) {}
    };

    ["arcs", "eq", "cables", "iss", "wiki", "nasa"].forEach(k => {
      document.getElementById("toggle-" + k).addEventListener("change", (e) => { state[k] = e.target.checked; if(!state.wiki) dataStore.wiki = []; updateLayers(); });
    });
    updateLayers();
  </script>
</body>
</html>
"""
with open("c:/Users/loren/repos/CoolGlobe/index.html", "w", encoding="utf-8") as f:
    f.write(html_content)
print("done")
