"use client";

import { DocumentDownload } from "iconsax-reactjs";
import { type KeyboardEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-names";

import type { Product } from "../products.types";
import { resolveProductMediaUrl } from "../utils/product-display";

const tabs = ["Description", "Specifications", "References"] as const;
type Tab = (typeof tabs)[number];

export function ProductInformation({ product, descriptionHtml }: { product: Product; descriptionHtml: string }) {
  const t = useTranslations("Product");
  const [activeTab, setActiveTab] = useState<Tab>("Specifications");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectTab(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    setActiveTab(tab);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab((index + 1) % tabs.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab((index - 1 + tabs.length) % tabs.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(tabs.length - 1);
    }
  }

  return (
    <section
      className="overflow-hidden rounded-xl border border-[#e3e8ee] bg-white"
      aria-labelledby="product-information-title"
    >
      <h2 id="product-information-title" className="sr-only">
        {t("information")}
      </h2>
      <div className="flex overflow-x-auto border-b border-[#e9eaeb] px-3" role="tablist" aria-label={t("information")}>
        {tabs.map((tab, index) => (
          <Button
            key={tab}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            variant="ghost"
            role="tab"
            id={`product-tab-${tab.toLowerCase()}`}
            aria-selected={activeTab === tab}
            aria-controls={`product-panel-${tab.toLowerCase()}`}
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={cn(
              "relative h-11 shrink-0 rounded-none border-b border-transparent px-4 text-sm text-[#868da5] hover:bg-transparent hover:text-[#2061a9]",
              activeTab === tab && "border-[#2061a9] text-[#2061a9] hover:border-[#2061a9] hover:text-[#2061a9]",
            )}
          >
            {tab === "Description"
              ? t("descriptionTab")
              : tab === "Specifications"
                ? t("specificationsTab")
                : t("referencesTab")}
          </Button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab}
          hidden={activeTab !== tab}
          id={`product-panel-${tab.toLowerCase()}`}
          role="tabpanel"
          aria-labelledby={`product-tab-${tab.toLowerCase()}`}
          tabIndex={0}
          className="p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#164990]"
        >
          {tab === "Description" ? (
            <div
              className="text-sm leading-6 text-[#5e6375] [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : null}
          {tab === "Specifications" ? (
            product.specifications.length ? (
              <dl className="overflow-hidden rounded-[10px] border border-[#ecf0f3]">
                {product.specifications.map((item, index) => (
                  <div
                    key={`${item.name}-${item.value}`}
                    className={cn(
                      "grid min-h-11 grid-cols-1 gap-1 px-5 py-3 text-sm sm:grid-cols-2 sm:gap-4",
                      index % 2 === 0 ? "bg-[#f5f7f8]" : "bg-white",
                    )}
                  >
                    <dt className="font-medium text-[#051a50]">{item.name}</dt>
                    <dd className="text-[#051a50]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm leading-6 text-[#5e6375]">{t("noSpecifications")}</p>
            )
          ) : null}
          {tab === "References" ? (
            product.documents.length ? (
              <ul className="space-y-2">
                {[...product.documents]
                  .sort((left, right) => left.sortOrder - right.sortOrder)
                  .map((document) => (
                    <li key={document.id}>
                      <a
                        href={resolveProductMediaUrl(document.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-[#e5e9ef] px-4 py-3 text-sm font-medium text-[#164990] transition-colors hover:bg-[#f3f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
                      >
                        <DocumentDownload className="size-5 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">{document.displayName}</span>
                        <span className="text-xs font-normal text-[#73798f]">
                          {(document.sizeBytes / 1024).toLocaleString("en-SG", { maximumFractionDigits: 1 })} KB
                        </span>
                      </a>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm leading-6 text-[#5e6375]">{t("noDocuments")}</p>
            )
          ) : null}
        </div>
      ))}
      <noscript>
        <div
          className="p-4 text-sm leading-6 text-[#5e6375]"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </noscript>
    </section>
  );
}
