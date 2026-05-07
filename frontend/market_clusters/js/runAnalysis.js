async function runAnalysis() {
  const sector = document.getElementById("dataset").value;
  const endDate = document.getElementById("year").value;

  const payload = {
    sector: sector,
    end_date: endDate
  };

  const response = await fetch("https://api.technovi.net/clusters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  // The response should be a JSON object with the structure:
  // {
  //   "clusters": {
  //     "AAPL": {
  //       "company": "Apple Inc.",
  //       "volatility": 0.2,
  //       "average_returns": 0.15,
  //       "max_drawdown": -0.1,
  //       "cluster": 0
  //     },
  //     ...
  //   },
  //   "cluster_averages": {
  //     "avg_returns": { "0": 0.12, "1": 0.08, "2": 0.05 },
  //     "avg_volatility": { "0": 0.18, "1": 0.25, "2": 0.3 },
  //     "avg_max_drawdown": { "0": -0.08, "1": -0.15, "2": -0.25 }
  //   }
  // }    ...
  const result = await response.json();

  if (result.error) {
    alert(result.error);
    return;
  }

  const raw = result.clusters;
  const tickers = Object.keys(raw);

  const volatility = tickers.map(t => raw[t].volatility);
  const average_returns = tickers.map(t => raw[t].average_returns);
  const max_drawdown = tickers.map(t => raw[t].max_drawdown);
  const clusters = tickers.map(t => raw[t].cluster);
  const companies = tickers.map(t => raw[t].company);

  const averages = result.cluster_averages;
  // The structure of averages should be:
  // {
  //   "avg_returns": { "0": 0.12, "1": 0.08, "2": 0.05 },
  //   "avg_volatility": { "0": 0.18, "1": 0.25, "2": 0.3 },
  //   "avg_max_drawdown": { "0": -0.08, "1": -0.15, "2": -0.25 }
  // }  
  const avgReturns = averages.avg_returns;
  const avgVolatility = averages.avg_volatility;
  const avgDrawdown = averages.avg_max_drawdown;
  const sharpe = {};
  Object.keys(avgReturns).forEach(c => {
    sharpe[c] = avgReturns[c] / avgVolatility[c];
  });
  // sharpe looks like this: { "0": 0.67, "1": 0.32, "2": 0.17 } based on avg_returns / avg_volatility


  function labelClusters(avgReturns, avgVolatility, avgDrawdown, sharpe) {
    const labels = {};
    const assigned = new Set();
    const clusters = Object.keys(avgReturns);

    // Rankings (highest priority first within each metric)
    const bySharpe = [...clusters].sort((a, b) => sharpe[b] - sharpe[a]);
    const byReturns = [...clusters].sort((a, b) => avgReturns[b] - avgReturns[a]);
    const byVol = [...clusters].sort((a, b) => avgVolatility[a] - avgVolatility[b]);
    const byDrawdown = [...clusters].sort((a, b) => avgDrawdown[a] - avgDrawdown[b]); 
    // ascending: worst drawdown first

    // 1️⃣ Sharpe (best risk-adjusted)
    const bestSharpe = bySharpe[0];
    if (!assigned.has(bestSharpe)) {
      labels[bestSharpe] = "🏆 Efficient";
      assigned.add(bestSharpe);
    }

    // 2️⃣ Returns (only top candidate)
    const topReturn = byReturns[0];
    if (!assigned.has(topReturn)) {
      labels[topReturn] = "🚀 Growth";
      assigned.add(topReturn);
    }

    // 3️⃣ Volatility (only lowest volatility)
    const safest = byVol[0];
    if (!assigned.has(safest)) {
      labels[safest] = "🛡️ Defensive";
      assigned.add(safest);
    }

    // 4️⃣ Drawdown (only worst drawdown)
    const worstDD = byDrawdown[0]; // most negative = worst
    if (!assigned.has(worstDD)) {
      labels[worstDD] = "🔥 Crash Risk";
      assigned.add(worstDD);
    }

    // 5️⃣ Remaining clusters → Balanced
    clusters.forEach(c => {
      if (!labels[c]) {
        labels[c] = "⚖️ Balanced";
      }
    });

    return labels;
  }

  const labels_semantic = labelClusters(avgReturns, avgVolatility, avgDrawdown, sharpe);

  const clusterColors = {
  0: "#440154",
  1: "#21908C",
  2: "#FDE725"
};

const legendOnly = [
  { name: "Cluster 1 " + labels_semantic[0], marker: { color: clusterColors[0] }, mode: "markers", x: [null], y: [null] },
  { name: "Cluster 2 " + labels_semantic[1], marker: { color: clusterColors[1] }, mode: "markers", x: [null], y: [null] },
  { name: "Cluster 3 " + labels_semantic[2], marker: { color: clusterColors[2] }, mode: "markers", x: [null], y: [null] }
];

  const trace = {
  x: volatility,
  y: average_returns,
  mode: "markers",
  type: "scatter",

  marker: {
    color: clusters.map(c => clusterColors[c]),   // cluster-based coloring
    size: max_drawdown.map(d => Math.abs(d) * 50), // scale this
    opacity: 0.8
  },

  text: tickers.map((t, i) =>
    `Company: ${companies[i]}<br>` +
    `Ticker: ${t}<br>` +
    `Cluster: ${clusters[i] + 1}<br>` +
    `Return: ${average_returns[i]}<br>` +
    `Volatility: ${volatility[i]}<br>` +
    `Drawdown: ${max_drawdown[i]}`
  ),

  hoverinfo: "text",
  showlegend: false
};

const layout = {
  autosize: true,
  margin: { t: 50, l: 70, r: 20, b: 60 },

  title: {
    text: "Market Clusters*"
  },

  xaxis: {
    title: { text: "Volatility", font: { size: 14 } },
    tickfont: { size: 12 }
  },

  yaxis: {
    title: { text: "Average Returns", font: { size: 14 } },
    tickfont: { size: 12 }
  },

  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",

  font: {
    color: "#333" // or "#fff" depending on theme
  }
};

const config = {
  responsive: true
};

Plotly.newPlot("clusterChart", [trace, ...legendOnly], layout, config);

// Stock Comparison Table

function createClusterBarChart(divId, title, dataObj, colorMap, yLabel) {
  const clusterIds = Object.keys(dataObj).sort();
  // values looks like this: [0.12, 0.08, 0.05] based on avg_returns
  const values = clusterIds.map(c => dataObj[c]);
  const colors = clusterIds.map(c => colorMap[c]);
  // colors looks like this: ["#440154", "#21908C", "#FDE725"] based on clusterColors

  const trace = {
    // x looks like this: ["Cluster 1", "Cluster 2", "Cluster 3"] based on clusterIds
    x: clusterIds.map(c => `Cl. ${parseInt(c) + 1}` + " " + labels_semantic[c]),
    y: values.map(v => v * 100), // convert to percentages to make it more readable
    type: "bar",
    marker: {
      color: colors
    }
  };

  const layout = {
    title: {
    text: title,
    font: { size: 16 }
    },
    margin: { t: 70, l: 70, r: 30, b: 70 },
    xaxis: {
      title: {
        text: "Clusters",
        font: { size: 14, color: "rgba(17,17,17,0.4)" }
      }
    },
    yaxis: {
      title: {
        text: yLabel,
        font: { size: 14, color: "rgba(17,17,17,0.4)" }
      }
    },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent"
  };

  Plotly.newPlot(divId, [trace], layout, { responsive: true });
}

createClusterBarChart(
  "returnsChart",
  "Average Returns by Cluster",
  avgReturns,
  clusterColors,
  "Average Annual Return (%)"
);

createClusterBarChart(
  "volatilityChart",
  "Average Volatility by Cluster",
  avgVolatility,
  clusterColors,
  "Annualized Volatility - std dev of returns (%)"
);

createClusterBarChart(
  "drawdownChart",
  "Average Max Drawdown by Cluster",
  avgDrawdown,
  clusterColors,
  "Max Drawdown (% drop from peak)"
);

function renderSharpeChart(divId, sharpeObj, colors) {

  const sorted = Object.entries(sharpeObj)
    .sort((a, b) => b[1] - a[1]);

  const clusters = sorted.map((i) => `Cl. ${parseInt(i[0]) + 1}` + " " + labels_semantic[i[0]] + " ");
  const values = sorted.map(([_, v]) => v);
  const barColors = sorted.map(([c]) => colors[c]);

  const trace = {
    x: values,
    y: clusters,
    type: "bar",
    orientation: "h",
    marker: {
      color: barColors
    },
    text: values.map(v => v.toFixed(2)),
    textposition: "auto"
  };

  const layout = {
    title: {
      text: "Risk-Adjusted Performance (Sharpe-like)",
      font: { size: 16, color: "#111" }
    },

    margin: { t: 60, l: 120, r: 30, b: 40 },

    xaxis: {
      title: {
        text: "Sharpe Ratio (Return / Volatility)",
        font: { size: 14, color: "#111" }
      },
      tickfont: { color: "#111" }
    },

    yaxis: {
      tickfont: { size: 12, color: "#111" }
    },

    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent"
  };

  Plotly.newPlot(divId, [trace], layout, { responsive: true });
}

renderSharpeChart("sharpeChart", sharpe, clusterColors);

const rollingData = result.rolling_avg_clustered;

function renderRollingChart(divId, rollingData, clusterColors) {

  const traces = Object.keys(rollingData).map(c => {
    const entries = Object.entries(rollingData[c]);

    // sort by date
    entries.sort((a, b) => new Date(a[0]) - new Date(b[0]));

    const dates = entries.map(e => e[0]);
    const values = entries.map(e => e[1] * 100);
    return {
    x: dates,
    y: values,
    mode: "lines",
    name: `Cl. ${parseInt(c) + 1}` + " " + labels_semantic[c],
    line: {
      color: clusterColors[c],
      width: 2
    }
  }});

  const layout = {
    title: {
      text: "Rolling Average - 20-day Returns by Cluster",
      font: { size: 16, color: "#111" }
    },

    xaxis: {
      title: { text: "Date" },
      showgrid: true,
      gridcolor: "rgba(200,200,200,0.15)",
      gridwidth: 1,
      zeroline: false
    },

    yaxis: {
      title: { text: "Rolling Return (%)" },
      tickformat: ".1f",
      ticksuffix: "%",
      showgrid: true,
      gridcolor: "rgba(120,120,120,0.25)",
      gridwidth: 1,
      zeroline: false
    },

    annotations: [

  {
    x: "2021-03-01",
    y: 1,
    xref: "x",
    yref: "paper",
    text: "COVID liquidity regime",
    showarrow: false,
    font: { color: "rgba(90,90,90,0.85)" }
  },

  {
    x: "2022-05-01",
    y: 1,
    xref: "x",
    yref: "paper",
    text: "Ukraine shock regime",
    showarrow: false,
    font: { color: "rgba(150,90,50,0.9)" }
  },

  {
    x: "2023-06-01",
    y: 1,
    xref: "x",
    yref: "paper",
    text: "Inflation tightening regime",
    showarrow: false,
    font: { color: "rgba(70,90,130,0.9)" }
  },

  {
  x: "2026-04-01",
  y: 1,
  xref: "x",
  yref: "paper",
  text: "Start of Iran conflict",
  showarrow: false,
  font: { color: "rgba(90,90,90,0.9)" }
}
  ],

    shapes: [

  // COVID LIQUIDITY REGIME (NOT crash)
  {
    type: "rect",
    xref: "x",
    yref: "paper",
    x0: "2020-10-01",
    x1: "2021-06-30",
    y0: 0,
    y1: 1,
    fillcolor: "rgba(120,120,120,0.22)",
    line: { width: 0 }
  },

  // UKRAINE SHOCK REGIME
  {
    type: "rect",
    xref: "x",
    yref: "paper",
    x0: "2022-02-01",
    x1: "2022-10-01",
    y0: 0,
    y1: 1,
    fillcolor: "rgba(180,100,60,0.22)",
    line: { width: 0 }
  },

  // INFLATION / RATE HIKE REGIME
  {
    type: "rect",
    xref: "x",
    yref: "paper",
    x0: "2023-01-01",
    x1: "2023-10-01",
    y0: 0,
    y1: 1,
    fillcolor: "rgba(80,100,140,0.22)",
    line: { width: 0 }
  },

  // IRAN CONFLICT REGIME
  {
  type: "line",
  xref: "x",
  yref: "y",
  x0: "2026-04-01",
  x1: "2026-04-01",
  y0: -1.5,
  y1: 1.5,
  line: {
    color: "rgba(90,90,90,0.9)",
    width: 2,
    dash: "dot"
  }
}

  ],

    margin: { t: 60, l: 70, r: 30, b: 60 },
    paper_bgcolor: "#fff",
    plot_bgcolor: "#fff",
  };

  Plotly.newPlot(divId, traces, layout, { responsive: true });
}

renderRollingChart("rollingChart", rollingData, clusterColors);

// Radar Chart
// We already have the 'averages' object which contains avg_returns, avg_volatility, and avg_max_drawdown for each cluster
// Radar charts only work if everything is on the same scale, so we need to normalize these values to a 0-1 range based on the min and max across all clusters
function normalize(obj) {
  const values = Object.values(obj);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const out = {};

  Object.keys(obj).forEach(k => {
    out[k] = (obj[k] - min) / (max - min + 1e-9);
  });
//   Why the + 1e-9?
// (max - min + 1e-9)
// That tiny number (0.000000001) prevents division by zero when:
// max=min, which would make the denominator zero and cause an error. By adding this small value, we ensure that the denominator is never exactly zero, allowing the normalization to proceed without issues even when all values are the same.
  return out;
}

const returns_normalized = normalize(avgReturns);
const volatility_normalized = normalize(avgVolatility);
const drawdown_normalized = normalize(avgDrawdown);

// invert risk (lower is better)
Object.keys(volatility_normalized).forEach(c => {
  volatility_normalized[c] = 1 - volatility_normalized[c];
});

const radarTraces = Object.keys(returns_normalized).map(c => ({
  type: "scatterpolar",

  r: [
    returns_normalized[c],
    volatility_normalized[c],
    drawdown_normalized[c]
  ],

  theta: [
  "Returns (↑ better)",
  "Stability (↑ better)",
  "Drawdown Control (↑ better)"
  ],

  fill: "toself",

  name: `Cluster ${parseInt(c) + 1}` + " " + labels_semantic[c],

  line: {
    color: clusterColors[parseInt(c)],
    width: 2
  },

  opacity: 0.7
}));

const radarLayout = {
  title: {
    text: "Cluster Risk–Return Profiles*"
  },

  polar: {
  radialaxis: {
    visible: true,
    range: [0, 1],
    ticks: "",
    showticklabels: false
  }
  },

  showlegend: true,

  margin: { t: 60, b: 40 }
};

Plotly.newPlot("radarChart", radarTraces, radarLayout, {
  responsive: true
});


// Finally, show insights summary

  const date = new Date(endDate);
  const year = date.getFullYear();

  function getRegime(dateStr) {
    const d = new Date(dateStr);

    const covidStart = new Date("2020-01-01");
    const covidEnd = new Date("2021-12-31");

    const UkraineShockStart = new Date("2022-01-01");
    const UkraineShockEnd = new Date("2022-12-31");

    const inflationStart = new Date("2023-01-01");
    const inflationEnd = new Date("2023-10-01");

    if (d >= covidStart && d <= covidEnd) {
      return "COVID liquidity regime";
    }

    if (d >= UkraineShockStart && d <= UkraineShockEnd) {
      return "Geopolitical shock regime";
    }

    if (d >= inflationStart && d <= inflationEnd) {
      return "Inflation tightening regime";
    }

    return "Pre-2020 baseline regime";
  }

  const regime = getRegime(endDate);

  const regimeText = `📊 Market context: ${regime}`;

    function formatPct(value) {
  return (value * 100).toFixed(1) + "%";
}

function formatNum(value) {
  return value.toFixed(2);
}

  const avg = result.cluster_averages;
  const labels = labels_semantic;

  const clusterGroups = {};

  tickers.forEach((t, i) => {
    const c = clusters[i];

    if (!clusterGroups[c]) {
      clusterGroups[c] = [];
    }

    clusterGroups[c].push({
      ticker: t,
      company: companies[i]
    });
  });

  const bestReturn = Object.keys(avg.avg_returns)
  .sort((a,b) => avg.avg_returns[b] - avg.avg_returns[a])[0];

  const bestSharpe = Object.keys(sharpe)
    .sort((a,b) => sharpe[b] - sharpe[a])[0];

  const lowestRisk = Object.keys(avg.avg_volatility)
    .sort((a,b) => avg.avg_volatility[a] - avg.avg_volatility[b])[0];

  const bestLabel = labels_semantic[bestSharpe] || "Unknown";

  const growthCluster = Object.keys(labels).find(c => labels[c] === "Growth");

  const defensiveCluster = Object.keys(labels).find(c => labels[c] === "Defensive");

  let insightsBlocks = [];
  Object.keys(labels_semantic).forEach(clusterId => {
    const label = labels_semantic[clusterId];

    const companiesList = (clusterGroups[clusterId] || [])
      .map(c => `${c.company} (${c.ticker})`)
      .join(", ");

    // 📊 Core metrics
    const ret = avgReturns[clusterId];
    const vol = avgVolatility[clusterId];
    const dd = avgDrawdown[clusterId];
    const sh = sharpe[clusterId];

    // 📈 Derived metrics (HIGH VALUE ADDITIONS)
    const returnToDD = Math.abs(ret / dd); // reward per drawdown risk
    const efficiencyRank = Object.keys(sharpe)
      .sort((a, b) => sharpe[b] - sharpe[a])
      .indexOf(clusterId) + 1;

    let text = "";

    if (label.includes("Growth")) {
      text = `🚀 Growth cluster: highest return potential, but with elevated volatility.`;
    }

    else if (label.includes("Defensive")) {
      text = `🛡 Defensive cluster: low volatility and strong downside protection.`;
    }

    else if (label.includes("Efficient")) {
      text = `🏆 Efficient cluster: The cluster that generates the highest return per unit of risk.`;
    }

    else if (label.includes("Crash")) {
      text = `🔥 Crash Risk cluster: significant drawdowns and elevated tail risk exposure.`;
    }

    else {
      text = `⚖️ Balanced cluster: moderate risk-return characteristics.`;
    }

    insightsBlocks.push(
      `${text}
      📊 Metrics:
      • Return: ${formatPct(ret)}
      • Volatility: ${formatPct(vol)}
      • Max Drawdown: ${formatPct(dd)}
      • Sharpe: ${formatNum(sh)}
      📈 Advanced:
      • Return / Drawdown: ${formatNum(returnToDD)}
      • Efficiency Rank: #${efficiencyRank}
      📌 Companies: ${companiesList || "N/A"}`
    );
  });

  const insightsText = `
    📊 Market context: ${regime}\n
    ${insightsBlocks.join("\n\n")}    
    `;

  document.getElementById("insights").innerText =
    `Cluster analysis completed for ${result.sector} (${year})` + insightsText;

}
