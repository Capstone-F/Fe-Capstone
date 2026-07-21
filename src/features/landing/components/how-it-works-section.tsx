export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-secondary/20 border-border/30 border-y py-20"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-3">
          <span className="text-primary text-xs font-bold tracking-widest uppercase">
            Quy trình vận hành
          </span>
          <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Hành trình 4 bước nâng cấp làn da
          </h2>
          <p className="text-muted-foreground text-sm">
            Giải pháp tích hợp giúp bạn dễ dàng theo dõi từ phân tích da ban đầu
            tới khi đạt được làn da như ý muốn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
              01
            </div>
            <h3 className="font-heading text-foreground mb-2 text-base font-bold">
              Khảo Sát Đa Khía Cạnh
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Đánh giá sơ bộ thói quen sinh hoạt, khí hậu vùng miền và dị ứng
              thành phần để xác định 16 phân loại da Baumann.
            </p>
          </div>

          {/* Step 2 */}
          <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
              02
            </div>
            <h3 className="font-heading text-foreground mb-2 text-base font-bold">
              Soi Da AI Bằng Ảnh
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Chụp ảnh tự sướng để công cụ AI nhận diện chính xác các tổn thương
              mụn, nếp nhăn, thâm sạm và lỗ chân lông.
            </p>
          </div>

          {/* Step 3 */}
          <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
              03
            </div>
            <h3 className="font-heading text-foreground mb-2 text-base font-bold">
              Xây Dựng Liệu Trình
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Hệ thống Rec Engine tự động lựa chọn hoạt chất phù hợp và phân bổ
              sản phẩm theo chu kỳ sử dụng và lượng bôi.
            </p>
          </div>

          {/* Step 4 */}
          <div className="border-border/60 relative rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold">
              04
            </div>
            <h3 className="font-heading text-foreground mb-2 text-base font-bold">
              Theo Dõi & Đồng Hành
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Theo dõi tiến trình trước/sau chăm sóc, nhắc lịch bôi kem và kết
              nối chuyên gia y tế khi có kích ứng bất thường.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
