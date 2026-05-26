// ---------- ROI calculator ----------
(function(){
  const $ = id => document.getElementById(id);
  const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
  const fmtHr = n => Math.round(n).toLocaleString('en-US');

  const ftes = $('ftes'), cost = $('cost'), mid = $('mid');
  const ftesVal = $('ftesVal'), costVal = $('costVal'), midVal = $('midVal');
  const scnLow = $('scnLow'), scnMid = $('scnMid'), scnHigh = $('scnHigh');
  const hoursYr = $('hoursYr'), perWeek = $('perWeek'), pctPayroll = $('pctPayroll');
  const ctaAmount = $('ctaAmount');

  function recalc(){
    const f = +ftes.value, c = +cost.value, m = +mid.value;
    const l = m * 0.6, h = m * 1.4;
    const hourlyRate = c / 2080;
    const weeksPerYr = 50;
    const lowSav = f * l * weeksPerYr * hourlyRate;
    const highSav = f * h * weeksPerYr * hourlyRate;
    const midSav = (lowSav + highSav) / 2;
    const midHrsYr = f * m * weeksPerYr;
    const totalPayroll = f * c;
    const pct = (midSav / totalPayroll) * 100;

    ftesVal.textContent = f;
    costVal.textContent = fmt(c);
    midVal.textContent = m + ' hrs';
    scnLow.textContent = fmt(lowSav);
    scnMid.textContent = fmt(midSav);
    scnHigh.textContent = fmt(highSav);
    hoursYr.textContent = fmtHr(midHrsYr);
    perWeek.textContent = '~' + m.toFixed(1) + ' hrs';
    pctPayroll.textContent = '~' + pct.toFixed(1) + '%';
    ctaAmount.textContent = fmt(lowSav);
  }
  [ftes, cost, mid].forEach(el => el.addEventListener('input', recalc));
  recalc();
})();

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => item.classList.toggle('open'));
});

// ---------- Smooth scroll for anchors ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length <= 1) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 70, behavior:'smooth' });
  });
});
