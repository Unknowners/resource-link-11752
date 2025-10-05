import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, RotateCw } from "lucide-react";

interface SlotMachineProps {
  items: string[];
  onResult?: (item: string) => void;
  spinning?: boolean;
}

export const SlotMachine = ({ items, onResult, spinning: externalSpinning }: SlotMachineProps) => {
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Create extended list for smooth scrolling effect
  const extendedItems = [...items, ...items, ...items];

  useEffect(() => {
    if (externalSpinning !== undefined) {
      if (externalSpinning && !spinning) {
        spin();
      }
    }
  }, [externalSpinning]);

  const spin = useCallback(() => {
    if (spinning || items.length === 0) return;

    setSpinning(true);
    setHasSpun(true);
    const duration = 3000 + Math.random() * 1000; // 3-4 seconds
    const startTime = Date.now();
    
    // Final result
    const finalIndex = Math.floor(Math.random() * items.length);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      // Calculate position with deceleration
      const totalRotations = 5; // Number of full rotations
      const totalItems = items.length;
      const currentPosition = (totalRotations * totalItems + finalIndex) * easeOut;
      
      const displayIndex = Math.floor(currentPosition) % totalItems;
      setSelectedIndex(displayIndex);

      if (reelRef.current) {
        const itemHeight = 120;
        const offset = (currentPosition % totalItems) * itemHeight;
        reelRef.current.style.transform = `translateY(-${offset}px)`;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        if (onResult) {
          onResult(items[finalIndex]);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [items, onResult, spinning]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10">
      <div className="space-y-4">
        {/* Slot Machine Display */}
        <div className="relative mx-auto w-full max-w-md">
          {/* Top Shadow/Fade */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          
          {/* Reel Container */}
          <div className="relative h-[120px] overflow-hidden rounded-xl border-4 border-primary/20 bg-gradient-to-br from-background to-secondary/20 shadow-2xl">
            {/* Selection Indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-full h-[120px] border-y-4 border-primary/40 bg-primary/5 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Items Reel */}
            <div
              ref={reelRef}
              className="transition-transform"
              style={{
                willChange: 'transform',
              }}
            >
              {extendedItems.map((item, index) => (
                <div
                  key={index}
                  className="h-[120px] flex items-center justify-center px-4 text-center"
                  style={{
                    opacity: spinning ? 0.7 : index % items.length === selectedIndex ? 1 : 0.4,
                  }}
                >
                  <p className="text-xl font-bold line-clamp-2">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Shadow/Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

          {/* Decorative Elements */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Spin Button */}
        <div className="flex justify-center">
          <Button
            onClick={spin}
            disabled={spinning || items.length === 0}
            size="lg"
            className="relative overflow-hidden group px-8 py-6 text-lg font-bold shadow-lg hover:shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2">
              <RotateCw className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`} />
              {spinning ? 'Обертається...' : 'Крутити!'}
            </span>
          </Button>
        </div>

        {/* Current Selection Display */}
        {!spinning && hasSpun && items.length > 0 && (
          <div className="text-center animate-fade-in">
            <p className="text-sm text-muted-foreground mb-1">Вибрано:</p>
            <p className="text-lg font-bold text-primary">{items[selectedIndex]}</p>
          </div>
        )}
      </div>
    </Card>
  );
};