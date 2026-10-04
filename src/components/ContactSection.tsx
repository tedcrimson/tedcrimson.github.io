import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { siteSettings } = useData();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (!siteSettings.email) return;
    navigator.clipboard.writeText(siteSettings.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAnyContact = Boolean(
    siteSettings.email ||
    siteSettings.location ||
    (siteSettings.socials && siteSettings.socials.length > 0)
  );

  return (
    <div className="max-w-[920px] mx-auto px-4 pt-16 pb-24">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-medium tracking-[2px] text-black mb-6">
        Contact
      </h1>

      <p className="synopsis text-sm sm:text-base text-[#222222] mb-8 leading-[160%]">
        For artistic commissions, exhibition inquiries, performances, and project collaborations:
      </p>

      {hasAnyContact ? (
        <div className="bg-[#f9f9f9] border border-[#e0e0e0] p-6 rounded-[3px] space-y-6">
          {/* Email */}
          {siteSettings.email && (
            <div>
              <span className="text-xs uppercase tracking-wider text-[#666666] block mb-1 font-medium">
                Email
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="text-base sm:text-lg text-black hover:underline font-medium"
                >
                  {siteSettings.email}
                </a>
                <button
                  onClick={handleCopyEmail}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#cccccc] hover:border-black text-xs text-[#333333] hover:text-black transition-colors cursor-pointer bg-white rounded-[2px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Location */}
          {siteSettings.location && (
            <div>
              <span className="text-xs uppercase tracking-wider text-[#666666] block mb-1 font-medium">
                Location
              </span>
              <p className="text-sm text-black m-0">
                {siteSettings.location} (Available worldwide)
              </p>
            </div>
          )}

          {/* Networks */}
          {siteSettings.socials && siteSettings.socials.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-[#666666] block mb-2 font-medium">
                Online Archives & Networks
              </span>
              <ul className="list-none p-0 m-0 space-y-2.5">
                {siteSettings.socials.map((s, idx) => (
                  <li key={`${s.name}-${idx}`} className="flex items-center gap-2">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#222222] hover:text-black hover:underline"
                    >
                      <span>{s.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#888888]" />
                    </a>
                    {s.label && (
                      <span className="text-xs text-[#777777] font-tabular">
                        · {s.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-[#e0e0e0] rounded-[2px] text-xs text-[#777777]">
          Contact information not yet configured.
        </div>
      )}
    </div>
  );
};
