/* The Offer Desk: FINAN IV Unit 4 (money over time). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-02 (case_reuse.py): Dagny Tomasek, Ferreira Outfitters, Racine Trucking, all clean.
   Version 4 (2026-11-11), the teach-the-minimum pilot (process/standards/interactive-assignments.md rules 25 to 32;
   u04/TEACHING-MAP.md; design/scope-2026-11-11.md):
   - The reading teaches; the desk has no walkthrough of its own (rule 32).
   - Every task states the problem first, then shows a worked example drawn as the SAME table the student fills, read-only,
     with different people and numbers (h.ladder, rule 29). A faded step gives most lines and leaves one or two blank; the next
     step leaves every line blank (rule 26).
   - Cut from the unit: annuity due, perpetuity (Unit 9), CAGR, Rule of 72.
   seedVersion 3 and version 4: progress and receipts from earlier versions do not carry over. */
(function (root) {
  'use strict';
  const RATES = [0.04, 0.05, 0.06, 0.07];
  const QUIZ = [
    { title: 'Quick check: interest on interest',
      q: 'You put $100 in an account that pays 10% a year. Why do you have $121 after two years, not $120?',
      options: ['In year 2 you also earn interest on year 1’s interest', 'The bank adds a $1 bonus', 'The rate rises to 11% in year 2', 'It is a rounding difference'],
      answer: 0,
      why: ['Right. Year 2 pays 10% on $110, which is $11. That is compounding.',
        'There is no bonus. Year 2 pays 10% on $110, the balance after year 1, so it pays $11.',
        'The rate stays 10%. It applies to a bigger balance: $110 instead of $100.',
        'It is not rounding. The extra $1 is interest on year 1’s $10 of interest.'] },
    { title: 'Exam-style question',
      q: 'A job offer includes an $8,000 bonus paid three years from now. At 5% a year, what is the bonus worth today?',
      options: ['$6,911', '$6,957', '$7,619', '$9,261'],
      answer: 0,
      why: ['Right. $8,000 ÷ 1.05³ = $8,000 ÷ 1.1576 = $6,911. Exam questions look like this one.',
        '$6,957 divides by 1.15, which adds three years of 5% without compounding. Divide by 1.05³ = 1.1576 instead.',
        '$7,619 discounts only one year. The bonus arrives in year 3, so divide by 1.05³.',
        '$9,261 grows the bonus forward. It already arrives in the future, so divide by 1.05³ to bring it back.'] },
  ];

  const STEPS = [
    { id: 'fv', label: 'Grow it', kind: 'task' },
    { id: 'q1', label: 'Quick check', kind: 'check', quiz: 0 },
    { id: 'pv1', label: 'Bring it back', kind: 'task' },
    { id: 'pv2', label: 'Two bonuses', kind: 'task' },
    { id: 'rows1', label: 'Three payments', kind: 'task' },
    { id: 'rows2', label: 'Stipend or cash', kind: 'task' },
    { id: 'af1', label: 'The shortcut', kind: 'task' },
    { id: 'loan', label: 'Loan payment', kind: 'task' },
    { id: 'q2', label: 'Exam-style question', kind: 'check', quiz: 1 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];

  const df = (r, t) => 1 / Math.pow(1 + r, t);
  const af = (r, n) => (1 - Math.pow(1 + r, -n)) / r;

  function buildTasks(rng, h) {
    const T = [];
    { const r = h.pick(rng, RATES), P = h.between(rng, 2000, 6000, 1000);
      T.push({ id: 'fv', r, P, y1: P * (1 + r), answer: P * Math.pow(1 + r, 2) }); }
    { const r = h.pick(rng, RATES), B = h.between(rng, 3000, 8000, 500);
      T.push({ id: 'pv1', r, B, d: df(r, 2), answer: B * df(r, 2) }); }
    { const r = h.pick(rng, RATES), A = h.between(rng, 4000, 8000, 1000);
      // The later bonus is always the bigger number; when "now" should win it is bigger by less than three years of interest.
      const favorLater = rng() < 0.5, g3 = Math.pow(1 + r, 3) - 1;
      const B = h.round(favorLater ? A * Math.pow(1 + r, 3) * (1.06 + 0.06 * rng()) : A * (1 + g3 * (0.3 + 0.3 * rng())), 100);
      const pv = B * df(r, 3);
      T.push({ id: 'pv2', r, A, B, d: df(r, 3), answer: pv, decision: pv > A ? 'racine' : 'ferreira' }); }
    { const r = h.pick(rng, RATES), C = h.between(rng, 1000, 3000, 500);
      const v = [1, 2, 3].map((y) => C * df(r, y));
      T.push({ id: 'rows1', r, C, v, answer: v[0] + v[1] + v[2] }); }
    { const r = h.pick(rng, RATES), C = h.between(rng, 2000, 5000, 500);
      const v = [1, 2, 3, 4].map((y) => C * df(r, y)), tot = v.reduce((a, b) => a + b, 0);
      const favorS = rng() < 0.5, D = h.round(tot * (favorS ? 0.90 - 0.04 * rng() : 1.05 + 0.05 * rng()), 500);
      T.push({ id: 'rows2', r, C, v, D, answer: tot, decision: tot > D ? 'racine' : 'ferreira' });
      // The shortcut step checks this same stipend, so its answer must equal the table's total.
      T.push({ id: 'af1', r, C, n: 4, top: 1 - Math.pow(1 + r, -4), f: af(r, 4), answer: C * af(r, 4) }); }
    { const r = h.pick(rng, [0.05, 0.06, 0.07]), n = 10, L = h.between(rng, 24000, 36000, 2000);
      T.push({ id: 'loan', r, n, L, top: 1 - Math.pow(1 + r, -n), f: af(r, n), answer: L / af(r, n) }); }
    return T;
  }

  const m = (x, dp) => root.DeskEngine.h.money(x, dp);
  const p = (r) => root.DeskEngine.h.pct(r);
  const f4 = (x) => x.toFixed(4);
  const g = (r) => String(+(1 + r).toFixed(2));           // 1.05
  const sup = (n) => ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '¹⁰'][n];

  // Lines for each task; the worked example (ex) is the same function on other numbers, so the two tables always match.
  const LINES = {
    fv: (P, r) => [
      { label: 'After year 1', calc: `${m(P)} × ${g(r)}`, value: P * (1 + r), dp: 2 },
      { label: 'After year 2', calc: `${m(P * (1 + r), 2)} × ${g(r)}`, value: P * Math.pow(1 + r, 2), dp: 2, input: true }],
    pv1: (B, r) => [
      { label: 'Discount factor, year 2', calc: `1 ÷ ${g(r)}²`, value: df(r, 2), fmt: 'factor' },
      { label: 'Value today', calc: `${m(B)} × ${f4(df(r, 2))}`, value: B * df(r, 2), dp: 2, input: true }],
    pv2: (B, r) => [
      { label: 'Discount factor, year 3', calc: `1 ÷ ${g(r)}³`, value: df(r, 3), fmt: 'factor', input: true },
      { label: 'Value today', calc: `${m(B)} × the discount factor`, value: B * df(r, 3), dp: 2, input: true }],
    rows1: (C, r, given) => [1, 2, 3].map((y) => ({ label: `Year ${y}`, calc: `${m(C)} × ${f4(df(r, y))}`, value: C * df(r, y), dp: 2, input: !given.includes(y) }))
      .concat([{ label: 'Total value today', calc: 'Add the three rows', value: [1, 2, 3].reduce((s, y) => s + C * df(r, y), 0), dp: 2, input: true }]),
    rows2: (C, r) => [1, 2, 3, 4].map((y) => ({ label: `Year ${y}`, calc: `${m(C)} × ${f4(df(r, y))}`, value: C * df(r, y), dp: 2, input: true }))
      .concat([{ label: 'Total value today', calc: 'Add the four rows', value: [1, 2, 3, 4].reduce((s, y) => s + C * df(r, y), 0), dp: 2, input: true }]),
    af1: (C, r, n) => [
      { label: '1 − (1 + r)<sup>−n</sup>', calc: `In Desmos: <code>1-${g(r)}^-${n}</code>`, value: 1 - Math.pow(1 + r, -n), fmt: 'factor' },
      { label: 'Annuity factor', calc: `Next line: <code>ans/${r}</code>`, value: af(r, n), fmt: 'factor', input: true },
      { label: 'Value today', calc: `${m(C)} × the annuity factor`, value: C * af(r, n), dp: 2, input: true }],
    loan: (L, r, n) => [
      { label: '1 − (1 + r)<sup>−n</sup>', calc: `In Desmos: <code>1-${g(r)}^-${n}</code>`, value: 1 - Math.pow(1 + r, -n), fmt: 'factor', input: true },
      { label: 'Annuity factor', calc: `Next line: <code>ans/${r}</code>`, value: af(r, n), fmt: 'factor', input: true },
      { label: 'Yearly payment', calc: `Next line: <code>${L}/ans</code>`, value: L / af(r, n), dp: 2, input: true }],
  };
  // Built on first use: config.js loads before the engine, so money() is not available at load time.
  const EXAMPLES = () => ({
    fv: { cap: 'Lena saves $1,000 at 10% for two years', lines: LINES.fv(1000, 0.10) },
    pv1: { cap: 'Omar is promised $1,210 in two years, at 10%', lines: LINES.pv1(1210, 0.10) },
    pv2: { cap: 'Priya can take $3,100 now or $4,000 in three years, at 10%', lines: LINES.pv2(4000, 0.10),
      after: 'Priya compares $3,005.26 with $3,100. The $3,100 now is worth more.' },
    rows1: { cap: '$1,000 at the end of each of three years, at 10%', lines: LINES.rows1(1000, 0.10, []) },
    rows2: { cap: 'Sam is offered $1,000 a year for four years, or $3,000 in cash today, at 10%', lines: LINES.rows2(1000, 0.10),
      after: 'Sam compares $3,169.87 with $3,000. The yearly payments are worth more.' },
    af1: { cap: 'Sam’s $1,000 a year for four years, by the shortcut', lines: LINES.af1(1000, 0.10, 4),
      after: 'The same $3,169.87 as Sam’s four-row table.' },
    loan: { cap: 'Jo borrows $10,000 at 10%, repaid over 5 years', lines: LINES.loan(10000, 0.10, 5) },
  });

  function linesFor(t) {
    if (t.id === 'fv') return LINES.fv(t.P, t.r);
    if (t.id === 'pv1') return LINES.pv1(t.B, t.r);
    if (t.id === 'pv2') return LINES.pv2(t.B, t.r);
    if (t.id === 'rows1') return LINES.rows1(t.C, t.r, [1, 2]);
    if (t.id === 'rows2') return LINES.rows2(t.C, t.r);
    if (t.id === 'af1') return LINES.af1(t.C, t.r, t.n);
    if (t.id === 'loan') return LINES.loan(t.L, t.r, t.n);
  }

  const PROBLEM = {
    fv: (t) => ({ title: 'Grow it', place: 'Dagny starts with the savings you already have.',
      body: `<p>You have <b>${m(t.P)}</b> saved at <b>${p(t.r)}</b> a year. How much will you have after <b>2 years</b>? The first line is done for you.</p>` }),
    pv1: (t) => ({ title: 'Bring it back to today', place: 'One employer promises a bonus later.',
      body: `<p>Racine Trucking promises <b>${m(t.B)}</b> in <b>2 years</b>. At <b>${p(t.r)}</b> a year, what is it worth today? The discount factor is done for you.</p>` }),
    pv2: (t) => ({ title: 'Two bonuses: now or later?', place: 'Now compare the two offers’ bonuses.',
      body: `<p>Ferreira Outfitters pays <b>${m(t.A)}</b> on your first day. Racine Trucking pays <b>${m(t.B)}</b> at the end of <b>year 3</b>. At <b>${p(t.r)}</b> a year, which is worth more today?</p>`,
      choice: { legend: 'Which bonus is worth more today?', options: [['ferreira', 'Ferreira’s, now'], ['racine', 'Racine’s, in year 3']] } }),
    rows1: (t) => ({ title: 'Three payments', place: 'Racine adds a moving allowance, paid in three parts.',
      body: `<p>Racine pays <b>${m(t.C)}</b> at the end of each of the next <b>3 years</b>. At <b>${p(t.r)}</b> a year, what are the three payments worth today? Years 1 and 2 are done for you.</p>` }),
    rows2: (t) => ({ title: 'Stipend or cash?', place: 'Both employers want to help with housing.',
      body: `<p>Racine pays a housing stipend of <b>${m(t.C)}</b> at the end of each of <b>4 years</b>. Ferreira pays <b>${m(t.D)}</b> in cash on your first day. At <b>${p(t.r)}</b> a year, which is worth more today?</p>`,
      choice: { legend: 'Which is worth more today?', options: [['racine', 'Racine’s stipend'], ['ferreira', 'Ferreira’s cash']] } }),
    af1: (t) => ({ title: 'The shortcut', place: 'Dagny shows a faster way to check your stipend table.',
      body: `<p>Find the same stipend's value today, <b>${m(t.C)}</b> a year for <b>4 years</b> at <b>${p(t.r)}</b>, with the annuity factor. It should match your table's total.</p>` }),
    loan: (t) => ({ title: 'Your student loan payment', place: 'Your student loan comes due after graduation.',
      body: `<p>You owe <b>${m(t.L)}</b> at <b>${p(t.r)}</b> a year, repaid in <b>${t.n} equal yearly payments</b>. What is each payment?</p>` }),
  };

  function taskView(t, L, h) {
    const P = PROBLEM[t.id](t), E = EXAMPLES()[t.id];
    const example = h.ladder(E.lines, { filled: true, caption: E.cap }) + (E.after ? `<p>${E.after}</p>` : '');
    const table = h.ladder(linesFor(t), { rows: L.rows, caption: 'Your turn' });
    const parts = [{ html: '', field: 'table' }];
    if (P.choice) parts.push({ html: '', field: 'choice' });
    return { title: P.title, place: P.place, body: P.body, example, table, parts, choice: P.choice,
      helpLabels: ['Show me the first blank', 'Show me every line'] };
  }

  // Common slips, per kind of line, phrased with the student's own numbers.
  function diagFor(t, line, i) {
    const r = t.r, D = [];
    if (t.id === 'fv' && i === 1) D.push([t.P * (1 + 2 * r), 'simple', `That adds ${p(r)} of ${m(t.P)} twice. Year 2 earns interest on year 1's interest too: multiply year 1's ${m(t.y1, 2)} by ${g(r)}.`],
      [t.y1, 'copy', `That is year 1's balance. Multiply it by ${g(r)} once more.`]);
    if (/Discount factor/.test(line.label)) { const y = t.id === 'pv1' ? 2 : 3;
      D.push([1 / (1 + r * y), 'simple', `That divides by 1 + ${y} × ${r}. Divide by ${g(r)} ${y} times instead: 1 ÷ ${g(r)}${sup(y)}.`],
        [Math.pow(1 + r, y), 'upside', `That is ${g(r)}${sup(y)} itself. The discount factor is 1 divided by it.`],
        [df(r, y - 1), 'offbyone', `That is the factor for year ${y - 1}. Use ${y} years.`]); }
    if (line.label === 'Value today' && (t.id === 'pv1' || t.id === 'pv2')) { const y = t.id === 'pv1' ? 2 : 3;
      D.push([t.B * Math.pow(1 + r, y), 'fv', `That grows ${m(t.B)} forward. It already arrives later, so multiply by the discount factor to bring it back.`],
        [t.B, 'nodiscount', `That is the promised amount itself. Multiply it by the discount factor.`],
        [t.B * df(r, 1), 'oneyear', `That brings it back one year. It arrives in year ${y}.`]); }
    if (/^Year \d/.test(line.label)) { const y = Number(line.label.slice(5));
      D.push([t.C, 'nodiscount', `That is the payment itself. Multiply it by year ${y}'s discount factor, ${f4(df(r, y))}.`],
        [t.C * Math.pow(1 + r, y), 'fv', `That grows the payment. Multiply by ${f4(df(r, y))} instead.`]);
      if (y > 1) D.push([t.C * df(r, y - 1), 'lastyear', `That uses year ${y - 1}'s factor. Year ${y} uses ${f4(df(r, y))}.`]); }
    if (/^Total/.test(line.label)) { const n = t.id === 'rows1' ? 3 : 4;
      D.push([t.C * n, 'sum', `That adds the payments before discounting. Add the values today in the rows above.`]); }
    if (line.label === 'Annuity factor') D.push([t.top * t.r, 'times', `That multiplies by ${r}. Divide instead: <code>ans/${r}</code>.`],
      [t.top, 'skipped', `That is the line above. Divide it by ${r} to get the factor.`]);
    if (/^1 −/.test(line.label)) D.push([1 - Math.pow(1 + r, t.n), 'sign', `The power is negative: type <code>1-${g(r)}^-${t.n}</code>.`],
      [Math.pow(1 + r, -t.n), 'noone', `That is ${g(r)}^-${t.n} on its own. Subtract it from 1.`]);
    if (line.label === 'Value today' && t.id === 'af1') D.push([t.C * t.n, 'sum', `That is ${t.n} payments with no discounting. Multiply ${m(t.C)} by the annuity factor.`],
      [t.C / t.f, 'divide', `That divides by the factor. To value payments, multiply: ${m(t.C)} × the factor.`]);
    if (line.label === 'Yearly payment') D.push([t.L / t.n, 'nointerest', `That splits the loan with no interest. Divide by the annuity factor, not by ${t.n}.`],
      [t.L * t.f, 'times', `That multiplies by the factor. A payment divides: <code>${t.L}/ans</code>.`], [t.L * r, 'interestonly', 'That is one year of interest only. Divide the loan by the annuity factor.']);
    return D;
  }

  function judgeTask(t, e, h) {
    const lines = linesFor(t), rows = e.rows || [], rowRes = [];
    lines.forEach((l, i) => {
      if (!l.input) return;
      const v = h.parseMoney(rows[i]);
      const opts = l.fmt === 'factor' ? { tol: 0.002, scale: 1, closeMsg: 'Close. Keep four decimal places.', otherMsg: `${l.calc.replace(/<[^>]+>/g, '')}.` }
        : { minTol: 1, otherMsg: `${l.calc.replace(/<[^>]+>/g, '')}.` };
      rowRes[i] = h.judgeNumber(v, l.value, diagFor(t, l, i), opts);
    });
    const bad = rowRes.findIndex((x) => x && !x.ok);
    if (bad >= 0) return { ok: false, rowRes, msg: `${lines[bad].label.replace(/<[^>]+>/g, '')}: ${rowRes[bad].msg}` };
    if (t.decision && e.choice !== t.decision) return { ok: false, rowRes, msg: !e.choice ? 'Now pick which is worth more today.' : `Compare the values today: ${m(t.answer)} against ${m(t.id === 'pv2' ? t.A : t.D)}.` };
    return { ok: true, rowRes };
  }

  function helpText(t, lvl) {
    const lines = linesFor(t), blanks = lines.filter((l) => l.input);
    const say = (l) => `${l.label}: ${l.calc} = ${l.fmt === 'factor' ? f4(l.value) : m(l.value, 2)}`;
    return lvl === 1 ? say(blanks[0]) : lines.map(say).join('<br>');
  }
  function praise(t) {
    if (t.id === 'fv') return `${m(t.P)} grows to ${m(t.answer, 2)}. ${m(t.answer - t.P - 2 * t.P * t.r, 2)} of that is interest on interest.`;
    if (t.id === 'pv1') return `${m(t.B)} in two years is worth ${m(t.answer, 2)} today.`;
    if (t.id === 'pv2') return `Racine's bonus is worth ${m(t.answer)} today, against ${m(t.A)} now, so ${t.decision === 'racine' ? 'the later bonus wins even after waiting' : 'the smaller bonus now wins'}.`;
    if (t.id === 'rows1') return `Three payments of ${m(t.C)} are worth ${m(t.answer, 2)} today.`;
    if (t.id === 'rows2') return `The stipend is worth ${m(t.answer)} today, against ${m(t.D)} in cash. ${t.decision === 'racine' ? 'The stipend wins.' : 'The cash wins, even though the stipend adds up to more.'}`;
    if (t.id === 'af1') return `Same answer as your table, ${m(t.answer, 2)}, in three lines instead of five.`;
    if (t.id === 'loan') return `You pay ${m(t.answer)} a year, ${m(t.answer * t.n)} in all. ${m(t.answer * t.n - t.L)} of that is interest.`;
  }
  function selfAnswer(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = l.fmt === 'factor' ? f4(l.value) : String(Math.round(l.value * 100) / 100); });
    return { rows, choice: t.decision || null };
  }
  function selfWrong(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = String(Math.round(l.value * 1.2)); });
    return { rows, choice: t.decision || null };
  }

  root.DESK = {
    app: 'finan4-u4-offer-desk', version: 4, seedVersion: 3, salt: 'rize-finan4-u4-offer:9d27a1', points: 20,
    storageKey: 'rize-finan4-u4-offer-v4', filePrefix: 'OfferDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-offer-desk/verify.html',
    calcPlaceholder: '2000*1.1^4',
    calcHint: 'Use * to multiply and ^ for a power: 2000*1.1^2 grows $2,000 for 2 years at 10%, and 1/1.1^2 is the year 2 discount factor.',
    story: { title: 'The Offer Desk', kicker: 'Corporate Finance, Unit 4', company: 'Career Center', team: 'Money Coaching',
      from: 'Dagny Tomasek', fromTitle: 'financial coach, Career Center',
      dek: 'It is spring of senior year: two job offers, a student loan and some savings. Dagny Tomasek, a coach at your career center, helps you compare the money.',
      whatBox: '',
      stepsLine: 'Ten short steps. Each shows a worked example in the same table you fill in, then you do the same calculation with your own numbers.' },
    steps: STEPS, quiz: QUIZ, walk: null, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'Your decision', label: 'Your note to Dagny', minWords: 30, receiptHeading: 'Note to the financial coach',
      prompt: 'Which offer’s money is worth more to you so far, counting the bonus and the stipend in today’s dollars? Name one thing besides money you would still weigh.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
