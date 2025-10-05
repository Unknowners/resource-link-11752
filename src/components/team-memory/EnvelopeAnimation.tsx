import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send } from "lucide-react";

interface EnvelopeAnimationProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose?: () => void;
}

export const EnvelopeAnimation = ({ isOpen, isSubmitting }: EnvelopeAnimationProps) => {
  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isSubmitting ? (
          <motion.div
            key="envelope-closed"
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Envelope base */}
            <motion.div
              className="relative w-32 h-24"
              animate={isOpen ? {
                rotateX: [0, -15, 0],
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Back of envelope */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg border-2 border-primary/30" />
              
              {/* Envelope flap */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-12 origin-top"
                style={{
                  background: "linear-gradient(to bottom, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.5))",
                  clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                  borderLeft: "2px solid hsl(var(--primary) / 0.3)",
                  borderRight: "2px solid hsl(var(--primary) / 0.3)",
                }}
                animate={isOpen ? {
                  rotateX: -180,
                  y: -10,
                } : {
                  rotateX: 0,
                  y: 0,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              
              {/* Mail icon */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={isOpen ? {
                  y: -20,
                  scale: 1.2,
                  opacity: 0.7
                } : {
                  y: 0,
                  scale: 1,
                  opacity: 1
                }}
                transition={{ duration: 0.6 }}
              >
                <Mail className="w-12 h-12 text-primary" />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="envelope-flying"
            initial={{ scale: 1, x: 0, y: 0, rotate: 0 }}
            animate={{
              scale: [1, 0.8, 0.5, 0.3, 0],
              x: [0, 100, 200, 300, 400],
              y: [0, -50, -80, -100, -120],
              rotate: [0, 15, 30, 45, 60],
              opacity: [1, 1, 0.8, 0.5, 0]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="absolute"
          >
            <div className="relative w-32 h-24">
              {/* Flying envelope */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg border-2 border-primary/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Send className="w-12 h-12 text-primary" />
              </div>
              
              {/* Trail effect */}
              <motion.div
                className="absolute right-full top-1/2 h-1 bg-primary/30"
                animate={{
                  width: [0, 50, 100, 150],
                  opacity: [0, 1, 0.5, 0]
                }}
                transition={{ duration: 1.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkles when submitting */}
      <AnimatePresence>
        {isSubmitting && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1.5 h-1.5 bg-primary rounded-full"
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos(i * Math.PI / 3) * 100,
                  y: Math.sin(i * Math.PI / 3) * 100 - 60,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
