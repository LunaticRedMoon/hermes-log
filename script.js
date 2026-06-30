// 客户端搜索 + 标签切换
(async function() {
  const searchInput = document.getElementById('search');
  const convList = document.getElementById('conv-list');
  const skillList = document.getElementById('skill-list');
  const noResults = document.getElementById('no-results');

  if (!searchInput) return;

  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const view = this.dataset.view;
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById(view === 'conversations' ? 'conv-list' : 'skill-list');
      if (target) target.classList.add('active');
      // Re-run search
      searchInput.dispatchEvent(new Event('input'));
    });
  });

  // Load index
  let index = [];
  try {
    const resp = await fetch('index.json');
    index = await resp.json();
  } catch(e) {
    console.error('无法加载索引', e);
    return;
  }

  searchInput.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    const activeView = document.querySelector('.view.active');
    const isSkillView = activeView && activeView.id === 'skill-list';

    if (!q) {
      // Show all in current view
      convList.style.display = isSkillView ? 'none' : '';
      if (skillList) skillList.style.display = isSkillView ? '' : 'none';
      noResults.style.display = 'none';
      document.querySelectorAll('.conv-card, .skill-card').forEach(el => el.style.display = '');
      document.querySelectorAll('.month-heading').forEach(el => el.style.display = '');
      return;
    }

    if (isSkillView && skillList) {
      // Search skills
      let visible = 0;
      document.querySelectorAll('.skill-card').forEach(el => {
        const text = el.textContent.toLowerCase();
        const match = text.includes(q);
        el.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      skillList.style.display = '';
      convList.style.display = 'none';
      noResults.style.display = visible === 0 ? '' : 'none';
    } else {
      // Search conversations
      const matched = new Set();
      index.forEach(c => {
        const skillNames = (c.skills || []).map(s => s.name).join(' ');
        const text = (c.title + ' ' + c.tags.join(' ') + ' ' + skillNames).toLowerCase();
        if (text.includes(q)) matched.add(c.path);
      });

      let visible = 0;
      document.querySelectorAll('.conv-card').forEach(el => {
        const href = el.getAttribute('href');
        const slug = href ? href.replace('c/', '').replace('.html', '') : '';
        const match = [...matched].some(p => p.includes(slug));
        el.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      document.querySelectorAll('.month-heading').forEach(el => {
        let next = el.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains('month-heading')) {
          if (next.style.display !== 'none') { hasVisible = true; break; }
          next = next.nextElementSibling;
        }
        el.style.display = hasVisible ? '' : 'none';
      });

      convList.style.display = '';
      if (skillList) skillList.style.display = 'none';
      noResults.style.display = visible === 0 ? '' : 'none';
    }
  });
})();
