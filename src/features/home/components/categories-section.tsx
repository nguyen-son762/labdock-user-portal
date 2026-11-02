import {
  Activity,
  Box,
  BucketCircle,
  ChemicalGlass,
  Drop,
  Filter,
  Hierarchy3,
  Microscope,
  RulerPen,
  Setting2,
  StatusUp,
  Verify,
} from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import type { HomeCategory } from "../home.types";
import { cn } from "@/lib/class-names";

const categoryIcons = [
  Hierarchy3,
  Activity,
  Setting2,
  Drop,
  ChemicalGlass,
  RulerPen,
  Box,
  Filter,
  BucketCircle,
  Microscope,
  Box,
  Hierarchy3,
] as const;

export function CategoriesSection({ categories }: { categories: readonly HomeCategory[] }) {
  const t = useTranslations("Home");

  if (!categories.length) return null;

  return (
    <section className="bg-[#f5f8fb] py-16" aria-labelledby="top-categories-title">
      <div className="container">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#ef8704] via-[#f6ad4b] to-white p-4 lg:p-5">
          <div className="mb-5 flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="37" viewBox="0 0 38 37" fill="none">
              <foreignObject x="-25.3433" y="-30" width="93.3433" height="96.6961">
                <div
                  style={{
                    backdropFilter: "blur(15px)",
                    clipPath: "url(#bgblur_0_106_4079_clip_path)",
                    height: "100%",
                    width: "100%",
                  }}
                ></div>
              </foreignObject>
              <path
                data-figma-bg-blur-radius="30"
                d="M33.7699 12.9933H25.9399C25.4242 12.9933 24.9468 12.7857 24.6221 12.4083C24.2784 12.0308 24.1447 11.5024 24.2211 10.9551L25.1951 4.76525C25.6152 2.91583 24.3739 0.839944 22.5023 0.21718C20.7644 -0.424456 18.7209 0.44364 17.8997 1.6703L9.84051 13.5028L4.65674 13.8803V30.5628L9.8978 30.8459L15.9518 35.4694C16.7539 36.262 18.5682 36.6961 19.8477 36.6961H27.2958C29.8549 36.6961 32.4331 34.79 33.006 32.4688L37.7041 18.334C38.2006 16.9941 38.0669 15.6919 37.3412 14.654C36.5964 13.5972 35.2787 12.9933 33.7699 12.9933Z"
                fill="url(#paint0_linear_106_4079)"
              />
              <path
                d="M20.022 0.714844C20.7653 0.455214 21.5898 0.413378 22.3296 0.686523L22.3364 0.689453L22.3442 0.691406C23.9914 1.23951 25.0661 3.07555 24.7075 4.6543L24.7036 4.6709L24.7007 4.6875L23.7271 10.877L23.7261 10.8857C23.6337 11.5477 23.7893 12.2281 24.2427 12.7334V12.7344C24.2458 12.738 24.2493 12.7415 24.2524 12.7451V12.7441C24.6786 13.2333 25.2939 13.4932 25.9399 13.4932H33.77C35.0647 13.4932 36.1555 13.9773 36.8081 14.7773L36.9321 14.9424C37.551 15.8287 37.6817 16.9543 37.2349 18.1602L37.2319 18.168L37.23 18.1758L32.5317 32.3115L32.5249 32.3301L32.521 32.3486C32.268 33.3737 31.5611 34.3382 30.5981 35.0508C29.6365 35.7623 28.4543 36.1963 27.2954 36.1963H19.8481C19.2582 36.1963 18.5308 36.0945 17.8599 35.8994C17.1774 35.7009 16.6171 35.4243 16.3032 35.1143L16.2808 35.0918L16.2554 35.0723L10.2017 30.4482L10.0786 30.3545L9.92432 30.3467L5.15674 30.0889V14.3447L9.87646 14.002L10.1177 13.9844L10.2534 13.7842L18.313 1.95215L18.3149 1.94824C18.6547 1.44073 19.2742 0.976031 20.022 0.714844Z"
                stroke="url(#paint1_linear_106_4079)"
              />
              <path
                d="M4.14365 8.5686C1.19748 8.5686 0 9.7004 0 12.4922V31.4686C0 34.2603 1.19748 35.3921 4.14365 35.3921H6.10144C9.04761 35.3921 10.2451 34.2603 10.2451 31.4686V12.4922C10.2451 9.7004 9.04761 8.5686 6.10144 8.5686H4.14365Z"
                fill="url(#paint2_linear_106_4079)"
              />
              <defs>
                <clipPath id="bgblur_0_106_4079_clip_path" transform="translate(25.3433 30)">
                  <path d="M33.7699 12.9933H25.9399C25.4242 12.9933 24.9468 12.7857 24.6221 12.4083C24.2784 12.0308 24.1447 11.5024 24.2211 10.9551L25.1951 4.76525C25.6152 2.91583 24.3739 0.839944 22.5023 0.21718C20.7644 -0.424456 18.7209 0.44364 17.8997 1.6703L9.84051 13.5028L4.65674 13.8803V30.5628L9.8978 30.8459L15.9518 35.4694C16.7539 36.262 18.5682 36.6961 19.8477 36.6961H27.2958C29.8549 36.6961 32.4331 34.79 33.006 32.4688L37.7041 18.334C38.2006 16.9941 38.0669 15.6919 37.3412 14.654C36.5964 13.5972 35.2787 12.9933 33.7699 12.9933Z" />
                </clipPath>
                <linearGradient
                  id="paint0_linear_106_4079"
                  x1="21.3283"
                  y1="36.6961"
                  x2="21.3283"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" stopOpacity="0.3" />
                  <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_106_4079"
                  x1="4.92282"
                  y1="24.3109"
                  x2="29.5976"
                  y2="20.896"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.0932893" stopColor="white" stopOpacity="0" />
                  <stop offset="0.473958" stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0.523483" />
                </linearGradient>
                <linearGradient
                  id="paint2_linear_106_4079"
                  x1="5.12254"
                  y1="8.5686"
                  x2="5.12254"
                  y2="35.3921"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#0F3678" />
                  <stop offset="1" stopColor="#2F7BC4" />
                </linearGradient>
              </defs>
            </svg>
            <h2 id="top-categories-title" className="text-2xl font-semibold">
              {t("topCategories")}
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {categories.map((category, index) => {
                const Icon = categoryIcons[index % categoryIcons.length];
                const isTrending = index >= 2;
                return (
                  <Link
                    key={category.id}
                    id={`category-${category.slug}`}
                    href={`/products/category/${category.slug}`}
                    className="relative flex min-h-[92px] items-center gap-3 rounded-[12px] border border-white bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.5)_100%)] p-3 text-[#051a50] transition-[background,box-shadow] duration-300 hover:bg-[linear-gradient(0deg,#FFF_0%,#FFF_100%),linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.5)_100%)] hover:shadow-[0_0_50px_0_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
                  >
                    {Icon ? (
                      <Icon className="size-8 shrink-0 text-[#1572ad]" variant="Bulk" aria-hidden="true" />
                    ) : null}
                    <span>
                      <strong className="block text-sm leading-5">{category.name}</strong>
                    </span>
                    <p></p>
                    {index < 4 ? (
                      <span
                        className={cn(
                          "absolute -right-px -top-px inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-bl-[4px] rounded-tr-[12px] border-r border-t border-transparent px-1.5 text-xs font-semibold leading-4 text-white shadow-[0_0_50px_0_rgba(239,163,59,0.30)] [background-clip:padding-box,border-box] [background-origin:border-box]",
                          isTrending
                            ? "bg-[linear-gradient(270deg,#217A4F_0%,#4CAF7A_100%),linear-gradient(90deg,#FFF_0%,#9BDBB7_100%)]"
                            : "bg-[linear-gradient(90deg,var(--brand-orange-start)_0%,var(--brand-orange-end)_100%),linear-gradient(90deg,#FFF_0%,#F2BD81_100%)]",
                        )}
                      >
                        {isTrending ? (
                          <StatusUp variant="Bold" size={12} className="shrink-0" aria-hidden="true" />
                        ) : (
                          <Image src="/home/icon/fire.svg" alt="" width={12} height={12} className="shrink-0" />
                        )}
                        {index < 2 ? t("bestSeller") : t("trending")}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
            <aside className="relative min-h-[360px] overflow-hidden rounded-xl bg-[#08265f] p-5 text-white lg:min-h-0">
              <Image
                src="/home/category-promo.png"
                alt="Microscope and laboratory glassware"
                fill
                sizes="320px"
                className="object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#08265f]/80 via-transparent to-[#08265f]/15" />
              <div className="relative">
                <p className="text-[40px] font-bold">10,000+</p>
                <p className="text-[20px] font-medium">{t("verifiedProducts")}</p>
                <div className="mt-4 flex flex-wrap gap-2 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_100%)] text-xs text-[#164990] p-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                    <Verify className="size-4 text-[#3eb584]" variant="Bold" aria-hidden="true" /> ISO Certified
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                    <Verify className="size-4 text-[#3eb584]" variant="Bold" aria-hidden="true" /> COA / SDS Available
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
