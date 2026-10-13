Studio Gerak - HTML ke video (client-side)
1. Buka index.html di Chrome/Edge terbaru (atau upload ke GitHub Pages).
2. Tab Prompt: tulis ide, salin prompt ke ChatGPT/Gemini/Claude.
3. Tab Kode: tempel kode hasil AI (wajib ada canvas dan window.renderFrameAtTime(t)).
4. Tab Render: atur resolusi, durasi, fps, mesin, format, lalu Render video.
Mesin Ultra/Turbo/Hemat memakai WebCodecs + mp4-muxer (dimuat dari jsDelivr, perlu internet saat render pertama).
Mesin Kompatibel dan format WebM memakai MediaRecorder dan berjalan real-time.
