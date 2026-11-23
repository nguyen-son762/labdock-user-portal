import { clientEnv } from "@/config/client-env";
import { httpClient } from "@/lib/http-client";

import {
  passwordFormSchema,
  profileFormSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from "../schemas/profile-form.schema";
import {
  profilePictureMediaUploadResponseSchema,
  profileResponseSchema,
  profileUpdateResponseSchema,
  type ProfilePictureMediaUploadResponse,
  type ProfileResponse,
} from "../schemas/profile-response.schema";
import { currentUserSchema, type CurrentUser } from "../schemas/user.schema";

const DEFAULT_PROFILE_PICTURE_URL = "/auth/company-logo.png";

type UpdateProfileRequest = {
  fullName: string;
  phoneNumber: string;
  email: string;
  companyName: string;
  companyPhone: string;
  businessRegistrationNumber: string;
  deliveryAddress: {
    address: string;
    postalCode: string;
    country: string;
  };
  sameAsDeliveryAddress: boolean;
  billingAddress: {
    address: string;
    postalCode: string;
    country: string;
  };
  profilePictureMediaId?: string;
};

function resolveProfilePictureUrl(path: string): string {
  if (/^(?:https?:|data:)/i.test(path)) return path;

  const normalizedPath = path.replace(/^\/+/, "");
  if (clientEnv.NEXT_PUBLIC_API_BASE_URL.startsWith("/")) return `/${normalizedPath}`;
  return new URL(normalizedPath, `${new URL(clientEnv.NEXT_PUBLIC_API_BASE_URL).origin}/`).toString();
}

function mapProfileResponse(input: ProfileResponse): CurrentUser {
  return currentUserSchema.parse({
    fullName: input.fullName,
    email: input.email,
    phone: input.phoneNumber,
    avatarUrl: input.profilePictureUrl
      ? resolveProfilePictureUrl(input.profilePictureUrl)
      : DEFAULT_PROFILE_PICTURE_URL,
    companyName: input.companyName,
    companyPhone: input.companyPhone,
    businessRegistrationNumber: input.businessRegistrationNumber,
    deliveryAddress: input.deliveryAddress.address,
    postalCode: input.deliveryAddress.postalCode,
    country: input.deliveryAddress.country,
    billingSameAsDelivery: input.sameAsDeliveryAddress,
    billingAddress: input.billingAddress,
    role: "unknown",
    joinedAt: new Date(input.memberSince).toISOString(),
    lastActiveAt: null,
    passwordChangedAt: input.passwordChangedAt ? new Date(input.passwordChangedAt).toISOString() : null,
  });
}

function mapUpdateProfileRequest(input: ProfileFormValues, profilePictureMediaId?: string): UpdateProfileRequest {
  const deliveryAddress = {
    address: input.deliveryAddress,
    postalCode: input.postalCode,
    country: input.country,
  };

  return {
    fullName: input.fullName,
    phoneNumber: input.phone,
    email: input.email,
    companyName: input.companyName,
    companyPhone: input.companyPhone,
    businessRegistrationNumber: input.businessRegistrationNumber,
    deliveryAddress,
    sameAsDeliveryAddress: input.billingSameAsDelivery,
    billingAddress: input.billingSameAsDelivery
      ? deliveryAddress
      : {
          address: input.billingAddress ?? "",
          postalCode: input.billingPostalCode ?? "",
          country: input.billingCountry ?? "",
        },
    ...(profilePictureMediaId ? { profilePictureMediaId } : {}),
  };
}

function mapProfileUpdateResponse(
  response: unknown,
  currentUser: CurrentUser,
  uploadedPictureUrl?: string,
): CurrentUser {
  const input = profileUpdateResponseSchema.parse(response);
  const mapped = mapProfileResponse({ ...input, memberSince: input.memberSince ?? currentUser.joinedAt });
  return {
    ...mapped,
    avatarUrl:
      input.profilePictureUrl === undefined
        ? uploadedPictureUrl
          ? resolveProfilePictureUrl(uploadedPictureUrl)
          : currentUser.avatarUrl
        : mapped.avatarUrl,
    passwordChangedAt: input.passwordChangedAt === undefined ? currentUser.passwordChangedAt : mapped.passwordChangedAt,
  };
}

function mapProfilePictureUpdateRequest(currentUser: CurrentUser, profilePictureMediaId: string): UpdateProfileRequest {
  const deliveryAddress = {
    address: currentUser.deliveryAddress,
    postalCode: currentUser.postalCode,
    country: currentUser.country,
  };

  return {
    fullName: currentUser.fullName,
    phoneNumber: currentUser.phone,
    email: currentUser.email,
    companyName: currentUser.companyName,
    companyPhone: currentUser.companyPhone,
    businessRegistrationNumber: currentUser.businessRegistrationNumber,
    deliveryAddress,
    sameAsDeliveryAddress: currentUser.billingSameAsDelivery,
    billingAddress: currentUser.billingSameAsDelivery ? deliveryAddress : currentUser.billingAddress,
    profilePictureMediaId,
  };
}

export const profileService = {
  async getCurrent(signal?: AbortSignal): Promise<CurrentUser> {
    const response = await httpClient.get<unknown>("/me/profile", { signal });
    return mapProfileResponse(profileResponseSchema.parse(response.data));
  },

  async updateCurrent(
    input: ProfileFormValues,
    currentUser: CurrentUser,
    profilePictureMediaId?: string,
  ): Promise<CurrentUser> {
    const validatedInput = profileFormSchema.parse(input);
    const validatedCurrentUser = currentUserSchema.parse(currentUser);
    const response = await httpClient.put<unknown>(
      "/me/profile",
      mapUpdateProfileRequest(validatedInput, profilePictureMediaId),
    );

    return mapProfileUpdateResponse(response.data, validatedCurrentUser);
  },

  async changePassword(input: PasswordFormValues): Promise<void> {
    const values = passwordFormSchema.parse(input);
    await httpClient.post<void>("/auth/change-password", values);
  },

  async uploadAvatar(file: File, signal?: AbortSignal): Promise<ProfilePictureMediaUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.post<unknown>("/me/profile/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...(signal ? { signal } : {}),
    });
    return profilePictureMediaUploadResponseSchema.parse(response.data);
  },

  async updateAvatar(file: File, currentUser: CurrentUser): Promise<CurrentUser> {
    const validatedCurrentUser = currentUserSchema.parse(currentUser);
    const media = await profileService.uploadAvatar(file);
    const response = await httpClient.put<unknown>(
      "/me/profile",
      mapProfilePictureUpdateRequest(validatedCurrentUser, media.id),
    );

    return mapProfileUpdateResponse(response.data, validatedCurrentUser, media.url);
  },
};
