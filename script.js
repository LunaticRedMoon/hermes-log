// 客户端搜索
(async function() {
  const searchInput = document.getElementById('search');
  const convList = document.getElementById('conv-list');
  const noResults = document.getElementById('no-results');

  if (!searchInput) return; // 不在首页

  // 加载索引
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
    if (!q) {
      // 显示全部
      convList.style.display = '';
      noResults.style.display = 'none';
      document.querySelectorAll('.conv-card').forEach(el => el.style.display = '');
      document.querySelectorAll('.month-heading').forEach(el => el.style.display = '');
      return;
    }

    // 过滤
    const matched = new Set();
    index.forEach((c, i) => {
      const skillNames = (c.skills || []).map(s => s.name).join(' ');
      const text = (c.title + ' ' + c.tags.join(' ') + ' ' + skillNames).toLowerCase();
      if (text.includes(q)) matched.add(c.path);
    });

    // 更新 DOM
    let visible = 0;
    document.querySelectorAll('.conv-card').forEach(el => {
      const href = el.getAttribute('href');
      const slug = href ? href.replace('c/', '').replace('.html', '') : '';
      const match = [...matched].some(p => p.includes(slug));
      el.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    // 隐藏空的月份标题
    let lastVisibleMonth = false;
    document.querySelectorAll('.month-heading').forEach(el => {
      let next = el.nextElementSibling;
      let hasVisible = false;
      while (next && !next.classList.contains('month-heading')) {
        if (next.style.display !== 'none') { hasVisible = true; break; }
        next = next.nextElementSibling;
      }
      el.style.display = hasVisible ? '' : 'none';
      if (hasVisible) lastVisibleMonth = true;
    });

    noResults.style.display = visible === 0 ? '' : 'none';
    convList.style.display = visible === 0 ? 'none' : '';
  });
})();
