import React, { useEffect, useRef, useState } from "react";

export interface Tag {
    src: string;
    size?: number;
    phi?: number;
    theta?: number;
    x?: number;
    y?: number;
    z?: number;
    img?: HTMLImageElement;
}

interface GlobeTagCloudProps {
    tags: Tag[];
    height: number;
    width: number;
    rotationSpeed?: number;
}

const TagCloudCanvas: React.FC<GlobeTagCloudProps> = ({
    tags,
    height,
    width,
    rotationSpeed = 0.5
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [initializedTags, setInitializedTags] = useState<Tag[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const animationRef = useRef<number>(0);
    const rotationRef = useRef({
        x: -1,
        y: 1,
        angle: 0
    });

    useEffect(() => {
        const distributeOnGlobe = (index: number, total: number) => {
            const goldenRatio = (1 + Math.sqrt(5)) / 2;
            const i = index + 0.5;
            const phi = Math.acos(1 - 2 * i / total);
            const theta = 2 * Math.PI * i / goldenRatio;

            return {
                phi,
                theta,
                x: Math.cos(theta) * Math.sin(phi),
                y: Math.sin(theta) * Math.sin(phi),
                z: Math.cos(phi)
            };
        };

        const loadImages = async () => {
            try {
                const loadedTags = await Promise.all(
                    tags.map(async (tag, index) => {
                        const img = new Image();
                        img.src = tag.src;
                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                        });

                        const position = distributeOnGlobe(index, tags.length);
                        const baseSize = Math.min(width, height) * 0.08;

                        return {
                            ...tag,
                            img,
                            ...position,
                            size: tag.size ?? baseSize
                        };
                    })
                );
                setInitializedTags(loadedTags);
                setImagesLoaded(true);
            } catch (error) {
                console.error("Error loading images:", error);
            }
        };

        loadImages();
    }, [tags, width, height]);

    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const radius = Math.min(width, height) * 0.35;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.left + width / 2;
            const centerY = rect.top + height / 2;

            // Calculate direction from center to cursor
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Normalize and invert direction for natural feeling
                rotationRef.current.x = -dy / distance;
                rotationRef.current.y = -dx / distance;
            }
        };

        const handleMouseLeave = () => {
            // Reset to default diagonal spin
            rotationRef.current.x = -1;
            rotationRef.current.y = 1;
        };

        const drawTag = (
            ctx: CanvasRenderingContext2D,
            tag: Tag,
            x: number,
            y: number,
            scale: number
        ) => {
            if (!tag.img) return;

            ctx.save();
            ctx.translate(x, y);

            const size = tag.size! * (0.6 + scale * 0.4);
            const opacity = Math.pow(scale, 1.5);
            ctx.globalAlpha = Math.min(1, Math.max(0.2, opacity));

            ctx.drawImage(
                tag.img,
                -size / 2,
                -size / 2,
                size,
                size
            );
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.translate(width / 2, height / 2);

            rotationRef.current.angle += rotationSpeed * 0.01;

            const positions = initializedTags.map(tag => {
                const { x, y, z } = tag;
                const angle = rotationRef.current.angle;

                // Apply rotation based on current rotation axis
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const rx = rotationRef.current.x;
                const ry = rotationRef.current.y;

                // Rotate point around current axis
                const newX = (cos + rx * rx * (1 - cos)) * x! + (rx * ry * (1 - cos)) * y! + (ry * sin) * z!;
                const newY = (rx * ry * (1 - cos)) * x! + (cos + ry * ry * (1 - cos)) * y! - (rx * sin) * z!;
                const newZ = (-ry * sin) * x! + (rx * sin) * y! + cos * z!;

                const scale = (radius + newZ * radius) / (radius * 2);
                return {
                    tag,
                    x: newX * radius,
                    y: newY * radius,
                    z: newZ * radius,
                    scale
                };
            });

            positions.sort((a, b) => b.z - a.z);

            positions.forEach(({ tag, x, y, scale }) => {
                drawTag(ctx, tag, x, y, scale);
            });

            ctx.restore();
            animationRef.current = requestAnimationFrame(animate);
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [imagesLoaded, height, width, rotationSpeed]);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="bg-transparent"
            />
        </div>
    );
};

export default TagCloudCanvas;