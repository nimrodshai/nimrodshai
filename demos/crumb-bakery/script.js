/* Crumb & Co. — client-side shop, cart & micro-interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORAGE_KEY = 'crumb-cart-v1';
  var MAX_QTY = 12;
  var C = '#3B2418';

  /* ---------- product illustrations (hand-drawn style SVG) ---------- */
  var ILLOS = {
    sourdough:
      '<ellipse cx="100" cy="128" rx="68" ry="8" fill="' + C + '" opacity=".12"/>' +
      '<path d="M32 96 C30 62 62 40 100 40 C138 40 170 62 168 96 C166 118 138 126 100 126 C62 126 34 118 32 96Z" fill="#C9874A" stroke="' + C + '" stroke-width="3.5"/>' +
      '<path d="M44 92 C46 70 70 54 100 54" fill="none" stroke="#E7B77A" stroke-width="4" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M58 88 Q100 52 146 80" fill="none" stroke="#F3DDB5" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M58 88 Q100 52 146 80" fill="none" stroke="' + C + '" stroke-width="3" stroke-linecap="round"/>' +
      '<g fill="#FFFDF8" opacity=".85"><circle cx="76" cy="104" r="2.2"/><circle cx="92" cy="112" r="1.6"/><circle cx="122" cy="104" r="2"/><circle cx="138" cy="96" r="1.5"/><circle cx="66" cy="76" r="1.6"/><circle cx="108" cy="98" r="1.4"/></g>',
    rye:
      '<ellipse cx="100" cy="128" rx="70" ry="8" fill="' + C + '" opacity=".12"/>' +
      '<rect x="30" y="56" width="140" height="70" rx="30" fill="#6E4129" stroke="' + C + '" stroke-width="3.5"/>' +
      '<path d="M44 70 C70 60 130 60 156 70" fill="none" stroke="#9B6440" stroke-width="4" stroke-linecap="round" opacity=".7"/>' +
      '<g stroke="#2A170E" stroke-width="3" stroke-linecap="round"><path d="M62 72 l14 36"/><path d="M88 70 l14 38"/><path d="M114 70 l14 38"/></g>' +
      '<g fill="#D9B98C"><ellipse cx="54" cy="100" rx="2.6" ry="1.3" transform="rotate(30 54 100)"/><ellipse cx="80" cy="86" rx="2.6" ry="1.3" transform="rotate(-20 80 86)"/><ellipse cx="106" cy="112" rx="2.6" ry="1.3" transform="rotate(40 106 112)"/><ellipse cx="140" cy="92" rx="2.6" ry="1.3" transform="rotate(-30 140 92)"/><ellipse cx="148" cy="112" rx="2.6" ry="1.3"/><ellipse cx="124" cy="80" rx="2.6" ry="1.3" transform="rotate(20 124 80)"/></g>',
    babka:
      '<ellipse cx="100" cy="132" rx="66" ry="7" fill="' + C + '" opacity=".12"/>' +
      '<path d="M40 76 C40 50 70 40 100 40 C130 40 160 50 160 76 L156 122 C156 128 150 130 144 130 L56 130 C50 130 44 128 44 122Z" fill="#D9A35E" stroke="' + C + '" stroke-width="3.5"/>' +
      '<g fill="none" stroke="#4A2A1A" stroke-width="7" stroke-linecap="round"><path d="M52 66 C70 54 84 80 100 64 C116 50 132 74 150 62"/><path d="M50 92 C68 80 84 108 102 90 C118 76 134 102 152 88"/><path d="M50 116 C66 106 84 126 100 114 C118 102 134 124 150 112"/></g>' +
      '<path d="M58 50 C76 44 92 44 104 46" fill="none" stroke="#F2D58F" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>',
    croissant:
      '<ellipse cx="100" cy="128" rx="70" ry="8" fill="' + C + '" opacity=".12"/>' +
      '<g stroke="' + C + '" stroke-width="3.5" stroke-linejoin="round">' +
      '<path d="M22 104 C18 88 30 78 44 82 L58 104 C46 116 28 116 22 104Z" fill="#D88E3E"/>' +
      '<path d="M178 104 C182 88 170 78 156 82 L142 104 C154 116 172 116 178 104Z" fill="#D88E3E"/>' +
      '<path d="M40 82 C46 64 64 58 76 66 L80 112 C66 118 50 112 46 104Z" fill="#E2A24F"/>' +
      '<path d="M160 82 C154 64 136 58 124 66 L120 112 C134 118 150 112 154 104Z" fill="#E2A24F"/>' +
      '<path d="M72 66 C76 46 124 46 128 66 L124 114 C108 122 92 122 76 114Z" fill="#EDB565"/></g>' +
      '<g fill="none" stroke="#B36A26" stroke-width="2.5" stroke-linecap="round" opacity=".7"><path d="M86 62 C90 80 90 98 88 112"/><path d="M114 62 C110 80 110 98 112 112"/><path d="M58 76 C62 88 64 100 62 110"/><path d="M142 76 C138 88 136 100 138 110"/></g>' +
      '<path d="M84 58 C94 52 106 52 116 56" fill="none" stroke="#FFF1CF" stroke-width="3.5" stroke-linecap="round"/>',
    buns:
      '<ellipse cx="100" cy="130" rx="66" ry="7" fill="' + C + '" opacity=".12"/>' +
      '<circle cx="104" cy="84" r="44" fill="#D2914D" stroke="' + C + '" stroke-width="3.5"/>' +
      '<path d="M104 84 a5 5 0 0 1 10 0 a10 10 0 0 1 -20 0 a15 15 0 0 1 30 0 a20 20 0 0 1 -40 0 a25 25 0 0 1 50 0 a30 30 0 0 1 -60 0 a35 35 0 0 1 70 0" fill="none" stroke="#6B3A1C" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M72 56 C84 46 104 44 118 48 C112 56 120 60 128 56 C134 62 136 68 132 74 C124 70 118 78 110 70 C100 76 92 64 82 70 C78 64 74 62 72 56Z" fill="#FFF6E4" stroke="' + C + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<g fill="#8A9A6B"><circle cx="92" cy="58" r="2"/><circle cx="110" cy="62" r="1.8"/><circle cx="124" cy="66" r="1.6"/></g>',
    challah:
      '<ellipse cx="100" cy="130" rx="76" ry="7" fill="' + C + '" opacity=".12"/>' +
      '<g stroke="' + C + '" stroke-width="3.2" fill="#D8933F">' +
      '<ellipse cx="40" cy="92" rx="18" ry="24" transform="rotate(-40 40 92)"/>' +
      '<ellipse cx="160" cy="92" rx="18" ry="24" transform="rotate(40 160 92)"/>' +
      '<ellipse cx="62" cy="80" rx="20" ry="28" transform="rotate(35 62 80)"/>' +
      '<ellipse cx="62" cy="104" rx="20" ry="26" transform="rotate(-35 62 104)"/>' +
      '<ellipse cx="138" cy="80" rx="20" ry="28" transform="rotate(-35 138 80)"/>' +
      '<ellipse cx="138" cy="104" rx="20" ry="26" transform="rotate(35 138 104)"/>' +
      '<ellipse cx="88" cy="78" rx="22" ry="30" transform="rotate(35 88 78)"/>' +
      '<ellipse cx="88" cy="106" rx="22" ry="28" transform="rotate(-35 88 106)"/>' +
      '<ellipse cx="112" cy="78" rx="22" ry="30" transform="rotate(-35 112 78)"/>' +
      '<ellipse cx="112" cy="106" rx="22" ry="28" transform="rotate(35 112 106)"/></g>' +
      '<g fill="#F6E9CF"><ellipse cx="84" cy="70" rx="2.4" ry="1.2" transform="rotate(30 84 70)"/><ellipse cx="114" cy="72" rx="2.4" ry="1.2" transform="rotate(-20 114 72)"/><ellipse cx="62" cy="76" rx="2.4" ry="1.2"/><ellipse cx="138" cy="78" rx="2.4" ry="1.2" transform="rotate(40 138 78)"/><ellipse cx="100" cy="92" rx="2.4" ry="1.2" transform="rotate(10 100 92)"/><ellipse cx="90" cy="110" rx="2.4" ry="1.2" transform="rotate(-30 90 110)"/><ellipse cx="116" cy="104" rx="2.4" ry="1.2" transform="rotate(20 116 104)"/></g>',
    tart:
      '<ellipse cx="100" cy="128" rx="74" ry="8" fill="' + C + '" opacity=".12"/>' +
      '<ellipse cx="100" cy="96" rx="76" ry="32" fill="#D99A52" stroke="' + C + '" stroke-width="3.5"/>' +
      '<ellipse cx="100" cy="90" rx="76" ry="32" fill="#E7B271" stroke="' + C + '" stroke-width="3.5" stroke-dasharray="7 4"/>' +
      '<ellipse cx="100" cy="88" rx="62" ry="24" fill="#F4E2C0" stroke="' + C + '" stroke-width="2.5"/>' +
      '<g stroke="' + C + '" stroke-width="2.4">' +
      '<path d="M60 86 a14 12 0 0 1 28 0 Z" fill="#7B2E4A"/><path d="M64 86 a10 8 0 0 1 20 0 Z" fill="#E98A86"/>' +
      '<path d="M104 80 a14 12 0 0 1 28 0 Z" fill="#7B2E4A"/><path d="M108 80 a10 8 0 0 1 20 0 Z" fill="#E98A86"/>' +
      '<ellipse cx="96" cy="98" rx="11" ry="7" fill="#9B3B5A"/><ellipse cx="128" cy="96" rx="10" ry="6" fill="#B04A5E"/><ellipse cx="72" cy="100" rx="9" ry="6" fill="#B04A5E"/></g>' +
      '<g fill="#8A9A6B"><path d="M90 74 q6 -6 12 0 q-6 4 -12 0Z"/><path d="M140 88 q6 -6 12 0 q-6 4 -12 0Z"/></g>' +
      '<g fill="#FFFDF8"><circle cx="118" cy="92" r="1.6"/><circle cx="84" cy="92" r="1.4"/><circle cx="104" cy="104" r="1.4"/></g>',
    cookies:
      '<ellipse cx="100" cy="130" rx="70" ry="7" fill="' + C + '" opacity=".12"/>' +
      '<g stroke="' + C + '" stroke-width="3.5">' +
      '<circle cx="78" cy="88" r="40" fill="#C98B4E"/>' +
      '<path d="M166 92 a40 40 0 1 1 -18 -36 a8 8 0 0 0 10 12 a8 8 0 0 0 8 10 a8 8 0 0 0 0 14Z" fill="#D9A062"/></g>' +
      '<g fill="#3B2418"><rect x="60" y="70" width="10" height="8" rx="2" transform="rotate(12 65 74)"/><rect x="86" y="96" width="11" height="8" rx="2" transform="rotate(-18 91 100)"/><rect x="70" y="104" width="8" height="7" rx="2"/><rect x="92" y="72" width="8" height="7" rx="2" transform="rotate(30 96 75)"/>' +
      '<rect x="122" y="78" width="10" height="8" rx="2" transform="rotate(-10 127 82)"/><rect x="138" y="104" width="10" height="8" rx="2" transform="rotate(20 143 108)"/><rect x="116" y="104" width="8" height="7" rx="2"/></g>' +
      '<g fill="#F6E9CF"><circle cx="58" cy="94" r="1.6"/><circle cx="84" cy="82" r="1.4"/><circle cx="132" cy="96" r="1.6"/><circle cx="108" cy="94" r="1.4"/></g>' +
      '<g fill="#FFFDF8" opacity=".9"><path d="M60 66 l3 -6 l3 6 l-3 2Z"/><path d="M128 70 l3 -6 l3 6 l-3 2Z"/></g>'
  };

  function illo(key, cls) {
    return '<svg class="' + (cls || 'illo') + '" viewBox="0 0 200 150" aria-hidden="true" focusable="false">' + ILLOS[key] + '</svg>';
  }

  /* ---------- catalogue ---------- */
  var PRODUCTS = [
    { id: 'country', name: 'Country Sourdough', cat: 'breads', price: 32, unit: '900g loaf', illo: 'sourdough', tint: '#F6E3B4', fly: '#C9874A',
      desc: 'Our house loaf. Blistered, deeply caramelised crust, a custardy open crumb and a gentle tang. Wild yeast, 36-hour ferment.', badge: { text: 'Bestseller', cls: 'hot' } },
    { id: 'rye', name: 'Dark Rye & Caraway', cat: 'breads', price: 34, unit: '750g loaf', illo: 'rye', tint: '#E1E4CF', fly: '#6E4129',
      desc: '60% whole rye with toasted caraway and a touch of date honey. Dense, moist, perfect with salted butter and smoked fish.' },
    { id: 'challah', name: 'Friday Challah', cat: 'breads', price: 28, unit: 'six-strand braid', illo: 'challah', tint: '#F4DCCB', fly: '#D8933F', fridayOnly: true,
      desc: 'Soft, golden and barely sweet, braided by hand and showered with sesame. Baked once a week for Shabbat tables.', badge: { text: 'Fridays only', cls: 'friday' } },
    { id: 'croissant', name: 'Butter Croissant', cat: 'pastries', price: 14, unit: 'each', illo: 'croissant', tint: '#F6E3B4', fly: '#E2A24F',
      desc: '27 layers of cultured French butter, laminated over three days. Shatters on the first bite — wear a dark shirt at your peril.', badge: { text: 'Out at 7:00', cls: '' } },
    { id: 'buns', name: 'Cardamom Cinnamon Bun', cat: 'pastries', price: 16, unit: 'each', illo: 'buns', tint: '#F5EBDA', fly: '#D2914D',
      desc: 'Swedish-style knot rolled with brown sugar, cinnamon and freshly cracked cardamom, finished with a vanilla bean glaze.' },
    { id: 'babka', name: 'Chocolate Babka', cat: 'pastries', price: 58, unit: 'whole loaf', illo: 'babka', tint: '#F4DCCB', fly: '#D9A35E',
      desc: 'Brioche twisted with 70% dark chocolate and a whisper of orange zest, soaked in syrup while warm. Serves 6, or 1 on a hard day.', badge: { text: 'Fan favourite', cls: 'hot' } },
    { id: 'tart', name: 'Fig & Plum Frangipane Tart', cat: 'sweets', price: 26, unit: 'individual', illo: 'tart', tint: '#E1E4CF', fly: '#9B3B5A',
      desc: 'Autumn on a plate: late-season figs and Golan plums on almond frangipane in a crisp brown-butter crust.', badge: { text: 'Seasonal', cls: '' } },
    { id: 'cookies', name: 'Tahini Chocolate Cookies', cat: 'sweets', price: 36, unit: 'box of 4', illo: 'cookies', tint: '#F5EBDA', fly: '#C98B4E',
      desc: 'Brown butter, raw tahini and chopped dark chocolate, crisp at the edge and chewy in the middle. Flaky salt on top.' }
  ];
  var byId = {};
  PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function money(n) { return '₪' + n.toLocaleString('en-US'); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- storage ---------- */
  function loadCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var clean = {};
      Object.keys(parsed || {}).forEach(function (id) {
        var q = parseInt(parsed[id], 10);
        if (byId[id] && q > 0) clean[id] = Math.min(q, MAX_QTY);
      });
      return clean;
    } catch (e) { return {}; }
  }
  function saveCart() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
  }

  var cart = loadCart();

  function cartCount() { return Object.keys(cart).reduce(function (s, id) { return s + cart[id]; }, 0); }
  function cartTotal() { return Object.keys(cart).reduce(function (s, id) { return s + cart[id] * byId[id].price; }, 0); }

  /* ---------- live region & toasts ---------- */
  var live = $('#cart-live');
  function announce(msg) {
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 60);
  }
  var toastWrap = $('#toasts');
  function toast(msg, icon) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="toast-icon" aria-hidden="true">' + (icon || '✓') + '</span><span>' + esc(msg) + '</span>';
    toastWrap.appendChild(t);
    while (toastWrap.children.length > 3) toastWrap.removeChild(toastWrap.firstChild);
    window.setTimeout(function () {
      t.classList.add('is-leaving');
      window.setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, 2600);
  }

  /* ---------- render product grid ---------- */
  var grid = $('#product-grid');
  function catLabel(c) { return { breads: 'Bread', pastries: 'Pastry', sweets: 'Sweet' }[c]; }

  function controlsHTML(p) {
    var q = cart[p.id] || 0;
    if (!q) {
      return '<button class="add-btn" type="button" data-add="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to basket"><span class="plus" aria-hidden="true">+</span> Add</button>';
    }
    return '<div class="stepper" role="group" aria-label="' + esc(p.name) + ' quantity">' +
      '<button type="button" data-dec="' + p.id + '" aria-label="Remove one ' + esc(p.name) + '">−</button>' +
      '<span class="qty" aria-hidden="true">' + q + '</span><span class="sr-only">' + q + ' in basket</span>' +
      '<button type="button" data-inc="' + p.id + '" aria-label="Add one more ' + esc(p.name) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button></div>';
  }

  function renderGrid() {
    grid.innerHTML = PRODUCTS.map(function (p) {
      return '<li class="product" data-cat="' + p.cat + '" data-id="' + p.id + '">' +
        '<div class="product-art" style="--tint:' + p.tint + '">' +
          (p.badge ? '<span class="badge ' + p.badge.cls + '">' + esc(p.badge.text) + '</span>' : '') +
          '<svg class="steam a" aria-hidden="true"><use href="#i-steam"/></svg><svg class="steam b" aria-hidden="true"><use href="#i-steam"/></svg>' +
          illo(p.illo) +
        '</div>' +
        '<div class="product-body">' +
          '<span class="product-cat">' + catLabel(p.cat) + ' · ' + esc(p.unit) + '</span>' +
          '<h3 class="product-name">' + esc(p.name) + '</h3>' +
          '<p class="product-desc">' + esc(p.desc) + '</p>' +
          '<div class="product-foot"><span class="price">' + money(p.price) + '</span>' +
          '<div class="controls" data-controls="' + p.id + '">' + controlsHTML(p) + '</div></div>' +
        '</div></li>';
    }).join('');
  }

  function refreshControls(id, focusSel) {
    var box = grid.querySelector('[data-controls="' + id + '"]');
    if (!box) return;
    var hadFocus = box.contains(document.activeElement);
    box.innerHTML = controlsHTML(byId[id]);
    if (hadFocus || focusSel) {
      var target = box.querySelector(focusSel || '[data-inc]') || box.querySelector('[data-add]') || box.querySelector('button:not([disabled])');
      if (target) target.focus();
    }
  }

  /* ---------- filters ---------- */
  $$('.chip[data-filter]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      $$('.chip[data-filter]').forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var shown = 0;
      $$('.product', grid).forEach(function (card) {
        var match = f === 'all' || card.getAttribute('data-cat') === f;
        card.classList.toggle('is-hidden', !match);
        card.classList.remove('is-entering');
        if (match) {
          shown++;
          if (!reduceMotion) { void card.offsetWidth; card.classList.add('is-entering'); card.style.animationDelay = (shown * 40) + 'ms'; }
        }
      });
      announce(shown + ' ' + (shown === 1 ? 'item' : 'items') + ' shown');
    });
  });

  /* ---------- cart mutations ---------- */
  var countEl = $('#cart-count');
  var countSr = $('#cart-count-sr');
  var cartBtn = $('#cart-open');

  function updateBadge(pop) {
    var n = cartCount();
    countEl.textContent = n;
    countEl.classList.toggle('is-empty', n === 0);
    countSr.textContent = ', ' + n + (n === 1 ? ' item' : ' items');
    if (pop && !reduceMotion) {
      countEl.classList.remove('is-popping'); cartBtn.classList.remove('is-bumped');
      void countEl.offsetWidth;
      countEl.classList.add('is-popping'); cartBtn.classList.add('is-bumped');
    }
  }

  function setQty(id, q, opts) {
    opts = opts || {};
    var prev = cart[id] || 0;
    q = Math.max(0, Math.min(MAX_QTY, q));
    if (q === prev) {
      if (q === MAX_QTY) toast('We cap pre-orders at ' + MAX_QTY + ' per item — call us for bigger orders', '!');
      return;
    }
    if (q === 0) delete cart[id]; else cart[id] = q;
    saveCart();
    refreshControls(id, opts.focusSel);
    updateBadge(q > prev);
    renderCart();
    var p = byId[id];
    if (q > prev) {
      announce((q - prev === 1 && prev === 0 ? 'Added ' : 'Updated ') + p.name + '. ' + q + ' in basket. Subtotal ' + money(cartTotal()) + '.');
    } else if (q === 0) {
      announce(p.name + ' removed from basket. Subtotal ' + money(cartTotal()) + '.');
    } else {
      announce(p.name + ' quantity ' + q + '. Subtotal ' + money(cartTotal()) + '.');
    }
  }

  /* fly-to-cart */
  function flyToCart(fromEl, color) {
    if (reduceMotion || !fromEl || !fromEl.animate) return;
    var a = fromEl.getBoundingClientRect();
    var b = cartBtn.getBoundingClientRect();
    var sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    var ex = b.left + b.width / 2, ey = b.top + b.height / 2;
    var dot = document.createElement('span');
    dot.className = 'fly-crumb';
    dot.style.setProperty('--fly', color);
    dot.style.left = sx + 'px'; dot.style.top = sy + 'px';
    document.body.appendChild(dot);
    var dx = ex - sx, dy = ey - sy;
    var lift = Math.min(-120, dy * 0.4 - 80);
    var anim = dot.animate([
      { transform: 'translate(0,0) scale(.6) rotate(0)', opacity: 0 },
      { transform: 'translate(' + dx * 0.15 + 'px,' + (lift * 0.6) + 'px) scale(1.15) rotate(90deg)', opacity: 1, offset: 0.2 },
      { transform: 'translate(' + dx * 0.55 + 'px,' + (lift + dy * 0.3) + 'px) scale(1) rotate(220deg)', opacity: 1, offset: 0.55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.35) rotate(360deg)', opacity: 0.9 }
    ], { duration: 780, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = function () { dot.remove(); };
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var id;
    if ((id = btn.getAttribute('data-add'))) {
      flyToCart(btn, byId[id].fly);
      setQty(id, 1, { focusSel: '[data-inc]' });
      toast(byId[id].name + ' added to your basket', '+');
    } else if ((id = btn.getAttribute('data-inc'))) {
      flyToCart(btn, byId[id].fly);
      setQty(id, (cart[id] || 0) + 1, { focusSel: '[data-inc]' });
    } else if ((id = btn.getAttribute('data-dec'))) {
      var next = (cart[id] || 0) - 1;
      setQty(id, next, { focusSel: next > 0 ? '[data-dec]' : '[data-add]' });
    }
  });

  /* ---------- pickup scheduling ---------- */
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var daySel = $('#pickup-day');
  var timeSel = $('#pickup-time');

  function slotsFor(date) {
    var friday = date.getDay() === 5;
    var start = friday ? 7 * 60 : 7 * 60 + 30;
    var end = friday ? 13 * 60 + 30 : 18 * 60 + 30;
    var out = [];
    for (var m = start; m <= end; m += 30) out.push(m);
    var now = new Date();
    if (date.toDateString() === now.toDateString()) {
      var minM = now.getHours() * 60 + now.getMinutes() + 60; // one hour lead time
      out = out.filter(function (x) { return x >= minM; });
    }
    return out;
  }
  function fmtMin(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }

  var pickupDays = [];
  function buildDays() {
    pickupDays = [];
    var d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; pickupDays.length < 7 && i < 14; i++) {
      var day = new Date(d.getTime()); day.setDate(d.getDate() + i);
      if (day.getDay() === 6) continue; // closed Saturdays
      if (!slotsFor(day).length) continue;
      pickupDays.push(day);
    }
    var today = new Date().toDateString();
    var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    daySel.innerHTML = pickupDays.map(function (day, idx) {
      var prefix = day.toDateString() === today ? 'Today · ' : day.toDateString() === tomorrow.toDateString() ? 'Tomorrow · ' : '';
      return '<option value="' + idx + '">' + prefix + DAY_NAMES[day.getDay()] + ' ' + day.getDate() + ' ' + MONTHS[day.getMonth()] + (day.getDay() === 5 ? ' — challah day' : '') + '</option>';
    }).join('');
    buildTimes();
  }
  function buildTimes() {
    var day = pickupDays[+daySel.value || 0];
    if (!day) return;
    var prev = timeSel.value;
    timeSel.innerHTML = slotsFor(day).map(function (m) {
      return '<option value="' + m + '">' + fmtMin(m) + '</option>';
    }).join('');
    if (prev && timeSel.querySelector('option[value="' + prev + '"]')) timeSel.value = prev;
  }
  function selectedDay() { return pickupDays[+daySel.value || 0]; }

  var notice = $('#challah-notice');
  var checkoutBtn = $('#checkout-btn');
  function checkChallahRule() {
    var day = selectedDay();
    var blocked = !!cart.challah && day && day.getDay() !== 5;
    var wasHidden = notice.hidden;
    notice.hidden = !blocked;
    checkoutBtn.disabled = blocked;
    checkoutBtn.textContent = blocked ? 'Choose a Friday for challah' : 'Place pickup order';
    if (blocked && wasHidden) announce('Note: challah is available for Friday pickup only.');
    return !blocked;
  }
  daySel.addEventListener('change', function () { buildTimes(); checkChallahRule(); });
  $('#switch-friday').addEventListener('click', function () {
    for (var i = 0; i < pickupDays.length; i++) {
      if (pickupDays[i].getDay() === 5) {
        daySel.value = String(i); buildTimes(); checkChallahRule();
        daySel.focus();
        toast('Pickup moved to ' + DAY_NAMES[5] + ' ' + pickupDays[i].getDate() + ' ' + MONTHS[pickupDays[i].getMonth()], '✓');
        return;
      }
    }
  });

  /* ---------- render cart drawer ---------- */
  var drawer = $('#cart-drawer');
  var linesEl = $('#cart-lines');
  var subtotalEl = $('#cart-subtotal');

  function renderCart() {
    var ids = Object.keys(cart);
    drawer.classList.toggle('has-items', ids.length > 0);
    linesEl.innerHTML = ids.map(function (id) {
      var p = byId[id], q = cart[id];
      return '<li class="line" data-line="' + id + '">' +
        '<div class="line-art" style="--tint:' + p.tint + '">' + illo(p.illo, 'line-illo') + '</div>' +
        '<div><p class="line-name">' + esc(p.name) + '</p><p class="line-meta">' + money(p.price) + ' · ' + esc(p.unit) + (p.fridayOnly ? ' · Fridays' : '') + '</p>' +
          '<div class="stepper" role="group" aria-label="' + esc(p.name) + ' quantity">' +
            '<button type="button" data-line-dec="' + id + '" aria-label="Decrease ' + esc(p.name) + '"' + (q <= 1 ? ' disabled' : '') + '>−</button>' +
            '<span class="qty" aria-hidden="true">' + q + '</span><span class="sr-only">Quantity ' + q + '</span>' +
            '<button type="button" data-line-inc="' + id + '" aria-label="Increase ' + esc(p.name) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button>' +
          '</div></div>' +
        '<div class="line-right"><span class="line-total">' + money(p.price * q) + '</span>' +
          '<button type="button" class="remove-btn" data-line-remove="' + id + '" aria-label="Remove ' + esc(p.name) + ' from basket">Remove</button></div>' +
        '</li>';
    }).join('');
    var prevTotal = subtotalEl.textContent;
    subtotalEl.textContent = money(cartTotal());
    if (prevTotal !== subtotalEl.textContent && !reduceMotion) {
      subtotalEl.classList.remove('is-ticking'); void subtotalEl.offsetWidth; subtotalEl.classList.add('is-ticking');
    }
    checkChallahRule();
  }

  linesEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var id;
    if ((id = btn.getAttribute('data-line-inc'))) {
      setQty(id, cart[id] + 1);
      focusLine(id, '[data-line-inc]');
    } else if ((id = btn.getAttribute('data-line-dec'))) {
      setQty(id, cart[id] - 1);
      focusLine(id, '[data-line-dec]');
    } else if ((id = btn.getAttribute('data-line-remove'))) {
      var li = btn.closest('.line');
      var finish = function () {
        var name = byId[id].name;
        setQty(id, 0);
        toast(name + ' removed', '−');
        var next = linesEl.querySelector('.remove-btn') || $('#cart-browse');
        if (next && drawer.classList.contains('is-open')) next.focus();
      };
      if (reduceMotion) finish();
      else { li.classList.add('is-removing'); window.setTimeout(finish, 280); }
    }
  });
  function focusLine(id, sel) {
    var li = linesEl.querySelector('[data-line="' + id + '"]');
    if (!li) return;
    var b = li.querySelector(sel);
    if (b && b.disabled) b = li.querySelector('[data-line-inc]:not([disabled]), [data-line-dec]:not([disabled])');
    if (b) b.focus();
  }

  /* ---------- drawer open / close, focus trap ---------- */
  var backdrop = $('#drawer-backdrop');
  var lastFocus = null;
  var outside = [$('.site-header'), $('main'), $('.site-footer')];
  var cartView = $('#drawer-cart');
  var confirmView = $('#drawer-confirm');
  var footView = $('#drawer-foot');

  function openDrawer() {
    if (drawer.classList.contains('is-open')) return;
    lastFocus = document.activeElement;
    buildDays();
    renderCart();
    drawer.hidden = false; backdrop.hidden = false;
    outside.forEach(function (el) { if (el) el.setAttribute('inert', ''); });
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        drawer.classList.add('is-open'); backdrop.classList.add('is-open');
      });
    });
    window.setTimeout(function () { $('#cart-close').focus(); }, 60);
    cartBtn.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); backdrop.classList.remove('is-open');
    outside.forEach(function (el) { if (el) el.removeAttribute('inert'); });
    document.body.style.overflow = '';
    cartBtn.setAttribute('aria-expanded', 'false');
    window.setTimeout(function () {
      drawer.hidden = true; backdrop.hidden = true;
      if (!confirmView.hidden) showCartView();
    }, reduceMotion ? 0 : 450);
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
    if (document.activeElement !== lastFocus) cartBtn.focus();
  }

  cartBtn.addEventListener('click', openDrawer);
  cartBtn.setAttribute('aria-expanded', 'false');
  $('#cart-close').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  $('#cart-browse').addEventListener('click', function () {
    closeDrawer();
    var shop = $('#shop');
    shop.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    var focusables = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer)
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  });

  /* ---------- checkout ---------- */
  var form = $('#checkout-form');
  function setError(input, msg) {
    var err = $('#' + input.id + '-err');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
  }
  ['c-name', 'c-phone'].forEach(function (id) {
    $('#' + id).addEventListener('input', function () { if (this.getAttribute('aria-invalid') === 'true') setError(this, ''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!cartCount()) return;
    if (!checkChallahRule()) { $('#switch-friday').focus(); return; }
    var name = $('#c-name'), phone = $('#c-phone');
    var ok = true, firstBad = null;
    if (name.value.trim().length < 2) { setError(name, 'Tell us whose name goes on the bag.'); ok = false; firstBad = firstBad || name; }
    else setError(name, '');
    var digits = phone.value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 13) { setError(phone, 'We need a phone number in case your order is ready early.'); ok = false; firstBad = firstBad || phone; }
    else setError(phone, '');
    if (!ok) { firstBad.focus(); announce('Please check the highlighted fields.'); return; }
    if (!timeSel.value) { toast('Please pick a pickup time', '!'); timeSel.focus(); return; }

    var day = selectedDay();
    var orderNo = 'CR-' + ('0' + day.getDate()).slice(-2) + ('0' + (day.getMonth() + 1)).slice(-2) + '-' + Math.floor(100 + Math.random() * 900);
    var lines = Object.keys(cart).map(function (id) { return { id: id, q: cart[id] }; });
    var total = cartTotal();

    $('#order-number').textContent = orderNo;
    $('#confirm-title').textContent = 'Your bread is spoken for, ' + name.value.trim().split(/\s+/)[0] + '!';
    $('#confirm-pickup').textContent = 'Pickup ' + DAY_NAMES[day.getDay()] + ' ' + day.getDate() + ' ' + MONTHS[day.getMonth()] + ' at ' + fmtMin(+timeSel.value) + ' · 41 Emek Refaim';
    $('#confirm-lines').innerHTML = lines.map(function (l) {
      return '<li><span>' + l.q + ' × ' + esc(byId[l.id].name) + '</span><span>' + money(byId[l.id].price * l.q) + '</span></li>';
    }).join('');
    $('#confirm-total').textContent = money(total);
    var notes = $('#c-notes').value.trim();
    var notesEl = $('#confirm-notes');
    notesEl.textContent = notes ? 'Note: \u201C' + notes + '\u201D' : '';
    notesEl.hidden = !notes;

    try {
      window.localStorage.setItem('crumb-last-order', JSON.stringify({ no: orderNo, lines: lines, total: total, at: Date.now() }));
    } catch (err) { /* ignore */ }

    // reset cart
    cart = {};
    saveCart();
    renderGrid();
    updateBadge(false);
    form.reset();
    renderCart();

    cartView.hidden = true; footView.hidden = true; confirmView.hidden = false;
    $('#drawer-title').textContent = 'Order placed';
    confirmView.focus();
    announce('Order ' + orderNo + ' confirmed. Total ' + money(total) + ', pay at pickup.');
    burst();
  });

  function showCartView() {
    cartView.hidden = false; footView.hidden = false; confirmView.hidden = true;
    $('#drawer-title').textContent = 'Your basket';
  }
  $('#confirm-done').addEventListener('click', function () { closeDrawer(); });

  function burst() {
    if (reduceMotion || !document.body.animate) return;
    var r = drawer.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = 150;
    var colors = ['#C4623A', '#F2D58F', '#3B2418', '#E2A24F', '#8A9A6B'];
    for (var i = 0; i < 26; i++) {
      var c = document.createElement('span');
      c.className = 'crumb-burst';
      c.style.background = colors[i % colors.length];
      c.style.left = cx + 'px'; c.style.top = cy + 'px';
      if (i % 3 === 0) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      var ang = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 120;
      var a = c.animate([
        { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist + 140) + 'px) rotate(' + (Math.random() * 540) + 'deg) scale(.6)', opacity: 0 }
      ], { duration: 1000 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)' });
      a.onfinish = (function (el) { return function () { el.remove(); }; })(c);
    }
  }

  /* ---------- oven badge ---------- */
  var BAKES = [
    { m: 7 * 60, item: 'croissants' },
    { m: 8 * 60 + 30, item: 'country loaves' },
    { m: 10 * 60, item: 'cardamom buns' },
    { m: 11 * 60 + 30, item: 'rye & seeded' },
    { m: 13 * 60, item: 'babka' },
    { m: 15 * 60 + 30, item: 'cookies' }
  ];
  var ovenTime = $('#oven-time'), ovenItem = $('#oven-item'), ovenCenter = $('.oven-center');
  function upcomingBakes() {
    var now = new Date(), m = now.getHours() * 60 + now.getMinutes();
    var closed = now.getDay() === 6;
    var list = closed ? [] : BAKES.filter(function (b) { return b.m > m; });
    if (!list.length) list = BAKES.slice(0, 2).map(function (b) { return { m: b.m, item: b.item, tomorrow: true }; });
    return list.slice(0, 3);
  }
  var ovenIdx = 0;
  function setOven(b) {
    ovenTime.textContent = fmtMin(b.m);
    ovenItem.textContent = b.tomorrow ? b.item + ', tomorrow' : b.item;
  }
  function tickOven() {
    var list = upcomingBakes();
    ovenIdx = (ovenIdx + 1) % list.length;
    if (reduceMotion) { setOven(list[ovenIdx]); return; }
    ovenCenter.classList.add('is-swapping');
    window.setTimeout(function () { setOven(list[ovenIdx]); ovenCenter.classList.remove('is-swapping'); }, 360);
  }
  setOven(upcomingBakes()[0]);
  window.setInterval(tickOven, 4200);

  /* ---------- hours: highlight today ---------- */
  (function () {
    var d = new Date().getDay();
    var rows = $$('.hours tbody tr');
    var idx = d === 6 ? 2 : d === 5 ? 1 : 0;
    if (rows[idx]) rows[idx].classList.add('is-today');
  })();

  /* ---------- header: scrolled state & mobile menu ---------- */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('.menu-toggle'), nav = $('#main-nav');
  menuBtn.addEventListener('click', function () {
    var open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { menuBtn.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      menuBtn.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); menuBtn.focus();
    }
  });

  /* ---------- scroll reveals ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- newsletter & class forms ---------- */
  var newsForm = $('#news-form');
  newsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('#news-email'), err = $('#news-error');
    var v = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      input.setAttribute('aria-invalid', 'true');
      err.textContent = 'That email looks a little under-proofed — mind checking it?';
      input.focus();
      return;
    }
    input.setAttribute('aria-invalid', 'false');
    err.textContent = '';
    newsForm.innerHTML = '<p class="news-thanks" role="status" tabindex="-1">You’re on the list. See you Thursday — with crumbs.</p>';
    newsForm.querySelector('.news-thanks').focus();
    toast('Subscribed to The Crumb Letter', '✉');
  });
  $('#news-email').addEventListener('input', function () {
    if (this.getAttribute('aria-invalid') === 'true') { this.setAttribute('aria-invalid', 'false'); $('#news-error').textContent = ''; }
  });

  $('#class-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var sel = $('#class-select');
    var label = sel.options[sel.selectedIndex].text;
    toast('Seat held: ' + label + '. We’ll email you to confirm.', '★');
    announce('Seat held for ' + label + '.');
  });

  /* ---------- init ---------- */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  renderGrid();
  updateBadge(false);
  buildDays();
  renderCart();
})();
