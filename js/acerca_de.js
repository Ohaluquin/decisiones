(function () {
        const openBtn = document.getElementById('openAcerca');
        const modal = document.getElementById('acercaModal');
        const dialog = modal.querySelector('.mz-dialog');
        const closeEls = modal.querySelectorAll('[data-close-modal], .mz-close');
        let lastFocused = null;
        let scrollY = 0; // para iOS

        function openModal(e) {
          if (e) e.preventDefault();
          lastFocused = document.activeElement;
          modal.setAttribute('aria-hidden', 'false');

          // Bloquea scroll del body también en iOS
          scrollY = window.scrollY || document.documentElement.scrollTop;
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollY}px`;
          document.body.style.left = '0';
          document.body.style.right = '0';
          document.body.style.width = '100%';

          setTimeout(() => dialog.focus(), 0);
          trapFocus(true);
        }

        function closeModal() {
          modal.setAttribute('aria-hidden', 'true');

          // Restaura scroll del body
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);

          trapFocus(false);
          if (lastFocused) lastFocused.focus();
        }

        function onKeyDown(e) {
          if (e.key === 'Escape') closeModal();
          if (e.key === 'Tab') handleTabTrap(e);
        }

        function handleTabTrap(e) {
          const focusables = modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }

        function trapFocus(enable) {
          if (enable) document.addEventListener('keydown', onKeyDown);
          else document.removeEventListener('keydown', onKeyDown);
        }

        openBtn.addEventListener('click', openModal);
        closeEls.forEach(el => el.addEventListener('click', closeModal));
        modal.addEventListener('click', (e) => {
          if (e.target.hasAttribute('data-close-modal')) closeModal();
        });
      })();