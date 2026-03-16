import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check } from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "FutureGate QR Code Generator",
    "appDescription": "Generate QR codes for URLs, text, and contact information",
    "urlTab": "URL",
    "textTab": "Text",
    "contactTab": "Contact",
    "enterUrl": "Enter URL",
    "enterText": "Enter Text",
    "contactInformation": "Contact Information",
    "websiteUrl": "Website URL",
    "urlPlaceholder": "example.com or https://example.com",
    "urlHelp": "Enter a website URL. If you don't include http://, we'll add https:// automatically.",
    "textContent": "Text Content",
    "textPlaceholder": "Enter any text to generate QR code...",
    "firstName": "First Name",
    "firstNamePlaceholder": "John",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Doe",
    "phoneNumber": "Phone Number",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Email Address",
    "emailPlaceholder": "john.doe@example.com",
    "organization": "Organization",
    "organizationPlaceholder": "Company Name",
    "website": "Website",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "Clear All Fields",
    "generatedQrCode": "Generated QR Code",
    "scanQrCode": "Scan this QR code with your device",
    "fillFormPrompt": "Fill in the form to generate your QR code",
    "download": "Download",
    "copyData": "Copy Data",
    "copied": "Copied!",
    "qrCodeData": "QR Code Data:",
    "footerText": "Generate QR codes instantly • No data stored • Free to use",
    "qrCodeAlt": "Generated QR Code"
  },
  "es-ES": {
    "appTitle": "Generador de Códigos QR",
    "appDescription": "Genera códigos QR para URLs, texto e información de contacto",
    "urlTab": "URL",
    "textTab": "Texto",
    "contactTab": "Contacto",
    "enterUrl": "Ingresa URL",
    "enterText": "Ingresa Texto",
    "contactInformation": "Información de Contacto",
    "websiteUrl": "URL del Sitio Web",
    "urlPlaceholder": "ejemplo.com o https://ejemplo.com",
    "urlHelp": "Ingresa una URL de sitio web. Si no incluyes http://, agregaremos https:// automáticamente.",
    "textContent": "Contenido de Texto",
    "textPlaceholder": "Ingresa cualquier texto para generar código QR...",
    "firstName": "Nombre",
    "firstNamePlaceholder": "Juan",
    "lastName": "Apellido",
    "lastNamePlaceholder": "Pérez",
    "phoneNumber": "Número de Teléfono",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Dirección de Correo",
    "emailPlaceholder": "juan.perez@ejemplo.com",
    "organization": "Organización",
    "organizationPlaceholder": "Nombre de la Empresa",
    "website": "Sitio Web",
    "websitePlaceholder": "https://ejemplo.com",
    "clearAllFields": "Limpiar Todos los Campos",
    "generatedQrCode": "Código QR Generado",
    "scanQrCode": "Escanea este código QR con tu dispositivo",
    "fillFormPrompt": "Completa el formulario para generar tu código QR",
    "download": "Descargar",
    "copyData": "Copiar Datos",
    "copied": "¡Copiado!",
    "qrCodeData": "Datos del Código QR:",
    "footerText": "Genera códigos QR al instante • No se almacenan datos • Gratis",
    "qrCodeAlt": "Código QR Generado"
  }
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrStyle, setQrStyle] = useState('dots');
  const qrContainerRef = useRef(null);
  
  // Form states for different types
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  const logoRef = useRef(null);

  // Preload logo image
  useEffect(() => {
    const img = new Image();
    img.src = process.env.PUBLIC_URL + '/Logo1.png';
    img.onload = () => { logoRef.current = img; };
  }, []);

  const BRAND_COLOR = '#1A7AB5';
  const BRAND_COLOR_DARK = '#145F8E';

  // QR Code generation using QRious library via CDN
  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => { createQR(text); };
        document.head.appendChild(script);
      } else {
        createQR(text);
      }
    } catch (error) {
      console.error('Error loading QR library:', error);
    }
  };

  const createQR = (text) => {
    if (!qrContainerRef.current) return;

    try {
      qrContainerRef.current.innerHTML = '';

      // Choose error correction based on data length
      // Shorter data = Q (supports bigger logo), longer data = L (keeps QR readable)
      const ecLevel = text.length > 80 ? 'L' : 'Q';

      // Generate QR using QRious to get module data
      const hiddenCanvas = document.createElement('canvas');
      new window.QRious({
        element: hiddenCanvas,
        value: text,
        size: 100,
        padding: 0,
        background: 'white',
        foreground: 'black',
        level: ecLevel
      });

      // Read pixel data to extract module grid
      const hiddenCtx = hiddenCanvas.getContext('2d');
      const imgData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
      const canvasW = hiddenCanvas.width;

      // Detect module count by finding the first dark run length in top row
      let firstDarkEnd = 0;
      for (let x = 0; x < canvasW; x++) {
        if (imgData.data[x * 4] > 128) {
          firstDarkEnd = x;
          break;
        }
      }
      const modulePixels = Math.max(1, Math.round(firstDarkEnd / 7));
      const moduleCount = Math.round(canvasW / modulePixels);

      // Re-render at higher resolution for accurate pixel sampling
      const hiddenSize = Math.max(200, moduleCount * 4);
      new window.QRious({
        element: hiddenCanvas,
        value: text,
        size: hiddenSize,
        padding: 0,
        background: 'white',
        foreground: 'black',
        level: ecLevel
      });
      const hiddenCtx2 = hiddenCanvas.getContext('2d');
      const imgData2 = hiddenCtx2.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
      const canvasW2 = hiddenCanvas.width;
      const modulePixels2 = canvasW2 / moduleCount;

      // Build boolean grid
      const grid = [];
      for (let row = 0; row < moduleCount; row++) {
        grid[row] = [];
        for (let col = 0; col < moduleCount; col++) {
          const px = Math.floor(col * modulePixels2 + modulePixels2 / 2);
          const py = Math.floor(row * modulePixels2 + modulePixels2 / 2);
          const idx = (py * canvasW2 + px) * 4;
          grid[row][col] = imgData2.data[idx] < 128;
        }
      }

      // Draw styled QR code on a high-res canvas
      const size = 1000;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      const padding = 24;
      const qrSize = size - padding * 2;
      const modSize = qrSize / moduleCount;

      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (!grid[row][col]) continue;

          const cx = padding + col * modSize + modSize / 2;
          const cy = padding + row * modSize + modSize / 2;

          // Skip center area for logo — scale down for dense QR codes
          const centerX = size / 2;
          const centerY = size / 2;
          const logoFactor = moduleCount > 40 ? 0.10 : moduleCount > 30 ? 0.12 : 0.15;
          const logoRadius = size * logoFactor;
          const dist = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
          if (dist < logoRadius + modSize) continue;

          // Color gradient based on distance
          const maxDist = Math.sqrt(2) * size / 2;
          const ratio = dist / maxDist;
          ctx.fillStyle = lerpColor(BRAND_COLOR, BRAND_COLOR_DARK, ratio);

          const isFinder = isFinderPattern(row, col, moduleCount);

          switch (qrStyle) {
            case 'dots':
              if (isFinder) {
                drawRoundedSquare(ctx, cx, cy, modSize * 0.9, modSize * 0.2);
              } else {
                ctx.beginPath();
                ctx.arc(cx, cy, modSize * 0.38, 0, Math.PI * 2);
                ctx.fill();
              }
              break;

            case 'rounded':
              drawRoundedSquare(ctx, cx, cy, modSize * 0.88, modSize * 0.3);
              break;

            case 'classic':
              ctx.fillRect(cx - modSize * 0.45, cy - modSize * 0.45, modSize * 0.9, modSize * 0.9);
              break;

            case 'diamond':
              if (isFinder) {
                drawRoundedSquare(ctx, cx, cy, modSize * 0.9, modSize * 0.15);
              } else {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-modSize * 0.3, -modSize * 0.3, modSize * 0.6, modSize * 0.6);
                ctx.restore();
              }
              break;

            case 'star':
              if (isFinder) {
                drawRoundedSquare(ctx, cx, cy, modSize * 0.9, modSize * 0.2);
              } else {
                drawStar(ctx, cx, cy, modSize * 0.2, modSize * 0.4, 4);
              }
              break;

            case 'stripe':
              if (isFinder) {
                drawRoundedSquare(ctx, cx, cy, modSize * 0.9, modSize * 0.2);
              } else {
                // Horizontal pill shape - connect with neighbors
                const hasRight = col + 1 < moduleCount && grid[row][col + 1];
                const w = hasRight ? modSize * 1.0 : modSize * 0.7;
                const offsetX = hasRight ? modSize * 0.05 : 0;
                const h = modSize * 0.5;
                const r = h / 2;
                drawPill(ctx, cx + offsetX - w / 2, cy - h / 2, w, h, r);
              }
              break;

            default:
              ctx.beginPath();
              ctx.arc(cx, cy, modSize * 0.38, 0, Math.PI * 2);
              ctx.fill();
          }
        }
      }

      // Logo overlay — smaller for dense QR codes
      const logoScale = moduleCount > 40 ? 0.15 : moduleCount > 30 ? 0.18 : 0.22;
      const logoSize = size * logoScale;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      // White circle behind logo
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSize / 2 + 8, 0, Math.PI * 2);
      ctx.fill();

      if (logoRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoRef.current, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      }

      canvas.className = 'w-full h-auto rounded-2xl bg-white';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      qrContainerRef.current.appendChild(canvas);

    } catch (error) {
      console.error('Error creating QR code:', error);
    }
  };

  const isFinderPattern = (row, col, moduleCount) => {
    // Top-left, top-right, bottom-left finder patterns (7x7 modules)
    return (row < 7 && col < 7) ||
           (row < 7 && col >= moduleCount - 7) ||
           (row >= moduleCount - 7 && col < 7);
  };

  const drawRoundedSquare = (ctx, cx, cy, size, radius) => {
    const half = size / 2;
    const x = cx - half;
    const y = cy - half;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + size - radius, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    ctx.lineTo(x + size, y + size - radius);
    ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    ctx.lineTo(x + radius, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  const drawStar = (ctx, cx, cy, innerR, outerR, points) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI * i) / points - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawPill = (ctx, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  };

  const lerpColor = (color1, color2, t) => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r},${g},${b})`;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact) => {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    const fullName = `${contact.firstName} ${contact.lastName}`.trim();
    if (fullName) lines.push(`FN:${fullName}`);
    if (contact.lastName || contact.firstName) lines.push(`N:${contact.lastName};${contact.firstName};;;`);
    if (contact.organization) lines.push(`ORG:${contact.organization}`);
    if (contact.phone) lines.push(`TEL:${contact.phone}`);
    if (contact.email) lines.push(`EMAIL:${contact.email}`);
    if (contact.url) lines.push(`URL:${contact.url}`);
    lines.push('END:VCARD');
    return lines.join('\n');
  };

  useEffect(() => {
    let data = '';
    
    switch (activeTab) {
      case 'url':
        data = formatUrl(urlInput);
        break;
      case 'text':
        data = textInput;
        break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
      default:
        data = '';
    }
    
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo, qrStyle]);

  const downloadQRCode = () => {
    if (!qrData) return;
    
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');
    
    if (canvas) {
      // Download from canvas
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      // Download from image
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = img.src;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const tabs = [
    { id: 'url', label: t('urlTab'), icon: Link },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'contact', label: t('contactTab'), icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <img src={process.env.PUBLIC_URL + '/Logo1.png'} alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1A7AB5] to-[#145F8E] bg-clip-text text-transparent mb-2">
            {t('appTitle')}
          </h1>
          <p className="text-gray-600 text-lg">{t('appDescription')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-[#1A7AB5] border-b-2 border-[#1A7AB5] bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {activeTab === 'url' && t('enterUrl')}
                  {activeTab === 'text' && t('enterText')}
                  {activeTab === 'contact' && t('contactInformation')}
                </h2>

                {/* URL Input */}
                {activeTab === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('websiteUrl')}
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t('urlPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('urlHelp')}
                    </p>
                  </div>
                )}

                {/* Text Input */}
                {activeTab === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('textContent')}
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t('textPlaceholder')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                )}

                {/* Contact Input */}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('firstName')}
                        </label>
                        <input
                          type="text"
                          value={contactInfo.firstName}
                          onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                          placeholder={t('firstNamePlaceholder')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('lastName')}
                        </label>
                        <input
                          type="text"
                          value={contactInfo.lastName}
                          onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                          placeholder={t('lastNamePlaceholder')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phoneNumber')}
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                        placeholder={t('phonePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('emailAddress')}
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                        placeholder={t('emailPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('organization')}
                      </label>
                      <input
                        type="text"
                        value={contactInfo.organization}
                        onChange={(e) => setContactInfo({...contactInfo, organization: e.target.value})}
                        placeholder={t('organizationPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('website')}
                      </label>
                      <input
                        type="url"
                        value={contactInfo.url}
                        onChange={(e) => setContactInfo({...contactInfo, url: e.target.value})}
                        placeholder={t('websitePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A7AB5] focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={resetForm}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  {t('clearAllFields')}
                </button>
              </div>

              {/* QR Code Display Section */}
              <div className="flex flex-col items-center space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">{t('generatedQrCode')}</h2>

                {/* Style Picker */}
                <div className="w-full max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dots', label: 'Dots', icon: '●' },
                      { id: 'rounded', label: 'Rounded', icon: '▢' },
                      { id: 'classic', label: 'Classic', icon: '■' },
                      { id: 'diamond', label: 'Diamond', icon: '◆' },
                      { id: 'star', label: 'Star', icon: '✦' },
                      { id: 'stripe', label: 'Stripe', icon: '━' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setQrStyle(style.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                          qrStyle === style.id
                            ? 'border-[#1A7AB5] bg-blue-50 text-[#1A7AB5]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{style.icon}</span>
                        <span>{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-8 w-full max-w-sm">
                  {qrData ? (
                    <div className="text-center">
                      <div ref={qrContainerRef} className="flex justify-center">
                        {/* QR code will be dynamically inserted here */}
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        {t('scanQrCode')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {t('fillFormPrompt')}
                      </p>
                    </div>
                  )}
                </div>

                {qrData && (
                  <div className="flex gap-4 w-full max-w-sm">
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1A7AB5] to-[#145F8E] text-white rounded-xl hover:from-[#145F8E] hover:to-[#0F4A6E] transition-all duration-200 font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      {t('download')}
                    </button>
                    
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          {t('copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t('copyData')}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {qrData && (
                  <div className="w-full max-w-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{t('qrCodeData')}</h3>
                    <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 max-h-32 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-words">{qrData}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>{t('footerText')}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;