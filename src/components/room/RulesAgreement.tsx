"use client";

import { ROOM_RULES } from "@/lib/moderation";

interface RulesAgreementProps {
  contentWarning?: string | null;
  onAgree: () => void;
}

export function RulesAgreement({ contentWarning, onAgree }: RulesAgreementProps) {
  const rules = ROOM_RULES.split("\n\n");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-lg w-full text-center">
        <h2 className="font-serif text-2xl text-[#e8e4df] mb-2">
          Before You Enter
        </h2>
        <p className="text-sm text-[#6b6e7a] mb-6">
          Please review the room guidelines
        </p>

        {contentWarning && (
          <div className="bg-[#c4604a]/10 border border-[#c4604a]/20 rounded-lg px-4 py-3 mb-6 text-left">
            <p className="text-sm font-medium text-[#c4604a]">
              Content Warning
            </p>
            <p className="mt-1 text-sm text-[#c4604a]/80">
              {contentWarning}
            </p>
          </div>
        )}

        <div className="text-left space-y-3 mb-8">
          {rules.map((paragraph, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[#d4a847] mt-0.5 text-sm shrink-0">&#10003;</span>
              <p className="text-sm text-[#e8e4df]/80 whitespace-pre-line">
                {paragraph}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onAgree}
          className="w-full bg-[#d4a847] text-[#0a0a0f] font-semibold rounded-lg py-3 text-base hover:bg-[#d4a847]/90 transition-colors"
        >
          I Agree &mdash; Enter the Room
        </button>
      </div>
    </div>
  );
}
