import type { GameTag, GameItemType, GrowAGardenType } from "~convex/types";
import CropDetails from "./details/crop-details";
import PetDetails from "./details/pet-details";
import EggDetails from "./details/egg-details";
import GearDetails from "./details/gear-details";

const GAME_DETAIL_COMPONENTS = {
  GrowAGarden: {
    Crop: CropDetails,
    Pet: PetDetails,
    Egg: EggDetails,
    Gear: GearDetails,
  },
} as const;

interface DetailsProps<T extends GameTag> {
  gameTag: T;
  category: GameItemType<T>;
  type: GrowAGardenType;
}

export default function Details<T extends GameTag>({
  gameTag,
  category,
  type,
}: DetailsProps<T>) {
  const gameComponents = GAME_DETAIL_COMPONENTS[gameTag];

  if (!gameComponents) {
    console.warn(`No detail components found for game: ${gameTag}`);
    return null;
  }

  const DetailComponent =
    gameComponents[category as keyof typeof gameComponents];

  if (!DetailComponent) {
    console.warn(`No detail component found for ${gameTag}:${category}`);
    return null;
  }

  // Type assertion to handle the complex discriminated union
  const Component = DetailComponent as React.ComponentType<{ type: GrowAGardenType }>;
  return <Component type={type} />;
}
