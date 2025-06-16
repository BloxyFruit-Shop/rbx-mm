"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import ItemGrid from "~/components/stock/item-grid";
import ItemSidebar from "~/components/stock/item-sidebar";
import ItemStock from "~/components/stock/item-stock";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import type { AttributedItem } from "~convex/types";

const ItemsClient = memo(function ItemsClient() {
  const [selectedItem, setSelectedItem] = useState<
    AttributedItem | undefined
  >();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if we're on desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const handleItemSelect = useCallback(
    (item: AttributedItem) => {
      setSelectedItem(item);
      // Only open sidebar on desktop, drawer on mobile
      if (isDesktop) {
        setSidebarOpen(true);
      } else {
        setMobileDrawerOpen(true);
      }
    },
    [isDesktop],
  );

  const handleCloseSidebar = useCallback(() => {
    setSelectedItem(undefined);
    setSidebarOpen(false);
  }, []);

  const handleCloseMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <ItemStock />

        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleSidebar}
                className="ml-auto"
              >
                {sidebarOpen ? (
                  <>
                    <PanelRightClose className="size-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="size-4" />
                    Show Details
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {sidebarOpen
                  ? "Hide item details panel"
                  : "Show item details panel"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="relative flex gap-6">
          <div
            className={sidebarOpen ? "flex-1" : "w-full"}
          >
            <ItemGrid onItemSelect={handleItemSelect} />
          </div>

          {sidebarOpen && (
            <div className="hidden lg:block">
              <div className="sticky top-24 h-fit">
                <ItemSidebar
                  selectedItem={selectedItem}
                  onClose={handleCloseSidebar}
                />
              </div>
            </div>
          )}
        </div>

        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerContent className="border-white/10 bg-gradient-to-b from-[#0f051d] to-[#1a0b2e]">
            <DrawerHeader className="sr-only">
              <DrawerTitle>Item Details</DrawerTitle>
            </DrawerHeader>
            <div className="h-full max-h-[80vh] overflow-y-auto">
              <ItemSidebar
                selectedItem={selectedItem}
                onClose={handleCloseMobileDrawer}
                className="w-full"
                variant="minimal"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </TooltipProvider>
  );
});

export default ItemsClient;
