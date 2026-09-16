// ===== CONFIGURACIÓN =====
const WHATSAPP_NUMBER = '573103904891'; // Fernando Sánchez (+57 310 390 4891)
const ASESOR_NAME = 'Fernando Sánchez';
// Reemplaza esta URL con la Web App desplegada de Google Apps Script (ver GOOGLE_SHEETS_SCRIPT.md)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXQtGodcxj2-reeJpx1WPI9TYBPzbOSm_kFLm2uJK4VE7sgH1P3z77pAOOdsJPSJbA/exec';

// ===== ELEMENTOS DOM =====
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');
const btnContacto = document.querySelector('#btn-contacto');
const btnSobreMi = document.querySelector('#btn-sobreMi');
const contactModal = document.getElementById('contact-modal');
const toast = document.getElementById('toast');

// ===== NAVBAR MÓVIL =====
if (menuIcon && navbar) {
  menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
  };

  // Cerrar menú al hacer clic en un enlace de navegación
  navbar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuIcon.classList.remove('bx-x');
      navbar.classList.remove('active');
    });
  });
}

// ===== SMOOTH SCROLL BOTONES HERO =====
if (btnSobreMi) {
  btnSobreMi.onclick = () => {
    document.getElementById('sobreMi')?.scrollIntoView({ behavior: 'smooth' });
  };
}

// ===== MODAL DE CONTACTO =====
function openContactModal() {
  if (!contactModal) return;
  contactModal.classList.add('active');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Enfocar el primer input
  const firstInput = contactModal.querySelector('input[name="nombre"]');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 150);
  }
}

function closeContactModal() {
  if (!contactModal) return;
  contactModal.classList.remove('active');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Triggers para abrir modal (botones Contáctame, iconos de WhatsApp)
document.querySelectorAll('.js-open-modal').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });
});

// Cerrar modal con clic en backdrop o botón X
if (contactModal) {
  const closeBtn = contactModal.querySelector('.modal-close');
  const backdrop = contactModal.querySelector('.modal-backdrop');

  closeBtn?.addEventListener('click', closeContactModal);
  backdrop?.addEventListener('click', closeContactModal);

  // Cerrar con Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('active')) {
      closeContactModal();
    }
  });
}

// ===== TOAST NOTIFICACIÓN =====
let toastTimer = null;
function showToast(message = '¡Datos guardados! Abriendo WhatsApp...', duration = 3500) {
  if (!toast) return;
  const msgEl = toast.querySelector('.toast-msg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ===== ENVÍO DE FORMULARIOS (MODAL E INLINE) =====
const contactForms = document.querySelectorAll('.contact-lead-form');

contactForms.forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

    const nombre = (form.nombre?.value || '').trim();
    const numero = (form.numero?.value || '').trim();
    const empresa = (form.empresa?.value || '').trim();
    const mensaje = (form.mensaje?.value || '').trim();

    if (!nombre || !numero || !empresa) {
      alert('Por favor completa los campos requeridos: Nombre, WhatsApp y Empresa.');
      return;
    }

    // 1. Mostrar estado de carga en el botón
    if (submitBtn) {
      submitBtn.classList.add('is-submitting');
      submitBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Conectando...";
    }

    // 2. Construir mensaje estructurado para WhatsApp
    let waText = `Hola ${ASESOR_NAME}, mi nombre es *${nombre}* de la empresa *${empresa}* (tel: ${numero}).`;
    if (mensaje) {
      waText += `\n\n*Mensaje/Requerimiento:*\n${mensaje}`;
    } else {
      waText += `\n\nMe gustaría cotizar y recibir asesoría sobre sus servicios de impresión y empaques.`;
    }

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    // 3. Enviar datos a Google Sheets en segundo plano (asíncrono)
    if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.startsWith('http')) {
      const payload = {
        timestamp: new Date().toISOString(),
        asesor: ASESOR_NAME,
        nombre: nombre,
        numero: numero,
        empresa: empresa,
        mensaje: mensaje,
        origen: 'landing-fernando-sanchez',
        page: window.location.href,
        userAgent: navigator.userAgent
      };

      try {
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Error enviando datos a Google Apps Script:', err);
      }
    }

    // 4. Abrir WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // 5. Feedback visual y limpieza
    showToast('¡Datos guardados! Abriendo WhatsApp...');
    form.reset();

    if (contactModal && contactModal.classList.contains('active')) {
      closeContactModal();
    }

    if (submitBtn) {
      submitBtn.classList.remove('is-submitting');
      submitBtn.innerHTML = originalBtnHtml;
    }
  });
});

// ===== DESCARGA DE VCARD DE CONTACTO =====
const vcardData = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'FN:Fernando Sanchez',
  'N:Sanchez;Fernando;;;',
  'ORG:Sistemas Litograficos S.A.S.',
  'TITLE:Asesor de Gerencia',
  'TEL;TYPE=CELL:+57 310 390 4891',
  'EMAIL:contacto@sistemaslitograficos.com',
  'ADR;TYPE=WORK:;;Calle 54 # 54-43;Medellin;Antioquia;;Colombia',
  'URL:https://www.sistemaslitograficos.com.co',
  'END:VCARD'
].join('\n');

const vcardBlob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
const vcardUrl = URL.createObjectURL(vcardBlob);

// Asignar vCard URL a todos los botones o enlaces de contacto correspondientes
document.querySelectorAll('#downloadContact, .js-download-contact').forEach(el => {
  el.setAttribute('href', vcardUrl);
  el.setAttribute('download', 'Fernando_Sanchez_Sistemas.vcf');
});

if (btnContacto) {
  btnContacto.onclick = (e) => {
    e.preventDefault();
    const tempLink = document.createElement('a');
    tempLink.href = vcardUrl;
    tempLink.download = 'Fernando_Sanchez_Sistemas.vcf';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    showToast('Descargando contacto...');
  };
}