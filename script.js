const BERTHS = ["LB","MB","UB","LB","MB","UB","SL","SU"];
const SEATS  = 40;
const FARE   = { SL: 180, "3A": 520, "2A": 780 };

const coachData = {};
const tickets   = [];
const waitlist  = [];
let curCoach = "S1";

/* ---- PRE-FILL Vijayawada → Hyderabad / S1 only ---- */
const DUMMY = [
  "Ravi Kumar","Priya Sharma","Arjun Reddy","Sneha Patel","Kiran Rao",
  "Anjali Singh","Suresh Nair","Meena Iyer","Vijay Menon","Lakshmi Devi",
  "Rahul Gupta","Pooja Verma","Arun Krishnan","Divya Bose","Sanjay Mishra",
  "Kavya Pillai","Manoj Tiwari","Swathi Anand","Deepak Joshi","Rekha Das",
  "Aditya Pandey","Bhavana Rao","Harish Kumar","Shalini Shah","Nikhil Mehta",
  "Vasudha Nair","Prasad Reddy","Geeta Krishnan","Ashok Varma","Lalitha Menon",
  "Tarun Kapoor","Usha Shetty","Vinod Pillai","Nandini Rao","Ramesh Babu",
  "Sunitha Reddy","Ganesh Iyer","Padmaja Devi","Subramaniam K","Hemavathi G"
];

const FULL_ROUTE = "Vijayawada → Hyderabad";
const mkPNR = (n) => "PNR" + (n || Math.floor(1e5 + Math.random() * 9e5));

coachData[FULL_ROUTE] = { S1: {}, S2: {}, S3: {} };

DUMMY.forEach((name, i) => {
  const seat = i + 1;
  const pnr  = mkPNR(100000 + i);
  coachData[FULL_ROUTE]["S1"][seat] = { pnr, name };
  tickets.push({
    pnr, name,
    age:    18 + (i % 55),
    gender: i % 3 === 0 ? "Female" : "Male",
    route:  FULL_ROUTE,
    coach:  "S1",
    seat, berth: BERTHS[i % 8],
    date:   "2026-03-20",
    cls:    "SL", fare: 180,
    status: "CONFIRMED",
    priority: null,
    prob: { label: "Very High", pct: 95, color: "var(--green)" }
  });
});

/* ---- UTILITY FUNCTIONS ---- */
const today     = () => new Date().toISOString().split("T")[0];
const getPrio   = (age, gender) => age >= 60 ? 1 : gender === "Female" ? 2 : 3;
const prioLabel = (p) => p === 1 ? "Senior" : p === 2 ? "Female" : "General";

const getCoach = (route, coach) => {
  if (!coachData[route])        coachData[route] = {};
  if (!coachData[route][coach]) coachData[route][coach] = {};
  return coachData[route][coach];
};

const freeSeats = (route, coach) =>
  SEATS - Object.keys(getCoach(route, coach)).length;

/* ---- PROBABILITY FUNCTIONS ---- */

// Compartment-level probability based on fill percentage
function getCompartmentProbability(route, coach) {
  const booked = Object.keys(getCoach(route, coach)).length;
  const fillPct = Math.round((booked / SEATS) * 100);
  if (fillPct <= 40) {
    return { label: "Very High", pct: 95, color: "var(--green)" };
  }
  else if (fillPct <= 70) {
    return { label: "High", pct: 80, color: "var(--blue)" };
  }
  else if (fillPct <= 90) {
    return { label: "Medium", pct: 60, color: "var(--accent)" };
  }
  else {
    return { label: "Low", pct: 25, color: "var(--red)" };
  }
}

// For CONFIRMED tickets: based on how full the coach is at time of booking
function getConfirmedProb(route, coach) {
  const booked  = Object.keys(getCoach(route, coach)).length;
  const fillPct = Math.round((booked / SEATS) * 100);
  if (fillPct <= 40) {
    const pct = Math.floor(90 + Math.random() * 10); // 90-99%
    return { label: "Very High", pct, color: "var(--green)" };
  } else if (fillPct <= 70) {
    const pct = Math.floor(70 + Math.random() * 20); // 70-89%
    return { label: "High", pct, color: "var(--blue)" };
  } else {
    const pct = Math.floor(50 + Math.random() * 20); // 50-69%
    return { label: "Moderate", pct, color: "var(--accent)" };
  }
}

// For WAITLIST tickets: based on position in waitlist for that route+coach
function getWaitlistProb(pos) {
  if (pos <= 2) {
    const pct = Math.floor(80 + Math.random() * 11); // 80-90%
    return { label: "High", pct, color: "var(--green)" };
  } else if (pos <= 5) {
    const pct = Math.floor(40 + Math.random() * 21); // 40-60%
    return { label: "Medium", pct, color: "var(--accent)" };
  } else {
    const pct = Math.floor(10 + Math.random() * 11); // 10-20%
    return { label: "Low", pct, color: "var(--red)" };
  }
}

/* ---- SEAT MAP ---- */
function switchCoach(coach, btn) {
  curCoach = coach;
  document.querySelectorAll(".ctab").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-selected","false");
  });
  btn.classList.add("active");
  btn.setAttribute("aria-selected","true");
  document.getElementById("sCoach").value = coach;
  renderSeats();
  checkHint();
}

function renderSeats() {
  const grid  = document.getElementById("seatGrid");
  grid.innerHTML = "";
  const route  = document.getElementById("trainSel").value;
  const booked = route ? getCoach(route, curCoach) : {};
  let free = 0;

  for (let i = 1; i <= SEATS; i++) {
    if (i > 1 && (i - 1) % 8 === 0) {
      const g = document.createElement("div");
      g.className = "comp-gap";
      grid.appendChild(g);
    }
    const berth = BERTHS[(i-1) % 8];
    const isB   = !!booked[i];
    if (!isB) free++;
    const s = document.createElement("div");
    s.className = "seat " + (isB ? "booked" : "avail");
    s.id = "seat-" + i;
    s.setAttribute("aria-label", `Seat ${i} ${berth} ${isB ? "Booked" : "Available"}`);
    s.title = isB ? `Booked: ${booked[i].name}` : `Seat ${i} · ${berth}`;
    s.innerHTML = `<span class="seat-n">${i}</span><span class="seat-b">${berth}</span>`;
    grid.appendChild(s);
  }
  document.getElementById("coachLbl").textContent =
    `Coach ${curCoach} · ${free} free / ${SEATS}`;
}

/* ---- FORM VALIDATION ---- */
const RULES = {
  train:  { get: () => document.getElementById("trainSel").value, check: v => v !== "",               id: "e-train"  },
  date:   { get: () => document.getElementById("jDate").value,    check: v => v && v >= today(),       id: "e-date"   },
  name:   { get: () => document.getElementById("pName").value,    check: v => v.trim().length >= 3,    id: "e-name"   },
  age:    { get: () => document.getElementById("pAge").value,     check: v => +v >= 1 && +v <= 120,    id: "e-age"    },
  phone:  { get: () => document.getElementById("pPhone").value,   check: v => /^[6-9]\d{9}$/.test(v), id: "e-phone"  },
  aadhar: { get: () => document.getElementById("pAadhar").value,  check: v => /^\d{12}$/.test(v),      id: "e-aadhar" }
};

function validateAll() {
  let ok = true;
  const inputIds = { train:"trainSel", date:"jDate", name:"pName", age:"pAge", phone:"pPhone", aadhar:"pAadhar" };
  for (const [key, rule] of Object.entries(RULES)) {
    const pass = rule.check(rule.get());
    document.getElementById(rule.id).classList.toggle("show", !pass);
    const inp = document.getElementById(inputIds[key]);
    if (inp) { inp.classList.toggle("err", !pass); inp.classList.toggle("ok", pass); }
    if (!pass) ok = false;
  }
  return ok;
}

/* ---- BOOK TICKET ---- */
function handleBook() {
  try {
    if (!validateAll()) { toast("Fix the errors above.", "error"); return; }

    const route  = document.getElementById("trainSel").value;
    const date   = document.getElementById("jDate").value;
    const name   = document.getElementById("pName").value.trim();
    const age    = parseInt(document.getElementById("pAge").value);
    const gender = document.getElementById("pGender").value;
    const cls    = document.getElementById("sCls").value;
    const coach  = document.getElementById("sCoach").value;
    const count  = parseInt(document.getElementById("tCount").value);
    const pnr    = mkPNR();
    const fare   = FARE[cls];
    const prio   = getPrio(age, gender);

    let seated = 0;
    const c = getCoach(route, coach);

    // Try to seat passengers first
    for (let i = 1; i <= SEATS && seated < count; i++) {
      if (!c[i]) {
        // Calculate probability BEFORE adding seat (fill% reflects current state)
        const prob = getConfirmedProb(route, coach);
        c[i] = { pnr, name };
        tickets.push({ pnr, name, age, gender, route, coach, seat: i,
          berth: BERTHS[(i-1)%8], date, cls, fare,
          status: "CONFIRMED", priority: null, prob });
        seated++;
      }
    }

    // Remaining go to waitlist
    const remain = count - seated;
    for (let r = 0; r < remain; r++) {
      const routeWlPos = waitlist.filter(w => w.route === route && w.coach === coach).length + 1;
      const prob = getWaitlistProb(routeWlPos);
      waitlist.push({ pnr, name, age, gender, route, coach, date, cls, fare, priority: prio });
      waitlist.sort((a, b) => a.priority - b.priority);
      tickets.push({ pnr, name, age, gender, route, coach,
        seat: `WL/${routeWlPos}`, berth: "—", date, cls, fare,
        status: "WAITLIST", priority: prio, prob });
    }

    // Flash newly booked seats
    if (coach === curCoach) {
      Object.entries(c).forEach(([sn, d]) => {
        if (d.pnr === pnr) {
          const el = document.getElementById("seat-" + sn);
          if (el) {
            el.className = "seat booked flash";
            setTimeout(() => el.classList.remove("flash"), 600);
          }
        }
      });
    }

    renderSeats();
    renderTickets();
    renderWaitlist();
    updateStats();
    checkHint();

    if (seated > 0 && remain === 0)
      toast(`✅ ${seated} seat(s) confirmed! PNR: ${pnr}`, "success");
    else if (seated > 0)
      toast(`⚠️ ${seated} confirmed + ${remain} on waitlist. PNR: ${pnr}`, "warn");
    else
      toast(`📋 All seats full — added to waitlist. PNR: ${pnr} · Priority: ${prioLabel(prio)}`, "info");

    saveState();

    ["pName","pAge","pPhone","pAadhar"].forEach(id => {
      const el = document.getElementById(id);
      el.value = "";
      el.classList.remove("ok","err");
    });

  } catch (err) {
    console.error("Booking error:", err);
    toast("Unexpected error. Please try again.", "error");
  }
}

/* ---- CANCEL + WAITLIST PROMOTION ---- */
function cancelTicket(pnr) {
  const toCancel = tickets.filter(t => t.pnr === pnr && t.status === "CONFIRMED");
  if (!toCancel.length) { toast("No confirmed tickets for this PNR.", "error"); return; }

  toCancel.forEach(t => {
    const c = getCoach(t.route, t.coach);
    delete c[t.seat];

    const tIdx = tickets.findIndex(x => x === t);
    if (tIdx !== -1) tickets.splice(tIdx, 1);

    const wIdx = waitlist.findIndex(w => w.route === t.route && w.coach === t.coach);
    if (wIdx !== -1) {
      const next = waitlist[wIdx];
      c[t.seat] = { pnr: next.pnr, name: next.name };

      const tkIdx = tickets.findIndex(
        x => x.pnr === next.pnr && x.status === "WAITLIST" && x.route === next.route
      );
      if (tkIdx !== -1) {
        tickets[tkIdx].status = "CONFIRMED";
        tickets[tkIdx].seat   = t.seat;
        tickets[tkIdx].berth  = BERTHS[(t.seat - 1) % 8];
        tickets[tkIdx].coach  = t.coach;
        tickets[tkIdx].prob   = { label: "Confirmed", pct: 100, color: "var(--green)" };
        tickets[tkIdx]._promo = true;
      }

      waitlist.splice(wIdx, 1);
      toast(`🎉 ${next.name} [${prioLabel(next.priority)}] promoted → Coach ${t.coach} Seat ${t.seat}!`, "success");
    }
  });

  toast(`Ticket ${pnr} cancelled.`, "info");
  renderSeats();
  renderTickets();
  renderWaitlist();
  updateStats();
  saveState();
}

/* ---- RENDER TICKETS ---- */
function renderTickets() {
  const list = document.getElementById("ticketsList");
  const q    = document.getElementById("searchBox").value.toLowerCase();

  const shown = tickets.filter(t =>
    t.pnr.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  );

  if (!shown.length) {
    list.innerHTML = `<div class="empty"><div class="empty-i">🎫</div>
      <p>${q ? "No results." : "No tickets yet — book your first!"}</p></div>`;
    return;
  }

  list.innerHTML = shown.map(t => {
    const conf  = t.status === "CONFIRMED";
    const pcls  = t.priority === 1 ? "p1" : t.priority === 2 ? "p2" : "p3";
    const promo = t._promo ? "promoted" : "";
    if (t._promo) delete t._promo;

    return `
    <div class="ticket ${promo}">
      <div class="t-pnr">${t.pnr}</div>
      <div class="t-body">
        <div class="t-name">${t.name}</div>
        <div class="t-meta">
          <span>🚆 ${t.route}</span>
          <span>📅 ${t.date || "—"}</span>
          <span>🪑 ${t.coach} · Seat ${t.seat} · ${t.berth}</span>
          <span>₹${t.fare}</span>
          <span>👤 ${t.gender}, ${t.age}yr</span>
        </div>
        <div class="t-meta" style="margin-top:6px;align-items:center;">
          <span style="color:var(--text2);font-size:11px;">📊 Seat Probability:</span>
          <span style="color:${t.prob ? t.prob.color : 'var(--green)'};font-weight:700;font-size:12px;">
            ${t.prob ? t.prob.pct + "% — " + t.prob.label : "95% — Very High"}
          </span>
        </div>
      </div>
      ${!conf && t.priority ? `<span class="prio-tag ${pcls}">${prioLabel(t.priority)}</span>` : ""}
      <span class="badge ${conf ? "b-conf" : "b-wait"}">${t.status}</span>
      ${conf ? `<button class="btn btn-cancel" onclick="cancelTicket('${t.pnr}')">Cancel</button>` : ""}
    </div>`;
  }).join("");
}

/* ---- UPDATE STATS ---- */
function updateStats() {
  const conf  = tickets.filter(t => t.status === "CONFIRMED").length;
  const wl    = tickets.filter(t => t.status === "WAITLIST").length;
  const tot   = Object.values(coachData).reduce((s, r) =>
    s + Object.values(r).reduce((ss, c) => ss + Object.keys(c).length, 0), 0);
  const avail = Math.max(0, 3 * SEATS - tot);

  document.getElementById("sConf").textContent  = conf;
  document.getElementById("sWait").textContent  = wl;
  document.getElementById("sAvail").textContent = avail;
  document.getElementById("sTotal").textContent = tot;
}

/* ---- WAITLIST HINT ---- */
function checkHint() {
  const route = document.getElementById("trainSel").value;
  const coach = document.getElementById("sCoach").value;
  const full  = route && freeSeats(route, coach) === 0;
  document.getElementById("wlHint").classList.toggle("show", full);
}

/* ---- EVENT LISTENERS ---- */
document.getElementById("trainSel").addEventListener("change", function() {
  renderSeats();
  checkHint();
});

document.getElementById("sCoach").addEventListener("change", function() {
  curCoach = this.value;
  document.querySelectorAll(".ctab").forEach(b => {
    const active = b.textContent === this.value;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });
  renderSeats();
  checkHint();
});

/* ---- TOAST ---- */
function toast(msg, type = "info") {
  const box = document.getElementById("toasts");
  const el  = document.createElement("div");
  el.className = `toast ${type}`;
  const icons = { success:"✅", error:"❌", info:"ℹ️", warn:"⚠️" };
  el.innerHTML = `<span>${icons[type]||"ℹ️"}</span><span>${msg}</span>`;
  box.appendChild(el);
  setTimeout(() => {
    el.style.animation = "tOut .3s var(--ease) forwards";
    setTimeout(() => el.remove(), 300);
  }, 3800);
}

/* ---- RENDER WAITLIST PANEL ---- */
function renderWaitlist() {
  const list  = document.getElementById("wlList");
  const badge = document.getElementById("wlBadge");
  badge.textContent = waitlist.length;
  if (!waitlist.length) {
    list.innerHTML =
      `<div class="wl-empty"><div class="wi">📋</div>No one on waitlist right now.</div>`;
    return;
  }
  list.innerHTML = waitlist.map((w, i) => {
    const prioClass =
      w.priority === 1 ? "prio-senior p1" :
      w.priority === 2 ? "prio-female p2" :
      "prio-gen p3";
    const prioText =
      w.priority === 1 ? "👴 Senior" :
      w.priority === 2 ? "👩 Female" :
      "👤 General";
    // get stored probability from ticket
    const ticket = tickets.find(t =>
      t.pnr === w.pnr &&
      t.status === "WAITLIST" &&
      t.route === w.route &&
      t.coach === w.coach
    );
    const wlProb = ticket?.prob || getWaitlistProb(i + 1);
    return `
    <div class="wl-item">
      <div class="wl-pos">${i + 1}</div>
      <div class="wl-body">
        <div class="wl-name">${w.name}</div>
        <div class="wl-meta">
          <span>🚆 ${w.route}</span>
          <span>🪑 Coach ${w.coach}</span>
          <span>📅 ${w.date}</span>
          <span>👤 ${w.gender}, ${w.age}yr</span>
        </div>
        <div class="wl-meta" style="margin-top:4px;">
          <span style="color:var(--text2);font-size:10.5px;">
            📊 Probability:
          </span>
          <span style="color:${wlProb.color};font-weight:700;font-size:11px;">
            ${wlProb.pct}% — ${wlProb.label}
          </span>
        </div>
      </div>
      <span class="prio-tag ${prioClass}">
        ${prioText}
      </span>
    </div>
    `;
  }).join("");
}

/* ---- SAVE STATE ---- */
function saveState() {
  try {
    localStorage.setItem("rb_tickets",  JSON.stringify(tickets));
    localStorage.setItem("rb_waitlist", JSON.stringify(waitlist));
    localStorage.setItem("rb_coaches",  JSON.stringify(coachData));
  } catch(e) {
    console.warn("Storage unavailable:", e);
  }
}

/* ---- INIT ---- */
document.getElementById("jDate").min = today();
renderSeats();
renderTickets();
renderWaitlist();
updateStats();