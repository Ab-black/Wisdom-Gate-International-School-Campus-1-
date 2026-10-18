(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------- Intro (plays on every load and refresh) ---------- */
  var intro = $('#intro');
  var introDone = false;
  function endIntro(fast) {
    if (introDone) return;
    introDone = true;
    if (fast) { intro.classList.add('gone'); doc.body.classList.remove('is-intro'); return; }
    intro.classList.add('hide');
    doc.body.classList.remove('is-intro');
    setTimeout(function () { intro.classList.add('gone'); }, 900);
  }
  if (reduce) {
    endIntro(true);
  } else {
    var nameEl = $('#introName');
    var text = nameEl.getAttribute('data-text');
    nameEl.textContent = '';
    var i = 0;
    text.split(' ').forEach(function (w) {
      var word = doc.createElement('span');
      word.className = 'word';
      word.setAttribute('aria-hidden', 'true');
      w.split('').forEach(function (c) {
        var ch = doc.createElement('span');
        ch.className = 'ch';
        ch.style.setProperty('--i', i++);
        ch.textContent = c;
        word.appendChild(ch);
      });
      nameEl.appendChild(word);
      nameEl.appendChild(doc.createTextNode(' '));
    });
    $('#introSkip').addEventListener('click', function () { endIntro(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') endIntro(false); });
    setTimeout(function () { endIntro(false); }, 3500);
  }
  // Start every load at the top so the homepage reveals from the hero
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- Nav ---------- */
  var nav = $('#nav'), burger = $('#burger');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('menu-open')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });

  /* ---------- Hero slideshow ---------- */
  var slides = $$('.slide'), dotsWrap = $('#dots'), cur = 0, timer = null;
  slides.forEach(function (s, n) {
    var d = doc.createElement('button');
    d.type = 'button';
    d.className = 'dot' + (n === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Show image ' + (n + 1));
    d.addEventListener('click', function () { go(n); restart(); });
    dotsWrap.appendChild(d);
  });
  var dots = $$('.dot');
  function go(n) {
    cur = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === cur); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === cur); });
  }
  function start() { if (!reduce) timer = setInterval(function () { go(cur + 1); }, 6500); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }
  $('#next').addEventListener('click', function () { go(cur + 1); restart(); });
  $('#prev').addEventListener('click', function () { go(cur - 1); restart(); });
  doc.addEventListener('visibilitychange', function () { doc.hidden ? stop() : restart(); });
  start();

  /* ---------- Scroll reveal ---------- */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, n) {
      el.style.transitionDelay = (n % 3) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Enquiry form (demo) ---------- */
  var form = $('#enquiry'), status = $('#formStatus');
  function fieldErr(id, msg) {
    var wrap = $('#' + id).closest('.field');
    var err = $('.err[data-for="' + id + '"]');
    wrap.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg || '';
    $('#' + id).setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fname').value.trim();
    var contact = $('#fcontact').value.trim();
    var msg = $('#fmsg').value.trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    var phoneOk = /^[+()\d\s-]{7,}$/.test(contact);
    var ok = true;
    ok = fieldErr('fname', name.length < 2 ? 'Please enter your name.' : '') && ok;
    ok = fieldErr('fcontact', (emailOk || phoneOk) ? '' : 'Enter a valid phone number or email.') && ok;
    ok = fieldErr('fmsg', msg.length < 5 ? 'Please add a short message.' : '') && ok;
    if (!ok) { status.className = 'form-note'; status.textContent = 'Please correct the highlighted fields.'; return; }
    var year = $('#fyear').value;
    var text = 'Hello, I would like to make an admissions enquiry for Wisdom Gate International School (Campus 1).\n' +
      'Name: ' + name + '\nContact: ' + contact + (year ? '\nYear group: ' + year : '') + '\nMessage: ' + msg;
    window.open('https://wa.me/2348064164465?text=' + encodeURIComponent(text), '_blank', 'noopener');
    status.className = 'form-note ok';
    status.textContent = 'WhatsApp is opening with your message. Please press send there to reach the school.';
    form.reset();
  });
  ['fname', 'fcontact', 'fmsg'].forEach(function (id) {
    $('#' + id).addEventListener('input', function () { fieldErr(id, ''); });
  });

  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
