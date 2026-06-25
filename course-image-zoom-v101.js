/* v101 — Course image zoom handler.
   Opens reader/course images in an accessible fullscreen modal. Safe on pages without images.
*/
(function(){
  'use strict';
  var MODAL_ID = 'courseImageZoomModal';
  window.__MED_NYKUTO_COURSE_IMAGE_ZOOM__ = 'v101';

  function isImageTarget(target){
    if(!target || !target.closest) return null;
    var button = target.closest('.course-figure-zoom, [data-course-image-zoom]');
    if(button) return button;
    var img = target.closest('.reader-content img, .course-figure img, #moduleContent img');
    return img;
  }

  function findImage(el){
    if(!el) return null;
    if(el.tagName && el.tagName.toLowerCase() === 'img') return el;
    return el.querySelector ? el.querySelector('img') : null;
  }

  function injectStyle(){
    if(document.getElementById('courseImageZoomV101Style')) return;
    var style = document.createElement('style');
    style.id = 'courseImageZoomV101Style';
    style.textContent = [
      '.course-figure-zoom{cursor:zoom-in;touch-action:manipulation}',
      '.reader-content img,.course-figure img,#moduleContent img{cursor:zoom-in}',
      '.course-image-zoom-modal{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(2,6,23,.88);backdrop-filter:blur(10px)}',
      '.course-image-zoom-modal[hidden]{display:none!important}',
      '.course-image-zoom-dialog{position:relative;max-width:min(96vw,1200px);max-height:92vh;display:grid;gap:12px;justify-items:center}',
      '.course-image-zoom-dialog img{max-width:96vw;max-height:82vh;object-fit:contain;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.45)}',
      '.course-image-zoom-caption{color:#e5e7eb;text-align:center;font-size:.95rem;max-width:900px}',
      '.course-image-zoom-close{position:absolute;right:-8px;top:-48px;min-width:42px;min-height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:rgba(15,23,42,.92);color:#fff;font-size:24px;line-height:1;cursor:pointer}',
      '@media(max-width:760px){.course-image-zoom-modal{padding:12px}.course-image-zoom-close{right:0;top:-50px}.course-image-zoom-dialog img{max-height:78vh;border-radius:14px}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function ensureModal(){
    injectStyle();
    var modal = document.getElementById(MODAL_ID);
    if(modal) return modal;
    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'course-image-zoom-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Imagen ampliada');
    modal.innerHTML = '<div class="course-image-zoom-dialog"><button class="course-image-zoom-close" type="button" aria-label="Cerrar imagen ampliada">×</button><img alt="" /><div class="course-image-zoom-caption"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){
      if(e.target === modal || e.target.closest('.course-image-zoom-close')) closeZoom();
    });
    return modal;
  }

  function openZoom(img){
    if(!img || !img.src) return false;
    var modal = ensureModal();
    var zoomImg = modal.querySelector('img');
    var caption = modal.querySelector('.course-image-zoom-caption');
    var label = img.getAttribute('alt') || img.closest('figure')?.querySelector('figcaption')?.textContent || '';
    zoomImg.src = img.currentSrc || img.src;
    zoomImg.alt = label || 'Imagen del curso ampliada';
    caption.textContent = label || '';
    modal.hidden = false;
    document.documentElement.classList.add('course-image-zoom-open');
    setTimeout(function(){ var close = modal.querySelector('.course-image-zoom-close'); if(close) close.focus(); }, 20);
    return true;
  }

  function closeZoom(){
    var modal = document.getElementById(MODAL_ID);
    if(!modal) return;
    modal.hidden = true;
    document.documentElement.classList.remove('course-image-zoom-open');
  }

  document.addEventListener('click', function(e){
    var target = isImageTarget(e.target);
    if(!target) return;
    var img = findImage(target);
    if(!img) return;
    e.preventDefault();
    e.stopPropagation();
    openZoom(img);
  }, true);

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeZoom();
  });

  function run(){ injectStyle(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
