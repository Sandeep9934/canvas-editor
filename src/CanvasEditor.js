import React, { useRef, useEffect, useState } from 'react';

const templateData = {
  caption: {
    text: '',
    position: { x: 50, y: 50 },
    max_characters_per_line: 31,
    font_size: 44,
    alignment: 'left',
    text_color: '#FFFFFF',
  },
  cta: {
    text: '',
    position: { x: 190, y: 320 },
    text_color: '#FFFFFF',
    background_color: '#000000',
  },
  image_mask: { x: 56, y: 442, width: 970, height: 600 },
  urls: {
    mask: 'https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_mask.png',
    stroke: 'https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Mask_stroke.png',
    design_pattern: 'https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Design_Pattern.png',
  },
};

const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const [bgColor, setBgColor] = useState('#0369A1');
  const [caption, setCaption] = useState(templateData.caption.text);
  const [ctaText, setCtaText] = useState(templateData.cta.text);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const loadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = `${url}?random=${Math.random()}`;
        img.onload = () => resolve(img);
      });
    };

    const renderCanvas = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw design pattern
      const patternImg = await loadImage(templateData.urls.design_pattern);
      ctx.drawImage(patternImg, 0, 0, canvas.width, canvas.height);

      // Draw the image with the mask
      if (image) {
        const maskImg = await loadImage(templateData.urls.mask);
        ctx.drawImage(image, templateData.image_mask.x, templateData.image_mask.y, templateData.image_mask.width, templateData.image_mask.height);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskImg, templateData.image_mask.x, templateData.image_mask.y, templateData.image_mask.width, templateData.image_mask.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw mask stroke
      const strokeImg = await loadImage(templateData.urls.stroke);
      ctx.drawImage(strokeImg, templateData.image_mask.x, templateData.image_mask.y, templateData.image_mask.width, templateData.image_mask.height);

      // Draw caption text
      ctx.fillStyle = templateData.caption.text_color;
      ctx.font = `${templateData.caption.font_size}px Arial`;
      ctx.textAlign = templateData.caption.alignment;
      drawText(ctx, caption, templateData.caption);

      // Draw CTA text
      ctx.fillStyle = templateData.cta.background_color;
      ctx.fillRect(templateData.cta.position.x - 12, templateData.cta.position.y - 30, ctx.measureText(ctaText).width + 24, 60);
      ctx.fillStyle = templateData.cta.text_color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ctaText, templateData.cta.position.x + (ctx.measureText(ctaText).width / 2), templateData.cta.position.y);
    };

    renderCanvas();
  }, [bgColor, caption, ctaText, image]);

  const drawText = (ctx, text, { position, max_characters_per_line, font_size }) => {
    const words = text.split(' ');
    let line = '';
    let y = position.y;
    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > max_characters_per_line * (font_size / 2) && line.length > 0) {
        ctx.fillText(line, position.x, y);
        line = word + ' ';
        y += font_size;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, position.x, y);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.onload = () => setImage(img);
        };
        reader.readAsDataURL(file);
      } else {
        console.error('Invalid file type. Please upload an image file.');
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-center mb-4 space-x-2">
        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="p-2 border rounded" />
        <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className="p-2 border rounded" />
        <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="CTA" className="p-2 border rounded" />
        <input type="file" onChange={handleImageUpload} className="p-2 border rounded" />
      </div>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width="1080" height="1080" style={{ height: 400, width: 400 }}></canvas>
      </div>
    </div>
  );
};

export default CanvasEditor;
