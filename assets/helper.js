function getFontFamily(sizeCode, weightStyle) {
  const sizeMap = { 1: '18', 2: '24', 3: '28' };
  const size = sizeMap[sizeCode];
  if (!size) throw new Error('Tamanho inválido');

  // Extrai peso e estilo do segundo parâmetro
  // peso é parte inteira (ex: 100, 700), estilo é se tem 10 a mais (ex: 110, 710 = italic)
  const weight = Math.floor(weightStyle / 10) * 10;
  const isItalic = weightStyle % 10 === 1;

  let fontStyle = '';
  switch (weight) {
    case 100:
      fontStyle = 'Thin';
      break;
    case 200:
      fontStyle = 'ExtraLight';
      break;
    case 300:
      fontStyle = 'Light';
      break;
    case 400:
      fontStyle = 'Regular';
      break;
    case 500:
      fontStyle = 'Medium';
      break;
    case 600:
      fontStyle = 'SemiBold';
      break;
    case 700:
      fontStyle = 'Bold';
      break;
    case 800:
      fontStyle = 'ExtraBold';
      break;
    case 900:
      fontStyle = 'Black';
      break;
    default:
      throw new Error('Peso inválido');
  }

  if (isItalic) fontStyle += 'Italic';

  return `Inter_${size}pt-${fontStyle}`;
}

export default getFontFamily;
