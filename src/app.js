(() => {
  const themes = {
    cream: { bg: '#F5F0E8', text: '#171717', accent: '#C4A265', visual: '#DCC89A' },
    dark: { bg: '#171717', text: '#F5F0E8', accent: '#C4A265', visual: '#3E3323' },
    saas: { bg: '#F7FAFC', text: '#111827', accent: '#2563EB', visual: '#D9E8FF' },
    bold: { bg: '#FFF4D6', text: '#111111', accent: '#FF5A3D', visual: '#FFD166' }
  };

  const makeSlide = (tag, title, body, visual, titleY, bodyY) => ({
    tag, title, body, visual,
    pos: {
      tag: { x: 8, y: 26, w: 80 },
      title: { x: 8, y: titleY, w: 84 },
      body: { x: 8, y: bodyY, w: 80 }
    }
  });

  let state = {
    page: 'setup',
    active: 0,
    brand: 'the decodé',
    handle: '@decodstudio',
    topic: 'my whole feed is full of these reels right now',
    subtitle: "here's what's actually happening",
    audience: 'brand strategists, marketers, creators',
    cta: 'comment DECODE and I will send you the source list plus carousel notes.',
    aspect: '34',
    colors: { bg: '#F5F0E8', text: '#171717', accent: '#C4A265', visual: '#DCC89A' },
    slides: [
      makeSlide('COVER', 'my whole feed is full of these reels right now', "here's what's actually happening", 'frame', 30, 58),
      makeSlide('THE CONCEPT', 'there is always a deeper pattern', 'Start with what people notice, then explain the strategy underneath it.', 'editorial', 42, 60),
      makeSlide('WHY IT MATTERS', 'people do not save definitions', 'They save explanations that make them feel smarter the next time they see the same pattern.', 'data', 44, 62),
      makeSlide('FRAMEWORK', 'decode it in 3 layers', '1. What the audience sees\n2. What the brand wants them to feel\n3. What the strategy is actually doing', 'frame', 38, 56),
      makeSlide('CTA', 'want the source list?', 'comment DECODE and I will send you the source list plus carousel notes.', 'editorial', 39, 58)
    ]
  };

  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));
  const clean = value => String(value ?? '').replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1400);
  }

  function setPath(path, value) {
    const parts = path.split('.');
    let ref = state;
    while (parts.length > 1) ref = ref[parts.shift()];
    ref[parts[0]] = value;
  }

  function getPath(path) {
    return path.split('.').reduce((ref, key) => ref && ref[key], state);
  }

  function render() {
    $$('[data-bind]').forEach(el => {
      const value = getPath(el.dataset.bind);
      if (value !== undefined && el.value !== String(value)) el.value = value;
    });
    renderPages();
    renderSlideList();
    renderEditor();
    renderPreview();
    renderOutput();
  }

  function renderPages() {
    $$('.tab').forEach(tab => tab.classList.toggle('on', tab.dataset.page === state.page));
    $$('.page').forEach(page => page.classList.toggle('on', page.id === state.page));
  }

  function renderSlideList() {
    $('#slideList').innerHTML = state.slides.map((slide, index) => `
      <div class="slide-row ${index === state.active ? 'on' : ''}" data-index="${index}">
        <div class="num">${index + 1}</div>
        <div class="meta"><strong>${clean(slide.title)}</strong><small>${clean(slide.tag)} - ${clean(slide.visual)}</small></div>
        <button class="danger" data-delete="${index}">Delete</button>
      </div>
    `).join('');
  }

  function renderEditor() {
    const slide = state.slides[state.active];
    if (!slide) return;
    $('#sTag').value = slide.tag;
    $('#sVisual').value = slide.visual;
    $('#sTitle').value = slide.title;
    $('#sBody').value = slide.body;
    $('#titleY').value = slide.pos.title.y;
    $('#bodyY').value = slide.pos.body.y;
  }

  function visualHtml(slide) {
    let html = '<span class="blob"></span><span class="dot"></span>';
    if (slide.visual === 'frame') html += '<span class="frame"></span>';
    if (slide.visual === 'data') html += '<div class="bars"><i style="height:40%"></i><i style="height:80%"></i><i style="height:55%"></i><i style="height:90%"></i></div>';
    return html;
  }

  function slideHtml(slide, index) {
    const ratio = state.aspect === '45' ? 'r45' : state.aspect === '11' ? 'square' : '';
    const c = state.colors;
    return `
      <div class="canvas ${ratio}" style="--sbg:${c.bg};--stext:${c.text};--saccent:${c.accent};--svisual:${c.visual};--smuted:${c.text}99" data-canvas="${index}">
        <div class="visual">${visualHtml(slide)}</div>
        <div class="brandline"><span>🧩 ${clean(state.brand)}</span><span>${clean(state.handle)}</span></div>
        <div class="block tag" data-block="tag" style="left:${slide.pos.tag.x}%;top:${slide.pos.tag.y}%;width:${slide.pos.tag.w}%">${clean(slide.tag)}</div>
        <div class="block title" data-block="title" style="left:${slide.pos.title.x}%;top:${slide.pos.title.y}%;width:${slide.pos.title.w}%">${clean(slide.title)}</div>
        <div class="block body" data-block="body" style="left:${slide.pos.body.x}%;top:${slide.pos.body.y}%;width:${slide.pos.body.w}%">${clean(slide.body)}</div>
        <div class="footer"><span>${clean(state.brand)} strategy studio</span><div class="progress"><div class="fill" style="width:${((index + 1) / state.slides.length) * 100}%"></div></div><span>${index + 1}/${state.slides.length}</span></div>
      </div>
    `;
  }

  function renderPreview() {
    $('#active').innerHTML = slideHtml(state.slides[state.active], state.active);
    makeDraggable($('#active .canvas'));
    $('#thumbs').innerHTML = state.slides.map((slide, index) => `<div class="thumb ${index === state.active ? 'on' : ''}" data-thumb="${index}">${slideHtml(slide, index)}</div>`).join('');
    $$('[data-thumb]').forEach(item => item.onclick = () => { state.active = Number(item.dataset.thumb); render(); });
  }

  function makeDraggable(canvas) {
    let current = null;
    let start = null;
    $$('.block', canvas).forEach(block => {
      block.onpointerdown = event => {
        current = block;
        current.classList.add('sel');
        current.setPointerCapture(event.pointerId);
        const rect = canvas.getBoundingClientRect();
        const key = current.dataset.block;
        const pos = state.slides[state.active].pos[key];
        start = { key, rect, x: event.clientX, y: event.clientY, ox: pos.x, oy: pos.y };
      };
      block.onpointermove = event => {
        if (!current || !start) return;
        const pos = state.slides[state.active].pos[start.key];
        pos.x = Math.max(0, Math.min(92, start.ox + ((event.clientX - start.x) / start.rect.width) * 100));
        pos.y = Math.max(0, Math.min(92, start.oy + ((event.clientY - start.y) / start.rect.height) * 100));
        current.style.left = pos.x + '%';
        current.style.top = pos.y + '%';
      };
      block.onpointerup = () => {
        if (current) current.classList.remove('sel');
        current = null;
        start = null;
        renderEditor();
      };
    });
  }

  function packageText() {
    const slides = state.slides.map((s, i) => `SLIDE ${i + 1}/${state.slides.length}\nTag: ${s.tag}\nTitle: ${s.title}\nBody: ${s.body}\nVisual style: ${s.visual}\nBrand: ${state.brand} (${state.handle})\nColors: ${state.colors.bg}, ${state.colors.text}, ${state.colors.accent}, ${state.colors.visual}\nPrompt: Create one clean, premium Instagram carousel slide. Keep all text readable and follow the exact brand colors.\nNegative prompt: no misspellings, no tiny text, no cropped text, no watermark.`).join('\n\n---\n\n');
    return `CAROUSEL PROMPT PACKAGE\n\n${slides}\n\nCAPTION PROMPT\nWrite a strategic Instagram caption for: ${state.topic}. Audience: ${state.audience}. CTA: ${state.cta}\n\nREADY CTA\n${state.cta}`;
  }

  function renderOutput() {
    $('#out').textContent = packageText();
  }

  function bindEvents() {
    document.body.addEventListener('click', event => {
      const tab = event.target.closest('.tab');
      if (tab) { state.page = tab.dataset.page; render(); }
      const row = event.target.closest('[data-index]');
      if (row && !event.target.closest('[data-delete]')) { state.active = Number(row.dataset.index); render(); }
      const del = event.target.closest('[data-delete]');
      if (del && state.slides.length > 1) {
        state.slides.splice(Number(del.dataset.delete), 1);
        state.active = Math.max(0, Math.min(state.active, state.slides.length - 1));
        render();
      }
    });

    $$('[data-bind]').forEach(el => el.oninput = event => {
      setPath(event.target.dataset.bind, event.target.value);
      if (event.target.dataset.bind === 'topic') state.slides[0].title = state.topic;
      if (event.target.dataset.bind === 'subtitle') state.slides[0].body = state.subtitle;
      if (event.target.dataset.bind === 'cta') state.slides[state.slides.length - 1].body = state.cta;
      render();
    });

    $('#theme').onchange = event => { state.colors = { ...themes[event.target.value] }; render(); };

    ['sTag', 'sVisual', 'sTitle', 'sBody', 'titleY', 'bodyY'].forEach(id => {
      $('#' + id).oninput = event => {
        const slide = state.slides[state.active];
        if (id === 'sTag') slide.tag = event.target.value;
        if (id === 'sVisual') slide.visual = event.target.value;
        if (id === 'sTitle') slide.title = event.target.value;
        if (id === 'sBody') slide.body = event.target.value;
        if (id === 'titleY') slide.pos.title.y = Number(event.target.value);
        if (id === 'bodyY') slide.pos.body.y = Number(event.target.value);
        renderSlideList();
        renderPreview();
        renderOutput();
      };
    });

    $('#addBtn').onclick = () => {
      state.slides.push(makeSlide('NEW', 'new slide title', 'Write the core explanation here.', 'editorial', 40, 58));
      state.active = state.slides.length - 1;
      state.page = 'slides';
      render();
    };

    $('#saveBtn').onclick = () => { toast('Saved for this session'); };
    $('#loadBtn').onclick = () => { toast('Current session loaded'); render(); };
    $('#copyBtn').onclick = () => { toast('Package ready in Output box'); };
    $('#exportBtn').onclick = () => { toast('Use Output tab to copy package'); state.page = 'output'; render(); };
  }

  bindEvents();
  render();
  window.carouselPromptStudioState = state;
})();
