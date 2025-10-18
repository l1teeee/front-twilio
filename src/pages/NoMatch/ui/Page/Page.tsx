import { FC } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NoMatch: FC = () => {
  return (
      <section>
        <div className="bg-black flex min-h-screen w-screen flex-col items-center justify-center gap-y-5">
          {/* Animated 404 text */}
          <motion.h1
              className="bg-gradient-to-l from-primary-content via-secondary to-primary bg-clip-text text-9xl font-bold text-transparent"
              initial={{ opacity: 0, scale: 0.5, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
          >
            404
          </motion.h1>

          {/* Animated subtitle */}
          <motion.p
              className="text-3xl font-medium text-neutral"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: "easeOut"
              }}
          >
            Page not found
          </motion.p>

          {/* Animated button */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.6,
                ease: "easeOut"
              }}
          >
            <Link className="btn-primary-content btn px-16" to="/">
              <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Go back
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>
  );
};

export default NoMatch;