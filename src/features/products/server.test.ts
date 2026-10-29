import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

import {
  getCatalogCategoriesWithCounts,
  getProductCatalogPage,
  getPublicProductBySlug,
  getPublicProducts,
  getPublicProductOrigins,
  ProductNotFoundError,
} from "./server";

const productsResponse = {
  items: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Example Name",
      slug: "example-slug",
      productNo: "SKU-001",
      brandName: "Example Brand",
      primaryImageUrl: "/media/public/example.jpg",
      priceVisible: true,
      fromPrice: 99.5,
      currency: "SGD",
      outOfStock: true,
      publishedAt: "2026-08-21T10:00:00+00:00",
      isNew: true,
      isOutstanding: true,
    },
  ],
  page: 1,
  pageSize: 1,
  total: 10,
};

const productDetailResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Example Name",
  slug: "example-slug",
  productNo: "SKU-001",
  status: "Draft",
  brandName: "Example Brand",
  notes: "Handle with care",
  description: "Example description",
  specialRequirement: true,
  restrictedCondition: true,
  priceVisible: true,
  casNumber: "64-17-5",
  specifications: [{ name: "Purity", value: "99%" }],
  variants: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      sku: "SKU-001-100",
      priceVisible: true,
      unitPrice: 99.5,
      rfqBasePrice: 120,
      promotionPercent: 10,
      currency: "SGD",
      stockQty: 10,
      isActive: true,
      selections: [
        {
          attributeId: "33333333-3333-3333-3333-333333333333",
          attributeCode: "size",
          attributeName: "Size",
          valueId: "44444444-4444-4444-4444-444444444444",
          valueCode: "100ml",
          value: "100ml",
        },
      ],
    },
  ],
  media: [
    {
      id: "55555555-5555-5555-5555-555555555555",
      url: "/media/public/example.jpg",
      contentType: "image/jpeg",
      sortOrder: 0,
      isPrimary: true,
    },
  ],
  documents: [],
  related: [],
  certificates: [{ id: "66666666-6666-6666-6666-666666666666", name: "ISO Certified" }],
  isNew: true,
  isOutstanding: false,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getPublicProducts", () => {
  it("preserves complete product records returned by the catalog API", async () => {
    const detail = { ...productDetailResponse, supplierItemNo: "SUPPLIER-001", related: null };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ ...productsResponse, items: [detail] }), { status: 200 })),
    );

    const result = await getProductCatalogPage({ page: 1, pageSize: 20 });
    expect(result.items[0]).toEqual({ ...detail, related: [] });
  });

  it("serializes every supported filter with the backend parameter casing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(productsResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getPublicProducts({
        page: 1,
        pageSize: 12,
        brandIds: ["brand-id", "second-brand"],
        categoryIds: ["category-id", "second-category"],
        origins: ["SG", "Germany"],
        sort: "newest",
        isNew: true,
        isOutstanding: true,
      }),
    ).resolves.toEqual(productsResponse);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://uat-api-labdock.365studio.vn/api/public/v1/products?page=1&pageSize=12&brandIds=brand-id%2Csecond-brand&CategoryIds=category-id%2Csecond-category&Origins=SG%2CGermany&Sort=newest&IsNew=true&IsOutstanding=true",
      { next: { revalidate: 300, tags: ["products", "products:outstanding"] } },
    );
  });

  it("omits optional filters for the normal product feed", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(productsResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getPublicProducts({ page: 1, pageSize: 6 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://uat-api-labdock.365studio.vn/api/public/v1/products?page=1&pageSize=6",
      { next: { revalidate: 300, tags: ["products", "products:all"] } },
    );
  });

  it("rejects malformed product payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 })));

    await expect(getPublicProducts({ page: 1, pageSize: 6 })).rejects.toThrow();
  });

  it("omits empty lists and preserves explicit false flags", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(productsResponse)));
    vi.stubGlobal("fetch", fetchMock);
    await getPublicProducts({
      page: 2,
      pageSize: 20,
      brandIds: [],
      categoryIds: [],
      origins: [],
      isNew: false,
      isOutstanding: false,
    });
    const url = new URL(fetchMock.mock.calls[0]?.[0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: "2",
      pageSize: "20",
      IsNew: "false",
      IsOutstanding: "false",
    });
  });

  it("maps product list items into the Product contract consumed by cards", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(productsResponse), { status: 200 })));

    const result = await getProductCatalogPage({ page: 1, pageSize: 20 });

    expect(result.total).toBe(10);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        id: productsResponse.items[0]?.id,
        productNo: "SKU-001",
        brandName: "Example Brand",
        variants: [expect.objectContaining({ unitPrice: 99.5, stockQty: 0 })],
      }),
    );
  });
});

describe("getPublicProductOrigins", () => {
  it("loads string origins with the catalog cache policy and removes duplicates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(["SG", "United States", "SG"])));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getPublicProductOrigins()).resolves.toEqual(["SG", "United States"]);
    expect(fetchMock).toHaveBeenCalledWith("https://uat-api-labdock.365studio.vn/api/public/v1/origins", {
      next: { revalidate: 300, tags: ["origins"] },
    });
  });

  it("supports an empty list", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("[]")));
    await expect(getPublicProductOrigins()).resolves.toEqual([]);
  });

  it("rejects failed requests and malformed payloads", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ name: "SG" }])));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getPublicProductOrigins()).rejects.toThrow("Unable to load origins (503)");
    await expect(getPublicProductOrigins()).rejects.toThrow();
  });
});

describe("getCatalogCategoriesWithCounts", () => {
  const category = {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Glassware",
    slug: "glassware",
    depth: 0,
    imageUrl: null,
  };

  it("uses category-specific totals and skips counts supplied by the category API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(productsResponse), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getCatalogCategoriesWithCounts([
      category,
      { ...category, id: "known-category", productCount: 42 },
    ]);

    expect(result.map((option) => option.productCount)).toEqual([10, 42]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://uat-api-labdock.365studio.vn/api/public/v1/products?page=1&pageSize=1&CategoryIds=${category.id}`,
      { next: { revalidate: 300, tags: ["products", "products:all"] } },
    );
  });

  it("keeps category navigation available when its count request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(getCatalogCategoriesWithCounts([category])).resolves.toEqual([category]);
  });
});

describe("getPublicCategoryTreeWithCounts", () => {
  it("BP-TC-02-01 fills missing menu counts at every level without replacing known zero counts", async () => {
    const { getPublicCategoryTreeWithCounts } = await import("./server");
    const categories: import("@/features/categories").PublicCategoryTreeNode[] = [
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Glassware",
        description: null,
        slug: "glassware",
        level: 1,
        sortOrder: 0,
        media: [],
        children: [
          {
            id: "33333333-3333-3333-3333-333333333333",
            name: "Beakers",
            description: null,
            slug: "beakers",
            level: 2,
            sortOrder: 0,
            productCount: 0,
            media: [],
            children: [],
          },
        ],
      },
    ];
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify(productsResponse)));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPublicCategoryTreeWithCounts(categories);

    expect(result[0]?.productCount).toBe(10);
    expect(result[0]?.children[0]?.productCount).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(categories[0]).not.toHaveProperty("productCount");

    const parent = categories[0];
    const child = parent?.children[0];
    if (!parent || !child) throw new Error("Missing category fixture.");
    const nestedResult = await getPublicCategoryTreeWithCounts([
      { ...parent, productCount: 0, children: [{ ...child, productCount: undefined }] },
    ]);
    expect(nestedResult[0]?.productCount).toBe(0);
    expect(nestedResult[0]?.children[0]?.productCount).toBe(10);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("getPublicProductBySlug", () => {
  it("loads and validates a product detail by encoded slug", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(productDetailResponse), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicProductBySlug("example slug")).resolves.toEqual(productDetailResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://uat-api-labdock.365studio.vn/api/public/v1/products/example%20slug",
      { next: { revalidate: 300, tags: ["products", "product:example slug"] } },
    );
  });

  it("maps a 404 response to ProductNotFoundError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    await expect(getPublicProductBySlug("missing-product")).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it("rejects malformed product detail payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ ...productDetailResponse, variants: null }), { status: 200 })),
    );

    await expect(getPublicProductBySlug("example-slug")).rejects.toThrow();
  });
});
