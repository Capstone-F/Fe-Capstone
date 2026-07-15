import Link from "next/link";
import { Sparkles, ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-border border-t bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-heading text-foreground text-lg font-bold">
                Glow<span className="text-primary">Scan</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Hệ thống Beauty-Tech E-Commerce tích hợp AI phân tích da mặt và tư
              vấn chăm sóc da cá nhân hóa hàng đầu Việt Nam.
            </p>
            <div className="text-muted-foreground flex items-center gap-4 pt-2">
              {/* Custom SVG Facebook */}
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              {/* Custom SVG Instagram */}
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* Custom SVG Twitter */}
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-foreground mb-4 text-sm font-bold tracking-wider uppercase">
              Giải pháp
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#ai-scan"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Soi Da AI
                </a>
              </li>
              <li>
                <a
                  href="/login?redirectTo=/survey"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Khảo sát Baumann
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Liệu Trình Chăm Sóc Da
                </a>
              </li>
              <li>
                <a
                  href="#experts"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tư vấn Chuyên gia
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-foreground mb-4 text-sm font-bold tracking-wider uppercase">
              Về GlowScan
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Về Chúng Tôi
                </a>
              </li>
              <li>
                <a
                  href="#clinics"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Mạng Lưới Đối Tác Chăm Sóc Da
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Điều Khoản Dịch Vụ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính Sách Bảo Mật
                </a>
              </li>
            </ul>
          </div>

          {/* Address & contact */}
          <div>
            <h4 className="text-foreground mb-4 text-sm font-bold tracking-wider uppercase">
              Liên Hệ
            </h4>
            <ul className="text-muted-foreground space-y-2.5 text-sm">
              <li>
                Địa chỉ: Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội, Việt Nam
              </li>
              <li>Email: support@glowscan.vn</li>
              <li>Hotline: 1800-xxxx (Miễn phí)</li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer Panel */}
        <div className="border-border border-t pt-8 pb-6">
          <div className="bg-destructive/5 border-destructive/10 text-muted-foreground flex gap-3 rounded-2xl border p-4 text-xs leading-relaxed">
            <ShieldAlert className="text-destructive h-5 w-5 flex-shrink-0" />
            <div>
              <span className="text-destructive mb-1 block font-bold">
                TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM Y TẾ:
              </span>
              Công nghệ phân tích da mặt bằng AI trên hệ thống GlowScan chỉ cung
              cấp các đánh giá ước lượng về mặt thẩm mỹ bề ngoài (như mức độ
              mụn, độ sâu nếp nhăn, kích thước lỗ chân lông). Kết quả này hoàn
              toàn không phải là chẩn đoán y khoa, không thay thế cho việc thăm
              khám trực tiếp cùng bác sĩ chuyên khoa da liễu. Người dùng không
              nên tự ý áp dụng các liệu pháp điều trị y học đặc trị khi chưa có
              sự chỉ định trực tiếp từ bác sĩ chuyên ngành.
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-border/50 text-muted-foreground border-t pt-6 text-center text-xs">
          <p>
            © {new Date().getFullYear()} GlowScan Team (FPT University
            Capstone). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
