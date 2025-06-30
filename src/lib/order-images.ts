import { api } from "@/lib/axios";
import {
    ApiResponse,
    GenerateSignedUploadURLResponse,
} from "@/types";

export const orderImagesApi = {
    // Generate signed upload URL
    generateSignedUploadURL: async (orderId: number, fileName: string, contentType: string) => {
        const response = await api.post<ApiResponse<GenerateSignedUploadURLResponse>>(
            `/orders/${orderId}/images/upload-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`
        );
        return response.data.data;
    },

    // Upload an image for an order using signed URL
    uploadImage: async (orderId: number, file: File) => {
        // Step 1: Generate signed upload URL
        const signedUrlResponse = await orderImagesApi.generateSignedUploadURL(
            orderId,
            file.name,
            file.type
        );

        // Step 2: Upload file directly to S3 using the signed URL
        const uploadResponse = await fetch(signedUrlResponse.signed_url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file to S3: ${uploadResponse.statusText}`);
        }

        // Step 3: Return the response with the uploaded image info
        // The backend has already created the database record in the generateSignedUploadURL step
        return {
            orderImage: {
                id: 0, // This will be updated when we reload the order
                order_id: orderId,
                image_url: signedUrlResponse.signed_url, // This will be a signed download URL
                s3_key: signedUrlResponse.s3_key,
            },
        };
    },

    // Delete an image
    deleteImage: async (orderId: number, imageId: number) => {
        const response = await api.delete(`/orders/${orderId}/images/${imageId}`);
        return response.data;
    },
}; 