import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vc_dashboard_v8';
const RELATIONSHIP_TYPES = ["VC", "Candidate", "Talent Partner", "Placement", "Client", "Other"];
const STATUS_CYCLE = ["Not contacted", "Warm", "Outreach sent", "Meeting scheduled", "Relationship active"];
const CHECKIN_DAYS = 90;

const STYLES = `
  :root{
    --bg:#0b0d14; --surface-1:#11141d; --surface-2:#161a26;
    --border:#232838; --border-strong:#323a52;
    --text-primary:#f2f3f7; --text-secondary:#a3aac0; --text-muted:#6b7287;
    --accent:#4d8df0; --accent-bg:rgba(77,141,240,0.14); --accent-text:#9cc1ff;
    --amber-bg:rgba(245,158,11,0.14); --amber-text:#fbbf6b;
    --teal-bg:rgba(20,184,166,0.16); --teal-text:#5eead4;
    --purple-bg:rgba(168,139,250,0.16); --purple-text:#c4b5fd;
    --red-bg:rgba(248,113,113,0.14); --red-text:#fca5a5;
    --pink-bg:rgba(244,114,182,0.14); --pink-text:#f9a8d4;
    --radius:8px;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text-primary);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5}
  .wrap{max-width:780px;margin:0 auto;padding:2rem 1.25rem 4rem}
  h1{font-size:20px;font-weight:500;margin:0 0 4px}
  .sub{color:var(--text-muted);font-size:13px;margin:0 0 1.5rem}
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1.25rem}
  .tab{border:0.5px solid var(--border-strong);background:transparent;color:var(--text-secondary);border-radius:var(--radius);padding:7px 14px;font-size:13px;cursor:pointer;font-family:inherit}
  .tab.active{border-color:var(--accent);background:var(--accent-bg);color:var(--accent-text)}
  .filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1rem}
  .filter-chip{border:0.5px solid var(--border-strong);background:var(--surface-1);color:var(--text-secondary);border-radius:var(--radius);padding:4px 10px;font-size:12px;cursor:pointer;font-family:inherit}
  .filter-chip.active{border-color:var(--accent);background:var(--accent-bg);color:var(--accent-text)}
  .row{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;gap:12px;flex-wrap:wrap}
  .row p{font-size:13px;color:var(--text-secondary);margin:0}
  button.action{font-size:13px;border:0.5px solid var(--border-strong);background:var(--surface-2);color:var(--text-primary);border-radius:var(--radius);padding:6px 12px;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;white-space:nowrap}
  button.action:hover{background:var(--surface-1)}
  button.action:disabled{opacity:0.5;cursor:not-allowed}
  .card{background:var(--surface-2);border:0.5px solid var(--border);border-radius:12px;padding:1rem 1.25rem;margin-bottom:8px}
  .card.overdue{border-color:rgba(248,113,113,0.4)}
  .card-flex{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .field-input{background:transparent;border:none;border-bottom:0.5px solid transparent;color:var(--text-primary);font-family:inherit;font-size:15px;font-weight:500;padding:2px 0;width:100%}
  .field-input:hover{border-bottom-color:var(--border-strong)}
  .field-input:focus{outline:none;border-bottom-color:var(--accent)}
  .field-sub{background:transparent;border:none;border-bottom:0.5px solid transparent;color:var(--text-secondary);font-family:inherit;font-size:13px;padding:2px 0;width:100%;margin-top:2px}
  .field-sub:hover{border-bottom-color:var(--border-strong)}
  .field-sub:focus{outline:none;border-bottom-color:var(--accent)}
  .linkedin-row{display:flex;align-items:center;gap:6px;margin-top:6px}
  .field-link{background:transparent;border:none;border-bottom:0.5px solid transparent;color:var(--accent-text);font-family:inherit;font-size:13px;padding:2px 0;width:100%}
  .field-link:hover{border-bottom-color:var(--border-strong)}
  .field-link:focus{outline:none;border-bottom-color:var(--accent)}
  .notes-area{background:var(--surface-1);border:0.5px solid var(--border);border-radius:6px;color:var(--text-secondary);font-family:inherit;font-size:13px;padding:8px 10px;width:100%;margin-top:8px;min-height:44px;resize:vertical}
  .notes-area:focus{outline:none;border-color:var(--border-strong)}
  .meta-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:8px}
  .last-met{font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:5px}
  .badge{font-size:12px;padding:2px 8px;border-radius:var(--radius);display:inline-block;border:none;cursor:pointer;font-family:inherit}
  .type-select{font-size:11px;padding:2px 7px;border-radius:var(--radius);display:inline-block;border:none;cursor:pointer;font-family:inherit}
  .reminder-badge{font-size:11px;padding:2px 8px;border-radius:var(--radius);display:inline-flex;align-items:center;gap:4px}
  .b-gray{background:var(--surface-1);color:var(--text-secondary)}
  .b-amber{background:var(--amber-bg);color:var(--amber-text)}
  .b-blue{background:var(--accent-bg);color:var(--accent-text)}
  .b-purple{background:var(--purple-bg);color:var(--purple-text)}
  .b-teal{background:var(--teal-bg);color:var(--teal-text)}
  .b-red{background:var(--red-bg);color:var(--red-text)}
  .b-pink{background:var(--pink-bg);color:var(--pink-text)}
  .iconbtn{background:none;border:none;cursor:pointer;padding:4px;color:var(--text-muted);display:flex;align-items:center;font-size:12px;font-family:inherit}
  .iconbtn:hover{color:var(--text-primary)}
  .empty{font-size:13px;color:var(--text-muted)}
  a{color:var(--accent-text);text-decoration:none;font-size:13px}
  a:hover{text-decoration:underline}
  .news-item{border-left:2px solid var(--border-strong);padding:0 0 0 12px;margin-bottom:14px}
  .news-head{display:flex;justify-content:space-between;gap:8px}
  .news-title{font-weight:500;font-size:14px;margin:0}
  .news-date{font-size:12px;color:var(--text-muted);white-space:nowrap}
  .news-detail{font-size:13px;color:var(--text-secondary);margin:4px 0 0}
  .tag-cat{font-size:11px;padding:2px 7px;border-radius:var(--radius);display:inline-block;margin-bottom:4px}
  .date-input{background:transparent;border:none;color:var(--text-muted);font-family:inherit;font-size:12px;cursor:pointer}
  .error-box{background:var(--red-bg);color:var(--red-text);border-radius:var(--radius);padding:10px 12px;font-size:13px;margin-bottom:12px}
`;

function todayISO() { return new Date().toISOString().slice(0, 10); }
function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
}
function fmtDate(dateStr) {
  if (!dateStr) return "Never logged";
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const defaultData = {
  people: [
    { id: 1, name: "Sarah McDonald", type: "VC", firm: "General Catalyst", linkedin: "https://www.linkedin.com/in/sarah-mcdonald-610b63b2/", note: "Ex-Daversa, 6 years. Warmest relationship.", status: "Relationship active", lastMet: "2026-06-10" },
    { id: 2, name: "Eric Soni", type: "VC", firm: "ICONIQ Capital", linkedin: "https://www.linkedin.com/in/ericsoni/", note: "", status: "Warm", lastMet: "" },
    { id: 3, name: "Paula Judge", type: "VC", firm: "Accel", linkedin: "https://www.linkedin.com/in/paulajudge/", note: "", status: "Warm", lastMet: "" },
    { id: 4, name: "Jenna Zucker", type: "VC", firm: "a16z", linkedin: "", note: "LinkedIn not confirmed yet.", status: "Outreach sent", lastMet: "" },
    { id: 5, name: "Lauren Illovsky", type: "VC", firm: "CapitalG", linkedin: "https://www.linkedin.com/in/laurenillovsky/", note: "", status: "Not contacted", lastMet: "" },
  ],
  raises: [
    { id: 1, company: "Ramp", round: "Growth round, $750M at $44B valuation", investors: "Iconiq, GIC, Ontario Teachers' Pension Plan", founders: "Karim Atiyeh and Eric Glyman, co-founders", link: "https://news.crunchbase.com/venture/biggest-funding-rounds-june-5-2026/", status: "Not contacted" },
  ],
  news: [],
  lastNewsRefresh: null,
};

export default function Dashboard() {
  const [data, setData] = useState(defaultData);
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setData(JSON.parse(raw)); } catch (e) {}
    }
  }, []);

  function save(next) {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function updateField(arr, id, field, value) {
    const next = { ...data, [arr]: data[arr].map(item => item.id === id ? { ...item, [field]: value } : item) };
    save(next);
  }
  function cycleStatus(arr, id) {
    const item = data[arr].find(x => x.id === id);
    const i = STATUS_CYCLE.indexOf(item.status);
    updateField(arr, id, 'status', STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length]);
  }
  function deleteItem(arr, id) {
    save({ ...data, [arr]: data[arr].filter(x => x.id !== id) });
  }
  function logMeeting(id) {
    updateField('people', id, 'lastMet', todayISO());
  }
  function addPerson() {
    const next = { ...data, people: [{ id: Date.now(), name: "New contact", type: "Other", firm: "", linkedin: "", note: "", status: "Not contacted", lastMet: "" }, ...data.people] };
    save(next);
  }
  function addRaise() {
    const next = { ...data, raises: [{ id: Date.now(), company: "New company", round: "", investors: "", founders: "", link: "", status: "Not contacted" }, ...data.raises] };
    save(next);
  }

  async function refreshNews() {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch('/api/refresh-news', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Refresh failed');
      save({ ...data, news: json.items, lastNewsRefresh: new Date().toISOString() });
    } catch (err) {
      setRefreshError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  const statusColorMap = { "Not contacted": "gray", "Warm": "amber", "Outreach sent": "blue", "Meeting scheduled": "purple", "Relationship active": "teal" };
  const typeColorMap = { "VC": "blue", "Candidate": "purple", "Talent Partner": "pink", "Placement": "teal", "Client": "amber", "Other": "gray" };
  const catColorMap = { "Funding": "b-blue", "M&A": "b-purple", "Exec move": "b-amber" };

  const filterOptions = ["All", ...RELATIONSHIP_TYPES];
  const filteredPeople = activeFilter === 'All' ? data.people : data.people.filter(p => p.type === activeFilter);
  const overdueCount = data.people.filter(p => { const d = daysSince(p.lastMet); return d !== null && d >= CHECKIN_DAYS; }).length;
  const sortedNews = [...data.news].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="wrap">
      <style>{STYLES}</style>
      <h1>Relationship dashboard</h1>
      <p className="sub">Click any field to edit. Everything saves automatically.</p>

      <div className="tabs">
        {[{ key: 'all', label: 'All relationships' }, { key: 'raises', label: 'Recent raises' }, { key: 'news', label: 'News and updates' }].map(t => (
          <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => { setActiveTab(t.key); setActiveFilter('All'); }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'all' && (
        <>
          <div className="filters">
            {filterOptions.map(f => (
              <button key={f} className={`filter-chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="row">
            <p>{overdueCount > 0 ? `${overdueCount} relationship${overdueCount > 1 ? 's' : ''} overdue for a check-in (90+ days).` : 'All relationships are within their check-in window.'}</p>
            <button className="action" onClick={addPerson}>+ Add person</button>
          </div>
          {filteredPeople.length === 0 && <p className="empty">Nothing here yet.</p>}
          {filteredPeople.map(item => {
            const days = daysSince(item.lastMet);
            const overdue = days !== null && days >= CHECKIN_DAYS;
            return (
              <div key={item.id} className={`card ${overdue ? 'overdue' : ''}`}>
                <div className="card-flex">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input className="field-input" value={item.name} onChange={e => updateField('people', item.id, 'name', e.target.value)} />
                      <select className={`type-select b-${typeColorMap[item.type]}`} value={item.type} onChange={e => updateField('people', item.id, 'type', e.target.value)}>
                        {RELATIONSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <input className="field-sub" placeholder="Firm / company" value={item.firm} onChange={e => updateField('people', item.id, 'firm', e.target.value)} />
                    <div className="linkedin-row">
                      <span>🔗</span>
                      <input className="field-link" placeholder="LinkedIn URL" value={item.linkedin} onChange={e => updateField('people', item.id, 'linkedin', e.target.value)} />
                      {item.linkedin && <a href={item.linkedin} target="_blank" rel="noopener noreferrer">Open ↗</a>}
                    </div>
                    <textarea className="notes-area" placeholder="Notes..." value={item.note} onChange={e => updateField('people', item.id, 'note', e.target.value)} />
                    <div className="meta-row">
                      <span className="last-met">Last met:</span>
                      <input type="date" className="date-input" value={item.lastMet || ''} onChange={e => updateField('people', item.id, 'lastMet', e.target.value)} />
                      {days === null ? (
                        <span className="reminder-badge b-gray">No check-in logged</span>
                      ) : overdue ? (
                        <span className="reminder-badge b-red">⚠ Overdue for check-in ({days}d)</span>
                      ) : (
                        <span className="reminder-badge b-gray">Next check-in in {CHECKIN_DAYS - days}d</span>
                      )}
                      <button className="iconbtn" onClick={() => logMeeting(item.id)}>Log meeting today</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button className={`badge b-${statusColorMap[item.status]}`} onClick={() => cycleStatus('people', item.id)}>{item.status}</button>
                    <button className="iconbtn" aria-label="Remove" onClick={() => deleteItem('people', item.id)}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {activeTab === 'raises' && (
        <>
          <div className="row">
            <p>Companies that recently closed rounds, with investors and founder info.</p>
            <button className="action" onClick={addRaise}>+ Add raise</button>
          </div>
          {data.raises.length === 0 && <p className="empty">Nothing here yet.</p>}
          {data.raises.map(item => (
            <div key={item.id} className="card">
              <div className="card-flex">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input className="field-input" value={item.company} onChange={e => updateField('raises', item.id, 'company', e.target.value)} />
                  <input className="field-sub" placeholder="Round and amount" value={item.round} onChange={e => updateField('raises', item.id, 'round', e.target.value)} />
                  <input className="field-sub" placeholder="Investors" value={item.investors} onChange={e => updateField('raises', item.id, 'investors', e.target.value)} />
                  <input className="field-sub" placeholder="Founders" value={item.founders} onChange={e => updateField('raises', item.id, 'founders', e.target.value)} />
                  <input className="field-link" placeholder="Article link" value={item.link} onChange={e => updateField('raises', item.id, 'link', e.target.value)} />
                  {item.link && <p style={{ margin: '4px 0 0' }}><a href={item.link} target="_blank" rel="noopener noreferrer">Open ↗</a></p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button className={`badge b-${statusColorMap[item.status]}`} onClick={() => cycleStatus('raises', item.id)}>{item.status}</button>
                  <button className="iconbtn" aria-label="Remove" onClick={() => deleteItem('raises', item.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === 'news' && (
        <>
          <div className="row">
            <p>{data.lastNewsRefresh ? `Last refreshed ${new Date(data.lastNewsRefresh).toLocaleString()}` : 'Not refreshed yet. Click refresh to pull the last two weeks of funding, M&A, and exec moves.'}</p>
            <button className="action" onClick={refreshNews} disabled={refreshing}>{refreshing ? 'Searching...' : '↻ Refresh'}</button>
          </div>
          {refreshError && <div className="error-box">Refresh failed: {refreshError}</div>}
          {sortedNews.length === 0 && !refreshing && <p className="empty">No items yet. Click refresh.</p>}
          {sortedNews.map((item, i) => (
            <div key={i} className="news-item">
              <span className={`tag-cat ${catColorMap[item.category] || 'b-gray'}`}>{item.category}</span>
              <div className="news-head"><p className="news-title">{item.headline}</p><span className="news-date">{fmtDate(item.date)}</span></div>
              <p className="news-detail">{item.detail}</p>
              {item.link && <p style={{ margin: '4px 0 0' }}><a href={item.link} target="_blank" rel="noopener noreferrer">Source ↗</a></p>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
