import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const srcImg = join(root, 'resources', 'app-icon.png')
const outDir = join(root, 'build')
const outIco = join(outDir, 'icon.ico')

const SIZES = [16, 24, 32, 48, 64, 128, 256]

if (!existsSync(srcImg)) {
  console.error('Icône source introuvable :', srcImg)
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })

// Chaque taille est générée en PNG (fit:'cover' => remplit 100 % le carré, sans marge).
const frames = await Promise.all(
  SIZES.map(async (size) => {
    const png = await sharp(srcImg)
      .resize(size, size, { fit: 'cover' })
      .ensureAlpha()
      .png({ compressionLevel: 9 })
      .toBuffer()
    return { size, png }
  })
)

/**
 * Construit un fichier .ico dont chaque image est une frame PNG.
 * Windows Vista+ (donc 10/11) lit les icônes PNG pour toutes les tailles.
 * On évite ainsi le rendu « rayé » des entrées BMP non compressées.
 */
function buildIco(frames) {
  const count = frames.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // réservé
  header.writeUInt16LE(1, 2) // type 1 = icône
  header.writeUInt16LE(count, 4)

  const dir = Buffer.alloc(count * 16)
  let offset = 6 + count * 16
  frames.forEach((f, i) => {
    const e = i * 16
    dir[e] = f.size >= 256 ? 0 : f.size // largeur (0 = 256)
    dir[e + 1] = f.size >= 256 ? 0 : f.size // hauteur (0 = 256)
    dir[e + 2] = 0 // palette
    dir[e + 3] = 0 // réservé
    dir.writeUInt16LE(1, e + 4) // plans
    dir.writeUInt16LE(32, e + 6) // bits par pixel
    dir.writeUInt32LE(f.png.length, e + 8) // taille des données
    dir.writeUInt32LE(offset, e + 12) // décalage des données
    offset += f.png.length
  })

  return Buffer.concat([header, dir, ...frames.map((f) => f.png)])
}

writeFileSync(outIco, buildIco(frames))
console.log('OK →', outIco)
