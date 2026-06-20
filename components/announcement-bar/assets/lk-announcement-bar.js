if (!customElements.get("lk-announcement-bar")) {
  class LkAnnouncementBar extends HTMLElement {
    constructor() {
      super();
      this._current = 0;
      this._timer = null;
      this._slides = [];
      this._reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }

    connectedCallback() {
      this._dismissed = this._loadDismissed();
      this._slides = Array.from(
        this.querySelectorAll(".lk-announcement-bar__slide"),
      ).filter((slide) => !this._dismissed.includes(slide.dataset.blockId));

      if (this._slides.length === 0) {
        this.hidden = true;
        return;
      }

      this._showSlide(0);

      this.querySelectorAll("[data-dismiss]").forEach((btn) => {
        btn.addEventListener("click", (e) =>
          this._dismiss(e.target.closest(".lk-announcement-bar__slide")),
        );
      });

      const prev = this.querySelector(".lk-announcement-bar__nav--prev");
      const next = this.querySelector(".lk-announcement-bar__nav--next");

      if (prev) prev.addEventListener("click", () => this._navigate(-1));
      if (next) next.addEventListener("click", () => this._navigate(1));

      if (this._slides.length > 1 && this._autoplay && !this._reducedMotion) {
        this._startAutoplay();
        this.addEventListener("mouseenter", () => this._stopAutoplay());
        this.addEventListener("mouseleave", () => this._startAutoplay());
        this.addEventListener("focusin", () => this._stopAutoplay());
        this.addEventListener("focusout", () => this._startAutoplay());
      }
    }

    disconnectedCallback() {
      this._stopAutoplay();
    }

    get _autoplay() {
      return this.dataset.autoplay === "true";
    }

    get _speed() {
      return parseInt(this.dataset.autoplaySpeed) || 4000;
    }

    _showSlide(index) {
      this._slides.forEach((s) => s.removeAttribute("data-active"));
      this._slides[index]?.setAttribute("data-active", "");
      this._current = index;

      const track = this.querySelector(".lk-announcement-bar__track");
      if (track) track.setAttribute("aria-live", "polite");
    }

    _navigate(dir) {
      this._stopAutoplay();
      const next =
        (this._current + dir + this._slides.length) % this._slides.length;
      this._showSlide(next);
      if (this._autoplay && !this._reducedMotion) this._startAutoplay();
    }

    _startAutoplay() {
      this._stopAutoplay();
      this._timer = setInterval(() => {
        const next = (this._current + 1) % this._slides.length;
        const track = this.querySelector(".lk-announcement-bar__track");
        if (track) track.setAttribute("aria-live", "off");
        this._showSlide(next);
      }, this._speed);
    }

    _stopAutoplay() {
      clearInterval(this._timer);
      this._timer = null;
    }

    _dismiss(slide) {
      if (!slide) return;
      const id = slide.dataset.blockId;
      slide.remove();
      this._slides = this._slides.filter((s) => s !== slide);

      const dismissed = this._loadDismissed();
      dismissed.push(id);
      try {
        localStorage.setItem(
          "lk_dismissed_announcements",
          JSON.stringify(dismissed),
        );
      } catch (_) {}

      if (this._slides.length === 0) {
        this._stopAutoplay();
        this.hidden = true;
        return;
      }

      const next = Math.min(this._current, this._slides.length - 1);
      this._showSlide(next);
    }

    _loadDismissed() {
      try {
        return JSON.parse(
          localStorage.getItem("lk_dismissed_announcements") || "[]",
        );
      } catch (_) {
        return [];
      }
    }
  }

  customElements.define("lk-announcement-bar", LkAnnouncementBar);
}
