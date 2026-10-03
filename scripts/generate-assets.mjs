import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const spritesDir = path.resolve('public/sprites');
const soundsDir = path.resolve('public/sounds');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(spritesDir)) fs.mkdirSync(spritesDir, { recursive: true });
if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir, { recursive: true });

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PWA icons...');
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve(publicDir, 'pwa-192x192.png'));

  // 512x512 standard any
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve(publicDir, 'pwa-512x512.png'));

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve(publicDir, 'apple-touch-icon.png'));

  // favicon.ico (32x32 PNG renamed to ico or 64x64)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve(publicDir, 'favicon.ico'));

  // Maskable 512x512 with safe-zone margin (15% padding = 76px padding around 360px icon)
  const iconPadded = await sharp(svgBuffer)
    .resize(370, 370)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 9, g: 13, b: 22, alpha: 1 },
    },
  })
    .composite([
      {
        input: iconPadded,
        top: 71,
        left: 71,
      },
    ])
    .png()
    .toFile(path.resolve(publicDir, 'pwa-maskable-512x512.png'));

  console.log('Icons generated successfully.');
}

// Generate 16 frames for the 4x4 sprite sheet (each frame 256x256, sheet 1024x1024)
async function generateSpriteSheet() {
  console.log('Generating 16-frame WebP sprite animation assets...');
  const frameWidth = 256;
  const frameHeight = 256;
  const totalFrames = 16;
  const frameBuffers = [];

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / (totalFrames - 1); // 0.0 to 1.0
    // Simulation parameters:
    // Frames 0-4: turbulent shake start, tilt, bubbles
    // Frames 5-10: deep vortex swirl, dark murky liquid, bubbles
    // Frames 11-15: die rises from deep indigo depths and settles
    const angle = Math.sin(i * 1.3) * (18 - i * 1.1); // oscillating shake angle
    const shakeX = Math.cos(i * 1.7) * (14 * (1 - progress * 0.7));
    const shakeY = Math.sin(i * 2.1) * (14 * (1 - progress * 0.7));
    
    // Die depth (opacity & scale): sinks at beginning, surfaces near the end
    let dieY = 140 + Math.sin(progress * Math.PI) * -15; // float height
    let dieScale = 0.55 + progress * 0.45;
    let dieOpacity = 0.15 + progress * 0.85;
    if (i < 4) {
      dieOpacity = 0.25 - i * 0.05;
      dieScale = 0.7 - i * 0.05;
    } else if (i < 8) {
      dieOpacity = 0.15 + (i - 4) * 0.08;
      dieScale = 0.5 + (i - 4) * 0.08;
    } else {
      dieOpacity = 0.5 + (i - 8) * 0.0625;
      dieScale = 0.82 + (i - 8) * 0.0225;
    }

    // Swirl distortion angle
    const swirlAngle = (i * 28) % 360;

    // Bubbles
    const b1x = 128 + Math.cos(i * 0.8) * 55;
    const b1y = 200 - ((i * 16) % 180);
    const b1r = 4 + (i % 4);

    const b2x = 90 + Math.sin(i * 1.1) * 45;
    const b2y = 220 - (((i + 5) * 14) % 190);
    const b2r = 3 + ((i * 2) % 5);

    const b3x = 165 + Math.cos(i * 1.4) * 40;
    const b3y = 210 - (((i + 9) * 15) % 185);
    const b3r = 2 + (i % 3);

    const frameSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${frameWidth} ${frameHeight}" width="${frameWidth}" height="${frameHeight}">
      <defs>
        <radialGradient id="liquidGrad_${i}" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#141938" />
          <stop offset="45%" stop-color="#0a0f24" />
          <stop offset="85%" stop-color="#050714" />
          <stop offset="100%" stop-color="#020308" />
        </radialGradient>
        <radialGradient id="vortexGlow_${i}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="${0.12 + Math.sin(progress * Math.PI) * 0.18}" />
          <stop offset="60%" stop-color="#1d4ed8" stop-opacity="${0.08 + Math.sin(progress * Math.PI) * 0.1}" />
          <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0" />
        </radialGradient>
        <filter id="liquidTurb_${i}">
          <feTurbulence type="fractalNoise" baseFrequency="${0.03 + (i % 5) * 0.005}" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="${6 + Math.sin(i) * 4}" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="dieFace_${i}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="${dieOpacity}" />
          <stop offset="50%" stop-color="#1d4ed8" stop-opacity="${dieOpacity}" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="${dieOpacity}" />
        </linearGradient>
      </defs>

      <!-- Viewport Deep Liquid Background -->
      <circle cx="128" cy="128" r="126" fill="url(#liquidGrad_${i})" />

      <!-- Turbulent Liquid Current Ring -->
      <g transform="translate(${shakeX}, ${shakeY}) rotate(${swirlAngle} 128 128)" opacity="0.35" filter="url(#liquidTurb_${i})">
        <circle cx="128" cy="128" r="95" fill="none" stroke="#60a5fa" stroke-width="6" stroke-dasharray="25 15 40 20" />
        <circle cx="128" cy="128" r="60" fill="none" stroke="#818cf8" stroke-width="4" stroke-dasharray="15 30" />
      </g>

      <!-- Center Vortex Glow -->
      <circle cx="128" cy="128" r="100" fill="url(#vortexGlow_${i})" />

      <!-- Floating 20-sided Die Triangle Surface -->
      <g transform="translate(128, ${dieY}) rotate(${angle}) scale(${dieScale}) translate(-128, -128)">
        <!-- Triangle Body -->
        <polygon points="128,52 216,196 40,196" fill="url(#dieFace_${i})" stroke="#93c5fd" stroke-width="${1.5 + dieOpacity}" stroke-opacity="${dieOpacity * 0.85}" stroke-linejoin="round" />
        <!-- Inner facet reflection lines -->
        <line x1="128" y1="52" x2="128" y2="196" stroke="#60a5fa" stroke-width="1" stroke-opacity="${dieOpacity * 0.35}" />
        <line x1="40" y1="196" x2="172" y2="124" stroke="#60a5fa" stroke-width="1" stroke-opacity="${dieOpacity * 0.25}" />
        <line x1="216" y1="196" x2="84" y2="124" stroke="#60a5fa" stroke-width="1" stroke-opacity="${dieOpacity * 0.25}" />
      </g>

      <!-- Rising Liquid Bubbles -->
      <circle cx="${b1x}" cy="${b1y}" r="${b1r}" fill="#93c5fd" opacity="0.45" />
      <circle cx="${b1x - 1}" cy="${b1y - 1}" r="${Math.max(1, b1r - 2)}" fill="#ffffff" opacity="0.6" />

      <circle cx="${b2x}" cy="${b2y}" r="${b2r}" fill="#bfdbfe" opacity="0.4" />
      <circle cx="${b3x}" cy="${b3y}" r="${b3r}" fill="#60a5fa" opacity="0.5" />

      <!-- Vignette Inner Edge (Liquid inside viewport cylinder) -->
      <circle cx="128" cy="128" r="126" fill="none" stroke="#000000" stroke-width="16" opacity="0.65" />
      <circle cx="128" cy="128" r="126" fill="none" stroke="#020617" stroke-width="6" opacity="0.85" />
      <!-- Glass Specular Crescent Reflection -->
      <path d="M 45 65 A 110 110 0 0 1 210 65 A 104 104 0 0 0 45 65 Z" fill="#ffffff" opacity="0.12" />
    </svg>
    `;

    const webpBuffer = await sharp(Buffer.from(frameSvg))
      .webp({ quality: 90 })
      .toBuffer();

    frameBuffers.push(webpBuffer);

    // Save individual frame
    await sharp(Buffer.from(frameSvg))
      .webp({ quality: 90 })
      .toFile(path.resolve(spritesDir, `frame_${i}.webp`));
  }

  // Compose 4x4 Grid Sprite Sheet (4 columns x 4 rows = 1024x1024)
  const compositeInputs = frameBuffers.map((buf, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    return {
      input: buf,
      left: col * frameWidth,
      top: row * frameHeight,
    };
  });

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 2, g: 3, b: 8, alpha: 1 },
    },
  })
    .composite(compositeInputs)
    .webp({ quality: 90 })
    .toFile(path.resolve(spritesDir, 'magic8_shake_sprite.webp'));

  console.log('Sprite sheet and 16 individual WebP frames created successfully.');
}

// Generate a valid audio file (WAV with slosh/water shake tone and save as MP3/WAV)
async function generateAudioAssets() {
  console.log('Generating audio assets...');
  // Let's create a synthesized multi-wave liquid shake sound in standard RIFF WAV format
  const sampleRate = 44100;
  const duration = 1.3; // 1.3 seconds
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + totalSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + totalSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20); // PCM audio format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(totalSamples * 2, 40);

  let noiseFilter = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Water sloshing modulation envelope
    const envelope = Math.sin(Math.min(Math.PI, (t / duration) * Math.PI));
    // Agitation frequency bursts (shaking back and forth at ~4Hz)
    const shakeCycle = Math.sin(t * Math.PI * 8);
    const sloshFreq = 120 + Math.sin(t * 18) * 50;

    // Noise component (bubbles & water displacement)
    const rawNoise = (Math.random() * 2 - 1);
    noiseFilter = noiseFilter * 0.9 + rawNoise * 0.1;

    // Mystical deep resonance chime + water slosh
    const chime = Math.sin(t * 2 * Math.PI * 330) * Math.exp(-t * 2.5) * 0.25;
    const water = Math.sin(t * 2 * Math.PI * sloshFreq) * 0.35 * Math.abs(shakeCycle);
    const bubbleNoise = noiseFilter * 0.3 * envelope;

    const sample = (water + chime + bubbleNoise) * envelope;
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.resolve(soundsDir, 'magic8_shake.wav'), buffer);
  // Also provide magic8_shake.mp3 fallback alias
  fs.writeFileSync(path.resolve(soundsDir, 'magic8_shake.mp3'), buffer);
  console.log('Audio files generated successfully.');
}

async function run() {
  await generateIcons();
  await generateSpriteSheet();
  await generateAudioAssets();
  console.log('All public assets successfully created!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
