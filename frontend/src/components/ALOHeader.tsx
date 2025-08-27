import { Button } from "@/components/ui/button";

export const ALOHeader = () => {
  return (
    <header className="w-full bg-background shadow-sm sticky top-0 z-50">
      {/* Hotline Bar */}
      <div className="w-full bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        ʜᴏтʟɪпᴇ / zɑʟᴏ : 0815.320.648 - 0927.996.903
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">A15</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">ALO 15S</h1>
              <p className="text-xs text-muted-foreground">Tiền về liền tay</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors">Trang chủ</a>
            <a href="/support" className="text-foreground hover:text-primary transition-colors">Trung tâm hỗ trợ</a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors">Về chúng tôi</a>
            <a href="/contact" className="text-foreground hover:text-primary transition-colors">Liên hệ</a>
            <a href="/complaints" className="text-foreground hover:text-primary transition-colors">Khiếu nại</a>
            <a href="/news" className="text-foreground hover:text-primary transition-colors">Tin tức</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="default" className="bg-success hover:bg-success/90">
              Thanh Toán
            </Button>
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              Đăng Nhập
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};