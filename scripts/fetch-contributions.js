"use strict";

/**
 * Read-only GitHub stats fetch. No writes to the GitHub API.
 * Uses the built-in GITHUB_TOKEN when run in Actions.
 * Private contributions appear only if the account has
 * "Include private contributions on my profile" enabled, and only
 * if the token can see them. With the default GITHUB_TOKEN this may
 * be limited to public data; the public contributions calendar
 * (HTML) is used as a fallback and respects that toggle.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const LOGIN = process.env.GITHUB_REPOSITORY_OWNER || "neuraljatin";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const OUT = path.join(__dirname, "..", "data", "contributions.json");

function request({ hostname, urlPath, method = "GET", headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path: urlPath, method, headers },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({ status: res.statusCode, text });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function graphql(query, variables) {
  if (!TOKEN) throw new Error("No GITHUB_TOKEN");
  const body = JSON.stringify({ query, variables });
  const res = await request({
    hostname: "api.github.com",
    urlPath: "/graphql",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "neuraljatin-profile-refresh",
      Authorization: `Bearer ${TOKEN}`,
      "Content-Length": Buffer.byteLength(body),
    },
    body,
  });
  const json = JSON.parse(res.text);
  if (res.status >= 400 || json.errors) {
    throw new Error(`GraphQL failed (${res.status}): ${res.text.slice(0, 400)}`);
  }
  return json.data;
}

async function fetchHtmlCalendar(login) {
  const res = await request({
    hostname: "github.com",
    urlPath: `/users/${encodeURIComponent(login)}/contributions`,
    headers: { "User-Agent": "neuraljatin-profile-refresh", Accept: "text/html" },
  });
  if (res.status >= 400) throw new Error(`HTML calendar fetch failed: ${res.status}`);
  const days = [];
  const re = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"[^>]*(?:data-count="(\d+)")?/g;
  // Newer GitHub markup uses tool-tip text; also try contribution count in the tool-tip.
  const re2 = /data-date="(\d{4}-\d{2}-\d{2})"[\s\S]{0,200}?data-level="(\d+)"/g;
  let m;
  const seen = new Set();
  const html = res.text;
  while ((m = re.exec(html))) {
    seen.add(m[1]);
    days.push({ date: m[1], level: Number(m[2]), count: m[3] != null ? Number(m[3]) : Number(m[2]) });
  }
  if (!days.length) {
    while ((m = re2.exec(html))) {
      if (seen.has(m[1])) continue;
      days.push({ date: m[1], level: Number(m[2]), count: Number(m[2]) });
    }
  }
  const countRe = /(\d[\d,]*)\s+contribution/i;
  const totalMatch = html.match(countRe);
  const totalYear = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : null;
  return { days, totalYear };
}

function streaksAndBusiest(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let current = 0;
  let run = 0;
  let busiest = null;
  for (const d of sorted) {
    const active = (d.count || 0) > 0;
    if (active) {
      run += 1;
      if (run > longest) longest = run;
      if (!busiest || d.count > busiest.count) busiest = d;
    } else {
      run = 0;
    }
  }
  // current streak from the end, ignoring a trailing empty today is fine
  run = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if ((sorted[i].count || 0) > 0) run += 1;
    else if (i === sorted.length - 1) continue; // today empty: still count yesterday
    else break;
  }
  current = run;
  const weekday = [0, 0, 0, 0, 0, 0, 0];
  for (const d of sorted) {
    const wd = new Date(d.date + "T00:00:00Z").getUTCDay(); // 0 Sun
    weekday[wd] += d.count || 0;
  }
  // rotate to Monday-first for the panel
  const monFirst = weekday.slice(1).concat(weekday[0]);
  return {
    longestStreak: longest,
    currentStreak: current,
    busiestDay: busiest ? `${busiest.count} on ${busiest.date}` : null,
    weekday: monFirst,
    totalYear: sorted.reduce((s, d) => s + (d.count || 0), 0),
  };
}

const USER_QUERY = `
query($login: String!) {
  user(login: $login) {
    createdAt
    repositories(ownerAffiliations: OWNER, first: 1, privacy: PUBLIC) { totalCount }
    repositoriesPrivate: repositories(ownerAffiliations: OWNER, first: 1, privacy: PRIVATE) { totalCount }
    pullRequests(states: MERGED, first: 1) { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount weekday }
        }
      }
      contributionYears
    }
  }
}
`;

const YEAR_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { totalContributions }
    }
  }
}
`;

const LANG_QUERY = `
query($login: String!) {
  user(login: $login) {
    repositories(ownerAffiliations: OWNER, isFork: false, first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        isPrivate
        languages(first: 8, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name } }
        }
      }
    }
  }
}
`;

async function fetchGraphql(login) {
  const data = await graphql(USER_QUERY, { login });
  const user = data.user;
  if (!user) throw new Error(`User ${login} not found`);
  const cal = user.contributionsCollection.contributionCalendar;
  const days = [];
  for (const w of cal.weeks) {
    for (const d of w.contributionDays) {
      days.push({ date: d.date, count: d.contributionCount, level: d.contributionCount > 0 ? 1 : 0 });
    }
  }
  const derived = streaksAndBusiest(days);
  let totalAllTime = cal.totalContributions;
  const years = user.contributionsCollection.contributionYears || [];
  if (years.length) {
    let sum = 0;
    let ok = true;
    for (const y of years) {
      try {
        const from = `${y}-01-01T00:00:00Z`;
        const to = `${y}-12-31T23:59:59Z`;
        const part = await graphql(YEAR_QUERY, { login, from, to });
        sum += part.user.contributionsCollection.contributionCalendar.totalContributions;
      } catch {
        ok = false;
        break;
      }
    }
    if (ok) totalAllTime = sum;
  }
  let languages = [];
  try {
    const langData = await graphql(LANG_QUERY, { login });
    const totals = new Map();
    for (const repo of langData.user.repositories.nodes || []) {
      for (const e of repo.languages.edges || []) {
        totals.set(e.node.name, (totals.get(e.node.name) || 0) + e.size);
      }
    }
    languages = [...totals.entries()]
      .map(([name, size]) => ({ name, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);
  } catch (err) {
    languages = [];
  }
  const created = new Date(user.createdAt);
  const yearsOnGitHub = Math.floor((Date.now() - created.getTime()) / (365.25 * 24 * 3600 * 1000));
  const publicCount = user.repositories && user.repositories.totalCount;
  const privateCount = user.repositoriesPrivate && user.repositoriesPrivate.totalCount;
  let repoCount = null;
  if (typeof publicCount === "number") {
    repoCount = publicCount + (typeof privateCount === "number" ? privateCount : 0);
  }
  return {
    source: "graphql",
    login,
    fetchedAt: new Date().toISOString(),
    days,
    languages,
    stats: {
      totalYear: cal.totalContributions,
      totalAllTime: totalAllTime != null ? totalAllTime : null,
      currentStreak: derived.currentStreak,
      longestStreak: derived.longestStreak,
      busiestDay: derived.busiestDay,
      weekday: derived.weekday,
      repoCount,
      prsMerged: user.pullRequests ? user.pullRequests.totalCount : null,
      yearsOnGitHub,
      createdAt: user.createdAt,
    },
  };
}

async function main() {
  const login = LOGIN;
  let result = null;
  try {
    if (TOKEN) result = await fetchGraphql(login);
  } catch (err) {
    console.error("GraphQL fetch failed, trying public calendar:", err.message);
  }
  if (!result) {
    const html = await fetchHtmlCalendar(login);
    const derived = streaksAndBusiest(html.days);
    result = {
      source: "html-calendar",
      login,
      fetchedAt: new Date().toISOString(),
      days: html.days,
      languages: [],
      stats: {
        totalYear: html.totalYear != null ? html.totalYear : derived.totalYear,
        totalAllTime: null,
        currentStreak: derived.currentStreak,
        longestStreak: derived.longestStreak,
        busiestDay: derived.busiestDay,
        weekday: derived.weekday,
        repoCount: null,
        prsMerged: null,
        yearsOnGitHub: null,
        createdAt: null,
      },
    };
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(`Wrote ${OUT} from ${result.source}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
