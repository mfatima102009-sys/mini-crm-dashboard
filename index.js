require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const allowedStatuses = ["New", "Contacted", "Converted"];

function validateLead(body) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const business_name = String(body.business_name || "").trim();
  const status = String(body.status || "New");
  if (!name || !email || !phone || !business_name) return "Please complete every field.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
  if (!allowedStatuses.includes(status)) return "Please choose a valid lead status.";
  return null;
}

function ready(res) {
  if (!supabase) {
    res.status(503).json({ error: "Database is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file." });
    return false;
  }
  return true;
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/leads", async (_req, res) => {
  if (!ready(res)) return;
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/leads", async (req, res) => {
  if (!ready(res)) return;
  const issue = validateLead(req.body);
  if (issue) return res.status(400).json({ error: issue });
  const payload = {
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    phone: req.body.phone.trim(),
    business_name: req.body.business_name.trim(),
    status: req.body.status || "New"
  };
  const { data, error } = await supabase.from("leads").insert(payload).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/leads/:id", async (req, res) => {
  if (!ready(res)) return;
  const issue = validateLead(req.body);
  if (issue) return res.status(400).json({ error: issue });
  const payload = {
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    phone: req.body.phone.trim(),
    business_name: req.body.business_name.trim(),
    status: req.body.status
  };
  const { data, error } = await supabase.from("leads").update(payload).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Lead not found." });
  res.json(data);
});

app.delete("/api/leads/:id", async (req, res) => {
  if (!ready(res)) return;
  const { data, error } = await supabase.from("leads").delete().eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Lead not found." });
  res.json({ message: "Lead deleted." });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`CRM API listening on port ${port}`));
