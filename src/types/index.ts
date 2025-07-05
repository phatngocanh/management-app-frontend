import React from "react";

// Common TypeScript interfaces for the project

// API Response types
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
    error?: string;
}

// Pagination types
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Product types
export interface Product {
    id: number;
    name: string;
    cost: number;           // Giá vốn (VND)
    category_id?: number;   // ID danh mục sản phẩm
    unit_id?: number;       // ID đơn vị tính
    description: string;    // Mô tả chi tiết sản phẩm
    operation_type: string; // Loại sản phẩm: MANUFACTURING hoặc PACKAGING
}

export interface CreateProductRequest {
    name: string;
    cost: number;
    category_id?: number;
    unit_id?: number;
    description: string;
    operation_type: string; // Loại sản phẩm: MANUFACTURING hoặc PACKAGING
}

export interface UpdateProductRequest {
    id: number;
    name: string;
    cost: number;
    category_id?: number;
    unit_id?: number;
    description: string;
    operation_type: string; // Loại sản phẩm: MANUFACTURING hoặc PACKAGING
}

export interface InventoryInfo {
    quantity: number;
    version: string;
}

export interface ProductCategoryResponse {
    id: number;
    name: string;
    code: string;
    description?: string;
}

export interface UnitOfMeasureResponse {
    id: number;
    name: string;
    code: string;
    description?: string;
}

export interface ProductBOMInfo {
    id: number;
    name: string;
    cost: number;
    unit_name: string;
    category_code: string;
}

export interface ProductBOMUsage {
    parent_product_id: number;
    parent_product_name: string;
    quantity: number;
}

export interface ProductResponse {
    id: number;
    code: string;            // Mã sản phẩm (SP00001)
    name: string;
    cost: number;
    category_id?: number;
    unit_id?: number;
    description: string;
    operation_type: string; // Loại sản phẩm: MANUFACTURING hoặc PACKAGING
    category?: ProductCategoryResponse;
    unit?: UnitOfMeasureResponse;
    inventory?: InventoryInfo;
    bom?: ProductBOMInfo;
    used_in_boms?: ProductBOMUsage[];
    images?: ProductImageResponse[]; // Danh sách hình ảnh sản phẩm
}

export interface GetAllProductsResponse {
    products: ProductResponse[];
}

export interface GetOneProductResponse {
    product: ProductResponse;
}

// BOM types
export interface BomComponent {
    component_product_id: number;
    quantity: number;
}

export interface BomComponentResponse {
    id: number;
    component_product_id: number;
    quantity: number;
    component_product?: ProductBomInfo;
}

export interface CreateProductBomRequest {
    parent_product_id: number;
    components: BomComponent[];
}

export interface UpdateProductBomRequest {
    parent_product_id: number;
    components: BomComponent[];
}

export interface ProductBomResponse {
    parent_product_id: number;
    parent_product?: ProductBomInfo;
    components: BomComponentResponse[];
    total_components: number;
}

export interface GetAllProductBomsResponse {
    boms: ProductBomResponse[];
}

export interface GetOneProductBomResponse {
    bom: ProductBomResponse;
}

export interface ProductBomInfo {
    id: number;
    name: string;
    cost: number;
    unit_name: string;
    category_code: string;
}

// Order types
export interface Order {
    id: number;
    code: string;
    customer_id: number;
    order_date: string;
    note?: string;
    additional_cost?: number;
    additional_cost_note?: string;
    tax_percent?: number;
    order_items: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    selling_price: number;
    discount_percent?: number;
    final_amount?: number;
}

export interface CreateOrderRequest {
    customer_id: number;
    order_date: string;
    note?: string;
    additional_cost?: number;
    additional_cost_note?: string;
    tax_percent?: number;
    delivery_status?: string;
    items: OrderItemRequest[];
}

export interface OrderItemRequest {
    product_id: number;
    quantity: number;
    selling_price: number;
    original_price: number;
    discount_percent?: number;
}

export interface UpdateOrderRequest {
    id: number;
    customer_id?: number;
    order_date?: string;
    note?: string;
    additional_cost?: number;
    additional_cost_note?: string;
    tax_percent?: number;
    delivery_status?: string;
}

export interface OrderResponse {
    id: number;
    code: string;
    order_date: string;
    note?: string;
    additional_cost?: number;
    additional_cost_note?: string;
    tax_percent?: number;
    delivery_status?: string;
    customer: CustomerResponse;
    order_items?: OrderItemResponse[];
    images?: OrderImage[];
    total_amount?: number;
    product_count?: number;
    total_sales_revenue?: number;
    // Profit/Loss fields for total order
    total_profit_loss?: number;
    total_profit_loss_percentage?: number;
}

export interface OrderItemResponse {
    id: number;
    order_id: number;
    product_id: number;
    product_name?: string;
    quantity: number;
    selling_price: number;
    discount_percent?: number;
    final_amount?: number;
    // Profit/Loss fields
    original_price?: number;
    profit_loss?: number;
    profit_loss_percentage?: number;
}

export interface GetAllOrdersResponse {
    orders: OrderResponse[];
}

export interface GetOneOrderResponse {
    order: OrderResponse;
}

// Order Image types
export interface OrderImage {
    id: number;
    order_id: number;
    image_url: string;
    image_type?: string;
    s3_key?: string;
}

export interface UploadOrderImageResponse {
    orderImage: OrderImage;
}

export interface GenerateSignedUploadURLResponse {
    signed_url: string;
    s3_key: string;
    image_id: number;
}

// Form types
export interface FormField {
    name: string;
    label: string;
    type: "text" | "email" | "password" | "number" | "select" | "textarea";
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

// Component props types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
    loading: boolean;
    error?: string;
}

// Navigation types
export interface NavigationItem {
    label: string;
    path: string;
    icon?: React.ComponentType;
    children?: NavigationItem[];
}

// Error types
export interface AppError {
    code: string;
    message: string;
    details?: any;
}

// Inventory types
export interface InventoryResponse {
    id: number;
    product_id: number;
    quantity: number;
    version: string;
}

export interface ProductInfo {
    id: number;
    name: string;
    original_price: number;
}

export interface InventoryWithProductResponse {
    id: number;
    product_id: number;
    quantity: number;
    version: string;
    product: ProductInfo;
}

export interface GetAllInventoryResponse {
    inventories: InventoryWithProductResponse[];
}

export interface UpdateInventoryQuantityRequest {
    quantity: number;
    note?: string;
    version: string; // Current version for optimistic locking
}

// Inventory History types
export interface InventoryHistoryResponse {
    id: number;
    product_id: number;
    quantity: number;
    final_quantity: number;
    importer_name: string;
    imported_at: string;
    note?: string;
    reference_id?: number;
}

export interface GetAllInventoryHistoriesResponse {
    inventory_histories: InventoryHistoryResponse[];
}

// Customer types
export interface Customer {
    id: number;
    name: string;
    phone: string;
    address: string;
}

export interface CreateCustomerRequest {
    name: string;
    phone: string;
    address: string;
}

export interface UpdateCustomerRequest {
    name?: string;
    phone?: string;
    address?: string;
}

export interface CustomerResponse {
    id: number;
    code: string;    // Mã khách hàng (KH00001)
    name: string;
    phone: string;
    address: string;
}

export interface GetAllCustomersResponse {
    customers: CustomerResponse[];
}

export interface GetOneCustomerResponse {
    customer: CustomerResponse;
}

// Category types
export interface CreateProductCategoryRequest {
    name: string;
    code: string;
    description: string;
}

export interface UpdateProductCategoryRequest {
    id: number;
    name: string;
    code: string;
    description: string;
}

export interface GetAllProductCategoriesResponse {
    categories: ProductCategoryResponse[];
}

export interface GetOneProductCategoryResponse {
    category: ProductCategoryResponse;
}

// Unit types
export interface CreateUnitOfMeasureRequest {
    name: string;
    code: string;
    description: string;
}

export interface UpdateUnitOfMeasureRequest {
    id: number;
    name: string;
    code: string;
    description: string;
}

export interface GetAllUnitsOfMeasureResponse {
    units: UnitOfMeasureResponse[];
}

export interface GetOneUnitOfMeasureResponse {
    unit: UnitOfMeasureResponse;
}

// Inventory Receipt types
export interface InventoryReceiptItemRequest {
    product_id: number;
    quantity: number;
    unit_cost?: number;
    notes?: string;
}

export interface CreateInventoryReceiptRequest {
    user_id: number;
    receipt_date?: string;
    notes?: string;
    items: InventoryReceiptItemRequest[];
}

export interface InventoryReceiptItemResponse {
    id: number;
    inventory_receipt_id: number;
    product_id: number;
    quantity: number;
    unit_cost?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface InventoryReceiptResponse {
    id: number;
    code: string;
    user_id: number;
    receipt_date: string;
    notes?: string;
    total_items: number;
    created_at: string;
    updated_at: string;
    items?: InventoryReceiptItemResponse[];
}

export interface GetAllInventoryReceiptsResponse {
    inventory_receipts: InventoryReceiptResponse[];
}

export interface GetOneInventoryReceiptResponse {
    inventory_receipt: InventoryReceiptResponse;
}

// Product Image types
export interface ProductImageResponse {
    id: number;
    product_id: number;
    image_url: string;
    image_key: string;
}
