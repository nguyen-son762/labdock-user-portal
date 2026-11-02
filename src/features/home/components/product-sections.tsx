import { ArrowRight } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ProductCard, ProductCarousel, type Product } from "@/features/products";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

function ViewAllProducts() {
  const t = useTranslations("Home");

  return (
    <Button asChild className="h-11 rounded-full bg-gradient-to-r from-[#2f7bc4] to-[#0f3678] p-[6px] pl-5 shadow-none">
      <Link href="/products">
        {t("viewAll")}
        <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </Link>
    </Button>
  );
}

export function OutstandingProducts({ products }: { products: readonly Product[] }) {
  const t = useTranslations("Home");

  return (
    <section className="bg-[#f5f8fb] pb-16" aria-labelledby="outstanding-products-title">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0f3678] to-[#2f7bc4] px-4 pb-6 pt-24 lg:px-5">
          <Image
            src="/auth/pattern.png"
            alt=""
            width={515}
            height={364}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 h-auto w-[min(515px,40.25%)] max-w-[515px] rotate-180 opacity-50 mix-blend-lighten"
          />
          <Image
            src="/auth/pattern.png"
            alt=""
            width={515}
            height={364}
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 z-0 h-auto w-[min(515px,40.25%)] max-w-[515px] opacity-50 mix-blend-lighten"
          />
          <h2
            id="outstanding-products-title"
            className="absolute left-1/2 top-0 z-10 flex h-[70px] w-[min(430px,80%)] -translate-x-1/2 items-center justify-center text-2xl font-semibold text-white lg:text-[28px]"
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
              viewBox="0 0 430 70"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="outstanding-title-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e57a00" />
                  <stop offset="100%" stopColor="#fcdb97" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="outstanding-title-stroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M0 0H430L406 58Q401 70 387 70H43Q29 70 24 58L0 0Z"
                fill="url(#outstanding-title-gradient)"
                stroke="url(#outstanding-title-stroke)"
                strokeWidth="2"
              />
            </svg>
            <span className="relative z-10 flex items-center gap-2 text-2xl font-semibold text-white">
              <Image className="relative z-10" src="/home/icon/awards.png" alt="" width={40} height={40} />{" "}
              {t("outstanding")}
            </span>
          </h2>
          <div className="relative z-10">
            <ProductCarousel products={products} label={t("outstanding")} appearance="outstanding" tone="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewProductsSection({ products }: { products: readonly Product[] }) {
  const t = useTranslations("Home");

  return (
    <section id="new-products" aria-labelledby="new-products-title" className="container">
      <div className="rounded-2xl bg-white pb-6">
        <h2 id="new-products-title" className="mb-6 pt-6 text-center text-2xl font-semibold text-[#051a50]">
          {t("newProducts")}
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <ViewAllProducts />
        </div>
      </div>
    </section>
  );
}

export function PersonalizedProducts({ products }: { products: readonly Product[] }) {
  const t = useTranslations("Home");

  return (
    <section className="bg-[#f5f8fb]" aria-labelledby="personalized-title">
      <div className="container">
        <div className="relative rounded-2xl bg-gradient-to-b from-[#79b5e1] to-[#eef7fd] px-4 pb-6 pt-[90px] lg:px-5">
          <h2
            id="personalized-title"
            className="absolute left-1/2 top-0 z-10 flex h-[62px] w-[min(382px,80%)] -translate-x-1/2 items-center justify-center text-2xl font-semibold text-white"
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
              viewBox="0 0 382 62"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="personalized-title-gradient"
                  x1="191"
                  y1="62"
                  x2="191"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#74B3E4" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#164990" />
                </linearGradient>
                <linearGradient
                  id="personalized-title-stroke"
                  x1="191"
                  y1="0"
                  x2="191"
                  y2="62"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" stopOpacity="0" />
                  <stop offset="1" stopColor="white" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M380.526 1L360.463 51.5352C358.194 57.2488 352.669 60.9999 346.521 61H35.4785C29.331 60.9999 23.8056 57.2488 21.5371 51.5352L1.47363 1H380.526Z"
                fill="url(#personalized-title-gradient)"
                stroke="url(#personalized-title-stroke)"
                strokeWidth="2"
              />
            </svg>
            <span className="relative z-10 flex items-center gap-2 text-2xl">
              <span aria-hidden="true" className="relative isolate block size-10 shrink-0">
                <svg className="absolute -top-px right-0" width="33" height="33" viewBox="0 0 33 33" fill="none">
                  <circle cx="16.3399" cy="16.3399" r="16.3399" fill="url(#personalized-icon-orange)" />
                  <defs>
                    <linearGradient
                      id="personalized-icon-orange"
                      x1="0"
                      y1="16.3399"
                      x2="32.6797"
                      y2="16.3399"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#EFA33B" />
                      <stop offset="1" stopColor="#E57A00" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute left-[3.13721px] top-[4.70587px] z-10 size-[32.6797px] rounded-full bg-[#FCDB97]/20 backdrop-blur-[4.5px]" />
                <svg className="absolute inset-0 z-20 size-full" viewBox="0 0 40 40" fill="none">
                  <circle cx="19.4771" cy="21.0457" r="15.83985" stroke="url(#personalized-icon-rim-top)" />
                  <circle
                    cx="19.4771"
                    cy="21.0457"
                    r="15.83985"
                    stroke="url(#personalized-icon-rim-bottom)"
                    strokeOpacity="0.2"
                  />
                  <path
                    d="M19.4771 11.2418C16.7699 11.2418 14.5752 13.4365 14.5752 16.1438C14.5752 18.8511 16.7699 21.0457 19.4771 21.0457C22.1845 21.0457 24.3791 18.8511 24.3791 16.1438C24.3791 13.4365 22.1845 11.2418 19.4771 11.2418Z"
                    fill="url(#personalized-icon-head)"
                  />
                  <path
                    d="M29.1093 28.485C29.3394 28.9449 29.3394 29.4864 29.1093 29.9466C29.1232 29.9178 29.1082 29.9489 29.1082 29.9489L29.1069 29.9513L29.1044 29.9562L29.0987 29.9673L29.0853 29.9928C29.0754 30.0116 29.0634 30.0333 29.0495 30.058C29.0214 30.1075 28.985 30.1686 28.9393 30.2397C28.8479 30.382 28.719 30.5644 28.5456 30.7724C28.1979 31.1895 27.6741 31.7067 26.9201 32.2093C25.3973 33.2245 23.0316 34.1176 19.4776 34.1176C13.4562 34.1176 10.9244 31.5529 10.1091 30.3783C9.61582 29.6675 9.67044 28.8371 9.96881 28.2404C11.1721 25.8338 13.6317 24.3137 16.3223 24.3137H22.3602C25.2183 24.3137 27.8311 25.9286 29.1093 28.485Z"
                    fill="url(#personalized-icon-body)"
                  />
                  <defs>
                    <linearGradient
                      id="personalized-icon-rim-top"
                      x1="31.5686"
                      y1="7.25489"
                      x2="19.6078"
                      y2="21.1765"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="personalized-icon-rim-bottom"
                      x1="5.09799"
                      y1="42.9412"
                      x2="30.196"
                      y2="14.7059"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="personalized-icon-head"
                      x1="21.5685"
                      y1="16.0784"
                      x2="10.7842"
                      y2="18.0392"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient
                      id="personalized-icon-body"
                      x1="19.608"
                      y1="27.8431"
                      x2="8.43158"
                      y2="34.1176"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              {t("personalized")}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={`personalized-${product.id}`} product={product} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <ViewAllProducts />
          </div>
        </div>
      </div>
    </section>
  );
}
