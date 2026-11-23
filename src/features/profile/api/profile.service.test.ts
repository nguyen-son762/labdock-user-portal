import { afterEach, describe, expect, it, vi } from "vitest";

const httpClient = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));

vi.mock("@/lib/http-client", () => ({ httpClient }));

import { profileService } from "./profile.service";

import type { ProfileFormValues } from "../schemas/profile-form.schema";
import type { CurrentUser } from "../schemas/user.schema";

const profileResponse = {
  fullName: "Example Name",
  phoneNumber: "+84901234567",
  email: "user@labdock.local",
  companyName: "Example Company",
  companyPhone: "+84987654321",
  businessRegistrationNumber: "0123456789",
  deliveryAddress: { address: "1 Nguyen Hue", postalCode: "700000", country: "VN" },
  sameAsDeliveryAddress: false,
  billingAddress: { address: "2 Le Loi", postalCode: "700001", country: "VN" },
  profilePictureUrl: "/media/public/profile.jpg",
  passwordChangedAt: "2026-08-21T10:00:00+00:00",
  memberSince: "2025-08-21T10:00:00+00:00",
};

const uploadedMedia = {
  id: "809a5c87-566d-493b-b589-59f2431ced40",
  relativePath: "public/buyers/temp/2026/10/05/809a5c87-566d-493b-b589-59f2431ced40.jpg",
  url: "/media/public/buyers/temp/2026/10/05/809a5c87-566d-493b-b589-59f2431ced40.jpg",
  contentType: "image/jpeg",
  sizeBytes: 12725,
  isTemporary: true,
};

const currentUser: CurrentUser = {
  fullName: profileResponse.fullName,
  phone: profileResponse.phoneNumber,
  email: profileResponse.email,
  avatarUrl: "https://example.com/profile.jpg",
  companyName: profileResponse.companyName,
  companyPhone: profileResponse.companyPhone,
  businessRegistrationNumber: profileResponse.businessRegistrationNumber,
  deliveryAddress: profileResponse.deliveryAddress.address,
  postalCode: profileResponse.deliveryAddress.postalCode,
  country: profileResponse.deliveryAddress.country,
  billingSameAsDelivery: false,
  billingAddress: profileResponse.billingAddress,
  role: "unknown",
  joinedAt: "2025-08-21T10:00:00.000Z",
  lastActiveAt: null,
  passwordChangedAt: "2026-08-21T10:00:00.000Z",
};

const updateInput: ProfileFormValues = {
  fullName: "Updated Name",
  phone: "+84909999999",
  email: "updated@labdock.local",
  companyName: "Updated Company",
  companyPhone: "+84908888888",
  businessRegistrationNumber: "9876543210",
  deliveryAddress: "3 Dong Khoi",
  postalCode: "700002",
  country: "VN",
  billingSameAsDelivery: true,
};

describe("profileService", () => {
  afterEach(() => {
    httpClient.get.mockReset();
    httpClient.post.mockReset();
    httpClient.put.mockReset();
  });

  it("loads and maps the authenticated profile contract", async () => {
    httpClient.get.mockResolvedValue({ data: profileResponse });
    const controller = new AbortController();

    const result = await profileService.getCurrent(controller.signal);

    expect(httpClient.get).toHaveBeenCalledWith("/me/profile", { signal: controller.signal });
    expect(result).toEqual(
      expect.objectContaining({
        fullName: profileResponse.fullName,
        phone: profileResponse.phoneNumber,
        email: profileResponse.email,
        deliveryAddress: profileResponse.deliveryAddress.address,
        postalCode: profileResponse.deliveryAddress.postalCode,
        country: "VN",
        billingSameAsDelivery: false,
        billingAddress: profileResponse.billingAddress,
        role: "unknown",
        joinedAt: "2025-08-21T10:00:00.000Z",
        passwordChangedAt: "2026-08-21T10:00:00.000Z",
      }),
    );
    expect(result.avatarUrl).toContain("/media/public/profile.jpg");
  });

  it("rejects an invalid profile response at the API boundary", async () => {
    httpClient.get.mockResolvedValue({ data: { ...profileResponse, email: "invalid" } });

    await expect(profileService.getCurrent()).rejects.toThrow();
  });

  it("normalizes optional profile fields that are null for incomplete accounts", async () => {
    httpClient.get.mockResolvedValue({
      data: {
        ...profileResponse,
        phoneNumber: null,
        companyPhone: null,
        businessRegistrationNumber: null,
        deliveryAddress: null,
        billingAddress: null,
        profilePictureUrl: null,
        passwordChangedAt: null,
      },
    });

    const result = await profileService.getCurrent();

    expect(result).toEqual(
      expect.objectContaining({
        phone: "",
        companyPhone: "",
        businessRegistrationNumber: "",
        deliveryAddress: "",
        billingAddress: { address: "", postalCode: "", country: "" },
        avatarUrl: "/auth/company-logo.png",
        passwordChangedAt: null,
      }),
    );
  });

  it("updates the authenticated profile with the API contract and maps the response", async () => {
    const updatedResponse = {
      ...profileResponse,
      fullName: updateInput.fullName,
      phoneNumber: updateInput.phone,
      email: updateInput.email,
      companyName: updateInput.companyName,
      companyPhone: updateInput.companyPhone,
      businessRegistrationNumber: updateInput.businessRegistrationNumber,
      deliveryAddress: {
        address: updateInput.deliveryAddress,
        postalCode: updateInput.postalCode,
        country: updateInput.country,
      },
      sameAsDeliveryAddress: true,
      billingAddress: {
        address: updateInput.deliveryAddress,
        postalCode: updateInput.postalCode,
        country: updateInput.country,
      },
    };
    httpClient.put.mockResolvedValue({ data: updatedResponse });

    const result = await profileService.updateCurrent(updateInput, currentUser);

    expect(httpClient.put).toHaveBeenCalledWith("/me/profile", {
      fullName: updateInput.fullName,
      phoneNumber: updateInput.phone,
      email: updateInput.email,
      companyName: updateInput.companyName,
      companyPhone: updateInput.companyPhone,
      businessRegistrationNumber: updateInput.businessRegistrationNumber,
      deliveryAddress: updatedResponse.deliveryAddress,
      sameAsDeliveryAddress: true,
      billingAddress: updatedResponse.deliveryAddress,
    });
    expect(result).toEqual(
      expect.objectContaining({
        fullName: updateInput.fullName,
        phone: updateInput.phone,
        billingSameAsDelivery: true,
        billingAddress: updatedResponse.billingAddress,
      }),
    );
  });

  it("sends the entered billing address when it differs from delivery", async () => {
    const input = {
      ...updateInput,
      billingSameAsDelivery: false,
      billingAddress: "99 New Billing Street",
      billingPostalCode: "10000",
      billingCountry: "US",
    };
    httpClient.put.mockResolvedValue({
      data: { ...profileResponse, sameAsDeliveryAddress: false, billingAddress: currentUser.billingAddress },
    });

    await profileService.updateCurrent(input, currentUser);

    expect(httpClient.put).toHaveBeenCalledWith(
      "/me/profile",
      expect.objectContaining({
        sameAsDeliveryAddress: false,
        billingAddress: {
          address: input.billingAddress,
          postalCode: input.billingPostalCode,
          country: input.billingCountry,
        },
      }),
    );
  });

  it("accepts the PUT response without GET-only metadata and retains existing profile metadata", async () => {
    const updated = {
      ...profileResponse,
      memberSince: undefined,
      passwordChangedAt: undefined,
      profilePictureUrl: undefined,
    };
    httpClient.put.mockResolvedValue({ data: { ...updated, profilePictureMediaId: uploadedMedia.id } });
    const result = await profileService.updateCurrent(updateInput, currentUser);
    expect(result).toMatchObject({
      joinedAt: currentUser.joinedAt,
      passwordChangedAt: currentUser.passwordChangedAt,
      avatarUrl: currentUser.avatarUrl,
    });
  });

  it("rejects an invalid update response at the API boundary", async () => {
    httpClient.put.mockResolvedValue({ data: { ...profileResponse, email: "invalid" } });

    await expect(profileService.updateCurrent(updateInput, currentUser)).rejects.toThrow();
  });

  it("does not send a separate billing address when required inputs are missing", async () => {
    await expect(
      profileService.updateCurrent({ ...updateInput, billingSameAsDelivery: false }, currentUser),
    ).rejects.toThrow();
    expect(httpClient.put).not.toHaveBeenCalled();
  });

  it("changes the authenticated user's password with the API contract", async () => {
    const input = {
      currentPassword: "CurrentPassw0rd!",
      newPassword: "NewPassw0rd!",
      confirmPassword: "NewPassw0rd!",
    };
    httpClient.post.mockResolvedValue({ data: undefined });

    await expect(profileService.changePassword(input)).resolves.toBeUndefined();
    expect(httpClient.post).toHaveBeenCalledWith("/auth/change-password", input);
  });

  it("uploads the profile image as multipart form data", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const controller = new AbortController();
    httpClient.post.mockResolvedValue({ data: uploadedMedia });

    await expect(profileService.uploadAvatar(file, controller.signal)).resolves.toEqual(uploadedMedia);

    expect(httpClient.post).toHaveBeenCalledWith(
      "/me/profile/media",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
      }),
    );
    const formData = httpClient.post.mock.calls.at(-1)?.[1] as FormData;
    expect(formData.get("file")).toBe(file);
  });

  it.each([true, false])("saves the uploaded media id with metadata in PUT response: %s", async (includesMetadata) => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    httpClient.post.mockResolvedValue({ data: uploadedMedia });
    httpClient.put.mockResolvedValue({
      data: includesMetadata
        ? profileResponse
        : {
            ...profileResponse,
            memberSince: undefined,
            passwordChangedAt: undefined,
            profilePictureUrl: undefined,
            profilePictureMediaId: uploadedMedia.id,
          },
    });

    const result = await profileService.updateAvatar(file, currentUser);
    expect(result.avatarUrl).toContain(includesMetadata ? profileResponse.profilePictureUrl : uploadedMedia.url);

    expect(httpClient.post).toHaveBeenCalledWith("/me/profile/media", expect.any(FormData), expect.any(Object));
    expect(httpClient.put).toHaveBeenCalledWith("/me/profile", {
      fullName: currentUser.fullName,
      phoneNumber: currentUser.phone,
      email: currentUser.email,
      companyName: currentUser.companyName,
      companyPhone: currentUser.companyPhone,
      businessRegistrationNumber: currentUser.businessRegistrationNumber,
      deliveryAddress: {
        address: currentUser.deliveryAddress,
        postalCode: currentUser.postalCode,
        country: currentUser.country,
      },
      sameAsDeliveryAddress: currentUser.billingSameAsDelivery,
      billingAddress: currentUser.billingAddress,
      profilePictureMediaId: uploadedMedia.id,
    });
    expect(httpClient.post.mock.invocationCallOrder[0]).toBeLessThan(httpClient.put.mock.invocationCallOrder[0]!);
  });

  it("does not send an invalid password change request", async () => {
    await expect(
      profileService.changePassword({
        currentPassword: "CurrentPassw0rd!",
        newPassword: "NewPassw0rd!",
        confirmPassword: "DifferentPassw0rd!",
      }),
    ).rejects.toThrow();
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});
