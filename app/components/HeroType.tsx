"use client";
import React, { useRef, useState } from "react";
import Typewriter from "typewriter-effect";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site"; // Adjust the import path as necessary

// const website = siteConfig.hero.url;
const website = "nolangerald.com/";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25, // Delay between each child animation
    },
  },
};

const childVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

interface HeroTypeProps {
  startTyping?: boolean;
  onTypingComplete?: () => void;
}

const HeroType: React.FC<HeroTypeProps> = ({ startTyping = false }) => {
  const [typewriterInstance, setTypewriterInstance] = useState<any>(null);
  const [isAnimationTriggered, setIsAnimationTriggered] =
    useState<boolean>(false);
  const [showCursor, setShowCursor] = useState<boolean>(false);
  const router = useRouter();

  // Start typing when startTyping prop becomes true
  React.useEffect(() => {
    if (startTyping && typewriterInstance && !isAnimationTriggered) {
      setShowCursor(true);
      typewriterInstance
        .typeString(website)
        .callFunction(() => {
          setIsAnimationTriggered(true);
        })
        .start();
    }
  }, [startTyping, typewriterInstance, isAnimationTriggered]);

  const heroExit = (slug: string) => {
    const modifiedSlug = slug.substring(1); // Remove the first character
    if (typewriterInstance) {
      typewriterInstance
        .typeString(modifiedSlug) // Use modifiedSlug here
        .callFunction(() => {
          setIsAnimationTriggered(true);
        })
        .start();
    }
    // Calculate total typing time in milliseconds (add buffer for last character)
    const totalTypingTime = (100 * modifiedSlug.length) + 150; // Extra 150ms buffer
      // console.log("Deletion Time:" + totalDeletionTime);
      // console.log("Modified Slug:" + modifiedSlug);
      // console.log("Slug:" + slug);
      // console.log("slug length:" + slug.length);
    // Use setTimeout to delay navigation to the specified slug
    setTimeout(() => {
      router.push(`${modifiedSlug}`); // Use modifiedSlug here
    }, totalTypingTime);
  };

  return (
    <div className="flex flex-col justify-center items-center ">
      <h1 className="text-2xl xs:text-2xl md:text-4xl ">
        <span className="invisible">_</span>
        <div style={{ visibility: showCursor ? 'visible' : 'hidden' }}>
          <Typewriter
            onInit={(typewriter) => {
              setTypewriterInstance(typewriter);
            }}
            options={{
              deleteSpeed: siteConfig.hero.deletionSpeed,
              cursor: "_",
              
            }}
          />
        </div>
      </h1>
      <div className="fade-div">
        <motion.div
          className="py-5 hover:cursor-pointer"
          variants={containerVariants}
          initial="hidden"
          animate={isAnimationTriggered ? "visible" : "hidden"}
        >
          {siteConfig.pages.slice(1).map((page, index) => (
            <React.Fragment key={index}>
              <motion.button
                onClick={() => heroExit(page.slug)}
                className={` text-foreground/60 hover:text-primary fade-in-button${index + 1}`}
                variants={childVariants}
              >
                {page.slug.substring(1).toLowerCase()}
              </motion.button>
              {index < siteConfig.pages.length - 2 && ( // Add a pipe after each button except the last one
                <motion.span
                  className={`hover:cursor-default fade-in-pipe${index + 1}`}
                  variants={childVariants}
                  style={{ margin: `0 ${siteConfig.hero.pipeSpacing}px` }}
                >
                  {" "}
                  |
                </motion.span>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroType;