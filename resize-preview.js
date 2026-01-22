import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = path.join(__dirname, 'public', 'cha-casa-nova-preview.png');
const outputPath = path.join(__dirname, 'public', 'cha-casa-nova-preview-og.png');

// Dimensões recomendadas para Open Graph (WhatsApp, Facebook, etc.)
const WIDTH = 1200;
const HEIGHT = 630;

async function resizeImage() {
  try {
    await sharp(inputPath)
      .resize(WIDTH, HEIGHT, {
        fit: 'cover', // Preenche mantendo proporção, cortando se necessário
        position: 'center' // Centraliza a imagem ao cortar
      })
      .png({ quality: 90 })
      .toFile(outputPath);

    console.log(`Imagem redimensionada com sucesso!`);
    console.log(`Dimensões: ${WIDTH}x${HEIGHT}`);
    console.log(`Salva em: ${outputPath}`);
  } catch (error) {
    console.error('Erro ao redimensionar:', error.message);
  }
}

resizeImage();
