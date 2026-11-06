/* The Offer Desk: FINAN IV Unit 4 (money over time). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-02 (case_reuse.py): Dagny Tomasek, Ferreira Outfitters, Racine Trucking, all clean.
   Rework 2026-11-06 (Samuel's 11/05 desk rules, design/course-principles.md): a worked example on every task (engine `example`),
   each answer field under its own question (`parts`) on the two-question steps, tolerance sentences gone from every help line,
   formulas name their cells, rounder seeds (whole-thousand amounts, whole-percent loan rates), and more wrong answers diagnosed
   with the student's own numbers. All inputs are fictional, so no step has `sources`. seedVersion moved to 2 and version to 3,
   so saved progress and receipts from earlier versions do not carry over. */
(function (root) {
  'use strict';
  const RATES = [0.04, 0.05, 0.06, 0.07];
  const QUIZ = [
    { title: 'Quick win: why money grows faster each year',
      q: 'You put $100 in an account that pays 10% a year and leave it alone. Why do you have $121 after two years, not $120?',
      options: ['In year 2 you also earn interest on year 1’s interest', 'The bank adds a $1 loyalty bonus', 'The rate rises to 11% in year 2', 'It is a rounding difference'],
      answer: 0,
      why: ['Right. Year 1 turns $100 into $110. Year 2 pays 10% on all $110, which is $11, not $10. Earning interest on interest is called compounding.',
        'There is no bonus. Year 2 pays 10% on $110, the balance after year 1, so it pays $11.',
        'The rate stays 10%. What grows is the balance it applies to: $110 in year 2 instead of $100.',
        'It is not rounding. The extra $1 is interest earned on year 1’s $10 of interest.'] },
    { title: 'Quick win: what counts as an annuity',
      q: 'Which of these is an annuity?',
      options: ['$2,000 at the end of each year for 4 years', 'One payment of $8,000 in 4 years', 'Payments that grow by 3% every year', 'A savings account with no withdrawals'],
      answer: 0,
      why: ['Right. An annuity is the same payment at regular intervals for a set number of periods.',
        'A single payment is a lump sum, not an annuity. You find its value with one discount factor.',
        'Growing payments are a growing annuity, a different case. A plain annuity pays the same amount each time.',
        'An account is where money sits. An annuity is a stream of equal payments.'] },
    { title: 'Quick win: start of the year or end of the year',
      q: 'Two payment plans have the same payment, the same rate and the same number of years. Plan A pays at the start of each year; Plan B pays at the end. Which is worth more today?',
      options: ['Plan A, because each payment arrives a year sooner', 'Plan B, because you wait longer', 'They are worth the same', 'It depends on whether the rate is above 5%'],
      answer: 0,
      why: ['Right. Payments at the start of each year (an annuity due) each arrive one year earlier, so each is discounted one year less and the total is worth more.',
        'Waiting makes money worth less today, not more. Plan B’s payments are each discounted one extra year.',
        'They have the same payments, but not the same timing. Earlier money is worth more today.',
        'At any positive rate, earlier payments are worth more. The size of the rate changes how much more, not which plan wins.'] },
    { title: 'Exam-style question',
      q: 'A job offer includes an $8,000 bonus paid three years from now. At 5% a year, what is the bonus worth today?',
      options: ['$6,911', '$6,957', '$7,619', '$9,261'],
      answer: 0,
      why: ['Right. $8,000 ÷ 1.05³ = $8,000 ÷ 1.1576 = $6,911. Questions on the exams look like this one.',
        '$6,957 divides by 1.15, which adds up three years of 5% without compounding. Divide by 1.05 three times instead: 1.05³ = 1.1576.',
        '$7,619 discounts only one year. The bonus arrives at the end of year 3, so divide by 1.05³.',
        '$9,261 grows the bonus forward. It already arrives in the future, so bring it back to today by dividing by 1.05³.'] },
  ];

  const STEPS = [
    { id: 'walk', label: 'Worked example', kind: 'walk' },
    { id: 'q1', label: 'Check 1', kind: 'check', quiz: 0 },
    { id: 't1', label: 'Savings', kind: 'task' },
    { id: 't2', label: 'Two bonuses', kind: 'task' },
    { id: 'q2', label: 'Check 2', kind: 'check', quiz: 1 },
    { id: 't3', label: 'Stipend or cash', kind: 'task' },
    { id: 'q3', label: 'Check 3', kind: 'check', quiz: 2 },
    { id: 't4', label: 'Loan payment', kind: 'task' },
    { id: 't5', label: 'Scholarship', kind: 'task' },
    { id: 't6', label: 'Growth rate', kind: 'task' },
    { id: 'q4', label: 'Exam-style question', kind: 'check', quiz: 3 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];

  function buildTasks(rng, h) {
    const T = [];
    { const r = h.pick(rng, RATES), n = h.between(rng, 3, 6, 1), P = h.between(rng, 4000, 9000, 1000);
      T.push({ id: 't1', r, n, P, answer: P * Math.pow(1 + r, n) }); }
    { const r = h.pick(rng, RATES), A = h.between(rng, 4000, 8000, 1000);
      // Racine's later bonus is always the bigger number. When Ferreira should win, it is bigger by less than two years of interest,
      // so the student has to discount to see it (a smaller later bonus would be a no-brainer).
      const favorB = rng() < 0.5, g2 = Math.pow(1 + r, 2) - 1;
      const B = h.round(favorB ? A * Math.pow(1 + r, 2) * (1.06 + 0.06 * rng()) : A * (1 + g2 * (0.3 + 0.3 * rng())), 100);
      const pvB = B / Math.pow(1 + r, 2);
      T.push({ id: 't2', r, A, B, answer: pvB, decision: pvB > A ? 'racine' : 'ferreira' }); }
    { const r = h.pick(rng, RATES), Cp = h.between(rng, 3000, 6000, 1000), n = 4;
      const pv = Cp * h.annuityFactor(r, n); const favorS = rng() < 0.5; const D = h.round(pv * (favorS ? 0.90 - 0.04 * rng() : 1.05 + 0.05 * rng()), 500);
      T.push({ id: 't3', r, C: Cp, n, D, answer: pv, decision: pv > D ? 'racine' : 'ferreira' }); }
    { const r = h.pick(rng, [0.05, 0.06, 0.07]), n = 10, L = h.between(rng, 24000, 36000, 2000);
      T.push({ id: 't4', r, n, L, af: h.annuityFactor(r, n), answer: L / h.annuityFactor(r, n) }); }
    { const r = h.pick(rng, [0.03, 0.04, 0.05]), S = h.between(rng, 2000, 6000, 1000);
      T.push({ id: 't5', r, S, answer: S / r }); }
    { const g = h.pick(rng, [0.03, 0.035, 0.04, 0.045, 0.05]), n = h.between(rng, 3, 6, 1), S0 = h.between(rng, 50000, 70000, 5000);
      const S1 = h.round(S0 * Math.pow(1 + g, n), 1000);
      T.push({ id: 't6', n, S0, S1, answer: Math.pow(S1 / S0, 1 / n) - 1 }); }
    return T;
  }

  const m = (x, dp) => root.DeskEngine.h.money(x, dp);
  const p = (r) => root.DeskEngine.h.pct(r);
  const f4 = (x) => x.toFixed(4);

  const DOLLAR = 'Round to the nearest dollar.';
  function taskView(t, L, h) {
    if (t.id === 't1') return { title: 'Savings: your first down payment', place: 'You plan to buy a car once you are settled in your new job.',
      body: `<p>You have <b>${m(t.P)}</b> saved. You leave it in an account that pays <b>${p(t.r)}</b> a year for <b>${t.n} years</b>, adding nothing and taking nothing out.</p>`,
      example: `<p>$2,000 saved at 10% a year for 4 years.</p>
        <p>After year 1: $2,000 × 1.10 = $2,200.</p>
        <p>After year 2: $2,200 × 1.10 = $2,420.</p>
        <p>After year 4: $2,000 × 1.10⁴ = $2,000 × 1.4641 = $2,928.20.</p>`,
      value: { label: `How much will the account hold at the end of year ${t.n}?`, help: DOLLAR } };
    if (t.id === 't2') return { title: 'Two bonuses: now or later?', place: 'Your two job offers pay their bonuses at different times.',
      body: `<ul><li><b>Ferreira Outfitters</b> (an FP&A analyst role) pays a <b>${m(t.A)}</b> signing bonus on your first day.</li>
        <li><b>Racine Trucking</b> (a financial analyst role) pays a <b>${m(t.B)}</b> retention bonus if you are still there at the end of year 2.</li></ul>
        <p>You could earn <b>${p(t.r)}</b> a year on money you have now.</p>`,
      example: `<p>$3,000 now, or $3,500 at the end of year 2, at 10% a year.</p>
        <p>$3,500 ÷ 1.10² = $3,500 ÷ 1.21 = $2,892.56 today.</p>
        <p>$2,892.56 is less than $3,000, so the $3,000 now is worth more.</p>`,
      parts: [{ html: '', field: 'value' }, { html: '', field: 'choice' }],
      value: { label: '1. What is Racine’s bonus worth today?', help: DOLLAR },
      choice: { legend: '2. Which bonus is worth more today?', options: [['ferreira', 'Ferreira’s, now'], ['racine', 'Racine’s, in year 2']] } };
    if (t.id === 't3') {
      const rows = L.rows || [];
      const body = Array.from({ length: t.n }, (_, i) => { const y = i + 1;
        return `<tr><td>${y}</td><td>${m(t.C)}</td><td>${f4(h.df(t.r, y))}</td><td><label class="sr-only" for="r${y}">Value today, year ${y}</label><input id="r${y}" class="rowin" data-row="${y}" inputmode="decimal" autocomplete="off" placeholder="$0" value="${rows[y] ? String(rows[y]).replace(/"/g, '') : ''}"><span class="mark" id="mk${y}"></span></td></tr>`; }).join('');
      return { title: 'Stipend or cash?', place: 'Both employers want to help you move.',
        body: `<ul><li><b>Racine Trucking</b> pays a housing stipend of <b>${m(t.C)}</b> at the end of each of your first <b>${t.n} years</b>.</li>
          <li><b>Ferreira Outfitters</b> pays <b>${m(t.D)}</b> in relocation cash on your first day.</li></ul>
          <p>You can earn <b>${p(t.r)}</b> a year.</p>`,
        example: `<p>$1,000 at the end of each of 2 years, at 10% a year.</p>
          <p>Year 1: $1,000 × 0.9091 = $909.09.</p>
          <p>Year 2: $1,000 × 0.8264 = $826.45.</p>
          <p>Total today: $909.09 + $826.45 = $1,735.54.</p>`,
        parts: [{ html: '<p>1. Fill in each payment’s value today (payment × discount factor). The total fills in by itself.</p>', field: 'table' }, { html: '', field: 'choice' }],
        table: `<div class="tw"><table class="cf"><caption>Racine’s stipend, discounted at ${p(t.r)}</caption><thead><tr><th scope="col">Year</th><th scope="col">Payment</th><th scope="col">Discount factor</th><th scope="col">Value today (payment × discount factor)</th></tr></thead><tbody>${body}</tbody>
          <tfoot><tr class="total hl"><td colspan="3"><b>Total value today</b> (years 1 to ${t.n})</td><td id="rowTotal"><b>$0</b></td></tr><tr><td colspan="3">Ferreira’s cash, today</td><td>${m(t.D)}</td></tr></tfoot></table></div>`,
        onRows: (rs, $) => { let s = 0; for (let y = 1; y <= t.n; y++) { const v = h.parseMoney(rs[y]); if (isFinite(v)) s += v; } $('#rowTotal').innerHTML = '<b>' + m(s) + '</b>'; },
        choice: { legend: '2. Which deal is worth more today?', options: [['racine', 'Racine’s stipend'], ['ferreira', 'Ferreira’s cash']] },
        helpLabels: ['Show me the first row', 'Show me every row'] };
    }
    if (t.id === 't4') return { title: 'Your student loan payment', place: 'Your federal student loan comes due six months after graduation.',
      body: `<p>You owe <b>${m(t.L)}</b> at <b>${p(t.r)}</b> a year, repaid with <b>${t.n} equal payments</b>, one at the end of each year. The bank hands you the loan today, so your payments have to be worth exactly that much today.</p>
        <div class="formula"><span>payment = loan ÷ annuity factor,</span> <span>where annuity factor = (1 − (1 + r)<sup>−n</sup>) ÷ r</span></div>`,
      example: `<p>Borrow $10,000 at 10% a year for 5 years.</p>
        <p>Annuity factor = (1 − 1.10<sup>−5</sup>) ÷ 0.10 = 3.7908.</p>
        <p>Payment = $10,000 ÷ 3.7908 = $2,637.97 a year.</p>`,
      parts: [{ html: `<p class="small">In the calculator, your annuity factor is <code>(1-(1+${t.r})^-${t.n})/${t.r}</code>.</p>`, field: 'value' }],
      value: { label: 'What is your yearly payment?', help: DOLLAR } };
    if (t.id === 't5') return { title: 'Someday: a scholarship in your name', place: 'Ten years from now, you want to give back.',
      body: `<p>Your college names a scholarship after any donor whose gift pays <b>${m(t.S)}</b> a year, every year forever. The college invests the gift and expects to earn <b>${p(t.r)}</b> a year.</p>
        <p>A payment that goes on forever is a <b>perpetuity</b>.</p>
        <div class="formula"><span>value today = yearly payment ÷ r</span></div>`,
      example: `<p>$800 a year forever, at 8% a year.</p>
        <p>$800 ÷ 0.08 = $10,000 today.</p>
        <p>Check: $10,000 × 8% = $800 a year, and the $10,000 never shrinks.</p>`,
      value: { label: 'How much would you need to give today?', help: DOLLAR } };
    if (t.id === 't6') return { title: 'Growth: what raise does that promise?', place: 'Racine Trucking’s hiring manager talks about where the job leads.',
      body: `<p>Racine’s offer starts at <b>${m(t.S0)}</b> a year. The hiring manager says analysts who stay usually earn <b>${m(t.S1)}</b> after <b>${t.n} years</b>.</p>
        <p>The steady yearly raise that gets there is the <b>compound annual growth rate</b> (CAGR):</p>
        <div class="formula"><span>CAGR = (end ÷ start)<sup>1/n</sup> − 1</span></div>`,
      example: `<p>Pay grows from $40,000 to $50,000 in 3 years.</p>
        <p>End ÷ start = $50,000 ÷ $40,000 = 1.25.</p>
        <p>1.25<sup>1/3</sup> = 1.0772.</p>
        <p>CAGR = 1.0772 − 1 = 0.0772, or 7.72%.</p>`,
      parts: [{ html: `<p class="small">In the calculator: <code>(${t.S1}/${t.S0})^(1/${t.n})-1</code>.</p>`, field: 'value' }],
      value: { label: 'What steady yearly raise is that?', placeholder: '0.00%', help: 'Type a percent, like 4.2%.' } };
  }

  function judgeTask(t, e, h) {
    const v = h.parseMoney(e.value);
    if (t.id === 't1') return h.judgeNumber(v, t.answer, [
      [t.P * (1 + t.r * t.n), 'simple', `That adds ${p(t.r)} of the original ${m(t.P)} each year. Interest also earns interest, so multiply by (1 + r) once for each year: ${m(t.P)} × (1 + ${t.r})^${t.n}.`],
      [t.P / Math.pow(1 + t.r, t.n), 'pv', `That divides ${m(t.P)} by (1 + ${t.r})^${t.n}, which shrinks it. Money you leave in the account grows, so multiply: ${m(t.P)} × (1 + ${t.r})^${t.n}.`],
      [t.P * Math.pow(1 + 100 * t.r, t.n), 'wholerate', `That uses ${t.r * 100} as the rate. ${p(t.r)} is ${t.r} as a decimal, so multiply by (1 + ${t.r}) each year.`],
      [t.P * Math.pow(1 + t.r, t.n - 1), 'offbyone', `That grows the money for ${t.n - 1} years. Use all ${t.n}.`],
      [t.P * (1 + t.r), 'oneyear', `That is one year of growth. Repeat it ${t.n} times: ${m(t.P)} × (1 + ${t.r})^${t.n}.`]],
      { otherMsg: `Future value = today’s amount × (1 + r)^years = ${m(t.P)} × (1 + ${t.r})^${t.n}.` });
    if (t.id === 't2') {
      const n = h.judgeNumber(v, t.answer, [
        [t.B * Math.pow(1 + t.r, 2), 'fv', `That multiplies ${m(t.B)} by (1 + ${t.r})², which grows it. The bonus already arrives in the future, so bring it back: ${m(t.B)} ÷ (1 + ${t.r})².`],
        [t.B / (1 + 2 * t.r), 'simple', `That divides by 1 + 2 × ${t.r}. Discount one year at a time instead: divide by (1 + ${t.r}) twice, which is (1 + ${t.r})².`],
        [t.B / (1 + t.r), 'oneyear', `That discounts only one year. The bonus arrives at the end of year 2, so divide ${m(t.B)} by (1 + ${t.r})².`],
        [t.B, 'nodiscount', `That is the bonus itself. Money in year 2 is worth less today, so divide ${m(t.B)} by (1 + ${t.r})².`],
        [t.B - t.A, 'difference', `That is the gap between the two bonuses. Question 1 asks only for Racine’s ${m(t.B)} moved to today: ${m(t.B)} ÷ (1 + ${t.r})².`]],
        { otherMsg: `Value today = ${m(t.B)} ÷ (1 + ${t.r})².` });
      if (!n.ok) return n;
      if (e.choice !== t.decision) return { ok: false, code: 'decision', msg: !e.choice ? 'Pick which bonus is worth more as well.' : `Compare the two values today: ${m(t.answer)} for Racine against ${m(t.A)} for Ferreira.` };
      return { ok: true };
    }
    if (t.id === 't3') {
      const rows = e.rows || []; const rowRes = [];
      for (let y = 1; y <= t.n; y++) { const val = h.parseMoney(rows[y]); const exact = t.C * h.df(t.r, y);
        const diag = [[t.C, 'nodiscount', `That is the payment itself. Value today = ${m(t.C)} × ${f4(h.df(t.r, y))}.`],
          [t.C * Math.pow(1 + t.r, y), 'fv', `That grows the payment, or divides it by the discount factor. Multiply instead: ${m(t.C)} × ${f4(h.df(t.r, y))}.`]];
        if (y > 1) diag.push([t.C / (1 + t.r * y), 'simple', `That divides by 1 + ${y} × ${t.r}. Use the year ${y} discount factor in the table: ${m(t.C)} × ${f4(h.df(t.r, y))}.`], [t.C * h.df(t.r, y - 1), 'lastyear', `That uses year ${y - 1}’s discount factor. Year ${y} uses ${f4(h.df(t.r, y))}.`]);
        rowRes[y] = h.judgeNumber(val, exact, diag,
          { scale: t.C, otherMsg: `Value today = payment × discount factor = ${m(t.C)} × ${f4(h.df(t.r, y))}.` }); }
      const bad = rowRes.findIndex((x, i) => i > 0 && !x.ok);
      if (bad > 0) return { ok: false, rowRes, msg: `Year ${bad}: ${rowRes[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes, msg: !e.choice ? 'Pick which deal is worth more as well.' : `Compare the totals: ${m(t.answer)} for the stipend against ${m(t.D)} in cash.` };
      return { ok: true, rowRes };
    }
    if (t.id === 't4') return h.judgeNumber(v, t.answer, [
      [t.L / t.n, 'nointerest', `That splits the loan into ${t.n} equal parts with no interest. The bank charges ${p(t.r)}, so divide by the annuity factor (${f4(t.af)}), not by ${t.n}.`],
      [t.L * t.r, 'interestonly', `That is ${m(t.L)} × ${p(t.r)}, only the interest, so the balance would never go down. Divide the loan by the annuity factor: ${m(t.L)} ÷ ${f4(t.af)}.`],
      [t.L * Math.pow(1 + t.r, t.n) / t.n, 'fvsplit', `That grows the loan for all ${t.n} years and then splits it, which overcharges interest. Divide the loan by the annuity factor: ${m(t.L)} ÷ ${f4(t.af)}.`],
      [t.L * t.af, 'times', `That multiplies by the annuity factor. Divide instead: ${m(t.L)} ÷ ${f4(t.af)}.`],
      [t.L / h.annuityFactor(t.r / 12, t.n * 12), 'monthly', `That is a monthly payment. This loan is paid once a year, so use r = ${t.r} and n = ${t.n}: ${m(t.L)} ÷ ${f4(t.af)}.`]],
      { minTol: 1, otherMsg: `Payment = ${m(t.L)} ÷ ${f4(t.af)}.` });
    if (t.id === 't5') return h.judgeNumber(v, t.answer, [
      [t.S * t.r, 'times', `That multiplies by the rate. A perpetuity is payment ÷ r: ${m(t.S)} ÷ ${t.r}.`],
      [t.S / (100 * t.r), 'wholerate', `That divides by ${t.r * 100}. Write ${p(t.r)} as the decimal ${t.r}: ${m(t.S)} ÷ ${t.r}.`],
      [t.S / (1 + t.r), 'oneyear', `That is the value of one payment. A perpetuity pays forever: ${m(t.S)} ÷ ${t.r}.`],
      [t.S / t.r * (1 + t.r), 'due', 'That would be right if the first payment came today. The first scholarship is paid a year from now, so use payment ÷ r.']],
      { otherMsg: `Value today = ${m(t.S)} ÷ ${t.r}.` });
    if (t.id === 't6') { let g = v; if (isFinite(g) && Math.abs(g) >= 1 && !/%/.test(String(e.value))) g = g / 100;
      return h.judgeNumber(g, t.answer, [
        [(t.S1 / t.S0 - 1) / t.n, 'simple', `That splits the total raise evenly across ${t.n} years. Each year’s raise also applies to the earlier raises, so raise the growth factor to the power 1/${t.n}: (end ÷ start)^(1/${t.n}) − 1.`],
        [t.S1 / t.S0 - 1, 'total', `That is the total growth over all ${t.n} years. The question asks for the yearly rate: (end ÷ start)^(1/${t.n}) − 1.`],
        [Math.pow(t.S1 / t.S0, 1 / t.n), 'noone', 'Almost there. Subtract 1 to turn the growth factor into a rate.'],
        [t.S1 / t.S0 / t.n - 1, 'parens', `That divides by ${t.n} instead of taking the power 1/${t.n}. In the calculator, put the power in parentheses: ^(1/${t.n}).`]],
        { tol: 0.0006, closeMsg: 'Close. Keep more decimal places and round only at the end.', otherMsg: `CAGR = (${m(t.S1)} ÷ ${m(t.S0)})^(1/${t.n}) − 1.` }); }
  }

  function helpText(t, lvl, h) {
    if (t.id === 't1') return lvl === 1 ? `After one year: ${m(t.P)} × (1 + ${t.r}) = ${m(t.P * (1 + t.r), 1)}. Each year multiplies by (1 + ${t.r}) again.` : `${m(t.P)} × (1 + ${t.r})^${t.n}. In the calculator: <code>${t.P}*(1+${t.r})^${t.n}</code>.`;
    if (t.id === 't2') return lvl === 1 ? `Racine’s bonus arrives in 2 years, so divide it by (1 + ${t.r}) twice.` : `${m(t.B)} ÷ (1 + ${t.r})² = ${m(t.answer)}. Compare that with Ferreira’s ${m(t.A)}, which is already in today’s dollars.`;
    if (t.id === 't3') { if (lvl === 1) return `Year 1: ${m(t.C)} × ${f4(h.df(t.r, 1))} = ${m(t.C * h.df(t.r, 1))}. Do the same for each year, then compare the total with ${m(t.D)}.`;
      return 'Every row:<br>' + Array.from({ length: t.n }, (_, i) => `Year ${i + 1}: ${m(t.C)} × ${f4(h.df(t.r, i + 1))} = ${m(t.C * h.df(t.r, i + 1))}`).join('<br>') + `<br>Compare the total with ${m(t.D)}.`; }
    if (t.id === 't4') return lvl === 1 ? `First find the annuity factor: (1 − (1 + ${t.r})^−${t.n}) ÷ ${t.r} = ${f4(t.af)}.` : `Payment = ${m(t.L)} ÷ ${f4(t.af)}. In the calculator: <code>${t.L}/((1-(1+${t.r})^-${t.n})/${t.r})</code>.`;
    if (t.id === 't5') return lvl === 1 ? 'A perpetuity’s value today is the yearly payment divided by the rate.' : `${m(t.S)} ÷ ${t.r}. In the calculator: <code>${t.S}/${t.r}</code>.`;
    if (t.id === 't6') return lvl === 1 ? `First divide: ${m(t.S1)} ÷ ${m(t.S0)} = ${(t.S1 / t.S0).toFixed(4)}. That is the growth over all ${t.n} years. Then raise it to the power 1/${t.n} to get one year’s growth.` : `(${(t.S1 / t.S0).toFixed(4)})^(1/${t.n}) − 1 = ${p(t.answer)}. In the calculator: <code>(${t.S1}/${t.S0})^(1/${t.n})-1</code>.`;
  }
  function praise(t) {
    if (t.id === 't1') return `Your ${m(t.P)} grows to ${m(t.answer)}. ${m(t.answer - t.P - t.P * t.r * t.n)} of that is interest earned on interest.`;
    if (t.id === 't2') return `Racine’s bonus is worth ${m(t.answer)} today, against ${m(t.A)} for Ferreira’s, so ${t.decision === 'racine' ? 'the later bonus is worth more, even after waiting' : 'the smaller bonus now is worth more'}.`;
    if (t.id === 't3') return `The stipend is worth ${m(t.answer)} today, against ${m(t.D)} in cash. ${t.decision === 'racine' ? 'The stipend wins.' : 'The cash wins, even though the stipend adds up to more.'}`;
    if (t.id === 't4') return `You pay ${m(t.answer)} a year, ${m(t.answer * t.n)} in total. ${m(t.answer * t.n - t.L)} of that is interest.`;
    if (t.id === 't5') return `A gift of ${m(t.answer)}, invested at ${p(t.r)}, pays ${m(t.S)} a year forever without ever shrinking.`;
    if (t.id === 't6') return `That is a raise of about ${p(t.answer)} a year. By the Rule of 72, pay growing at that rate doubles in about 72 ÷ ${(t.answer * 100).toFixed(1)} = ${(72 / (t.answer * 100)).toFixed(0)} years.`;
  }
  function selfAnswer(t) {
    if (t.id === 't3') { const rows = []; for (let y = 1; y <= t.n; y++) rows[y] = String(Math.round(t.C * Math.pow(1 + t.r, -y))); return { rows, choice: t.decision }; }
    if (t.id === 't6') return { value: (t.answer * 100).toFixed(2) + '%' };
    return { value: String(Math.round(t.answer)), choice: t.decision || null };
  }
  function selfWrong(t) {
    if (t.id === 't6') return { value: (((t.S1 / t.S0 - 1) / t.n) * 100).toFixed(2) + '%' };
    if (t.id === 't3') { const rows = []; for (let y = 1; y <= t.n; y++) rows[y] = String(t.C); return { rows, choice: t.decision }; }
    return { value: String(Math.round(t.answer * 1.2)), choice: t.decision || null };
  }

  const WALK = {
    title: 'How Dagny compares money at different times',
    intro: '<p>Before your own choices, here is one worked from start to finish. Suppose someone offers you <b>$1,000 today</b> or <b>$1,210 in two years</b>, and you can earn <b>10%</b> a year. Which is worth more?</p>',
    render(stage, h) {
      const t1 = `<div class="tw"><table class="cf"><caption>Moving $1,000 through time at 10%</caption><thead><tr><th scope="col">Year</th><th scope="col">Forward (× 1.10)</th>${stage >= 1 ? '<th scope="col">Back to today (÷ 1.10)</th>' : ''}</tr></thead><tbody>
        <tr><td>0 (today)</td><td>$1,000.00</td>${stage >= 1 ? '<td class="' + (stage === 1 ? 'reveal' : '') + '">$1,000.00</td>' : ''}</tr><tr><td>1</td><td>$1,100.00</td>${stage >= 1 ? '<td class="' + (stage === 1 ? 'reveal' : '') + '">$1,100.00</td>' : ''}</tr><tr class="hl"><td>2</td><td>$1,210.00</td>${stage >= 1 ? '<td class="' + (stage === 1 ? 'reveal' : '') + '">$1,210.00</td>' : ''}</tr></tbody></table></div>`;
      if (stage < 2) return t1;
      const rows = [1, 2, 3].map((y) => `<tr class="${stage === 2 ? 'reveal' : ''}"><td>${y}</td><td>$300</td><td>${f4(h.df(0.10, y))}</td><td>${h.money(300 * h.df(0.10, y), 1)}</td></tr>`).join('');
      return t1 + `<div class="tw"><table class="cf"><caption>$300 at the end of each of 3 years, at 10%</caption><thead><tr><th scope="col">Year</th><th scope="col">Payment</th><th scope="col">Discount factor</th><th scope="col">Value today</th></tr></thead><tbody>${rows}</tbody>
        <tfoot><tr class="total hl"><td colspan="3"><b>Value today of all three</b></td><td><b>$746.06</b></td></tr></tfoot></table></div>`;
    },
    stages: [
      { t: 'Grow today’s money forward', p: '$1,000 earning 10% becomes $1,000 × 1.10 = $1,100 after one year, and $1,100 × 1.10 = $1,210 after two. That is <b>future value</b>: FV = PV × (1 + r)<sup>t</sup>.' },
      { t: 'Run it backward', p: '$1,210 two years from now is worth $1,210 ÷ 1.10² = $1,000 today. That is <b>present value</b>: PV = FV ÷ (1 + r)<sup>t</sup>. So the two offers are worth exactly the same.' },
      { t: 'Several payments: add up their values today', p: 'Now suppose you get $300 at the end of each of the next three years. Bring each payment back to today with its discount factor and add them: $272.73 + $247.93 + $225.39 = $746.06.' },
      { t: 'The shortcut for equal payments', p: 'Equal payments at regular intervals are an <b>annuity</b>. Instead of adding rows, multiply the payment by the <b>annuity factor</b>, (1 − (1 + r)<sup>−n</sup>) ÷ r:', extra: '<div class="formula"><span>(1 − 1.10<sup>−3</sup>) ÷ 0.10 = 2.4869,</span> <span>and $300 × 2.4869 = $746.06</span></div>' },
      { t: 'A loan is the same idea in reverse', p: 'If a bank lends you $746.06 at 10%, three payments of $300 pay it off exactly. To find a loan payment, divide: payment = loan ÷ annuity factor = $746.06 ÷ 2.4869 = $300.' },
      { t: 'Payments that never stop', p: 'A payment that goes on forever is a <b>perpetuity</b>. $300 a year forever at 10% is worth $300 ÷ 0.10 = $3,000 today, because $3,000 invested at 10% throws off exactly $300 a year.' },
    ],
  };

  root.DESK = {
    app: 'finan4-u4-offer-desk', version: 3, seedVersion: 2, salt: 'rize-finan4-u4-offer:9d27a1', points: 20,
    storageKey: 'rize-finan4-u4-offer-v1', filePrefix: 'OfferDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-offer-desk/verify.html',
    calcPlaceholder: '2000*1.1^4',
    calcHint: 'Type or tap. Use * to multiply, / to divide and ^ for a power, so 2000*1.1^4 grows $2,000 for 4 years at 10% and 3500/1.1^2 brings $3,500 back 2 years.',
    story: { title: 'The Offer Desk', kicker: 'Corporate Finance, Unit 4', company: 'Career Center', team: 'Money Coaching',
      from: 'Dagny Tomasek', fromTitle: 'financial coach, Career Center',
      dek: 'It is spring of your senior year. You have two job offers, a student loan coming due and a savings goal. Dagny Tomasek, a financial coach at your career center, helps you turn each choice into numbers you can compare fairly.',
      whatBox: '<b>Why timing matters.</b> A dollar you have today can be saved and earn interest, so it is worth more than a dollar you get later. Every choice here comes down to moving money forward or backward in time so that two amounts can be compared on the same day.',
      stepsLine: 'There are twelve steps: a worked example, six money decisions with three one-question checks between them, one exam-style question, and a short note to Dagny.' },
    steps: STEPS, quiz: QUIZ, walk: WALK, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'Your decision', label: 'Your note to Dagny', minWords: 30, receiptHeading: 'Note to the financial coach',
      prompt: 'Dagny asks you to put your thinking in writing before you sign anything. Which offer’s money is worth more to you so far, counting the bonus and the stipend in today’s dollars, and what is one thing besides money you would still weigh?' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
