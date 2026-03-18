"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type GalleryImage = { url: string; alt?: string | null };

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(-1);
  if (!images.length) return null;

  return (
    <>
      <button className="relative block aspect-[16/9] w-full overflow-hidden rounded-[var(--radius)]" onClick={() => setIndex(0)}>
        <Image src={images[0].url} alt={images[0].alt ?? "Property"} fill sizes="(max-width: 1024px) 100vw, 75vw" quality={85} className="object-cover" />
      </button>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.slice(0, 4).map((image, idx) => (
          <button key={image.url} className="relative aspect-[4/3] overflow-hidden rounded-lg" onClick={() => setIndex(idx)}>
            <Image src={image.url} alt={image.alt ?? "Gallery"} fill sizes="(max-width: 768px) 25vw, 12vw" quality={55} className="object-cover" />
          </button>
        ))}
      </div>
      <Lightbox open={index >= 0} close={() => setIndex(-1)} index={index} slides={images.map((img) => ({ src: img.url, alt: img.alt ?? "Gallery" }))} />
    </>
  );
}
