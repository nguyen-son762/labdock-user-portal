"use client";

import { ArrowLeft, ArrowRight } from "iconsax-reactjs";
import Image from "next/image";
import { useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Button } from "@/components/ui/button";
import { useCarouselAutoplay } from "@/components/ui/use-carousel-autoplay";
import { cn } from "@/lib/class-names";

import type { Testimonial } from "../home.types";

import "swiper/css";

const starPath =
  "M6.9347 0.77997C6.96391 0.720944 7.00904 0.671258 7.065 0.63652C7.12095 0.601782 7.1855 0.583374 7.25136 0.583374C7.31722 0.583374 7.38177 0.601782 7.43773 0.63652C7.49368 0.671258 7.53881 0.720944 7.56803 0.77997L9.10803 3.8993C9.20948 4.10461 9.35924 4.28224 9.54445 4.41694C9.72965 4.55164 9.94478 4.63938 10.1714 4.67264L13.6154 5.17664C13.6806 5.18609 13.7419 5.21362 13.7924 5.2561C13.8428 5.29859 13.8803 5.35434 13.9007 5.41704C13.9211 5.47975 13.9235 5.54691 13.9078 5.61093C13.892 5.67495 13.8586 5.73327 13.8114 5.7793L11.3207 8.20464C11.1564 8.3647 11.0335 8.56229 10.9626 8.78039C10.8916 8.99849 10.8747 9.23056 10.9134 9.45664L11.5014 12.8833C11.5129 12.9485 11.5058 13.0157 11.481 13.0771C11.4562 13.1385 11.4146 13.1917 11.3611 13.2306C11.3075 13.2696 11.244 13.2926 11.1779 13.2972C11.1119 13.3018 11.0458 13.2878 10.9874 13.2566L7.9087 11.638C7.70584 11.5315 7.48015 11.4758 7.25103 11.4758C7.02191 11.4758 6.79622 11.5315 6.59336 11.638L3.51536 13.2566C3.45692 13.2876 3.39096 13.3015 3.325 13.2968C3.25903 13.2921 3.19571 13.269 3.14223 13.2301C3.08874 13.1912 3.04725 13.1381 3.02247 13.0768C2.99768 13.0155 2.9906 12.9484 3.00203 12.8833L3.58936 9.4573C3.62816 9.23112 3.61135 8.9989 3.54039 8.78067C3.46942 8.56243 3.34643 8.36474 3.18203 8.20464L0.691363 5.77997C0.643758 5.73399 0.610025 5.67557 0.594004 5.61135C0.577984 5.54714 0.580321 5.47971 0.600748 5.41676C0.621176 5.35381 0.658874 5.29786 0.709547 5.25529C0.76022 5.21272 0.821832 5.18524 0.887362 5.17597L4.3307 4.67264C4.55753 4.63964 4.77295 4.55201 4.95842 4.41729C5.14388 4.28258 5.29383 4.10482 5.39536 3.8993L6.9347 0.77997Z";

export function TestimonialCarousel({ testimonials }: { testimonials: readonly Testimonial[] }) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  useCarouselAutoplay(swiper);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const updateActiveIndex = (instance: SwiperInstance) => {
    setActiveIndex(instance.realIndex);
  };
  const updateOverflow = (instance: SwiperInstance) => setIsLocked(instance.isLocked);

  return (
    <div>
      <Swiper
        modules={[A11y, Autoplay]}
        slidesPerView="auto"
        spaceBetween={20}
        watchOverflow
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        a11y={{ containerMessage: "Research leader testimonials" }}
        onSwiper={(instance) => {
          setSwiper(instance);
          updateOverflow(instance);
        }}
        onLock={updateOverflow}
        onUnlock={updateOverflow}
        onResize={updateOverflow}
        onSlideChange={updateActiveIndex}
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide key={testimonial.id} className="!h-auto !w-[min(300px,100%)]">
            <article className="flex h-full flex-col gap-2 overflow-hidden rounded-xl bg-white p-[5px] ring-1 ring-[#ecf0f3]">
              <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-lg bg-[#edf1f4]">
                {testimonial.profileImageUrl ? (
                  <Image
                    src={testimonial.profileImageUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 300px) 300px, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-2">
                <div
                  role="img"
                  aria-label={`Rating: ${testimonial.rating} out of 5`}
                  className="flex items-center gap-0.5 text-base font-normal text-[#051a50]"
                >
                  <span className="flex items-center" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="14"
                        viewBox="0 0 15 14"
                        aria-hidden="true"
                      >
                        <path d={starPath} fill="#e4e7ec" stroke="#e4e7ec" strokeWidth="1.16667" />
                        <path
                          d={starPath}
                          fill="#E57A00"
                          stroke="#E57A00"
                          strokeWidth="1.16667"
                          style={{
                            clipPath: `inset(0 ${(1 - Math.min(1, Math.max(0, testimonial.rating - index))) * 100}% 0 0)`,
                          }}
                        />
                      </svg>
                    ))}
                  </span>
                  <span aria-hidden="true">{testimonial.rating.toFixed(1)}</span>
                </div>
                <blockquote className="flex-1 text-sm leading-5 text-[#2e3038]">“{testimonial.content}”</blockquote>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-base font-semibold leading-6 text-[#051a50]">{testimonial.authorName}</p>
                  {testimonial.authorSubtitle ? (
                    <p className="line-clamp-2 text-xs leading-4 text-[#4f5360]">{testimonial.authorSubtitle}</p>
                  ) : null}
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      <nav
        aria-label="Testimonials carousel controls"
        className={cn("mt-8 flex items-center justify-center gap-12", isLocked && "lg:hidden")}
      >
        <Button
          type="button"
          variant="brand"
          size="icon"
          aria-label="Previous testimonials"
          disabled={!swiper || testimonials.length <= 1}
          onClick={() => swiper?.slidePrev()}
          className="size-10 bg-gradient-to-r from-[#19539b] to-[#19539b] shadow-[0_8px_24px_rgba(25,83,155,0.2)] disabled:opacity-40"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>
        <div
          role="img"
          aria-label={`Showing testimonial ${Math.min(activeIndex + 1, testimonials.length)} of ${testimonials.length}`}
          className="h-2 w-12 overflow-hidden rounded-full bg-[#cfe7f7]"
        >
          <span
            className="block h-full rounded-full bg-[#19539b] transition-[width] duration-300"
            style={{ width: `${testimonials.length ? ((activeIndex + 1) / testimonials.length) * 100 : 0}%` }}
          />
        </div>
        <Button
          type="button"
          variant="brand"
          size="icon"
          aria-label="Next testimonials"
          disabled={!swiper || testimonials.length <= 1}
          onClick={() => swiper?.slideNext()}
          className="size-10 shadow-[0_8px_24px_rgba(239,163,59,0.25)] disabled:opacity-40"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
        </Button>
      </nav>
    </div>
  );
}
