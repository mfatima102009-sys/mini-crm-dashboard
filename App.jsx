import { useEffect, useMemo, useState } from "react";

const emptyForm = { name: "", email: "", phone: "", business_name: "", status: "New" };
const statusClass = (status) => status.toLowerCase();

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadLeads() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load leads.");
      setLeads(data);
    } catch (err) {
      setError(err.message || "Something went wrong while loading leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLeads(); }, []);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const term = search.toLowerCase();
    const matchesSearch = lead.name.toLowerCase().includes(term) || lead.email.toLowerCase().includes(term);
    return matchesSearch && (filter === "All" || lead.status === filter);
  }), [leads, search, filter]);

  const newCount = leads.filter((lead) => lead.status === "New").length;
  const convertedCount = leads.filter((lead) => lead.status === "Converted").length;

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(lead) {
    setEditingId(lead.id);
    setForm({ name: lead.name, email: lead.email, phone: lead.phone, business_name: lead.business_name, status: lead.status });
    setModalOpen(true);
  }

  async function saveLead(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(editingId ? `/api/leads/${editingId}` : "/api/leads", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save lead.");
      setModalOpen(false);
      await loadLeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(lead, status) {
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update status.");
      setLeads((current) => current.map((item) => item.id === lead.id ? data : item));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteLead(id) {
    if (!window.confirm("Delete this lead? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete lead.");
      setLeads((current) => current.filter((lead) => lead.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">O</span><span>orbit<span className="brand-light">crm</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="nav-item active"><span>▦</span> Overview</div>
        <div className="nav-item"><span>♙</span> Leads <span className="nav-count">{leads.length}</span></div>
        <div className="sidebar-bottom"><div className="avatar">OC</div><div><strong>Orbit Company</strong><small>Free workspace</small></div><span className="dots">•••</span></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="topbar-right"><span className="today-label">LEAD MANAGEMENT</span><div className="profile-avatar">OC</div></div></header>
        <section className="page-heading">
          <div><p className="eyebrow">YOUR BUSINESS AT A GLANCE</p><h1>Lead overview</h1><p className="subheading">Track enquiries, build relationships, and grow your business.</p></div>
          <button className="primary-button" onClick={openAdd}><span>＋</span> Add new lead</button>
        </section>

        {error && <div className="alert"><span>!</span><div>{error}</div><button onClick={() => setError("")}>×</button></div>}

        <section className="stats-grid">
          <StatCard label="Total leads" value={leads.length} icon="♙" note="All enquiries in your CRM" tone="violet" />
          <StatCard label="New leads" value={newCount} icon="✦" note="Waiting for first contact" tone="blue" />
          <StatCard label="Converted customers" value={convertedCount} icon="↗" note="Successfully converted" tone="green" />
        </section>

        <section className="leads-panel">
          <div className="panel-heading"><div><h2>All leads</h2><p>A central place to manage your potential customers.</p></div><span className="lead-total">{leads.length} RECORDS</span></div>
          <div className="toolbar">
            <div className="search-wrap"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." aria-label="Search leads" /></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status"><option>All</option><option>New</option><option>Contacted</option><option>Converted</option></select>
          </div>
          {loading ? <div className="state-message"><div className="spinner" />Loading your leads...</div> :
            filteredLeads.length === 0 ? <div className="empty-state"><div className="empty-icon">♧</div><h3>{leads.length === 0 ? "No leads yet" : "No matching leads"}</h3><p>{leads.length === 0 ? "Add your first lead to start building your customer pipeline." : "Try a different search term or status filter."}</p>{leads.length === 0 && <button className="secondary-button" onClick={openAdd}>＋ Add your first lead</button>}</div> :
            <div className="table-scroll"><table><thead><tr><th>CONTACT</th><th>BUSINESS</th><th>PHONE</th><th>STATUS</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>
              {filteredLeads.map((lead) => <tr key={lead.id}>
                <td><div className="contact-cell"><div className="contact-avatar">{lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}</div><div><strong>{lead.name}</strong><small>{lead.email}</small></div></div></td>
                <td className="business-cell">{lead.business_name}</td><td className="phone-cell">{lead.phone}</td>
                <td><select className={`status-select ${statusClass(lead.status)}`} value={lead.status} onChange={(e) => updateStatus(lead, e.target.value)} aria-label={`Status for ${lead.name}`}><option>New</option><option>Contacted</option><option>Converted</option></select></td>
                <td><div className="row-actions"><button onClick={() => openEdit(lead)} aria-label={`Edit ${lead.name}`} title="Edit">✎</button><button onClick={() => deleteLead(lead.id)} aria-label={`Delete ${lead.name}`} title="Delete">⌫</button></div></td>
              </tr>)}
            </tbody></table></div>}
          <div className="panel-footer"><span>Showing {filteredLeads.length} of {leads.length} leads</span><span>Changes are saved to your database</span></div>
        </section>
        <footer className="footer">ORBIT CRM <span>·</span> MINI CRM DASHBOARD</footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModalOpen(false)}><div className="modal">
        <div className="modal-heading"><div><p className="eyebrow">{editingId ? "UPDATE CONTACT" : "NEW CONTACT"}</p><h2>{editingId ? "Edit lead" : "Add a lead"}</h2></div><button className="close-button" onClick={() => setModalOpen(false)}>×</button></div>
        <form onSubmit={saveLead}>
          <label>Full name<input required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Alex Morgan" /></label>
          <label>Email address<input required type="email" maxLength="254" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@company.com" /></label>
          <label>Phone number<input required type="tel" maxLength="30" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 010 2020" /></label>
          <label>Business name<input required maxLength="120" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Company or organization" /></label>
          <label>Lead status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>New</option><option>Contacted</option><option>Converted</option></select></label>
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Add lead"}</button></div>
        </form>
      </div></div>}
    </div>
  );
}

function StatCard({ label, value, icon, note, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}
