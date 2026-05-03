import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 8
    },
    in: {
        opacity: 1,
        y: 0
    },
    out: {
        opacity: 0,
        y: -8
    }
};

const pageTransition = {
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1.0],
    duration: 0.4
};

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
