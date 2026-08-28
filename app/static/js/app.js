(function () {
  "use strict";

  /* ---------- icons ---------- */
  var ICONS = {
    plus: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5V12.5M1.5 7H12.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.3 1.9L12.1 4.7L4.5 12.3L1.3 12.7L1.7 9.5L9.3 1.9Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 3.8H11.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M5.2 3.8V2.5C5.2 2 5.6 1.6 6.1 1.6H7.9C8.4 1.6 8.8 2 8.8 2.5V3.8" stroke="currentColor" stroke-width="1.4"/><path d="M3.6 3.8L4.1 11.4C4.1 11.9 4.5 12.3 5 12.3H9C9.5 12.3 9.9 11.9 9.9 11.4L10.4 3.8" stroke="currentColor" stroke-width="1.4"/></svg>',
    search: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6.2" cy="6.2" r="4.2" stroke="currentColor" stroke-width="1.4"/><path d="M9.4 9.4L12.5 12.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    close: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 2.5L12.5 12.5M12.5 2.5L2.5 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    link: '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M6 8L8 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M7.3 3.9L8.6 2.6C9.5 1.7 11 1.7 11.9 2.6C12.8 3.5 12.8 5 11.9 5.9L10.6 7.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M6.7 10.1L5.4 11.4C4.5 12.3 3 12.3 2.1 11.4C1.2 10.5 1.2 9 2.1 8.1L3.4 6.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    chevron: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2.5L8 6L4 9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.8 7.2L5.6 10L11.2 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    moon: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 8.7A5.3 5.3 0 1 1 5.3 2a4.3 4.3 0 0 0 6.7 6.7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    sun: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M7 0.8V2.2M7 11.8V13.2M0.8 7H2.2M11.8 7H13.2M2.5 2.5L3.5 3.5M10.5 10.5L11.5 11.5M2.5 11.5L3.5 10.5M10.5 3.5L11.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    download: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5V9.5M7 9.5L4 6.5M7 9.5L10 6.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10.5V11.5C2 12.05 2.45 12.5 3 12.5H11C11.55 12.5 12 12.05 12 11.5V10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
  };

  var TASK_STATUS_TONE = { "To Do": "neutral", "In Progress": "info", "Done": "good" };
  var TASK_PRIORITY_TONE = { "Low": "neutral", "Normal": "info", "High": "danger" };
  var EXPENSE_STATUS_TONE = { "Unpaid": "danger", "Paid": "good" };
  var PRODUCTION_STATUS_TONE = {
    "Inquiry": "neutral", "Pre-Production": "info",
    "Shooting": "accent", "Editing": "accent", "Review": "accent",
    "Delivered": "good", "Cancelled": "danger"
  };

  var TABS = [
    { key: "overview", label: "Overview", path: "/" },
    { key: "productions", label: "Productions", path: "/productions" },
    { key: "tasks", label: "Tasks", path: "/tasks" },
    { key: "calendar", label: "Calendar", path: "/calendar" },
    { key: "admin", label: "Admin", path: "/admin" },
    { key: "profile", label: "My Profile", path: "/profile" }
  ];

  /* ---------- utils ---------- */
  function esc(s) {
    s = (s === undefined || s === null) ? "" : String(s);
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  function fmtDateTime(iso) {
    if (!iso) return "—";
    // Backend timestamps are naive UTC ISO strings (no "Z"/offset) — append
    // "Z" so the browser parses them as UTC instead of local time.
    var d = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : iso + "Z");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) +
      ", " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  function fmtAssignees(list) {
    return (list && list.length) ? list.join(", ") : "";
  }
  function fmtTime(hhmm) {
    if (!hhmm) return "";
    var parts = hhmm.split(":");
    var h = parseInt(parts[0], 10), min = parts[1];
    if (isNaN(h)) return hhmm;
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ":" + min + " " + ampm;
  }
  function fmtTimeRange(start, end) {
    if (!start && !end) return "";
    if (start && end) return fmtTime(start) + "–" + fmtTime(end);
    return fmtTime(start || end);
  }
  function daysUntil(iso) {
    if (!iso) return null;
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((d - today) / 86400000);
  }
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function isoDate(y, m, d) { return y + "-" + pad2(m + 1) + "-" + pad2(d); }
  function monthLabel(y, m) { return new Date(y, m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" }); }
  function fmtMoney(n) {
    n = Math.round(Number(n) || 0);
    return "Rp " + n.toLocaleString("en-US");
  }
  function statusPill(value, toneMap) {
    var tone = (toneMap && toneMap[value]) || "neutral";
    return '<span class="pill tone-' + tone + '">' + esc(value) + '</span>';
  }
  function statusSelect(action, id, value, options, toneMap) {
    var tone = (toneMap && toneMap[value]) || "neutral";
    return '<select class="status-select tone-' + tone + '" data-action="' + action + '" data-id="' + id + '" title="Click to change status">' +
      options.map(function (o) { return '<option value="' + esc(o) + '"' + (o === value ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join("") +
      '</select>';
  }
  function completeBtn(action, id, isDone, doneLabel, undoLabel) {
    doneLabel = doneLabel || "Mark complete";
    undoLabel = undoLabel || "Mark as not done";
    return '<button class="icon-btn' + (isDone ? ' icon-btn-done' : '') + '" title="' + esc(isDone ? undoLabel : doneLabel) + '" data-action="' + action + '" data-id="' + id + '">' + ICONS.check + '</button>';
  }
  function byId(list, id) {
    id = Number(id);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* ---------- state ---------- */
  var STATE = { meta: {}, constants: {}, team: [], productions: [], tasks: [], expenses: [] };
  var UI = {
    tab: window.__ACTIVE_TAB__ || "overview",
    expandedProductions: {},
    expandedTasks: {},
    expandedStat: null,
    calendar: (function () { var d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; })(),
    search: { productions: "", tasks: "" },
    statusFilter: { productions: "All", tasks: "All" },
    assigneeFilter: { tasks: "All" },
    productionFilter: { tasks: "All" },
    priorityFilter: { tasks: "All" },
    dateFilter: { productions: { mode: "all", month: "", dateFrom: "", dateTo: "" } }
  };
  var modalState = null;
  var confirmState = null;
  var adminModal = null;
  var ADMIN_USERS = null;
  var ADMIN_LOG = null;
  var busy = false;

  /* ---------- networking ---------- */
  function apiCall(url, method, body) {
    return fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok || data.ok === false) {
          var err = new Error((data && data.error) || ("Request failed (" + res.status + ")"));
          throw err;
        }
        return data;
      });
    });
  }

  function mutate(url, method, body, successMsg) {
    if (busy) return Promise.resolve();
    busy = true;
    setBusyUI(true);
    return apiCall(url, method, body).then(function (data) {
      STATE = data.state;
      ADMIN_LOG = null; // this action just added an entry — refetch next time Admin is viewed
      busy = false;
      setBusyUI(false);
      render();
      if (successMsg) toast(successMsg);
    }).catch(function (err) {
      busy = false;
      setBusyUI(false);
      toast(err.message || "Something went wrong.", "danger");
      throw err;
    });
  }

  function adminMutate(url, method, body, successMsg) {
    if (busy) return Promise.resolve();
    busy = true;
    setBusyUI(true);
    return apiCall(url, method, body).then(function (data) {
      ADMIN_USERS = data.users;
      // Keep the team list (used by every assignee/crew dropdown) in sync
      // immediately — no separate reload needed to see a newly added user.
      STATE.team = data.users.map(function (u) { return { id: u.id, name: u.name, hasLogin: u.hasLogin }; });
      ADMIN_LOG = null; // this action just added an entry — refetch on next render
      busy = false;
      setBusyUI(false);
      render();
      if (successMsg) toast(successMsg);
    }).catch(function (err) {
      busy = false;
      setBusyUI(false);
      toast(err.message || "Something went wrong.", "danger");
      throw err;
    });
  }

  function meMutate(url, method, body, successMsg) {
    if (busy) return Promise.resolve();
    busy = true;
    setBusyUI(true);
    return apiCall(url, method, body).then(function (data) {
      if (data.user) { ME = data.user; applyMeToSidebar(); }
      busy = false;
      setBusyUI(false);
      render();
      if (successMsg) toast(successMsg);
    }).catch(function (err) {
      busy = false;
      setBusyUI(false);
      toast(err.message || "Something went wrong.", "danger");
      throw err;
    });
  }

  function setBusyUI(v) {
    document.body.style.cursor = v ? "progress" : "";
  }

  function toast(msg, tone) {
    var stack = document.getElementById("toast-stack");
    if (!stack) return;
    var t = document.createElement("div");
    t.className = "toast" + (tone ? " tone-" + tone : "");
    t.textContent = msg;
    stack.appendChild(t);
    setTimeout(function () {
      t.style.opacity = "0"; t.style.transition = "opacity .4s";
      setTimeout(function () { t.remove(); }, 420);
    }, 3600);
  }

  /* ---------- navigation ---------- */
  function goTab(key, push) {
    UI.tab = key;
    var tabDef = TABS.filter(function (t) { return t.key === key; })[0];
    if (push !== false && tabDef) history.pushState({ tab: key }, "", tabDef.path);
    render();
  }
  window.addEventListener("popstate", function (e) {
    var tab = (e.state && e.state.tab) || "overview";
    UI.tab = tab;
    render();
  });

  /* ---------- entity form config ---------- */
  function entityConfig(entity) {
    var C = STATE.constants;
    if (entity === "productions") {
      return {
        label: "Production",
        fields: [
          { key: "client", label: "Client", type: "text", required: true, placeholder: "Insert Brand Name" },
          { key: "shootName", label: "Shoot / project name", type: "text", required: true, placeholder: "e.g. Fall Lookbook" },
          { key: "type", label: "Type", type: "select", options: C.productionTypes },
          { key: "status", label: "Status", type: "select", options: C.productionStatuses },
          { key: "shootDate", label: "Shoot date", type: "date" },
          { key: "shootTimeStart", label: "Shoot start time", type: "time" },
          { key: "shootTimeEnd", label: "Shoot end time", type: "time" },
          { key: "budget", label: "Budget (optional, IDR)", type: "number", placeholder: "e.g. 6000000" },
          { key: "productionHours", label: "Production hours", type: "number", placeholder: "e.g. 8" },
          { key: "looksSkus", label: "Number of looks / SKU", type: "text", placeholder: "e.g. 12 looks" },
          { key: "frameCount", label: "Number of frames", type: "number", placeholder: "e.g. 20" },
          { key: "videos", label: "Videos", type: "text", placeholder: "e.g. 2 videos: 15s + 30s" },
          { key: "location", label: "Location", type: "text", placeholder: "e.g. Studio A, Canggu" },
          { key: "crew", label: "Crew assigned", type: "multiselect" },
          { key: "driveLink", label: "Drive folder link", type: "url", placeholder: "https://drive.google.com/..." },
          { key: "briefLink", label: "Brief (Slides) link", type: "url" },
          { key: "rundownLink", label: "Rundown link", type: "url" },
          { key: "notes", label: "Notes", type: "textarea" }
        ]
      };
    }
    if (entity === "tasks") {
      return {
        label: "Task",
        fields: [
          { key: "title", label: "Task", type: "text", required: true, placeholder: "e.g. Send selects to client" },
          { key: "productionId", label: "Linked production", type: "select-production" },
          { key: "assignees", label: "Assignees", type: "multiselect-user" },
          { key: "dueDate", label: "Due date", type: "date" },
          { key: "status", label: "Status", type: "select", options: C.taskStatuses },
          { key: "priority", label: "Priority", type: "select", options: C.taskPriorities },
          { key: "notes", label: "Notes", type: "textarea" }
        ]
      };
    }
    if (entity === "expenses") {
      return {
        label: "Expense",
        fields: [
          { key: "description", label: "Description", type: "text", required: true, placeholder: "e.g. Grab to location" },
          { key: "category", label: "Category", type: "select", options: C.expenseCategories },
          { key: "brand", label: "Brand (optional)", type: "brand-select", placeholder: "e.g. Sunset Eyewear" },
          { key: "amount", label: "Amount (IDR, optional)", type: "number", placeholder: "0" },
          { key: "date", label: "Date", type: "date" },
          { key: "paidBy", label: "Paid by", type: "select-team" },
          { key: "status", label: "Status", type: "select", options: C.expenseStatuses },
          { key: "notes", label: "Notes", type: "textarea" }
        ]
      };
    }
  }

  function openEntityForm(entity, id, extra) {
    var cfg = entityConfig(entity);
    var values = {};
    if (id) {
      var found = byId(STATE[entity], id);
      if (found) values = JSON.parse(JSON.stringify(found));
    }
    var isNew = !id;
    cfg.fields.forEach(function (f) {
      if (values[f.key] !== undefined) return;
      if (f.type === "multiselect" || f.type === "multiselect-user") values[f.key] = [];
      else if (f.type === "select") values[f.key] = f.options[0];
      else values[f.key] = "";
    });
    if (isNew && extra) Object.assign(values, extra);
    modalState = { entity: entity, id: id || null, values: values, isNew: isNew, pendingCrew: [] };
    renderOverlay();
  }
  function closeModal() { modalState = null; renderOverlay(); }

  function collectFormValues(cfg, base) {
    var values = Object.assign({}, base);
    cfg.fields.forEach(function (f) {
      if (f.type === "multiselect" || f.type === "multiselect-user") {
        var checks = document.querySelectorAll('[data-field="' + f.key + '"] input[type=checkbox]');
        var arr = [];
        checks.forEach(function (c) { if (c.checked) arr.push(c.value); });
        values[f.key] = arr;
        return;
      }
      var el = document.querySelector('[data-field="' + f.key + '"]');
      if (!el) return;
      values[f.key] = el.value;
    });
    return values;
  }

  function submitEntityForm() {
    if (!modalState) return;
    var cfg = entityConfig(modalState.entity);
    var values = collectFormValues(cfg, modalState.values);
    var missing = cfg.fields.filter(function (f) { return f.required && !String(values[f.key] || "").trim(); });
    if (missing.length) {
      toast("Please fill in: " + missing.map(function (f) { return f.label; }).join(", "));
      return;
    }
    var entity = modalState.entity, id = modalState.id;
    var successMsg = id ? cfg.label + " updated." : cfg.label + " added.";
    var url = "/api/" + entity + (id ? "/" + id : "");
    var method = id ? "PUT" : "POST";
    modalState = null;
    renderOverlay();
    mutate(url, method, values, successMsg);
  }

  function askDelete(entity, id, label) {
    confirmState = { entity: entity, id: id, label: label };
    renderOverlay();
  }
  function askRemoveUserAccess(id, label) {
    confirmState = { entity: "admin-user", id: id, label: label };
    renderOverlay();
  }
  function doDelete() {
    if (!confirmState) return;
    var entity = confirmState.entity, id = confirmState.id, label = confirmState.label;
    confirmState = null;
    renderOverlay();
    if (entity === "admin-user") {
      return adminMutate("/api/admin/users/" + id, "DELETE", undefined, "Login access removed for " + label + ".");
    }
    mutate("/api/" + entity + "/" + id, "DELETE", undefined, label + " deleted.");
  }

  /* ---------- shell render ---------- */
  function render() {
    renderRailActive();
    var title = TABS.filter(function (t) { return t.key === UI.tab; })[0];
    document.getElementById("page-title").textContent = title ? title.label : "";
    var content = document.getElementById("content");
    var actions = document.getElementById("topbar-actions");
    actions.innerHTML = "";
    if (UI.tab === "overview") content.innerHTML = renderOverview();
    else if (UI.tab === "productions") { content.innerHTML = renderProductions(); actions.innerHTML = '<button class="btn btn-accent" data-action="new-production">' + ICONS.plus + ' New production</button>'; }
    else if (UI.tab === "tasks") { content.innerHTML = renderTasksTab(); actions.innerHTML = '<button class="btn btn-accent" data-action="new-task">' + ICONS.plus + ' New task</button>'; }
    else if (UI.tab === "calendar") content.innerHTML = renderCalendarTab();
    else if (UI.tab === "admin") {
      content.innerHTML = renderAdminTab();
      actions.innerHTML =
        '<a class="btn btn-ghost" href="/api/admin/export">' + ICONS.download + ' Export to Excel</a>' +
        '<button class="btn btn-accent" data-action="new-user">' + ICONS.plus + ' Add user</button>';
    }
    else if (UI.tab === "profile") content.innerHTML = renderProfileTab();
    renderOverlay();
  }

  function renderRailActive() {
    document.querySelectorAll(".tab-btn").forEach(function (a) {
      var k = a.getAttribute("data-tab");
      a.classList.toggle("active", k === UI.tab);
      var count = (k === "productions" || k === "tasks") ? STATE[k].length : null;
      var existing = a.querySelector(".tab-count");
      if (existing) existing.remove();
      if (count !== null && count > 0) {
        var span = document.createElement("span");
        span.className = "tab-count";
        span.textContent = count;
        a.appendChild(span);
      }
    });
  }

  /* ---------- overview ---------- */
  function renderOverview() {
    var active = STATE.productions.filter(function (p) { return p.status !== "Delivered" && p.status !== "Cancelled"; });
    var upcoming = STATE.productions.filter(function (p) {
      var d = daysUntil(p.shootDate);
      return d !== null && d >= 0 && d <= 14;
    });
    var openTasks = STATE.tasks.filter(function (t) { return t.status !== "Done"; });
    var overdueTasks = openTasks.filter(function (t) { var d = daysUntil(t.dueDate); return d !== null && d < 0; });
    var unpaidExpenses = STATE.expenses.filter(function (e) { return e.status === "Unpaid"; });
    var statSets = { active: active, upcoming: upcoming, openTasks: openTasks, unpaid: unpaidExpenses };

    var html = '<div class="stat-grid">';
    html += statCard("active", active.length, "Active productions");
    html += statCard("upcoming", upcoming.length, "Shoots in 14 days");
    html += statCard("openTasks", openTasks.length + (overdueTasks.length ? ' <span class="mono" style="font-size:14px;color:var(--danger)">(' + overdueTasks.length + ' overdue)</span>' : ""), "Open tasks");
    html += statCard("unpaid", unpaidExpenses.length, "Unpaid expenses");
    html += '</div>';

    if (UI.expandedStat) html += renderStatExpansion(UI.expandedStat, statSets);

    html += '<div class="two-col">';
    html += '<div class="panel"><div class="panel-head">Upcoming shoots</div>';
    html += renderMiniList(upcoming.slice(0, 8).sort(function (a, b) { return (a.shootDate || "") < (b.shootDate || "") ? -1 : 1; }), function (p) {
      var time = fmtTimeRange(p.shootTimeStart, p.shootTimeEnd);
      return { name: p.client + " — " + p.shootName, meta: fmtDate(p.shootDate) + (time ? " · " + time : "") + " · " + p.status, onClick: "open-production", id: p.id };
    }, "No shoots scheduled in the next 14 days.");
    html += '</div>';

    html += '<div class="panel"><div class="panel-head">Open tasks</div>';
    html += renderMiniList(openTasks.slice(0, 8).sort(function (a, b) { return (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1; }), function (t) {
      var d = daysUntil(t.dueDate);
      var overdue = d !== null && d < 0;
      return {
        name: t.title, meta: (t.productionName || "No production") + " · " + (fmtAssignees(t.assignees) || "Unassigned") + (t.dueDate ? " · due " + fmtDate(t.dueDate) : "") + (overdue ? " · overdue" : ""),
        onClick: "goto-tasks", id: t.id, danger: overdue
      };
    }, "Nothing open — nice work.");
    html += '</div></div>';
    return html;
  }
  var STAT_LABELS = {
    active: "Active productions", upcoming: "Shoots in the next 14 days",
    openTasks: "Open tasks", unpaid: "Unpaid expenses"
  };
  function statCard(key, num, label) {
    var open = UI.expandedStat === key;
    return '<button class="stat-card' + (open ? ' active' : '') + '" data-action="toggle-stat" data-key="' + key + '">' +
      '<div class="num">' + num + '</div><div class="lbl">' + esc(label) + '</div></button>';
  }
  function renderStatExpansion(key, sets) {
    var html = '<div class="panel stat-expand"><div class="panel-head panel-head-row"><span>' + esc(STAT_LABELS[key]) + '</span>' +
      '<button class="icon-btn" data-action="toggle-stat" data-key="' + key + '">' + ICONS.close + '</button></div>';
    if (key === "openTasks") {
      html += renderMiniList(sets.openTasks.sort(function (a, b) { return (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1; }), function (t) {
        var d = daysUntil(t.dueDate);
        var overdue = d !== null && d < 0;
        return { name: t.title, meta: (t.productionName || "No production") + " · " + (fmtAssignees(t.assignees) || "Unassigned") + (t.dueDate ? " · due " + fmtDate(t.dueDate) : ""), onClick: "goto-tasks", id: t.id, danger: overdue };
      }, "Nothing open — nice work.");
    } else if (key === "unpaid") {
      html += renderMiniList(sets.unpaid.sort(function (a, b) { return b.amount - a.amount; }), function (e) {
        var prod = byId(STATE.productions, e.productionId);
        return { name: e.description, meta: fmtMoney(e.amount) + " · " + (prod ? prod.client : "No production"), onClick: "open-production", id: e.productionId };
      }, "Nothing unpaid right now.");
    } else {
      var list = sets[key];
      html += renderMiniList(list.sort(function (a, b) { return (a.shootDate || "9999") < (b.shootDate || "9999") ? -1 : 1; }), function (p) {
        var time = fmtTimeRange(p.shootTimeStart, p.shootTimeEnd);
        return { name: p.client + " — " + p.shootName, meta: fmtDate(p.shootDate) + (time ? " · " + time : "") + " · " + p.status, onClick: "open-production", id: p.id };
      }, "Nothing here right now.");
    }
    html += '</div>';
    return html;
  }
  function renderMiniList(items, mapFn, emptyMsg) {
    if (!items.length) return '<div class="empty-row">' + esc(emptyMsg) + '</div>';
    return '<ul class="mini-list">' + items.map(function (raw) {
      var it = mapFn(raw);
      var name = it.onClick
        ? '<button class="link-title" data-action="' + it.onClick + '" data-id="' + it.id + '">' + esc(it.name) + '</button>'
        : esc(it.name);
      return '<li' + (it.danger ? ' style="color:var(--danger)"' : '') + '><div class="t"><div class="name">' + name + '</div><div class="meta">' + esc(it.meta) + '</div></div></li>';
    }).join("") + '</ul>';
  }

  /* ---------- productions ---------- */
  function renderProductions() {
    var q = UI.search.productions.toLowerCase();
    var filter = UI.statusFilter.productions;
    var df = UI.dateFilter.productions;
    var list = STATE.productions.filter(function (p) {
      if (filter !== "All" && p.status !== filter) return false;
      if (df.mode === "month") { if (!p.shootDate || p.shootDate.slice(0, 7) !== df.month) return false; }
      else if (df.mode === "date") {
        if (df.dateFrom || df.dateTo) {
          if (!p.shootDate) return false;
          if (df.dateFrom && p.shootDate < df.dateFrom) return false;
          if (df.dateTo && p.shootDate > df.dateTo) return false;
        }
      }
      if (!q) return true;
      return (p.client + " " + p.shootName + " " + p.crew.join(" ")).toLowerCase().indexOf(q) > -1;
    });

    var html = '<div class="section-head"><div><p>Every shoot, from inquiry to delivery. Click a name to open its tasks and expense ledger.</p></div>';
    html += '<div class="search-wrap">' + ICONS.search + '<input type="search" placeholder="Search client, shoot, crew…" value="' + esc(UI.search.productions) + '" data-action="search-productions"></div></div>';

    html += '<div class="filter-row date-filter-row">' + [["all", "All"], ["month", "Per Month"], ["date", "Choose Date"]].map(function (m) {
      return '<button class="chip-filter' + (df.mode === m[0] ? " active" : "") + '" data-action="productions-date-mode" data-value="' + m[0] + '">' + m[1] + '</button>';
    }).join("") +
      (df.mode === "month" ? '<input type="month" class="date-filter-input" data-action="productions-date-month" value="' + esc(df.month) + '">' : "") +
      (df.mode === "date" ?
        '<span class="date-range-label">From</span><input type="date" class="date-filter-input" data-action="productions-date-from" value="' + esc(df.dateFrom) + '">' +
        '<span class="date-range-label">To</span><input type="date" class="date-filter-input" data-action="productions-date-to" value="' + esc(df.dateTo) + '">'
        : "") +
      '</div>';

    html += '<div class="filter-row">' + ["All"].concat(STATE.constants.productionStatuses).map(function (s) {
      return '<button class="chip-filter' + (s === filter ? " active" : "") + '" data-action="filter-productions-status" data-value="' + esc(s) + '">' + esc(s) + '</button>';
    }).join("") + '</div>';

    if (!list.length) {
      html += '<div class="table-wrap"><div class="empty-row">No productions match yet. Add your first one to get started.</div></div>';
      return html;
    }

    html += '<div class="table-wrap"><table class="tbl-productions"><thead><tr>' +
      '<th class="col-production">Production</th><th class="col-status">Status</th><th class="col-date">Shoot date</th><th class="col-crew">Crew</th><th class="col-links">Links</th><th></th>' +
      '</tr></thead><tbody>';
    list.forEach(function (p) { html += renderProductionRow(p); });
    html += '</tbody></table></div>';
    return html;
  }

  function renderProductionRow(p) {
    var open = !!UI.expandedProductions[p.id];
    var row = '<tr>';
    row += '<td><span class="chev' + (open ? ' open' : '') + '">' + ICONS.chevron + '</span>' +
      '<button class="link-title" data-action="toggle-production" data-id="' + p.id + '">' + esc(p.client) + ' — ' + esc(p.shootName) + '</button>' +
      '<div class="cell-sub">' + esc(p.type) + (p.budget ? " · Budget " + fmtMoney(p.budget) : "") + '</div></td>';
    row += '<td>' + statusSelect("set-production-status", p.id, p.status, STATE.constants.productionStatuses, PRODUCTION_STATUS_TONE) + '</td>';
    row += '<td>' + fmtDate(p.shootDate) + (fmtTimeRange(p.shootTimeStart, p.shootTimeEnd) ? '<div class="cell-sub">' + fmtTimeRange(p.shootTimeStart, p.shootTimeEnd) + '</div>' : '') + '</td>';
    row += '<td>' + (p.crew.length ? p.crew.map(esc).join(", ") : '<span class="cell-sub">—</span>') + '</td>';
    row += '<td><div class="link-row">' +
      (p.driveLink ? '<a class="link-chip" href="' + esc(p.driveLink) + '" target="_blank" rel="noopener">' + ICONS.link + ' Drive</a>' : '') +
      (p.briefLink ? '<a class="link-chip" href="' + esc(p.briefLink) + '" target="_blank" rel="noopener">' + ICONS.link + ' Brief</a>' : '') +
      (p.rundownLink ? '<a class="link-chip" href="' + esc(p.rundownLink) + '" target="_blank" rel="noopener">' + ICONS.link + ' Rundown</a>' : '') +
      '</div></td>';
    row += '<td><div class="row-actions">' +
      '<button class="icon-btn" title="Edit" data-action="edit-production" data-id="' + p.id + '">' + ICONS.edit + '</button>' +
      '<button class="icon-btn" title="Delete" data-action="delete-production" data-id="' + p.id + '">' + ICONS.trash + '</button>' +
      '</div></td></tr>';
    if (open) {
      row += '<tr class="expand-row"><td colspan="6"><div class="expand-body">';
      if (!p.shootDate) row += '<div class="banner warn">No shoot date set yet — this production won’t show on the calendar.</div>';
      var facts = [];
      if (fmtTimeRange(p.shootTimeStart, p.shootTimeEnd)) facts.push(["Shoot time", fmtTimeRange(p.shootTimeStart, p.shootTimeEnd)]);
      if (p.productionHours) facts.push(["Production hours", p.productionHours]);
      if (p.looksSkus) facts.push(["Looks / SKU", p.looksSkus]);
      if (p.frameCount) facts.push(["Frames", p.frameCount]);
      if (p.videos) facts.push(["Videos", p.videos]);
      if (p.location) facts.push(["Location", p.location]);
      if (facts.length) {
        row += '<div class="panel detail-info" style="margin-bottom:14px;padding:0;"><div class="facts" style="padding:14px 16px;">' +
          facts.map(function (f) { return '<div><div class="flabel">' + esc(f[0]) + '</div>' + esc(f[1]) + '</div>'; }).join("") +
          '</div></div>';
      }
      if (p.notes) {
        row += '<div class="panel detail-info" style="margin-bottom:14px;padding:14px 16px;"><div class="flabel">Notes</div>' +
          '<div style="white-space:pre-wrap;">' + esc(p.notes) + '</div></div>';
      }
      row += '<div class="two-col">';
      row += renderProductionTasksPanel(p.id);
      row += renderExpensesPanel(p.id, p.budget);
      row += '</div></div></td></tr>';
    }
    return row;
  }

  function renderProductionTasksPanel(prodId) {
    var list = STATE.tasks.filter(function (t) { return t.productionId === prodId; });
    var html = '<div class="panel"><div class="panel-head panel-head-row"><span>Tasks</span>' +
      '<button class="btn btn-sm" data-action="new-task-for" data-id="' + prodId + '">' + ICONS.plus + ' Add</button></div>';
    if (!list.length) {
      html += '<div class="empty-row">No tasks linked yet.</div></div>';
      return html;
    }
    html += '<ul class="mini-list">';
    list.forEach(function (t) {
      var done = t.subtasks.filter(function (s) { return s.done; }).length;
      html += '<li style="align-items:flex-start;flex-direction:column;gap:6px;">';
      html += '<div style="display:flex;width:100%;align-items:center;gap:8px;">';
      html += '<div class="t"><div class="name">' + esc(t.title) + '</div><div class="meta">' + esc(fmtAssignees(t.assignees) || "Unassigned") + (t.dueDate ? " · due " + fmtDate(t.dueDate) : "") + (t.subtasks.length ? " · " + done + "/" + t.subtasks.length + " subtasks" : "") + (t.createdBy ? " · added by " + esc(t.createdBy) : "") + '</div></div>';
      html += statusPill(t.status, TASK_STATUS_TONE);
      html += '<div class="row-actions">' + completeBtn("toggle-task-done", t.id, t.status === "Done") + '<button class="icon-btn" title="Edit" data-action="edit-task" data-id="' + t.id + '">' + ICONS.edit + '</button><button class="icon-btn" title="Delete" data-action="delete-task" data-id="' + t.id + '">' + ICONS.trash + '</button></div>';
      html += '</div>';
      if (t.notes) html += '<div class="cell-sub" style="width:100%;white-space:pre-wrap;">' + esc(t.notes) + '</div>';
      html += renderSubtasksBlock(t);
      html += '</li>';
    });
    html += '</ul></div>';
    return html;
  }

  function renderSubtasksBlock(task) {
    var html = '<div class="subtasks" style="width:100%;">';
    if (task.subtasks.length) {
      html += '<ul class="subtask-list">' + task.subtasks.map(function (s) {
        return '<li class="subtask-item' + (s.done ? ' done' : '') + '">' +
          '<label class="subtask-check"><input type="checkbox" ' + (s.done ? 'checked' : '') + ' data-action="toggle-subtask" data-id="' + s.id + '" data-task="' + task.id + '"><span>' + esc(s.text) + '</span></label>' +
          '<button class="icon-btn-xs" title="Remove" data-action="delete-subtask" data-id="' + s.id + '" data-task="' + task.id + '">' + ICONS.close + '</button></li>';
      }).join("") + '</ul>';
    }
    html += '<form class="subtask-add" data-action="add-subtask-form" data-task="' + task.id + '">' +
      '<input type="text" placeholder="Add subtask…" data-role="subtask-text">' +
      '<button class="icon-btn" type="submit">' + ICONS.plus + '</button></form></div>';
    return html;
  }

  function renderExpensesPanel(prodId, budget) {
    var list = STATE.expenses.filter(function (e) { return e.productionId === prodId; });
    var total = list.reduce(function (s, e) { return s + e.amount; }, 0);
    var unpaid = list.filter(function (e) { return e.status === "Unpaid"; }).reduce(function (s, e) { return s + e.amount; }, 0);
    var html = '<div class="panel"><div class="panel-head panel-head-row"><span>Production account</span>' +
      '<button class="btn btn-sm" data-action="new-expense-for" data-id="' + prodId + '">' + ICONS.plus + ' Add</button></div>';
    html += '<div class="detail-info" style="padding-bottom:6px;"><div class="facts">' +
      '<div><div class="flabel">Total spent</div>' + fmtMoney(total) + '</div>' +
      '<div><div class="flabel">Unpaid</div><span style="color:var(--danger)">' + fmtMoney(unpaid) + '</span></div>' +
      (budget ? '<div><div class="flabel">Remaining vs budget</div>' + fmtMoney(budget - total) + '</div>' : '') +
      '</div></div>';
    if (!list.length) { html += '<div class="empty-row">No expenses logged yet.</div></div>'; return html; }
    html += '<ul class="mini-list">' + list.map(function (e) {
      return '<li style="flex-wrap:wrap;">' +
        '<div class="t"><div class="name">' + esc(e.description) + '</div><div class="meta">' + esc(e.category) + (e.brand ? ' · ' + esc(e.brand) : '') + ' · ' + fmtMoney(e.amount) + ' · ' + fmtDate(e.date) + (e.paidBy ? ' · paid by ' + esc(e.paidBy) : '') + '</div>' +
        (e.notes ? '<div class="meta" style="white-space:pre-wrap;">' + esc(e.notes) + '</div>' : '') + '</div>' +
        statusPill(e.status, EXPENSE_STATUS_TONE) +
        '<div class="row-actions">' + completeBtn("toggle-expense-paid", e.id, e.status === "Paid", "Mark paid", "Mark unpaid") + '<button class="icon-btn" title="Edit" data-action="edit-expense" data-id="' + e.id + '">' + ICONS.edit + '</button><button class="icon-btn" title="Delete" data-action="delete-expense" data-id="' + e.id + '">' + ICONS.trash + '</button></div></li>';
    }).join("") + '</ul>' +
      '<div style="padding:10px 16px;text-align:right;border-top:1px solid var(--border);font-weight:700;">Total: ' + fmtMoney(total) + '</div></div>';
    return html;
  }

  /* ---------- tasks tab ---------- */
  function renderTasksTab() {
    var q = UI.search.tasks.toLowerCase();
    var statusF = UI.statusFilter.tasks;
    var assigneeF = UI.assigneeFilter.tasks;
    var productionF = UI.productionFilter.tasks;
    var priorityF = UI.priorityFilter.tasks;
    var list = STATE.tasks.filter(function (t) {
      if (statusF !== "All" && t.status !== statusF) return false;
      if (priorityF !== "All" && (t.priority || "Normal") !== priorityF) return false;
      if (assigneeF !== "All") {
        if (assigneeF === "Unassigned" ? t.assignees.length > 0 : t.assignees.indexOf(assigneeF) === -1) return false;
      }
      if (productionF !== "All" && String(t.productionId) !== productionF) return false;
      if (!q) return true;
      return (t.title + " " + (t.productionName || "") + " " + t.assignees.join(" ")).toLowerCase().indexOf(q) > -1;
    });

    var html = '<div class="section-head"><div><p>Every task across every production.</p></div>' +
      '<div class="search-wrap">' + ICONS.search + '<input type="search" placeholder="Search tasks…" value="' + esc(UI.search.tasks) + '" data-action="search-tasks"></div></div>';

    html += '<div class="filter-row">' + ["All"].concat(STATE.constants.taskStatuses).map(function (s) {
      return '<button class="chip-filter' + (s === statusF ? " active" : "") + '" data-action="filter-tasks-status" data-value="' + esc(s) + '">' + esc(s) + '</button>';
    }).join("") + '</div>';
    html += '<div class="filter-row">' + ["All"].concat(STATE.constants.taskPriorities).map(function (pr) {
      return '<button class="chip-filter' + (pr === priorityF ? " active" : "") + '" data-action="filter-tasks-priority" data-value="' + esc(pr) + '">' + esc(pr) + '</button>';
    }).join("") + '</div>';
    var assigneeOptions = ["All"].concat(STATE.team.map(function (m) { return m.name; })).concat(["Unassigned"]);
    html += '<div class="filter-row">' + assigneeOptions.map(function (a) {
      return '<button class="chip-filter' + (a === assigneeF ? " active" : "") + '" data-action="filter-tasks-assignee" data-value="' + esc(a) + '">' + esc(a) + '</button>';
    }).join("") + '</div>';
    var activeProductions = STATE.productions.filter(function (p) { return p.status !== "Delivered" && p.status !== "Cancelled"; });
    html += '<div class="filter-row"><select class="production-filter-select" data-action="filter-tasks-production">' +
      '<option value="All"' + (productionF === "All" ? " selected" : "") + '>All productions</option>' +
      activeProductions.map(function (p) {
        return '<option value="' + p.id + '"' + (productionF === String(p.id) ? " selected" : "") + '>' + esc(p.client + " — " + p.shootName) + '</option>';
      }).join("") + '</select></div>';

    if (!list.length) { html += '<div class="table-wrap" style="margin-top:14px;"><div class="empty-row">No tasks match.</div></div>'; return html; }

    html += '<div class="table-wrap" style="margin-top:14px;"><table class="tbl-tasks"><thead><tr><th>Task</th><th class="col-tasks-production">Production</th><th>Assignees</th><th class="col-tasks-createdby">Created by</th><th>Due</th><th>Status</th><th class="col-tasks-priority">Priority</th><th></th></tr></thead><tbody>';
    list.forEach(function (t) { html += renderTaskRow(t); });
    html += '</tbody></table></div>';
    return html;
  }

  function renderTaskRow(t) {
    var open = !!UI.expandedTasks[t.id];
    var d = daysUntil(t.dueDate);
    var overdue = d !== null && d < 0 && t.status !== "Done";
    var done = t.subtasks.filter(function (s) { return s.done; }).length;
    var html = '<tr><td><span class="chev' + (open ? ' open' : '') + '">' + ICONS.chevron + '</span>' +
      '<button class="link-title" data-action="toggle-task-row" data-id="' + t.id + '">' + esc(t.title) + '</button>' +
      (t.subtasks.length ? '<div class="cell-sub">' + done + "/" + t.subtasks.length + ' subtasks</div>' : '') + '</td>';
    html += '<td>' + (t.productionName ? esc(t.productionName) : '<span class="cell-sub">—</span>') + '</td>';
    html += '<td>' + (t.assignees.length ? esc(fmtAssignees(t.assignees)) : '<span class="cell-sub">Unassigned</span>') + '</td>';
    html += '<td>' + (t.createdBy ? esc(t.createdBy) : '<span class="cell-sub">—</span>') + '</td>';
    html += '<td' + (overdue ? ' style="color:var(--danger);font-weight:600;"' : '') + '>' + fmtDate(t.dueDate) + (overdue ? ' (overdue)' : '') + '</td>';
    html += '<td>' + statusPill(t.status, TASK_STATUS_TONE) + '</td>';
    html += '<td>' + statusPill(t.priority || "Normal", TASK_PRIORITY_TONE) + '</td>';
    html += '<td><div class="row-actions">' + completeBtn("toggle-task-done", t.id, t.status === "Done") + '<button class="icon-btn" title="Edit" data-action="edit-task" data-id="' + t.id + '">' + ICONS.edit + '</button><button class="icon-btn" title="Delete" data-action="delete-task" data-id="' + t.id + '">' + ICONS.trash + '</button></div></td></tr>';
    if (open) {
      var notesHtml = t.notes ? '<div style="white-space:pre-wrap;margin-bottom:10px;">' + esc(t.notes) + '</div>' : '';
      html += '<tr class="expand-row"><td colspan="8"><div class="expand-body">' + notesHtml + renderSubtasksBlock(t) + '</div></td></tr>';
    }
    return html;
  }

  /* ---------- calendar ---------- */
  function renderCalendarTab() {
    var y = UI.calendar.year, m = UI.calendar.month;
    var first = new Date(y, m, 1);
    var startDow = first.getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var todayIso = isoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    var byDate = {};
    STATE.productions.forEach(function (p) {
      if (!p.shootDate) return;
      (byDate[p.shootDate] = byDate[p.shootDate] || []).push(p);
    });
    Object.keys(byDate).forEach(function (d) {
      byDate[d].sort(function (a, b) { return (a.shootTimeStart || "99:99") < (b.shootTimeStart || "99:99") ? -1 : 1; });
    });
    var noDate = STATE.productions.filter(function (p) { return !p.shootDate; });

    var html = '<div class="section-head"><div><p>Shoots plotted by date.</p></div></div>';
    html += '<div class="cal-toolbar"><button class="btn btn-sm" data-action="cal-prev">' + ICONS.back + '</button>' +
      '<div class="cal-month-label">' + monthLabel(y, m) + '</div>' +
      '<button class="btn btn-sm" data-action="cal-next" style="transform:scaleX(-1);">' + ICONS.back + '</button>' +
      '<button class="btn btn-sm" data-action="cal-today">Today</button></div>';

    if (noDate.length) html += '<div class="banner warn">' + noDate.length + ' production' + (noDate.length > 1 ? 's have' : ' has') + ' no shoot date and won’t appear below.</div>';

    html += '<div class="cal-grid">';
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(function (d) { html += '<div class="cal-dow">' + d + '</div>'; });
    for (var i = 0; i < startDow; i++) html += '<div class="cal-cell-empty"></div>';
    for (var day = 1; day <= daysInMonth; day++) {
      var iso = isoDate(y, m, day);
      var items = byDate[iso] || [];
      var isToday = iso === todayIso;
      html += '<div class="cal-cell' + (isToday ? ' cal-today' : '') + '"><div class="cal-daynum">' + day + '</div>';
      items.slice(0, 3).forEach(function (p) {
        var tone = PRODUCTION_STATUS_TONE[p.status] || "neutral";
        var time = fmtTimeRange(p.shootTimeStart, p.shootTimeEnd);
        var tooltip = p.client + ' — ' + p.shootName + (time ? ' (' + time + ')' : '');
        html += '<button class="cal-chip tone-' + tone + '" data-action="open-production" data-id="' + p.id + '" title="' + esc(tooltip) + '">' +
          (p.shootTimeStart ? '<span class="cal-chip-time">' + esc(fmtTime(p.shootTimeStart)) + '</span> ' : '') + esc(p.client) + '</button>';
      });
      if (items.length > 3) html += '<div class="cal-more">+' + (items.length - 3) + ' more</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  /* ---------- admin (Super Admin only) ---------- */
  function renderAdminTab() {
    if (ADMIN_USERS === null) {
      loadAdminUsers();
      return '<div class="skeleton-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div></div>';
    }
    var html = '<div class="section-head"><div><p>Everyone who can sign in, and what they can do. Removing access keeps their name on past productions, tasks, and expenses.</p></div></div>';
    if (!ADMIN_USERS.length) { html += '<div class="table-wrap"><div class="empty-row">No team members yet.</div></div>'; return html; }
    html += '<div class="table-wrap"><table class="tbl-admin-users"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Last signed in</th><th></th></tr></thead><tbody>';
    ADMIN_USERS.forEach(function (u) {
      html += '<tr><td><div class="cell-title">' + esc(u.name) + '</div></td>';
      html += '<td>' + (u.hasLogin ? '<span class="mono">' + esc(u.username) + '</span>' : '<span class="cell-sub">No login</span>') + '</td>';
      html += '<td>' + (u.role === "super_admin" ? statusPill("Super Admin", { "Super Admin": "accent" }) : statusPill("Member", { "Member": "neutral" })) + '</td>';
      html += '<td>' + (u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : '<span class="cell-sub">Never</span>') + '</td>';
      html += '<td><div class="row-actions">';
      if (u.hasLogin) {
        html += '<button class="btn btn-sm" data-action="reset-user-password" data-id="' + u.id + '" data-name="' + esc(u.name) + '">Reset password</button>' +
          '<button class="btn btn-sm btn-danger" data-action="remove-user-access" data-id="' + u.id + '" data-name="' + esc(u.name) + '">Remove access</button>';
      } else {
        html += '<span class="cell-sub">Use “Add user” with this name to grant access</span>';
      }
      html += '</div></td></tr>';
    });
    html += '</tbody></table></div>';

    html += '<div class="section-head" style="margin-top:28px;"><div><h2 style="margin:0;font-size:15px;">Changes log</h2><p>The last 200 changes made across the studio, most recent first.</p></div></div>';
    if (ADMIN_LOG === null) {
      loadAdminLog();
      html += '<div class="skeleton-grid"><div class="skeleton-card"></div></div>';
    } else if (!ADMIN_LOG.length) {
      html += '<div class="table-wrap"><div class="empty-row">No changes recorded yet.</div></div>';
    } else {
      html += '<div class="table-wrap"><table class="tbl-audit-log"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>Detail</th></tr></thead><tbody>';
      var LOG_ACTION_TONE = { created: "good", updated: "info", deleted: "danger" };
      ADMIN_LOG.forEach(function (entry) {
        html += '<tr><td>' + fmtDateTime(entry.createdAt) + '</td>';
        html += '<td>' + esc(entry.actor) + '</td>';
        html += '<td>' + statusPill(entry.action, LOG_ACTION_TONE) + '</td>';
        html += '<td><div class="cell-title">' + esc(entry.entityLabel) + '</div><div class="cell-sub">' + esc(entry.entityType) + '</div></td>';
        html += '<td>' + (entry.detail ? esc(entry.detail) : '<span class="cell-sub">—</span>') + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }
    return html;
  }
  function loadAdminUsers() {
    apiCall("/api/admin/users", "GET").then(function (data) {
      ADMIN_USERS = data.users;
      if (UI.tab === "admin") render();
    }).catch(function (err) {
      toast(err.message || "Couldn’t load users.", "danger");
    });
  }
  function loadAdminLog() {
    apiCall("/api/admin/audit-log", "GET").then(function (data) {
      ADMIN_LOG = data.log;
      if (UI.tab === "admin") render();
    }).catch(function (err) {
      toast(err.message || "Couldn’t load the changes log.", "danger");
    });
  }

  /* ---------- profile (self-service) ---------- */
  var ME = null;
  function renderProfileTab() {
    if (ME === null) {
      loadMe();
      return '<div class="skeleton-grid"><div class="skeleton-card"></div></div>';
    }
    var initials = (ME.name || "?").slice(0, 1).toUpperCase();
    var avatarHtml = ME.avatar
      ? '<img class="profile-avatar-lg" src="' + ME.avatar + '" alt="">'
      : '<div class="profile-avatar-lg profile-avatar-fallback">' + esc(initials) + '</div>';

    var html = '<div class="section-head"><div><p>Update your display picture, name, and password.</p></div></div>';
    html += '<div class="profile-grid">';

    html += '<div class="panel"><div class="panel-head">Profile</div><div class="profile-body">';
    html += '<div class="profile-pic-row">' + avatarHtml +
      '<div class="profile-pic-actions">' +
      '<button class="btn btn-sm" type="button" data-action="choose-avatar">Change photo</button>' +
      (ME.avatar ? '<button class="btn btn-sm btn-ghost" type="button" data-action="remove-avatar">Remove</button>' : '') +
      '</div>' +
      '<input type="file" accept="image/*" id="avatar-file-input" style="display:none;">' +
      '</div>';
    html += '<div class="field field-req" style="margin-top:16px;"><label>Name</label><input type="text" id="profile-name-input" value="' + esc(ME.name) + '"></div>';
    html += '<div class="field-hint">Username <span class="mono">' + esc(ME.username || "") + '</span> · ' + (ME.role === "super_admin" ? "Super Admin" : "Team member") + '</div>';
    html += '<button class="btn btn-accent" style="margin-top:10px;" data-action="save-profile-name">Save name</button>';
    html += '</div></div>';

    html += '<div class="panel"><div class="panel-head">Change password</div><div class="profile-body">';
    html += '<div class="field field-req"><label>Current password</label><input type="password" id="profile-current-password" autocomplete="current-password"></div>';
    html += '<div class="field field-req"><label>New password</label><input type="password" id="profile-new-password" placeholder="At least 4 characters" autocomplete="new-password"></div>';
    html += '<div class="field field-req"><label>Confirm new password</label><input type="password" id="profile-confirm-password" autocomplete="new-password"></div>';
    html += '<button class="btn btn-accent" style="margin-top:4px;" data-action="save-profile-password">Update password</button>';
    html += '</div></div>';

    html += '</div>';
    return html;
  }
  function loadMe() {
    apiCall("/api/me", "GET").then(function (data) {
      ME = data.user;
      if (UI.tab === "profile") render();
    }).catch(function (err) {
      toast(err.message || "Couldn’t load your profile.", "danger");
    });
  }
  function applyMeToSidebar() {
    if (!ME) return;
    var nameEl = document.querySelector(".viewer-display .viewer-name");
    if (nameEl) nameEl.textContent = ME.name;
    var avatarWrap = document.querySelector(".viewer-display .viewer-avatar");
    if (!avatarWrap) return;
    if (ME.avatar) {
      if (avatarWrap.tagName === "IMG") { avatarWrap.src = ME.avatar; return; }
      var img = document.createElement("img");
      img.className = "viewer-avatar viewer-avatar-img";
      img.alt = "";
      img.src = ME.avatar;
      avatarWrap.replaceWith(img);
    } else {
      var initials = (ME.name || "?").slice(0, 1).toUpperCase();
      if (avatarWrap.tagName === "IMG") {
        var div = document.createElement("div");
        div.className = "viewer-avatar";
        div.textContent = initials;
        avatarWrap.replaceWith(div);
      } else {
        avatarWrap.textContent = initials;
      }
    }
  }

  /* ---------- modal / confirm overlay ---------- */
  function renderOverlay() {
    var root = document.getElementById("overlay-root");
    if (modalState) { root.innerHTML = renderModal(); bindModalEvents(); }
    else if (confirmState) { root.innerHTML = renderConfirm(); bindConfirmEvents(); }
    else if (adminModal) { root.innerHTML = renderAdminModal(); bindAdminModalEvents(); }
    else root.innerHTML = "";
  }

  function fieldHtml(f, values) {
    var val = values[f.key];
    var reqCls = f.required ? ' field-req' : '';
    var html = '<div class="field"><label class="' + reqCls.trim() + '">' + esc(f.label) + '</label>';
    if (f.type === "select") {
      html += '<select data-field="' + f.key + '">' + f.options.map(function (o) {
        return '<option value="' + esc(o) + '"' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join("") + '</select>';
    } else if (f.type === "select-team") {
      html += '<select data-field="' + f.key + '"><option value="">Unassigned</option>' + STATE.team.map(function (m) {
        return '<option value="' + esc(m.name) + '"' + (m.name === val ? ' selected' : '') + '>' + esc(m.name) + '</option>';
      }).join("") + '</select>';
    } else if (f.type === "multiselect-user") {
      // Only people with an actual login can be assigned — always tracks the
      // current registered-user list, including people added since page load.
      var registeredUsers = STATE.team.filter(function (m) { return m.hasLogin; });
      html += '<div class="check-grid" data-field="' + f.key + '">' + registeredUsers.map(function (m) {
        var checked = (val || []).indexOf(m.name) > -1;
        return '<label class="check-pill"><input type="checkbox" value="' + esc(m.name) + '"' + (checked ? ' checked' : '') + '>' + esc(m.name) + '</label>';
      }).join("") + '</div>';
      if (!registeredUsers.length) html += '<div class="field-hint">No one has a login yet — add users from the Admin page.</div>';
    } else if (f.type === "brand-select") {
      // Type-to-select-or-add, sourced from every brand already used on a
      // production (client) or a past expense — grows organically like crew.
      var brandSet = {};
      STATE.productions.forEach(function (p) { if (p.client) brandSet[p.client] = true; });
      STATE.expenses.forEach(function (e) { if (e.brand) brandSet[e.brand] = true; });
      var brandOptions = Object.keys(brandSet).sort();
      html += '<input type="text" list="brand-options" data-field="' + f.key + '" placeholder="' + esc(f.placeholder || "") + '" value="' + esc(val) + '">' +
        '<datalist id="brand-options">' + brandOptions.map(function (b) { return '<option value="' + esc(b) + '">'; }).join("") + '</datalist>';
    } else if (f.type === "select-production") {
      html += '<select data-field="' + f.key + '"><option value="">None</option>' + STATE.productions.map(function (p) {
        return '<option value="' + p.id + '"' + (String(p.id) === String(val) ? ' selected' : '') + '>' + esc(p.client + ' — ' + p.shootName) + '</option>';
      }).join("") + '</select>';
    } else if (f.type === "multiselect") {
      var pending = modalState.pendingCrew || [];
      html += '<div class="check-grid" data-field="' + f.key + '">' + STATE.team.map(function (m) {
        var checked = (val || []).indexOf(m.name) > -1;
        return '<label class="check-pill"><input type="checkbox" value="' + esc(m.name) + '"' + (checked ? ' checked' : '') + '>' + esc(m.name) + '</label>';
      }).join("") + pending.map(function (n) {
        return '<label class="check-pill"><input type="checkbox" value="' + esc(n) + '" checked>' + esc(n) + '</label>';
      }).join("") + '</div>';
      html += '<div class="team-add"><input type="text" placeholder="Add more…" data-role="crew-add-input"><button class="btn btn-sm" type="button" data-action="crew-add-confirm">' + ICONS.plus + '</button></div>';
    } else if (f.type === "textarea") {
      html += '<textarea data-field="' + f.key + '">' + esc(val) + '</textarea>';
    } else {
      html += '<input type="' + (f.type === "url" ? "url" : f.type) + '" data-field="' + f.key + '" placeholder="' + esc(f.placeholder || "") + '" value="' + esc(val) + '">';
    }
    html += '</div>';
    return html;
  }

  function renderModal() {
    var cfg = entityConfig(modalState.entity);
    var title = (modalState.isNew ? "New " : "Edit ") + cfg.label;
    var html = '<div class="modal-overlay" data-action="overlay-close"><div class="modal" data-stop>' +
      '<div class="modal-head"><h2>' + esc(title) + '</h2><button class="icon-btn" data-action="modal-close">' + ICONS.close + '</button></div>' +
      '<div class="modal-body">' + cfg.fields.map(function (f) { return fieldHtml(f, modalState.values); }).join("") + '</div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" data-action="modal-close">Cancel</button><button class="btn btn-accent" data-action="modal-submit">' + (modalState.isNew ? "Add" : "Save changes") + '</button></div>' +
      '</div></div>';
    return html;
  }

  function renderConfirm() {
    var isUser = confirmState.entity === "admin-user";
    var title = isUser ? "Remove access for " + esc(confirmState.label) + "?" : "Delete " + esc(confirmState.label) + "?";
    var body = isUser
      ? "They’ll no longer be able to sign in. Their name stays on any past productions, tasks, and expenses — nothing historical is deleted."
      : "This can’t be undone." + (confirmState.entity === "productions" ? " Its expenses will be deleted; its tasks will stay but become unlinked." : "");
    return '<div class="modal-overlay" data-action="overlay-close"><div class="modal modal-sm" data-stop>' +
      '<div class="modal-head"><h2>' + title + '</h2><button class="icon-btn" data-action="confirm-close">' + ICONS.close + '</button></div>' +
      '<div class="modal-body"><p style="margin:0;color:var(--text-muted);font-size:13px;">' + body + '</p></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" data-action="confirm-close">Cancel</button><button class="btn btn-danger" data-action="confirm-yes">' + (isUser ? "Remove access" : "Delete") + '</button></div>' +
      '</div></div>';
  }

  function bindModalEvents() {
    document.querySelectorAll('[data-action="overlay-close"]').forEach(function (el) { el.addEventListener("click", closeModal); });
    document.querySelectorAll('[data-stop]').forEach(function (el) { el.addEventListener("click", function (e) { e.stopPropagation(); }); });
    document.querySelectorAll('[data-action="modal-close"]').forEach(function (el) { el.addEventListener("click", closeModal); });
    document.querySelectorAll('[data-action="modal-submit"]').forEach(function (el) { el.addEventListener("click", submitEntityForm); });
    var addBtn = document.querySelector('[data-action="crew-add-confirm"]');
    if (addBtn) addBtn.addEventListener("click", function () {
      var input = document.querySelector('[data-role="crew-add-input"]');
      var name = (input.value || "").trim();
      if (!name) return;
      // Capture whatever's currently typed in the other fields first — the
      // rebuild below replaces the whole modal's innerHTML, and modalState.values
      // is otherwise only synced on submit, so typed-but-unsaved text would
      // otherwise be silently wiped out.
      modalState.values = collectFormValues(entityConfig(modalState.entity), modalState.values);
      modalState.pendingCrew = modalState.pendingCrew || [];
      modalState.pendingCrew.push(name);
      renderOverlay();
    });
  }
  function bindConfirmEvents() {
    document.querySelectorAll('[data-action="overlay-close"]').forEach(function (el) { el.addEventListener("click", function () { confirmState = null; renderOverlay(); }); });
    document.querySelectorAll('[data-stop]').forEach(function (el) { el.addEventListener("click", function (e) { e.stopPropagation(); }); });
    document.querySelectorAll('[data-action="confirm-close"]').forEach(function (el) {
      el.addEventListener("click", function () { confirmState = null; renderOverlay(); });
    });
    var yesBtn = document.querySelector('[data-action="confirm-yes"]');
    if (yesBtn) yesBtn.addEventListener("click", doDelete);
  }

  function renderAdminModal() {
    var isAdd = adminModal.mode === "add";
    var title = isAdd ? "Add user" : "Reset password for " + esc(adminModal.userName);
    var body = isAdd
      ? '<div class="field field-req"><label>Name</label><input type="text" data-field="user-name" placeholder="e.g. Bayu"></div>' +
        '<div class="field field-req"><label>Username</label><input type="text" data-field="user-username" placeholder="e.g. bayu" autocapitalize="off"></div>' +
        '<div class="field field-req"><label>Password</label><input type="password" data-field="user-password" placeholder="At least 4 characters"></div>' +
        '<div class="field"><label>Role</label><select data-field="user-role"><option value="member" selected>Member</option><option value="super_admin">Super Admin</option></select>' +
        '<div class="field-hint">Super Admins can add and remove users. Everyone else just uses the app.</div></div>' +
        '<div class="field-hint">If "Name" matches someone already in the team list (crew/assignee), this gives that same person a login instead of creating a duplicate.</div>'
      : '<div class="field field-req"><label>New password</label><input type="password" data-field="reset-password" placeholder="At least 4 characters"></div>';
    return '<div class="modal-overlay" data-action="overlay-close"><div class="modal" data-stop>' +
      '<div class="modal-head"><h2>' + title + '</h2><button class="icon-btn" data-action="admin-modal-close">' + ICONS.close + '</button></div>' +
      '<div class="modal-body">' + body + '</div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" data-action="admin-modal-close">Cancel</button><button class="btn btn-accent" data-action="admin-modal-submit">' + (isAdd ? "Add user" : "Update password") + '</button></div>' +
      '</div></div>';
  }
  function bindAdminModalEvents() {
    document.querySelectorAll('[data-action="overlay-close"], [data-action="admin-modal-close"]').forEach(function (el) {
      el.addEventListener("click", function () { adminModal = null; renderOverlay(); });
    });
    document.querySelectorAll('[data-stop]').forEach(function (el) { el.addEventListener("click", function (e) { e.stopPropagation(); }); });
    var submitBtn = document.querySelector('[data-action="admin-modal-submit"]');
    if (submitBtn) submitBtn.addEventListener("click", submitAdminModal);
  }
  function submitAdminModal() {
    if (!adminModal) return;
    if (adminModal.mode === "add") {
      var name = (document.querySelector('[data-field="user-name"]').value || "").trim();
      var username = (document.querySelector('[data-field="user-username"]').value || "").trim();
      var password = document.querySelector('[data-field="user-password"]').value || "";
      var role = document.querySelector('[data-field="user-role"]').value;
      if (!name || !username || !password) { toast("Please fill in name, username, and password."); return; }
      adminModal = null; renderOverlay();
      adminMutate("/api/admin/users", "POST", { name: name, username: username, password: password, role: role }, "User added.");
    } else {
      var newPassword = document.querySelector('[data-field="reset-password"]').value || "";
      if (!newPassword) { toast("Enter a new password."); return; }
      var uid = adminModal.userId;
      adminModal = null; renderOverlay();
      adminMutate("/api/admin/users/" + uid + "/password", "PATCH", { password: newPassword }, "Password updated.");
    }
  }

  /* ---------- delegated click / input handling ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");
    var id = el.getAttribute("data-id");

    if (action === "new-production") return openEntityForm("productions");
    if (action === "edit-production") return openEntityForm("productions", Number(id));
    if (action === "delete-production") { var p = byId(STATE.productions, id); return askDelete("productions", id, p ? p.client + " — " + p.shootName : "production"); }
    if (action === "toggle-production") { UI.expandedProductions[id] = !UI.expandedProductions[id]; return render(); }
    if (action === "open-production") {
      UI.expandedProductions = {}; UI.expandedProductions[id] = true;
      return goTab("productions", true);
    }

    if (action === "new-task") return openEntityForm("tasks");
    if (action === "new-task-for") return openEntityForm("tasks", null, { productionId: id });
    if (action === "edit-task") return openEntityForm("tasks", Number(id));
    if (action === "delete-task") { var t = byId(STATE.tasks, id); return askDelete("tasks", id, t ? t.title : "task"); }
    if (action === "goto-tasks") return goTab("tasks", true);
    if (action === "toggle-task-row") { UI.expandedTasks[id] = !UI.expandedTasks[id]; return render(); }
    if (action === "toggle-task-done") {
      var task = byId(STATE.tasks, id);
      var next = task && task.status === "Done" ? "To Do" : "Done";
      return mutate("/api/tasks/" + id + "/status", "PATCH", { status: next }, next === "Done" ? "Task marked complete." : "Task reopened.");
    }

    if (action === "new-expense-for") return openEntityForm("expenses", null, { productionId: id });
    if (action === "edit-expense") return openEntityForm("expenses", Number(id));
    if (action === "delete-expense") { var ex = byId(STATE.expenses, id); return askDelete("expenses", id, ex ? ex.description : "expense"); }
    if (action === "toggle-expense-paid") {
      var expense = byId(STATE.expenses, id);
      var nextStatus = expense && expense.status === "Paid" ? "Unpaid" : "Paid";
      return mutate("/api/expenses/" + id + "/status", "PATCH", { status: nextStatus }, nextStatus === "Paid" ? "Expense marked paid." : "Expense marked unpaid.");
    }

    if (action === "toggle-subtask") {
      var checkbox = el;
      return mutate("/api/subtasks/" + id, "PUT", { done: checkbox.checked });
    }
    if (action === "delete-subtask") return mutate("/api/subtasks/" + id, "DELETE");

    if (action === "toggle-stat") {
      var key = el.getAttribute("data-key");
      UI.expandedStat = (UI.expandedStat === key) ? null : key;
      return render();
    }

    if (action === "new-user") { adminModal = { mode: "add" }; return renderOverlay(); }
    if (action === "reset-user-password") {
      adminModal = { mode: "reset", userId: id, userName: el.getAttribute("data-name") };
      return renderOverlay();
    }
    if (action === "remove-user-access") return askRemoveUserAccess(id, el.getAttribute("data-name"));

    if (action === "choose-avatar") { var fileInput = document.getElementById("avatar-file-input"); if (fileInput) fileInput.click(); return; }
    if (action === "remove-avatar") return meMutate("/api/me/avatar", "PUT", { image: null }, "Photo removed.");
    if (action === "save-profile-name") {
      var newName = (document.getElementById("profile-name-input").value || "").trim();
      if (!newName) { toast("Name can’t be empty."); return; }
      return meMutate("/api/me", "PUT", { name: newName }, "Name updated.");
    }
    if (action === "save-profile-password") {
      var curPw = document.getElementById("profile-current-password").value || "";
      var newPw = document.getElementById("profile-new-password").value || "";
      var confirmPw = document.getElementById("profile-confirm-password").value || "";
      if (!curPw || !newPw) { toast("Fill in both password fields."); return; }
      if (newPw !== confirmPw) { toast("New passwords don’t match."); return; }
      return meMutate("/api/me/password", "PUT", { currentPassword: curPw, newPassword: newPw }, "Password updated.");
    }

    if (action === "filter-productions-status") { UI.statusFilter.productions = el.getAttribute("data-value"); return render(); }
    if (action === "productions-date-mode") { UI.dateFilter.productions.mode = el.getAttribute("data-value"); return render(); }
    if (action === "filter-tasks-status") { UI.statusFilter.tasks = el.getAttribute("data-value"); return render(); }
    if (action === "filter-tasks-priority") { UI.priorityFilter.tasks = el.getAttribute("data-value"); return render(); }
    if (action === "filter-tasks-assignee") { UI.assigneeFilter.tasks = el.getAttribute("data-value"); return render(); }

    if (action === "cal-prev") { UI.calendar.month--; if (UI.calendar.month < 0) { UI.calendar.month = 11; UI.calendar.year--; } return render(); }
    if (action === "cal-next") { UI.calendar.month++; if (UI.calendar.month > 11) { UI.calendar.month = 0; UI.calendar.year++; } return render(); }
    if (action === "cal-today") { var d = new Date(); UI.calendar.year = d.getFullYear(); UI.calendar.month = d.getMonth(); return render(); }
  });

  document.addEventListener("submit", function (e) {
    var form = e.target.closest('[data-action="add-subtask-form"]');
    if (!form) return;
    e.preventDefault();
    var taskId = form.getAttribute("data-task");
    var input = form.querySelector('[data-role="subtask-text"]');
    var text = (input.value || "").trim();
    if (!text) return;
    mutate("/api/tasks/" + taskId + "/subtasks", "POST", { text: text });
  });

  document.addEventListener("input", function (e) {
    if (e.target.matches('[data-action="search-productions"]')) { UI.search.productions = e.target.value; return renderProductionsSoft(); }
    if (e.target.matches('[data-action="search-tasks"]')) { UI.search.tasks = e.target.value; return renderTasksSoft(); }
  });
  function renderProductionsSoft() {
    var content = document.getElementById("content");
    var focusVal = UI.search.productions;
    content.innerHTML = renderProductions();
    var input = content.querySelector('[data-action="search-productions"]');
    if (input) { input.focus(); input.value = focusVal; input.setSelectionRange(focusVal.length, focusVal.length); }
  }
  function renderTasksSoft() {
    var content = document.getElementById("content");
    var focusVal = UI.search.tasks;
    content.innerHTML = renderTasksTab();
    var input = content.querySelector('[data-action="search-tasks"]');
    if (input) { input.focus(); input.value = focusVal; input.setSelectionRange(focusVal.length, focusVal.length); }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (modalState) { closeModal(); }
      else if (confirmState) { confirmState = null; renderOverlay(); }
    }
  });

  /* ---------- nav wiring ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest(".tab-btn");
    if (!a) return;
    e.preventDefault();
    goTab(a.getAttribute("data-tab"), true);
  });

  document.addEventListener("change", function (e) {
    if (e.target.matches('[data-action="set-production-status"]')) {
      var pid = e.target.getAttribute("data-id");
      return mutate("/api/productions/" + pid + "/status", "PATCH", { status: e.target.value }, "Status updated.");
    }
    if (e.target.matches('[data-action="productions-date-month"]')) { UI.dateFilter.productions.month = e.target.value; return render(); }
    if (e.target.matches('[data-action="productions-date-from"]')) { UI.dateFilter.productions.dateFrom = e.target.value; return render(); }
    if (e.target.matches('[data-action="productions-date-to"]')) { UI.dateFilter.productions.dateTo = e.target.value; return render(); }
    if (e.target.matches('[data-action="filter-tasks-production"]')) { UI.productionFilter.tasks = e.target.value; return render(); }
    if (e.target.id === "avatar-file-input") {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) { toast("Image is too large (max 8MB)."); return; }
      var reader = new FileReader();
      reader.onload = function () { meMutate("/api/me/avatar", "PUT", { image: reader.result }, "Photo updated."); };
      reader.readAsDataURL(file);
    }
  });

  /* ---------- theme ---------- */
  var THEME_KEY = "ijh_theme";
  function isDarkActive() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function setTheme(isDark) {
    try { localStorage.setItem(THEME_KEY, isDark ? "dark" : "light"); } catch (e) {}
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    renderThemeToggle();
  }
  function renderThemeToggle() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var dark = isDarkActive();
    btn.innerHTML = (dark ? ICONS.sun : ICONS.moon) + "<span>" + (dark ? "Light mode" : "Dark mode") + "</span>";
  }
  var themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) themeToggleBtn.addEventListener("click", function () { setTheme(!isDarkActive()); });
  renderThemeToggle();

  /* ---------- boot ---------- */
  function boot() {
    apiCall("/api/bootstrap", "GET").then(function (data) {
      STATE = data.state;
      render();
    }).catch(function (err) {
      document.getElementById("content").innerHTML = '<div class="banner warn">Couldn’t load data: ' + esc(err.message) + '. Refresh to try again.</div>';
    });
  }
  boot();
})();
