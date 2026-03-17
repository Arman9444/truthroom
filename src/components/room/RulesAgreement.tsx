"use client";

import { ROOM_RULES } from "@/lib/moderation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RulesAgreementProps {
  contentWarning?: string | null;
  onAgree: () => void;
}

export function RulesAgreement({ contentWarning, onAgree }: RulesAgreementProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="glow-border max-w-lg w-full border-amber/30 bg-card">
        <CardHeader className="space-y-1 text-center">
          <h2 className="glow-amber-subtle text-2xl font-semibold tracking-tight text-amber">
            Before You Enter
          </h2>
        </CardHeader>

        <CardContent className="space-y-4">
          {contentWarning && (
            <>
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3">
                <p className="text-sm font-medium text-destructive">
                  Content Warning
                </p>
                <p className="mt-1 text-sm text-destructive/80">
                  {contentWarning}
                </p>
              </div>
              <Separator className="bg-border/50" />
            </>
          )}

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {ROOM_RULES.split("\n\n").map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={onAgree}
            className="w-full bg-amber text-primary-foreground hover:bg-amber/90"
          >
            I Agree &mdash; Enter the Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
