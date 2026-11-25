import { CanceledError } from "axios";

import { authTokenStore } from "@/lib/auth-token-store";
import { httpClient } from "@/lib/http-client";

import {
  addCartItemSchema,
  cartQuoteInputSchema,
  cartQuoteSchema,
  cartResponseSchema,
  removeCartItemSchema,
  updateCartItemSchema,
  type AddCartItemInput,
  type CartItem,
  type CartQuote,
  type CartQuoteInput,
  type RemoveCartItemInput,
  type UpdateCartItemInput,
} from "../schemas/cart.schema";

// Each write returns a complete cart; keep request and response order consistent.
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite<T>(write: () => Promise<T>): Promise<T> {
  const sessionVersion = authTokenStore.getSessionVersion();
  const request = writeQueue.then(() => {
    if (sessionVersion !== authTokenStore.getSessionVersion()) throw new CanceledError("The account session changed.");
    return write();
  });
  writeQueue = request.then(
    () => undefined,
    () => undefined,
  );
  return request;
}

export const cartService = {
  async get(signal?: AbortSignal): Promise<CartItem[]> {
    const response = await httpClient.get<unknown>("/cart", { signal });
    return cartResponseSchema.parse(response.data).items;
  },

  async quote(input: CartQuoteInput, signal?: AbortSignal): Promise<CartQuote> {
    const body = cartQuoteInputSchema.parse(input);
    const response = await httpClient.post<unknown>("/cart/quote", body, { signal });
    return cartQuoteSchema.parse(response.data);
  },

  async add(input: AddCartItemInput): Promise<CartItem[]> {
    const body = addCartItemSchema.parse(input);
    return enqueueWrite(async () => {
      const response = await httpClient.post<unknown>("/cart/items", body);
      return cartResponseSchema.parse(response.data).items;
    });
  },

  async update(input: UpdateCartItemInput): Promise<CartItem[]> {
    const { itemId, ...body } = updateCartItemSchema.parse(input);
    return enqueueWrite(async () => {
      const response = await httpClient.patch<unknown>(`/cart/items/${encodeURIComponent(itemId)}`, body);
      return cartResponseSchema.parse(response.data).items;
    });
  },

  async remove(input: RemoveCartItemInput): Promise<void> {
    const { itemId } = removeCartItemSchema.parse(input);
    return enqueueWrite(async () => {
      await httpClient.delete(`/cart/items/${encodeURIComponent(itemId)}`);
    });
  },
};
