import FontFaceObserver from 'fontfaceobserver'
import { map, values } from 'lodash/fp'

import './fonts.css'

export const FontNames = {
  Map: 'Nova Mono',
  Panel: 'VT323',
  Runic: 'Nova Mono',
  Title: 'VT323',
}

export const loadFonts = async () => {
  const fontNames = values(FontNames)
  await Promise.all(map((font) => new FontFaceObserver(font, {}).load(), fontNames))
}
