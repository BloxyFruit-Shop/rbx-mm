import type { GameTag, GameItemType, GrowAGardenType } from "~convex/types";
import CropSidebar from "./sidebar/crop-sidebar";
import PetSidebar from "./sidebar/pet-sidebar";
import EggSidebar from "./sidebar/egg-sidebar";
import GearSidebar from "./sidebar/gear-sidebar";

// Game-specific sidebar component mappings
const GAME_SIDEBAR_COMPONENTS = {
  GrowAGarden: {
    Crop: CropSidebar,
    Pet: PetSidebar,
    Egg: EggSidebar,
    Gear: GearSidebar,
  },
} as const;

interface SidebarDetailsProps<T extends GameTag> {
  gameTag: T;
  category: GameItemType<T>;
  type: GrowAGardenType;
  demand: string;
}

export default function SidebarDetails<T extends GameTag>({
  gameTag,
  category,
  type,
  demand,
}: SidebarDetailsProps<T>) {
  const gameComponents = GAME_SIDEBAR_COMPONENTS[gameTag];

  if (!gameComponents) {
    console.warn(`No sidebar components found for game: ${gameTag}`);
    return null;
  }

  const SidebarComponent =
    gameComponents[category as keyof typeof gameComponents];

  if (!SidebarComponent) {
    console.warn(`No sidebar component found for ${gameTag}:${category}`);
    return null;
  }

  // Type assertion to handle the complex discriminated union
  const Component = SidebarComponent as React.ComponentType<{
    type: GrowAGardenType;
    demand: string;
  }>;
  return <Component type={type} demand={demand} />;
}