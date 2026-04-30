document.getElementById('stock-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const ticker = form.get('ticker');
  const start = form.get('start');
  const end = form.get('end');
  const rolling_window = parseInt(form.get('rolling-window'))

  fetch('https://api.technovi.net/api/stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // JS to Json string conversion
    body: JSON.stringify({ ticker, start, end, rolling_window })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('chart-title').textContent = `${data.full_name} - ${ticker}`;

    const traceClose = {
      x: data.Date,
      y: data.Close.map(val => val[0]),  // <- Flatten if it's a list of lists
      type: 'scatter',
      name: 'Close Price',
    };

    const traceSMA = {
      x: data.Date,
      y: data.SMA,
      type: 'scatter',
      name: 'SMA (Simple Moving Average) ' + String(rolling_window) + ' days',
    };

    Plotly.newPlot('chart', [traceClose, traceSMA]);
  })
  .catch(error => {
    console.error('Fetch or parsing error:', error);
  });
});
