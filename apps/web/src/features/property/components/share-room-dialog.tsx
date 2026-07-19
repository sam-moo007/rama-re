"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  propertySlug: string;
};

export function ShareRoomDialog({ locale, propertySlug }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // In a real app, this would be a secure token-based URL pointing to a "Share Room" 
  // with restricted read-only or comment-only access.
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/${locale}/property/${propertySlug}?shared=true`
    : `https://rama.ae/${locale}/property/${propertySlug}?shared=true`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2" type="button" />
        }
      >
        <Share2 className="w-4 h-4" />
        {locale === "ar" ? "مشاركة الغرفة" : "Share Room"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{locale === "ar" ? "مشاركة غرفة القرار" : "Share Decision Room"}</DialogTitle>
          <DialogDescription>
            {locale === "ar" 
              ? "قم بدعوة الشركاء أو المستشارين للمشاركة في غرفة القرار هذه. يمكنهم عرض الأدلة وترك التعليقات." 
              : "Invite partners or advisors to collaborate in this decision room. They can view evidence and leave comments."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Input
              id="link"
              value={shareUrl}
              readOnly
              className="text-muted-foreground"
            />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
