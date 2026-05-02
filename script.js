/* iranga.dev — interactivity */
(function () {
  'use strict';

  // ---------------- Theme toggle ----------------
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');

  const sunIcon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moonIcon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  let theme =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  const apply = (t) => {
    root.setAttribute('data-theme', t);
    if (toggle) {
      toggle.innerHTML = t === 'dark' ? sunIcon : moonIcon;
      toggle.setAttribute(
        'aria-label',
        'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode'
      );
    }
  };

  apply(theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      apply(theme);
    });
  }

  // ---------------- Header scroll state ----------------
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------------- Reveal on scroll ----------------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------------- Contact form ----------------
  const form = document.querySelector('.contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const action = form.getAttribute('action') || '';
    const fallbackEmail = form.getAttribute('data-fallback-email') || 'hello@iranga.dev';
    const isConfigured = action && !action.includes('YOUR_FORM_ID');

    const setStatus = (msg, type) => {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove('success', 'error');
      if (type) status.classList.add(type);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot — silently ignore bots
      const honey = form.querySelector('input[name="_gotcha"]');
      if (honey && honey.value) return;

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const company = (data.get('company') || '').toString().trim();
      const projectType = (data.get('project_type') || '').toString().trim();
      const budget = (data.get('budget') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!email || !message) {
        setStatus('Please add your email and a short message.', 'error');
        return;
      }

      // Fallback path — open default mail client until Formspree is wired
      if (!isConfigured) {
        const subject = encodeURIComponent(
          'Project enquiry — ' + (name || 'iranga.dev visitor')
        );
        const bodyLines = [
          'Name: ' + (name || '—'),
          'Email: ' + email,
          'Company: ' + (company || '—'),
          'Project type: ' + (projectType || '—'),
          'Budget: ' + (budget || '—'),
          '',
          'Message:',
          message,
        ].join('\n');
        const mailto =
          'mailto:' + fallbackEmail +
          '?subject=' + subject +
          '&body=' + encodeURIComponent(bodyLines);
        window.location.href = mailto;
        setStatus(
          'Opening your email app… If nothing happens, write to ' + fallbackEmail + ' directly.',
          'success'
        );
        return;
      }

      // Real submission to Formspree / Web3Forms
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
        }
        setStatus('Sending…', '');

        const res = await fetch(action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
        });

        if (res.ok) {
          form.reset();
          setStatus(
            'Thanks — your message is on its way. I\'ll reply within 24 hours.',
            'success'
          );
        } else {
          const json = await res.json().catch(() => ({}));
          const err =
            (json && json.errors && json.errors[0] && json.errors[0].message) ||
            'Something went wrong. Please email ' + fallbackEmail + ' instead.';
          setStatus(err, 'error');
        }
      } catch (err) {
        setStatus(
          'Network error. Please email ' + fallbackEmail + ' instead.',
          'error'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
        }
      }
    });
  }

  // ---------------- Smooth nav active state (optional polish) ----------------
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  navLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document
          .querySelector(id)
          .scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
