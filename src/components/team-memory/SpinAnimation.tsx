import { motion } from "framer-motion";
import { Sparkles, Lightbulb } from "lucide-react";

interface SpinAnimationProps {
  isSpinning: boolean;
}

export const SpinAnimation = ({ isSpinning }: SpinAnimationProps) => {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-8 border-primary/20"
        animate={isSpinning ? { rotate: 360 } : {}}
        transition={{
          duration: 2,
          repeat: isSpinning ? Infinity : 0,
          ease: "linear"
        }}
      />
      
      {/* Middle spinning ring */}
      <motion.div
        className="absolute inset-4 rounded-full border-4 border-primary/40"
        animate={isSpinning ? { rotate: -360 } : {}}
        transition={{
          duration: 1.5,
          repeat: isSpinning ? Infinity : 0,
          ease: "linear"
        }}
      />
      
      {/* Inner circle with slot machine effect */}
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center shadow-lg"
        animate={isSpinning ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 0.5,
          repeat: isSpinning ? Infinity : 0,
        }}
      >
        {isSpinning ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="w-16 h-16 text-primary" />
          </motion.div>
        ) : (
          <Lightbulb className="w-16 h-16 text-primary" />
        )}
      </motion.div>

      {/* Floating sparkles around */}
      {isSpinning && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [0, Math.cos(i * Math.PI / 4) * 150],
                y: [0, Math.sin(i * Math.PI / 4) * 150],
                opacity: [1, 0],
                scale: [1, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};
