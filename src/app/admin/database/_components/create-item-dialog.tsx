"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "~convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "~/lib/uploadthing";
import type { Doc, Id } from "~convex/_generated/dataModel";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: { sessionId: Id<"session"> } | null;
  games: Doc<"games">[];
}

interface ItemAttribute {
  type: "key-value" | "percentile" | "image-link" | "tag";
  title: string;
  content?: string | number;
  imageUrl?: string;
  link?: string;
}

export default function CreateItemDialog({ open, onOpenChange, session, games }: CreateItemDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gameId: "",
    thumbnailUrl: "",
    description: "",
    demand: "Medium",
    isObtainable: true,
    sellValue: "",
    buyPrice: "",
    category: "",
    rarity: "",
  });
  const [attributes, setAttributes] = useState<ItemAttribute[]>([]);

  const createItem = useMutation(api.items.createItem);

  const { startUpload, isUploading } = useUploadThing("itemImageUpload", {
    onUploadError: (e) => {
      const errorMessage = e.message === "Invalid config: InvalidFileType" 
        ? "Please select a valid image file (JPEG, PNG, or WebP)." 
        : e.message;
      toast.error("Upload failed. " + errorMessage);
    },
    onUploadBegin: () => {
      toast.loading("Uploading image, please wait...", {
        id: "loading-toast",
      });
    },
    onClientUploadComplete: (res) => {
      toast.dismiss("loading-toast");
      toast.success("Image uploaded successfully!");
      if (res?.[0]?.url) {
        setFormData(prev => ({ ...prev, thumbnailUrl: res[0].url }));
      }
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    await startUpload(selectedFiles);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      gameId: "",
      thumbnailUrl: "",
      description: "",
      demand: "Medium",
      isObtainable: true,
      sellValue: "",
      buyPrice: "",
      category: "",
      rarity: "",
    });
    setAttributes([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsCreating(true);
    try {
      const itemData = {
        name: formData.name,
        gameId: formData.gameId as Id<"games">,
        thumbnailUrl: formData.thumbnailUrl,
        description: formData.description ?? undefined,
        demand: formData.demand as any,
        isObtainable: formData.isObtainable,
        sellValue: formData.sellValue ? Number(formData.sellValue) : undefined,
        buyPrice: formData.buyPrice ? Number(formData.buyPrice) : undefined,
        category: formData.category as any,
        rarity: formData.rarity as any,
        attributes: attributes.map(attr => {
          if (attr.type === "percentile") {
            return {
              ...attr,
              content: Number(attr.content),
            };
          }
          return attr;
        }) as any,
        session: session.sessionId,
      };

      await createItem(itemData);
      toast.success(`Item "${formData.name}" created successfully`);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create item:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create item");
    } finally {
      setIsCreating(false);
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { type: "key-value", title: "", content: "" }]);
  };

  const updateAttribute = (index: number, field: keyof ItemAttribute, value: any) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: value };
    setAttributes(updated);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const renderAttributeContent = (attr: ItemAttribute, index: number) => {
    switch (attr.type) {
      case "key-value":
        return (
          <Input
            placeholder="Value"
            value={attr.content as string ?? ""}
            onChange={(e) => updateAttribute(index, "content", e.target.value)}
            className="bg-white/5 border-white/20"
          />
        );
      case "percentile":
        return (
          <Input
            type="number"
            placeholder="Percentage (0-100)"
            min="0"
            max="100"
            value={attr.content as number ?? ""}
            onChange={(e) => updateAttribute(index, "content", Number(e.target.value))}
            className="bg-white/5 border-white/20"
          />
        );
      case "image-link":
        return (
          <div className="space-y-2">
            <Input
              placeholder="Image URL"
              value={attr.imageUrl ?? ""}
              onChange={(e) => updateAttribute(index, "imageUrl", e.target.value)}
              className="bg-white/5 border-white/20"
            />
            <Input
              placeholder="Content"
              value={attr.content ?? ""}
              onChange={(e) => updateAttribute(index, "content", e.target.value)}
              className="bg-white/5 border-white/20"
            />
            <Input
              placeholder="Link URL (optional)"
              value={attr.link ?? ""}
              onChange={(e) => updateAttribute(index, "link", e.target.value)}
              className="bg-white/5 border-white/20"
            />
          </div>
        );
      case "tag":
        return null;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Item</DialogTitle>
          <DialogDescription className="text-white/70">
            Add a new item to the database. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name *</Label>
                <Input
                  id="name"
                  placeholder="Item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game" className="text-white">Game *</Label>
                <Select
                  value={formData.gameId}
                  onValueChange={(value) => setFormData({ ...formData, gameId: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game._id} value={game._id}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl" className="text-white">Thumbnail URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="thumbnailUrl"
                  placeholder="https://example.com/image.png"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="bg-white/5 border-white/20"
                  required
                />
                <label
                  htmlFor="upload-input"
                  className={
                    "flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors border rounded-md cursor-pointer border-white/20 bg-white/5 hover:bg-white/10 " +
                    (isUploading ? "cursor-progress" : "")
                  }
                >
                  {isUploading ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 animate-spin"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  ) : (
                    <Upload className="size-4" />
                  )}
                </label>
                <input
                  id="upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="sr-only"
                  disabled={isUploading}
                />
              </div>
              <p className="text-xs text-white/50">
                Upload an image file or enter a direct URL. Supported formats: JPEG, PNG, WebP.
              </p>
              {formData.thumbnailUrl && (
                <div className="p-4 border rounded-lg border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="object-cover w-16 h-16 rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Image Preview</p>
                      <p className="text-xs text-white/60 truncate">{formData.thumbnailUrl}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="Item description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/20"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Categories & Properties</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crop">Crop</SelectItem>
                    <SelectItem value="Pet">Pet</SelectItem>
                    <SelectItem value="Egg">Egg</SelectItem>
                    <SelectItem value="Gear">Gear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rarity" className="text-white">Rarity *</Label>
                <Select
                  value={formData.rarity}
                  onValueChange={(value) => setFormData({ ...formData, rarity: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Common">Common</SelectItem>
                    <SelectItem value="Uncommon">Uncommon</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Legendary">Legendary</SelectItem>
                    <SelectItem value="Mythical">Mythical</SelectItem>
                    <SelectItem value="Divine">Divine</SelectItem>
                    <SelectItem value="Prismatic">Prismatic</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demand" className="text-white">Demand</Label>
                <Select
                  value={formData.demand}
                  onValueChange={(value) => setFormData({ ...formData, demand: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Select demand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VeryLow">Very Low</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="VeryHigh">Very High</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sellValue" className="text-white">Sell Value</Label>
                <Input
                  id="sellValue"
                  type="number"
                  placeholder="0"
                  value={formData.sellValue}
                  onChange={(e) => setFormData({ ...formData, sellValue: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyPrice" className="text-white">Buy Price</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  placeholder="0"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                  className="bg-white/5 border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Obtainable</Label>
                <div className="flex items-center pt-2 space-x-2">
                  <Switch
                    checked={formData.isObtainable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isObtainable: checked })}
                  />
                  <span className="text-sm text-white/70">
                    {formData.isObtainable ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Attributes</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttribute}
                className="border-white/20 bg-white/5 hover:bg-white/10"
              >
                <Plus className="mr-2 size-4" />
                Add Attribute
              </Button>
            </div>

            {attributes.length === 0 ? (
              <p className="text-sm text-white/60">No attributes added yet.</p>
            ) : (
              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="p-4 border rounded-lg border-white/10 bg-white/5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="space-y-2 sm:pt-1">
                        <Label className="text-white">Type</Label>
                        <Select
                          value={attr.type}
                          onValueChange={(value) => updateAttribute(index, "type", value)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="key-value">Key-Value</SelectItem>
                            <SelectItem value="percentile">Percentile</SelectItem>
                            <SelectItem value="image-link">Image Link</SelectItem>
                            <SelectItem value="tag">Tag</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:pt-1">
                        <Label className="text-white">Title</Label>
                        <Input
                          placeholder="Attribute title"
                          value={attr.title}
                          onChange={(e) => updateAttribute(index, "title", e.target.value)}
                          className="bg-white/5 border-white/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-white">
                            {attr.type === "tag" ? "Content" : "Value"}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttribute(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        {renderAttributeContent(attr, index)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-white border-white/20 bg-white/5 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.name || !formData.gameId || !formData.thumbnailUrl || !formData.category || !formData.rarity}
              className="bg-gradient-to-r from-[#9747FF] to-[#7E3BFF] hover:from-[#8A42E6] hover:to-[#7139E6] text-white border-0"
            >
              {isCreating ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}