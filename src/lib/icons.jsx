import { GiCorn, GiCottonFlower, GiFallingLeaf, GiOlive, GiPeach, GiPlantSeed, GiSeedling, GiTomato, GiWheat } from 'react-icons/gi'
import { LuCherry, LuCitrus, LuFlower, LuFlower2, LuGrape, LuLeaf, LuScissors, LuSprout, LuWheat } from 'react-icons/lu'

// Icon keys used by `icon` in src/data/crop-calendar.json.
const CROP_ICONS = {
  sprout: LuSprout,
  wheat: LuWheat,
  'wheat-harvest': GiWheat,
  seed: GiPlantSeed,
  seedling: GiSeedling,
  corn: GiCorn,
  tomato: GiTomato,
  cotton: GiCottonFlower,
  citrus: LuCitrus,
  flower: LuFlower2,
  blossom: LuFlower,
  grape: LuGrape,
  scissors: LuScissors,
  leaf: LuLeaf,
  'leaf-fall': GiFallingLeaf,
  cherry: LuCherry,
  olive: GiOlive,
  peach: GiPeach,
}

export function PhaseIcon({ name, ...props }) {
  const Icon = CROP_ICONS[name] ?? LuSprout
  return <Icon aria-hidden {...props} />
}
