const form = document.getElementById('personalForm');
const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
const clearSignature = document.getElementById('clearSignature');
const formView = document.getElementById('formView');
const resultView = document.getElementById('resultView');
const preview = document.getElementById('documentPreview');
const printBtn = document.getElementById('printBtn');
const editBtn = document.getElementById('editBtn');
let drawing = false;
let hasSignature = false;
let last = null;

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();
  const current = canvas.toDataURL();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#111827';
  if (hasSignature) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    img.src = current;
  }
}
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(resizeCanvas);

function point(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}
function start(e) { e.preventDefault(); drawing = true; last = point(e); }
function move(e) {
  if (!drawing) return;
  e.preventDefault();
  const p = point(e);
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  last = p;
  hasSignature = true;
}
function end() { drawing = false; last = null; }
['mousedown','touchstart'].forEach(evt => canvas.addEventListener(evt, start));
['mousemove','touchmove'].forEach(evt => canvas.addEventListener(evt, move));
['mouseup','mouseleave','touchend','touchcancel'].forEach(evt => canvas.addEventListener(evt, end));

clearSignature.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasSignature = false;
});

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function item(label, value, full = false) {
  return `<div class="doc-item ${full ? 'doc-full' : ''}"><span>${label}</span>${escapeHtml(value) || '&nbsp;'}</div>`;
}
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!hasSignature) {
    alert('Falta la firma del cliente.');
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  const signature = canvas.toDataURL('image/png');
  const generated = new Date().toLocaleString('es-CO');
  preview.innerHTML = `
    <div class="doc-title">
      <h2>Formulario de datos personales</h2>
      <p>Generado: ${escapeHtml(generated)}</p>
    </div>
    <div class="doc-grid">
      ${item('Nombre completo', data.nombre)}
      ${item('CC', data.cc)}
      ${item('Correo electrónico', data.correo)}
      ${item('Número de teléfono', data.telefono)}
      ${item('Fecha de nacimiento', data.fechaNacimiento)}
      ${item('Fecha del formulario', data.fechaFormulario)}
      ${item('Dirección de residencia', data.direccion, true)}
      ${item('Ciudad', data.ciudad)}
      ${item('Barrio', data.barrio)}
      ${item('Peso', data.peso)}
      ${item('Estatura', data.estatura)}
      ${item('Enfermedad o control médico persistente', data.enfermedad, true)}
      ${item('Observaciones', data.observaciones, true)}
      ${item('Nombre del beneficiario', data.beneficiario)}
      ${item('Cédula del beneficiario', data.cedulaBeneficiario)}
    </div>
    <div class="doc-signature">
      <img src="${signature}" alt="Firma del cliente" />
      <p>Firma del cliente</p>
    </div>
  `;
  formView.classList.add('hidden');
  resultView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
printBtn.addEventListener('click', () => window.print());
editBtn.addEventListener('click', () => {
  resultView.classList.add('hidden');
  formView.classList.remove('hidden');
});
