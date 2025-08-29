import { ALOHeader } from '@/components/ALOHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const News = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30">
      <ALOHeader />
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">Tin tức</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Bản tin {i}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Cập nhật thông tin, hướng dẫn và ưu đãi mới nhất từ 15S.
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default News;


