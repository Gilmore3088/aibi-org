document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => item.classList.toggle('open'));
});

const catLinks = document.querySelectorAll('.cat-nav a');
const sections = [...document.querySelectorAll('.faq-section')];
function setActive(){
  const y = window.scrollY + 140;
  let active = sections[0]?.id;
  for (const s of sections){ if (s.offsetTop <= y) active = s.id; }
  catLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active));
}
window.addEventListener('scroll', setActive, { passive:true });
setActive();

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length <= 1) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 120, behavior:'smooth' });
  });
});
