import { httpClient } from "@/lib/http-client";

import {
  rfqDetailSchema,
  rfqFiltersSchema,
  rfqListResponseSchema,
  type RfqDetail,
  type RfqFilters,
  type RfqListResponse,
} from "../schemas/rfq.schema";

const rfqIdSchema = rfqDetailSchema.shape.id;

export const rfqsService = {
  async list(input: RfqFilters, signal?: AbortSignal): Promise<RfqListResponse> {
    const { page, pageSize, status, search, fromDate, toDate } = rfqFiltersSchema.parse(input);
    const response = await httpClient.get<unknown>("/rfqs", {
      params: {
        page,
        pageSize,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      },
      signal,
    });

    return rfqListResponseSchema.parse(response.data);
  },

  async getById(id: string, signal?: AbortSignal): Promise<RfqDetail> {
    const rfqId = rfqIdSchema.parse(id);
    const response = await httpClient.get<unknown>(`/rfqs/${encodeURIComponent(rfqId)}`, { signal });

    return rfqDetailSchema.parse(response.data);
  },
};
