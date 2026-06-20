import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Solusi pengganti __dirname untuk ES Modules (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild() {
  try {
    console.log('🚀 Memulai proses build untuk @workspace/oki-care...');
    
    await build({
      configFile: resolve(__dirname, '../vite.config.ts'), 
    });

    console.log('✅ Build @workspace/oki-care selesai dengan sukses!');
  } catch (error) {
    console.error('❌ Build gagal:', error);
    process.exit(1);
  }
}

runBuild();