// The dashboard pages. Each takes the render context and returns a full HTML page.
// Every page shows the sight word of the day.
import { icon } from './icons.js';
import { pic, moonSvg } from './art.js';
import { page, header, esc, wordCard, wordSection, sentenceHtml, chips } from './common.js';
import { family, nextCountdown, wearAdvice, outingIdea, isSchoolDay, addDays, nextFestival } from './family.js';
import { findGrid, storyLines } from './sightwords.js';

const updated = (ctx) => `Updated ${ctx.w.updated}`;

// ---------------------------------------------------------------- main (weekday daytime)
export function main(ctx) {
  const { cfg, w, sw } = ctx;
  const { current: c, today: t, tomorrow: tm, date: d } = w;
  return page(cfg, {
    body: `
    ${header(esc(w.city), updated(ctx))}
    <section class="now">
      <div class="now-left">
        <div class="row" style="gap:6px">${icon(c.icon, 96, 1.2)}<div class="now-temp">${c.temp}°</div></div>
        <div class="now-label">${esc(c.label)}</div>
        <div class="sm muted">Feels like ${c.feels}° · Humidity ${c.humidity}%</div>
      </div>
      <div class="now-right">
        <div><div class="cap">Today</div><div class="hilo">${t.max}° / ${t.min}°</div>
          <div class="cond">${esc(t.label)}</div><div class="sm muted">${t.rain}% rain · ${t.wind} km/h</div></div>
        <div class="thin"></div>
        <div class="row" style="gap:10px;padding-top:10px">${icon(tm.icon, 40, 1.4)}
          <div><div class="cap">Tomorrow</div><div class="hilo" style="font-size:21px">${tm.max}° / ${tm.min}°</div><div class="sm muted">${tm.rain}% rain</div></div></div>
      </div>
    </section>
    <div class="thin"></div>
    ${wordSection(sw)}
    <div class="thin"></div>
    <section class="date">
      <div class="d-num">${d.day}</div>
      <div><div class="d-week">${d.weekday}</div><div class="d-month">${d.month}</div><div class="d-year">${d.year}</div>
        <div class="sm muted" style="margin-top:16px;font-size:14px">Sunrise ${d.sunrise} · Sunset ${d.sunset}</div></div>
    </section>`,
    css: `
    .now{display:grid;grid-template-columns:1.15fr 1fr;gap:18px;padding:28px 0 26px}
    .now-left{display:flex;flex-direction:column;align-items:center;justify-content:center}
    .now-temp{font-size:96px;font-weight:600;line-height:1;letter-spacing:-2px}
    .now-label{font-size:21px;margin-top:10px}
    .now-right{display:flex;flex-direction:column;gap:10px}
    .hilo{font-size:27px;font-weight:700;line-height:1.15}.cond{font-size:16px;margin-top:6px}
    .date{flex:1;display:flex;align-items:center;gap:28px;padding:10px 6px 0}
    .d-num{font-size:150px;font-weight:700;line-height:.9;letter-spacing:-6px}
    .d-week{font-size:22px}.d-month{font-size:36px;font-weight:700;line-height:1.2}.d-year{font-size:19px;margin-top:4px}`,
  });
}

// ---------------------------------------------------------------- morning (school days, early)
export function morning(ctx) {
  const { cfg, w, sw } = ctx;
  const wear = wearAdvice(w);
  const cd = nextCountdown(w.date.iso);
  const hello = family.childName ? `Good morning, ${esc(family.childName)}!` : 'Good morning!';
  const jobs = family.morningJobs.slice(0, 6);
  return page(cfg, {
    body: `
    ${header(hello, `${w.date.weekday} ${w.date.day} ${w.date.month}`)}
    <section class="wx row">
      <div class="row" style="gap:4px">${icon(w.current.icon, 74, 1.3)}<div class="t">${w.current.temp}°</div></div>
      <div class="wear box row">${pic(wear.icon, 52, 1.5)}<div><div class="kid big">${esc(wear.title)}</div><div class="sm muted">${esc(wear.sub)}</div></div></div>
    </section>
    <div class="thin"></div>
    <section class="jobs">
      <div class="cap">Morning jobs</div>
      <div class="grid">${jobs.map((j) => `
        <div class="job"><div>${pic(j.icon, 42, 1.5)}</div><div class="kid lbl">${esc(j.label)}</div><div class="tick"></div></div>`).join('')}
      </div>
    </section>
    <div class="thin"></div>
    <section class="foot row">
      ${cd ? `<div class="count box row">${pic(cd.icon || 'gift', 42, 1.5)}<div><div class="kid n">${cd.big}</div><div class="sm muted">${esc(cd.label)}</div></div></div>` : ''}
      <div class="wbox soft ${cd ? '' : 'full'}"><div class="cap">${ctx.labels.short}</div><div class="kid w">${esc(sw.word)}</div><div class="kid s">${sentenceHtml(sw)}</div></div>
    </section>`,
    css: `
    .wx{gap:18px;padding:20px 0 18px}.t{font-size:62px;font-weight:600;letter-spacing:-1px}
    .wear{flex:1;gap:14px;padding:12px 16px}.big{font-size:24px;font-weight:700}
    .jobs{padding:16px 0 18px;flex:1;display:flex;flex-direction:column}
    .grid{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:12px;margin-top:10px;flex:1}
    .job{display:flex;align-items:center;gap:12px;border:1.5px solid #888;border-radius:14px;padding:10px 14px}
    .lbl{font-size:23px;flex:1;line-height:1.15}
    .tick{width:32px;height:32px;border:2px solid #000;border-radius:50%;flex:none}
    .foot{gap:14px;padding-top:18px;align-items:stretch}
    .count{flex:1;gap:14px;padding:14px 16px}.n{font-size:34px;font-weight:700;line-height:1}
    .wbox{width:230px;padding:10px 14px;text-align:center;display:flex;flex-direction:column;justify-content:center}
    .wbox.full{width:auto;flex:1}
    .w{font-size:58px;font-weight:700;line-height:1.05}.s{font-size:17px;line-height:1.2}
    .s b{text-decoration:underline;text-underline-offset:3px}`,
  });
}

// ---------------------------------------------------------------- reading (school days, after school)
export function reading(ctx) {
  const { cfg, sw } = ctx;
  const { grid, hits } = findGrid(sw);
  const story = storyLines(sw, 3);
  const pct = Math.round((sw.number / sw.total) * 100);
  return page(cfg, {
    body: `
    ${header('Reading time', updated(ctx))}
    <section class="hero row">
      ${wordCard(sw, { width: 250, height: 196, scale: 1.12 })}
      <div class="side">
        <div class="cap">Spell it</div>
        <div class="kid letters">${[...sw.word].map(esc).join(' · ')}</div>
        <div class="sent" style="font-size:28px;margin-top:12px">${sentenceHtml(sw)}</div>
      </div>
    </section>
    <section class="story soft">
      <div class="cap">Read it yourself</div>
      <div class="kid lines">${story.map((l, i) => `<div>${i === 0 ? sentenceHtml({ sentence: l }) : esc(l)}</div>`).join('')}</div>
    </section>
    <section class="find">
      <div class="row between"><div class="cap">Find the word</div><div class="kid q">Can you find <b>${esc(sw.word)}</b> ${hits} times?</div></div>
      <div class="fgrid">${grid.map((g) => `<span class="kid fw">${esc(g)}</span>`).join('')}</div>
    </section>
    <section class="prog">
      <div class="row between"><div class="cap">${ctx.labels.progress}</div><div class="kid pn"><b>${sw.number}</b> of ${sw.total}</div></div>
      <div class="bar"><i style="width:${Math.max(pct, 2)}%"></i></div>
    </section>`,
    css: `
    .hero{gap:22px;padding:20px 0 16px}.side{flex:1}
    .letters{font-size:40px;letter-spacing:1px;margin-top:2px}
    .story{padding:12px 18px 14px}.lines{font-size:27px;line-height:1.45;margin-top:4px}
    .lines b{text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:2px}
    .between{justify-content:space-between}
    .find{padding-top:16px}.q{font-size:18px}.q b{text-decoration:underline;text-underline-offset:3px}
    .fgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px}
    .fw{font-size:27px;text-align:center;border:1.5px solid #999;border-radius:10px;padding:5px 0 8px}
    .prog{margin-top:auto;padding-top:12px}.pn{font-size:18px}
    .bar{height:16px;border:2px solid #000;border-radius:10px;margin-top:6px;overflow:hidden}
    .bar i{display:block;height:100%;background:#000}`,
  });
}

// ---------------------------------------------------------------- bedtime (night, dark)
export function bedtime(ctx) {
  const { cfg, w, sw, swTomorrow, moon } = ctx;
  // After midnight "tomorrow" is today's forecast.
  const late = ctx.now.hour < 12;
  const nextIso = late ? w.date.iso : addDays(w.date.iso, 1);
  const nextDay = late ? w.today : w.tomorrow;
  const school = isSchoolDay(nextIso);
  const when = late ? 'today' : 'tomorrow';
  const wake = school ? `Wake up at <b>${esc(family.wakeTime)}</b> · school day` : `No school ${when} · sleep in!`;
  return page(cfg, {
    dark: true,
    body: `
    ${header(esc(w.city), updated(ctx))}
    <div class="moon">${moonSvg(moon.phase, 180)}</div>
    <div class="kid gn">Good night${family.childName ? `, ${esc(family.childName)}` : ''}</div>
    <div class="sub">${moon.name} · ${moon.note}</div>
    <div class="cards">
      <div class="card"><div class="cap">${ctx.labels.learned}</div><div class="kid w">${esc(sw.word)}</div></div>
      <div class="card"><div class="cap">${ctx.labels.next}</div><div class="kid w">${esc(swTomorrow.word)}</div></div>
    </div>
    <div class="tm row">${icon(nextDay.icon, 46, 1.4)}<div><div class="cap">${late ? 'Today' : 'Tomorrow'}</div><div class="hl">${nextDay.max}° / ${nextDay.min}° · ${esc(nextDay.label)}</div></div></div>
    <div class="wake row">${pic('clock', 28, 1.6)}<span>${wake}</span></div>`,
    css: `
    .dark svg.icon{stroke:#fff}
    .moon{display:grid;place-items:center;margin-top:36px}
    .gn{font-size:56px;font-weight:700;text-align:center;margin-top:18px}
    .sub{text-align:center;color:#bbb;font-size:15px;margin-top:2px}
    .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:30px}
    .card{border:1.5px solid #888;border-radius:16px;padding:12px 16px 14px;text-align:center}
    .w{font-size:60px;font-weight:700;line-height:1.1}
    .tm{gap:14px;justify-content:center;margin-top:24px}.hl{font-size:20px;font-weight:600}
    .wake{gap:10px;justify-content:center;margin-top:auto;font-size:17px;color:#ddd}.wake b{color:#fff}`,
  });
}

// ---------------------------------------------------------------- weekend (Sat/Sun daytime)
export function weekend(ctx) {
  const { cfg, w, aq, sw } = ctx;
  const out = outingIdea(w, aq);
  const cd = nextCountdown(w.date.iso);
  const plans = family.weekendPlans.slice(0, 4);
  return page(cfg, {
    body: `
    ${header(esc(w.city), `Weekend · ${updated(ctx).toLowerCase()}`)}
    <section class="days">${w.days.map((d, i) => `
      <div class="day ${i === 0 ? 'box' : 'soft'}"><div class="dn">${i === 0 ? 'Today' : d.name}</div>${icon(d.icon, 52, 1.3)}
        <div class="hl">${d.max}° <span class="lo">${d.min}°</span></div><div class="sm">${esc(d.label)}</div><div class="sm muted">${d.rain}% rain</div></div>`).join('')}
    </section>
    <section class="out box row">
      ${pic(out.kind === 'outdoor' ? 'mountain' : 'house', 58, 1.4)}
      <div><div class="cap">${out.title}</div><div class="ot">${esc(out.place)}</div><div class="sm muted">${esc(out.tip)}</div></div>
    </section>
    ${wordSection(sw, { width: 190, height: 128, scale: 0.78, sentence: 25, pad: '16px 0 14px' })}
    <section class="two">
      ${cd ? `<div class="count soft"><div class="cap">Countdown</div><div class="big">${cd.days}</div><div class="kid">${cd.days === 1 ? 'sleep' : 'sleeps'} ${esc(cd.label)}</div></div>` : ''}
      <div class="plan soft"><div class="cap">This weekend</div>
        ${plans.map((p) => `<div class="pi"><span class="pt">${esc(p.when)}</span><span>${esc(p.what)}</span></div>`).join('')}
        ${nextFestival(w.date.iso) ? `<div class="soon row">${pic(nextFestival(w.date.iso).icon, 22, 1.5)}<span>${esc(nextFestival(w.date.iso).name.replace(/!$/, ''))} in ${nextFestival(w.date.iso).days} days</span></div>` : ''}</div>
    </section>`,
    css: `
    .days{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px 0 12px}
    .day{padding:10px 8px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px}
    .dn{font-size:17px;font-weight:700}.hl{font-size:24px;font-weight:700}.lo{font-size:17px;color:#555;font-weight:600}
    .out{gap:14px;padding:12px 16px}.ot{font-size:24px;font-weight:700;line-height:1.2}
    .two{display:grid;grid-template-columns:${cd ? '170px 1fr' : '1fr'};gap:12px;flex:1}
    .count{padding:12px;text-align:center;display:flex;flex-direction:column;justify-content:center}
    .big{font-size:72px;font-weight:700;line-height:1}.count .kid{font-size:17px;line-height:1.2}
    .plan{padding:10px 16px;display:flex;flex-direction:column}.pi{display:flex;gap:12px;font-size:17px;padding:8px 0;border-bottom:1px solid #ccc}
    .pt{width:80px;flex:none;color:#444;font-size:13px;padding-top:3px}
    .soon{gap:8px;margin-top:auto;padding-top:8px;font-size:14px;color:#444}`,
  });
}

// ---------------------------------------------------------------- festival (all day on festival dates)
export function festival(ctx) {
  const { cfg, w, aq, sw, fest } = ctx;
  const d = w.date;
  const next = nextFestival(d.iso);
  return page(cfg, {
    body: `
    ${header(esc(w.city), updated(ctx))}
    <section class="banner row">
      <div class="art">${pic(fest.icon, 52, 1.4)}${pic(fest.icon, 40, 1.4)}${pic(fest.icon, 52, 1.4)}</div>
      <div><div class="hd">${esc(fest.name)}</div><div class="sm muted">${esc(fest.line)}</div></div>
    </section>
    <section class="wx row">
      <div class="row" style="gap:4px">${icon(w.current.icon, 68, 1.3)}<div class="t">${w.current.temp}°</div></div>
      ${aq ? `<div class="aq soft"><div class="cap">Air quality</div><div class="row" style="gap:10px"><div class="aqv">${aq.aqi}</div><div class="sm"><b>${esc(aq.label)}</b><br>${esc(aq.advice)}</div></div></div>`
           : `<div class="aq soft"><div class="cap">Today</div><div class="sm" style="font-size:16px">${w.today.max}° / ${w.today.min}° · ${esc(w.today.label)}</div></div>`}
    </section>
    <div class="thin"></div>
    ${wordSection(sw, { width: 220, height: 150, scale: 0.9, sentence: 28, pad: '18px 0 18px' })}
    <div class="thin"></div>
    <section class="date row">
      <div class="dn">${d.day}</div>
      <div><div class="dw">${d.weekday}</div><div class="dm">${d.month}</div>
        <div class="sm muted">Sunrise ${d.sunrise} · Sunset ${d.sunset}</div>
        ${next ? `<div class="sm muted">Next: ${esc(next.name.replace(/!$/, ''))} in ${next.days} days</div>` : ''}</div>
    </section>
    <div class="border">${pic(fest.icon, 30, 1.4).repeat(11)}</div>`,
    css: `
    .banner{gap:16px;padding:16px 18px;margin-top:14px;border:2px solid #000;border-radius:16px;background:#f0f0f0}
    .art{display:flex;align-items:flex-end;gap:2px}.hd{font-size:32px;font-weight:700;line-height:1.1}
    .wx{gap:16px;padding:16px 0}.t{font-size:68px;font-weight:600;letter-spacing:-1px}
    .aq{flex:1;padding:10px 14px}.aqv{font-size:36px;font-weight:700;line-height:1.1}
    .date{gap:24px;flex:1;padding-top:8px}.dn{font-size:140px;font-weight:700;line-height:.9;letter-spacing:-4px}
    .dw{font-size:21px}.dm{font-size:32px;font-weight:700}
    .border{display:flex;justify-content:space-between;padding-top:6px;border-top:1px dashed #888}`,
  });
}

export const PAGES = { main, morning, reading, bedtime, weekend, festival };
