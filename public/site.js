document.documentElement.classList.add("js-ready");

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-copy-wechat]").forEach((link) => {
  link.addEventListener("click", async (event) => {
    if (!navigator.clipboard) return;
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(link.dataset.copyWechat);
      const original = link.innerHTML;
      link.textContent = "微信号已复制";
      window.setTimeout(() => {
        link.innerHTML = original;
      }, 1800);
    } catch {
      window.location.href = link.dataset.fallbackHref;
    }
  });
});
