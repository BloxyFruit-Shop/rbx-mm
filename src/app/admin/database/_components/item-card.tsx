"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Tag,
} from "lucide-react";
import EditItemDialog from "./edit-item-dialog";
import ViewItemDialog from "./view-item-dialog";
import { toast } from "sonner";
import type { Doc, Id } from "~convex/_generated/dataModel";

interface ItemCardProps {
  item: Doc<"items">;
  session: { sessionId: Id<"session"> };
  games: Doc<"games">[];
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Common":
      return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-300";
    case "Uncommon":
      return "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300";
    case "Rare":
      return "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300";
    case "Epic":
      return "from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-300";
    case "Legendary":
      return "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-300";
    case "Mythical":
      return "from-red-500/20 to-pink-500/20 border-red-500/30 text-red-300";
    case "Divine":
      return "from-yellow-500/20 to-gold-500/20 border-yellow-500/30 text-yellow-300";
    case "Prismatic":
      return "from-rainbow-500/20 to-rainbow-600/20 border-rainbow-500/30 text-rainbow-300";
    default:
      return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-300";
  }
};

const getDemandIcon = (demand: string) => {
  switch (demand) {
    case "VeryHigh":
      return <TrendingUp className="text-red-400 size-3" />;
    case "High":
      return <TrendingUp className="text-orange-400 size-3" />;
    case "Medium":
      return <Minus className="text-yellow-400 size-3" />;
    case "Low":
      return <TrendingDown className="text-blue-400 size-3" />;
    case "VeryLow":
      return <TrendingDown className="text-gray-400 size-3" />;
    default:
      return <Minus className="text-gray-400 size-3" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Pet":
      return "🐾";
    case "Crop":
      return "🌱";
    case "Egg":
      return "🥚";
    case "Gear":
      return "⚙️";
    default:
      return "📦";
  }
};

export default function ItemCard({ item, session, games }: ItemCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItem = useMutation(api.items.deleteItem);

  const game = games.find(g => g._id === item.gameId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem({
        itemId: item._id,
        session: session.sessionId,
      });
      toast.success(`Item "${item.name}" deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden transition-all duration-300 border rounded-lg group sm:rounded-xl border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:border-white/20 hover:from-white/10 hover:to-white/15">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/placeholder-item.png";
            }}
          />
          
          <div className="absolute top-2 left-2">
            <Badge className={`text-xs bg-gradient-to-r ${getRarityColor(item.rarity)} backdrop-blur-sm`}>
              {item.rarity}
            </Badge>
          </div>

          <div className="absolute transition-opacity duration-200 opacity-0 top-2 right-2 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                >
                  <MoreVertical className="text-white size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setViewDialogOpen(true)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 size-4" />
                  Edit Item
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-400 focus:text-red-400"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-black/50 backdrop-blur-sm text-white/80">
              <span>{getCategoryIcon(item.category)}</span>
              <span>{item.category}</span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-white sm:text-base line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-white/60">
                {game?.name ?? "Unknown Game"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {item.sellValue !== undefined && (
                <div className="flex items-center gap-1 text-green-400">
                  <DollarSign className="size-3" />
                  <span>Sell: {item.sellValue}</span>
                </div>
              )}
              {item.buyPrice !== undefined && (
                <div className="flex items-center gap-1 text-blue-400">
                  <DollarSign className="size-3" />
                  <span>Buy: {item.buyPrice}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-white/60">
                {getDemandIcon(item.demand)}
                <span>{item.demand}</span>
              </div>
              {item.isObtainable !== undefined && (
                <div className="flex items-center gap-1">
                  <div className={`size-2 rounded-full ${item.isObtainable ? "bg-green-400" : "bg-red-400"}`} />
                  <span className="text-white/60">
                    {item.isObtainable ? "Obtainable" : "Unobtainable"}
                  </span>
                </div>
              )}
            </div>

            {item.attributes.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-white/60">
                <Tag className="size-3" />
                <span>{item.attributes.length} attribute{item.attributes.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={item}
        game={game}
      />

      <EditItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={item}
        session={session}
        games={games}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Item</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white border-white/20 bg-white/5 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-white bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}