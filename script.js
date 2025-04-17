let data = [];

// 1. Load the CSV once on page load
Papa.parse('netflix_titles.csv', {
  header: true,
  download: true,
  complete: results => {
    data = results.data.map(d => ({
      title: d.title,
      listed_in: d.listed_in || '',
      description: d.description || '',
      director: d.director || '—',
      country: d.country || '—',
      duration: d.duration || '—',
      release_year: parseInt(d.release_year, 10) || 0
    })).filter(d => d.release_year > 0);
  }
});

// 2. Recommendation logic
function recommend(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t);
  // filter where every term appears in combined text
  let candidates = data.filter(d => {
    const txt = (d.listed_in + ' ' + d.description).toLowerCase();
    return terms.every(t => txt.includes(t));
  });
  // sort by year desc
  candidates.sort((a,b) => b.release_year - a.release_year);
  // pick one per year until we have 10
  const seen = new Set();
  const out = [];
  for (let item of candidates) {
    if (!seen.has(item.release_year)) {
      seen.add(item.release_year);
      out.push(item);
      if (out.length === 10) break;
    }
  }
  return out;
}

// 3. Render table
function renderTable(list) {
  if (!list.length) {
    return `<p>No recommendations found.</p>`;
  }
  let html = `<table>
    <thead>
      <tr>
        <th>Year</th><th>Title</th><th>Genres</th><th>Director</th>
        <th>Country</th><th>Duration</th>
      </tr>
    </thead>
    <tbody>`;
  for (let d of list) {
    html += `<tr>
      <td>${d.release_year}</td>
      <td>${d.title}</td>
      <td>${d.listed_in}</td>
      <td>${d.director}</td>
      <td>${d.country}</td>
      <td>${d.duration}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// 4. Wire up the button
document.getElementById('go').addEventListener('click', () => {
  const q = document.getElementById('query').value.trim();
  if (!q) {
    document.getElementById('results').innerHTML = `<p>Please enter a query.</p>`;
    return;
  }
  const recs = recommend(q);
  document.getElementById('results').innerHTML = renderTable(recs);
});
