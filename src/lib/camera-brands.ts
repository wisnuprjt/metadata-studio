
import * as SimpleIcons from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export type CameraBrand = {
  id: string;
  name: string;
  logo: SimpleIcon | null;
  aliases: string[];
};

const icons = SimpleIcons as unknown as Record<
  string,
  SimpleIcon | undefined
>;

function getLogo(exportName: string): SimpleIcon | null {
  return icons[exportName] ?? null;
}

export const CAMERA_BRANDS: CameraBrand[] = [
  // SMARTPHONE BRANDS
  {
    id: "apple",
    name: "Apple",
    logo: getLogo("siApple"),
    aliases: ["apple", "apple inc", "apple computer"],
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: getLogo("siSamsung"),
    aliases: ["samsung", "samsung electronics"],
  },
  {
    id: "google",
    name: "Google",
    logo: getLogo("siGoogle"),
    aliases: ["google", "google llc", "google pixel"],
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    logo: getLogo("siXiaomi"),
    aliases: ["xiaomi", "xiaomi communications"],
  },
  {
    id: "huawei",
    name: "Huawei",
    logo: getLogo("siHuawei"),
    aliases: ["huawei", "huawei technologies"],
  },
  {
    id: "oppo",
    name: "OPPO",
    logo: getLogo("siOppo"),
    aliases: ["oppo", "guangdong oppo"],
  },
  {
    id: "vivo",
    name: "Vivo",
    logo: getLogo("siVivo"),
    aliases: ["vivo", "vivo mobile"],
  },
  {
    id: "oneplus",
    name: "OnePlus",
    logo: getLogo("siOneplus"),
    aliases: ["oneplus", "one plus"],
  },
  {
    id: "honor",
    name: "HONOR",
    logo: getLogo("siHonor"),
    aliases: ["honor", "honor device"],
  },
  {
    id: "motorola",
    name: "Motorola",
    logo: getLogo("siMotorola"),
    aliases: ["motorola", "motorola mobility"],
  },
  {
    id: "asus",
    name: "ASUS",
    logo: getLogo("siAsus"),
    aliases: ["asus", "asus computer"],
  },

  // MAJOR CAMERA BRANDS
  {
    id: "sony",
    name: "Sony",
    logo: getLogo("siSony"),
    aliases: ["sony", "sony corporation", "sony imaging products"],
  },
  {
    id: "canon",
    name: "Canon",
    logo: getLogo("siCanon"),
    aliases: ["canon", "canon inc", "canon inc."],
  },
  {
    id: "nikon",
    name: "Nikon",
    logo: getLogo("siNikon"),
    aliases: ["nikon", "nikon corporation", "nikon corp"],
  },
  {
    id: "fujifilm",
    name: "Fujifilm",
    logo: getLogo("siFujifilm"),
    aliases: [
      "fujifilm",
      "fuji film",
      "fuji photo film",
      "fujifilm corporation",
      "fuji xerox",
    ],
  },
  {
    id: "panasonic",
    name: "Panasonic / Lumix",
    logo: getLogo("siPanasonic"),
    aliases: [
      "panasonic",
      "panasonic corporation",
      "lumix",
    ],
  },
  {
    id: "om-system",
    name: "OM System / Olympus",
    logo: getLogo("siOlympus"),
    aliases: [
      "om digital solutions",
      "om system",
      "olympus",
      "olympus corporation",
    ],
  },
  {
    id: "leica",
    name: "Leica",
    logo: getLogo("siLeica"),
    aliases: ["leica", "leica camera ag"],
  },
  {
    id: "hasselblad",
    name: "Hasselblad",
    logo: getLogo("siHasselblad"),
    aliases: ["hasselblad", "victor hasselblad"],
  },
  {
    id: "pentax",
    name: "Pentax",
    logo: getLogo("siPentax"),
    aliases: ["pentax", "pentax ricoh imaging"],
  },
  {
    id: "ricoh",
    name: "Ricoh",
    logo: getLogo("siRicoh"),
    aliases: ["ricoh", "ricoh company"],
  },
  {
    id: "sigma",
    name: "Sigma",
    logo: getLogo("siSigma"),
    aliases: ["sigma", "sigma corporation"],
  },
  {
    id: "kodak",
    name: "Kodak",
    logo: getLogo("siKodak"),
    aliases: ["kodak", "eastman kodak"],
  },
  {
    id: "casio",
    name: "Casio",
    logo: getLogo("siCasio"),
    aliases: [
      "casio",
      "casio computer",
      "casio computer co",
      "casio computer co ltd",
      "casio computer co.,ltd",
    ],
  },
  {
    id: "gopro",
    name: "GoPro",
    logo: getLogo("siGopro"),
    aliases: ["gopro", "gopro inc"],
  },
  {
    id: "dji",
    name: "DJI",
    logo: getLogo("siDji"),
    aliases: ["dji", "sz dji technology"],
  },
  {
    id: "phase-one",
    name: "Phase One",
    logo: getLogo("siPhaseone"),
    aliases: ["phase one", "phaseone"],
  },
];

// Normalize EXIF manufacturer strings
function normalizeMake(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function identifyCameraBrand(make?: string | null) {
  if (!make?.trim()) return null;

  const normalizedMake = normalizeMake(make);

  return (
    CAMERA_BRANDS.find((brand) =>
      brand.aliases.some((alias) => {
        const normalizedAlias = normalizeMake(alias);

        return (
          normalizedMake === normalizedAlias ||
          normalizedMake.startsWith(normalizedAlias)
        );
      })
    ) ?? null
  );
}
