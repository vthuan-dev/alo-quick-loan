import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const LoanTable = () => {
  const loanData = [
    { device: "iPhone 11 Plus", amount: "1.500.000", days30: "61.000", days40: "49.000" },
    { device: "iPhone 11 Pro", amount: "1.500.000", days30: "61.000", days40: "49.000" },
    { device: "iPhone 11 Promax", amount: "2.000.000", days30: "81.000", days40: "65.000" },
    { device: "iPhone 12 Plus", amount: "2.000.000", days30: "81.000", days40: "65.000" },
    { device: "iPhone 12 Pro", amount: "3.500.000", days30: "142.000", days40: "112.000" },
    { device: "iPhone 12 Promax", amount: "3.500.000", days30: "142.000", days40: "112.000" },
    { device: "iPhone 13 Plus", amount: "3.500.000", days30: "142.000", days40: "112.000" },
    { device: "iPhone 13 Pro", amount: "3.500.000", days30: "142.000", days40: "112.000" },
    { device: "iPhone 14 Plus", amount: "3.500.000", days30: "142.000", days40: "112.000" },
    { device: "iPhone 13 Promax", amount: "4.000.000", days30: "162.000", days40: "128.000" },
    { device: "iPhone 14 Pro", amount: "4.000.000", days30: "162.000", days40: "128.000" },
    { device: "iPhone 14 Plus", amount: "4.000.000", days30: "162.000", days40: "128.000" },
    { device: "iPhone 14 Promax", amount: "5.000.000", days30: "202.000", days40: "160.000" },
    { device: "iPhone 15 Plus", amount: "5.000.000", days30: "202.000", days40: "160.000" },
    { device: "iPhone 15 Pro", amount: "5.000.000", days30: "202.000", days40: "160.000" },
    { device: "iPhone 15 Promax", amount: "5.000.000", days30: "202.000", days40: "160.000" },
    { device: "iPhone 16 Plus", amount: "6.000.000", days30: "242.000", days40: "192.000" },
    { device: "iPhone 16 Pro", amount: "6.500.000", days30: "263.000", days40: "209.000" },
    { device: "iPhone 16 Promax", amount: "8.000.000", days30: "323.000", days40: "257.000" }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-accent-red">ALO 15S</span>
          </h1>
          <h2 className="text-3xl font-bold text-primary">TIỀN VỀ LIỀN TAY</h2>
        </div>

        <div className="bg-card rounded-2xl shadow-card-custom overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-yellow-400 hover:bg-yellow-400">
                <TableHead className="text-black font-bold text-center">LOẠI MÁY</TableHead>
                <TableHead className="text-black font-bold text-center">SỐ TIỀN VAY</TableHead>
                <TableHead className="text-black font-bold text-center">GÓP 30 NGÀY</TableHead>
                <TableHead className="text-black font-bold text-center">GÓP 40 NGÀY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className={`hover:bg-muted/50 transition-colors ${
                    index % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <TableCell className="font-medium text-center">{row.device}</TableCell>
                  <TableCell className="text-center font-semibold">{row.amount}</TableCell>
                  <TableCell className="text-center text-primary font-semibold">{row.days30}</TableCell>
                  <TableCell className="text-center text-primary font-semibold">{row.days40}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            * Số tiền và lãi suất có thể thay đổi tùy theo điều kiện cá nhân
          </p>
        </div>
      </div>
    </section>
  );
};