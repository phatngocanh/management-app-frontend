# Coding Conventions - Order App Frontend

## Language & Localization

### 1. Primary Language Requirements
- **All user-facing content MUST be in Vietnamese**
- Do not use English for UI display text
- Use English only for:
  - Variable names, function names, class names
  - Code comments
  - API endpoints
  - Database field names

### 2. Translation Guidelines

#### Navigation & Menu
- Dashboard → Bảng điều khiển
- Products → Sản phẩm
- Orders → Đơn hàng
- Customers → Khách hàng
- Settings → Cài đặt
- Profile → Hồ sơ
- Logout → Đăng xuất
- Login → Đăng nhập

#### Common Actions
- Add → Thêm
- Edit → Chỉnh sửa
- Delete → Xóa
- Save → Lưu
- Cancel → Hủy
- Update → Cập nhật
- Create → Tạo mới
- Search → Tìm kiếm
- Filter → Lọc
- Export → Xuất
- Import → Nhập

#### Status & Messages
- Loading → Đang tải
- Success → Thành công
- Error → Lỗi
- Warning → Cảnh báo
- Information → Thông tin
- Confirmation → Xác nhận
- Please try again → Vui lòng thử lại
- Failed to → Không thể

#### Form Labels
- Name → Tên
- Price → Giá
- Quantity → Số lượng
- Description → Mô tả
- Category → Danh mục
- Status → Trạng thái
- Date → Ngày
- Time → Thời gian

### 3. File Structure & Organization

#### Naming Convention
- Components: PascalCase (e.g., `ProductList.tsx`)
- Pages: kebab-case (e.g., `product-management.tsx`)
- Utilities: camelCase (e.g., `formatPrice.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

#### File Organization
```
src/
├── app/
│   ├── (main)/
│   │   ├── layout.tsx          # Shared layout with header
│   │   ├── dashboard/
│   │   └── products/
│   ├── login/
│   ├── layout.tsx              # Root layout
│   ├── providers.tsx           # Client providers
│   ├── globals.css             # Global styles
│   └── favicon.ico             # App icon
├── lib/
│   ├── auth.ts
│   ├── products.ts
│   ├── axios.ts
│   └── theme.ts
└── types/
    └── index.ts
```

**Note**: No shared components directory exists. Each page contains its own components and logic to maintain page isolation.

### 4. Component Guidelines

#### Props Interface
```typescript
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}
```

#### Error Handling
```typescript
// ✅ Correct - Use Vietnamese for error messages
setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");

// ❌ Wrong - Don't use English for user-facing content
setError("Failed to load products. Please try again.");
```

#### Loading States
```typescript
// ✅ Correct
if (loading) {
  return <Typography>Đang tải sản phẩm...</Typography>;
}

// ❌ Wrong
if (loading) {
  return <Typography>Loading products...</Typography>;
}
```

### 5. Accessibility

#### Alt Text
```typescript
// ✅ Correct
<Image alt="Hình ảnh sản phẩm" src={product.image} />

// ❌ Wrong
<Image alt="Product image" src={product.image} />
```

#### ARIA Labels
```typescript
// ✅ Correct
<Button aria-label="Chỉnh sửa sản phẩm">Chỉnh sửa</Button>

// ❌ Wrong
<Button aria-label="Edit product">Chỉnh sửa</Button>
```

### 6. Testing

#### Test Descriptions
```typescript
// ✅ Correct - Use Vietnamese for test descriptions
describe('Quản lý sản phẩm', () => {
  it('nên hiển thị danh sách sản phẩm', () => {
    // test logic
  });
});

// ❌ Wrong - Don't use English for test descriptions
describe('Product Management', () => {
  it('should display product list', () => {
    // test logic
  });
});
```

### 7. Documentation

#### README and Comments
- Code comments can be in English
- README files should have both Vietnamese and English versions
- API documentation should include Vietnamese examples

### 8. Validation

#### Form Validation Messages
```typescript
const validationMessages = {
  required: 'Trường này là bắt buộc',
  email: 'Email không hợp lệ',
  minLength: 'Tối thiểu {min} ký tự',
  maxLength: 'Tối đa {max} ký tự',
  number: 'Vui lòng nhập số',
  positive: 'Vui lòng nhập số dương'
};
```

### 9. Date and Number Formatting

#### Vietnamese Locale
```typescript
// Date formatting
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN').format(date);
};

// Number formatting
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};
```

### 10. Code Style Guidelines

#### TypeScript
- Use strict typing for all components and functions
- Define interfaces for all props
- Use type imports instead of require
- Prefer const assertions for static data

#### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Use proper prop destructuring
- Implement proper error boundaries

#### State Management
- Use React hooks for local state
- Keep state as close to where it's used as possible
- Use proper state initialization
- Implement proper loading and error states

### 11. Performance Guidelines

#### Optimization
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Use useCallback for event handlers passed to children
- Use useMemo for expensive calculations

#### Bundle Size
- Use dynamic imports for code splitting
- Optimize images and assets
- Remove unused dependencies
- Use tree shaking effectively

### 12. Review Checklist

Before committing code, check:
- [ ] All display text has been translated to Vietnamese
- [ ] Error messages are in Vietnamese
- [ ] Loading states are in Vietnamese
- [ ] Button labels are in Vietnamese
- [ ] Form labels are in Vietnamese
- [ ] Table headers are in Vietnamese
- [ ] Tooltip text is in Vietnamese
- [ ] Dialog titles and content are in Vietnamese
- [ ] TypeScript types are properly defined
- [ ] Components follow naming conventions
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Accessibility attributes are included

---

**Important Note**: Using Vietnamese for all user-facing content is mandatory to serve Vietnamese customers. Ensure compliance with this rule in every component and page. 