
import React, { useEffect, useRef, useState } from "react";

// Interface to define the structure of a single tag
export interface Tag {
    src: string; // Image source URL
    size?: number; // Size of the tag
    angle?: number; // Initial angle for positioning
    phi?: number; // Vertical angle (latitude)
    theta?: number; // Horizontal angle (longitude)
    x?: number; // x-coordinate in 3D space
    y?: number; // y-coordinate in 3D space
    z?: number; // z-coordinate in 3D space
    speed?: number; // Speed of rotation
    img?: HTMLImageElement; // Loaded image element
}

// Interface to define the props for the TagCloudCanvas component
interface TagCloudProps {
    tags: Tag[]; // Array of tags to render
    height: number; // Height of the canvas
    width: number; // Width of the canvas
}

const TagCloudCanvas: React.FC<TagCloudProps> = ({ tags, height, width }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null); // Reference to the canvas element
    const [initializedTags, setInitializedTags] = useState<Tag[]>([]); // State to store processed tags
    const [imagesLoaded, setImagesLoaded] = useState(false); // State to track if images are loaded
    const animationRef = useRef<number>(0); // Reference to store animation frame ID

    useEffect(() => {
        // Function to distribute tags evenly on a sphere using the Fibonacci sphere algorithm
        const distributeOnSphere = (index: number, total: number) => {
            const phi = Math.acos(-1 + (2 * index) / total); // Calculate vertical angle
            const theta = Math.PI * (1 + Math.sqrt(5)) * index; // Calculate horizontal angle

            return {
                phi,
                theta,
                x: Math.cos(theta) * Math.sin(phi), // x-coordinate
                y: Math.sin(theta) * Math.sin(phi), // y-coordinate
                z: Math.cos(phi), // z-coordinate
            };
        };

        const loadImages = async () => {
            try {
                // Load images and distribute their positions
                const loadedTags = await Promise.all(
                    tags.map(async (tag, index) => {
                        const img = new Image();
                        img.src = tag.src;
                        await new Promise((resolve, reject) => {
                            img.onload = resolve; // Resolve when image loads
                            img.onerror = reject; // Reject on error
                        });

                        const position = distributeOnSphere(index, tags.length);

                        return {
                            ...tag,
                            img,
                            ...position,
                            size: Math.min(tag.size ?? 40, Math.min(width, height) * 0.15), // Normalize size
                            speed: 1, // Set rotation speed
                        };
                    })
                );
                setInitializedTags(loadedTags); // Update state with processed tags
                setImagesLoaded(true); // Mark images as loaded
            } catch (error) {
                console.error("Error loading images:", error);
            }
        };

        loadImages(); // Trigger image loading
    }, [tags, width, height]);

    useEffect(() => {
        if (!imagesLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const radius = Math.min(width, height) * 0.3; // Adjust radius for canvas size
        let rotationX = 0; // Current x-axis rotation
        let rotationY = 0; // Current y-axis rotation
        let targetRotationX = 0; // Target x-axis rotation
        let targetRotationY = 0; // Target y-axis rotation

        const handleMouseMove = (e: MouseEvent) => {
            // Calculate mouse position relative to the canvas center
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
            const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

            targetRotationX = mouseY * Math.PI * 0.5; // Map to rotation values
            targetRotationY = mouseX * Math.PI * 0.5;
        };

        canvas.addEventListener("mousemove", handleMouseMove); // Add mouse move listener

        const drawTag = (
            ctx: CanvasRenderingContext2D,
            tag: Tag,
            x: number,
            y: number,
            size: number,
            opacity: number
        ) => {
            if (!tag.img) return;

            ctx.save(); // Save canvas state
            ctx.translate(x, y); // Translate to the tag's position
            ctx.globalAlpha = opacity; // Set opacity

            const maxSize = Math.min(width, height) * 0.2; // Limit tag size
            const drawSize = Math.min(size, maxSize);

            ctx.drawImage(tag.img, -drawSize / 2, -drawSize / 2, drawSize, drawSize); // Draw tag
            ctx.restore(); // Restore canvas state
        };

        const animate = (timestamp: number) => {
            const time = timestamp * 0.001; // Convert timestamp to seconds

            ctx.clearRect(0, 0, width, height); // Clear canvas
            ctx.save(); // Save canvas state
            ctx.translate(width / 2, height / 2); // Move origin to canvas center

            // Smoothly interpolate rotations
            rotationX += (targetRotationX - rotationX) * 0.1;
            rotationY += (targetRotationY - rotationY) * 0.1;

            // Apply auto-rotation when no interaction
            if (Math.abs(targetRotationX) < 0.01 && Math.abs(targetRotationY) < 0.01) {
                rotationY += 0.005;
            }

            // Calculate 3D positions of tags and sort by depth (z-axis)
            const positions = initializedTags
                .map(tag => {
                    const phi = tag.phi ?? 0;
                    const theta = (tag.theta ?? 0) + time * 0.2;

                    const sinRotX = Math.sin(rotationX);
                    const cosRotX = Math.cos(rotationX);
                    const sinRotY = Math.sin(rotationY);
                    const cosRotY = Math.cos(rotationY);

                    const x = Math.cos(theta) * Math.sin(phi);
                    const y = Math.sin(theta) * Math.sin(phi);
                    const z = Math.cos(phi);

                    const x2 = x * cosRotY - z * sinRotY;
                    const z2 = x * sinRotY + z * cosRotY;
                    const y2 = y * cosRotX - z2 * sinRotX;
                    const z3 = y * sinRotX + z2 * cosRotX;

                    const scale = 0.6 + (radius / (radius + z3 * radius)) * 0.4;
                    const screenX = x2 * radius * scale;
                    const screenY = y2 * radius * scale;

                    return { tag, x: screenX, y: screenY, z: z3, scale };
                })
                .sort((a, b) => b.z - a.z);

            // Draw tags on the canvas
            positions.forEach(({ tag, x, y, scale }) => {
                const baseSize = tag.size ?? 40;
                const size = baseSize * (0.8 + scale * 0.2);
                const opacity = Math.max(0.4, Math.min(1, (scale - 0.6) * 2));

                drawTag(ctx, tag, x, y, size, opacity);
            });

            ctx.restore(); // Restore canvas state
            animationRef.current = requestAnimationFrame(animate); // Request next frame
        };

        animationRef.current = requestAnimationFrame(animate); // Start animation

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current); // Cancel animation on cleanup
            }
            canvas.removeEventListener("mousemove", handleMouseMove); // Remove listener
        };
    }, [initializedTags, imagesLoaded, height, width]);

    return (
        <div className="flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="bg-transparent cursor-move" // Canvas styles
            />
        </div>
    );
};

export default TagCloudCanvas;
