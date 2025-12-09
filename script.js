const upload = document.getElementById('upload');
const canvasBefore = document.getElementById('canvasBefore');
const canvasAfter = document.getElementById('canvasAfter');
const ctxBefore = canvasBefore.getContext('2d');
const ctxAfter = canvasAfter.getContext('2d');
const overlay = document.getElementById('overlay');
const divider = document.getElementById('divider');

const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

let originalImage = null;
let isDragging = false;

// Upload gambar
upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const scale = Math.min(
      window.innerWidth * 0.9 / img.width,
      window.innerHeight * 0.6 / img.height
    );

    const w = img.width;
    const h = img.height;
    canvasBefore.width = canvasAfter.width = w;
    canvasBefore.height = canvasAfter.height = h;

    canvasBefore.style.width = `${w * scale}px`;
    canvasBefore.style.height = `${h * scale}px`;
    canvasAfter.style.width = `${w * scale}px`;
    canvasAfter.style.height = `${h * scale}px`;
    overlay.style.height = `${h * scale}px`;

    ctxBefore.drawImage(img, 0, 0);
    ctxAfter.drawImage(img, 0, 0);
    originalImage = ctxAfter.getImageData(0, 0, w, h);

    overlay.style.width = '50%';
    divider.style.left = '50%';

    clearBtn.style.display = 'inline-block';
    saveBtn.style.display = 'inline-block';
  };
  img.src = URL.createObjectURL(file);
});

// Fungsi transformasi linear
function applyTransform() {
  if (!originalImage) return;

  const imageData = new ImageData(
    new Uint8ClampedArray(originalImage.data),
    originalImage.width,
    originalImage.height
  );

  const α = parseFloat(contrastInput.value);
  const β = parseInt(brightnessInput.value);

  brightnessVal.textContent = β;
  contrastVal.textContent = α.toFixed(1);

  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Rumus transformasi linear: I'(i,j) = α * I(i,j) + β
    data[i]   = Math.min(255, Math.max(0, α * data[i]   + β)); // R
    data[i+1] = Math.min(255, Math.max(0, α * data[i+1] + β)); // G
    data[i+2] = Math.min(255, Math.max(0, α * data[i+2] + β)); // B
  }

  ctxAfter.putImageData(imageData, 0, 0);
}

brightnessInput.addEventListener('input', applyTransform);
contrastInput.addEventListener('input', applyTransform);

// Geser garis pembatas
divider.addEventListener('mousedown', () => (isDragging = true));
window.addEventListener('mouseup', () => (isDragging = false));
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = canvasBefore.getBoundingClientRect();
  let pos = ((e.clientX - rect.left) / rect.width) * 100;
  pos = Math.max(0, Math.min(100, pos));
  overlay.style.width = `${pos}%`;
  divider.style.left = `${pos}%`;
});

// Tombol hapus
clearBtn.addEventListener('click', () => {
  ctxBefore.clearRect(0, 0, canvasBefore.width, canvasBefore.height);
  ctxAfter.clearRect(0, 0, canvasAfter.width, canvasAfter.height);
  originalImage = null;
  upload.value = "";
  brightnessInput.value = 0;
  contrastInput.value = 1;
  brightnessVal.textContent = "0";
  contrastVal.textContent = "1.0";
  clearBtn.style.display = 'none';
  saveBtn.style.display = 'none';
  overlay.style.width = '50%';
  divider.style.left = '50%';
});

// Tombol simpan hasil
saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'hasil_transformasi.png';
  link.href = canvasAfter.toDataURL('image/png');
  link.click();
});
