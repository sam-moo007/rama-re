import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/features/operations/file-uploader";
import { ResolutionQueueTable } from "@/features/operations/resolution-queue-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ingestion Operations — RAMA" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function IngestionOperationsPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();

  const isRtl = value === "ar";

  return (
    <main lang={value} dir={isRtl ? "rtl" : "ltr"} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isRtl ? "عمليات الاستيعاب" : "Ingestion Operations"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRtl
            ? "قم بإدارة تحميل ملفات الشركاء، وسجلات البيانات، وقرارات دمج الكيانات العقارية."
            : "Manage partner file uploads, data records, and entity resolution decisions."}
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upload">
            {isRtl ? "تحميل ملف جديد" : "Upload File"}
          </TabsTrigger>
          <TabsTrigger value="queue">
            {isRtl ? "طابور الدقة" : "Resolution Queue"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="focus-visible:outline-none">
          <FileUploader />
        </TabsContent>
        
        <TabsContent value="queue" className="focus-visible:outline-none">
          <ResolutionQueueTable />
        </TabsContent>
      </Tabs>
    </main>
  );
}
