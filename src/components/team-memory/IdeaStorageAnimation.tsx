import { motion } from "framer-motion";
import { Archive, Sparkles } from "lucide-react";

interface IdeaStorageAnimationProps {
  showSuccess: boolean;
}

export const IdeaStorageAnimation = ({ showSuccess }: IdeaStorageAnimationProps) => {
  return (
    <motion.div
      className="relative w-24 h-24 mx-auto"
      animate={showSuccess ? {
        scale: [1, 1.2, 1],
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Storage box */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg border-2 border-primary/50 flex items-center justify-center"
        animate={showSuccess ? {
          boxShadow: [
            "0 0 0px rgba(var(--primary), 0)",
            "0 0 20px rgba(var(--primary), 0.6)",
            "0 0 0px rgba(var(--primary), 0)"
          ]
        } : {}}
        transition={{ duration: 1 }}
      >
        <Archive className="w-12 h-12 text-primary" />
      </motion.div>

      {/* Success sparkles */}
      {showSuccess && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: Math.cos(i * Math.PI / 4) * 60,
                y: Math.sin(i * Math.PI / 4) * 60,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          ))}
        </>
      )}

      {/* Floating particles */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-primary/60 rounded-full"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                y: [0, -80 - Math.random() * 40],
                x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 80],
                opacity: [1, 0],
                scale: [1, 0]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.08,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
